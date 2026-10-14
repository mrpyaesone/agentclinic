# Phase 2 — Base Layout, Agents & Ailments: validation

Validate against [requirements.md](requirements.md). These are required future
implementation checks, not claims of completed validation.

## 1. Fresh setup and database behavior

- Use the documented Node.js 24 runtime and `npm ci`. Follow the implementation's
  README migration and seed commands with an isolated temporary database path.
- Confirm the schema contains agents, ailments, the junction table, and migration
  tracking. Confirm foreign keys are enabled and duplicate pairs and dangling
  associations are rejected.
- Confirm the seed creates at least four agents and four ailments, including the
  two named examples, multiple ailments on one agent, one shared ailment, and
  an agent without ailments.
- Run migration and seeding twice. Assert unchanged counts and associations.
  Change an existing agent profile and add a record; repeat setup and verify both
  survive unchanged. Normal application startup must not reseed.
- Test failed migration rollback: no partial schema/data changes or successful
  migration record. Test clear setup errors for an unusable database path.
- Close and reopen a temporary on-disk database and confirm data persists.
  Isolate every test database and close all connections after use.

## 2. Automated route and content acceptance

Run `npm test`; require exit code 0. Use Vitest and Hono's request API without
opening a listening socket, with injected isolated databases.

- Home, Agents, an existing agent profile, and Ailments return HTTP 200 HTML,
  appropriate titles, viewport metadata permitting zoom, and the shared semantic
  header/nav/main/footer. Each page has one primary heading.
- Home keeps its exact greeting and clinic introduction. The stylesheet route
  still returns HTTP 200 CSS. `/pico.css` returns HTTP 200 with a CSS content
  type and the installed package’s stylesheet content. All pages load `/pico.css`
  before `/styles.css` and explicitly configure the light theme.
- Navigation targets only implemented routes; current-section indicators are
  correct, including Agents on agent profiles.
- Agent list includes every seeded agent's name, model type, status, and valid
  profile link in deterministic name/ID order.
- Profiles show the selected agent's fields and actual associated ailment names
  and descriptions. Cover zero, one, multiple, and shared ailments, with no
  duplicates or unrelated associations.
- Catalog lists all ailments and descriptions in deterministic name/ID order.
- Empty agent and ailment lists retain useful messaging and navigation.
- Missing IDs and malformed values such as `abc`, `0`, `-1`, `1.5`, `1abc`, `01`,
  and integers outside JavaScript's safe range return HTTP 404 with the shared
  layout and a working Agents link. Request-derived SQL values are parameterized.
- Stored HTML-like names and complaints appear escaped rather than as executable
  markup. Check long-text fixtures for content preservation; browser checks
  establish actual wrapping.
- Preserve existing port configuration, invalid-port startup, layout composition,
  and unknown-route regression coverage, updating expectations for new routes.

## 3. Type safety and production output

- Run `npm run typecheck`; require exit code 0 with strict checks covering source,
  tests, and Vitest configuration, without type-check bypasses.
- Run `npm run build`; require exit code 0. Confirm production output includes
  both Pico and application CSS and any SQL assets needed by compiled migration/seed commands, with no
  tests or test configuration in the production build.
- Confirm the documented migration and seed commands work after compilation;
  production startup must not depend on development-only source paths.

## 4. Development and production smoke checks

- Follow README setup against a disposable database, start development, and request
  `/`, `/agents`, `/agents/<seeded-id>`, `/ailments`, `/pico.css`, and `/styles.css`. Confirm
  expected HTTP status, content type, data, layout, and stylesheet delivery.
- Block external network requests in the browser and reload; both stylesheets
  load locally and the complete interface remains styled. Confirm Pico assets
  match the locked dependency in development and production.
- Follow actual profile and catalog links. Verify a missing/malformed profile
  gives the specified 404 page. Use a separate empty migrated database for empty
  list states, without deleting populated developer data.
- Stop development, build, and start production using the same database path.
  Repeat the route and link checks; data must persist across restarts.
- Confirm normal shutdown closes the database and the existing documented custom
  port behavior works. Record any native-dependency installation requirements.

## 5. Responsive and accessible browser checks

Check Home, Agents, an agent profile with multiple ailments, Ailments, and the
agent 404 page at 320×812, 375×812, 768×1024, 1280×800, and 1440×900 CSS pixels,
plus phone landscape at 812×375. Include empty-list and no-ailments states.

- No page-level horizontal scrolling, clipping, or overlap. Header navigation,
  cards/lists, profile fields, descriptions, and footer remain readable.
- Check 200% browser zoom, including effective 640 CSS pixel reflow on a 1280 pixel
  desktop, and enlarged text at the narrowest viewport. Metadata must permit zoom.
- Use temporary test data with long unbroken names, model labels, complaints, and
  URLs. Confirm wrapping and readable reflow. Wide tables, if used, scroll only
  within a clearly bounded region. Remove temporary fixtures afterward.
- Traverse navigation and profile/catalog links with the keyboard. Confirm logical
  focus order, visible focus, descriptive link text, semantic headings and landmarks,
  and readable text contrast with the Pico theme and overrides. Check link targets are at least 44×44 CSS pixels.
- Disable browser JavaScript and reload every page. Content, navigation, profile
  links, and error/empty states must remain functional.
- Repeat representative narrow and desktop checks using the compiled production
  server to confirm actual stylesheet delivery and equivalent presentation.

## Merge readiness

- All agreed acceptance criteria pass, including database repeatability,
  relationship integrity, route behavior, and development/production setup.
- `npm test`, `npm run typecheck`, and `npm run build` pass. Automated markup
  checks do not replace browser reflow and usability evidence.
- Every required browser scenario is checked and recorded; earlier pending Phase 1
  responsive checks are covered by the home-page validation here.
- README reproduces setup, database commands, configuration, and validation.
- Record runtime, exact commands, outcomes, browser/viewports, observations, and
  any limitations in a verification record or PR. Failures or pending required
  checks block merge; never report unperformed checks as passing.
- Remove temporary validation changes. Exclude SQLite files and sidecars,
  dependencies, build output, secrets, and unrelated work from the diff.
- This phase adds no editing UI, therapies, bookings, dashboards, or future-route
  navigation. Review the completed change before merging.
