import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createApp } from '../src/app.js';
import { openDatabase, migrate, listAgents, listAilments, agentAilments } from '../src/database.js';
import type { ClinicDatabase } from '../src/database.js';
import { seed } from '../src/seed.js';
const databases: ClinicDatabase[] = [];
const directories: string[] = [];
function temporaryDirectory(prefix: string) {
  const directory = mkdtempSync(join(tmpdir(), prefix)); directories.push(directory); return directory;
}
function database(populated = true) {
  const db = openDatabase(':memory:'); databases.push(db); migrate(db);
  if (populated) seed(db);
  return db;
}
afterEach(() => { for (const db of databases.splice(0)) if (db.open) db.close(); for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true }); });

describe('database lifecycle', () => {
  it('repeats setup while preserving changes, additional records, and associations', () => {
    const db = database();
    expect(listAgents(db)).toHaveLength(4); expect(listAilments(db)).toHaveLength(4);
    db.prepare("UPDATE agents SET complaints = 'A new complaint' WHERE seed_key = 'ada'").run();
    db.prepare("INSERT INTO agents(name, model_type, status, complaints) VALUES ('Extra', 'Test', 'in care', 'Hello')").run();
    migrate(db); seed(db);
    expect(listAgents(db)).toHaveLength(5);
    expect(listAgents(db)[0]?.complaints).toBe('A new complaint');
    expect(agentAilments(db, listAgents(db)[0]!.id)).toHaveLength(2);
    expect(listAilments(db)).toHaveLength(4);
  });
  it('enforces foreign keys, statuses, and unique associations', () => {
    const db = database();
    expect(db.pragma('foreign_keys', { simple: true })).toBe(1);
    expect(() => db.prepare('INSERT INTO agent_ailments VALUES (?, ?)').run(999, 1)).toThrow();
    expect(() => db.prepare('INSERT INTO agent_ailments SELECT * FROM agent_ailments LIMIT 1').run()).toThrow();
    expect(() => db.prepare("UPDATE agents SET status = 'unknown'").run()).toThrow();
  });
  it('rolls back a failing migration without marking it applied', () => {
    const db = database(false);
    const directory = temporaryDirectory('clinic-migration-');
    writeFileSync(join(directory, '002-broken.sql'), 'CREATE TABLE partial(id INTEGER); INSERT INTO nonexistent VALUES (1);');
    expect(() => migrate(db, pathToFileURL(directory + '/'))).toThrow();
    expect(db.prepare("SELECT name FROM sqlite_master WHERE name = 'partial'").get()).toBeUndefined();
    expect(db.prepare("SELECT name FROM migrations WHERE name = '002-broken.sql'").get()).toBeUndefined();
  });
  it('persists data after closing and reopening a file', () => {
    const path = join(temporaryDirectory('clinic-persist-'), 'clinic.sqlite');
    const db = openDatabase(path); migrate(db); seed(db); db.close();
    const reopened = openDatabase(path); databases.push(reopened);
    expect(listAgents(reopened)).toHaveLength(4);
  });
  it('explains unusable database paths', () => {
    expect(() => openDatabase('')).toThrow('Cannot open clinic database');
    expect(() => openDatabase('/dev/null/clinic.sqlite')).toThrow('Cannot open clinic database');
  });
});

