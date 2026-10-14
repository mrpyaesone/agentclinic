# AgentClinic demo MVP: plan

Implement [requirements.md](requirements.md) in these numbered task groups.
Implementation and automated/runtime/browser verification completed on 2026-10-15.
See [verification.md](verification.md) for evidence and the remaining comprehensive
human visual signoff. Validate against [validation.md](validation.md).

## 1. Resolve Phase 2 findings and establish independent regression coverage

- [x] Fix Pico theme selector specificity and verify intended computed colors.
- [x] Correct profile heading hierarchy using named TypeScript component props.
- [x] Replace query-derived test expectations with explicit fixtures for exact
  associations, duplicate exclusion, ordering, and equal-name ID tie breaking.
- [x] Correct dependency setup/build claims and current validation links in README.
- [x] Carry prior pending browser and cross-mode persistence checks into MVP validation.

## 2. Extend database migrations and repeatable seed data

- [x] Add subsequent SQL migrations for therapies, recommendations, therapists,
  and appointments, including foreign keys, unique pairs, constrained statuses,
  safe public IDs, and consistent UTC start/end storage.
- [x] Preserve the initial migration and all existing Phase 2 data on upgrade.
- [x] Add explicit versioned seeds for fictional therapies, therapists, and mappings;
  preserve edits and additional records on reruns and keep startup seed-free.
- [x] Check migration readiness before startup; retain clear failures and cleanup.
- [x] Add independent database coverage for upgrades, rollback, constraints,
  repeatability, persistence, and seed transaction failure.

## 3. Add therapies and recommendations

- [x] Build ordered `/therapies` catalog and empty state inside the shared layout.
- [x] Display ailment recommendations in the catalog and associated agent profiles,
  with shared therapy deduplication and explicit no-recommendation states.
- [x] Extend navigation and descriptive titles for implemented routes.
- [x] Cover catalog content, association correctness, ordering, and edge states.

## 4. Implement appointment booking and confirmation

- [x] Add pure, testable Bangkok date/time parsing and formatting plus injectable clock.
- [x] Add profile booking link, labelled therapist/date-time form, unavailable state,
  and field-linked validation with retained input.
- [x] Validate IDs, actual calendar dates, future starts, and fixed 30-minute duration.
- [x] Enforce agent/therapist interval conflicts and insertion atomically across
  separate database connections; permit adjacent intervals.
- [x] Implement scheduled appointment persistence, HTTP 303 confirmation redirect,
  and `/appointments/:id` summary; reject invalid/conflicting submissions without mutation.
- [x] Cover timezone/clock boundaries, conflicts, simultaneous submissions, duplicate
  submissions, confirmation refresh, and JavaScript-free behavior.

## 5. Add staff dashboard and management actions

- [x] Implement the defined summary counts, ordered record views, and empty states.
- [x] Add POST appointment completion/cancellation with time/status transition checks.
- [x] Add POST agent-status updates with the existing allowed values.
- [x] Return useful invalid/stale-state errors and redirect successful actions.
- [x] Verify actions persist and update counts on subsequent requests; include
  completed/cancelled history and exact known count fixtures.

## 6. Add shared errors, form hardening, and logging

- [x] Integrate shared-layout 404 and safe 500 handlers across all routes.
- [x] Centralize server-side form validation, limits, duplicate-field rejection,
  parameterized queries, and escaped output where reuse improves clarity.
- [x] Apply and document same-origin submission checks; reject cross-origin mutations.
- [x] Add basic method/path/status/duration logging and private unexpected-error logs.
- [x] Verify failure paths do not leak internals, mutate records, or log form values.

## 7. Complete accessibility, browser/workflow verification, and documentation

- [ ] Complete comprehensive human visual signoff for every page/state/viewport.
- [x] Audit page/state markup and automated behavior for headings, landmarks, labels, field errors,
  keyboard navigation, focus, contrast, touch targets, and wrapping navigation.
- [x] Complete all specified widths, landscape, enlarged text, actual 200% browser
  zoom, long-content, bounded-table, and JavaScript-disabled browser checks.
- [x] Run the full recommendations → booking → confirmation → staff workflow.
- [x] Verify migration/seeding from a fresh checkout and upgrade an existing
  Phase 2 database, including data preservation and clear setup failures.
- [x] Stop development and start compiled production against the same database;
  confirm created bookings, staff changes, assets, and navigation persist/work.
- [x] Run `npm test`, `npm run typecheck`, `npm run build`, and diff checks.
- [x] Update README with workflow, timezone, transitions, counts, setup, and local
  demo limitations; update roadmap completion only when backed by actual evidence.
- [x] Record exact commands, runtime, browsers, fixtures, outcomes, and limitations
  in verification/PR evidence. Preserve useful browser scripts for reproducibility.
- [ ] Close the remaining human visual signoff before merge.
- [x] Review the final diff for scope, assets, and generated artifacts.
