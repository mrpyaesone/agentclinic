# Database options for Vercel with good local development

Research date: 2026-10-15
Status: Research captured; database selection pending.

## Goal

Choose a database that works well with an application deployed on Vercel and provides a convenient local development workflow.

## Shortlist

Vercel hosts the application; the production database generally lives with a separate provider. Vercel Marketplace can connect providers such as Neon and Supabase and supply connection credentials.

| Option | Local development | Production on Vercel | Assessment |
| --- | --- | --- | --- |
| Neon — PostgreSQL | Run ordinary PostgreSQL locally for offline work, or use isolated Neon cloud branches. Neon Local provides a local proxy to cloud databases and requires connectivity. | Connect the Vercel application to hosted Neon. | Default candidate for a conventional relational app. Branches are useful for previews and testing. |
| Supabase — PostgreSQL plus backend services | Run the local stack through its CLI and a container runtime, including services beyond the database. | Connect the Vercel application to hosted Supabase. | Strong candidate when integrated auth, storage, and realtime are useful. Requires more local infrastructure. |
| Turso — SQLite/libSQL | Use a local database file or local development server. | Connect Vercel functions to hosted Turso. | Strong candidate when SQLite's lightweight workflow is the priority. Verify compatibility for required SQLite extensions and advanced features. |

## Preliminary recommendation

Compare **Turso and Neon first**, given the interest in SQLite:

- Choose Turso if starting the application with a local database file is the preferred workflow.
- Choose Neon with local PostgreSQL if PostgreSQL capabilities and an offline development database are priorities.
- Choose Supabase if its additional backend services replace functionality that would otherwise need separate implementation or integration.

These are preliminary assessments, not a final selection. Pricing, workload-specific performance, and application compatibility have not been evaluated.

## Constraints and implementation considerations

- A writable SQLite file inside a Vercel Function cannot serve as the durable shared production database. Function instances do not provide a shared persistent filesystem.
- Prefer the same database family locally and in production to reduce SQL and migration differences.
- Neon Local is a proxy to cloud databases, not an offline PostgreSQL server. Use local PostgreSQL when offline development is required.
- For production, locate the database near the Vercel functions and use a serverless-compatible connection strategy, such as provider-supported pooling.

## Open questions

Follow-up questions were sent during research; no answers were recorded before this document was created.

1. What matters most for local development?
   - Fully offline database with easy resets.
   - Managed development database with minimal setup.
   - SQLite locally, with a compatible hosted database.
2. What does the application need?
   - Typical relational data, accounts, and transactions.
   - Realtime subscriptions or collaborative features.
   - Simple data and low operating cost.

## Sources

Vercel documentation was queried through Context7; provider documentation was also checked directly.

- [Vercel storage overview](https://vercel.com/docs/storage)
- [Vercel Marketplace storage](https://vercel.com/docs/marketplace-storage)
- [Vercel SQLite guidance](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel)
- [Neon development workflows and branching](https://neon.com/docs/get-started-with-neon/workflow-primer)
- [Neon Local](https://neon.com/docs/local/neon-local)
- [Supabase local development](https://supabase.com/docs/guides/local-development)
- [Turso local development](https://docs.turso.tech/local-development)
