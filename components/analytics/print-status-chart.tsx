'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface StatusEntry { name: string; value: number; color: string }

const RADIAN = Math.PI / 180

function SliceLabel(props: Record<string, unknown>) {
  const { cx, cy, midAngle, outerRadius, value } = props as {
    cx: number; cy: number; midAngle: number; outerRadius: number; value: number
  }
  if (!value) return null
  const r = outerRadius + 18
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#374151"
      fontSize={11}
      fontWeight={700}
    >
      {value}
    </text>
  )
}

export function PrintStatusChart({ data, title }: { data: StatusEntry[]; title: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={38}
            outerRadius={55}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={(props) => <SliceLabel {...(props as unknown as Record<string, unknown>)} />}
          >
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 11 }}
            labelStyle={{ color: '#6b7280' }}
            itemStyle={{ color: '#111827' }}
          />
          <Legend
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: '#6b7280', fontSize: 10 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
