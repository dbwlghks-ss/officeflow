import { useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { SEARCH_SCOPE_LABELS } from '../../../lib/assistantSearches'
import type { AssistantSavedSearch } from '../../../types/assistant'

type SavedSearchListProps = {
  searches: AssistantSavedSearch[]
  onSelect: (search: AssistantSavedSearch) => void
  onDelete?: (searchId: string) => void
}

export default function SavedSearchList({ searches, onSelect, onDelete }: SavedSearchListProps) {
  if (searches.length === 0) return null

  return (
    <div>
      <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        저장된 검색어
      </p>
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {searches.map((search) => (
          <SavedSearchChip
            key={search.id}
            search={search}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  )
}

function SavedSearchChip({
  search,
  onSelect,
  onDelete,
}: {
  search: AssistantSavedSearch
  onSelect: (search: AssistantSavedSearch) => void
  onDelete?: (searchId: string) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const isCustom = search.source === 'custom'

  if (confirming) {
    return (
      <li className="w-full rounded-btn border border-line/70 bg-canvas/80 px-2.5 py-2">
        <p className="text-xs font-medium text-slate-700">이 검색어를 삭제할까요?</p>
        <div className="mt-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDelete?.(search.id)}
            className="rounded-md bg-danger px-2.5 py-1 text-xs font-medium text-white"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            취소
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onSelect(search)}
        className="inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-canvas/60 py-1 pl-2 pr-2.5 text-left transition-colors hover:border-brand/25 hover:bg-brand-light/30"
      >
        <Search size={12} className="shrink-0 text-slate-400" aria-hidden="true" />
        <span className="text-xs font-medium text-slate-800">{search.title}</span>
        <span className="rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-500">
          {SEARCH_SCOPE_LABELS[search.scope]}
        </span>
      </button>
      {isCustom && onDelete ? (
        <button
          type="button"
          aria-label={`${search.title} 삭제`}
          onClick={() => setConfirming(true)}
          className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-surface text-slate-400 opacity-0 shadow-sm ring-1 ring-line transition-opacity hover:text-danger group-hover:opacity-100"
        >
          <Trash2 size={9} strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}
    </li>
  )
}
