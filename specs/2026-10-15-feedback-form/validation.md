# Feedback form validation

Status: passed. Roadmap phases 1–5 are implemented and validated.

## Storage acceptance

- A fresh migrated database contains feedback with the required columns and constraints.
- Applying 003-feedback.sql to a database at migration 002 preserves existing agents, ailments, therapies, appointments, and associations.
- Repeating migrations does not duplicate migration history, remove records, or alter saved feedback.
- A valid submission persists exact normalized name, email, message, integer rating, and the controlled server timestamp. Closing and reopening a file-backed SQLite database preserves the row.
- Quotes, line breaks, Unicode, and SQL-like message text are stored as data; existing tables remain intact.
- Direct invalid writes fail the relevant schema constraints; startup detects missing migration or a missing feedback table.

## Form and route acceptance

- All saved feedback appears below the form, newest first with ID as a tie-breaker. Names and messages render as escaped text; ratings and UTC dates are visible; emails are excluded. The empty state and confirmation link back to feedback work.

- GET /feedback returns 200 with all four labeled controls and the active Feedback navigation item.
- Valid POST /feedback creates exactly one row and returns 303 to /feedback/thanks; that GET returns 200 with confirmation. Repeating the confirmation GET does not insert another row.
- Required-field errors, whitespace-only values, name/message length boundaries, malformed or oversized email, and ratings outside the exact strings 1–5 are covered. Include message lengths 1, 2,000, and 2,001 and a valid long Unicode message within the body limit.
- Verify ratings 1 and 5 succeed; missing, zero, six, decimal, and nonnumeric ratings fail.
- Invalid fields, repeated keys, and unsupported keys return 422 and insert nothing. Unsupported content type returns 415; bodies above 32 KiB return 413. Existing same-origin rejection returns 403.
- Validation and storage failure responses retain safe input and escape markup, including name, email, and message. No submitted script or event handler becomes active markup.
- Simulate a database write failure: response is 503 with a retry message, no false confirmation, and no internal error details. Field values are absent from application logs and URLs.
- Existing booking/dashboard parser limits and behavior continue to pass their regression tests.

## Browser acceptance

Using the local application with a migrated database, check a current modern browser at desktop and narrow mobile widths. Record browser/version and viewport sizes.

1. Find Feedback from the main navigation and complete the form using only the keyboard.
2. Confirm labels, visible focus, error associations, preserved input, and readable layout without horizontal overflow.
3. Submit valid sample contact details and verify confirmation and refresh behavior.
4. Trigger an invalid submission and verify useful field errors.
5. Verify existing home, agents, booking, and dashboard journeys still work.

## Merge gate and evidence

- [x] All storage, route, and browser acceptance checks above pass.
- [x] npm test passes, including meaningful feedback and migration coverage.
- [x] npm run typecheck passes.
- [x] npm run build passes.
- [x] Change description or this document records commands/results, browser checks, and any limitations. No unresolved acceptance failure is marked complete.
- [x] Constitution, feature specs, roadmap completion notes, and TODO.md reflect the delivered scope.

For each completed check, record the test name or manual steps, actual result, and relevant environment. Do not replace expected results with an unverified success claim.

## Recorded acceptance evidence

- Environment: Node.js 24.21.0, SQLite through the existing better-sqlite3 dependency; disposable databases only.
- `npm test`: 127 tests passed across 6 files. `tests/feedback.test.ts` covers migration upgrade from 002 with unchanged clinic data, repeated migration, file reopen persistence, parameterized SQL-like content, schema/startup checks, field boundaries, encoded Unicode, all specified HTTP outcomes, safe redisplay, storage failure, private logs, and unchanged legacy parser limits. Existing clinic, booking, and dashboard tests pass.
- `npm run typecheck`: passed.
- `npm run build`: passed, including migration asset copying.
- `scripts/validate-feedback-browser.mjs`: passed with Chrome 155.0.8059.40 at 1280×800, 375×812, and 320×812, with JavaScript disabled and external requests blocked. Keyboard navigation and submission, visible focus, confirmation refresh, server validation, preserved text, error associations, and no horizontal overflow passed. The disposable database contained exactly three feedback rows after three submissions and confirmation refreshes.
- Public-list follow-up: the feedback Chrome suite passed again at all three widths, including the confirmation link back to feedback, visible newly submitted names/messages, and absence of email addresses in the list. Automated tests verify empty state, newest-first ordering with timestamp ties, and escaping stored markup.
- Existing `scripts/validate-browser.mjs` with `WORKFLOW=1`: passed 80 page/layout checks and 347 keyboard target checks in the same Chrome version. Booking validation, booking creation/conflict, staff status update, and cancellation passed. Checks include desktop/mobile layouts and actual 200% browser zoom.
- Feedback browser command: `PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs BASE_URL=http://localhost:3115 node scripts/validate-feedback-browser.mjs`. Existing workflow command adds `WORKFLOW=1` and uses `scripts/validate-browser.mjs`. Both require a running app with a disposable migrated and seeded database; Playwright is optional acceptance tooling and is not a runtime dependency.
- Scope remains a local demo: names, messages, ratings, and dates are public on the feedback page; email addresses stay private. No email is sent, and there is no staff viewer or production operations work. No outstanding acceptance failures.
