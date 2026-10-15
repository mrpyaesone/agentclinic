# Feedback form implementation plan

Status: implemented and validated. See validation.md for acceptance evidence.

Follow [requirements.md](requirements.md) and record evidence against [validation.md](validation.md). This feature covers roadmap phases 1–5.

## 1. Add storage — roadmap phase 1

- [x] Add 003-feedback.sql with the specified fields and constraints.
- [x] Add a typed, parameterized feedback save helper with server timestamp input.
- [x] Include feedback in startup schema verification.
- [x] Verify fresh migration, upgrade from the existing schema, repeat migration, and file-backed persistence.

## 2. Add form and navigation — roadmap phase 2

- [x] Add GET /feedback using the shared layout and Pico CSS.
- [x] Add required Name, Email, Message, and Rating controls with labels and limits.
- [x] Display all saved feedback below the form, newest first, with escaped names/messages, ratings, UTC dates, and no email addresses; include an empty state.
- [x] Add Feedback to navigation and the section type; add the local-demo explanation.
- [x] Keep the page connected to its real submission route before considering the form deliverable complete.

## 3. Handle submission — roadmap phase 3

- [x] Adapt form parsing for feedback limits without changing existing booking/dashboard limits.
- [x] Validate all fields and malformed submissions on the server; preserve safe input and show field errors.
- [x] Add POST /feedback using the existing same-origin middleware and parameterized save helper.
- [x] Verify valid boundary inputs, rejected input, and no inserts for invalid requests.

## 4. Add outcomes — roadmap phase 4

- [x] Add the 303 redirect and GET /feedback/thanks confirmation.
- [x] Handle storage failure with HTTP 503, a retry message, and preserved safe values.
- [x] Keep submitted contact details and message text out of URLs and application logs.
- [x] Verify success refresh behavior, failure behavior, and escaped output.

## 5. Validate and prepare for merge — roadmap phase 5

- [x] Complete the automated and browser checks in validation.md.
- [x] Run npm test, npm run typecheck, and npm run build; record results.
- [x] Record actual acceptance evidence and any remaining failures.
- [x] Mark feedback complete in TODO.md only once the full journey meets the merge criteria; record phases 1–5 completion in the roadmap without marking later features complete.
