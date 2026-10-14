# Phase 1 — Hello Hono: requirements

## Context

This feature implements the first phase of the [roadmap](../roadmap.md). The [mission](../mission.md) calls for a playful, self-contained project for course students learning spec-driven development and developers demonstrating AI coding at conference booths. A small, reproducible server is the first working increment.

Follow the [tech stack](../tech-stack.md): Node.js, server-side TypeScript, Hono, `tsx` for development, and `tsc` for production builds. The current repository contains a package scaffold but no working server.

## Scope and decisions

- Enforce TypeScript for application source with `strict: true`, no JavaScript application source, and no explicit `any` or type-check suppression to bypass errors.
- Provide one page route: `GET /` returns HTTP 200 with a server-rendered HTML home page and a `text/html` content type. Serve its linked stylesheet at `GET /styles.css` with a `text/css` content type.
- Use Hono JSX in strictly checked `.tsx` source. The HTML document includes an English language declaration, UTF-8 encoding, viewport metadata, and an `AgentClinic` page title.
- Include a semantic main region with one top-level heading whose text is exactly `AgentClinic is open for business`, plus a short, playful introduction explaining that this is a fictional clinic where AI agents get relief from their humans.
- Compose a reusable `MainLayout` from separate `Header`, `Main`, and `Footer` subcomponents. Keep the page readable with responsive plain CSS, without client-side JavaScript or navigation to unimplemented features.
- Create a CSS file, import its contents through a Node-compatible module, link it from the layout, and include the asset in production build output.
- Use Hono and its Node.js server adapter. Keep the application definition separate from the entry point that opens the listening socket.
- Use port 3000 by default; allow a valid `PORT` environment variable to override it. Invalid port configuration must fail clearly at startup.
- Provide npm scripts for development (`dev`), production compilation (`build`), production execution (`start`), and static checking (`typecheck`).
- Development runs through `tsx` with file watching. Production runs the JavaScript emitted by `tsc` with Node.js. Development execution alone does not enforce types; `typecheck` is a required merge check.
- Select a compatible Node.js and dependency set during implementation. Document the supported runtime, commit the dependency lockfile, and keep module configuration consistent between TypeScript and Node.js.
- Document installation and the development, build, start, and validation commands in the README.

The requested home page extends Phase 1 from a plain-text greeting to server-rendered HTML while retaining the exact greeting as its heading. A follow-up request brings the reusable JSX layout and linked CSS into this increment.

## Out of scope

Additional page routes, navigation to unimplemented features, database access, agents, dashboards, authentication, deployment, and automated test setup. A page-specific Hono JSX component, shared layout, and linked CSS are in scope. Vitest remains the project's intended testing tool for later phases; this increment uses typecheck, build, and manual verification as requested.

## Acceptance criteria

1. A fresh dependency installation permits the documented development command to start the server.
2. The root route returns HTTP 200 and HTML containing the exact greeting heading and fictional-clinic introduction in development and production. Its title and document metadata match the requirements, and the page renders readably on desktop and a narrow mobile viewport.
3. Static checking uses strict TypeScript and fails on type errors.
4. Production compilation succeeds and its emitted entry point starts through the documented command.
5. A valid custom port works; an invalid configured port produces a clear startup failure.
6. A student or demo presenter can reproduce the checks using the README and [validation instructions](validation.md).
