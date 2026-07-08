import { useMemo, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useAssistantWorkspace } from './AssistantWorkspaceProvider'
import AddCommandModal from './AddCommandModal'
import type { AssistantCommand, AssistantSavedSearch } from '../../../types/assistant'

type CombinedSavedItem =
  | { kind: 'command'; id: string; title: string; data: AssistantCommand }
  | { kind: 'search'; id: string; title: string; data: AssistantSavedSearch }

export default function SavedCommandsMenu() {
  const {
    defaultCommands,
    customCommands,
    allSearches,
    commandModalOpen,
    setCommandModalOpen,
    handleSelectCommand,
    handleSelectSearch,
    handleSaveCommand,
    setDirectQuery,
  } = useAssistantWorkspace()

  const [open, setOpen] = useState(false)

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

  async function runItem(item: CombinedSavedItem) {
    if (item.kind === 'command') {
      setDirectQuery(item.data.prompt)
      await handleSelectCommand(item.data)
      return
    }
    setDirectQuery(item.data.query)
    await handleSelectSearch(item.data)
  }

  return (
    <>
      <div className="mt-3">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className={
              'inline-flex items-center gap-1 rounded-full border border-line/80 bg-surface px-3 py-1.5 ' +
              'text-[11px] font-medium text-slate-500 transition-colors hover:border-brand/20 hover:bg-brand-light/30 hover:text-brand'
            }
          >
            {open ? '저장 명령 숨기기' : '저장 명령 보기'}
            <ChevronDown
              size={13}
              strokeWidth={2}
              aria-hidden="true"
              className={'transition-transform ' + (open ? 'rotate-180' : '')}
            />
          </button>
        </div>

        {open ? (
          <div
            className={
              'mx-auto mt-2 max-h-[min(220px,40vh)] w-full max-w-3xl overflow-y-auto rounded-2xl ' +
              'border border-line/80 bg-surface p-4 shadow-soft scrollbar-slim lg:max-w-4xl'
            }
          >
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-800">저장 명령</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                자주 쓰는 명령과 검색어를 빠르게 실행하세요.
              </p>
            </div>

            {combinedSavedItems.length === 0 ? (
              <p className="py-2 text-center text-[11px] text-slate-400">저장된 명령이 없습니다.</p>
            ) : (
              <div className="flex flex-wrap justify-center gap-1.5">
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
      </div>

      <AddCommandModal
        open={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
        onSave={handleSaveCommand}
      />
    </>
  )
}
