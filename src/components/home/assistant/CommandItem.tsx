import { useState, type MouseEvent } from 'react'
import { ChevronRight, Trash2 } from 'lucide-react'
import { INTENT_BADGE_LABELS } from '../../../lib/assistantCommands'
import { INTENT_ICONS } from '../../../lib/assistantUi'
import type { AssistantCommand } from '../../../types/assistant'

type CommandItemProps = {
  command: AssistantCommand
  onSelect: (command: AssistantCommand) => void
  onDelete?: (commandId: string) => void
}

export default function CommandItem({ command, onSelect, onDelete }: CommandItemProps) {
  const [confirming, setConfirming] = useState(false)
  const Icon = INTENT_ICONS[command.intent]
  const isCustom = command.source === 'custom'

  function handleDeleteClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    setConfirming(true)
  }

  function handleConfirmDelete() {
    onDelete?.(command.id)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <li className="rounded-btn border border-line/70 bg-canvas/80 px-2.5 py-2">
        <p className="text-xs font-medium text-slate-700">이 명령을 삭제할까요?</p>
        <div className="mt-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="rounded-md bg-danger px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-canvas"
          >
            취소
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="group flex items-center gap-0.5 rounded-btn transition-colors hover:bg-canvas/90">
      <button
        type="button"
        onClick={() => onSelect(command)}
        className="flex min-w-0 flex-1 items-center gap-2 px-1.5 py-1.5 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-canvas text-slate-500 ring-1 ring-line/50 transition-colors group-hover:bg-surface">
          <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-900">{command.title}</span>
          <span className="mt-0.5 inline-flex rounded-full bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-500">
            {INTENT_BADGE_LABELS[command.intent]}
          </span>
        </span>

        <ChevronRight
          size={15}
          strokeWidth={1.75}
          className="shrink-0 text-slate-300 transition-colors group-hover:text-slate-400"
          aria-hidden="true"
        />
      </button>

      {isCustom && onDelete ? (
        <button
          type="button"
          aria-label={`${command.title} 삭제`}
          onClick={handleDeleteClick}
          className="mr-1 grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-danger group-hover:opacity-100"
        >
          <Trash2 size={13} strokeWidth={1.75} aria-hidden="true" />
        </button>
      ) : null}
    </li>
  )
}
