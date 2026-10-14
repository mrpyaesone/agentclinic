# Phase 1 — Hello Hono: validation

## Required checks

Run on the documented Node.js runtime after installing dependencies from the lockfile with `npm ci`. Current recorded outcomes are in [verification.md](verification.md).

### Automated acceptance tests

- Run `npm test`; expect exit code 0 with all Vitest tests passing.
- Tests in `tests/` run in Node with Hono JSX configured in `vitest.config.ts`.
- Route tests use `app.request()` and do not start a network server. Confirm coverage of HTTP status and content types, document metadata, exact heading and introduction, header/main/footer order, stylesheet link and contents, and an unimplemented route's 404 response.
- Layout tests cover rendering arbitrary children inside main and escaping text children.
- Port tests cover the unset default, a custom port, valid boundaries, invalid values, and a subprocess startup failure with a clear message and exit code 1 before opening a socket.
- Keep the following manual checks for browser rendering, file watching, compiled asset delivery, and listening on a configured port.

### 1. Enforced TypeScript

- Run `npm run typecheck`; expect exit code 0.
- Confirm `strict: true`, coverage of both `.ts` and `.tsx` application source and tests plus `vitest.config.ts`, Hono JSX configuration, and no JavaScript application files or type-check bypasses. `tsconfig.typecheck.json` extends the production compiler settings with test coverage and no emission.
- Temporarily introduce an unmistakable type mismatch in a checked source file, such as assigning a string to a number variable. Confirm `npm run typecheck` exits nonzero, then remove the temporary change and rerun successfully.

### 2. Production build

- Run `npm run build`; expect exit code 0 and an emitted Node.js entry point.
- Confirm `dist/styles.css` matches `src/styles.css`, and production compilation includes only application modules, without test files or Vitest configuration.
- Confirm build configuration prevents successful emission when type errors are present.

### 3. Manual development check

- Run `npm run dev`.
- In another terminal, run `curl -i http://localhost:3000/`.
- Confirm HTTP 200 and a `text/html` content type. Inspect the HTML for the document declaration, English language, UTF-8 encoding, viewport metadata, and `AgentClinic` title.
- Confirm a semantic main region contains one top-level heading with exactly `AgentClinic is open for business` and a short introduction to the fictional clinic.
- Confirm the layout has one header, main, and footer, with a stylesheet link to `/styles.css`. Request that URL and confirm HTTP 200, a `text/css` content type, and the expected stylesheet contents.
- Open the same URL in a modern browser; confirm the title, greeting, and introduction render readably at desktop and narrow mobile widths, without horizontal overflow or links to unimplemented features.
- Disable browser JavaScript and reload; confirm the home page remains visible and readable.
- Make and revert a harmless source edit; confirm the watcher reloads and the route remains available.
- Stop the development server before the production check.

### 4. Manual production and port checks

- Run `npm start` after the successful build, then repeat the root-route HTTP and browser checks on port 3000. Stop the server afterward.
- Run `PORT=3001 npm start`; check `http://localhost:3001/` for the same status, HTML content type, exact greeting heading, and introduction. Stop the server afterward.
- Run `PORT=invalid npm start`; confirm a clear startup error and a nonzero exit code.

## Merge readiness

- All required checks above pass, and temporary validation edits are removed.
- `npm test`, `npm run typecheck`, and `npm run build` all pass; successful Vitest execution alone does not establish type safety or browser readability.
- README instructions reproduce dependency installation, development execution, Vitest tests, typecheck, build, production execution, and port configuration.
- The home page meets the extended requirements, including the shared header/main/footer layout and linked CSS. No database, dashboard, additional page routes, or navigation to unimplemented features has been introduced.
- Generated output, dependencies, secrets, and unrelated changes are excluded from the feature diff.
- Record runtime version, commands, outcomes, and manual observations in the implementation review or PR. Unresolved failures block merge.

Vitest now provides automated acceptance validation for this phase. Manual HTTP and browser checks complement those tests; visual readability and successful listening must be observed separately.
