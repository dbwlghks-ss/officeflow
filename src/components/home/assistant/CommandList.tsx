import { Clock3 } from 'lucide-react'
import type { AssistantCommand } from '../../../types/assistant'
import CommandItem from './CommandItem'

type CommandListProps = {
  title: string
  commands: AssistantCommand[]
  onSelect: (command: AssistantCommand) => void
  onDelete?: (commandId: string) => void
  variant?: 'default' | 'recent'
  emptyMessage?: string
}

export default function CommandList({
  title,
  commands,
  onSelect,
  onDelete,
  variant = 'default',
  emptyMessage,
}: CommandListProps) {
  if (commands.length === 0) {
    return emptyMessage ? (
      <p className="text-xs text-slate-400">{emptyMessage}</p>
    ) : null
  }

  const isRecent = variant === 'recent'

  return (
    <div
      className={
        isRecent
          ? 'rounded-btn border border-line/60 bg-canvas/40 px-1.5 py-1.5'
          : undefined
      }
    >
      <p
        className={
          isRecent
            ? 'mb-1 flex items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400'
            : 'mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400'
        }
      >
        {isRecent ? <Clock3 size={11} strokeWidth={1.75} aria-hidden="true" /> : null}
        {title}
      </p>
      <ul className="m-0 list-none space-y-0.5 p-0">
        {commands.map((command) => (
          <CommandItem
            key={command.id}
            command={command}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  )
}
