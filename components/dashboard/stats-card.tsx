import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  color?: 'indigo' | 'red' | 'amber' | 'emerald' | 'zinc'
  sub?: string
}

const colors = {
  indigo: 'bg-indigo-500/10 text-indigo-400',
  red: 'bg-red-500/10 text-red-400',
  amber: 'bg-amber-500/10 text-amber-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  zinc: 'bg-zinc-500/10 text-zinc-400',
}

export function StatsCard({ label, value, icon: Icon, color = 'indigo', sub }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">{label}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', colors[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-zinc-100">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  )
}
