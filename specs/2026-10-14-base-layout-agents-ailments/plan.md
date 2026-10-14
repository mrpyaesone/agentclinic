# Phase 2 — Base Layout, Agents & Ailments: plan

Implement [requirements.md](requirements.md) in the following numbered task
groups. Implementation completed on 2026-10-15. See [verification.md](verification.md)
for evidence and remaining manual merge checks.

## 1. Add the database and repeatable setup

- [x] Add `better-sqlite3` and compatible TypeScript declarations for Node.js 24;
  update the lockfile without changing the established application stack.
- [x] Add configurable database opening, foreign-key enforcement, explicit
  connection cleanup, and injectable database access for route tests.
- [x] Add a transactional SQL migration runner and applied-migration tracking.
- [x] Add the initial agents, ailments, and constrained junction-table migration.
- [x] Add explicit repeatable seed and migration commands; seed the approved
  fictional examples, including zero, multiple, and shared ailment associations.
- [x] Ignore local SQLite artifacts; document the default path and overrides.
- [x] Validate schema constraints, migration rollback, repeatability, preservation
  of existing records, and persistence using isolated database tests.

## 2. Extend shared layout and navigation

- [x] Reuse Header, Main, Footer, and MainLayout; add Home/Agents/Ailments navigation.
- [x] Support descriptive titles and accessible current-section indicators.
- [x] Add and lock `@picocss/pico` v2; serve its standard distribution locally at
  `/pico.css` and include the asset in production output.
- [x] Load Pico before `/styles.css` in MainLayout; configure a consistent light
  theme and adopt semantic Pico container/navigation conventions.
- [x] Remove conflicting legacy reset/typography rules and retain a small plain-CSS
  override layer for wrapping navigation, list/profile layouts, long text,
  touch-sized links, and visible keyboard focus.
- [x] Preserve the existing home heading, introduction, CSS route, and port behavior.
- [x] Integrate the home page and new page components into the same layout.

## 3. Implement agent list and detail

- [x] Add typed, parameterized database queries for deterministic agent listing
  and profile lookup with associated ailments.
- [x] Render `/agents` with names, model types, statuses, profile links, and an
  explicit empty state.
- [x] Render `/agents/:id` with all profile fields, associated ailment descriptions,
  a no-ailments state, and navigation back to the list and catalog.
- [x] Reject malformed, unsafe, and missing IDs with a shared-layout 404 page.
- [x] Cover listing, profile selection, associations, escaping, and edge states
  through Hono's request API without listening sockets.

## 4. Implement the ailments catalog and verify associations

- [x] Add deterministic catalog querying and the `/ailments` page with descriptions.
- [x] Add the catalog empty state and verify working catalog links from profiles.
- [x] Verify shared ailments and multiple associations display correctly without
  duplicates or unrelated ailments; do not add routes for later roadmap phases.
- [x] Cover catalog content, ordering, empty data, and relationship integrity.

## 5. Complete tests, documentation, and merge validation

- [x] Update regression tests for navigation and titles while preserving Phase 1
  behavior, strict source/test typechecking, and application-only build output.
- [x] Update README with migration, seed, path configuration, local setup,
  development, production, and validation commands; document local Pico asset
  delivery and the override stylesheet.
- [x] Run `npm test`, `npm run typecheck`, and `npm run build`.
- [x] Perform development and production checks against an isolated local database.
- [ ] Complete actual 200% browser zoom and the remaining manual visual/accessibility
  checks; automated responsive, landscape, keyboard/touch, and JavaScript-disabled
  browser checks are recorded in verification.md. Follow every browser check in [validation.md](validation.md).
- [x] Record commands, runtime, outcomes, browser observations, and remaining
  issues in a verification record or implementation PR; unresolved checks block merge.
- [x] Review the diff for scope, reproducible setup, and exclusion of generated
  artifacts before requesting merge.
