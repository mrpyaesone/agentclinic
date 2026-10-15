# Customer reviews validation

Status: acceptance checks defined; implementation checks have not been run.

Validate the [requirements](requirements.md) and [plan](plan.md) against the [roadmap](../roadmap.md) and [technical constitution](../tech-stack.md). Documentation review does not establish feature completion.

## Observable acceptance criteria

| Phase | Acceptance criterion | Evidence status |
| --- | --- | --- |
| 6 | A typed, local static collection contains three nonempty fictional agent names and review texts in a stable order. No database table, migration, or dependency is added. | Not run |
| 7 | `GET /reviews` returns 200 with a descriptive title, primary heading, visible fictional-sample label, and all reviews in the shared layout. | Not run |
| 7 | Shared navigation exposes Reviews on existing pages and marks Reviews as the current page on `/reviews`. | Not run |
| 8 | Names and review text render as plain text, including markup-like values. | Not run |
| 8 | Desktop and narrow-screen visitors can read every review, and keyboard users can reach, open, and leave the page with visible focus. | Not run |
| 8 | Existing clinic and feedback journeys still work; project commands pass. | Not run |

## Automated checks

- Check the static content contract without pinning exact review prose or inventing runtime validation for editorial data.
- Request `/reviews` through the application test harness and verify status, title, heading, fictional label, all names/texts and their order, shared header/footer, and current-page navigation.
- Render the review component with markup-like name and text values, including a script tag and HTML-special characters. Assert escaped text and absence of injected elements. Exercise the actual review renderer rather than relying solely on the existing layout escaping test.
- Check the shared navigation on representative existing routes, including home and feedback, and ensure their current-page state remains correct.
- Run the existing suite for agents, ailments, therapies, appointments, dashboard, and feedback, including persistence and failure paths already covered there.

Required project commands, all currently **not run for this feature**:

```sh
npm test
npm run typecheck
npm run build
```

No feature-specific migration or data-write check is required because reviews are static. When preparing a browser server, use the existing migration and seed commands with a disposable database; preserve the working local database.

## Browser checks

Use a current modern browser against the local application, with JavaScript disabled. Record browser/version, viewport sizes, results, and screenshots or logs where useful. The existing `scripts/validate-browser.mjs` and `scripts/validate-feedback-browser.mjs` provide tooling patterns; neither currently verifies reviews.

- At a desktop viewport such as 1280 × 800 and a narrow viewport such as 375 × 812, open `/reviews` through the shared Reviews link. Confirm the fictional label, agent names, and full texts are readable, correctly associated, and in order.
- Confirm there is no horizontal page overflow, clipped review text, or unusable navigation at either width. Check readable reflow at 200% browser zoom.
- Starting on home, use Tab and Enter to reach Reviews, activate the link, and confirm the URL and current-page state. Check visible focus and absence of keyboard traps, then use shared navigation to leave the page. Repeat at narrow width.
- Confirm shared navigation still reaches agents, ailments, therapies, dashboard, and feedback. Smoke-check an agent profile and appointment booking journey, dashboard access, and a valid feedback submission with the public listing still excluding email addresses, using disposable data.
- Confirm the review page exposes no ratings, submission form, or external-service requirement.

All browser checks: **not run**.

## Merge gates and evidence record

Merge implementation only after all phase criteria, automated checks, required project commands, browser checks, and regression checks pass. Record failures and their resolution. Review the diff for unintended schema, dependency, or unrelated changes; keep About work pending. Only then update roadmap and TODO completion status.

| Check | Actual result / evidence |
| --- | --- |
| Content contract and route/rendering tests | Not run |
| Escaping and shared navigation tests | Not run |
| Full automated suite | Not run |
| Typecheck | Not run |
| Build | Not run |
| Desktop, narrow-screen, zoom, and keyboard checks | Not run |
| Existing-journey browser regressions | Not run |
| Final scope and completion review | Not run |