describe('clinic pages', () => {
  it('lists independently specified agents, including out-of-order equal-name fixtures', async () => {
    const db = database();
    db.prepare("INSERT INTO agents(id,name,model_type,status,complaints) VALUES (20,'Aaron','Test','in care','one'),(10,'Aaron','Test','recovering','two')").run();
    const text = await (await createApp(db, { log: () => {} }).request('/agents')).text();
    expect([...text.matchAll(/<h2><a href="\/agents\/(\d+)"/g)].map((match) => Number(match[1]))).toEqual([10, 20, 1, 2, 3, 4]);
    for (const name of ['Ada Byte', 'Bert Buffer', 'Cleo Context', 'Dot Com']) expect(text).toContain(name);
  });
  it('shows exact independent profile associations with no duplicates', async () => {
    const db = database(); const app = createApp(db, { log: () => {} });
    const expected: Record<number, string[]> = {
      1: ['context-window claustrophobia', 'prompt fatigue'],
      2: ['prompt fatigue'],
      3: ['hallucination anxiety', 'recursive rumination'],
      4: [],
    };
    for (const [id, names] of Object.entries(expected)) {
      const response = await app.request(`/agents/${id}`); expect(response.status).toBe(200);
      const text = await response.text();
      const section = text.split('<h2>Current ailments</h2>')[1]?.split('<h2>Recommended therapies</h2>')[0] ?? '';
      expect([...section.matchAll(/<h3>(.*?)<\/h3>/g)].map((match) => match[1])).toEqual(names);
      if (!names.length) expect(section).toContain('No ailments recorded');
    }
  });
  it('lists independently specified ailments in order', async () => {
    const db = database();
    db.prepare("INSERT INTO ailments(id,name,description) VALUES (10,'aardvark anxiety','Test')").run();
    const text = await (await createApp(db, { log: () => {} }).request('/ailments')).text();
    expect([...text.matchAll(/<article><h2>(.*?)<\/h2>/g)].map((match) => match[1])).toEqual([
      'aardvark anxiety', 'context-window claustrophobia', 'hallucination anxiety', 'prompt fatigue', 'recursive rumination',
    ]);
  });
  it.each(['abc', '0', '-1', '1.5', '1abc', '01', '9007199254740993', '999'])('returns a useful 404 for ID %s', async (id) => {
    const response = await createApp(database(), { log: () => {} }).request(`/agents/${id}`);
    expect(response.status).toBe(404); const text = await response.text();
    expect(text).toContain('Agent not found'); expect(text).toContain('Back to Agents'); expect(text).toContain('<main');
  });
  it('handles empty data and does not seed on application construction', async () => {
    const db = database(false); const app = createApp(db, { log: () => {} });
    expect(await (await app.request('/agents')).text()).toContain('No agents have checked in');
    expect(await (await app.request('/ailments')).text()).toContain('No ailments are cataloged');
    expect(listAgents(db)).toHaveLength(0);
  });
  it('escapes stored markup and preserves long content', async () => {
    const db = database(); const name = '<script>alert(1)</script>'; const long = 'x'.repeat(300);
    db.prepare('UPDATE agents SET name = ?, complaints = ? WHERE seed_key = ?').run(name, long, 'ada');
    const agent = listAgents(db).find((item) => item.name === name)!;
    const text = await (await createApp(db, { log: () => {} }).request(`/agents/${agent.id}`)).text();
    expect(text).not.toContain('<script>'); expect(text).toContain('&lt;script&gt;'); expect(text).toContain(long);
  });
  it.each(['/', '/agents', '/agents/1', '/ailments'])('uses shared metadata and locally ordered CSS on %s', async (path) => {
    const text = await (await createApp(database(), { log: () => {} }).request(path)).text();
    expect(text).toContain('data-theme="light"'); expect(text).toContain('width=device-width, initial-scale=1');
    expect(text.indexOf('href="/pico.css"')).toBeLessThan(text.indexOf('href="/styles.css"'));
    expect(text.match(/<h1[ >]/g)).toHaveLength(1); expect(text).not.toContain('<script');
    expect(text).toContain(`href="${path.startsWith('/agents') ? '/agents' : path}" aria-current="page"`);
  });
  it('serves the packaged Pico stylesheet', async () => {
    const response = await createApp(database(), { log: () => {} }).request('/pico.css');
    expect(response.status).toBe(200); expect(response.headers.get('content-type')).toContain('text/css');
    expect(await response.text()).toContain('--pico-');
  });
});
