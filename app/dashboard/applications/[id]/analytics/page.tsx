import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getAppRole } from '@/lib/access'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart2, Lock, Bug, CheckCircle, AlertCircle, Star } from 'lucide-react'
import { BugChart } from '@/components/dashboard/bug-chart'
import { StatusChart } from '@/components/dashboard/status-chart'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ExportPdfButton } from '@/components/analytics/export-pdf-button'

export default async function AppAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await requireAuth()

  const role = await getAppRole(userId, id)
  if (!role) notFound()

  const [app, user] = await Promise.all([
    prisma.application.findUnique({ where: { id }, select: { name: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
  ])
  if (!app) notFound()

  // --- Upgrade wall for FREE plan ---
  if (user?.plan === 'FREE') {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href={`/dashboard/applications/${id}`}
            className="print:hidden mb-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {app.name}
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400">
              <BarChart2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">Analytics</h1>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-24 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/10">
            <Lock className="h-7 w-7 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100">Analytics is a Pro feature</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
            Upgrade to Pro or Business to unlock detailed analytics — bug trends, priority breakdowns,
            feedback ratings, app version reports, and more.
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Upgrade Plan
          </Link>
        </div>
      </div>
    )
  }

  // --- Fetch analytics data ---
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalBugs, bugsByStatus, bugsByPriority, recentBugs, allFeedback] = await Promise.all([
    prisma.bugReport.count({ where: { applicationId: id } }),
    prisma.bugReport.groupBy({
      by: ['status'],
      where: { applicationId: id },
      _count: { _all: true },
    }),
    prisma.bugReport.groupBy({
      by: ['priority'],
      where: { applicationId: id },
      _count: { _all: true },
    }),
    prisma.bugReport.findMany({
      where: { applicationId: id, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, appVersion: true },
    }),
    prisma.feedback.findMany({
      where: { applicationId: id },
      select: { type: true, rating: true },
    }),
  ])

  // 30-day bug timeline
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

  // Status breakdown
  const statusMap: Record<string, number> = {}
  for (const row of bugsByStatus) statusMap[row.status] = row._count._all
  const statusChartData = [
    { name: 'Open',        value: statusMap.OPEN ?? 0,        color: '#f87171' },
    { name: 'In Progress', value: statusMap.IN_PROGRESS ?? 0, color: '#fbbf24' },
    { name: 'Resolved',    value: statusMap.RESOLVED ?? 0,    color: '#34d399' },
    { name: 'Closed',      value: statusMap.CLOSED ?? 0,      color: '#71717a' },
  ]

  // Priority breakdown
  const priorityMap: Record<string, number> = {}
  for (const row of bugsByPriority) priorityMap[row.priority] = row._count._all
  const priorityChartData = [
    { name: 'Critical', value: priorityMap.CRITICAL ?? 0, color: '#f87171' },
    { name: 'High',     value: priorityMap.HIGH ?? 0,     color: '#fb923c' },
    { name: 'Medium',   value: priorityMap.MEDIUM ?? 0,   color: '#fbbf24' },
    { name: 'Low',      value: priorityMap.LOW ?? 0,      color: '#34d399' },
  ]

  // Feedback type breakdown
  const fbTypeMap: Record<string, number> = {}
  for (const fb of allFeedback) fbTypeMap[fb.type] = (fbTypeMap[fb.type] ?? 0) + 1
  const feedbackTypeData = [
    { name: 'Suggestion', value: fbTypeMap.SUGGESTION ?? 0, color: '#818cf8' },
    { name: 'Complaint',  value: fbTypeMap.COMPLAINT ?? 0,  color: '#f87171' },
    { name: 'Compliment', value: fbTypeMap.COMPLIMENT ?? 0, color: '#34d399' },
    { name: 'General',    value: fbTypeMap.GENERAL ?? 0,    color: '#71717a' },
  ]

  // Rating distribution (1–5 stars)
  const ratingData = [1, 2, 3, 4, 5].map((r) => ({
    date: `${r} ★`,
    count: allFeedback.filter((f) => f.rating === r).length,
  }))

  // Summary stats
  const openBugs = statusMap.OPEN ?? 0
  const resolvedBugs = statusMap.RESOLVED ?? 0
  const ratedFeedback = allFeedback.filter((f) => f.rating != null)
  const avgRating = ratedFeedback.length > 0
    ? ratedFeedback.reduce((s, f) => s + (f.rating ?? 0), 0) / ratedFeedback.length
    : null

  // Top affected app versions (last 30 days)
  const versionMap: Record<string, number> = {}
  for (const bug of recentBugs) {
    if (bug.appVersion) versionMap[bug.appVersion] = (versionMap[bug.appVersion] ?? 0) + 1
  }
  const topVersions = Object.entries(versionMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/applications/${id}`}
          className="mb-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {app.name}
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Analytics Report</h1>
              <p className="text-sm text-zinc-400">{app.name} · Last 30 days</p>
            </div>
          </div>
          <ExportPdfButton printUrl={`/print/analytics/${id}`} />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatsCard label="Total Bugs" value={totalBugs} icon={Bug} color="zinc" />
        <StatsCard label="Open Bugs" value={openBugs} icon={AlertCircle} color="red" />
        <StatsCard label="Resolved" value={resolvedBugs} icon={CheckCircle} color="emerald" />
        <StatsCard
          label="Avg Rating"
          value={avgRating != null ? `${avgRating.toFixed(1)} ★` : '—'}
          icon={Star}
          color="indigo"
          sub={ratedFeedback.length > 0 ? `from ${ratedFeedback.length} responses` : 'no ratings yet'}
        />
      </div>

      {/* Bug timeline */}
      <BugChart data={timelineData} title="Bugs Reported — Last 30 Days" barName="Bugs" />

      {/* Status + Priority breakdown */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <StatusChart data={statusChartData} title="Bug Status Breakdown" />
        <StatusChart data={priorityChartData} title="Bug Priority Breakdown" />
      </div>

      {/* Feedback type + rating distribution */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <StatusChart data={feedbackTypeData} title="Feedback Type Breakdown" />
        <BugChart data={ratingData} title="Feedback Rating Distribution" barName="Responses" />
      </div>

      {/* Affected app versions */}
      {topVersions.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h3 className="text-sm font-semibold text-zinc-100">
              Affected App Versions
              <span className="ml-2 font-normal text-zinc-500">last 30 days</span>
            </h3>
          </div>
          <div className="divide-y divide-zinc-800">
            {topVersions.map(([version, count]) => {
              const pct = recentBugs.length > 0 ? Math.round((count / recentBugs.length) * 100) : 0
              return (
                <div key={version} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-20 shrink-0 font-mono text-sm text-zinc-300">{version}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="w-24 shrink-0 text-right text-sm text-zinc-400">
                    {count} bug{count !== 1 ? 's' : ''} · {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
