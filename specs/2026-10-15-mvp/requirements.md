# AgentClinic demo MVP: requirements

## Context and confirmed decisions

Complete the remaining features of the [roadmap](../roadmap.md) as a single
reviewable MVP, guided by the [mission](../mission.md),
[tech stack](../tech-stack.md), and [product UI requirements](../../REQUIREMENTS.md).
The user approved the full proposed demo MVP, task sequence, stack, names, and
all validation checks on 2026-10-15. Branch: `mvp`.

Phases 1–2 already provide the home page, shared layout/navigation, agents,
profiles, ailments, SQLite migration/seed commands, and locally served Pico CSS.
Preserve the [Phase 1 requirements](../2026-10-14-hello-hono/requirements.md) and
[Phase 2 requirements](../2026-10-14-base-layout-agents-ailments/requirements.md)
except where this scope explicitly extends them. Phase 2's out-of-scope therapies,
appointments, therapists, and dashboard become in scope here. Historical
verification is evidence of previous checks, not proof of MVP readiness.

This is a fictional local teaching/conference demo with an unauthenticated staff
dashboard. Describe that operating context in the README. Authentication, public
deployment, and real patient data are deferred. These files specify future work;
they do not assert implementation or successful validation.

## Roadmap coverage

| Phase | MVP treatment |
| --- | --- |
| 1 — Hello Hono | Preserve home content, runtime, port behavior, and production build. |
| 2 — Base Layout, Agents & Ailments | Preserve implemented features; resolve review findings and pending validation. |
| 3 — Therapies Catalog | Add therapies, seeds, catalog, and ailment recommendations. |
| 4 — Appointment Booking | Add therapists, appointments, booking form, validation, and confirmation. |
| 5 — Staff Dashboard | Add summary counts, record views, appointment actions, and agent status updates. |
| 6 — Polish & Accessibility | Audit all existing and new pages, forms, states, navigation, and responsive behavior. |
| 7 — Hardening | Add shared 404/500 pages, validated form handling, and basic request logging. |
| Later features | Authentication, email, therapist profiles, reporting, and deployment remain deferred. |

## Resolve inherited review findings

Use the [three-perspective review](../../review-result-by-3subagents.md) and
[Phase 2 verification](../2026-10-14-base-layout-agents-ailments/verification.md).

- Fix Pico variable selector specificity so intended primary/hover/focus colors
  take effect, then verify computed values and contrast.
- Replace production-query-derived test expectations with independent fixtures
  for ordering and associations; include equal-name tie breaking and exact counts.
- Correct native dependency setup instructions and historical build claims to
  match the locked dependency. Point current README validation links at this MVP.
- Make ailment headings subordinate to their profile section while retaining
  appropriate catalog heading levels. Use extracted, named TypeScript props types.
- Complete pending actual browser zoom, visual/keyboard/contrast checks and the
  same-database development-to-production transition as part of MVP validation.

## Architecture and database

- Keep Node.js 24, strict TypeScript, Hono server-side JSX, `better-sqlite3`,
  versioned plain SQL migrations, Vitest, and local Pico CSS followed by small
  application overrides. No ORM, client framework, Sass, or required browser JS.
- Retain injectable database connections and request-based route tests. Keep
  production assets and SQL available to compiled commands without source paths.
- Add subsequent migrations; do not rewrite the applied Phase 2 migration.
  Upgrade existing databases transactionally, preserving agents, ailments,
  relationships, profile changes, and migration/seed history.
- Add `therapies` (ID, unique name, description), `ailment_therapies` (unique
  ailment/therapy pair), and `therapists` (ID, stable seed key, name, specialty).
  Recommendations are many-to-many; they are catalog guidance, not clinical advice.
- Add `appointments` with positive safe-integer ID, agent and therapist foreign
  keys, UTC start/end timestamps, and constrained status: `scheduled`,
  `completed`, or `cancelled`. Duration is always 30 minutes.
- Add referential integrity and positive safe-integer constraints for new public
  IDs. Existing public IDs must continue to work. No destructive record deletion UI.
- Extend explicit, versioned, repeatable seeding with at least four therapies and
  three fictional therapists; cover multiple/shared recommendations and an ailment
  without recommendations. Reruns must preserve edits and additional records.
  Normal startup must never seed. Initial MVP seeds need not create appointments.
- Validate required migration readiness before serving; fail clearly on an
  unmigrated/outdated database instead of serving partial broken features.

## Therapies and recommendations

- `GET /therapies` returns HTTP 200 HTML with every therapy's name and description,
  ordered by name then ID, with an explicit empty state.
- Show each ailment's recommended therapies in `/ailments` and the relevant agent
  profile. Deduplicate a therapy recommended by several of an agent's ailments;
  retain the ailment-to-therapy relationship in the displayed context.
- Display a friendly no-recommendations state. Recommendations need no therapy
  detail page or therapist-to-therapy matching system for this MVP.
- Extend shared navigation with Therapies and Staff dashboard only when the routes
  exist. Preserve current-section indicators and useful links between pages.

## Booking and scheduling rules

- Link each agent profile to `GET /agents/:id/appointments/new`. The server-rendered
  form identifies the agent, offers seeded therapists, and collects a start date/time.
  Submit to `POST /agents/:id/appointments` without requiring browser JavaScript.
