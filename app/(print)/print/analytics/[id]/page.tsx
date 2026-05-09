import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getAppRole } from '@/lib/access'
import { notFound, redirect } from 'next/navigation'
import { Bug } from 'lucide-react'
import { PrintTrigger } from '@/components/analytics/print-trigger'
import { PrintLineChart } from '@/components/analytics/print-line-chart'
import { PrintBugChart } from '@/components/analytics/print-bar-chart'
import { PrintStatusChart } from '@/components/analytics/print-status-chart'

function SectionBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}

function StatCard({
  label,
  value,
  accent = '#374151',
}: {
  label: string
  value: string | number
  accent?: string
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-bold" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}

export default async function PrintAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await requireAuth()

  const role = await getAppRole(userId, id)
  if (!role) notFound()

  const [app, user] = await Promise.all([
    prisma.application.findUnique({ where: { id }, select: { name: true, type: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
  ])
  if (!app) notFound()

  // FREE users cannot access — bounce back to the gated page
  if (user?.plan === 'FREE') redirect(`/dashboard/applications/${id}/analytics`)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalBugs, bugsByStatus, bugsByPriority, recentBugs, allFeedback] = await Promise.all([
    prisma.bugReport.count({ where: { applicationId: id } }),
    prisma.bugReport.groupBy({ by: ['status'], where: { applicationId: id }, _count: { _all: true } }),
    prisma.bugReport.groupBy({ by: ['priority'], where: { applicationId: id }, _count: { _all: true } }),
    prisma.bugReport.findMany({
      where: { applicationId: id, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, appVersion: true },
    }),
    prisma.feedback.findMany({
      where: { applicationId: id },
      select: { type: true, rating: true },
    }),
  ])

  // 30-day timeline
  const dayMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    dayMap[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0
  }
  for (const bug of recentBugs) {
    const key = new Date(bug.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (key in dayMap) dayMap[key]++
  }
  const timelineData = Object.entries(dayMap).map(([date, count]) => ({ date, count }))

  // Status
  const statusMap: Record<string, number> = {}
  for (const row of bugsByStatus) statusMap[row.status] = row._count._all
  const statusChartData = [
    { name: 'Open',        value: statusMap.OPEN ?? 0,        color: '#f87171' },
    { name: 'In Progress', value: statusMap.IN_PROGRESS ?? 0, color: '#fbbf24' },
    { name: 'Resolved',    value: statusMap.RESOLVED ?? 0,    color: '#34d399' },
    { name: 'Closed',      value: statusMap.CLOSED ?? 0,      color: '#71717a' },
  ]

  // Priority
  const priorityMap: Record<string, number> = {}
  for (const row of bugsByPriority) priorityMap[row.priority] = row._count._all
  const priorityChartData = [
    { name: 'Critical', value: priorityMap.CRITICAL ?? 0, color: '#f87171' },
    { name: 'High',     value: priorityMap.HIGH ?? 0,     color: '#fb923c' },
    { name: 'Medium',   value: priorityMap.MEDIUM ?? 0,   color: '#fbbf24' },
    { name: 'Low',      value: priorityMap.LOW ?? 0,      color: '#34d399' },
  ]

  // Feedback
  const fbTypeMap: Record<string, number> = {}
  for (const fb of allFeedback) fbTypeMap[fb.type] = (fbTypeMap[fb.type] ?? 0) + 1
  const feedbackTypeData = [
    { name: 'Suggestion', value: fbTypeMap.SUGGESTION ?? 0, color: '#818cf8' },
    { name: 'Complaint',  value: fbTypeMap.COMPLAINT ?? 0,  color: '#f87171' },
    { name: 'Compliment', value: fbTypeMap.COMPLIMENT ?? 0, color: '#34d399' },
    { name: 'General',    value: fbTypeMap.GENERAL ?? 0,    color: '#71717a' },
  ]

  const ratingData = [1, 2, 3, 4, 5].map((r) => ({
    date: `${r} ★`,
    count: allFeedback.filter((f) => f.rating === r).length,
  }))

  // Stats
  const openBugs = statusMap.OPEN ?? 0
  const resolvedBugs = statusMap.RESOLVED ?? 0
  const ratedFeedback = allFeedback.filter((f) => f.rating != null)
  const avgRating =
    ratedFeedback.length > 0
      ? ratedFeedback.reduce((s, f) => s + (f.rating ?? 0), 0) / ratedFeedback.length
      : null

  // Versions
  const versionMap: Record<string, number> = {}
  for (const bug of recentBugs) {
    if (bug.appVersion) versionMap[bug.appVersion] = (versionMap[bug.appVersion] ?? 0) + 1
  }
  const topVersions = Object.entries(versionMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Date strings
  const now = new Date()
  const periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const generatedDate = fmt(now)
  const period = `${periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${fmt(now)}`

  return (
    <>
      <PrintTrigger />

      {/*
        Force white background even if the root layout body is dark-themed.
        print-color-adjust ensures chart fills & badge colors survive printing.
      */}
      <div
        className="min-h-screen bg-white text-gray-900"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}
      >
        {/* ── Top accent bar (matches the PDF's thin top stripe) ── */}
        <div className="h-2 bg-indigo-600" />

        <div className="mx-auto max-w-4xl px-10 pb-12">

          {/* ── Document header ── */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-5 pt-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
                  <Bug className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-500">Bug Report Manager</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Report</h1>
              <p className="mt-0.5 text-sm text-gray-500">{app.name}</p>
            </div>
            <div className="mt-1 text-right text-xs text-gray-400">
              <p className="font-semibold text-gray-600">Generated</p>
              <p>{generatedDate}</p>
              <p className="mt-2 font-semibold text-gray-600">Period</p>
              <p>{period}</p>
            </div>
          </div>

          {/* ── OVERVIEW ── */}
          <section className="mt-8" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <SectionBadge label="Overview" color="#475569" />
            <div className="mt-4 grid grid-cols-4 gap-3" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <StatCard label="Total Bugs"  value={totalBugs} />
              <StatCard label="Open Bugs"   value={openBugs}    accent="#ef4444" />
              <StatCard label="Resolved"    value={resolvedBugs} accent="#10b981" />
              <StatCard
                label="Avg Rating"
                value={avgRating != null ? `${avgRating.toFixed(1)} ★` : '—'}
                accent="#6366f1"
              />
            </div>
          </section>

          {/* ── BUG REPORTS ── */}
          <section className="mt-8" style={{ breakBefore: 'auto', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <SectionBadge label="Bug Reports" color="#4f46e5" />
            <div className="mt-4" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <PrintLineChart
                data={timelineData}
                title="Bugs Reported — Last 30 Days"
                lineName="Bugs"
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <PrintStatusChart data={statusChartData}  title="Status Breakdown" />
              <PrintStatusChart data={priorityChartData} title="Priority Breakdown" />
            </div>
          </section>

          {/* ── FEEDBACK ── */}
          <section className="mt-8" style={{ breakBefore: 'auto', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <SectionBadge label="Feedback" color="#059669" />
            <div className="mt-4 grid grid-cols-2 gap-3" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <PrintStatusChart data={feedbackTypeData} title="Feedback Types" />
              <PrintBugChart   data={ratingData}        title="Rating Distribution" barName="Responses" />
            </div>
          </section>

          {/* ── AFFECTED VERSIONS ── */}
          {topVersions.length > 0 && (
            <section className="mt-8" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <SectionBadge label="Affected Versions" color="#d97706" />
              <div className="mt-4 divide-y divide-gray-50 rounded-lg border border-gray-100 bg-white" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                {topVersions.map(([version, count]) => {
                  const pct =
                    recentBugs.length > 0 ? Math.round((count / recentBugs.length) * 100) : 0
                  return (
                    <div key={version} className="flex items-center gap-4 px-4 py-3">
                      <span className="w-16 shrink-0 font-mono text-sm text-gray-700">
                        {version}
                      </span>
                      <div className="flex-1 overflow-hidden rounded-full bg-gray-100" style={{ height: 7 }}>
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-28 shrink-0 text-right text-xs text-gray-500">
                        {count} bug{count !== 1 ? 's' : ''} · {pct}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* ── Document footer ── */}
        <div className="mx-auto max-w-4xl border-t border-gray-200 px-10 py-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              Bug Reports · Feedback · Analytics · {app.name}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="flex h-4 w-4 items-center justify-center rounded bg-indigo-600">
                <Bug className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-gray-500">Bug Report Manager</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
