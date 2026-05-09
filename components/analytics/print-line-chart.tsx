'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot,
} from 'recharts'

interface ChartEntry { date: string; count: number }

export function PrintLineChart({ data, title, lineName }: {
  data: ChartEntry[]
  title: string
  lineName: string
}) {
  // Find the single highest point — that's the only label we'll draw
  const peakIndex = data.reduce(
    (best, d, i) => (d.count > data[best].count ? i : best),
    0,
  )
  const peak = data[peakIndex]

  // Small filled dot only on non-zero points, nothing on zero
  const renderDot = (props: Record<string, unknown>) => {
    const count = (props.payload as ChartEntry).count
    if (!count) return <g key={props.index as number} />
    return (
      <circle
        key={props.index as number}
        cx={props.cx as number}
        cy={props.cy as number}
        r={2.5}
        fill="#6366f1"
        strokeWidth={0}
      />
    )
  }

  return (
    <div
      className="rounded-lg border border-gray-100 bg-white p-4"
      style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
    >
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} margin={{ top: 20, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="printLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#9ca3af', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              fontSize: 11,
            }}
            labelStyle={{ color: '#6b7280' }}
            itemStyle={{ color: '#111827' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name={lineName}
            stroke="#6366f1"
            strokeWidth={1.5}
            fill="url(#printLineGrad)"
            dot={renderDot}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />
          {/* Single label at the peak — can never overlap anything */}
          {peak.count > 0 && (
            <ReferenceDot
              x={peak.date}
              y={peak.count}
              r={4}
              fill="#6366f1"
              stroke="white"
              strokeWidth={1.5}
              label={{
                value: peak.count,
                position: 'top',
                fill: '#4f46e5',
                fontSize: 10,
                fontWeight: 700,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
