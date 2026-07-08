import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useAssistantWorkspace } from './AssistantWorkspaceProvider'
import AddCommandModal from './AddCommandModal'
import AddSearchModal from './AddSearchModal'
import type { AssistantCommand, AssistantSavedSearch } from '../../../types/assistant'
import { SEARCH_SCOPE_LABELS } from '../../../lib/assistantSearches'

const VISIBLE_LIMIT = 4

type AssistantHeroLibraryProps = {
  className?: string
}

function CommandChip({
  command,
  onSelect,
}: {
  command: AssistantCommand
  onSelect: (command: AssistantCommand) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(command)}
      className="rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm transition-colors hover:border-brand/25 hover:bg-brand-light/30 hover:text-brand"
    >
      {command.title}
    </button>
  )
}

function SearchChip({
  search,
  onSelect,
}: {
  search: AssistantSavedSearch
  onSelect: (search: AssistantSavedSearch) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(search)}
      className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white py-1 pl-2 pr-2.5 text-[11px] font-medium text-slate-600 shadow-sm transition-colors hover:border-brand/25 hover:bg-brand-light/30 hover:text-brand"
    >
      <span>{search.title}</span>
      <span className="rounded-full bg-slate-100 px-1.5 py-px text-[9px] font-medium text-slate-400">
        {SEARCH_SCOPE_LABELS[search.scope]}
      </span>
    </button>
  )
}

export default function AssistantHeroLibrary({ className = '' }: AssistantHeroLibraryProps) {
  const {
    defaultCommands,
    customCommands,
    allSearches,
    commandModalOpen,
    setCommandModalOpen,
    searchModalOpen,
    setSearchModalOpen,
    handleSelectCommand,
    handleSelectSearch,
    handleSaveCommand,
    handleSaveSearch,
  } = useAssistantWorkspace()

  const [commandsExpanded, setCommandsExpanded] = useState(false)
  const [searchesExpanded, setSearchesExpanded] = useState(false)

  const savedCommands = useMemo(
    () => [...defaultCommands, ...customCommands],
    [defaultCommands, customCommands],
  )

  const visibleCommands = commandsExpanded
    ? savedCommands
    : savedCommands.slice(0, VISIBLE_LIMIT)
  const visibleSearches = searchesExpanded ? allSearches : allSearches.slice(0, VISIBLE_LIMIT)

  return (
    <>
      <div className={'mt-4 space-y-3 border-t border-line/50 pt-4 ' + className}>
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-slate-400">저장 명령</p>
            <button
              type="button"
              onClick={() => setCommandModalOpen(true)}
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:text-brand"
            >
              <Plus size={12} aria-hidden="true" />
              추가
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
            {visibleCommands.map((command) => (
              <CommandChip key={command.id} command={command} onSelect={handleSelectCommand} />
            ))}
          </div>
          {savedCommands.length > VISIBLE_LIMIT ? (
            <button
              type="button"
              onClick={() => setCommandsExpanded((open) => !open)}
              className="mt-1.5 text-[11px] font-medium text-slate-400 transition-colors hover:text-brand"
            >
              {commandsExpanded ? '접기' : `더 보기 (${savedCommands.length - VISIBLE_LIMIT})`}
            </button>
          ) : null}
        </div>

        {allSearches.length > 0 ? (
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-slate-400">저장 검색</p>
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:text-brand"
              >
                <Plus size={12} aria-hidden="true" />
                추가
              </button>
            </div>
            <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
              {visibleSearches.map((search) => (
                <SearchChip key={search.id} search={search} onSelect={handleSelectSearch} />
              ))}
            </div>
            {allSearches.length > VISIBLE_LIMIT ? (
              <button
                type="button"
                onClick={() => setSearchesExpanded((open) => !open)}
                className="mt-1.5 text-[11px] font-medium text-slate-400 transition-colors hover:text-brand"
              >
                {searchesExpanded ? '접기' : `더 보기 (${allSearches.length - VISIBLE_LIMIT})`}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-slate-400">저장 검색</p>
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:text-brand"
            >
              <Plus size={12} aria-hidden="true" />
              검색어 저장
            </button>
          </div>
        )}
      </div>

      <AddCommandModal
        open={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
        onSave={handleSaveCommand}
      />

      <AddSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSave={handleSaveSearch}
      />
    </>
  )
}
