# Revlik

A personal sales pipeline tracker and forecast tool. Log deals, move them through
stages, and see a weighted revenue forecast by month.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM — SQLite locally, swap to Postgres for deployment
- Single-user password login (no accounts/roles — this is a personal tool)

## Local development

1. Copy `.env` and set your own `APP_PASSWORD` and a long random `SESSION_SECRET`.
   For the chat assistant, add an `ANTHROPIC_API_KEY` from
   [console.anthropic.com](https://console.anthropic.com) (Settings → API Keys) —
   optional, the rest of the app works without it.
2. Install dependencies and set up the database:

   ```bash
   npm install
   npx prisma migrate dev --name init
   npm run db:seed   # optional: adds a few example deals
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) and sign in with your
   `APP_PASSWORD`.

## How it works

- **Pipeline** (`/pipeline`) — a kanban board of deals by stage. Change a deal's
  stage right from its card, or click into it to edit value, probability, close
  date, and notes.
- **Forecast** (`/forecast`) — weighted pipeline value (deal value × win
  probability), a 6-month forecast by expected close date, win rate, and a
  stage-by-stage breakdown.
- Each stage has a default win probability (Lead 10%, Qualified 25%, Proposal
  50%, Negotiation 75%, Closed Won 100%, Closed Lost 0%) that you can override
  per deal.
- **Assistant** (chat bubble, bottom-right, any page) — update deals in plain
  language: "move Acme to negotiation", "bump Globex to $70k", "Umbrella closed
  lost". It looks up the right deal by name and asks for clarification if a
  name is ambiguous. Requires `ANTHROPIC_API_KEY` in `.env` (see below) —
  without it the chat button still opens but shows a setup message instead of
  a reply.

## Deploying so you can reach it from anywhere

The SQLite file used for local dev won't persist on most serverless hosts, so
for deployment switch to a hosted Postgres database:

1. Create a free Postgres database (e.g. [Neon](https://neon.tech) or
   [Supabase](https://supabase.com)) and copy its connection string.
2. In `prisma/schema.prisma`, change the datasource provider:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Push the schema to that database: `npx prisma migrate deploy` (run once
   locally with `DATABASE_URL` pointed at the hosted database, or as a build
   step on your host).
4. Deploy to [Vercel](https://vercel.com) (or any Node host). Set these
   environment variables in the hosting dashboard:
   - `DATABASE_URL` — your hosted Postgres connection string
   - `APP_PASSWORD` — the password you'll sign in with
   - `SESSION_SECRET` — a long random string (`openssl rand -hex 32`)
   - `ANTHROPIC_API_KEY` — optional, enables the chat assistant

That's it — no other config needed. The app is a single Next.js deployment.
