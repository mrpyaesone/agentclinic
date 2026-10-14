# Tech Stack

AgentClinic is a server-side TypeScript application. All rendering happens on the server; the browser receives plain HTML that works well and looks good.

## Core

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Type safety end-to-end; satisfies Mary's requirement |
| Runtime | Node.js | Stable, well-supported, vast ecosystem |
| Server framework | **Hono** | Lightweight, TypeScript-first, fast, excellent DX; routes and middleware feel natural |
| Templating | Hono JSX (server-side) | JSX without React overhead; components are just functions |
| CSS | Plain CSS + CSS custom properties | No build step required; Steve gets a modern, attractive result |

## Recommended: Hono

[Hono](https://hono.dev) is chosen over Express/Fastify because:

- First-class TypeScript with zero config
- Built-in JSX renderer for server-side HTML
- Middleware model is simple and composable
- Runs on Node, Deno, Bun, and edge runtimes without changes

## Data

- **SQLite** (via `better-sqlite3`) for local development and early production — simple, embedded, no infrastructure
- Migrations via plain SQL files; no ORM to start

## Testing

- **Vitest** — use automated TypeScript tests to validate application behavior and feature acceptance criteria.
- Run `npm test` (`vitest run`) for a single validation run locally and in CI. Tests use `.test.ts` or `.test.tsx` filenames.
- Test Hono routes through the application's request API without opening a listening socket; cover expected responses and meaningful error cases.
- Require `npm test`, `npm run typecheck`, and `npm run build` before merging. Vitest execution does not replace strict TypeScript checking.
- Keep manual browser checks for visual readability, responsive layouts, and accessibility alongside automated tests.
- Use Vitest for current Phase 1 validation and subsequent work. Earlier manual-check results remain historical evidence.

## Tooling

- `tsx` for development (run TypeScript directly, no build step needed)
- `tsc` for production builds
- `prettier` for formatting

## What We Are Not Using

- No React, Vue, or Svelte — server-side rendering keeps the stack simple
- No ORM — SQL is sufficient at this scale
- No Docker — not yet; that's a later phase concern
