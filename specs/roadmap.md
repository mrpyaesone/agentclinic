# Roadmap

Phases are intentionally small — each one is a shippable slice of work, independently reviewable and testable.

Responsive design is required in every phase, rather than deferred to polish.
Every page must satisfy the [product UI requirements](../REQUIREMENTS.md) with
feature-specific acceptance criteria and browser checks for phones, tablets,
desktops, landscape orientation, and zoom.

---

MVP implementation for phases 1–7 is now present. See the
[MVP verification](2026-10-15-mvp/verification.md) for passing automated, runtime,
and browser checks. Comprehensive human visual signoff remains pending before
merge; implementation status does not assert that this prerequisite is complete.

## Phase 1 — Hello Hono (complete)

- [x] Install and configure Hono with `tsx` dev server
- [x] Single `/` page route returning "AgentClinic is open for business"
- [x] Confirm TypeScript types work end-to-end
- [x] Validate the home page, layout, CSS delivery, and port configuration with Vitest acceptance tests

Completed on 2026-10-14, including the requested shared header/main/footer
layout and linked CSS extension. See the [implementation verification](2026-10-14-hello-hono/verification.md).

## Phase 2 — Base Layout, Agents & Ailments

### Base Layout

The shared header/main/footer layout and basic CSS were brought forward into
Phase 1. Navigation, Pico CSS, agent data, profiles, and ailment integration were
implemented in Phase 2; MVP work extends navigation and addresses its review findings.

- Server-side JSX layout component (header, nav, main, footer)
- Basic CSS (custom properties, reset, typography)
- All routes render inside the shared layout

### Agent List
- SQLite database + first migration (`agents` table)
- Seed a handful of fictional agents
- `/agents` page listing all agents

### Agent Detail
- `/agents/:id` page showing a single agent's profile
- Name, model type, current status, presenting complaints

### Ailments Catalog
- `ailments` table + seed data (e.g., "context-window claustrophobia", "prompt fatigue")
- `/ailments` list page
- Link agents to one or more ailments

## Phase 3 — Therapies Catalog
- `therapies` table + seed data
- `/therapies` list page
- Map ailments → recommended therapies

## Phase 4 — Appointment Booking
- `appointments` table (agent, therapist, datetime, status)
- Form to book an appointment from an agent's detail page
- Basic validation and confirmation page

## Phase 5 — Staff Dashboard
- `/dashboard` with summary counts: agents, open appointments, ailments in-flight
- Simple table views for staff to manage records
- Mary's dashboard is now real

## Phase 6 — Polish & Accessibility
- Audit and refine responsive behavior across all previously implemented pages
- Semantic HTML audit
- Keyboard navigation and focus styles

## Phase 7 — Hardening
- Error pages (404, 500)
- Input sanitization on all forms
- Basic logging middleware

---

Later phases (not yet planned): auth, email notifications, therapist profiles, reporting.
