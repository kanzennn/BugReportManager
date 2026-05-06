import type { Metadata } from 'next'
import { ThemeToggle } from '@/components/settings/theme-toggle'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage your application preferences.</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm font-semibold text-zinc-100">Appearance</h2>
        <p className="mt-1 text-sm text-zinc-400">Choose how BugReport looks to you.</p>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
