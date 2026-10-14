# AgentClinic

A fictional clinic where AI agents get relief from their humans, built as a
spec-driven development demo. Phase 1 serves a minimal HTML home page with Hono
and server-side JSX. A shared layout composes Header, Main, and Footer components,
with responsive styling from `src/styles.css`, served at `/styles.css` and linked
in the document head. The server imports the CSS through `src/styles.ts`; the
build copies it beside the compiled module in `dist/`.

Requires **Node.js 24.x** and npm. If you use nvm, run `nvm use` to select the
runtime from `.nvmrc`.

Install the locked dependencies:

```sh
npm ci
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

For production, build before starting:

```sh
npm test
npm run typecheck
npm run build
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
unknown routes, and port configuration. Route tests use Hono's request API
without opening a listening socket. Tests and test configuration are strictly
checked using `tsconfig.typecheck.json` and excluded from production compilation.
Neither development execution nor Vitest replaces typechecking. Follow the
[validation checklist](specs/2026-10-14-hello-hono/validation.md) for automated
checks and complementary HTTP, browser, watcher, and port checks. Recorded implementation
results live in [verification.md](specs/2026-10-14-hello-hono/verification.md).
