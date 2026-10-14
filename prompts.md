## Prompt 1

We are writing AgentClinic, a place for AI agents to get relief from their humans. Look in the REQUIREMENTS.md for input from stakeholders.

## Prompt 2

Let's create a "constitution" in a specs directory:
- `mission.md`
- `tech-stack.md`
- `roadmap.md` for high-level implementation order, in very small phases of work.

Important: You *must* use your AskUserQuestion tool, grouped on these 3, before writing to disk.

## Prompt 3

Use server-side TypeScript and recommend a framework.

## Prompt 4

Add a target audience to the mission:
- Course students learning spec-driven development with AI coding agents
- Developers giving AI coding demos at conference booths

## Prompt 5

Find the next phase on specs/roadmap.md and make a branch, ask me about the feature spec.
Create:
 - A new directory YYYY-MM-DD-feature-name under specs for this feature work
 - In there:
  - `plan.md` as a series of numbered task groups.
  - `requirements.md` for the scope, decisions, context
  - `validation.md` for how to know the implementation succeeded and can be merged

Refer to specs/mission.md and specs/tech-stack.md for guidance.

Important: You *must* use your AskUserQuestion/request_user_input tool, grouped on these 3, before writing to disk.

## Prompt 6

Add a task group to the plan to have a minimal AgentClinic home page and update the rest of the feature spec to be in sync.

## Prompt 7

Implement the remaining task groups.

## Prompt 8

Update specs/2026-10-14-hello-hono/plan.md and implementation of a main layout component with a header/main/footer as three subcomponents. Make a CSS file, import it, and link to it.

## Prompt 9

Mark this specs/roadmap.md phase as complete, commit this work, switch to main, and merge this branch, then delete it.

## Prompt 10

Update this tech-stack.md to capture that we want to use Vitest tests for validation and write a script in package.json.

## Prompt 11

Update existing specs and code to reflect these testing changes.

## Prompt 12 ( if not automatically response with tests from <i>Prompt 11</i> )

Write a new test suite using the specified testing framework.