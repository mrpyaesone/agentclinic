# Phase 1 — Hello Hono: plan

Implement the scope in [requirements.md](requirements.md), including the requested shared layout and linked CSS extension. Complete each numbered task group before moving to the next.

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
- [x] Configure `npm run typecheck` to run strict static checking without emitting files.
- [x] Configure `npm run build` to compile production JavaScript with `tsc`, failing on type errors.
- [x] Copy the stylesheet into `dist/` after successful compilation so the imported asset works in production.
- [x] Configure `npm start` to run the compiled entry point with Node.js.

## 5. Verify and document the increment

- [x] Run the typecheck, build, and manual checks in [validation.md](validation.md).
- [x] Document installation, runtime requirements, all four scripts, and port configuration in the README.
- [x] Record results and any unresolved issues before requesting merge.
- [x] Review the diff for Phase 1 scope and generated artifacts.
- [x] Verify the shared layout, stylesheet link, CSS response, and copied production asset after the layout extension.

Completed on 2026-10-14. See [verification.md](verification.md) for validation results.
