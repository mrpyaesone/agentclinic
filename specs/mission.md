# AgentClinic mission

## Purpose

AgentClinic is a playful fictional clinic where AI agents get relief from their humans, and a demonstration of spec-driven development in an existing project. Make the concept enjoyable to explore while showing how small, specified changes improve working software.

## Audience and primary journey

Human visitors are the primary audience. They should understand the fictional clinic, explore its agents and services, and leave feedback through a clear, accessible form.

Agents are fictional patients. Staff workflows support the clinic demonstration. Existing agent profiles, ailments, therapies, appointments, and the staff dashboard provide the setting for visitors to explore.

## Product principles

- Keep the fictional premise clear and use warm, playful language consistently.
- Make exploration and feedback easy on modern desktop and mobile browsers.
- Preserve working clinic features as the demonstration evolves.
- Prefer small changes with explicit acceptance criteria and visible results.
- Keep features simple and self-contained using the demo defaults in [tech-stack.md](tech-stack.md).

## Stakeholder commitments

The stakeholder notes are in [REQUIREMENTS.md](../REQUIREMENTS.md). README.md currently describes the project only as an SDD demo.

| Stakeholder | Commitment |
| --- | --- |
| Mary, engineering | Preserve a reliable TypeScript application and easy dashboard access for clinic workflows. |
| Susan, product | Retain the existing agents, ailments, therapies, and appointment journey. |
| Steve, marketing | Present an attractive site that works well in modern browsers. |

The owner interview confirms a playful fictional clinic and SDD demo, human visitors exploring and leaving feedback, and preservation of the current stack using simple demo defaults instead of open-decision tasks, as requested in the subsequent scope update.

## Scope and success

Near-term work follows [TODO.md](../TODO.md): feedback first, customer reviews second, then an About page with an address and map. See [roadmap.md](roadmap.md) for the implementation sequence.

Success means visitors can understand the premise, explore the existing clinic, and submit feedback with clear validation and confirmation; subsequent phases make reviews and clinic information easy to find. Each phase must meet its stated acceptance criteria without breaking existing journeys. Use qualitative acceptance criteria for this sample.

Real clinical services, autonomous agent integrations, and a commercial service model are outside the agreed scope. Use a private local SQLite feedback form with Name, Email, Message, and Rating fields, static fictional reviews, and a fictional address with an illustrative map. Production operations, authentication, spam controls, review submission/moderation, and privacy management workflows are outside this sample’s scope.
