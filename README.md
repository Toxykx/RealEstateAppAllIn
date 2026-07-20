# Horizon Realty

Real estate management platform connecting agents and clients — public catalog for guests,
role-based dashboards for Clients, Agents, and Managers. Built with Next.js (App Router),
Prisma/PostgreSQL (Supabase), NextAuth v5, and Supabase Storage.

See `.claude/plans` (or ask) for the full technical plan covering architecture, database schema,
and roles/permissions.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is enough for
   this MVP).
2. **Copy `.env.example` to `.env`** and fill in:
   - `DATABASE_URL` — Project Settings → Database → Connection string (direct connection, port 5432)
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` —
     Project Settings → API
   - `AUTH_SECRET` — generate with `npx auth secret`
3. **Create two storage buckets** in the Supabase dashboard (Storage tab):
   - `property-images` — public
   - `property-documents` — private
4. **Run migrations and seed demo data:**
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```
5. **Start the dev server:**
   ```bash
   npm run dev
   ```

## Demo accounts (after seeding)

All demo accounts share the password `Passw0rd!`.

| Role    | Email                        |
|---------|-------------------------------|
| Manager | manager@horizonrealty.demo    |
| Agent   | agent1@horizonrealty.demo     |
| Agent   | agent2@horizonrealty.demo     |
| Client  | client1@example.com           |
| Client  | client2@example.com           |
| Client  | client3@example.com           |

## Project structure

- `src/app/(public)` routes (`/`, `/properties`, `/contact`) — guest catalog, no auth required
- `src/app/client` — Client dashboard (My Properties, Search, Updates, Profile), bottom nav on mobile
- `src/app/agent` — Agent dashboard (Clients, Properties, uploads, timeline, status)
- `src/app/manager` — Manager dashboard (Agents, Inquiries; reuses `/agent/*` for full-access
  client/property views)
- `src/lib/actions` — server actions (mutations)
- `src/lib/authz.ts` — session + per-request data scoping helpers
- `prisma/schema.prisma` — database schema
