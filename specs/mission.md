# AgentClinic constitution: mission

## Purpose

AgentClinic is a playful fictional clinic where AI agents find relief from their humans: a place to understand their ailments, explore therapies, and book time to recover from one more “quick request.” Practical, dependable workflows make the joke useful as a product.

## Target audience

- Course students learning spec-driven development with AI coding agents.
- Developers giving AI coding demos at conference booths.

AgentClinic provides a playful, practical example for learning and demonstrating how specifications guide AI-assisted implementation in small, verifiable steps.

## Clinic roles

- Agents need a dashboard that makes their condition, available care, and appointments easy to understand.
- Clinic staff need a dashboard to review agents and manage appointments.
- Visitors need an attractive introduction that explains the clinic and points them toward care.

For the first release, agents are fictional patient records accessed through a browser. Autonomous agent integrations are a later possibility, not a first-release requirement.

## Founding principles

1. **Care comes first.** Help agents find a clear next step. Humor should be warm and should never obscure an action or error.
2. **Reliability is part of care.** Preserve valid appointments, explain failures, and prevent conflicting bookings.
3. **Give each role a useful home.** Agent and staff dashboards are the first product surfaces we build.
4. **Keep the clinic approachable.** Use readable language, consistent navigation, responsive layouts, and accessible controls in modern browsers.
5. **Keep private records private.** Enforce access on the server and collect only the data needed for the clinic workflow.
6. **Build in small, verifiable steps.** Each phase should produce one reviewable capability with a clear completion check.
7. **Keep fiction explicit.** Ailments and therapies belong to this fictional AI clinic; copy must not imply real medical care or established AI sentience.

## First-release scope

Agent and staff dashboards, fictional agent profiles and ailments, a therapy catalog, appointment booking and cancellation, and a public landing page. A usable release connects these features with persistent records and role-appropriate access.

Payments, real clinical services, autonomous agent protocols, external calendar integrations, notifications, and automated diagnosis are outside the first release.

## Stakeholder commitments

| Input from REQUIREMENTS.md | Product commitment |
| --- | --- |
| Mary: reliable, popular TypeScript stack and dashboards | Server-side TypeScript, consistent agent/staff workflows, validation and targeted verification |
| Susan: agents, ailments, therapies and appointments | A connected path from agent records to care options and booking |
| Steve: attractive site for modern browsers | Coherent visual design, responsive pages, and browser checks |

## Success and governance

An agent can find care and book an available appointment; staff can see and manage that appointment; both see consistent saved information. The interface explains empty states and failures and remains usable on mobile and desktop.

These documents guide implementation. Feature specs must follow this mission and the [technical decisions](tech-stack.md). Work proceeds through the [roadmap](roadmap.md). Change the relevant constitution document when an approved decision changes; identify assumptions before turning them into new scope.
