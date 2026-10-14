# Phase 2 — Base Layout, Agents & Ailments: requirements

## Context

Implement the full second phase of the [roadmap](../roadmap.md). Follow the
[mission](../mission.md): a playful fictional clinic and a reproducible teaching
and conference demo. Follow the [tech stack](../tech-stack.md) and the
[product UI requirements](../../REQUIREMENTS.md).

Phase 1 already supplies the Hono application, shared Header/Main/Footer JSX
layout, linked plain CSS, strict TypeScript, Node.js 24, and Vitest. Extend these
components rather than replacing them. Its responsive browser checks remain
pending in the earlier verification; this phase must establish browser evidence
for the home page and new pages before merge.

## Confirmed scope and decisions

The user approved full Phase 2, read-only pages with playful fictional data,
the task sequence in [plan.md](plan.md), and all checks in
[validation.md](validation.md). The user subsequently selected Pico CSS for this phase. This supersedes the
original plain-CSS-only styling choice. No implementation is included in this
planning work.

### Shared layout and navigation

- Render `/`, `/agents`, `/agents/:id`, and `/ailments` inside the shared semantic
  header, navigation, main, and footer layout, with one primary heading per page.
- Provide Home, Agents, and Ailments navigation links, with an accessible current
  page indicator; agent detail belongs to the Agents section.
- Preserve the exact home heading `AgentClinic is open for business`, existing
  introduction, stylesheet delivery, and port behavior. Use descriptive page titles.
- Use the standard Pico CSS v2 distribution from `@picocss/pico` for the shared
  styling foundation on every page, following its [official documentation](https://picocss.com/docs).
  Lock the selected package version in the dependency lockfile.
- Serve the packaged CSS locally at `/pico.css`, loading it before the existing
  `/styles.css` stylesheet. Copy the required Pico asset into production output;
  development and production must work without a CDN or external asset requests.
- Use semantic HTML and Pico container/navigation conventions. Let Pico provide
  the reset, typography, and base component styling; remove conflicting legacy
  rules. Keep `/styles.css` as a small layer of CSS custom-property overrides and
  feature-specific rules for navigation wrapping, long text, focus, touch targets,
  and responsive list/profile and empty/error layouts. No Sass or CSS bundler is
  required.
- Use a consistent light theme for this increment, explicitly configured through
  Pico’s theme attribute; validate contrast and focus after customizations.
- Use Hono server-side JSX and escaped text. Core content and links must work
  without client-side JavaScript.

### Database and reproducible setup

- Use SQLite via `better-sqlite3`, strict TypeScript, and versioned plain SQL
  migrations without an ORM. Commit dependency and lockfile updates.
- Store `agents`, `ailments`, and an `agent_ailments` junction table in the first
  migration. Agents have a positive integer ID, name, model type, current status,
  and presenting complaints. Ailments have a positive integer ID, unique name,
  and a short description.
- Use the fictional agent statuses `awaiting assessment`, `in care`, and
  `recovering`. Presenting complaints are readable profile text; catalog ailments
  are separately linked records.
- Enforce foreign keys and unique agent/ailment pairs. Allow zero, one, or several
  ailments per agent, and reuse a catalog ailment across agents.
- Track applied migrations and apply each once. Run each migration transactionally;
  failures must not leave partially applied schema or a successful migration record.
- Provide documented commands for migration and explicit seeding. Use a configurable
  database path with a documented local default, ignore local database artifacts,
  and report setup failures clearly. Normal server startup must not add demo records.
- Seed at least four distinct fictional agents and four ailments, including
  `context-window claustrophobia` and `prompt fatigue`. Include an agent with
  multiple ailments, a shared ailment, and an agent with none.
- Repeated migration and seed commands must not duplicate records or links, erase
  existing records, or overwrite existing profile changes. Database data persists
  across restarts. Tests use isolated temporary or in-memory databases.
- Keep database construction and lifecycle separable from route definition so
  tests can inject a database without opening a network socket; close connections
  after tests and on normal server shutdown.

### Agent list and detail

- `GET /agents` returns HTTP 200 HTML listing every agent in a deterministic order
  (name, then ID), with name, model type, status, and a link to its profile.
- `GET /agents/:id` returns HTTP 200 HTML for an existing positive integer ID,
  showing name, model type, status, presenting complaints, and associated ailment
  names and descriptions. Include links back to Agents and to the ailments catalog.
- An agent without ailments displays an explicit, friendly no-ailments message.
  An empty agent list displays an empty state with working navigation.
- Missing or malformed IDs return HTTP 404 with a helpful page inside the shared
  layout and a link back to Agents. Accept only canonical positive decimal IDs
  representable as safe integers; do not partially parse arbitrary strings.
- Use parameterized SQL for request-derived values.

### Ailments catalog

- `GET /ailments` returns HTTP 200 HTML listing every catalog ailment, including
  its name and description, ordered by name then ID. Display a friendly empty
  state when the catalog is empty.
- Agent profiles display the actual database associations, without unrelated
  ailments or duplicate entries. Catalog links must work without inventing an
  ailment-detail route.

### Responsive and accessible behavior

- Support widths from 320 CSS pixels upward. Validate all pages at 320, 375, 768,
  1280, and 1440 CSS pixels, phone landscape, and 200% browser zoom.
- Navigation and content reflow without page-level horizontal scrolling, clipped
  text, or overlap. Long names, model labels, complaints, and URLs must wrap.
- Permit browser zoom through viewport metadata. Use semantic headings, landmarks,
  readable contrast, meaningful link text, visible keyboard focus, and interactive
  targets at least 44 by 44 CSS pixels.
- Keep any wide tables within a clearly bounded scrolling region. Prefer simple
  lists or cards when they avoid unnecessary horizontal scrolling.

## Out of scope

Editing or creating agents through the UI, authentication, therapists, therapies,
appointments, staff dashboards, deployment, and general logging/error hardening.
The agent-not-found page and setup failure handling needed by this phase are in scope.
Do not add navigation links to future routes.

## Acceptance criteria

1. A fresh checkout can install dependencies, migrate, seed, and run development
   and production using documented commands on the supported runtime.
2. Migrations and seeds are repeatable and preserve existing data; foreign keys
   and unique associations hold, and persisted data survives reopening the database.
3. Home, agent list/detail, and catalog satisfy the route, content, navigation,
   ordering, shared layout, and metadata requirements above.
4. Empty lists, agents without ailments, and missing/malformed IDs have the
   specified friendly behavior. Stored text is escaped and queries are parameterized.
5. Tests cover meaningful database and route behavior with isolated databases.
   `npm test`, `npm run typecheck`, and `npm run build` all pass.
6. Development and compiled production serve the same data, local Pico stylesheet,
   and application overrides, in the correct cascade order without CDN access.
7. Browser evidence establishes responsive, zoom, touch, keyboard, and
   JavaScript-disabled usability for every page and the relevant edge states.
8. README setup instructions are reproducible and the feature diff contains no
   generated databases, dependencies, build output, secrets, or unrelated changes.
