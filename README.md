# CS Design Workflow

A learning management platform for teaching AI tools and workflows in education.

## Quick Start

1. **Clone and install:**
   ```bash
   git clone <repo-url> && cd csdesign_workflow
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   - `DATABASE_URL` — PostgreSQL connection string
   - `GEMINI_API_KEY` — Google AI API key
   - `RESEND_API_KEY` — Email service (optional)

3. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx scripts/seed-data.ts
   ```

4. **Run:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Script | Usage |
|--------|-------|
| `make-admin.ts` | `npx tsx scripts/make-admin.ts email@example.com` |
| `get-users.ts` | `npx tsx scripts/get-users.ts` |
| `seed-data.ts` | `npx tsx scripts/seed-data.ts` |
| `seed-courses.ts` | `npx tsx scripts/seed-courses.ts` |
| `seed-tools.ts` | `npx tsx scripts/seed-tools.ts` |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma
- **Auth:** Better Auth
- **AI:** Google Gemini API

## Deploy

Deploy on [Vercel](https://vercel.com) or any Node.js hosting platform.
