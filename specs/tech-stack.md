# Tech Stack

AgentClinic is a server-side TypeScript application. All rendering happens on the server; the browser receives plain HTML that works well and looks good.

The web UI uses responsive design on every page from its first implementation.
Follow the product's [responsive UI requirements](../REQUIREMENTS.md).

## Core

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Type safety end-to-end; satisfies Mary's requirement |
| Runtime | Node.js | Stable, well-supported, vast ecosystem |
| Server framework | **Hono** | Lightweight, TypeScript-first, fast, excellent DX; routes and middleware feel natural |
| Templating | Hono JSX (server-side) | JSX without React overhead; components are just functions |
| CSS | Pico CSS v2 + plain CSS custom-property overrides | Semantic HTML styling with locally served CSS and no CSS compilation step |

## Styling

- Starting in Phase 2, use the standard Pico CSS v2 distribution from
  `@picocss/pico`, with the selected version recorded in the lockfile. See the
  [official documentation](https://picocss.com/docs).
- Serve Pico locally at `/pico.css` before application overrides at `/styles.css`;
  include both assets in production output. Avoid runtime CDN dependencies.
- Use semantic HTML and Pico layout conventions, with a consistent light theme.
  Keep custom CSS small and focused on branding and required responsive/accessibility
  behavior. Pico supplies base reset, typography, and component styling.
- No Sass, CSS bundler, or browser JavaScript is required. Phase 1’s plain CSS
  remains historical; Phase 2 adopts Pico for the shared layout and every page.

## Responsive UI

- Use mobile-first plain CSS with fluid containers, flexible layouts, relative spacing, and adaptive typography. Add media queries when content requires a different arrangement.
- Include viewport metadata without disabling zoom. Wrap long content, allow flex/grid children to shrink, and keep wide tables within their own scrolling region.
- Validate at 320, 375, 768, 1280, and 1440 CSS pixels, phone landscape, and 200% browser zoom. No page-level horizontal overflow or overlap is acceptable.
- Keep interactive targets at least 44 by 44 CSS pixels with visible keyboard focus. Core content must work without client-side JavaScript.
- Require responsive acceptance criteria in every feature spec. Vitest covers behavior and markup; browser checks establish actual reflow and visual usability.

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
