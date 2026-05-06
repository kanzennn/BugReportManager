'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { updateProfileAction } from '@/app/actions/profile'

type State = { error?: string; success?: string } | null

export function EditProfileForm({ currentName }: { currentName: string }) {
  const [state, action, pending] = useActionState<State, FormData>(updateProfileAction, null)

  useEffect(() => {
    if (state?.success) toast.success(state.success)
  }, [state?.success])

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Display name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={currentName}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
