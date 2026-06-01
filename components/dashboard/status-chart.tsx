'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '@/components/theme-provider'

interface StatusEntry {
  name: string
  value: number
  color: string
}

export function StatusChart({ data, title }: { data: StatusEntry[]; title: string }) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme !== 'light'

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{
              background: dark ? '#18181b' : '#ffffff',
              border: `1px solid ${dark ? '#27272a' : '#e4e4e7'}`,
              borderRadius: 8,
              color: dark ? '#fafafa' : '#18181b',
              fontSize: 12,
            }}
          />
          <Legend formatter={(value) => (
            <span style={{ color: dark ? '#a1a1aa' : '#52525b', fontSize: 12 }}>{value}</span>
          )} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
