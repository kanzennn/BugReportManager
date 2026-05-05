'use client'

import { useActionState } from 'react'
import { updateApplicationAction } from '@/app/actions/applications'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { AppType } from '@prisma/client'

const APP_TYPES = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'ANDROID', label: 'Android' },
  { value: 'IOS', label: 'iOS' },
  { value: 'DESKTOP', label: 'Desktop' },
]

interface AppData {
  id: string
  name: string
  type: AppType
  description: string | null
}

export function EditApplicationForm({ app }: { app: AppData }) {
  const boundAction = updateApplicationAction.bind(null, app.id)
  const [state, action, pending] = useActionState(boundAction, null)

  return (
    <>
      <div>
        <Link href={`/dashboard/applications/${app.id}`} className="mb-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">Edit Application</h1>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <form action={action} className="space-y-5">
          {state?.error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Application Name <span className="text-red-400">*</span>
            </label>
            <input
              id="name" name="name" type="text" required
              defaultValue={app.name}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Application Type <span className="text-red-400">*</span>
            </label>
            <select
              id="type" name="type" required
              defaultValue={app.type}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {APP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Description <span className="text-zinc-500">(optional)</span>
            </label>
            <textarea
              id="description" name="description" rows={3}
              defaultValue={app.description ?? ''}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Link
              href={`/dashboard/applications/${app.id}`}
              className="flex-1 rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600"
            >
              Cancel
            </Link>
            <button
              type="submit" disabled={pending}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
