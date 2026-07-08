import { useState } from 'react'

const DEFAULT_VISIBLE = 4

type AssistantSuggestedChipsProps = {
  queries: string[]
  onSelect: (query: string) => void
  variant?: 'default' | 'hero'
  maxVisible?: number
}

export default function AssistantSuggestedChips({
  queries,
  onSelect,
  variant = 'default',
  maxVisible = DEFAULT_VISIBLE,
}: AssistantSuggestedChipsProps) {
  const [expanded, setExpanded] = useState(false)
  const onHero = variant === 'hero'

  if (queries.length === 0) return null

  const hasMore = queries.length > maxVisible
  const visible = expanded ? queries : queries.slice(0, maxVisible)

  return (
    <div className={'flex flex-wrap gap-1.5 ' + (onHero ? 'justify-center' : '')}>
      {visible.map((query) => (
        <button
          key={query}
          type="button"
          onClick={() => onSelect(query)}
          className="chip-pill"
        >
          {query}
        </button>
      ))}
      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="chip-pill text-slate-400"
          aria-label={expanded ? '추천 명령 접기' : '추천 명령 더 보기'}
        >
          {expanded ? '접기' : '···'}
        </button>
      ) : null}
    </div>
  )
}
