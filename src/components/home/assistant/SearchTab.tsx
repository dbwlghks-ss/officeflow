import { Plus } from 'lucide-react'
import type { AssistantSavedSearch } from '../../../types/assistant'
import SavedSearchList from './SavedSearchList'

type SearchTabProps = {
  searches: AssistantSavedSearch[]
  onAddSearch: () => void
  onSelectSearch: (search: AssistantSavedSearch) => void
  onDeleteSearch: (searchId: string) => void
}

export default function SearchTab({
  searches,
  onAddSearch,
  onSelectSearch,
  onDeleteSearch,
}: SearchTabProps) {
  return (
    <div className="flex min-h-0 flex-col gap-2">
      <button
        type="button"
        onClick={onAddSearch}
        className="inline-flex w-fit items-center justify-center gap-1.5 rounded-btn border border-line bg-surface px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
      >
        <Plus size={15} strokeWidth={1.75} aria-hidden="true" />
        검색어 저장
      </button>

      <SavedSearchList
        searches={searches}
        onSelect={onSelectSearch}
        onDelete={onDeleteSearch}
      />
    </div>
  )
}
