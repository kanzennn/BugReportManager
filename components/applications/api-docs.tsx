'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ApiDocsProps {
  apiKey: string
  baseUrl: string
}

export function ApiDocs({ apiKey, baseUrl }: ApiDocsProps) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const reportEndpoint = `${baseUrl}/api/v1/report`
  const getBugsEndpoint = `${baseUrl}/api/v1/bugs`
  const submitFeedbackEndpoint = `${baseUrl}/api/v1/feedback`
  const getFeedbackEndpoint = `${baseUrl}/api/v1/feedback`

  const curlReport = `curl -X POST ${reportEndpoint} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "title": "App crashes on login",
    "description": "The app crashes when tapping the login button",
    "priority": "HIGH",
    "appVersion": "1.2.3",
    "deviceInfo": "iPhone 15 / iOS 17.2",
    "stackTrace": "Error: NullPointerException at line 42",
    "reporterEmail": "user@example.com"
  }'`

  const curlGetBugs = `curl "${getBugsEndpoint}?status=OPEN&limit=20" \\
  -H "x-api-key: ${apiKey}"`

  const jsExample = `// Submit a bug report
const response = await fetch('${reportEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}',
  },
  body: JSON.stringify({
    title: 'App crashes on login',
    description: 'Detailed description of the bug',
    priority: 'HIGH',          // LOW | MEDIUM | HIGH | CRITICAL
    appVersion: '1.0.0',       // optional
    deviceInfo: 'iOS 17.2',    // optional
    stackTrace: '...',         // optional
    reporterEmail: 'u@x.com',  // optional
  }),
})
const bug = await response.json()
// { id, status: 'OPEN', createdAt }`

  const curlSubmitFeedback = `curl -X POST ${submitFeedbackEndpoint} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "title": "Love the new dashboard!",
    "message": "The redesign is much cleaner and easier to navigate.",
    "type": "COMPLIMENT",
    "rating": 5,
    "appVersion": "2.0.0",
    "reporterEmail": "user@example.com"
  }'`

  const curlGetFeedback = `curl "${getFeedbackEndpoint}?type=SUGGESTION&status=NEW&limit=20" \\
  -H "x-api-key: ${apiKey}"`

  const jsFeedbackExample = `// Submit feedback
const response = await fetch('${submitFeedbackEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}',
  },
  body: JSON.stringify({
    title: 'Love the new dashboard!',
    message: 'Detailed feedback message',
    type: 'COMPLIMENT',        // GENERAL | SUGGESTION | COMPLAINT | COMPLIMENT
    rating: 5,                 // optional, 1–5
    appVersion: '2.0.0',       // optional
    reporterEmail: 'u@x.com',  // optional
  }),
})
const feedback = await response.json()
// { id, type: 'COMPLIMENT', status: 'NEW', createdAt }

// Fetch feedback
const list = await fetch('${getFeedbackEndpoint}?status=NEW&limit=50', {
  headers: { 'x-api-key': '${apiKey}' },
})
const { feedback: items, total } = await list.json()`

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-300 border border-zinc-800">
        {code}
      </pre>
      <button
        onClick={() => copy(code, id)}
        className="absolute right-3 top-3 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
      >
        {copied === id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-6">
      <h3 className="text-sm font-semibold text-zinc-100">API Documentation</h3>

      {/* Submit bug */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs font-bold text-indigo-400">POST</span>
          <code className="text-xs text-zinc-300 font-mono">/api/v1/report</code>
        </div>
        <p className="mb-3 text-xs text-zinc-500">Submit a new bug report. Requires your API key in the request header.</p>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Request Headers</h4>
        <div className="mb-4 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-xs">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Header</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Required</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              <tr>
                <td className="px-4 py-2 font-mono text-zinc-300">x-api-key</td>
                <td className="px-4 py-2 text-red-400">Required</td>
                <td className="px-4 py-2 text-zinc-500">Your application API key</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-zinc-300">Content-Type</td>
                <td className="px-4 py-2 text-red-400">Required</td>
                <td className="px-4 py-2 text-zinc-500">application/json</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Request Body</h4>
        <div className="mb-4 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-xs">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Field</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Type</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Required</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {[
                ['title', 'string', 'Yes', 'Short bug title'],
                ['description', 'string', 'Yes', 'Detailed description'],
                ['priority', 'enum', 'No', 'LOW · MEDIUM · HIGH · CRITICAL (default: MEDIUM)'],
                ['appVersion', 'string', 'No', 'App version (e.g. "1.2.3")'],
                ['deviceInfo', 'string', 'No', 'Device/OS details'],
                ['stackTrace', 'string', 'No', 'Stack trace or error log'],
                ['reporterEmail', 'email', 'No', 'Reporter email address'],
              ].map(([field, type, req, desc]) => (
                <tr key={field}>
                  <td className="px-4 py-2 font-mono text-zinc-300">{field}</td>
                  <td className="px-4 py-2 text-zinc-500">{type}</td>
                  <td className="px-4 py-2">{req === 'Yes' ? <span className="text-red-400">Required</span> : <span className="text-zinc-500">Optional</span>}</td>
                  <td className="px-4 py-2 text-zinc-500">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">cURL Example</h4>
        <CodeBlock code={curlReport} id="curl-report" />
      </div>

      <hr className="border-zinc-800" />

      {/* Get bugs */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400">GET</span>
          <code className="text-xs text-zinc-300 font-mono">/api/v1/bugs</code>
        </div>
        <p className="mb-3 text-xs text-zinc-500">Fetch bug reports for this application. Supports filtering via query params.</p>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Query Parameters</h4>
        <div className="mb-4 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-xs">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Param</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {[
                ['status', 'Filter: OPEN · IN_PROGRESS · RESOLVED · CLOSED'],
                ['priority', 'Filter: LOW · MEDIUM · HIGH · CRITICAL'],
                ['limit', 'Number of results (default: 50, max: 100)'],
                ['offset', 'Pagination offset (default: 0)'],
              ].map(([param, desc]) => (
                <tr key={param}>
                  <td className="px-4 py-2 font-mono text-zinc-300">{param}</td>
                  <td className="px-4 py-2 text-zinc-500">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">cURL Example</h4>
        <CodeBlock code={curlGetBugs} id="curl-get" />
      </div>

      <hr className="border-zinc-800" />

      {/* JS Example */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">JavaScript / TypeScript</h4>
        <CodeBlock code={jsExample} id="js-example" />
      </div>

      <hr className="border-zinc-800" />

      {/* Submit feedback */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs font-bold text-indigo-400">POST</span>
          <code className="text-xs text-zinc-300 font-mono">/api/v1/feedback</code>
        </div>
        <p className="mb-3 text-xs text-zinc-500">Submit a new piece of feedback. Requires your API key in the request header.</p>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Request Headers</h4>
        <div className="mb-4 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-xs">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Header</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Required</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              <tr>
                <td className="px-4 py-2 font-mono text-zinc-300">x-api-key</td>
                <td className="px-4 py-2 text-red-400">Required</td>
                <td className="px-4 py-2 text-zinc-500">Your application API key</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-zinc-300">Content-Type</td>
                <td className="px-4 py-2 text-red-400">Required</td>
                <td className="px-4 py-2 text-zinc-500">application/json</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Request Body</h4>
        <div className="mb-4 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-xs">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Field</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Type</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Required</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {[
                ['title', 'string', 'Yes', 'Short feedback title (max 255 chars)'],
                ['message', 'string', 'Yes', 'Full feedback message'],
                ['type', 'enum', 'No', 'GENERAL · SUGGESTION · COMPLAINT · COMPLIMENT (default: GENERAL)'],
                ['rating', 'number', 'No', 'Star rating from 1 to 5'],
                ['appVersion', 'string', 'No', 'App version (e.g. "2.0.0")'],
                ['reporterEmail', 'email', 'No', 'Reporter email address'],
              ].map(([field, type, req, desc]) => (
                <tr key={field}>
                  <td className="px-4 py-2 font-mono text-zinc-300">{field}</td>
                  <td className="px-4 py-2 text-zinc-500">{type}</td>
                  <td className="px-4 py-2">{req === 'Yes' ? <span className="text-red-400">Required</span> : <span className="text-zinc-500">Optional</span>}</td>
                  <td className="px-4 py-2 text-zinc-500">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Response (201 Created)</h4>
        <div className="mb-4 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-xs">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Field</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Type</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {[
                ['id', 'string', 'Unique ID of the created feedback'],
                ['type', 'enum', 'The feedback type'],
                ['status', 'enum', 'Always NEW on creation'],
                ['createdAt', 'datetime', 'ISO 8601 timestamp'],
              ].map(([field, type, desc]) => (
                <tr key={field}>
                  <td className="px-4 py-2 font-mono text-zinc-300">{field}</td>
                  <td className="px-4 py-2 text-zinc-500">{type}</td>
                  <td className="px-4 py-2 text-zinc-500">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">cURL Example</h4>
        <CodeBlock code={curlSubmitFeedback} id="curl-submit-feedback" />
      </div>

      <hr className="border-zinc-800" />

      {/* Get feedback */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400">GET</span>
          <code className="text-xs text-zinc-300 font-mono">/api/v1/feedback</code>
        </div>
        <p className="mb-3 text-xs text-zinc-500">Fetch feedback for this application. Supports filtering by type and status via query params.</p>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Query Parameters</h4>
        <div className="mb-4 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-xs">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Param</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {[
                ['type', 'Filter: GENERAL · SUGGESTION · COMPLAINT · COMPLIMENT'],
                ['status', 'Filter: NEW · READ · ARCHIVED'],
                ['limit', 'Number of results (default: 50, max: 100)'],
                ['offset', 'Pagination offset (default: 0)'],
              ].map(([param, desc]) => (
                <tr key={param}>
                  <td className="px-4 py-2 font-mono text-zinc-300">{param}</td>
                  <td className="px-4 py-2 text-zinc-500">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Response (200 OK)</h4>
        <div className="mb-4 overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-xs">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Field</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Type</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-400">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {[
                ['feedback', 'array', 'Array of feedback objects'],
                ['total', 'number', 'Total matching records (before pagination)'],
                ['limit', 'number', 'Applied limit'],
                ['offset', 'number', 'Applied offset'],
              ].map(([field, type, desc]) => (
                <tr key={field}>
                  <td className="px-4 py-2 font-mono text-zinc-300">{field}</td>
                  <td className="px-4 py-2 text-zinc-500">{type}</td>
                  <td className="px-4 py-2 text-zinc-500">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">cURL Example</h4>
        <CodeBlock code={curlGetFeedback} id="curl-get-feedback" />
      </div>

      <hr className="border-zinc-800" />

      {/* Feedback JS Example */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Feedback — JavaScript / TypeScript</h4>
        <CodeBlock code={jsFeedbackExample} id="js-feedback-example" />
      </div>
    </div>
  )
}
