import { useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const KEYWORD_ROUTES: { keywords: string[]; path: string }[] = [
  { keywords: ['식수', 'meal'], path: '/meal' },
  { keywords: ['설문', 'survey'], path: '/survey' },
  { keywords: ['공지', 'notice'], path: '/notice' },
]

function matchRoute(query: string): string | null {
  const normalized = query.trim().toLowerCase()
  for (const route of KEYWORD_ROUTES) {
    if (route.keywords.some((keyword) => normalized.includes(keyword))) {
      return route.path
    }
  }
  return null
}

export default function HeaderCompactSearch() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return

    const path = matchRoute(trimmed)
    if (path) {
      navigate(path)
      setValue('')
      return
    }

    navigate('/', { state: { pendingAsk: trimmed } })
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="header-compact-search" className="sr-only">
        빠른 검색
      </label>
      <div className="flex h-10 items-center gap-2 rounded-full border border-line bg-canvas/60 px-3 transition-colors focus-within:border-brand/25 focus-within:bg-surface">
        <Search size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
        <input
          id="header-compact-search"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="검색 (식수, 설문, 공지...)"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </form>
  )
}
