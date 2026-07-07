import { Clock3, Search } from 'lucide-react'
import { SEARCH_SCOPE_LABELS } from '../../../lib/assistantSearches'
import type { AssistantCommand, AssistantSavedSearch } from '../../../types/assistant'
import CommandItem from './CommandItem'

export type RecentListEntry =
  | { type: 'command'; command: AssistantCommand }
  | { type: 'search'; search: AssistantSavedSearch }

type RecentItemsListProps = {
  entries: RecentListEntry[]
  onSelectCommand: (command: AssistantCommand) => void
  onSelectSearch: (search: AssistantSavedSearch) => void
}

export default function RecentItemsList({
  entries,
  onSelectCommand,
  onSelectSearch,
}: RecentItemsListProps) {
  if (entries.length === 0) return null

  return (
    <div className="rounded-btn border border-line/60 bg-canvas/40 px-1.5 py-1.5">
      <p className="mb-1 flex items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        <Clock3 size={11} strokeWidth={1.75} aria-hidden="true" />
        최근 사용
      </p>
      <ul className="m-0 list-none space-y-0.5 p-0">
        {entries.map((entry) =>
          entry.type === 'command' ? (
            <CommandItem
              key={`cmd-${entry.command.id}`}
              command={entry.command}
              onSelect={onSelectCommand}
            />
          ) : (
            <li key={`search-${entry.search.id}`}>
              <button
                type="button"
                onClick={() => onSelectSearch(entry.search)}
                className="group flex w-full items-center gap-2 rounded-btn px-1.5 py-1.5 text-left transition-colors hover:bg-canvas/90"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-canvas text-slate-500 ring-1 ring-line/50">
                  <Search size={14} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">
                    {entry.search.title}
                  </span>
                  <span className="mt-0.5 inline-flex rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-500">
                    {SEARCH_SCOPE_LABELS[entry.search.scope]} 검색
                  </span>
                </span>
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  )
}
