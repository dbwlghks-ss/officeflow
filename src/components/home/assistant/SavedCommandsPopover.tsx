import { useEffect, useRef, useState } from 'react'
import { Bookmark, Plus, Trash2 } from 'lucide-react'
import { useAssistantWorkspace } from './AssistantWorkspaceProvider'
import AddCommandModal from './AddCommandModal'
import { INTENT_BADGE_LABELS } from '../../../lib/assistantCommands'
import { SEARCH_SCOPE_LABELS } from '../../../lib/assistantSearches'
import type { AssistantCommand, AssistantSavedSearch } from '../../../types/assistant'
import { Button } from '../../ui/primitives'

type SavedCommandsPopoverProps = {
  onItemRun?: () => void
}

export default function SavedCommandsPopover({ onItemRun }: SavedCommandsPopoverProps) {
  const {
    defaultCommands,
    customCommands,
    allSearches,
    commandModalOpen,
    setCommandModalOpen,
    handleSelectCommand,
    handleSelectSearch,
    handleSaveCommand,
    handleDeleteCommand,
    handleDeleteSearch,
    setDirectQuery,
  } = useAssistantWorkspace()

  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const savedCommands = [...defaultCommands, ...customCommands]

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [open])

  async function runCommand(command: AssistantCommand) {
    setDirectQuery(command.prompt)
    setOpen(false)
    onItemRun?.()
    await handleSelectCommand(command)
  }

  async function runSearch(search: AssistantSavedSearch) {
    setDirectQuery(search.query)
    setOpen(false)
    onItemRun?.()
    await handleSelectSearch(search)
  }

  const isEmpty = savedCommands.length === 0 && allSearches.length === 0

  return (
    <div ref={containerRef} className="relative shrink-0">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="h-[60px] gap-1.5 rounded-full border-line px-4 text-sm font-medium whitespace-nowrap lg:h-[64px]"
      >
        <Bookmark size={15} strokeWidth={1.75} aria-hidden="true" />
        저장 명령 보기
      </Button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),320px)] overflow-hidden rounded-[16px] border border-line bg-surface shadow-pop"
          role="dialog"
          aria-label="저장 명령"
        >
          <div className="border-b border-line/70 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">저장 명령</p>
            <p className="mt-0.5 text-xs text-slate-500">자주 쓰는 명령을 빠르게 실행합니다.</p>
          </div>

          <div className="max-h-[min(360px,50vh)] overflow-y-auto scrollbar-slim p-2">
            {isEmpty ? (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-slate-600">저장된 명령이 없습니다.</p>
                <p className="mt-1 text-xs text-slate-400">명령을 추가해 두면 여기에 표시됩니다.</p>
              </div>
            ) : (
              <ul className="m-0 list-none space-y-0.5 p-0">
                {savedCommands.map((command) => (
                  <SavedCommandRow
                    key={command.id}
                    title={command.title}
                    badge={INTENT_BADGE_LABELS[command.intent]}
                    deletable={command.source === 'custom'}
                    onRun={() => void runCommand(command)}
                    onDelete={() => handleDeleteCommand(command.id)}
                  />
                ))}
                {allSearches.map((search) => (
                  <SavedCommandRow
                    key={search.id}
                    title={search.title}
                    badge={SEARCH_SCOPE_LABELS[search.scope]}
                    deletable={search.source === 'custom'}
                    onRun={() => void runSearch(search)}
                    onDelete={() => handleDeleteSearch(search.id)}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-line/70 p-2">
            <button
              type="button"
              onClick={() => {
                setCommandModalOpen(true)
                setOpen(false)
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-btn border border-line bg-canvas/50 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-canvas"
            >
              <Plus size={14} aria-hidden="true" />
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
    </div>
  )
}

function SavedCommandRow({
  title,
  badge,
  deletable,
  onRun,
  onDelete,
}: {
  title: string
  badge: string
  deletable: boolean
  onRun: () => void
  onDelete: () => void
}) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <li className="rounded-btn bg-canvas/60 px-3 py-2">
        <p className="text-xs font-medium text-slate-700">삭제할까요?</p>
        <div className="mt-2 flex gap-1.5">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md bg-danger px-2 py-1 text-[11px] font-medium text-white"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-md border border-line px-2 py-1 text-[11px] font-medium text-slate-600"
          >
            취소
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="group flex items-center gap-1 rounded-btn hover:bg-canvas/60">
      <button
        type="button"
        onClick={onRun}
        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
      >
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{title}</span>
        <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-500">
          {badge}
        </span>
      </button>
      {deletable ? (
        <button
          type="button"
          aria-label={`${title} 삭제`}
          onClick={() => setConfirming(true)}
          className="mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-danger group-hover:opacity-100"
        >
          <Trash2 size={13} aria-hidden="true" />
        </button>
      ) : null}
    </li>
  )
}
