import { useMemo } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useAssistantWorkspace } from './AssistantWorkspaceProvider'
import AddCommandModal from './AddCommandModal'
import AssistantSuggestedChips from './AssistantSuggestedChips'
import type { AssistantCommand, AssistantSavedSearch } from '../../../types/assistant'

type CombinedSavedItem =
  | { kind: 'command'; id: string; title: string; data: AssistantCommand }
  | { kind: 'search'; id: string; title: string; data: AssistantSavedSearch }

type SavedCommandsMenuProps = {
  searchSlot: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SavedCommandsMenu({ searchSlot, open, onOpenChange }: SavedCommandsMenuProps) {
  const {
    defaultCommands,
    customCommands,
    allSearches,
    suggestedQueries,
    commandModalOpen,
    setCommandModalOpen,
    handleSelectCommand,
    handleSelectSearch,
    handleSaveCommand,
    handleSuggestedQuery,
    setDirectQuery,
    clearResponse,
  } = useAssistantWorkspace()

  const combinedSavedItems = useMemo<CombinedSavedItem[]>(() => {
    const commands = [...defaultCommands, ...customCommands].map((command) => ({
      kind: 'command' as const,
      id: `command-${command.id}`,
      title: command.title,
      data: command,
    }))
    const searches = allSearches.map((search) => ({
      kind: 'search' as const,
      id: `search-${search.id}`,
      title: search.title,
      data: search,
    }))
    return [...commands, ...searches]
  }, [defaultCommands, customCommands, allSearches])

  function toggleOpen() {
    const next = !open
    if (next) clearResponse()
    onOpenChange(next)
  }

  async function runItem(item: CombinedSavedItem) {
    onOpenChange(false)
    if (item.kind === 'command') {
      setDirectQuery(item.data.prompt)
      await handleSelectCommand(item.data)
      return
    }
    setDirectQuery(item.data.query)
    await handleSelectSearch(item.data)
  }

  async function runSuggestedQuery(query: string) {
    onOpenChange(false)
    await handleSuggestedQuery(query)
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="min-w-0 flex-1">{searchSlot}</div>
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={open}
          className={
            'inline-flex h-[52px] shrink-0 items-center justify-center gap-1 self-end rounded-full ' +
            'border border-slate-200/70 bg-surface px-4 text-xs font-medium text-slate-500 transition-colors ' +
            'hover:border-brand/20 hover:bg-brand-light/30 hover:text-brand sm:self-auto lg:h-[56px]'
          }
        >
          저장 명령
          <ChevronDown
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className={'transition-transform ' + (open ? 'rotate-180' : '')}
          />
        </button>
      </div>

      {open ? (
        <div
          className={
            'assistant-result-popover absolute left-0 right-0 top-full z-40 mt-2 max-h-[min(280px,45vh)] ' +
            'overflow-y-auto rounded-2xl border border-line/80 bg-surface p-4 shadow-soft scrollbar-slim'
          }
        >
          {suggestedQueries.length > 0 ? (
            <div className="mb-4">
              <p className="text-[11px] font-medium text-slate-400">추천 명령</p>
              <div className="mt-2">
                <AssistantSuggestedChips
                  variant="hero"
                  queries={suggestedQueries}
                  onSelect={(query) => void runSuggestedQuery(query)}
                />
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-[11px] font-medium text-slate-400">저장 명령</p>
            {combinedSavedItems.length === 0 ? (
              <p className="mt-2 py-1 text-center text-[11px] text-slate-400">
                저장된 명령이 없습니다.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {combinedSavedItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void runItem(item)}
                    className={
                      'rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] ' +
                      'font-medium text-slate-600 transition-colors hover:border-brand/25 hover:bg-brand-light/30 hover:text-brand'
                    }
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-center border-t border-line/60 pt-3">
            <button
              type="button"
              onClick={() => setCommandModalOpen(true)}
              className={
                'inline-flex items-center gap-1 rounded-full border border-line/80 bg-canvas/50 px-3 py-1.5 ' +
                'text-[11px] font-medium text-slate-500 transition-colors hover:border-brand/20 hover:bg-brand-light/30 hover:text-brand'
              }
            >
              <Plus size={12} aria-hidden="true" />
              명령 추가
            </button>
          </div>
        </div>
      ) : null}

      <AddCommandModal
        open={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
        onSave={handleSaveCommand}
      />
    </>
  )
}
