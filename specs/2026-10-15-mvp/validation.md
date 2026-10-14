# AgentClinic demo MVP: validation

Validate [requirements.md](requirements.md) through independent automated tests
and actual runtime/browser observations. This is the future validation protocol;
no check is claimed complete here. Required failed or pending checks block merge.

## 1. Installation, upgrade, and database integrity

- Use supported Node.js 24 and `npm ci`; document any actual platform requirements
  of the locked dependencies, without assuming native install scripts exist.
- Follow documented migration/seed commands against a fresh temporary file.
  Confirm agents, ailments, therapies, therapists, recommendations, and constraints.
- Upgrade a populated Phase 2 database with edited profiles, added records, and
  existing associations. Assert exact preservation and successful new migrations.
- Run migrations and seeds twice; counts and associations must remain unchanged.
  Existing edits/records survive, and ordinary application startup never seeds.
- Assert foreign-key enforcement, unique recommendation pairs, allowed statuses,
  safe new IDs, and fixed appointment duration. Failed migrations/seeds roll back
  atomically without false success markers.
- Assert clear startup/CLI failures for unusable paths and missing required
  migrations; no partially operational server is reported ready.
- Close/reopen a file database and confirm persistence. Isolate and clean up tests.

## 2. Independent Vitest acceptance coverage

Use `app.request()` with injected databases and clocks, without listening sockets.
Expected records, relationship sets, counts, and order must come from explicit
fixtures, not the same production query functions used by the route under test.

- Preserve home content, port regression behavior, metadata, shared landmarks,
  titles, local stylesheet order/content, and navigation current-section markers.
- Cover agent/ailment/therapy catalogs and profiles with empty, single, multiple,
  shared, missing, and malformed-resource fixtures. Insert records out of order;
  assert name/ID ordering and exact deduplicated recommendations.
- Assert no unrelated recommendations appear; an agent without ailments and an
  ailment without therapies receive the specified states.
- Verify escaped stored HTML-like text and user-retained form values.

### Booking, timezone, and concurrency

- Fix the test clock. Assert Bangkok input maps to the exact expected UTC instant,
  including dates crossing UTC midnight, and displays back in Bangkok time.
  Results must not depend on server/browser local timezone.
- Cover missing fields, duplicate scalar fields, invalid/unsafe IDs, nonexistent
  resources, impossible dates, malformed time, now/past starts, and no therapists.
  Invalid fields return 422; missing path resources return 404; no invalid case
  inserts or changes a record.
- A valid submission creates exactly one scheduled 30-minute appointment and
  redirects with 303 to its confirmation. GET/reload of confirmation makes no writes.
- Assert overlap rejection separately for the same therapist and the same agent,
  including equal starts, partial overlap, and containment. Adjacent intervals
  succeed; nonoverlapping sessions and different resources can book independently.
- Completed/cancelled appointments do not block time. Duplicate conflicting POSTs
  create at most one record and produce useful conflict feedback.
- Use a shared temporary on-disk SQLite database and separate connections/processes
  or workers to submit overlapping bookings concurrently. Exactly one succeeds;
  the other reports 409 without partial writes. Do not substitute a sequential
  in-memory test for concurrency evidence.

### Staff behavior and errors

- With independently specified fixtures, assert all-agent counts, future-scheduled
  counts, and distinct ailments on in-care agents. Test `start == now`, past
  scheduled records, shared ailments, and completed/cancelled records explicitly.
- Assert scheduled and historical ordering plus correct record links and states.
- Completing before end is rejected; completion at/after end succeeds. Cancellation
  succeeds while scheduled; terminal and stale transitions return 409 without mutation.
- Allowed agent status updates persist and change the relevant count. Invalid
  statuses return 422. Successful POSTs redirect with 303 and GET causes no writes.
- Unknown routes and malformed/missing resource IDs return shared-layout 404 HTML.
  Inject a query/action failure and assert safe shared-layout 500 HTML, no stack/SQL
  leakage, and private server logging.
- Cross-origin submissions return 403 with no mutation. Test the documented
  absent-Origin policy and ordinary same-origin form submissions.
