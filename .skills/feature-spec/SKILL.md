---
name: feature-spec
description: Prepare the next roadmap feature with a grouped user interview, a feature branch, and requirements.md, plan.md, and validation.md. Use when asked to spec the next phase or prepare a feature specification before implementation.
---

# Feature Spec

Prepare a feature specification for this repository. This workflow creates specifications, not application code.

## Read before asking

Read `specs/roadmap.md`, `specs/mission.md`, and `specs/tech-stack.md`. Check existing feature directories, relevant implementation, repository instructions, Git status, and the current branch.

Identify the first incomplete roadmap phase. Check existing specs and code so completed work is not proposed again. Summarize the candidate scope and any conflict with the constitution. If the roadmap is finished or the next phase is ambiguous, resolve that in the interview rather than inventing a feature.

## Required interview before writes

**Before any filesystem writes or Git mutations, use a structured question tool to ask one grouped interview about all three documents:**

1. **Requirements:** Confirm the feature scope, context, user-facing behavior, and decisions. Offer the next small phase as the default and let the user select the entire feature when several phases belong together. Ask about material gaps discovered in the code or constitution.
2. **Plan:** Confirm the proposed numbered task groups, implementation approach, and important defaults, following the existing stack.
3. **Validation:** Confirm observable success criteria and the checks needed to merge: relevant automated tests, migration/data checks, browser checks, and existing project commands as applicable.

Use `AskUserQuestion` where available. In Codex, use `request_user_input` when available in the current mode, or `request_user_input_async` for the equivalent grouped interview. Ask all three together; questions should be grounded in the inspected project. Do not substitute plain chat questions for this required tool call.

Wait for answers before creating files, making or switching branches, staging, or committing. An asynchronous tool's acknowledgement is not an answer. If the tool is unavailable, explain the blocker and stop before writes. Do not infer answers from elapsed time. Already provided answers may supply context, but still perform the required grouped interview for this invocation. Ask follow-up questions only for unresolved details that materially affect the spec; document routine implementation defaults as assumptions.

## Create the branch and feature documents

After the interview:

- Determine the feature scope from the answers; it may cover one phase or a specified group of phases. Explicit user choices take precedence over previous defaults.
- Create a new branch such as `feat/<feature-name>` from the current intended development branch, following repository conventions. Never assume the base is `main`. Preserve unrelated working changes; do not reset or overwrite them. If changes prevent switching safely, resolve that before proceeding.
- Create `specs/YYYY-MM-DD-feature-name/` using the current date in the user's timezone and a short lowercase hyphenated feature name. Do not reuse an unrelated spec or overwrite an existing folder; update an existing matching spec only when the user has chosen to continue it.
- Write the three files below with relative links to the constitution and each other where useful.

### requirements.md

Record the feature's purpose, audience, roadmap phase(s), scope, relevant existing behavior, user decisions, explicit assumptions, behavior and data contracts, and exclusions. Distinguish user decisions from implementation defaults. Include validation rules and error behavior where relevant. Keep the specification concrete and proportionate to the feature.

### plan.md

Use numbered task-group headings, with small actionable unchecked tasks under each group. Order dependencies clearly and map groups to roadmap phases when useful. Include implementation and appropriate verification tasks. Mark the work planned; do not mark implementation complete while only creating specs.

### validation.md

Define observable acceptance criteria, meaningful automated and manual checks, relevant project commands, regression checks, and merge gates. Include space for actual evidence and clearly mark checks not yet run. Never claim tests or browser checks passed without running them. Documentation validation does not count as feature implementation validation.

If the interview changes a constitution default or roadmap scope, synchronize the affected spec documents so they do not contradict the feature requirements. Preserve unrelated roadmap work and do not mark planned phases complete.

## Review and handoff

Check that requirements, task groups, and merge criteria agree; links and filenames resolve; and Git changes include only the intended spec work. Validate documentation formatting as appropriate. Report the branch, links to the three files, and material assumptions.

Stop after preparing the specs. Implementing the feature, committing, pushing, merging, and deleting branches require a separate user request unless explicitly included in this invocation.
