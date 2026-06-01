import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoIcon } from '@/components/logo'

export const metadata: Metadata = {
  title: 'API Documentation',
  description:
    'BugReport REST API documentation — submit bug reports and user feedback from any app with a simple HTTP API.',
  alternates: { canonical: '/docs' },
}

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  return (
    <pre className={`language-${lang} overflow-x-auto rounded-lg bg-zinc-900 border border-zinc-800 p-4 text-sm text-zinc-300 whitespace-pre`}>
      <code>{code.trim()}</code>
    </pre>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-xl font-bold text-zinc-100 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Badge({ children, color = 'zinc' }: { children: React.ReactNode; color?: 'green' | 'blue' | 'zinc' | 'amber' }) {
  const colors = {
    green: 'bg-green-900/50 text-green-300 border-green-700/50',
    blue: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
    zinc: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    amber: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
  }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

function Field({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-2 border-b border-zinc-800 last:border-0">
      <div className="flex items-center gap-2 min-w-[180px]">
        <code className="text-sm font-mono text-indigo-300">{name}</code>
        {required && <span className="text-[10px] font-medium text-red-400">required</span>}
      </div>
      <code className="text-xs text-zinc-500 min-w-[80px]">{type}</code>
      <p className="text-sm text-zinc-400 flex-1">{desc}</p>
    </div>
  )
}

export default function DocsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bugreportmanager.vercel.app'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoIcon size={26} />
            <span className="font-semibold text-zinc-100">BugReport</span>
            <span className="text-zinc-600">/</span>
            <span className="text-sm font-medium text-zinc-400">API Docs</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              Dashboard
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex gap-12">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Contents</p>
              {[
                { href: '#authentication', label: 'Authentication' },
                { href: '#submit-bug', label: 'Submit Bug Report' },
                { href: '#get-bugs', label: 'Get Bug Reports' },
                { href: '#submit-feedback', label: 'Submit Feedback' },
                { href: '#get-feedback', label: 'Get Feedback' },
                { href: '#rate-limits', label: 'Rate Limits' },
                { href: '#error-codes', label: 'Error Codes' },
                { href: '#examples', label: 'Code Examples' },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="block rounded px-2 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-14">
            {/* Hero */}
            <div>
              <h1 className="text-3xl font-bold text-zinc-100 mb-3">BugReport API</h1>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
                A simple REST API to submit bug reports and user feedback from any mobile, web, or desktop application.
                Authenticate with your application API key and start receiving reports in seconds.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge color="blue">REST API</Badge>
                <Badge color="zinc">JSON</Badge>
                <Badge color="green">CORS enabled</Badge>
                <Badge color="amber">x-api-key auth</Badge>
              </div>
            </div>

            {/* Base URL */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Base URL</p>
              <code className="text-sm font-mono text-indigo-300">{baseUrl}/api/v1</code>
            </div>

            {/* Authentication */}
            <Section id="authentication" title="Authentication">
              <p className="text-zinc-400 text-sm leading-relaxed">
                All API requests must include your application API key in the <code className="text-indigo-300 font-mono">x-api-key</code> header.
                Each application has its own unique API key — find yours on the application detail page in the dashboard.
              </p>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">API Key format</p>
                <code className="font-mono text-indigo-300">brm_{'<48 hex characters>'}</code>
              </div>
              <CodeBlock code={`curl -X POST ${baseUrl}/api/v1/report \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: brm_your_api_key_here" \\
  -d '{"title": "App crashes on startup", "description": "..."}'`} />
              <p className="text-sm text-zinc-500">
                To get your API key: Dashboard → Applications → select your app → API Key section.
              </p>
            </Section>

            {/* Submit Bug */}
            <Section id="submit-bug" title="Submit Bug Report">
              <div className="flex items-center gap-3">
                <Badge color="green">POST</Badge>
                <code className="text-sm font-mono text-zinc-300">/api/v1/report</code>
              </div>
              <p className="text-sm text-zinc-400">Submit a bug report from your application.</p>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Request body</p>
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                  <Field name="title" type="string" required desc="Brief description of the bug (max 255 chars)." />
                  <Field name="description" type="string" required desc="Detailed description of the bug (max 10,000 chars)." />
                  <Field name="priority" type="enum" desc="LOW | MEDIUM | HIGH | CRITICAL — defaults to MEDIUM." />
                  <Field name="appVersion" type="string" desc="Your app version string, e.g. '1.2.3' (max 50 chars)." />
                  <Field name="deviceInfo" type="string" desc="Device / OS info, e.g. 'iPhone 15, iOS 17.4' (max 255 chars)." />
                  <Field name="stackTrace" type="string" desc="Full stack trace or error log (max 20,000 chars)." />
                  <Field name="reporterEmail" type="email" desc="Optional email of the user who reported the bug." />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Response <Badge color="blue">201 Created</Badge></p>
                <CodeBlock lang="json" code={`{
  "id": "clxyz123...",
  "status": "OPEN",
  "priority": "MEDIUM",
  "createdAt": "2026-06-01T00:00:00.000Z"
}`} />
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Example</p>
                <CodeBlock code={`curl -X POST ${baseUrl}/api/v1/report \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: brm_your_key" \\
  -d '{
    "title": "Crash on profile screen",
    "description": "App crashes when navigating to the profile screen after login.",
    "priority": "HIGH",
    "appVersion": "2.4.1",
    "deviceInfo": "Samsung Galaxy S24, Android 14",
    "stackTrace": "java.lang.NullPointerException: ...",
    "reporterEmail": "user@example.com"
  }'`} />
              </div>
            </Section>

            {/* Get Bugs */}
            <Section id="get-bugs" title="Get Bug Reports">
              <div className="flex items-center gap-3">
                <Badge color="blue">GET</Badge>
                <code className="text-sm font-mono text-zinc-300">/api/v1/bugs</code>
              </div>
              <p className="text-sm text-zinc-400">Retrieve bug reports for your application with optional filtering and pagination.</p>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Query parameters</p>
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                  <Field name="status" type="enum" desc="Filter by status: OPEN | IN_PROGRESS | RESOLVED | CLOSED" />
                  <Field name="priority" type="enum" desc="Filter by priority: LOW | MEDIUM | HIGH | CRITICAL" />
                  <Field name="limit" type="number" desc="Number of results to return (max 100, default 50)." />
                  <Field name="offset" type="number" desc="Number of results to skip for pagination (default 0)." />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Response <Badge color="blue">200 OK</Badge></p>
                <CodeBlock lang="json" code={`{
  "bugs": [
    {
      "id": "clxyz123...",
      "title": "Crash on profile screen",
      "description": "App crashes when...",
      "status": "OPEN",
      "priority": "HIGH",
      "appVersion": "2.4.1",
      "deviceInfo": "Samsung Galaxy S24, Android 14",
      "reporterEmail": "user@example.com",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z"
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}`} />
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Example</p>
                <CodeBlock code={`curl "${baseUrl}/api/v1/bugs?status=OPEN&priority=HIGH&limit=10" \\
  -H "x-api-key: brm_your_key"`} />
              </div>
            </Section>

            {/* Submit Feedback */}
            <Section id="submit-feedback" title="Submit Feedback">
              <div className="flex items-center gap-3">
                <Badge color="green">POST</Badge>
                <code className="text-sm font-mono text-zinc-300">/api/v1/feedback</code>
              </div>
              <p className="text-sm text-zinc-400">Submit user feedback from your application.</p>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Request body</p>
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                  <Field name="title" type="string" required desc="Brief title for the feedback (max 255 chars)." />
                  <Field name="message" type="string" required desc="Feedback content (max 10,000 chars)." />
                  <Field name="type" type="enum" desc="GENERAL | SUGGESTION | COMPLAINT | COMPLIMENT — defaults to GENERAL." />
                  <Field name="rating" type="number" desc="Optional rating from 1 (worst) to 5 (best)." />
                  <Field name="appVersion" type="string" desc="Your app version string (max 50 chars)." />
                  <Field name="reporterEmail" type="email" desc="Optional email of the user giving feedback." />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Response <Badge color="blue">201 Created</Badge></p>
                <CodeBlock lang="json" code={`{
  "id": "clxyz456...",
  "type": "SUGGESTION",
  "status": "NEW",
  "createdAt": "2026-06-01T00:00:00.000Z"
}`} />
              </div>
            </Section>

            {/* Get Feedback */}
            <Section id="get-feedback" title="Get Feedback">
              <div className="flex items-center gap-3">
                <Badge color="blue">GET</Badge>
                <code className="text-sm font-mono text-zinc-300">/api/v1/feedback</code>
              </div>
              <p className="text-sm text-zinc-400">Retrieve feedback entries for your application with optional filtering and pagination.</p>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Query parameters</p>
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                  <Field name="type" type="enum" desc="Filter by type: GENERAL | SUGGESTION | COMPLAINT | COMPLIMENT" />
                  <Field name="status" type="enum" desc="Filter by status: NEW | READ | ARCHIVED" />
                  <Field name="limit" type="number" desc="Number of results to return (max 100, default 50)." />
                  <Field name="offset" type="number" desc="Number of results to skip for pagination (default 0)." />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Response <Badge color="blue">200 OK</Badge></p>
                <CodeBlock lang="json" code={`{
  "feedback": [
    {
      "id": "clxyz456...",
      "title": "Love the new UI!",
      "message": "The redesign is much easier to use.",
      "type": "COMPLIMENT",
      "status": "NEW",
      "rating": 5,
      "appVersion": "2.4.1",
      "reporterEmail": "user@example.com",
      "createdAt": "2026-06-01T00:00:00.000Z",
      "updatedAt": "2026-06-01T00:00:00.000Z"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}`} />
              </div>
            </Section>

            {/* Rate Limits */}
            <Section id="rate-limits" title="Rate Limits">
              <p className="text-sm text-zinc-400">Rate limits are applied per API key per minute to prevent abuse.</p>
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <div className="grid grid-cols-3 gap-4 bg-zinc-900/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <span>Endpoint</span>
                  <span>Limit</span>
                  <span>Window</span>
                </div>
                {[
                  { endpoint: 'POST /api/v1/report', limit: '30 requests', window: '1 minute' },
                  { endpoint: 'GET /api/v1/bugs', limit: '60 requests', window: '1 minute' },
                  { endpoint: 'POST /api/v1/feedback', limit: '30 requests', window: '1 minute' },
                  { endpoint: 'GET /api/v1/feedback', limit: '60 requests', window: '1 minute' },
                ].map(({ endpoint, limit, window }) => (
                  <div key={endpoint} className="grid grid-cols-3 gap-4 border-t border-zinc-800 px-4 py-3 text-sm">
                    <code className="font-mono text-xs text-zinc-300">{endpoint}</code>
                    <span className="text-zinc-400">{limit}</span>
                    <span className="text-zinc-400">{window}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-500">
                When rate limited, the API returns <code className="text-indigo-300">429 Too Many Requests</code> with a{' '}
                <code className="text-indigo-300">Retry-After</code> header indicating seconds to wait.
              </p>
            </Section>

            {/* Error Codes */}
            <Section id="error-codes" title="Error Codes">
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <div className="grid grid-cols-3 gap-4 bg-zinc-900/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <span>Status</span>
                  <span>Code</span>
                  <span>Description</span>
                </div>
                {[
                  { status: '400', code: 'Bad Request', desc: 'Invalid request body or missing required fields.' },
                  { status: '401', code: 'Unauthorized', desc: 'Missing or invalid x-api-key header.' },
                  { status: '429', code: 'Too Many Requests', desc: 'Rate limit exceeded. See Retry-After header.' },
                  { status: '500', code: 'Internal Server Error', desc: 'Server error. Please try again.' },
                ].map(({ status, code, desc }) => (
                  <div key={status} className="grid grid-cols-3 gap-4 border-t border-zinc-800 px-4 py-3 text-sm">
                    <code className="font-mono text-xs text-amber-400">{status}</code>
                    <span className="text-zinc-300">{code}</span>
                    <span className="text-zinc-400">{desc}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Error response format</p>
                <CodeBlock lang="json" code={`{
  "error": "Missing x-api-key header"
}`} />
              </div>
            </Section>

            {/* Code Examples */}
            <Section id="examples" title="Code Examples">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-zinc-300 mb-3">JavaScript / TypeScript</p>
                  <CodeBlock lang="typescript" code={`const API_KEY = 'brm_your_api_key_here'
const BASE_URL = '${baseUrl}/api/v1'

// Submit a bug report
async function reportBug(bug: {
  title: string
  description: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  appVersion?: string
  deviceInfo?: string
  stackTrace?: string
  reporterEmail?: string
}) {
  const res = await fetch(\`\${BASE_URL}/report\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(bug),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Failed to submit bug report')
  }

  return res.json() // { id, status, priority, createdAt }
}

// Get bug reports with pagination
async function getBugs(options?: {
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  limit?: number
  offset?: number
}) {
  const params = new URLSearchParams()
  if (options?.status) params.set('status', options.status)
  if (options?.priority) params.set('priority', options.priority)
  if (options?.limit) params.set('limit', String(options.limit))
  if (options?.offset) params.set('offset', String(options.offset))

  const res = await fetch(\`\${BASE_URL}/bugs?\${params}\`, {
    headers: { 'x-api-key': API_KEY },
  })

  return res.json() // { bugs, total, limit, offset }
}

// Submit feedback
async function submitFeedback(feedback: {
  title: string
  message: string
  type?: 'GENERAL' | 'SUGGESTION' | 'COMPLAINT' | 'COMPLIMENT'
  rating?: number
  appVersion?: string
  reporterEmail?: string
}) {
  const res = await fetch(\`\${BASE_URL}/feedback\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(feedback),
  })
  return res.json()
}`} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-300 mb-3">cURL — Submit bug report</p>
                  <CodeBlock code={`curl -X POST ${baseUrl}/api/v1/report \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: brm_your_key" \\
  -d '{
    "title": "App crashes on startup",
    "description": "The app crashes immediately when launched on Android 14.",
    "priority": "CRITICAL",
    "appVersion": "3.0.0",
    "deviceInfo": "Pixel 8, Android 14",
    "reporterEmail": "user@example.com"
  }'`} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-300 mb-3">cURL — Get open bugs</p>
                  <CodeBlock code={`curl "${baseUrl}/api/v1/bugs?status=OPEN&limit=20" \\
  -H "x-api-key: brm_your_key"`} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-300 mb-3">cURL — Submit feedback</p>
                  <CodeBlock code={`curl -X POST ${baseUrl}/api/v1/feedback \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: brm_your_key" \\
  -d '{
    "title": "Dark mode request",
    "message": "Please add a dark mode option to the settings screen.",
    "type": "SUGGESTION",
    "rating": 4,
    "reporterEmail": "user@example.com"
  }'`} />
                </div>
              </div>
            </Section>
          </main>
        </div>
      </div>
    </div>
  )
}
