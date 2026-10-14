# Phase 1 — Hello Hono: plan

Implement the scope in [requirements.md](requirements.md), including the requested shared layout, linked CSS, and Vitest validation extensions. Complete each numbered task group before moving to the next.

## 1. Configure dependencies and TypeScript

- [x] Select and document a compatible Node.js runtime.
- [x] Add Hono and its Node.js adapter, plus `tsx` and compatible TypeScript/Node type tooling.
- [x] Add strict TypeScript configuration with application source and build output directories.
- [x] Align module settings with Node.js execution; record dependencies in the lockfile.
- [x] Ignore generated build output and dependency directories.

## 2. Add the Hono application and Node entry point

- [x] Define the Hono application in TypeScript.
- [x] Register `GET /` for the home page implemented in task group 3.
- [x] Add a separate Node entry point that serves the application.
- [x] Use port 3000 by default, validate `PORT`, and report the listening address.

## 3. Add a minimal AgentClinic home page

- [x] Configure Hono server-side JSX and include `.tsx` application files in strict type checking and production compilation.
- [x] Render a complete HTML document at `GET /` with language, character encoding, viewport metadata, and an `AgentClinic` page title.
- [x] Add a semantic main region with one heading containing exactly `AgentClinic is open for business` and a short, playful introduction to the fictional clinic.
- [x] Render the home page inside a reusable `MainLayout` component composed of separate `Header`, `Main`, and `Footer` subcomponents.
- [x] Keep document metadata in the layout and pass page content through the `Main` component's children.
- [x] Add `src/styles.css`, import its contents through a Node-compatible stylesheet module, and link `/styles.css` from the document head.
- [x] Serve the stylesheet with a CSS content type and provide readable, responsive header/main/footer styling.
- [x] Keep the exact greeting and fictional-clinic introduction; link the header brand only to the existing home page.

## 4. Add development and production scripts

- [x] Configure `npm run dev` to run the TypeScript entry point with `tsx` watching.
- [x] Include the CSS file in development watching so stylesheet edits reload the imported contents.
- [x] Configure `npm run typecheck` to run strict static checking of application source, tests, and test configuration without emitting files.
- [x] Configure `npm run build` to compile production JavaScript with `tsc`, failing on type errors.
- [x] Copy the stylesheet into `dist/` after successful compilation so the imported asset works in production.
- [x] Configure `npm start` to run the compiled entry point with Node.js.

## 5. Verify and document the increment

- [x] Run the typecheck, build, and initial manual checks in [validation.md](validation.md); record remaining styled-page browser checks.
- [x] Document installation, runtime requirements, all five scripts, and port configuration in the README.
- [x] Record results and any unresolved issues before requesting merge.
- [x] Review the diff for Phase 1 scope and generated artifacts.
- [x] Verify the shared layout, stylesheet link, CSS response, and copied production asset after the layout extension.

## 6. Add Vitest acceptance validation

- [x] Install Vitest, record it in the lockfile, and add `npm test` as a single `vitest run` validation command.
- [x] Configure the Node test environment and Hono JSX transformation for `.tsx` tests.
- [x] Cover the root response, document metadata, exact greeting, introduction, and semantic layout through Hono's request API.
- [x] Cover reusable layout children and escaping, the linked CSS response, and an unimplemented route's 404 response.
- [x] Extract port parsing into a testable function; cover the default, custom values, boundaries, invalid values, and invalid-port startup failure.
- [x] Strictly typecheck tests and configuration while keeping them outside production output.
- [x] Run tests, typecheck, and build; update requirements, validation instructions, README, and verification results.

Completed on 2026-10-14. See [verification.md](verification.md) for validation results.

## 7. Enforce responsive UI requirements

- [x] Align product and feature specs on responsive design from the first increment, rather than deferring it to Phase 9.
- [x] Retain the fluid container, viewport metadata, adaptive spacing, and heading sizes.
- [x] Allow shared containers to shrink and wrap long text; provide a touch-sized home link with visible focus.
- [ ] Check the styled page at the required viewport widths, landscape orientation, enlarged text, and zoom-equivalent reflow with JavaScript disabled.
- [x] Run Vitest, typecheck, and build; record the pending responsive browser checks in verification results.
