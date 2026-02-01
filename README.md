# Expense Tracker (KES)

A production-ready expense tracker for Kenyan users (KES), with full authentication and strict **user isolation**: every record (Expense, Category, Salary) is linked to a `userId`, and server sessions ensure users only see and edit their own data.

## Tech Stack

- **Next.js 14+** (App Router), **Tailwind CSS**, **Shadcn-style UI** (Radix + Tailwind)
- **Auth:** NextAuth.js with Google Provider (database sessions via Prisma)
- **DB/ORM:** Prisma with PostgreSQL (Neon or Supabase)

## Features

- **Google Login** – Sign in with Google; new users get default categories automatically.
- **Salary & Budget** – Set monthly net salary per month/year.
- **Expense Logging** – Amount (KES), Category, Date, Type (Fixed vs Variable), optional note.
- **Default Categories** – Food/Lunch, Transport, Personal Effects, Savings/MMF (Etica), Rent, Utilities.
- **Monthly Analytics** – Salary − Expenses = Remaining; Savings Rate (Savings ÷ Salary × 100); filter by month/year.

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` – PostgreSQL connection string (pooled for Neon).
   - `DIRECT_URL` – Direct connection (required by Prisma for migrations on Neon).
   - `NEXTAUTH_URL` – e.g. `http://localhost:3000`.
   - `NEXTAUTH_SECRET` – e.g. `openssl rand -base64 32`.
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from Google Cloud Console.

3. **Database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), sign in with Google, and use the dashboard.

## File Structure

- `app/api/auth/[...nextauth]/route.ts` – NextAuth config (Google, Prisma adapter, session callback, default categories on sign-up).
- `app/api/expenses/route.ts` – GET (filter by user + optional month/year), POST (create, user-isolated).
- `app/api/expenses/[id]/route.ts` – PATCH, DELETE (user-isolated).
- `app/api/categories/route.ts` – GET (user’s categories).
- `app/api/salary/route.ts` – GET/PUT (user’s monthly salary).
- `app/api/analytics/route.ts` – Monthly summary (salary, expenses, remaining, savings rate).
- `prisma/schema.prisma` – User, Account, Session, VerificationToken (NextAuth), Category, Expense, Salary (all with `userId`).
- `components/auth-button.tsx` – Login / Logout toggle.
- `lib/formatters.ts` – KES currency and date formatting.

## User Isolation

- All API routes use `getServerSession(authOptions)` and reject unauthenticated requests.
- Queries and mutations always filter or set `userId` to `session.user.id`.
- Categories and expenses are created only for the current user; salary is keyed by `userId` + month + year.

## License

MIT
