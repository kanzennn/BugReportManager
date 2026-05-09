'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'

interface ChartEntry { date: string; count: number }

const COLORS = ['#6366f1', '#818cf8', '#6366f1', '#818cf8', '#6366f1', '#818cf8', '#6366f1']

export function PrintBugChart({ data, title, barName }: { data: ChartEntry[]; title: string; barName: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 11 }}
            labelStyle={{ color: '#6b7280' }}
            itemStyle={{ color: '#111827' }}
            cursor={{ fill: '#f9fafb' }}
          />
          <Bar dataKey="count" name={barName} radius={[3, 3, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            <LabelList
              dataKey="count"
              position="top"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => (v > 0 ? v : '')}
              style={{ fill: '#374151', fontSize: 10, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
