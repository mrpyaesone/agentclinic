# Customer reviews validation

Status: complete; phases 6–8 verified on 2026-10-15.

Validate the [requirements](requirements.md) and [plan](plan.md) against the [roadmap](../roadmap.md) and [technical constitution](../tech-stack.md). Documentation review does not establish feature completion.

## Observable acceptance criteria

| Phase | Acceptance criterion | Evidence status |
| --- | --- | --- |
| 6 | A typed, local static collection contains three nonempty fictional agent names and review texts in a stable order. No database table, migration, or dependency is added. | Passed — see execution evidence below |
| 7 | `GET /reviews` returns 200 with a descriptive title, primary heading, visible fictional-sample label, and all reviews in the shared layout. | Passed — see execution evidence below |
| 7 | Shared navigation exposes Reviews on existing pages and marks Reviews as the current page on `/reviews`. | Passed — see execution evidence below |
| 8 | Names and review text render as plain text, including markup-like values. | Passed — see execution evidence below |
| 8 | Desktop and narrow-screen visitors can read every review, and keyboard users can reach, open, and leave the page with visible focus. | Passed — see execution evidence below |
| 8 | Existing clinic and feedback journeys still work; project commands pass. | Passed — see execution evidence below |

## Automated checks

- Check the static content contract without pinning exact review prose or inventing runtime validation for editorial data.
- Request `/reviews` through the application test harness and verify status, title, heading, fictional label, all names/texts and their order, shared header/footer, and current-page navigation.
- Render the review component with markup-like name and text values, including a script tag and HTML-special characters. Assert escaped text and absence of injected elements. Exercise the actual review renderer rather than relying solely on the existing layout escaping test.
- Check the shared navigation on representative existing routes, including home and feedback, and ensure their current-page state remains correct.
- Run the existing suite for agents, ailments, therapies, appointments, dashboard, and feedback, including persistence and failure paths already covered there.

Required project commands, all **passed**:

```sh
npm test
npm run typecheck
npm run build
```

No feature-specific migration or data-write check is required because reviews are static. When preparing a browser server, use the existing migration and seed commands with a disposable database; preserve the working local database.

## Browser checks

Use a current modern browser against the local application, with JavaScript disabled. Record browser/version, viewport sizes, results, and screenshots or logs where useful. The existing `scripts/validate-browser.mjs` and `scripts/validate-feedback-browser.mjs` provide tooling patterns; the new `scripts/validate-reviews-browser.mjs` verifies reviews.

- At a desktop viewport such as 1280 × 800 and a narrow viewport such as 375 × 812, open `/reviews` through the shared Reviews link. Confirm the fictional label, agent names, and full texts are readable, correctly associated, and in order.
- Confirm there is no horizontal page overflow, clipped review text, or unusable navigation at either width. Check readable reflow at 200% browser zoom.
- Starting on home, use Tab and Enter to reach Reviews, activate the link, and confirm the URL and current-page state. Check visible focus and absence of keyboard traps, then use shared navigation to leave the page. Repeat at narrow width.
- Confirm shared navigation still reaches agents, ailments, therapies, dashboard, and feedback. Smoke-check an agent profile and appointment booking journey, dashboard access, and a valid feedback submission with the public listing still excluding email addresses, using disposable data.
- Confirm the review page exposes no ratings, submission form, or external-service requirement.

All browser checks: **passed**; see execution evidence below.

## Merge gates and evidence record

Merge implementation only after all phase criteria, automated checks, required project commands, browser checks, and regression checks pass. Record failures and their resolution. Review the diff for unintended schema, dependency, or unrelated changes; keep About work pending. Only then update roadmap and TODO completion status.

| Check | Actual result / evidence |
| --- | --- |
| Content contract and route/rendering tests | Passed — see execution evidence below |
| Escaping and shared navigation tests | Passed — see execution evidence below |
| Full automated suite | Passed — see execution evidence below |
| Typecheck | Passed — see execution evidence below |
| Build | Passed — see execution evidence below |
| Desktop, narrow-screen, zoom, and keyboard checks | Passed — see execution evidence below |
| Existing-journey browser regressions | Passed — see execution evidence below |
| Final scope and completion review | Passed — see execution evidence below |

## Execution evidence — 2026-10-15

- `npm test`: 7 test files and 136 tests passed. `tests/reviews.test.tsx` covers the content contract, complete ordered rendering, actual component escaping, and navigation/current-page behavior across six existing routes.
- `npm run typecheck` and `npm run build`: passed.
- `scripts/validate-reviews-browser.mjs`: Chrome 155.0.8059.40, JavaScript disabled, external requests blocked. Content, overflow, visible keyboard focus, entering/leaving Reviews, and shared navigation passed at 1280 × 800, 375 × 812, and 320 × 812. Actual 200% page zoom passed (1280px outer width, 640px inner width, DPR 2, CSS zoom 1). Review content/order matched across viewports. Screenshots: `/private/tmp/customer-reviews-browser/`; narrow-screen screenshot visually reviewed for readable copy and card layout.
- `scripts/validate-feedback-browser.mjs`: passed keyboard submissions, public feedback email exclusion, server validation, and existing-page checks at all three viewport sizes.
- `scripts/validate-browser.mjs` with `WORKFLOW=1`: passed 80 page/layout checks and 378 keyboard target checks, including booking creation/conflict, staff updates, cancellation, and actual 200% zoom. Artifacts: `/private/tmp/customer-reviews-regressions/`.
- Browser scripts used `PLAYWRIGHT_MODULE=/private/tmp/agentclinic-browser/node_modules/playwright/index.mjs` and `BASE_URL=http://localhost:3118` against the compiled app with a disposable migrated/seeded database at `/private/tmp/customer-reviews-validation.sqlite`. Playwright remains optional tooling; no dependency was added. Initial sandbox restriction on tsx IPC was resolved by approved execution outside the sandbox.
- Scope review: no schema, dependency, or styling changes; About work remains pending. Unrelated untracked `backlog/` content was preserved.
