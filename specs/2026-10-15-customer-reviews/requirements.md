# Customer reviews requirements

Status: implemented and verified; see [validation evidence](validation.md).

## Purpose and context

Give human visitors a playful view of fictional agents' experiences at AgentClinic. This feature covers phases 6–8 of the [roadmap](../roadmap.md), following the [mission](../mission.md) and [technical constitution](../tech-stack.md). See the [implementation plan](plan.md) and [validation criteria](validation.md).

The application already serves clinic pages and a persisted feedback form using Hono JSX, a shared layout, Pico CSS, and standard links. Before this feature, there was no reviews page, reviews navigation entry, or static review collection. Reviews are separate editorial sample content; submitted feedback remains on the feedback page.

## Confirmed user decisions

The user selected the entire customer reviews feature, phases 6–8, and accepted the proposed plan and defaults: three playful fictional reviews in a typed static collection, a `/reviews` page using the existing layout, a shared navigation entry, and verification of the full journey. The user accepted automated rendering and escaping checks, regression checks, project commands, and desktop, narrow-screen, and keyboard browser checks.

Prepare this specification on `feat/customer-reviews` from `sdd-existing-project`. The original specification invocation prepared documents only; the user subsequently authorized implementation.

## Behavior and data contract

- Phase 6: define exactly three editorial sample reviews in local TypeScript source. Each entry contains a nonempty fictional agent name and nonempty review text. Keep a stable display order matching the collection order. No database table or migration is needed.
- Phase 7: serve `GET /reviews` with HTTP 200, a descriptive page title, one primary heading, and all three reviews inside the existing shared layout. Associate each review's text clearly with its agent name using semantic HTML.
- Clearly and visibly label the page content as fictional sample reviews. Use warm, playful clinic language, with no suggestion that these are real testimonials or submitted feedback.
- Add a `Reviews` link to the shared main navigation on every page using that layout. Mark it with `aria-current="page"` on `/reviews`, following the existing section pattern.
- Render names and text through escaped JSX text children. Treat them as plain text, never raw HTML.
- Phase 8: visitors can discover, open, and read the page using keyboard navigation and at desktop and narrow widths. Focus remains visible; text wraps without clipping or horizontal page overflow. The page works with JavaScript disabled.
- Preserve existing agents, ailments, therapies, appointments, dashboard, and feedback behavior.

## Implementation defaults and assumptions

Use `src/reviews.ts` for the typed collection and a focused JSX component for review presentation. Extend the route registration in `src/app.tsx` and section/navigation definitions in `src/components/Header.tsx`. Prefer existing Pico and application styles; add CSS only if presentation checks reveal a need. Keep dependencies unchanged.

Final fictional names and wording are implementation choices. Use short, readable entries consistent with the clinic premise; no arbitrary runtime length limits or content-editing interface are required. The fixed collection is always populated, so no loading, empty-state, submission validation, or storage-failure flow is introduced. Existing application error handling remains applicable.

## Exclusions

No ratings, review submission, moderation, authentication, database changes, external services, or production operations. The About page and illustrative map remain subsequent roadmap work. Do not mark phases 6–8 complete until their implementation acceptance evidence exists.
