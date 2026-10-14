# Phase 1 — Hello Hono: plan

Implement only the scope in [requirements.md](requirements.md). Complete each numbered task group before moving to the next.

## 1. Configure dependencies and TypeScript

- Select and document a compatible Node.js runtime.
- Add Hono and its Node.js adapter, plus `tsx` and compatible TypeScript/Node type tooling.
- Add strict TypeScript configuration with application source and build output directories.
- Align module settings with Node.js execution; record dependencies in the lockfile.
- Ignore generated build output and dependency directories.

## 2. Add the Hono application and Node entry point

- Define the Hono application in TypeScript.
- Register `GET /` for the home page implemented in task group 3.
- Add a separate Node entry point that serves the application.
- Use port 3000 by default, validate `PORT`, and report the listening address.

## 3. Add a minimal AgentClinic home page

- Configure Hono server-side JSX and include `.tsx` application files in strict type checking and production compilation.
- Render a complete HTML document at `GET /` with language, character encoding, viewport metadata, and an `AgentClinic` page title.
- Add a semantic main region with one heading containing exactly `AgentClinic is open for business` and a short, playful introduction to the fictional clinic.
- Keep the page readable using browser defaults; defer shared layout, navigation, and CSS to Phase 2.

## 4. Add development and production scripts

- Configure `npm run dev` to run the TypeScript entry point with `tsx` watching.
- Configure `npm run typecheck` to run strict static checking without emitting files.
- Configure `npm run build` to compile production JavaScript with `tsc`, failing on type errors.
- Configure `npm start` to run the compiled entry point with Node.js.

## 5. Verify and document the increment

- Run the typecheck, build, and manual checks in [validation.md](validation.md).
- Document installation, runtime requirements, all four scripts, and port configuration in the README.
- Record results and any unresolved issues before requesting merge.
- Review the diff for Phase 1 scope and generated artifacts.
