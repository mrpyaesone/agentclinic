# Feedback form implementation plan

Status: planned; unchecked tasks are not implementation evidence.

Follow [requirements.md](requirements.md) and record evidence against [validation.md](validation.md). This feature covers roadmap phases 1–5.

## 1. Add storage — roadmap phase 1

- [ ] Add 003-feedback.sql with the specified fields and constraints.
- [ ] Add a typed, parameterized feedback save helper with server timestamp input.
- [ ] Include feedback in startup schema verification.
- [ ] Verify fresh migration, upgrade from the existing schema, repeat migration, and file-backed persistence.

## 2. Add form and navigation — roadmap phase 2

- [ ] Add GET /feedback using the shared layout and Pico CSS.
- [ ] Add required Name, Email, Message, and Rating controls with labels and limits.
- [ ] Add Feedback to navigation and the section type; add the local-demo explanation.
- [ ] Keep the page connected to its real submission route before considering the form deliverable complete.

## 3. Handle submission — roadmap phase 3

- [ ] Adapt form parsing for feedback limits without changing existing booking/dashboard limits.
- [ ] Validate all fields and malformed submissions on the server; preserve safe input and show field errors.
- [ ] Add POST /feedback using the existing same-origin middleware and parameterized save helper.
- [ ] Verify valid boundary inputs, rejected input, and no inserts for invalid requests.

## 4. Add outcomes — roadmap phase 4

- [ ] Add the 303 redirect and GET /feedback/thanks confirmation.
- [ ] Handle storage failure with HTTP 503, a retry message, and preserved safe values.
- [ ] Keep submitted contact details and message text out of URLs and application logs.
- [ ] Verify success refresh behavior, failure behavior, and escaped output.

## 5. Validate and prepare for merge — roadmap phase 5

- [ ] Complete the automated and browser checks in validation.md.
- [ ] Run npm test, npm run typecheck, and npm run build; record results.
- [ ] Record actual acceptance evidence and any remaining failures.
- [ ] Mark feedback complete in TODO.md only once the full journey meets the merge criteria; record phases 1–5 completion in the roadmap without marking later features complete.
