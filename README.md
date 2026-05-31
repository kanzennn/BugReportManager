# BugReport Manager

A full-stack bug report and feedback management platform built with Next.js 16. Collect bug reports and user feedback from any application through a REST API, manage them in a collaborative dashboard, and export analytics as PDF reports.

## Features

- **Bug & Feedback tracking** — Receive reports via API key, manage status and priority, filter and search
- **Multi-app support** — Manage multiple applications (Website, Android, iOS, Desktop) under one account
- **Team collaboration** — Invite members with role-based access (Viewer, Editor, Admin)
- **Analytics** — Per-app analytics with charts for bug trends, status/priority breakdowns, feedback ratings, and affected versions (Pro & Business)
- **PDF export** — Export analytics as a formatted A4 PDF document
- **Billing** — Free / Pro / Business plans via Midtrans
- **OAuth** — Sign in with Google or GitHub
- **Password reset** — Self-service via email link
- **Email notifications** — Status change emails to bug reporters; invitation emails
- **CSV export** — Download all bugs or feedback as CSV
- **Rate limiting** — Sliding-window protection on auth and public API
- **Admin panel** — User management, banning, plan overrides, transaction history
- **Responsive** — Fully usable on mobile and desktop
- **Multi-language** — English and Indonesian (ID)
- **Light / dark mode**

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 |
| ORM | Prisma 7 with `@prisma/adapter-mariadb` |
| Database | MariaDB / MySQL |
| Auth | JWT (jose) + bcryptjs, Google OAuth, GitHub OAuth |
| Charts | Recharts |
| Payments | Midtrans |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- MariaDB or MySQL instance

### 1. Clone and install

```bash
git clone https://github.com/kanzennn/BugReportManager.git
cd BugReportManager
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/bug_report_manager"

# Auth
JWT_SECRET="your-secret-key"

# Auth
JWT_SECRET="change-this-in-production"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Midtrans (optional — required for billing)
MIDTRANS_SERVER_KEY="SB-Mid-server-..."

# SMTP — email notifications (optional; logs to console if not set)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="BugReport Manager <noreply@example.com>"

# WhatsApp for Enterprise plan
NEXT_PUBLIC_WHATSAPP_NUMBER="628xxxxxxxxxx"
```

### 3. Run database migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. (Optional) Seed demo data

```bash
npx tsx prisma/seed.ts
```

This creates two accounts and sample data:

| Email | Password | Plan |
|---|---|---|
| `demo@example.com` | `demo1234` | Pro |
| `team@example.com` | `demo1234` | Free |

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # Development server (Turbopack)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint

npx prisma migrate dev    # Create and run a new migration
npx prisma generate       # Regenerate Prisma Client
npx prisma studio         # Open Prisma Studio GUI
npx tsx prisma/seed.ts    # Seed demo data
```

## Public API

External applications submit reports using their API key.

### Submit a bug report

```bash
POST /api/v1/report
x-api-key: brm_<your-api-key>
Content-Type: application/json

{
  "title": "App crashes on login",
  "description": "Reproducible on Android 14",
  "priority": "HIGH",        # LOW | MEDIUM | HIGH | CRITICAL
  "appVersion": "2.1.0",
  "deviceInfo": "Pixel 7 / Android 14",
  "stackTrace": "...",
  "reporterEmail": "user@example.com"
}
```

### Submit feedback

```bash
POST /api/v1/feedback
x-api-key: brm_<your-api-key>
Content-Type: application/json

{
  "title": "Love the new UI",
  "message": "The redesign is much cleaner.",
  "type": "COMPLIMENT",      # GENERAL | SUGGESTION | COMPLAINT | COMPLIMENT
  "rating": 5,
  "reporterEmail": "user@example.com"
}
```

### Fetch bugs

```bash
GET /api/v1/bugs?status=OPEN&priority=HIGH&limit=20&offset=0
x-api-key: brm_<your-api-key>
```

CORS is enabled on all `/api/v1/*` endpoints.

## Plans

| Feature | Free | Pro | Business |
|---|---|---|---|
| Applications | 3 | Unlimited | Unlimited |
| Bug reports | Unlimited | Unlimited | Unlimited |
| Feedback | Unlimited | Unlimited | Unlimited |
| Analytics & PDF export | — | ✓ | ✓ |
| Team invitations & RBAC | — | — | ✓ |

## Project Structure

```
app/
  (auth)/               # Login, register — no sidebar
  (print)/              # Print-only routes (PDF export)
  dashboard/            # Protected dashboard pages
  api/v1/               # Public bug/feedback API
  api/                  # Internal API (OAuth, Xendit, etc.)
components/
  analytics/            # PDF export components
  dashboard/            # Charts, stat cards
  layout/               # Sidebar, mobile nav
  ui/                   # Shared UI (badges, buttons)
prisma/
  schema.prisma
  seed.ts
```

## Deployment

The project is configured for Vercel. The `vercel-build` script runs migrations automatically:

```json
"vercel-build": "prisma generate && prisma migrate deploy && next build"
```

Set all environment variables in your Vercel project settings before deploying.
