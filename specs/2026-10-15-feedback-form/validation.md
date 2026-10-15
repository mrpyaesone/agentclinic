# Feedback form validation

Status: not run; this document defines future acceptance checks. Documentation creation alone does not complete roadmap phases 1–5.

## Storage acceptance

- A fresh migrated database contains feedback with the required columns and constraints.
- Applying 003-feedback.sql to a database at migration 002 preserves existing agents, ailments, therapies, appointments, and associations.
- Repeating migrations does not duplicate migration history, remove records, or alter saved feedback.
- A valid submission persists exact normalized name, email, message, integer rating, and the controlled server timestamp. Closing and reopening a file-backed SQLite database preserves the row.
- Quotes, line breaks, Unicode, and SQL-like message text are stored as data; existing tables remain intact.
- Direct invalid writes fail the relevant schema constraints; startup detects missing migration or a missing feedback table.

## Form and route acceptance

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

- [ ] All storage, route, and browser acceptance checks above pass.
- [ ] npm test passes, including meaningful feedback and migration coverage.
- [ ] npm run typecheck passes.
- [ ] npm run build passes.
- [ ] Change description or this document records commands/results, browser checks, and any limitations. No unresolved acceptance failure is marked complete.
- [ ] Constitution, feature specs, roadmap completion notes, and TODO.md reflect the delivered scope.

For each completed check, record the test name or manual steps, actual result, and relevant environment. Do not replace expected results with an unverified success claim.
