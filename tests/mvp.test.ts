import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { fork } from 'node:child_process';
import { createApp } from '../src/app.js';
import { openDatabase, migrate, requireSchema } from '../src/database.js';
import type { ClinicDatabase } from '../src/database.js';
import { seed } from '../src/seed.js';
import { parseBangkokStart, formatBangkok, sessionDuration } from '../src/time.js';
import { bookAppointment, findAppointment, dashboardCounts } from '../src/clinic.js';

const NOW = Date.parse('2040-01-01T00:00:00Z');
const databases: ClinicDatabase[] = [];
const directories: string[] = [];
function directory() { const dir = mkdtempSync(join(tmpdir(), 'clinic-mvp-')); directories.push(dir); return dir; }
function database(populated = true) {
  const db = openDatabase(':memory:'); databases.push(db); migrate(db); if (populated) seed(db); return db;
}
function app(db: ClinicDatabase, now = NOW) { return createApp(db, { clock: () => now, log: () => {}, logError: () => {} }); }
function post(body: string, headers: Record<string, string> = {}): RequestInit {
  return { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', ...headers }, body };
}
function insert(db: ClinicDatabase, start: number, status = 'scheduled', agent = 1, therapist = 1) {
  return Number(db.prepare('INSERT INTO appointments(agent_id,therapist_id,starts_at,ends_at,status) VALUES (?,?,?,?,?)').run(agent, therapist, start, start + sessionDuration, status).lastInsertRowid);
}
afterEach(() => {
  vi.restoreAllMocks();
  for (const db of databases.splice(0)) if (db.open) db.close();
  for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('MVP upgrade and data integrity', () => {
  it('upgrades Phase 2 without erasing profiles, associations or original seed history', () => {
    const db = openDatabase(':memory:'); databases.push(db);
    const dir = directory(); cpSync(new URL('../src/migrations/001-clinic.sql', import.meta.url), join(dir, '001-clinic.sql'));
    migrate(db, pathToFileURL(dir + '/'));
    db.exec("INSERT INTO agents VALUES(42,'custom','Edited Agent','Original Model','in care','Keep me'); INSERT INTO ailments VALUES(42,'Original ailment','Keep this'); INSERT INTO agent_ailments VALUES(42,42); INSERT INTO seed_history VALUES('fictional-clinic-v1');");
    expect(() => requireSchema(db)).toThrow('not migrated');
    migrate(db); seed(db); requireSchema(db); migrate(db); seed(db);
    expect(db.prepare('SELECT name,complaints FROM agents WHERE id = 42').get()).toEqual({ name: 'Edited Agent', complaints: 'Keep me' });
    expect(db.prepare('SELECT * FROM agent_ailments').all()).toEqual([{ agent_id: 42, ailment_id: 42 }]);
    expect(db.prepare('SELECT COUNT(*) AS count FROM therapies').get()).toEqual({ count: 4 });
    expect(db.prepare('SELECT COUNT(*) AS count FROM therapists').get()).toEqual({ count: 3 });
  });
  it('preserves therapy/therapist edits and additional records when reseeding', () => {
    const db = database();
    db.exec("UPDATE therapies SET description = 'Edited'; UPDATE therapists SET name = 'Edited'; INSERT INTO therapies VALUES(10,'Extra','New');");
    seed(db);
    expect(db.prepare('SELECT description FROM therapies WHERE id = 1').get()).toEqual({ description: 'Edited' });
    expect(db.prepare('SELECT COUNT(*) AS count FROM therapies').get()).toEqual({ count: 5 });
    expect(db.prepare('SELECT name FROM therapists WHERE id = 1').get()).toEqual({ name: 'Edited' });
    expect(db.prepare('SELECT COUNT(*) AS count FROM ailment_therapies').get()).toEqual({ count: 5 });
  });
  it('rolls back fresh original and MVP seeds together on failure', () => {
    const db = database(false);
    db.exec("CREATE TRIGGER seed_failure BEFORE INSERT ON therapists BEGIN SELECT RAISE(ABORT, 'failure'); END;");
    expect(() => seed(db)).toThrow('failure');
    expect(db.prepare('SELECT COUNT(*) AS count FROM agents').get()).toEqual({ count: 0 });
    expect(db.prepare('SELECT COUNT(*) AS count FROM therapies').get()).toEqual({ count: 0 });
    expect(db.prepare('SELECT * FROM seed_history').all()).toEqual([]);
  });
  it('rejects dangling links, duplicate recommendations, invalid duration/status and unsafe IDs', () => {
    const db = database();
    expect(() => db.prepare('INSERT INTO ailment_therapies VALUES(999,1)').run()).toThrow();
    expect(() => db.prepare('INSERT INTO ailment_therapies SELECT * FROM ailment_therapies LIMIT 1').run()).toThrow();
    expect(() => db.prepare('INSERT INTO appointments(agent_id,therapist_id,starts_at,ends_at,status) VALUES(1,1,0,1,?)').run('scheduled')).toThrow();
    expect(() => insert(db, NOW, 'bogus')).toThrow();
    expect(() => db.prepare("INSERT INTO therapists(id,name,specialty) VALUES(9007199254740992,'No','No')").run()).toThrow();
  });
  it('requires all migrations and tables before startup', () => {
    const db = database(); db.exec('DROP TABLE appointments'); expect(() => requireSchema(db)).toThrow('incomplete');
    const empty = openDatabase(':memory:'); databases.push(empty); expect(() => requireSchema(empty)).toThrow('not migrated');
  });
});

describe('therapies and independent recommendations', () => {
  it('orders the full catalog and deduplicates shared agent recommendations with context', async () => {
    const db = database(); db.exec("INSERT INTO therapies VALUES(10,'A quiet walk','New')");
    const catalog = await (await app(db).request('/therapies')).text();
    expect([...catalog.matchAll(/<article><h2>(.*?)<\/h2>/g)].map((match) => match[1])).toEqual(['A quiet walk', 'Context breathing', 'Grounding exercises', 'Prompt boundaries', 'Quiet inference']);
    const profile = await (await app(db).request('/agents/1')).text();
    const recommendations = profile.split('<h2>Recommended therapies</h2>')[1] ?? '';
    expect([...recommendations.matchAll(/<h3>(.*?)<\/h3>/g)].map((match) => match[1])).toEqual(['Context breathing', 'Prompt boundaries', 'Quiet inference']);
    expect(recommendations).toContain('For: context-window claustrophobia, prompt fatigue');
    expect(recommendations).not.toContain('Grounding exercises');
    expect(await (await app(db).request('/agents/4')).text()).toContain('No therapy recommendations');
    expect(await (await app(db).request('/ailments')).text()).toContain('No recommendations recorded for this ailment');
    expect(await (await app(database(false)).request('/therapies')).text()).toContain('No therapies are cataloged');
  });
});

describe('Bangkok scheduling', () => {
  it('parses exact UTC instants across midnight without depending on host timezone', () => {
    expect(parseBangkokStart('2040-01-02T01:15')).toBe(Date.parse('2040-01-01T18:15:00Z'));
    expect(parseBangkokStart('2040-02-29T08:30')).toBe(Date.parse('2040-02-29T01:30:00Z'));
    expect(formatBangkok(Date.parse('2040-01-01T18:15:00Z'))).toContain('2 Jan 2040, 01:15');
  });
  it.each(['2041-02-29T10:00', '2040-02-30T10:00', '2040-13-01T10:00', '2040-01-01T24:00', '2040-01-01T10:60', '2040-01-01', '', '2040-01-01T10:00Z'])('rejects impossible/malformed date %s', (value) => {
    expect(parseBangkokStart(value)).toBeUndefined();
  });
  it('creates one appointment, redirects, and confirmation reloads do not write', async () => {
    const db = database(); const server = app(db);
    const response = await server.request('/agents/1/appointments', post('therapist=1&start=2040-01-02T10%3A00'));
    expect(response.status).toBe(303); expect(response.headers.get('location')).toBe('/appointments/1');
    expect(findAppointment(db, 1)).toMatchObject({ agent_id: 1, therapist_id: 1, starts_at: Date.parse('2040-01-02T03:00:00Z'), ends_at: Date.parse('2040-01-02T03:30:00Z'), status: 'scheduled' });
    for (let i = 0; i < 2; i++) { const text = await (await server.request('/appointments/1')).text(); expect(text).toContain('Asia/Bangkok'); expect(text).toContain('Dr. Sage Syntax'); }
    expect(db.prepare('SELECT COUNT(*) AS count FROM appointments').get()).toEqual({ count: 1 });
    expect((await server.request('/agents/1/appointments', post('therapist=1&start=2040-01-02T10%3A00'))).status).toBe(409);
  });
  it.each(['', 'therapist=01&start=2040-01-02T10%3A00', 'therapist=999&start=2040-01-02T10%3A00', 'therapist=1&start=2040-02-30T10%3A00', 'therapist=1&start=2040-01-01T07%3A00', 'therapist=1&start=2039-01-01T07%3A00', 'therapist=1&therapist=2&start=2040-01-02T10%3A00', 'therapist=1&start=2040-01-02T10%3A00&extra=no'])('rejects invalid form without writes: %s', async (body) => {
    const db = database(); const response = await app(db).request('/agents/1/appointments', post(body)); expect(response.status).toBe(422);
    expect(await response.text()).toContain('Please check the following'); expect(db.prepare('SELECT * FROM appointments').all()).toEqual([]);
  });
  it('retains valid inputs and links errors to their controls', async () => {
    const text = await (await app(database()).request('/agents/1/appointments', post('therapist=1&start=2040-02-30T10%3A00'))).text();
    expect(text).toContain('value="2040-02-30T10:00"'); expect(text).toContain('value="1" selected');
    expect(text).toContain('href="#start"'); expect(text).toContain('aria-describedby="start-help start-error"');
  });
  it('handles missing resources and unavailable therapists', async () => {
    const db = database(); db.exec('DELETE FROM therapists');
    const text = await (await app(db).request('/agents/1/appointments/new')).text(); expect(text).toContain('No therapists are available'); expect(text).not.toContain('type="submit"');
    expect((await app(db).request('/agents/999/appointments/new')).status).toBe(404);
    expect((await app(db).request('/appointments/abc')).status).toBe(404);
    expect((await app(db).request('/agents/abc/appointments', post(''))).status).toBe(404);
  });
  it('checks each resource, containment, adjacent intervals, and terminal states', () => {
    const db = database(); const start = NOW + 86400000;
    bookAppointment(db, { agentId: 1, therapistId: 1, start });
    for (const offset of [-60000, 0, 60000]) {
      expect(() => bookAppointment(db, { agentId: 2, therapistId: 1, start: start + offset })).toThrow('already has a session');
      expect(() => bookAppointment(db, { agentId: 1, therapistId: 2, start: start + offset })).toThrow('already has a session');
    }
    expect(bookAppointment(db, { agentId: 1, therapistId: 1, start: start + sessionDuration })).toBe(2);
    expect(bookAppointment(db, { agentId: 2, therapistId: 2, start })).toBe(3);
    insert(db, start, 'completed', 3, 3); insert(db, start, 'cancelled', 3, 3);
    expect(bookAppointment(db, { agentId: 3, therapistId: 3, start })).toBe(6);
  });
  it('serializes simultaneous conflicting route submissions across separate processes', async () => {
    const path = join(directory(), 'shared.sqlite'); const db = openDatabase(path); databases.push(db); migrate(db); seed(db);
    const workers = [1, 2].map(() => fork(fileURLToPath(new URL('./helpers/booking-worker.ts', import.meta.url)), [path], { execArgv: ['--import', 'tsx'], stdio: ['ignore', 'ignore', 'pipe', 'ipc'] }));
    try {
      await Promise.all(workers.map((worker) => new Promise<void>((resolve, reject) => {
        worker.once('error', reject); worker.once('exit', (code) => { if (code) reject(new Error(`Worker exited ${code}`)); });
        worker.once('message', (message: unknown) => message === 'ready' ? resolve() : reject(new Error('Worker not ready')));
      })));
      const results = workers.map((worker) => new Promise<number>((resolve, reject) => { worker.once('message', (message: unknown) => typeof message === 'number' ? resolve(message) : reject(new Error('No status'))); }));
      workers.forEach((worker) => worker.send('go'));
      expect((await Promise.all(results)).sort()).toEqual([303, 409]);
      expect(db.prepare('SELECT COUNT(*) AS count FROM appointments').get()).toEqual({ count: 1 });
    } finally { workers.forEach((worker) => worker.kill()); }
  }, 10000);
});

describe('staff management and hardening', () => {
  it('counts exact boundaries and distinct in-care ailments; orders appointment sections', async () => {
    const db = database();
    db.exec("UPDATE agents SET status = 'in care' WHERE id = 2");
    insert(db, NOW + 3600000); insert(db, NOW); insert(db, NOW - 3600000);
    insert(db, NOW + 7200000, 'cancelled'); insert(db, NOW - 7200000, 'completed');
    expect(dashboardCounts(db, NOW)).toEqual({ agents: 4, open: 1, ailments: 2 });
    const text = await (await app(db).request('/dashboard')).text();
    expect([...text.matchAll(/<article id="appointment-(\d+)"/g)].map((match) => Number(match[1]))).toEqual([3, 2, 1, 4, 5]);
    expect(text).toContain('Future scheduled appointments'); expect(text).toContain('Ailments in care');
    expect((await app(db).request('/agents/1/status', post('status=recovering'))).status).toBe(303);
    expect((await app(db).request('/agents/2/status', post('status=recovering'))).status).toBe(303);
    expect(dashboardCounts(db, NOW)).toEqual({ agents: 4, open: 1, ailments: 0 });
  });
  it('permits completion only at/after end and rejects stale/terminal actions', async () => {
    const db = database(); const id = insert(db, NOW); const server = app(db);
    expect((await server.request(`/appointments/${id}/status`, post('status=completed'))).status).toBe(409);
    expect((await app(db, NOW + sessionDuration).request(`/appointments/${id}/status`, post('status=completed'))).status).toBe(303);
    expect((await server.request(`/appointments/${id}/status`, post('status=cancelled'))).status).toBe(409);
    expect(findAppointment(db, id)?.status).toBe('completed');
    const future = insert(db, NOW + 3600000);
    expect((await server.request(`/appointments/${future}/status`, post('status=cancelled'))).status).toBe(303);
    expect((await server.request(`/appointments/${future}/status`, post('status=cancelled'))).status).toBe(409);
    expect(findAppointment(db, future)?.status).toBe('cancelled');
  });
  it('validates staff actions, preserves states, and GET never mutates', async () => {
    const db = database(); const id = insert(db, NOW);
    for (const body of ['status=bogus', 'status=cancelled&status=completed', 'status=cancelled&extra=no']) expect((await app(db).request(`/appointments/${id}/status`, post(body))).status).toBe(422);
    expect((await app(db).request('/agents/1/status', post('status=bogus'))).status).toBe(422);
    expect((await app(db).request('/agents/1/status')).status).toBe(404);
    expect((await app(db).request(`/appointments/${id}/status`)).status).toBe(404);
    expect(findAppointment(db, id)?.status).toBe('scheduled');
    expect((await app(db).request('/agents/999/status', post('status=in+care'))).status).toBe(404);
    expect((await app(db).request('/appointments/999/status', post('status=completed'))).status).toBe(404);
  });
  it('rejects cross-origin requests and tests absent-Origin policy', async () => {
    const db = database(); const server = app(db);
    for (const headers of [{ origin: 'https://evil.example' }, { origin: 'null' }, { 'sec-fetch-site': 'cross-site' }, { referer: 'https://evil.example/' }]) {
      expect((await server.request('/agents/1/status', post('status=recovering', headers))).status).toBe(403);
    }
    expect(db.prepare('SELECT status FROM agents WHERE id=1').get()).toEqual({ status: 'in care' });
    expect((await server.request('/agents/1/status', post('status=recovering', { origin: 'http://localhost' }))).status).toBe(303);
    expect((await server.request('/agents/1/status', post('status=in+care', { 'sec-fetch-site': 'same-origin', referer: 'http://localhost/dashboard' }))).status).toBe(303);
    expect((await server.request('/agents/1/status', post('status=recovering'))).status).toBe(303);
  });
  it('renders safe shared 404/500 pages and logs status without sensitive values', async () => {
    const db = database(); const log = vi.fn(); const logError = vi.fn();
    const server = createApp(db, { log, logError });
    expect((await server.request('/missing?secret=private')).status).toBe(404);
    vi.spyOn(db, 'prepare').mockImplementation(() => { throw new Error('private SQL /filesystem form-secret'); });
    const response = await server.request('/agents?secret=private'); const text = await response.text();
    expect(response.status).toBe(500); expect(text).toContain('<main'); expect(text).toContain('The clinic needs a moment');
    expect(text).not.toMatch(/private SQL|filesystem|form-secret/);
    expect(log.mock.calls[1]?.[0]).toMatchObject({ method: 'GET', path: '/agents', status: 500 });
    expect(logError).toHaveBeenCalledWith({ event: 'request_failed', method: 'GET', path: '/agents', error: 'Error' });
    expect(JSON.stringify(log.mock.calls)).not.toContain('private');
  });
  it('rejects unsupported body types and oversized fields', async () => {
    const db = database();
    expect((await app(db).request('/agents/1/status', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).status).toBe(422);
    expect((await app(db).request('/agents/1/status', post('status=' + 'x'.repeat(101)))).status).toBe(422);
    expect((await app(db).request('/agents/1/status', post('status=' + 'x'.repeat(4097)))).status).toBe(422);
  });
});
