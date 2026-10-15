# AgentClinic technical constitution

## Stack decision

Preserve the existing stack. Extend established patterns and use existing dependencies where practical. Any proposed stack change needs an explicit rationale and an updated specification before implementation.

## Current baseline

This baseline comes from package.json, TypeScript configuration, and the existing source; versions describe repository declarations, not claims about the latest releases.

| Area | Existing choice |
| --- | --- |
| Runtime | Node.js 24 (`>=24 <25`), npm, ES modules |
| Language | TypeScript `~5.9.3`, strict checking, NodeNext modules |
| HTTP server | Hono `^4.13.13` with `@hono/node-server` `^2.1.5` |
| Rendering | Server-rendered HTML using Hono JSX; standard links and HTML forms |
| Styling | Pico CSS `^2.1.1` and application CSS |
| Storage | SQLite through better-sqlite3 `^13.0.3` |
| Schema management | Ordered SQL migrations and explicit migration/seed commands |
| Development | tsx watch |
| Verification | Vitest `^5.0.4`, TypeScript typechecking, build, and an existing browser validation script |

## Implementation rules

- Keep new pages and forms consistent with the existing server-rendered architecture, layout, and navigation.
- Validate submitted values on the server, escape rendered visitor content, and preserve existing same-origin form protections.
- For approved database changes, add migrations and use parameterized queries. Do not silently change existing data contracts.
- Keep deployment configuration external: the application currently reads `PORT` and `DATABASE_PATH`, with SQLite defaulting to `./data/agentclinic.sqlite`.
- Preserve explicit database migration before server startup and the existing structured request/error logging approach.
- Use meaningful verification for changed behavior, including validation and failure paths for forms and data writes. Check affected pages in modern browsers for readability, keyboard access, and responsive layout.

## Verification commands

- `npm test` runs the automated suite.
- `npm run typecheck` checks application and test types.
- `npm run build` compiles the application and copies assets.
- `npm run dev` starts the development server.
- `npm run db:migrate` and `npm run db:seed` manage local database setup; production commands operate on compiled files.

## Simple demo defaults

These defaults replace open-decision tasks. Keep the sample self-contained and preserve the existing stack. They describe planned behavior, not features already implemented.

| Feature | Demo implementation |
| --- | --- |
| Running the sample | Existing local Node.js server and SQLite database. |
| Feedback | One required message, trimmed and limited to 1–2,000 characters. Save the message and submission timestamp in SQLite using a migration and parameterized insert. Show field errors, success confirmation, and a retry message on storage failure. Collect no contact fields and do not publish submissions. |
| Reviews | A small static collection of fictional agent names and review text, clearly labeled as sample reviews. No ratings, submission form, or moderation workflow. |
| About and map | Short fictional clinic copy, the sample address “42 Context Lane, Promptville,” and a locally rendered static illustrative map labeled as fictional, with a text description. No map provider or API key. |
| Browser experience | Semantic HTML, labeled fields, keyboard-accessible navigation, visible focus, and responsive styling. Check affected pages in a current modern browser at desktop and narrow widths. |

Production hosting, backups, authentication, spam protection, privacy management workflows, and external integrations are excluded from implementation tasks. Preserve existing validation and form protections.
