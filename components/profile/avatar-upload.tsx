'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { uploadAvatarAction, removeAvatarAction } from '@/app/actions/profile'
import { Camera, Upload, Trash2 } from 'lucide-react'

type State = { error?: string; success?: string } | null

export function AvatarUpload({
  currentUrl,
  initials,
}: {
  currentUrl: string | null
  initials: string
}) {
  const [state, formAction, uploading] = useActionState<State, FormData>(uploadAvatarAction, null)
  const [removePending, startRemove] = useTransition()
  const [preview, setPreview] = useState<string | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const MAX_BYTES = 5 * 1024 * 1024
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [state?.success])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation — catch errors before any server round-trip
    if (!ALLOWED_TYPES.includes(file.type)) {
      setClientError('Only JPEG, PNG, WebP, and GIF are allowed.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    if (file.size > MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1)
      setClientError(`File is ${mb} MB — maximum size is 5 MB.`)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setClientError(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
  }

  function cancelPreview() {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setClientError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const displaySrc = preview ?? currentUrl

  return (
    <div className="flex items-start gap-6">
      {/* Avatar circle */}
      <div className="relative shrink-0">
        <div className="h-24 w-24 overflow-hidden rounded-2xl border-2 border-zinc-700 bg-zinc-800">
          {displaySrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displaySrc}
              alt="Profile picture"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-indigo-600/20 text-2xl font-bold text-indigo-400">
              {initials}
            </div>
          )}
        </div>
        {/* Camera button overlay */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          title="Change photo"
          className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-600 bg-zinc-800 text-zinc-300 shadow transition-colors hover:bg-zinc-700 hover:text-zinc-100"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-3 pt-1">
        <form action={formAction} className="space-y-3">
          <input
            ref={inputRef}
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap gap-2">
            {!preview ? (
              <>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload photo
                </button>
                {currentUrl && (
                  <button
                    type="button"
                    disabled={removePending}
                    onClick={() => startRemove(async () => {
                      try {
                        await removeAvatarAction()
                        toast.success('Profile picture removed')
                      } catch {
                        toast.error('Failed to remove profile picture')
                      }
                    })}
                    className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:border-red-800/50 hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {removePending ? 'Removing…' : 'Remove'}
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  {uploading ? 'Saving…' : 'Save photo'}
                </button>
                <button
                  type="button"
                  onClick={cancelPreview}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {(clientError ?? state?.error) && (
            <p className="text-xs text-red-400">{clientError ?? state?.error}</p>
          )}
        </form>

        <p className="text-xs text-zinc-600">JPG, PNG, WebP or GIF · Max 5 MB</p>
      </div>
    </div>
  )
}
