'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
}

export function Pagination({ page, totalPages, total, pageSize }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function buildUrl(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (p === 1) params.delete('page')
    else params.set('page', String(p))
    const q = params.toString()
    return `${pathname}${q ? '?' + q : ''}`
  }

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('ellipsis-start')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('ellipsis-end')
    pages.push(totalPages)
  }

  const linkBase = 'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors'

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800">
      <p className="text-xs text-zinc-500">{from}–{to} of {total}</p>
      <div className="flex items-center gap-1">
        <Link
          href={buildUrl(page - 1)}
          aria-disabled={page === 1}
          className={`${linkBase} ${page === 1 ? 'pointer-events-none text-zinc-600' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}
        >
          Prev
        </Link>
        {pages.map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="px-1.5 text-xs text-zinc-600">…</span>
          ) : (
            <Link
              key={p}
              href={buildUrl(p)}
              className={`${linkBase} ${p === page ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}
            >
              {p}
            </Link>
          )
        )}
        <Link
          href={buildUrl(page + 1)}
          aria-disabled={page === totalPages}
          className={`${linkBase} ${page === totalPages ? 'pointer-events-none text-zinc-600' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}
        >
          Next
        </Link>
      </div>
    </div>
  )
}
