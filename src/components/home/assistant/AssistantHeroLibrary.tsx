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
  compact?: boolean
}

function CommandChip({
  command,
  onSelect,
}: {
  command: AssistantCommand
  onSelect: (command: AssistantCommand) => void
}) {
  return (
    <button type="button" onClick={() => onSelect(command)} className="chip-pill">
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
    <button type="button" onClick={() => onSelect(search)} className="chip-pill gap-1">
      <span>{search.title}</span>
      <span className="text-[9px] font-medium text-slate-400">
        {SEARCH_SCOPE_LABELS[search.scope]}
      </span>
    </button>
  )
}

export default function AssistantHeroLibrary({
  className = '',
  compact = false,
}: AssistantHeroLibraryProps) {
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

  const align = compact ? 'justify-start' : 'justify-center'

  return (
    <>
      <div className={'mt-3 space-y-2 border-t border-line/60 pt-3 ' + className}>
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium text-slate-400">저장 명령</p>
            <button
              type="button"
              onClick={() => setCommandModalOpen(true)}
              className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 motion-subtle hover:text-brand"
            >
              <Plus size={11} aria-hidden="true" />
              추가
            </button>
          </div>
          <div className={'mt-1 flex flex-wrap gap-1.5 ' + align}>
            {visibleCommands.map((command) => (
              <CommandChip key={command.id} command={command} onSelect={handleSelectCommand} />
            ))}
            {savedCommands.length > VISIBLE_LIMIT ? (
              <button
                type="button"
                onClick={() => setCommandsExpanded((open) => !open)}
                className="chip-pill text-slate-400"
                aria-label={commandsExpanded ? '저장 명령 접기' : '저장 명령 더 보기'}
              >
                {commandsExpanded ? '접기' : '···'}
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium text-slate-400">저장 검색</p>
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 motion-subtle hover:text-brand"
            >
              <Plus size={11} aria-hidden="true" />
              {allSearches.length > 0 ? '추가' : '검색어 저장'}
            </button>
          </div>
          {allSearches.length > 0 ? (
            <div className={'mt-1 flex flex-wrap gap-1.5 ' + align}>
              {visibleSearches.map((search) => (
                <SearchChip key={search.id} search={search} onSelect={handleSelectSearch} />
              ))}
              {allSearches.length > VISIBLE_LIMIT ? (
                <button
                  type="button"
                  onClick={() => setSearchesExpanded((open) => !open)}
                  className="chip-pill text-slate-400"
                  aria-label={searchesExpanded ? '저장 검색 접기' : '저장 검색 더 보기'}
                >
                  {searchesExpanded ? '접기' : '···'}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
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
