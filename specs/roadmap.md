# AgentClinic roadmap

## Ordering and delivery rules

Follow [TODO.md](../TODO.md): **Done — feedback form; Now — customer reviews; Next — About us with address and map.** Existing agents, ailments, therapies, booking, and dashboard features are the baseline; they do not need rebuilding.

Use the simple demo defaults in [tech-stack.md](tech-stack.md). Each numbered phase is a small, independently reviewable change. Complete its acceptance criteria before proceeding. There are no open-decision or production-readiness tasks. Completion status is recorded per feature below.

## Done: feedback form

Phases 1–5 are complete. See [the feedback feature plan](2026-10-15-feedback-form/plan.md) and [validation evidence](2026-10-15-feedback-form/validation.md).

| Phase | Work | Done when |
| --- | --- | --- |
| 1 | Add feedback storage. | A migration creates a table for name, email, message, rating, and submission timestamp; a parameterized insert can save sample feedback. |
| 2 | Add the feedback page and navigation entry. | Visitors can find required Name, Email, Message (2,000-character limit), and Rating (1–5) fields; unfinished submission is not presented as operational. |
| 3 | Implement submission and validation. | The server validates all four fields, rejects invalid input with field errors, preserves safe input on validation failure, and stores valid feedback in SQLite and displays all submissions on the feedback page with email addresses excluded. |
| 4 | Add submission outcomes. | Success shows confirmation; storage failure shows a useful retry message without exposing internal details. |
| 5 | Verify the feedback journey. | Meaningful checks cover persistence, validation, and failures; keyboard and narrow-screen checks pass and existing journeys still work. |

## Now: customer reviews

| Phase | Work | Done when |
| --- | --- | --- |
| 6 | Add sample review content. | A small static collection contains fictional agent names and review text, without a new database table. |
| 7 | Display reviews and add navigation. | Visitors can find and read reviews in the shared layout, clearly labeled as fictional samples. |
| 8 | Verify review presentation. | Content renders safely and reads well on desktop and narrow screens; navigation works by keyboard. |

## Next: About us with address and map

| Phase | Work | Done when |
| --- | --- | --- |
| 9 | Add the About page and navigation entry. | Visitors can read the playful clinic story and “42 Context Lane, Promptville,” clearly presented as a fictional address. |
| 10 | Add an illustrative map. | A locally rendered static map identifies the fictional clinic, includes a text description, and needs no external service or API key. |
| 11 | Verify the About journey. | The story, address, and map are discoverable and readable on desktop and narrow screens, with keyboard-accessible navigation. |

## Completion discipline

For each implemented phase, record acceptance evidence in the change description or feature specification. Run verification appropriate to the change; code changes should pass tests, typechecking, and build. Update TODO.md as features actually finish. Keep all three constitution documents aligned with the sample scope and existing stack.