- Check request logs contain method, pathname, status, and elapsed time, including
  failed requests; omit query values and form payloads.

## 3. Required commands and compiled assets

- `npm test`, `npm run typecheck`, and `npm run build` must all exit successfully.
  Source, tests, and test configuration remain strictly checked; no suppression
  or explicit `any` bypasses to make checks pass.
- Verify compiled migration/seed commands work using copied SQL and both local
  stylesheets. Tests/configuration stay out of production output.
- Run diff checks and inspect for generated databases/sidecars, dependencies,
  build output, secrets, OS metadata, and unrelated changes.

## 4. End-to-end demo and cross-mode persistence

Use disposable data and the documented setup; record exact commands and IDs.

1. Start development, open an agent with ailments, inspect therapy recommendations,
   and follow its booking link.
2. Submit invalid data and a conflicting slot; verify useful errors, retained
   values, and no extra records. Then book a valid future slot and inspect confirmation.
3. Reload confirmation; verify no duplicate booking. Inspect dashboard records/counts.
4. Update an agent status and cancel a scheduled appointment; verify persistence,
   dashboard changes, and released scheduling conflict. Complete an eligible
   past-ended scheduled appointment from a controlled fixture.
5. Stop development, build, and start production against the same database path.
   Confirm all created appointments, status changes, associations, and counts survive.
6. Repeat representative routes and forms in production, including confirmation,
   error states, stylesheets, custom port configuration, and normal shutdown.
7. Repeat the core workflow with JavaScript disabled and external asset requests
   blocked; local CSS and all forms/navigation must work.

## 5. Browser, responsive, and accessibility evidence

Cover Home, Agents, agent detail/recommendations, Ailments, Therapies, booking,
confirmation, dashboard, 404, and a safely triggered 500. Include empty/unavailable
states, invalid forms, conflict/stale-action feedback, and long-content fixtures.

- Check 320×812, 375×812, 768×1024, 1280×800, and 1440×900 CSS pixel viewports,
  plus 812×375 phone landscape. No page-level horizontal scrolling, clipping,
  overlap, or unreadable navigation. Table scrolling remains bounded and usable.
- Check actual 200% browser zoom, plus enlarged text at the narrowest viewport.
  Record browser and zoom evidence; effective-width reflow supplements but does
  not replace actual zoom. All controls/content remain usable.
- Traverse complete navigation and forms by keyboard. Verify logical focus order,
  visible focus, accessible table scrolling where applicable, form labels,
  linked errors and error summaries, meaningful link text, and semantic headings.
- Measure contrast for actual computed Pico overrides and text/focus states;
  require readable contrast meeting WCAG AA text thresholds. Check interactive
  targets are at least 44×44 CSS pixels and remain usable with touch.
- Confirm long names, models, URLs, complaints, and recommendation descriptions
  wrap. Inspect actual rendering; geometry checks alone do not establish readability.
- Verify corrected green primary/hover/focus variables take effect, rather than
  being overridden by Pico selector specificity.
- Check all core paths with JavaScript disabled; block external asset requests.
  Include representative narrow/desktop visual checks in both development and production.
- Preserve reproducible browser commands/scripts and screenshots where helpful.

## Merge readiness

- All scoped roadmap features, prior review fixes, business rules, and acceptance
  checks pass. Do not report unfinished phases or required checks as complete.
- Fresh setup, Phase 2 upgrade, repeatable seeding, atomic concurrency protection,
  and same-database development-to-production persistence have recorded evidence.
- Automated commands, complete demo workflow, and every required browser/accessibility
  check pass; pending or failing checks block merge.
- README documents timezone, session duration, conflict/transition rules, dashboard
  count meanings, local unauthenticated demo scope, and deferred features.
- Record runtime, exact commands, test results, fixture IDs, browser/viewports,
  actual zoom, observations, and remaining limitations in verification/PR evidence.
- Remove temporary validation changes; exclude generated artifacts and unrelated
  work. Review the final diff before merging. This spec creation does not authorize
  implementation, deployment, or claims that the MVP is ready.
