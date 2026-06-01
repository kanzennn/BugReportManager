'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useTheme } from '@/components/theme-provider'

interface ChartEntry {
  date: string
  count: number
}

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#eef2ff', '#f5f3ff']

export function BugChart({ data, title, barName }: { data: ChartEntry[]; title: string; barName: string }) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme !== 'light'

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#27272a' : '#e4e4e7'} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: dark ? '#18181b' : '#ffffff',
              border: `1px solid ${dark ? '#3f3f46' : '#e4e4e7'}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: dark ? '#a1a1aa' : '#71717a' }}
            itemStyle={{ color: dark ? '#fafafa' : '#18181b' }}
            cursor={{ fill: dark ? '#3f3f46' : '#f4f4f5' }}
          />
          <Bar dataKey="count" name={barName} radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
