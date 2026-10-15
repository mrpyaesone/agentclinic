# Feedback form requirements

## Context and scope

Status: implemented and validated; see [validation.md](validation.md) for evidence.

This feature delivers phases 1–5 of [the roadmap](../roadmap.md), supporting [the mission](../mission.md): human visitors explore a playful fictional clinic and leave feedback. Preserve the existing stack and server-rendered patterns in [the technical constitution](../tech-stack.md).

The owner selected the entire feedback feature and requested Name (text), Email (text), Message (textarea), and Rating (1–5). These choices supersede the original message-only, no-contact-fields default. The owner subsequently requested that all feedback appear publicly on the feedback form page; the public list excludes email addresses. The owner also selected migration, persistence, safe SQL input, and existing project checks as merge criteria.

## Field decisions

All four fields are required as a simple implementation default. Text fields reject embedded NUL characters because SQLite text length checks stop at NUL. Limits and timestamp format below are implementation decisions, not additional owner interview answers.

| Field | Control | Server rules |
| --- | --- | --- |
| Name | Text input | Trim outer whitespace; require 1–100 JavaScript string code units. |
| Email | Text input with email input mode | Trim outer whitespace; require at most 254 code units and a non-whitespace local part and domain separated by one @, with a dot in the domain. Preserve case; no delivery verification. |
| Message | Textarea | Trim outer whitespace; require 1–2,000 code units; preserve internal whitespace and line breaks. |
| Rating | Select with an empty prompt and options 1–5 | Require exactly one of the strings 1, 2, 3, 4, 5; persist as an integer. |

## Visitor behavior

- GET /feedback renders the form in the shared layout; main navigation includes Feedback with the correct active state.
- POST /feedback accepts URL-encoded fields named name, email, message, and rating.
- Reject duplicate fields, unsupported fields, unsupported content types, and oversized requests without inserting a row. Allow up to 32 KiB of encoded request body so valid Unicode and percent-encoded messages fit.
- Invalid field values return HTTP 422 with clear field errors and safely preserved entered values. Unsupported content type returns 415; oversized body returns 413. Duplicate or unexpected fields return 422.
- Retain the existing same-origin protection: blocked submissions return 403 without saving.
- Each valid POST saves one row, then returns a 303 redirect to GET /feedback/thanks. The confirmation includes links back to the site and the public feedback list; refreshing it does not repeat the POST. This does not promise deduplication of separate POST requests.
- Storage failure returns 503 with a generic retry message and safely preserved values, without exposing database details or reporting success.
- Form labels, required indicators, field errors, focus visibility, and navigation must work by keyboard and at narrow widths. Use playful but clear copy.

## Storage and integration

Add src/migrations/003-feedback.sql with a feedback table: generated integer primary key, name TEXT NOT NULL, email TEXT NOT NULL, message TEXT NOT NULL, rating INTEGER NOT NULL constrained to integer values 1–5, and created_at INTEGER NOT NULL containing UTC Unix milliseconds. Enforce non-empty trimmed text and the specified text length limits in the schema as a backstop; the application validation remains authoritative for JavaScript string length and email format.

Use a parameterized TypeScript save helper and the existing database connection. Generate the timestamp on the server; make it controllable in tests using the existing clock pattern. Include feedback in startup schema checks. New migration history must preserve existing clinic data and feedback on repeated runs. No new seed feedback is required.

Keep submissions in local SQLite. Display all names, messages, ratings, and UTC submission dates below the form on GET /feedback and form error responses, ordered by created_at DESC then id DESC. Render stored content as escaped text and preserve message line breaks. Show a friendly empty state when no feedback exists. Keep email addresses out of the public list, and keep submitted values out of URLs and application logs. Explain on the form that this is demo feedback stored locally and visitors should use sample contact details. No email is sent.

The existing readForm helper limits each value to 100 characters and the body to 4,096 bytes. Introduce configurable limits or a feedback-specific parser while preserving the existing limits and behavior for booking/dashboard forms.

## Exclusions

No staff feedback viewer, customer review feature, authentication, spam controls, email delivery, privacy management workflow, production deployment, or external service. Existing reviews and About roadmap phases remain separate.
