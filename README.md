# AgentClinic

A fictional clinic where AI agents get relief from their humans. Phase 2 provides
read-only agent profiles and an ailments catalog, backed by SQLite and rendered
with Hono server-side JSX. Home, Agents, and Ailments share accessible navigation.
Pico CSS is served locally at `/pico.css`, before small overrides at `/styles.css`;
no CDN or browser JavaScript is needed. The build copies CSS and SQL migrations
into `dist/`.

Requires **Node.js 24.x** and npm. If you use nvm, run `nvm use` to select the
runtime from `.nvmrc`.

Install the locked dependencies:

```sh
npm ci
npm run db:migrate
npm run db:seed
```

Start development with automatic reload on TypeScript and stylesheet changes:

```sh
npm run dev
```

Visit <http://localhost:3000/>. The page needs no browser JavaScript.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the TypeScript entry point with `tsx` watching. |
| `npm test` | Run Vitest acceptance tests once in Node. |
| `npm run typecheck` | Check application source, tests, and test configuration with strict TypeScript, without emitting files. |
| `npm run build` | Compile to `dist/` and copy the CSS asset; type errors prevent emission. |
| `npm start` | Run the compiled `dist/index.js` with Node.js. |

SQLite defaults to `./data/agentclinic.sqlite`, relative to the working directory.
Set `DATABASE_PATH` on every database and server command to use another file.
Migration and seeding are explicit, transactional, and repeatable. Seeding runs
once and preserves later edits and additional records; server startup never seeds.
An unmigrated database produces a setup error. Stop with Ctrl+C to close the
server and database. Local SQLite files and sidecars are ignored by Git.

`better-sqlite3` is a native dependency. If your npm configuration blocks install
scripts, approve it with `npm install-scripts approve better-sqlite3`, then run
`npm rebuild better-sqlite3`. Building from source requires a working C++ compiler,
Python, and platform development tools (Xcode command-line tools on macOS).

For production, build and prepare the database before starting:

```sh
npm test
npm run typecheck
npm run build
npm run db:migrate:production
npm run db:seed:production
npm start
```

The default port is 3000. Override it with a decimal integer from 1 through
65535; an empty, nonnumeric, fractional, or out-of-range value fails at startup.

```sh
PORT=3001 npm start
curl -i http://localhost:3001/
```

Stop a running server with Ctrl+C before starting another on the same port.
Run `npm test`, `npm run typecheck`, and `npm run build` before merging.
Vitest tests in `tests/` cover the home page, reusable layout, CSS delivery,
unknown routes, and port configuration, plus Phase 2 database and page behavior. Route tests use Hono's request API
without opening a listening socket. Tests and test configuration are strictly
checked using `tsconfig.typecheck.json` and excluded from production compilation.
Neither development execution nor Vitest replaces typechecking. Follow the
[validation checklist](specs/2026-10-14-hello-hono/validation.md) for automated
checks and complementary HTTP, browser, watcher, and port checks. Recorded implementation
results live in [verification.md](specs/2026-10-14-hello-hono/verification.md).

Visit `/agents` for all agents, follow a profile link for complaints and linked
ailments, or browse `/ailments`. Empty lists and unknown agent IDs have helpful
messages. There is no editing interface in this phase.

| Database command | Purpose |
| --- | --- |
| `npm run db:migrate` | Apply pending SQL migrations using development source. |
| `npm run db:seed` | Add fictional demo records once, after migration. |
| `npm run db:migrate:production` | Migrate using compiled code and copied SQL. |
| `npm run db:seed:production` | Seed using compiled code. |

Phase 2 merge checks and browser scenarios are in
[validation.md](specs/2026-10-14-base-layout-agents-ailments/validation.md).
Tests inject isolated SQLite connections into `createApp(db)` and exercise routes
without listening sockets. Database tests cover constraints, rollback, repeatable
setup, preservation, and file persistence. The supported styling foundation is
[Pico CSS](https://picocss.com/docs); no Sass or CSS bundler is required.
