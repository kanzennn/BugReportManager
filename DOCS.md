# BugReport Manager — Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Features](#features)
   - [Authentication](#authentication)
   - [Applications](#applications)
   - [Bug Reports](#bug-reports)
   - [Feedback](#feedback)
   - [Analytics](#analytics)
   - [Team Collaboration](#team-collaboration)
   - [Billing & Plans](#billing--plans)
   - [CSV Export](#csv-export)
   - [Email Notifications](#email-notifications)
   - [Admin Panel](#admin-panel)
6. [Public REST API](#public-rest-api)
   - [Authentication](#api-authentication)
   - [Submit a Bug Report](#post-apiv1report)
   - [Fetch Bug Reports](#get-apiv1bugs)
   - [Submit Feedback](#post-apiv1feedback)
   - [Fetch Feedback](#get-apiv1feedback)
   - [Rate Limits](#rate-limits)
   - [Error Codes](#error-codes)
7. [Security](#security)
8. [Database Schema](#database-schema)

---

## Overview

BugReport Manager is a full-stack SaaS platform that lets you:
- Collect bug reports and user feedback from any application through a REST API
- Manage reports in a collaborative dashboard with role-based access
- Analyse trends with per-app analytics and export data as CSV or PDF
- Monetise with Free / Pro / Business plans via Midtrans

**Tech stack:** Next.js 16 · React 19 · Prisma 7 · MariaDB · Tailwind CSS v4 · Midtrans · Vercel

---

## Architecture

```
app/
  (auth)/          → Public auth pages (login, register, forgot-password, reset-password)
  dashboard/       → Protected dashboard (all management pages)
  admin/           → Admin panel (isAdmin guard)
  api/
    v1/            → Public API (x-api-key auth, CORS enabled)
    export/        → CSV export endpoints (session auth)
    midtrans/      → Payment webhook handlers
    auth/          → OAuth callbacks (Google, GitHub)
    applications/  → Internal API (session auth)

lib/
  auth.ts          → JWT session helpers, requireAuth()
  db.ts            → Prisma client singleton
  email.ts         → Nodemailer wrappers (invitation, password reset, bug status)
  rate-limit.ts    → Sliding-window in-memory rate limiter
  midtrans.ts      → Midtrans Snap API helpers
  access.ts        → Role hierarchy & permission checks
  i18n.ts          → Translation (en / id)

proxy.ts           → Next.js middleware — redirects unauthenticated /dashboard/* to /login
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MariaDB or MySQL database

### Installation

```bash
git clone <repo>
cd bug-report-management
npm install

# Copy and fill in the environment variables
cp .env.example .env

# Apply database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# (Optional) Seed demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | `mysql://user:password@host:3306/dbname` |
| `JWT_SECRET` | ✅ | Long random string for signing session tokens |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Public URL (e.g. `https://yourdomain.com`) |
| `MIDTRANS_SERVER_KEY` | ✅ for billing | From Midtrans dashboard → Settings → Access Keys |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | ✅ for billing | Enterprise WhatsApp number (e.g. `628123456789`) |
| `GOOGLE_CLIENT_ID` | optional | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | optional | Google OAuth app client secret |
| `GITHUB_CLIENT_ID` | optional | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | optional | GitHub OAuth app client secret |
| `SMTP_HOST` | optional | SMTP server hostname |
| `SMTP_PORT` | optional | SMTP port (default `587`) |
| `SMTP_SECURE` | optional | `true` for port 465, `false` otherwise |
| `SMTP_USER` | optional | SMTP login user |
| `SMTP_PASS` | optional | SMTP login password |
| `SMTP_FROM` | optional | Sender display name + email |
| `AWS_ACCESS_KEY_ID` | optional | S3-compatible storage access key |
| `AWS_SECRET_ACCESS_KEY` | optional | S3-compatible storage secret key |
| `AWS_REGION` | optional | Storage region (default `sgp1`) |
| `AWS_S3_BUCKET` | optional | Storage bucket name |
| `AWS_S3_ENDPOINT` | optional | S3 endpoint URL (leave blank for AWS) |
| `AWS_S3_PUBLIC_URL` | optional | CDN URL override |

> If SMTP is not configured, all emails are logged to the console instead of being sent. This is safe for development.

---

## Features

### Authentication

- **Email/password** login and registration
- **Google OAuth** and **GitHub OAuth** (configure client IDs in `.env`)
- **Password reset** — request a reset link via `/forgot-password`; link expires in 1 hour
- **Session** — 7-day JWT stored in an `httpOnly` cookie (`brm_session`)
- **Ban** — admins can ban users; banned users are rejected on every request

### Applications

Create up to **3 applications** on the Free plan (unlimited on Pro/Business). Each application has:
- A **type** — Website, Android, iOS, or Desktop
- A unique **API key** (`brm_<48 hex chars>`) for submitting reports
- **Team members** with per-app roles (see [Team Collaboration](#team-collaboration))

### Bug Reports

Each bug report contains:

| Field | Type | Description |
|---|---|---|
| `title` | string (required) | Short summary |
| `description` | string (required) | Full description |
| `status` | enum | `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` |
| `priority` | enum | `LOW` · `MEDIUM` · `HIGH` · `CRITICAL` |
| `appVersion` | string | App version string |
| `deviceInfo` | string | OS, browser, device |
| `stackTrace` | text | Full stack trace |
| `reporterEmail` | email | If set, the reporter receives an email when the status changes |

**Status change notifications** — when a team member updates a bug's status, an email is automatically sent to `reporterEmail` (if present).

### Feedback

Each feedback item contains:

| Field | Type | Description |
|---|---|---|
| `title` | string (required) | Short summary |
| `message` | string (required) | Full message |
| `type` | enum | `GENERAL` · `SUGGESTION` · `COMPLAINT` · `COMPLIMENT` |
| `status` | enum | `NEW` · `READ` · `ARCHIVED` |
| `rating` | integer | 1–5 star rating |
| `appVersion` | string | App version string |
| `reporterEmail` | email | For follow-up |

### Analytics

Available on **Pro and Business** plans. Navigate to an application → Analytics to see:

- 30-day bug submission timeline
- Bug status and priority breakdowns (pie/bar charts)
- Feedback type distribution
- Star rating distribution
- Affected app versions

**PDF export** — click "Export PDF" on the analytics page to download a formatted A4 report.

### Team Collaboration

Invite collaborators to individual applications with one of three roles:

| Role | Capabilities |
|---|---|
| **Viewer** | Read-only access to bugs and feedback |
| **Editor** | Can update status, priority; can delete bugs and feedback |
| **Admin** | All editor permissions + can manage members and invitations |

The application **owner** has full control and cannot be removed by members.

Invitations are sent by email (requires SMTP configuration) and expire after 7 days. Accept the invite at `/invitations/accept?token=<token>`.

### Billing & Plans

| Feature | Free | Pro | Business |
|---|---|---|---|
| Applications | 3 | Unlimited | Unlimited |
| Bug reports | Unlimited | Unlimited | Unlimited |
| Feedback | Unlimited | Unlimited | Unlimited |
| Analytics | — | ✅ | ✅ |
| Team members | — | — | ✅ |
| Price | Rp 0 | Rp 30.000/mo | Rp 150.000/mo |

**Payment flow:** select a plan on `/dashboard/billing` → redirected to Midtrans Snap → on payment, plan is activated. Cancellation sets the plan back to Free immediately.

**Webhook URL** to configure in Midtrans dashboard: `{BASE_URL}/api/midtrans/webhook`

### CSV Export

Export all bugs or feedback for your applications as a CSV file:

- **Bugs** — `GET /api/export/bugs` or `GET /api/export/bugs?appId=<id>`
- **Feedback** — `GET /api/export/feedback` or `GET /api/export/feedback?appId=<id>`

Session authentication is required (you must be logged in). The "Export CSV" button appears on the Bugs and Feedback list pages in the dashboard.

### Email Notifications

Four automated emails are sent by the system:

| Trigger | Recipient | Template |
|---|---|---|
| Team invitation | Invited email address | Invitation link, role, expiry |
| Password reset request | Account email | Reset link (expires 1 hour) |
| Bug status changed | `reporterEmail` on the bug | New status label + link to bug |

All emails gracefully degrade — if SMTP is not configured, they are logged to the server console.

### Admin Panel

Access at `/admin` (requires `isAdmin = true` on your user account — set directly in the database).

| Page | Description |
|---|---|
| Overview | KPIs: total users, MRR, revenue, conversion rate, recent signups, recent transactions |
| Users | Paginated user list with plan filter; click a user to open their detail page |
| User Detail | View user info and all their applications; edit plan and admin role; ban/unban |
| Transactions | Full payment history |

**To grant admin access:**
```sql
UPDATE User SET isAdmin = 1 WHERE email = 'your@email.com';
```

---

## Public REST API

These endpoints are called from your applications using an API key. CORS is enabled for all origins.

### API Authentication

Every request must include the API key in the header:

```
x-api-key: brm_<your-api-key>
```

Get your API key from the application detail page in the dashboard.

---

### POST /api/v1/report

Submit a new bug report.

**Request**

```http
POST /api/v1/report
Content-Type: application/json
x-api-key: brm_abc123...

{
  "title": "App crashes on checkout",
  "description": "Clicking Pay Now causes the app to freeze.",
  "priority": "HIGH",
  "appVersion": "2.4.1",
  "deviceInfo": "Chrome 124 / Windows 11",
  "stackTrace": "TypeError: Cannot read...",
  "reporterEmail": "user@example.com"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | Max 255 chars |
| `description` | string | ✅ | |
| `priority` | enum | — | `LOW` `MEDIUM` `HIGH` `CRITICAL` (default `MEDIUM`) |
| `appVersion` | string | — | Max 50 chars |
| `deviceInfo` | string | — | Max 255 chars |
| `stackTrace` | string | — | |
| `reporterEmail` | email | — | Receives status update emails |

**Response `201`**

```json
{
  "id": "cmptbii0a0000kki93yotxf4a",
  "status": "OPEN",
  "priority": "HIGH",
  "createdAt": "2026-05-31T10:00:00.000Z"
}
```

**JavaScript example**

```js
await fetch('https://yourapp.com/api/v1/report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'brm_abc123...',
  },
  body: JSON.stringify({
    title: 'Crash on checkout',
    description: 'Reproducible on Firefox 125.',
    priority: 'HIGH',
  }),
})
```

---

### GET /api/v1/bugs

Fetch bug reports for your application.

**Request**

```http
GET /api/v1/bugs?status=OPEN&priority=HIGH&limit=20&offset=0
x-api-key: brm_abc123...
```

| Query param | Type | Notes |
|---|---|---|
| `status` | enum | Filter by `OPEN` `IN_PROGRESS` `RESOLVED` `CLOSED` |
| `priority` | enum | Filter by `LOW` `MEDIUM` `HIGH` `CRITICAL` |
| `limit` | integer | 1–100 (default 50) |
| `offset` | integer | Pagination offset (default 0) |

**Response `200`**

```json
{
  "bugs": [
    {
      "id": "...",
      "title": "App crashes on checkout",
      "description": "...",
      "status": "OPEN",
      "priority": "HIGH",
      "appVersion": "2.4.1",
      "deviceInfo": "Chrome 124 / Windows 11",
      "reporterEmail": "user@example.com",
      "createdAt": "2026-05-31T10:00:00.000Z",
      "updatedAt": "2026-05-31T10:00:00.000Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

### POST /api/v1/feedback

Submit a new feedback item.

**Request**

```http
POST /api/v1/feedback
Content-Type: application/json
x-api-key: brm_abc123...

{
  "title": "Love the new UI",
  "message": "The redesign is much cleaner.",
  "type": "COMPLIMENT",
  "rating": 5,
  "appVersion": "2.4.1",
  "reporterEmail": "user@example.com"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | Max 255 chars |
| `message` | string | ✅ | |
| `type` | enum | — | `GENERAL` `SUGGESTION` `COMPLAINT` `COMPLIMENT` (default `GENERAL`) |
| `rating` | integer | — | 1–5 |
| `appVersion` | string | — | Max 50 chars |
| `reporterEmail` | email | — | |

**Response `201`**

```json
{
  "id": "...",
  "type": "COMPLIMENT",
  "status": "NEW",
  "createdAt": "2026-05-31T10:00:00.000Z"
}
```

---

### GET /api/v1/feedback

Fetch feedback for your application.

**Request**

```http
GET /api/v1/feedback?type=SUGGESTION&status=NEW&limit=20&offset=0
x-api-key: brm_abc123...
```

| Query param | Type | Notes |
|---|---|---|
| `type` | enum | Filter by `GENERAL` `SUGGESTION` `COMPLAINT` `COMPLIMENT` |
| `status` | enum | Filter by `NEW` `READ` `ARCHIVED` |
| `limit` | integer | 1–100 (default 50) |
| `offset` | integer | Pagination offset (default 0) |

**Response `200`**

```json
{
  "feedback": [...],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

---

### Rate Limits

All public API endpoints are rate-limited per API key using a **sliding window** algorithm.

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/v1/report` | 30 requests | 1 minute |
| `POST /api/v1/feedback` | 30 requests | 1 minute |
| `GET /api/v1/bugs` | 60 requests | 1 minute |
| `GET /api/v1/feedback` | 60 requests | 1 minute |

When exceeded, the API returns:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 42

{ "error": "Too many requests. Please slow down." }
```

---

### Error Codes

| Status | Meaning |
|---|---|
| `400` | Validation error — check the `details` array in the response body |
| `401` | Missing or invalid `x-api-key` header |
| `429` | Rate limit exceeded — see `Retry-After` header |

---

## Security

| Mechanism | Details |
|---|---|
| Sessions | 7-day JWT in `httpOnly` cookie, signed with `JWT_SECRET` |
| Passwords | bcrypt (12 rounds) |
| API keys | 48 hex chars (192-bit entropy), prefixed `brm_` |
| Rate limiting | Sliding window in-memory; per-IP for auth, per-API-key for public API, per-user for payments |
| Ban | Sets `bannedAt`; checked on every `requireAuth()` call |
| CORS | Enabled only on public API routes (`/api/v1/*`) |
| Webhooks | Midtrans signature verified via SHA-512 |
| Password reset | Single-use token; expires after 1 hour; cleared after use |

---

## Database Schema

```
User
  id, email, name, password?, avatarUrl?, locale, plan, subscriptionStatus
  midtransSubscriptionId?, bannedAt?, resetToken?, resetTokenExpiresAt?
  isAdmin, lastSeenAt, createdAt, updatedAt

Application
  id, name, type (WEBSITE|ANDROID|IOS|DESKTOP), description?, apiKey, userId
  → bugs[], feedback[], members[], invitations[]

ApplicationMember
  userId, applicationId, role (VIEWER|EDITOR|ADMIN)

Invitation
  email, role, token, status (PENDING|ACCEPTED|DECLINED|EXPIRED), expiresAt
  applicationId, invitedById

BugReport
  title, description, status, priority, appVersion?, deviceInfo?, stackTrace?
  reporterEmail?, applicationId, createdAt, updatedAt

Feedback
  title, message, type, status, rating?, appVersion?, reporterEmail?
  applicationId, createdAt, updatedAt

Transaction
  userId, amount (IDR), currency, status, paymentId?, plan, createdAt

PlanConfig
  plan, displayPrice, planKey, features (JSON), updatedAt
```
