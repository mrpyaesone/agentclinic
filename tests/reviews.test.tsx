import { afterAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { migrate, openDatabase } from '../src/database.js';
import { Reviews } from '../src/components/Reviews.js';
import { reviews } from '../src/reviews.js';

const db = openDatabase(':memory:');
migrate(db);
const app = createApp(db, { log: () => {} });
afterAll(() => db.close());

describe('customer reviews', () => {
  it('provides three populated editorial reviews', () => {
    expect(reviews).toHaveLength(3);
    for (const review of reviews) {
      expect(review.name.trim().length).toBeGreaterThan(0);
      expect(review.text.trim().length).toBeGreaterThan(0);
    }
  });

  it('serves all fictional samples in order in the shared layout', async () => {
    const response = await app.request('/reviews');
    expect(response.status).toBe(200);
    const document = await response.text();
    expect(document).toContain('<title>Customer reviews — AgentClinic</title>');
    expect(document.match(/<h1\b/g)).toHaveLength(1);
    expect(document).toContain('<h1>Customer reviews</h1>');
    expect(document).toContain('Fictional sample reviews');
    expect(document).toMatch(/<header\b[\s\S]*<main\b[\s\S]*<footer\b/);
    expect(document).toContain('<a href="/reviews" aria-current="page">Reviews</a>');
    const articles = [...document.matchAll(/<article>([\s\S]*?)<\/article>/g)].map(match => match[1]);
    expect(articles).toHaveLength(3);
    reviews.forEach((review, index) => {
      expect(articles[index]).toContain(`<h2>${review.name}</h2>`);
      expect(articles[index]).toContain(`<p>${review.text}</p>`);
    });
    expect(document).not.toMatch(/<form\b|<script\b/);
  });

  it('escapes names and review text in the actual review renderer', () => {
    const document = (<Reviews entries={[{ name: '<img src=x onerror=alert(1)> & agent', text: '<script>alert("hi")</script> & care' }]} />).toString();
    expect(document).not.toMatch(/<img\b|<script\b/);
    expect(document).toContain('&lt;img');
    expect(document).toContain('&lt;script&gt;');
    expect(document).toContain('&amp; care');
    expect(document).toContain('&amp; agent');
  });

  it.each([['/', '/'], ['/agents', '/agents'], ['/ailments', '/ailments'], ['/therapies', '/therapies'], ['/dashboard', '/dashboard'], ['/feedback', '/feedback']])('keeps navigation and the active section on %s', async (path, active) => {
    const response = await app.request(path);
    expect(response.status).toBe(200);
    const document = await response.text();
    expect(document).toContain('<a href="/reviews">Reviews</a>');
    expect(document.match(/aria-current="page"/g)).toHaveLength(1);
    expect(document).toContain(`<a href="${active}" aria-current="page">`);
  });
});
