// Optional acceptance tooling; follows the existing browser scripts.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const base = process.env.BASE_URL ?? 'http://localhost:3118';
const executablePath = process.env.BROWSER_EXECUTABLE ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const output = process.env.BROWSER_OUTPUT ?? mkdtempSync(join(tmpdir(), 'reviews-browser-'));
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];
async function protect(context) {
  await context.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
}
async function tabTo(page, href) {
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(href => document.activeElement.matches(`a[href="${href}"]`), href)) {
      assert.ok(await page.evaluate(() => {
        const style = getComputedStyle(document.activeElement);
        return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
      }));
      return;
    }
  }
  assert.fail('Keyboard could not reach ' + href);
}
async function inspect(page, label) {
  assert.ok(await page.getByText('Fictional sample reviews', { exact: false }).isVisible());
  assert.equal(await page.locator('main article').count(), 3);
  assert.equal(await page.locator('a[aria-current="page"]').getAttribute('href'), '/reviews');
  assert.equal(await page.locator('main form, main input, main select, script').count(), 0);
  const content = await page.locator('main article').evaluateAll(articles => articles.map(article => {
    const heading = article.querySelector('h2');
    const text = article.querySelector('p');
    const box = article.getBoundingClientRect();
    return { name: heading.textContent, text: text.textContent, visible: box.width > 0 && box.height > 0,
      fits: article.scrollWidth <= article.clientWidth && text.scrollWidth <= text.clientWidth };
  }));
  for (const review of content) assert.ok(review.name.trim() && review.text.trim() && review.visible && review.fits);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: join(output, label + '.png'), fullPage: true });
  return content.map(({ name, text }) => ({ name, text }));
}
try {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await protect(context);
  const page = await context.newPage();
  let expected;
  for (const [width, height] of [[1280, 800], [375, 812], [320, 812]]) {
    await page.setViewportSize({ width, height });
    await page.goto(base + '/');
    await tabTo(page, '/reviews');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/reviews');
    const content = await inspect(page, `reviews-${width}`);
    expected ??= content;
    assert.deepEqual(content, expected);
    await tabTo(page, '/agents');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/agents');
    for (const path of ['/ailments', '/therapies', '/dashboard', '/feedback']) {
      await page.getByRole('navigation').getByRole('link', { name: { '/ailments': 'Ailments', '/therapies': 'Therapies', '/dashboard': 'Staff dashboard', '/feedback': 'Feedback' }[path], exact: true }).click();
      await page.waitForURL('**' + path);
      assert.equal(await page.locator('a[aria-current="page"]').getAttribute('href'), path);
    }
    results.push({ width, height, content: 'passed', keyboard: 'passed', navigation: 'passed' });
  }
  const profile = mkdtempSync(join(tmpdir(), 'reviews-zoom-'));
  mkdirSync(join(profile, 'Default'));
  const level = Math.log(2) / Math.log(1.2);
  writeFileSync(join(profile, 'Default', 'Preferences'), JSON.stringify({ partition: { default_zoom_level: { x: level }, per_host_zoom_levels: { x: { [new URL(base).hostname]: { zoom_level: level } } } } }));
  const zoomContext = await chromium.launchPersistentContext(profile, { executablePath, headless: true, viewport: null, javaScriptEnabled: false, args: ['--window-size=1280,900'] });
  try {
    await protect(zoomContext);
    const zoomPage = await zoomContext.newPage();
    await zoomPage.goto(base + '/reviews');
    assert.deepEqual(await zoomPage.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio, css: getComputedStyle(document.documentElement).zoom })), { width: 640, dpr: 2, css: '1' });
    assert.deepEqual(await inspect(zoomPage, 'reviews-zoom200'), expected);
    await tabTo(zoomPage, '/agents');
  } finally { await zoomContext.close(); }
  console.log(JSON.stringify({ browser: browser.version(), javaScript: false, results, actualZoom200: 'passed', output }, null, 2));
} finally { await browser.close(); }
