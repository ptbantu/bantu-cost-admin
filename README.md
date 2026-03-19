# Bantu Cost Admin

Internal admin dashboard for Bantu — manages costs, vendors, staff, products, and CRM operations.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui

## Getting Started

**Prerequisites:** Node.js 18+, access to the Supabase project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables — copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — Supabase PostgreSQL connection string
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

## Modules

| Module | Path | Status |
|--------|------|--------|
| 供应商管理 | `/system/vendors` | ✅ Live |
| 员工管理 | `/system/staff` | ✅ Live |
| 产品/服务管理 | `/system/products/services` | ✅ Live |
| 价格管理 | `/system/products/pricing` | ✅ Live |
| 账单管理 | `/cost/billing` | 🚧 In progress |
| 对账管理 | `/cost/reconciliation` | 🚧 In progress |
| 派单引擎 | `/system/dispatch` | 🚧 In progress |

## Database Migrations

This project uses `prisma db execute` for schema changes against the existing Supabase database (migration history drift). Do not use `prisma migrate dev` without checking for drift first.
