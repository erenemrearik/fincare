<div align="center">

<picture>
  <source srcset="public/logos/logo-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="public/logos/logo-light.png" media="(prefers-color-scheme: light)">
  <img src="public/logos/logo-light.png" alt="Fincare" width="220">
</picture>

### Personal finance tracking with AI-powered insights

**English** · [Türkçe](README.tr.md)

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

Fincare is a web app for tracking personal income and expenses. You record transactions in your own categories, follow recurring bills and subscriptions, set savings goals, and get daily and monthly reports with charts and PDF/CSV export. On the reports page, an assistant built on Google Gemini reviews your spending and suggests where to save.

> [!NOTE]
> Fincare started as a university graduation project and is now being developed further into a product. The user interface is currently in **Turkish**; English support is on the [roadmap](#roadmap).

<picture>
  <source srcset="docs/screenshots/dashboard-dark.png" media="(prefers-color-scheme: dark)">
  <img src="docs/screenshots/dashboard.png" alt="Fincare dashboard">
</picture>

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Roadmap](#roadmap)
- [License](#license)

## Features

| | Feature | What it does |
|---|---|---|
| 📝 | **Income & expense tracking** | Add transactions with an amount, date, description and an emoji category you create yourself. |
| 📊 | **Dashboard** | Income, expense and balance cards, category breakdowns and a pie chart for any date range up to 90 days. |
| 📈 | **History** | Monthly and yearly bar charts of income against expenses. |
| 🔎 | **Transactions table** | Sort and filter by category and type, choose columns, export to CSV. |
| 🔁 | **Bills & subscriptions** | Weekly, monthly or yearly recurring items, with upcoming and overdue views. |
| 🎯 | **Goals** | Monthly, yearly and savings goals; update your progress and see how far you are from the target. |
| 🧾 | **Reports** | Daily and monthly reports with bar, line and pie charts; export to PDF (charts included) or CSV. |
| 🤖 | **AI insights** | Gemini analyses the report period and suggests where to save. If the AI service is unavailable, rule-based insights are shown instead. |
| 💱 | **Currency setting** | Choose USD, EUR, GBP, JPY, INR or TRY in the setup wizard; change it later in Settings. |
| 🌗 | **Light & dark themes** | Switch between light, dark and system themes. |
| 🔐 | **Authentication** | Sign-up, sign-in and sessions handled by Clerk. |

## Screenshots

| Landing page | Transactions |
|---|---|
| ![Landing page](docs/screenshots/home-page.png) | ![Transactions](docs/screenshots/transaction.png) |
| **Bills & subscriptions** | **Goals** |
| ![Bills](docs/screenshots/bills.png) | ![Goals](docs/screenshots/goals-1.png) |
| **Reports** | **Categories & settings** |
| ![Reports](docs/screenshots/reports.png) | ![Manage](docs/screenshots/manage.png) |

More screenshots, including the dark theme, are in [`docs/screenshots`](docs/screenshots). There is also a [sample monthly PDF report](docs/samples/monthly-report-sample.pdf).

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router), [React 18](https://react.dev/), TypeScript |
| UI | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) on [Radix UI](https://www.radix-ui.com/), [Lucide](https://lucide.dev/) icons, [Emoji Mart](https://github.com/missive/emoji-mart) |
| Charts | [Recharts](https://recharts.org/) |
| Forms & validation | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| Data | [Prisma ORM](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/) |
| Auth | [Clerk](https://clerk.com/) |
| AI | [Google Gemini](https://ai.google.dev/) (`@google/generative-ai`) |
| Export | [pdfmake](http://pdfmake.org/), [html2canvas](https://html2canvas.hertzen.com/), [export-to-csv](https://github.com/alexcaza/export-to-csv) |

## Architecture

```mermaid
flowchart LR
    U[Browser] -->|pages| SC[Server Components<br/>app/**/page.tsx]
    U -->|fetch| RH[Route handlers<br/>app/api/*]
    U -->|Server Actions| SA[Actions<br/>app/**/_actions]
    MW[Clerk middleware] -.->|protects /dashboard| SC
    SC --> P[(Prisma Client)]
    RH --> P
    SA --> P
    P --> DB[(PostgreSQL)]
    RH -->|AI insights| G[Google Gemini API]
```

- **Reads** go through route handlers under `app/api` (stats, history, categories, recurring items, AI insights) and through Server Components.
- **Writes** go through Server Actions (transactions, categories, goals, currency) and the `recurring-transactions` route handler.
- **Aggregates**: each transaction also updates the daily (`MonthHistory`) and monthly (`YearHistory`) summary tables in the same database transaction, so history charts don't scan the full transaction list.
- **Auth**: Clerk middleware protects `/dashboard`, and every handler and action checks the signed-in user and filters by `userId`.

## Data model

PostgreSQL, managed with Prisma. The schema is in [`prisma/schema.prisma`](prisma/schema.prisma).

| Table | Purpose |
|---|---|
| `UserSettings` | Each user's currency choice. |
| `Category` | User-defined income and expense categories, each with an emoji icon. |
| `Transaction` | Individual income and expense records. |
| `MonthHistory` | Daily income and expense totals per user (used by the monthly charts). |
| `YearHistory` | Monthly income and expense totals per user (used by the yearly charts). |
| `RecurringTransaction` | Recurring bills, subscriptions and income: frequency, next due date and optional end date. |
| `Goal` | Financial goals with a target amount, current progress and a target date. |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 LTS or newer
- PostgreSQL 14 or newer (a local instance, Docker, or a hosted service such as Neon, Supabase or Vercel Postgres)
- A free [Clerk](https://clerk.com/) application
- *(Optional)* A [Google AI Studio](https://aistudio.google.com/app/apikey) API key for Gemini

### 1. Clone and install

```bash
git clone https://github.com/erenemrearik/fincare.git
cd fincare
npm install
```

`npm install` also runs `prisma generate` through the `postinstall` script.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Required | Description |
|---|---|---|
| `POSTGRES_PRISMA_URL` | ✅ | Connection string the app uses at runtime (can be pooled). |
| `POSTGRES_URL_NON_POOLING` | ✅ | Direct connection string Prisma Migrate uses. For a local database, use the same value as above. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | From the Clerk dashboard → API Keys. |
| `CLERK_SECRET_KEY` | ✅ | From the Clerk dashboard → API Keys. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | `/sign-up` |
| `GEMINI_API_KEY` | ➖ | Gemini API key for AI insights. Without it, rule-based insights are shown. |

To start a local PostgreSQL with Docker:

```bash
docker run --name fincare-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fincare -p 5432:5432 -d postgres:16
```

The matching connection string is `postgresql://postgres:postgres@localhost:5432/fincare?schema=public`.

### 3. Create the database schema

```bash
npx prisma migrate deploy
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account and choose your currency in the setup wizard.

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npx prisma studio` | Browse and edit the database in the browser (port 5555). |

## Project structure

```text
fincare/
├── app/
│   ├── (auth)/          # Clerk sign-in and sign-up pages
│   ├── api/             # Route handlers: stats, history, categories, recurring, AI insights
│   ├── dashboard/       # Signed-in app: overview, transactions, bills, goals, reports, settings
│   ├── wizard/          # First-run currency setup
│   ├── layout.tsx       # Root layout and providers
│   └── page.tsx         # Landing page
├── components/          # Shared components (components/ui holds shadcn/ui primitives)
├── hooks/               # Client hooks
├── lib/                 # Prisma client, helpers, currencies, shared types
├── schema/              # Zod validation schemas
├── prisma/              # Prisma schema and migrations
├── public/              # Static assets (logos, mockup)
├── docs/                # Screenshots, sample report, README assets
└── middleware.ts        # Clerk route protection
```

## Roadmap

- [ ] Post recurring bills and income automatically on their due date
- [ ] Edit existing transactions
- [ ] Monthly budgets per category, with alerts
- [ ] Transactions in more than one currency, with exchange rates
- [ ] Import bank statements from CSV
- [ ] English interface (i18n)
- [ ] Automated tests and CI
- [ ] Installable mobile app (PWA)

## License

Released under the [MIT License](LICENSE).

## Author

**Eren Emre Arık** · [GitHub](https://github.com/erenemrearik)

If you find Fincare useful, a ⭐ on the repository is appreciated.
