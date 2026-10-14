import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { migrate, openDatabase } from '../src/database.js';
import { afterAll } from 'vitest';
const db = openDatabase(':memory:');
migrate(db);
const app = createApp(db, { log: () => {} });
afterAll(() => db.close());

describe('GET /', () => {
  it('serves a complete HTML document with the required metadata', async () => {
    const response = await app.request('/');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/^text\/html\b/);
    const document = await response.text();
    expect(document).toMatch(/^<!DOCTYPE html><html lang="en" data-theme="light">/);
    expect(document).toContain('<meta charset="UTF-8"');
    expect(document).toContain('<meta name="viewport" content="width=device-width, initial-scale=1"');
    expect(document).toContain('<title>AgentClinic</title>');
    expect(document).toMatch(/<\/body><\/html>$/);
  });

  it('composes one header, main, and footer with the clinic content in main', async () => {
    const document = await (await app.request('/')).text();
    for (const tag of ['header', 'main', 'footer']) {
      expect(document.match(new RegExp(`<${tag}(?:\\s|>)`, 'g'))).toHaveLength(1);
    }
    expect(document).toMatch(/<header\b[^>]*>[\s\S]*<\/header><main\b[^>]*>[\s\S]*<\/main><footer\b/);
    const main = document.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
    expect(main).toContain('<h1>AgentClinic is open for business</h1>');
    expect(document.match(/<h1(?:\s|>)/g)).toHaveLength(1);
    expect(main).toMatch(/fictional clinic[\s\S]*AI agents[\s\S]*relief[\s\S]*humans/);
    expect(document).not.toMatch(/<script\b/i);
    expect(document.match(/href="([^"]+)"/g)).toEqual([
      'href="/pico.css"',
      'href="/styles.css"',
      'href="/"',
      'href="/"',
      'href="/agents"',
      'href="/ailments"',
      'href="/therapies"',
      'href="/dashboard"',
    ]);
  });
});

describe('GET /styles.css', () => {
  it('serves the linked CSS file with the correct content type', async () => {
    const document = await (await app.request('/')).text();
    expect(document).toContain('<link rel="stylesheet" href="/styles.css"');
    const response = await app.request('/styles.css');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/css; charset=UTF-8');
    const source = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
    expect(source.trim().length).toBeGreaterThan(0);
    expect(await response.text()).toBe(source);
  });
});

it('returns 404 for an unimplemented page', async () => {
  expect((await app.request('/unknown')).status).toBe(404);
});
