# Phase 2 — Base Layout, Agents & Ailments: plan

Implement [requirements.md](requirements.md) in the following numbered task
groups. All tasks are pending; this document describes future implementation.

## 1. Add the database and repeatable setup

- [ ] Add `better-sqlite3` and compatible TypeScript declarations for Node.js 24;
  update the lockfile without changing the established application stack.
- [ ] Add configurable database opening, foreign-key enforcement, explicit
  connection cleanup, and injectable database access for route tests.
- [ ] Add a transactional SQL migration runner and applied-migration tracking.
- [ ] Add the initial agents, ailments, and constrained junction-table migration.
- [ ] Add explicit repeatable seed and migration commands; seed the approved
  fictional examples, including zero, multiple, and shared ailment associations.
- [ ] Ignore local SQLite artifacts; document the default path and overrides.
- [ ] Validate schema constraints, migration rollback, repeatability, preservation
  of existing records, and persistence using isolated database tests.

## 2. Extend shared layout and navigation

- [ ] Reuse Header, Main, Footer, and MainLayout; add Home/Agents/Ailments navigation.
- [ ] Support descriptive titles and accessible current-section indicators.
- [ ] Add and lock `@picocss/pico` v2; serve its standard distribution locally at
  `/pico.css` and include the asset in production output.
- [ ] Load Pico before `/styles.css` in MainLayout; configure a consistent light
  theme and adopt semantic Pico container/navigation conventions.
- [ ] Remove conflicting legacy reset/typography rules and retain a small plain-CSS
  override layer for wrapping navigation, list/profile layouts, long text,
  touch-sized links, and visible keyboard focus.
- [ ] Preserve the existing home heading, introduction, CSS route, and port behavior.
- [ ] Integrate the home page and new page components into the same layout.

## 3. Implement agent list and detail

- [ ] Add typed, parameterized database queries for deterministic agent listing
  and profile lookup with associated ailments.
- [ ] Render `/agents` with names, model types, statuses, profile links, and an
  explicit empty state.
- [ ] Render `/agents/:id` with all profile fields, associated ailment descriptions,
  a no-ailments state, and navigation back to the list and catalog.
- [ ] Reject malformed, unsafe, and missing IDs with a shared-layout 404 page.
- [ ] Cover listing, profile selection, associations, escaping, and edge states
  through Hono's request API without listening sockets.

## 4. Implement the ailments catalog and verify associations

- [ ] Add deterministic catalog querying and the `/ailments` page with descriptions.
- [ ] Add the catalog empty state and verify working catalog links from profiles.
- [ ] Verify shared ailments and multiple associations display correctly without
  duplicates or unrelated ailments; do not add routes for later roadmap phases.
- [ ] Cover catalog content, ordering, empty data, and relationship integrity.

## 5. Complete tests, documentation, and merge validation

- [ ] Update regression tests for navigation and titles while preserving Phase 1
  behavior, strict source/test typechecking, and application-only build output.
- [ ] Update README with migration, seed, path configuration, local setup,
  development, production, and validation commands; document local Pico asset
  delivery and the override stylesheet.
- [ ] Run `npm test`, `npm run typecheck`, and `npm run build`.
- [ ] Perform development and production checks against an isolated local database.
- [ ] Perform every responsive, landscape, zoom, keyboard/touch, and
  JavaScript-disabled browser check in [validation.md](validation.md).
- [ ] Record commands, runtime, outcomes, browser observations, and remaining
  issues in a verification record or implementation PR; unresolved checks block merge.
- [ ] Review the diff for scope, reproducible setup, and exclusion of generated
  artifacts before requesting merge.
