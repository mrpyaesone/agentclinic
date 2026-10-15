import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase, migrate, requireSchema } from '../src/database.js';
import type { ClinicDatabase } from '../src/database.js';
import { createApp } from '../src/app.js';
import { saveFeedback, listFeedback } from '../src/feedback.js';
import { seed } from '../src/seed.js';
import { readForm } from '../src/forms.js';

const databases: ClinicDatabase[] = [], directories: string[] = [];
const timestamp = 1792022400000;
const valid = { name: 'Ada Sample', email: 'Ada@example.test', message: 'A little relief.', rating: '5' };
function database() { const db = openDatabase(':memory:'); databases.push(db); migrate(db); return db; }
function app(db: ClinicDatabase, logs: unknown[] = []) {
  return createApp(db, { clock: () => timestamp, log: entry => logs.push(entry), logError: entry => logs.push(entry) });
}
function post(application: ReturnType<typeof app>, fields: Record<string, string> = valid) {
  return application.request('/feedback', { method: 'POST', body: new URLSearchParams(fields) });
}
function rows(db: ClinicDatabase) { return db.prepare('SELECT * FROM feedback').all(); }
afterEach(() => {
  for (const db of databases.splice(0)) if (db.open) db.close();
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('feedback storage', () => {
  it('upgrades the existing schema without changing clinic data and repeats safely', () => {
    const db = openDatabase(':memory:'); databases.push(db);
    db.exec('CREATE TABLE migrations (name TEXT PRIMARY KEY)');
    for (const name of ['001-clinic.sql', '002-mvp.sql']) {
      db.exec(readFileSync(new URL(`../src/migrations/${name}`, import.meta.url), 'utf8'));
      db.prepare('INSERT INTO migrations VALUES (?)').run(name);
    }
    seed(db);
    const before = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name != 'migrations'").all() as { name: string }[];
    const snapshots = before.map(({ name }) => ({ name, rows: db.prepare(`SELECT * FROM ${name}`).all() }));
    migrate(db); requireSchema(db);
    saveFeedback(db, { ...valid, rating: 5, createdAt: timestamp });
    migrate(db);
    for (const snapshot of snapshots) expect(db.prepare(`SELECT * FROM ${snapshot.name}`).all()).toEqual(snapshot.rows);
    expect(rows(db)).toHaveLength(1);
    expect(db.prepare('SELECT * FROM migrations').all()).toHaveLength(3);
  });
  it('persists exact text and timestamp across file reopen, treating SQL-like text as data', () => {
    const directory = mkdtempSync(join(tmpdir(), 'feedback-')); directories.push(directory);
    const path = join(directory, 'clinic.sqlite');
    const db = openDatabase(path); databases.push(db); migrate(db);
    const message = "Lovely 🌿\n'); DROP TABLE agents; --";
    saveFeedback(db, { name: "O'Agent", email: 'Ada@example.test', message, rating: 1, createdAt: timestamp });
    db.close();
    const reopened = openDatabase(path); databases.push(reopened); requireSchema(reopened);
    expect(rows(reopened)).toEqual([{ id: 1, name: "O'Agent", email: 'Ada@example.test', message, rating: 1, created_at: timestamp }]);
    expect(reopened.prepare('SELECT * FROM agents').all()).toEqual([]);
  });
  it('checks migration history and feedback table at startup', () => {
    const db = database(); db.prepare("DELETE FROM migrations WHERE name = '003-feedback.sql'").run();
    expect(() => requireSchema(db)).toThrow('not migrated');
    db.prepare("INSERT INTO migrations VALUES ('003-feedback.sql')").run(); db.exec('DROP TABLE feedback');
    expect(() => requireSchema(db)).toThrow('incomplete');
  });
  it.each([
    { name: '' }, { name: ' ' }, { name: 'a'.repeat(101) }, { email: '' }, { email: 'a'.repeat(255) },
    { message: '' }, { message: ' ' }, { message: 'a'.repeat(2001) }, { rating: 0 }, { rating: 6 }, { rating: 1.5 },
  ])('rejects invalid direct writes: %j', overrides => {
    const db = database();
    expect(() => saveFeedback(db, { ...valid, rating: 5, createdAt: timestamp, ...overrides })).toThrow();
    expect(rows(db)).toEqual([]);
  });
});

describe('feedback routes', () => {
  it('renders labeled controls and the active navigation item', async () => {
    const response = await app(database()).request('/feedback');
    expect(response.status).toBe(200); const text = await response.text();
    for (const field of Object.keys(valid)) {
      expect(text).toContain(`for="${field}"`); expect(text).toContain(`name="${field}"`);
    }
    expect(text).toContain('href="/feedback" aria-current="page"');
    expect(text).toContain('sample contact details'); expect(text).toContain('<textarea');
  });
  it('normalizes valid fields, stores feedback and uses a refresh-safe confirmation', async () => {
    const db = database(), logs: unknown[] = [], application = app(db, logs);
    const response = await post(application, { ...valid, name: '  Ada Sample  ', email: ' Ada@example.test ', message: '  First\nSecond  ' });
    expect(response.status).toBe(303); expect(response.headers.get('location')).toBe('/feedback/thanks');
    expect(rows(db)).toEqual([{ id: 1, ...valid, message: 'First\nSecond', rating: 5, created_at: timestamp }]);
    for (let i = 0; i < 2; i++) {
      const confirmation = await application.request('/feedback/thanks');
      expect(confirmation.status).toBe(200); expect(await confirmation.text()).toContain('Your feedback has been saved');
    }
    expect(rows(db)).toHaveLength(1);
    expect(JSON.stringify(logs)).not.toContain('Ada');
  });
  it.each([
    { name: '' }, { name: ' \t\n ' }, { name: 'a'.repeat(101) }, { email: '' }, { email: 'a@@b.test' },
    { email: 'a@b' }, { email: 'a b@c.test' }, { email: 'a@b..test' }, { email: 'a'.repeat(248) + '@b.test' },
    { message: '' }, { message: ' \n\t ' }, { message: 'x'.repeat(2001) }, { message: 'a\0b' },
    { rating: '' }, { rating: '0' }, { rating: '6' }, { rating: '1.5' }, { rating: 'great' }, { rating: '01' },
  ])('rejects invalid fields without saving: %j', async overrides => {
    const db = database(), response = await post(app(db), { ...valid, ...overrides });
    expect(response.status).toBe(422); expect(await response.text()).toContain('aria-invalid="true"');
    expect(rows(db)).toEqual([]);
  });
  it('requires every field', async () => {
    const db = database(), response = await post(app(db), {});
    expect(response.status).toBe(422); const text = await response.text();
    for (const field of Object.keys(valid)) expect(text).toContain(`id="${field}-error"`);
    expect(rows(db)).toEqual([]);
  });
  it.each([
    { name: 'a', message: 'x', rating: '1' },
    { name: 'a'.repeat(100), message: 'x'.repeat(2000), rating: '5' },
    { message: '🌿'.repeat(1000), email: 'a'.repeat(247) + '@b.test' },
  ])('accepts boundary fields: %j', async overrides => {
    const db = database(); expect((await post(app(db), { ...valid, ...overrides })).status).toBe(303);
    expect(rows(db)).toHaveLength(1);
  });
  it.each([
    ['duplicate', 'name=One&name=Two&email=a%40b.test&message=Hi&rating=1', 'application/x-www-form-urlencoded', 422],
    ['unknown', new URLSearchParams({ ...valid, unknown: 'x' }).toString(), 'application/x-www-form-urlencoded', 422],
    ['content type', '{}', 'application/json', 415],
    ['body size', 'x'.repeat(32769), 'application/x-www-form-urlencoded', 413],
  ])('rejects malformed request: %s', async (_label, body, type, status) => {
    const db = database(); const response = await app(db).request('/feedback', { method: 'POST', body,
      headers: { 'Content-Type': type } });
    expect(response.status).toBe(status); expect(rows(db)).toEqual([]);
  });
  it('blocks cross-origin submission', async () => {
    const db = database(); const response = await app(db).request('/feedback', { method: 'POST', body: new URLSearchParams(valid), headers: { Origin: 'https://elsewhere.test' } });
    expect(response.status).toBe(403); expect(rows(db)).toEqual([]);
  });
  it('escapes and preserves submitted text on validation and database failures without logging it', async () => {
    const db = database(), logs: unknown[] = [], application = app(db, logs);
    const payload = { name: '<script>privateName</script>', email: '<script>@example.test', message: '<img src=x onerror=privateMessage()>' , rating: '3' };
    const invalid = await post(application, { ...payload, rating: '6' });
    expect(invalid.status).toBe(422);
    const invalidText = await invalid.text(); expect(invalidText).toContain('&lt;script&gt;privateName&lt;/script&gt;');
    db.exec("CREATE TRIGGER fail_feedback BEFORE INSERT ON feedback BEGIN SELECT RAISE(ABORT, 'secret storage details'); END");
    const failed = await post(application, payload); expect(failed.status).toBe(503);
    const text = await failed.text();
    for (const html of [invalidText, text]) {
      expect(html).toContain('&lt;script&gt;@example.test'); expect(html).toContain('&lt;img src=x onerror=privateMessage()&gt;');
      expect(html).not.toContain('<script>'); expect(html).not.toContain('<img src=x');
    }
    expect(text).toContain('Please try again'); expect(text).not.toContain('secret storage details');
    expect(text).not.toContain('Your feedback has been saved'); expect(rows(db)).toEqual([]);
    expect(JSON.stringify(logs)).not.toMatch(/privateName|example.test|privateMessage|secret storage details/);
  });
  it('lists all feedback newest first with deterministic ties and never selects emails', async () => {
    const db = database(), application = app(db);
    expect(await (await application.request('/feedback')).text()).toContain('No feedback yet');
    for (const [name, createdAt] of [['Older', 1000], ['Newer', 2000], ['Newest tie', 2000]] as const) {
      saveFeedback(db, { ...valid, name, rating: 4, createdAt });
    }
    expect(listFeedback(db).map(entry => entry.name)).toEqual(['Newest tie', 'Newer', 'Older']);
    expect(listFeedback(db).every(entry => !('email' in entry))).toBe(true);
    const text = await (await application.request('/feedback')).text();
    expect(text.indexOf('<h3>Newest tie')).toBeLessThan(text.indexOf('<h3>Newer'));
    expect(text.indexOf('<h3>Newer')).toBeLessThan(text.indexOf('<h3>Older'));
    expect(text).toContain('Rating: 4 / 5'); expect(text).toContain('1970-01-01T00:00:02.000Z');
    expect(text).not.toContain(valid.email);
  });
  it('publishes newly submitted feedback as escaped text, also on validation redisplay', async () => {
    const db = database(), application = app(db);
    const fields = { ...valid, name: '<script>Author</script>', message: '<img src=x onerror=alert(1)>\nSecond line' };
    expect((await post(application, fields)).status).toBe(303);
    for (const response of [await application.request('/feedback'), await post(application, { ...valid, rating: '0' })]) {
      const text = await response.text();
      const section = text.split('<h2 id="public-feedback-heading">')[1]!;
      expect(section).toContain('&lt;script&gt;Author&lt;/script&gt;');
      expect(section).toContain('&lt;img src=x onerror=alert(1)&gt;\nSecond line');
      expect(section).not.toContain('<script>'); expect(section).not.toContain('<img');
      expect(section).not.toContain(valid.email);
    }
    const confirmation = await (await application.request('/feedback/thanks')).text();
    expect(confirmation).toContain('href="/feedback"');
  });
  it('keeps legacy parser field and body limits', async () => {
    const request = (body: string) => new Request('http://localhost/form', { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    expect((await readForm(request('start=' + 'x'.repeat(101)), ['start'])).errors.start).toBeTruthy();
    expect((await readForm(request('start=' + 'x'.repeat(4096)), ['start'])).errors.form).toBeTruthy();
  });
});
