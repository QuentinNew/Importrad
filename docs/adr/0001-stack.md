# ADR 0001 — Application Stack

**Status:** Accepted

## Context

Mobile-first flashcard app with Google auth, CSV import, and AI follow-up prompts. Constraint: free-tier hosting throughout.

## Decision

| Layer     | Choice |
|-----------|---|
| Frontend  | Angular (SPA), hosted on Render (static site) |
| Backend   | NestJS (REST API), hosted on Render (web service) |
| Database  | Supabase (managed Postgres) |
| ORM       | Prisma |
| Auth      | Google OAuth via a NestJS auth module (Passport) |

## Rationale

- **Angular + NestJS**: shared architectural philosophy (modules, DI, decorators); user already familiar with Angular.
- **Render**: single platform for both static frontend and Node backend; genuinely free long-term (accepts cold starts on free tier).
- **Supabase**: best free managed Postgres available (500MB); connects via standard connection string — NestJS/Prisma don't use the Supabase client SDK.
- **Prisma**: schema-first, TypeScript-native, clean migration workflow; preferred over TypeORM for its DX and type safety.
- **AI provider abstracted**: provider evaluation deferred; stubbing the interface now means zero refactor when the choice is made.

## Trade-offs

- Render free tier spins down after 15 min inactivity → cold starts ~30s. Acceptable for personal/learning use; can mitigate with an uptime ping if needed.
- Supabase RLS is not used (NestJS owns all data access) — user isolation is enforced at the API layer instead.
