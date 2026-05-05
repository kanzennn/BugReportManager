import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { StatsCard } from '@/components/dashboard/stats-card'
import { BugChart } from '@/components/dashboard/bug-chart'
import { StatusChart } from '@/components/dashboard/status-chart'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { Bug, AppWindow, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { relativeTime } from '@/lib/utils'

async function getDashboardData(userId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [totalApps, bugsByStatus, recentBugs, bugsByDay] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.bugReport.groupBy({
      by: ['status'],
      where: { application: { userId } },
      _count: { _all: true },
    }),
    prisma.bugReport.findMany({
      where: { application: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { application: { select: { name: true } } },
    }),
    prisma.bugReport.findMany({
      where: { application: { userId }, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
  ])

  // Build 7-day chart data
  const dayMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    dayMap[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0
  }
  for (const bug of bugsByDay) {
    const key = new Date(bug.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (key in dayMap) dayMap[key]++
  }

  const chartData = Object.entries(dayMap).map(([date, count]) => ({ date, count }))

  const statusMap: Record<string, number> = {}
  for (const row of bugsByStatus) statusMap[row.status] = row._count._all

  const statusChartData = [
    { name: 'Open', value: statusMap.OPEN ?? 0, color: '#f87171' },
    { name: 'In Progress', value: statusMap.IN_PROGRESS ?? 0, color: '#fbbf24' },
    { name: 'Resolved', value: statusMap.RESOLVED ?? 0, color: '#34d399' },
    { name: 'Closed', value: statusMap.CLOSED ?? 0, color: '#71717a' },
  ]

  const totalBugs = Object.values(statusMap).reduce((a, b) => a + b, 0)
  const openBugs = statusMap.OPEN ?? 0
  const resolvedBugs = statusMap.RESOLVED ?? 0

  return { totalApps, totalBugs, openBugs, resolvedBugs, chartData, statusChartData, recentBugs }
}

export default async function DashboardPage() {
  const { userId } = await requireAuth()
  const data = await getDashboardData(userId)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Overview of your bug reports across all applications.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Applications" value={data.totalApps} icon={AppWindow} color="indigo" />
        <StatsCard label="Total Bugs" value={data.totalBugs} icon={Bug} color="zinc" />
        <StatsCard label="Open Bugs" value={data.openBugs} icon={AlertCircle} color="red" />
        <StatsCard label="Resolved" value={data.resolvedBugs} icon={CheckCircle} color="emerald" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <BugChart data={data.chartData} />
        <StatusChart data={data.statusChartData} />
      </div>

      {/* Recent Bugs */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-100">Recent Bug Reports</h3>
          <Link href="/dashboard/bugs" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
            View all →
          </Link>
        </div>
        {data.recentBugs.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-500">
            No bug reports yet. Integrate the API to start receiving reports.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {data.recentBugs.map((bug) => (
              <Link
                key={bug.id}
                href={`/dashboard/bugs/${bug.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-800/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">{bug.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {bug.application.name} · {relativeTime(bug.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <PriorityBadge priority={bug.priority} />
                  <StatusBadge status={bug.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
