# AgentClinic constitution: technical direction

## Framework recommendation

Use **Next.js with the App Router and strict TypeScript**, running on Node.js. It provides one application for server-rendered dashboards, browser interactions, and server-side application logic. This fits Mary's request for a popular TypeScript stack and the decision to use server-side TypeScript without requiring a separate API service for the first release.

Next.js supports [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [server functions for mutations](https://nextjs.org/docs/app/getting-started/mutating-data), and [TypeScript Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers). Use those features deliberately rather than making every page a client application.

## Proposed supporting choices

These are implementation defaults, not additional stakeholder requirements.

| Concern | Decision | Purpose |
| --- | --- | --- |
| Runtime and language | Supported Node.js LTS compatible with the selected Next.js release; strict TypeScript | Maintainable server and browser code |
| UI | React within Next.js; Tailwind CSS | Shared, responsive dashboard and landing-page styling |
| Persistence | PostgreSQL with Prisma and versioned migrations | Relational agent, therapy, and appointment records |
| Validation | Zod at server input boundaries | Explicit validation and useful field errors |
| Authentication | Maintained Next.js-compatible authentication library/provider, selected in its implementation phase | Session identity with agent and staff roles |
| Verification | Type checking, ESLint, focused unit/integration tests, and Playwright for core browser flows | Verify reliability and user-visible behavior |
| Delivery | One Node.js application and a managed PostgreSQL database | Simple initial deployment and operations |

Choose compatible stable versions during setup, record them in the lockfile, and document runtime requirements. The existing minimal package manifest is a scaffold, not evidence that a working application or compatible framework dependencies already exist.

## Architecture rules

- Render pages and read data on the server by default. Use Client Components for interactions that require browser state.
- Put business rules in server-side services shared by pages and mutations. Server Components should call these services directly; they do not need an HTTP round trip to the same application.
- Use server actions for application form submissions. Introduce Route Handlers when an actual HTTP consumer needs them.
- Keep database access and secrets in server-only modules. Validate input and enforce authorization for every protected read and mutation.
- Start dashboard previews with deterministic fictional fixtures behind a data-access boundary. Replace fixtures with persistence before calling the booking workflow complete.
- Store appointment instants consistently and display an explicit time zone. Make booking conflicts impossible through database constraints and atomic operations, not only UI checks.
- Use schema migrations and reproducible development seed data. Production configuration belongs in environment variables, with a checked-in example containing no secrets.
- Keep the first release in one repository and one application. Introduce additional services only for a demonstrated requirement.

## Quality floor

Every increment must type-check, pass applicable lint/build checks, and include checks appropriate to its behavior. Focus automated tests on authorization, validation, booking conflicts, persistence, and the principal browser journeys.

Use semantic HTML, labels, keyboard navigation, visible focus, readable contrast, and explicit loading, empty, and error states. Check responsive layouts in current Chrome, Firefox, and Safari before release.

Authentication provider, deployment provider, and concrete scheduling rules remain implementation decisions. Resolve them in the relevant small phase and record them in its feature spec before implementation.
