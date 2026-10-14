# MVP verification — 2026-10-15

## Result

Implementation is complete. Automated, runtime, workflow, and browser checks pass.
A complete human visual inspection of every viewport/state screenshot remains a
manual merge prerequisite; representative screenshots have been inspected.

## Automated checks

- Node.js v24.21.0: `npm test` passed all 79 tests across five files.
- `npm run typecheck`, `npm run build`, and `git diff --check` passed.
- Tests cover Phase 2 upgrade/data preservation, repeatable/versioned seeds, seed
  rollback, constraints, independent ordering/association expectations, Bangkok
  date boundaries, atomic booking conflicts, staff transitions/counts, origin checks,
  invalid/oversized/duplicate fields, safe errors, and payload-free logging.
- Two separate processes submitted the same conflicting booking through Hono
  against one SQLite file: statuses were 303 and 409, with exactly one appointment.
- A copied source/configuration snapshot in `/private/tmp/agentclinic-mvp-fresh`
  passed `npm ci --offline`, all 79 tests, typecheck, build, compiled migration,
  and compiled seeding. No install-script approval was needed for SQLite.

## Runtime and workflow

- Explicit compiled migration and seed commands prepared fresh, populated, empty,
  and no-therapist disposable databases. Existing Phase 2 upgrade is exercised in tests.
- Development ran on port 3110 against `/private/tmp/agentclinic-mvp.sqlite`.
  JavaScript-disabled browser forms rejected invalid input, booked appointment #2,
  rejected a conflicting second submission, changed Ada to recovering, cancelled #2,
  and completed an eligible past-ended appointment #1.
- Development was stopped and compiled production started on port 3110 using the
  same database path. Appointment #1 remained completed, #2 remained cancelled,
  and Ada remained recovering. Production browser checks and workflow passed.
- Production workflow then booked/cancelled #3, checked confirmation reload, and
  exercised invalid/conflicting input. A scheduled #4 was reserved for conflict-state
  verification. No browser fixture records are in the repository.

## Browser checks

Installed Google Chrome 155.0.8059.40, temporary Playwright 1.64.1, with page
JavaScript disabled and external asset requests blocked:

| Run | Checks | Keyboard focus stops |
| --- | ---: | ---: |
| Development populated pages | 77 | 306 |
| Production populated pages plus conflict/stale/invalid status states | 98 | 543 |
| Production empty pages | 42 | 117 |
| Validation harness with deliberately triggered 500 | 84 | 330 |
| Production unavailable-therapist pages | 63 | 246 |
| Production booking/staff workflow and populated matrix | 80 | 328 |

- Viewports: 320×812, 375×812, 768×1024, 1280×800, 1440×900, and 812×375 landscape.
- Actual 200% page zoom is configured in a disposable Chrome profile, not simulated
  with CSS zoom or device scale. Asserted outerWidth 1280, innerWidth 640, DPR 2,
  CSS zoom 1, and visualViewport scale 1. Native screenshots use CDP capture to
  avoid Playwright's full-page clipping at native zoom.
- Checks assert no page-level horizontal overflow, controls at least 44×44 pixels,
  one primary heading, labelled controls, working error-summary targets, correct
  local stylesheet delivery, intended computed green primary color, complete
  keyboard traversal/focus, and AA text contrast for rendered non-disabled text.
- Long unbroken profile content with 200% root text size passed at 320 pixels.
- Representative mobile booking, dashboard, conflict, desktop stale-action, and
  actual-zoom profile screenshots were visually inspected and are readable.
- Browser workflow exposed and fixed booking-link semantics and native datetime
  segment focus. A stylesheet-loading race in geometry inspection was corrected.

## Reproduction

Install optional Playwright outside the repository, run a disposable configured
server, and set `PLAYWRIGHT_MODULE` to that installation's `index.mjs`:

```sh
PLAYWRIGHT_MODULE=/private/tmp/agentclinic-browser/node_modules/playwright/index.mjs \
BASE_URL=http://localhost:3110 APPOINTMENT_ID=3 STATE_CHECK=1 \
BROWSER_OUTPUT=/private/tmp/agentclinic-mvp-production node scripts/validate-browser.mjs
```

`WORKFLOW=1` runs booking/status/cancellation through ordinary browser forms.
`COMPLETE_ID` optionally names a past-ended scheduled fixture. `EMPTY_CHECK=1`
checks empty pages; `UNAVAILABLE_CHECK=1` checks seeded agents without therapists.
`ERROR_CHECK=1` uses the validation-only `/__validation_500` harness route.
`STATE_CHECK=1` requires APPOINTMENT_ID to name a terminal appointment and reserves
one future session in the disposable database to exercise conflict errors.

Results and screenshots were saved under `/private/tmp/agentclinic-mvp-*`.
The browser script and validation-only harness are preserved in the repository;
Playwright is not a runtime dependency and the harness is excluded from production.

## Remaining merge prerequisite

Complete human visual inspection across every page/state at all required widths,
landscape, enlarged text, and actual zoom. Automated geometry/contrast/keyboard
checks and representative screenshot inspection are strong evidence but do not
replace the agreed comprehensive visual signoff. No pending check is reported as passed.
