# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start dev server (Turbopack, http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint

# Database
npx prisma migrate dev    # Run migrations (requires MySQL running)
npx prisma generate       # Regenerate Prisma Client after schema changes
npx prisma studio         # Open Prisma Studio GUI
```

## Stack

- **Next.js 16.2.4** — App Router, Turbopack, React Server Components, Server Actions
- **React 19.2.4** — `useActionState` for form state, `useTransition` for mutations
- **Prisma 7.8.0** — ORM; uses `@prisma/adapter-mariadb` driver adapter (MySQL-compatible)
- **MariaDB/MySQL** — connection string in `.env` as `DATABASE_URL`
- **TypeScript 5** (strict, `@/*` alias → project root)
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- **ESLint 9** with flat config (`eslint.config.mjs`)
- **jose** — JWT signing/verification for session cookies
- **bcryptjs** — password hashing (12 rounds)

## Prisma 7 Breaking Changes

Prisma 7 removes `url` from `datasource` in `schema.prisma`:
- Connection URL for **migrations** → `prisma.config.ts` (`datasource.url`)
- Connection URL for **runtime** → `PrismaMariaDb(process.env.DATABASE_URL!)` in `lib/db.ts`
- `ZodError.issues` (not `.errors`) for error messages

## Architecture

### Route Groups
```
app/
  (auth)/          → login, register — no sidebar, public routes
  dashboard/       → protected layout with sidebar; all management pages
  api/v1/          → public API endpoints (secured by per-app API key)
  api/             → internal endpoints
```

### Auth Flow
1. `proxy.ts` (Next.js 16 middleware) — redirects unauthenticated `/dashboard/*` to `/login`
2. `requireAuth()` in `app/dashboard/layout.tsx` — server-side JWT verification (primary guard)
3. Session stored as `brm_session` httpOnly cookie (7-day JWT, signed with `JWT_SECRET`)

### Data Model
- **User** → many **Application** (WEBSITE / ANDROID / IOS / DESKTOP)
- **Application** → has unique `apiKey` (format: `brm_<48-hex-chars>`)
- **Application** → many **BugReport** (status: OPEN/IN_PROGRESS/RESOLVED/CLOSED; priority: LOW/MEDIUM/HIGH/CRITICAL)

### Public Bug Report API
All external apps integrate using their application API key:
```
POST /api/v1/report          — Submit a bug (x-api-key header required)
GET  /api/v1/bugs            — Fetch bugs for an app (x-api-key header, supports ?status=&priority=&limit=&offset=)
```
CORS is enabled on these endpoints. The API key is displayed on the Application detail page alongside a full curl/JS integration guide.

### Server Actions (in `app/actions/`)
- `auth.ts` — `loginAction`, `registerAction`, `logoutAction`
- `applications.ts` — `createApplicationAction`, `updateApplicationAction`, `deleteApplicationAction`, `regenerateApiKeyAction`
- `bugs.ts` — `updateBugStatusAction`, `deleteBugAction`

### Client Components
Files with `'use client'` are limited to interactive islands:
- `components/layout/sidebar.tsx` — uses `usePathname()` for active nav highlight
- `components/dashboard/bug-chart.tsx` — Recharts `BarChart`
- `components/dashboard/status-chart.tsx` — Recharts `PieChart`
- `components/applications/api-key-card.tsx` — copy-to-clipboard, regenerate key
- `components/applications/api-docs.tsx` — copy code examples
- `components/bugs/status-update.tsx` — inline `useTransition` status dropdown
- Auth pages (`(auth)/login`, `(auth)/register`) — `useActionState` forms
- Application forms (`new/page.tsx`, `edit/form.tsx`) — `useActionState` forms

## Next.js 16 Breaking Changes to Know

Read `node_modules/next/dist/docs/` before writing code involving these APIs:

- **Async Request APIs** — `cookies()`, `headers()`, `params`, `searchParams` are async-only; always `await` them
- **`middleware` → `proxy`** — this project uses `proxy.ts` with exported `proxy` function
- **`next lint` removed** — use `npm run lint` (ESLint CLI directly)
- **Turbopack is default** — `next dev` and `next build` use Turbopack; pass `--webpack` to opt out
- **`revalidateTag` requires second argument** — `revalidateTag('key', 'max')`
- **Parallel routes require `default.js`** in all `@slot` directories
