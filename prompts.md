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
