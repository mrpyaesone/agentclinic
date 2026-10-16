// Optional acceptance tooling; uses an existing Playwright installation.
// Run against a disposable, migrated and seeded database.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const base = process.env.BASE_URL ?? 'http://localhost:3115';
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_EXECUTABLE ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const results = [];
try {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(10000);
  async function inspect() {
    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      unlabeled: [...document.querySelectorAll('input,textarea,select')].filter(e => !e.labels.length).length,
      orphanErrors: [...document.querySelectorAll('[aria-describedby]')].filter(e => !document.getElementById(e.getAttribute('aria-describedby'))).length,
    }));
    assert.deepEqual(state, { overflow: false, unlabeled: 0, orphanErrors: 0 });
  }
  async function tabTo(selector) {
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      if (await page.evaluate(selector => document.activeElement.matches(selector), selector)) {
        assert.ok(await page.evaluate(() => {
          const s = getComputedStyle(document.activeElement);
          return s.outlineStyle !== 'none' || s.boxShadow !== 'none';
        }), 'focused control must be visible');
        return;
      }
    }
    assert.fail('keyboard could not reach ' + selector);
  }
  for (const [width, height] of [[1280, 800], [375, 812], [320, 812]]) {
    await page.setViewportSize({ width, height });
    await page.goto(base + '/');
    await tabTo('a[href="/feedback"]'); await page.keyboard.press('Enter');
    await page.waitForURL('**/feedback'); await inspect();
    await tabTo('#name'); await page.keyboard.type('Keyboard Sample');
    await tabTo('#email'); await page.keyboard.type('sample@example.test');
    await tabTo('#message'); await page.keyboard.type('A welcome rest for my context window.');
    await tabTo('#rating'); await page.keyboard.press('5'); await page.keyboard.press('Enter');
    await tabTo('button[type="submit"]'); await page.keyboard.press('Enter');
    await page.waitForURL('**/feedback/thanks');
    assert.ok(await page.getByText('Your feedback has been saved.', { exact: false }).isVisible());
    await inspect(); await page.reload(); assert.ok(page.url().endsWith('/feedback/thanks'));
    await page.getByRole('link', { name: 'View visitor feedback', exact: true }).click();
    await page.waitForURL('**/feedback');
    const feedback = page.locator('section[aria-labelledby="public-feedback-heading"]');
    assert.ok(await feedback.getByRole('heading', { name: 'Keyboard Sample', exact: true }).first().isVisible());
    assert.ok((await feedback.textContent()).includes('A welcome rest for my context window.'));
    assert.ok(!(await feedback.textContent()).includes('sample@example.test'));
    await inspect();
    await page.goto(base + '/feedback');
    // Browser type=text allows this malformed email through to server validation.
    await page.getByLabel('Name (required)', { exact: true }).fill('Preserved Sample');
    await page.getByLabel('Email (required)', { exact: true }).fill('invalid-email');
    await page.getByLabel('Message (required, up to 2,000 characters)', { exact: true }).fill('<script>sample text</script>');
    await page.getByLabel('Rating (required)', { exact: true }).selectOption('3');
    await page.getByRole('button', { name: 'Send feedback' }).click();
    await page.waitForLoadState('load');
    assert.ok(await page.getByRole('heading', { name: 'Please check your feedback' }).isVisible());
    assert.equal(await page.locator('#name').inputValue(), 'Preserved Sample');
    assert.equal(await page.locator('#message').inputValue(), '<script>sample text</script>');
    assert.equal(await page.locator('#email').getAttribute('aria-describedby'), 'email-error');
    await inspect();
    for (const path of ['/', '/agents', '/agents/1', '/agents/1/appointments/new', '/dashboard']) {
      const response = await page.goto(base + path); assert.equal(response.status(), 200); await inspect();
    }
    results.push({ width, height, keyboardSubmission: 'passed', serverValidation: 'passed', regressions: 'passed' });
  }
  console.log(JSON.stringify({ browser: browser.version(), javaScript: false, results }, null, 2));
} finally { await browser.close(); }
