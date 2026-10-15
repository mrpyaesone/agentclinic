# Customer reviews plan

Status: planned; all implementation tasks remain unchecked.

Implement the [requirements](requirements.md) in the existing stack described by the [technical constitution](../tech-stack.md). The [validation document](validation.md) defines merge gates for [roadmap phases 6–8](../roadmap.md).

## 1. Define sample review content — phase 6

- [ ] Add `src/reviews.ts` with a typed collection of three fictional agent names and short, playful review texts in stable display order.
- [ ] Keep all content local and static, with no database or dependency changes.
- [ ] Add a focused content-contract check for three populated name/text pairs; avoid assertions tied to exact editorial wording.

## 2. Display reviews and add navigation — phase 7

- [ ] Add a focused review presentation component using semantic markup and escaped JSX text children.
- [ ] Register `GET /reviews` in `src/app.tsx` with the shared layout, a descriptive title, a primary heading, and a visible fictional-sample label.
- [ ] Extend the header section type and shared navigation with `Reviews` and correct active-page semantics.
- [ ] Use existing styling; make only necessary responsive or focus styling adjustments.

## 3. Verify and record acceptance — phase 8

- [ ] Add meaningful route/rendering checks for status, page identity, fictional labeling, all review names/texts in order, shared layout, and active navigation.
- [ ] Exercise the review component with markup-like name and text values and confirm safe escaping.
- [ ] Verify the shared Reviews link on existing pages and retain coverage for the existing clinic and feedback journeys.
- [ ] Run `npm test`, `npm run typecheck`, and `npm run build`.
- [ ] Complete the desktop, narrow-screen, JavaScript-disabled, and keyboard browser checks in [validation.md](validation.md).
- [ ] Record actual results and resolve failures before marking phases 6–8 complete in the roadmap and moving customer reviews to Done in `TODO.md`.
- [ ] Keep the constitution documents aligned with the implemented sample scope, updating completion wording only where needed. Leave About work pending.
