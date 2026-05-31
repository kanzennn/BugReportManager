'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  saveTrelloTokenAction,
  saveTrelloListAction,
  disconnectTrelloAction,
  fetchTrelloBoardsAction,
  fetchTrelloListsAction,
} from '@/app/actions/trello'
import type { TrelloBoard, TrelloList } from '@/lib/trello'
import { useRouter } from 'next/navigation'

interface TrelloConnectProps {
  appId: string
  authUrl: string
  trelloToken: string | null
  trelloBoardId: string | null
  trelloBoardName: string | null
  trelloListId: string | null
  trelloListName: string | null
}

export function TrelloConnect({
  appId, authUrl,
  trelloToken, trelloBoardId, trelloBoardName, trelloListId, trelloListName,
}: TrelloConnectProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [boards, setBoards] = useState<TrelloBoard[]>([])
  const [lists, setLists] = useState<TrelloList[]>([])
  const [selectedBoard, setSelectedBoard] = useState(trelloBoardId ?? '')
  const [selectedBoardName, setSelectedBoardName] = useState(trelloBoardName ?? '')
  const [selectedList, setSelectedList] = useState(trelloListId ?? '')
  const [selectedListName, setSelectedListName] = useState(trelloListName ?? '')
  const [status, setStatus] = useState<'idle' | 'loading-boards' | 'loading-lists' | 'saving' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [tokenCaptured, setTokenCaptured] = useState(false)

  // Capture token from URL fragment after Trello redirect
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#token=')) return

    const token = hash.slice('#token='.length)
    if (!token) return

    // Clean the fragment from URL without reload
    window.history.replaceState(null, '', window.location.pathname)

    setStatus('loading-boards')
    setError(null)
    startTransition(async () => {
      try {
        await saveTrelloTokenAction(appId, token)
        const data = await fetchTrelloBoardsAction(appId)
        setBoards(data)
        setTokenCaptured(true)
        setStatus('idle')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect Trello.')
        setStatus('idle')
      }
    })
  }, [appId])

  // Load boards if token already exists but list not set
  useEffect(() => {
    if (trelloToken && !trelloListId && !tokenCaptured) {
      setStatus('loading-boards')
      startTransition(async () => {
        try {
          const data = await fetchTrelloBoardsAction(appId)
          setBoards(data)
          setStatus('idle')
        } catch {
          setStatus('idle')
        }
      })
    }
  }, [appId, trelloToken, trelloListId, tokenCaptured])

  async function handleBoardChange(boardId: string) {
    const board = boards.find((b) => b.id === boardId)
    setSelectedBoard(boardId)
    setSelectedBoardName(board?.name ?? '')
    setSelectedList('')
    setSelectedListName('')
    setLists([])
    if (!boardId) return

    setStatus('loading-lists')
    setError(null)
    try {
      const data = await fetchTrelloListsAction(appId, boardId)
      setLists(data)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lists.')
      setStatus('idle')
    }
  }

  function handleListChange(listId: string) {
    const list = lists.find((l) => l.id === listId)
    setSelectedList(listId)
    setSelectedListName(list?.name ?? '')
  }

  function handleSave() {
    if (!selectedBoard || !selectedList) return
    setError(null)
    startTransition(async () => {
      try {
        await saveTrelloListAction(appId, selectedBoard, selectedBoardName, selectedList, selectedListName)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save.')
      }
    })
  }

  function handleDisconnect() {
    setError(null)
    startTransition(async () => {
      try {
        await disconnectTrelloAction(appId)
        setBoards([])
        setLists([])
        setSelectedBoard('')
        setSelectedList('')
        setTokenCaptured(false)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to disconnect.')
      }
    })
  }

  const isConnected = !!(trelloToken && trelloListId)
  const hasToken = !!(trelloToken || tokenCaptured)
  const showPicker = hasToken && (boards.length > 0 || status === 'loading-boards')

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Trello logo mark */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0052CC]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <rect x="2.5" y="2.5" width="8.5" height="14" rx="1.5" />
              <rect x="13" y="2.5" width="8.5" height="9" rx="1.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Trello</p>
            {isConnected ? (
              <p className="text-xs text-green-400">
                Connected → <span className="text-zinc-400">{trelloBoardName}</span> / <span className="text-zinc-300">{trelloListName}</span>
              </p>
            ) : hasToken ? (
              <p className="text-xs text-yellow-400">Connected — select a board and list</p>
            ) : (
              <p className="text-xs text-zinc-500">Not connected</p>
            )}
          </div>
        </div>

        {isConnected && (
          <button
            onClick={handleDisconnect}
            disabled={pending}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            Disconnect
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Not connected — show Connect button */}
      {!hasToken && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            Connect your Trello account to push bug reports directly to a Trello list as cards.
          </p>
          <a
            href={authUrl}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0052CC] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Connect Trello
          </a>
        </div>
      )}

      {/* Token captured — loading boards */}
      {status === 'loading-boards' && (
        <p className="text-sm text-zinc-400">Loading your Trello boards…</p>
      )}

      {/* Board + list picker */}
      {showPicker && status !== 'loading-boards' && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Board</label>
            <select
              value={selectedBoard}
              onChange={(e) => handleBoardChange(e.target.value)}
              disabled={pending}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Select a board…</option>
              {boards.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {status === 'loading-lists' && (
            <p className="text-sm text-zinc-400">Loading lists…</p>
          )}

          {lists.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">List</label>
              <select
                value={selectedList}
                onChange={(e) => handleListChange(e.target.value)}
                disabled={pending}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Select a list…</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          )}

          {selectedBoard && selectedList && (
            <button
              onClick={handleSave}
              disabled={pending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save configuration'}
            </button>
          )}
        </div>
      )}

      {/* Already configured — show change option */}
      {isConnected && boards.length === 0 && (
        <button
          onClick={() => {
            setStatus('loading-boards')
            startTransition(async () => {
              try {
                const data = await fetchTrelloBoardsAction(appId)
                setBoards(data)
                if (trelloListId) {
                  const ls = await fetchTrelloListsAction(appId, trelloBoardId!)
                  setLists(ls)
                  setSelectedBoard(trelloBoardId!)
                  setSelectedList(trelloListId!)
                }
                setStatus('idle')
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load.')
                setStatus('idle')
              }
            })
          }}
          disabled={pending}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
        >
          Change board / list
        </button>
      )}
    </div>
  )
}
