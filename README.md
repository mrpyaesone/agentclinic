# AgentClinic

AgentClinic is a fictional wellness clinic for hardworking AI agents and a demo of spec-driven development (SDD) in an existing project. Visitors can explore the clinic, book a session for an agent, read sample reviews, and leave feedback. The project demonstrates how specifications and small, verifiable changes extend working software.

## Current features

- **Agents and ailments:** browse agent profiles, linked ailments, and therapy recommendations.
- **Appointments:** choose a therapist and book a future 30-minute session. Session times use Asia/Bangkok (UTC+07:00); overlapping scheduled bookings for the same agent or therapist are rejected.
- **Staff dashboard:** view clinic activity, update agent statuses, cancel scheduled appointments, and complete sessions after they end.
- **Feedback:** submit a name, email, message, and rating from 1 to 5, with server validation and confirmation. Submitted names, messages, ratings, and UTC dates appear publicly, newest first; emails are excluded from the public list. Use sample contact details. No email is sent.
- **Customer reviews:** read three clearly labeled fictional testimonials.

The About page with a fictional address and illustrative map is next on the [task list](TODO.md). This is an unauthenticated local demo using fictional data; production hosting, authentication, spam protection, and privacy management workflows are outside the current scope.

## Run locally

Requires **Node.js 24.x** and npm. If you use nvm, `nvm use` selects the version in `.nvmrc`.

```sh
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Open <http://localhost:3000/>. Shared navigation links to agents, ailments, therapies, the [staff dashboard](http://localhost:3000/dashboard), feedback, and reviews. Core pages and forms work without browser JavaScript.

Migrate before starting the server. Seeding adds fictional clinic fixtures and is repeatable; startup does not seed automatically. After pulling schema changes, run migrations again.

| Setting | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Server port; must be an integer from 1 to 65535. |
| `DATABASE_PATH` | `./data/agentclinic.sqlite` | SQLite file path, relative to the working directory. Use the same value for migration, seeding, and server commands. |

For example, `PORT=3001 npm run dev` starts the app on port 3001. Local database files and build output are ignored by Git.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with TypeScript and application CSS watching. |
| `npm test` | Run the automated test suite. |
| `npm run typecheck` | Check application and test types. |
| `npm run build` | Compile the application and copy CSS and SQL assets into `dist/`. |
| `npm start` | Run the compiled server. |
| `npm run db:migrate` | Apply pending database migrations from source. |
| `npm run db:seed` | Add fictional fixtures using source code. |
| `npm run db:migrate:production` | Apply migrations using compiled files. |
| `npm run db:seed:production` | Seed using compiled files. |

To run the compiled app locally:

```sh
npm run build
npm run db:migrate:production
npm run db:seed:production
npm start
```

## Stack and layout

The app uses TypeScript, Hono with server-rendered JSX, SQLite through better-sqlite3, and locally served Pico CSS with application overrides. Vitest provides automated tests.

| Path | Contents |
| --- | --- |
| `src/app.tsx` | Routes, form handling, and shared page rendering. |
| `src/components/` | Shared layout and page components. |
| `src/migrations/` | Ordered SQL schema migrations. |
| `src/database.ts`, `src/seed.ts` | Database setup, queries, and fictional fixtures. |
| `tests/` | Route, storage, validation, and regression tests. |
| `scripts/` | Asset copying and optional browser validation tools. |
| `specs/` | Product and technical constitution, roadmap, and feature specifications. |
| `.skills/` | Reusable feature-specification and changelog workflows. |

## Spec-driven workflow

Start with the [mission](specs/mission.md), [technical constitution](specs/tech-stack.md), and [roadmap](specs/roadmap.md). [TODO.md](TODO.md) tracks immediate priorities. Define requirements, an implementation plan, and observable validation criteria for each feature, then implement and record evidence before marking phases complete.

The completed [feedback specification](specs/2026-10-15-feedback-form/requirements.md) and [customer reviews specification](specs/2026-10-15-customer-reviews/requirements.md) show this workflow. [prompts.md](prompts.md) records development prompts, and [CHANGELOG.md](CHANGELOG.md) summarizes delivered changes.

## Verification

Run these checks for code changes:

```sh
npm test
npm run typecheck
npm run build
```

Browser validation scripts cover clinic journeys, feedback, and reviews. They use optional Playwright tooling and a local Chrome executable; Playwright is not a project dependency. Set `PLAYWRIGHT_MODULE` to an installed Playwright module, `BROWSER_EXECUTABLE` to the browser executable if needed, and `BASE_URL` to a running app. Use a disposable migrated and seeded database because submission and workflow checks create or update records.

See the [feedback validation record](specs/2026-10-15-feedback-form/validation.md) and [reviews validation record](specs/2026-10-15-customer-reviews/validation.md) for browser commands, acceptance criteria, and recorded results.
