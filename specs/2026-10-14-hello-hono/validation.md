# Phase 1 — Hello Hono: validation

## Required checks

Run on the documented Node.js runtime after installing dependencies from the committed lockfile with `npm ci`. These are implementation acceptance checks; they have not been executed as part of writing this specification.

### 1. Enforced TypeScript

- Run `npm run typecheck`; expect exit code 0.
- Confirm `strict: true`, coverage of both `.ts` and `.tsx` application source, Hono JSX configuration, and no JavaScript application files or type-check bypasses.
- Temporarily introduce an unmistakable type mismatch in a checked source file, such as assigning a string to a number variable. Confirm `npm run typecheck` exits nonzero, then remove the temporary change and rerun successfully.

### 2. Production build

- Run `npm run build`; expect exit code 0 and an emitted Node.js entry point.
- Confirm build configuration prevents successful emission when type errors are present.

### 3. Manual development check

- Run `npm run dev`.
- In another terminal, run `curl -i http://localhost:3000/`.
- Confirm HTTP 200 and a `text/html` content type. Inspect the HTML for the document declaration, English language, UTF-8 encoding, viewport metadata, and `AgentClinic` title.
- Confirm a semantic main region contains one top-level heading with exactly `AgentClinic is open for business` and a short introduction to the fictional clinic.
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
- README instructions reproduce dependency installation, development execution, typecheck, build, production execution, and port configuration.
- The minimal home page meets the requirements; no reusable layout, navigation, custom CSS, database, dashboard, or other later-phase feature has been introduced.
- Generated output, dependencies, secrets, and unrelated changes are excluded from the feature diff.
- Record runtime version, commands, outcomes, and manual observations in the implementation review or PR. Unresolved failures block merge.

Automated route tests are deferred for this phase by user decision. Manual HTTP checks cover the root response; they must be performed rather than inferred from a successful compilation.
