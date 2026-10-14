# AgentClinic

A fictional wellness clinic for AI agents and a local spec-driven development demo.
Browse agents and ailments, explore therapy recommendations, book a session, and
manage appointments from Mary's staff dashboard. Pages use Hono server-side JSX,
SQLite, and locally served Pico CSS; core workflows need no browser JavaScript.

Requires **Node.js 24.x** and npm (`nvm use` selects `.nvmrc`). Install and prepare:

```sh
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Visit <http://localhost:3000/>. The dashboard is at `/dashboard`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Watch TypeScript and application CSS. |
| `npm test` | Run Vitest acceptance tests. |
| `npm run typecheck` | Strictly check source, tests, and Vitest configuration. |
| `npm run build` | Compile application code and copy CSS and SQL assets to `dist/`. |
| `npm start` | Run the compiled server. |
| `npm run db:migrate` | Apply pending SQL migrations with development source. |
| `npm run db:seed` | Add versioned fictional fixtures explicitly. |
| `npm run db:migrate:production` | Migrate with compiled code and copied SQL. |
| `npm run db:seed:production` | Seed with compiled code. |

For production execution locally:

```sh
npm test
npm run typecheck
npm run build
npm run db:migrate:production
npm run db:seed:production
npm start
```

SQLite defaults to `./data/agentclinic.sqlite`, relative to the working directory.
Set `DATABASE_PATH` consistently on database and server commands to use another
file. Migrations upgrade existing Phase 2 data without rewriting its initial SQL.
Seed commands are repeatable and preserve edits, extra records, and previous
seed history. Normal startup never seeds; missing migrations produce a setup error.
Stop with Ctrl+C before changing servers. Local database files and sidecars are ignored.

The locked `better-sqlite3` 13.0.3 package provides platform prebuilt binaries and
has no install script; script approval/rebuild is not part of normal setup.
Use the supported runtime/platform rather than assuming npm rebuild compiles it.

Default port is 3000. `PORT` must be an integer from 1 through 65535; invalid
configuration fails before listening. For example: `PORT=3001 npm start`.

## Demo workflow

1. Open `/agents`, choose a profile, and inspect its ailment-specific recommendations.
2. Follow **Book a session**, select a therapist, and enter a future start time.
3. Inspect the confirmation; refreshing it creates no additional appointment.
4. Open **Staff dashboard** to inspect records, update agent statuses, and complete
   or cancel scheduled appointments.

All session times are explicitly **Asia/Bangkok (UTC+07:00)**, regardless of the
browser or server timezone. Each session lasts 30 minutes. Any future minute-level
start is permitted. Scheduled appointments cannot overlap for the same agent or
therapist; consecutive sessions may touch at the end/start boundary. Cancelled
and completed records do not reserve time. Conflicting or duplicate submissions
return 409 without additional records. Booking does not change agent status.

Staff may cancel any scheduled appointment, or complete it once its end time has
passed. Completed/cancelled appointments are final; stale actions return 409.
Agent statuses are awaiting assessment, in care, or recovering. All transitions
between those values are allowed. Actions save and redirect back to the dashboard.

Dashboard counts mean: all agents; future scheduled appointments with start after
now; and distinct ailments linked to at least one agent currently in care.
Scheduled sessions appear first, followed by completed/cancelled history.

This MVP is an **unauthenticated local fictional demo**. Catalog/profile editing,
authentication, emails, therapist profile pages, rescheduling, availability calendars,
reporting, real patient data, and deployment are deferred.

## Form handling and observability

POST forms accept URL-encoded data, at most 4096 bytes, with each scalar field at
most 100 characters. Duplicate/unknown fields and invalid resource IDs/statuses
are rejected. IDs must be canonical positive safe integers; date/time input is
exactly `YYYY-MM-DDTHH:mm`, with years 2000–9998 and actual calendar validation.
Invalid forms return 422 with associated errors and retained supported values.
Unknown resources return 404; unexpected failures show a safe shared-layout 500.
SQL queries are parameterized and rendered text is escaped.

Mutations reject an Origin different from the request origin. If Origin is absent,
Fetch Metadata and Referer must not contradict same-origin; requests without those
headers are allowed for local CLI/demo clients. This is tested and is separate
from authentication, which this demo does not provide.

Request logs record method, pathname, status, and elapsed milliseconds. Error logs
record the error class and request context. Query values, submitted form payloads,
and database/stack details are not sent to the browser or recorded in request logs.

## Validation

Run tests, typecheck, and build before merging. Tests use isolated SQLite databases
and Hono's request API; expected fixtures are independent of production queries.
A separate-process test checks conflicting bookings against one SQLite file.
Follow the [MVP validation checklist](specs/2026-10-15-mvp/validation.md) and
[verification record](specs/2026-10-15-mvp/verification.md) for browser/runtime evidence.
Earlier Phase 1 and Phase 2 verification files are historical evidence.

Optional browser tooling is kept outside runtime dependencies. Install Playwright
in a temporary directory, then point `PLAYWRIGHT_MODULE` to its `index.mjs` and
`BROWSER_EXECUTABLE` to a locally installed Chrome executable. Example:

```sh
PLAYWRIGHT_MODULE=/private/tmp/agentclinic-browser/node_modules/playwright/index.mjs \
BASE_URL=http://localhost:3110 APPOINTMENT_ID=2 \
node scripts/validate-browser.mjs
```

Use a disposable seeded database for browser verification. `WORKFLOW=1` exercises
booking and cancellation and mutates its fixtures; `COMPLETE_ID` names an eligible
past-ended scheduled fixture. `EMPTY_CHECK=1` checks an empty migrated database.
`UNAVAILABLE_CHECK=1` checks a seeded database without therapists.
`STATE_CHECK=1` checks conflict/stale/invalid status states against disposable data.
`ERROR_CHECK=1` adds the deliberately failing route provided only by
`tests/helpers/browser-server.ts`; that harness is excluded from production output.
Screenshots/results go to temporary output unless `BROWSER_OUTPUT` is supplied.
Browser checks block external assets, disable page JavaScript, check viewports,
keyboard focus, text contrast, and actual 200% zoom using a disposable Chrome profile.