- Sessions are fixed at 30 minutes. Interpret entered local date/time explicitly
  in `Asia/Bangkok` (UTC+07:00), independent of browser/server locale. Store UTC
  instants; show all appointment times in Bangkok time with a visible timezone label.
- Permit any future minute-level start time; no clinic-hour calendar or discrete
  slot grid is required. Compare against a server clock injectable into tests.
- Accept valid calendar dates only; reject missing, malformed, impossible, past,
  or current start times and invalid/missing agent or therapist IDs.
- Scheduled appointments must not overlap for either the same therapist or the
  same agent. Use half-open intervals: an appointment ending exactly when another
  starts is permitted. Completed/cancelled appointments do not reserve time.
- Enforce conflict checks and insertion in one database transaction so simultaneous
  submissions through different connections cannot both claim a conflicting slot.
  Report conflicts as HTTP 409 with a useful form error; retain entered values.
- On valid booking, insert one scheduled appointment and redirect with HTTP 303 to
  `GET /appointments/:id`, displaying the agent, therapist, Bangkok start/end time,
  and current status. Refreshing that confirmation must not create another record.
  Duplicate overlapping submissions must not create duplicate appointments.
- Invalid form data returns HTTP 422 with field-linked errors, preserved values,
  and no mutation. Unknown path resources return the shared HTTP 404 page.
- No available therapists produces a friendly unavailable state and no usable
  submit action. Booking does not automatically change agent status or ailments.

## Staff dashboard and management

- `GET /dashboard` shows Mary's summary and simple record views for agents,
  appointments, and ailments. Use stable ordering and useful empty states.
- Define summary counts precisely: all agents; future scheduled appointments
  (`start > now`); and distinct catalog ailments associated with at least one
  agent whose status is `in care`. Label the last count clearly as ailments in care.
- List appointments with linked agent, therapist, Bangkok time, and status;
  scheduled records come first, ordered by start then ID. Other records remain
  visible in a separately labelled history ordered by descending start then ID.
- Provide server-rendered POST forms to mark a scheduled appointment completed
  or cancelled. Completion is permitted only once its end time is at or before
  now; cancellation is permitted while status is scheduled. Terminal states are
  final for this MVP. Stale/invalid transitions return HTTP 409 without mutation.
- Use `POST /appointments/:id/status` for appointment actions and
  `POST /agents/:id/status` for agent status changes. Agent status choices remain
  `awaiting assessment`, `in care`, and `recovering`; all such transitions are allowed.
- Validate and persist permitted actions, then redirect with HTTP 303 back to the
  dashboard. Counts must reflect subsequent requests to the same database.
- Dashboard users can view records and perform the above actions. Creation/editing
  of agent profiles, therapists, ailments, or therapies is out of scope.

## Error handling, forms, and logging

- Render unknown routes and missing/malformed public resource IDs with HTTP 404
  inside the shared layout and working navigation. Catch unexpected failures and
  render a safe HTTP 500 page without SQL, stack traces, or filesystem details.
- Validate all POST fields on the server using explicit allowed values, lengths,
  formats, and resource existence; reject duplicate scalar fields and unsupported
  actions. Document concrete field limits during implementation.
- Use parameterized SQL and escaped JSX text; validation must not strip legitimate
  text as a substitute for escaping. Mutating actions must never occur through GET.
- Validate browser Origin for mutating requests against the request origin; reject
  cross-origin submissions with HTTP 403 and no mutation. Provide a testable policy
  for requests without Origin so ordinary same-origin browser forms work.
- Log method, pathname without query values, response status, and elapsed time for
  requests. Log unexpected errors server-side with enough context to investigate,
  without recording submitted form contents or exposing internals to the browser.

## Responsive and accessible UI

- All existing/new routes and error, empty, invalid, and conflict states follow
  the product UI requirements at 320, 375, 768, 1280, and 1440 CSS pixels,
  phone landscape, enlarged text, and actual 200% browser zoom.
- Require readable reflow with no page-level horizontal scrolling, clipping, or
  overlap. Long names and descriptions wrap; wide tables scroll only in bounded,
  accessible regions. Navigation must remain readable as links are added.
- Use semantic landmarks and headings, labelled controls, field errors associated
  with their controls, a useful error summary, logical keyboard order, visible
  focus, readable contrast, and touch targets at least 44×44 CSS pixels.
- Core browsing, booking, confirmation, and staff actions work with JavaScript
  disabled and external asset requests blocked. Keep one primary heading per page.

## Out of scope

Authentication/roles, email notifications, therapist profile pages, therapist
availability calendars, rescheduling, variable duration, billing, clinical records,
catalog/profile CRUD, deployment, reporting, and real-world patient use.

## Success criteria

1. A fresh checkout and an existing Phase 2 database can both reach the MVP through
   documented setup; repeat migrations/seeds preserve data.
2. An agent's ailments lead to clear therapy recommendations and a working booking
   flow; valid bookings persist and conflicting/invalid submissions do not mutate data.
3. Staff can inspect accurate counts and records, complete/cancel permitted
   appointments, and update agent statuses with correct persistence and feedback.
4. All roadmap features in scope, inherited fixes, safe errors, and logging work
   in development and compiled production.
5. Independent automated expectations, concurrency/timezone checks, and required
   browser/workflow evidence pass as defined in [validation.md](validation.md).
6. Required pending/failed checks block merge. README and verification accurately
   describe supported behavior and evidence; planned work is not reported as done.
