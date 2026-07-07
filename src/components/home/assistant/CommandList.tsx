import type { AssistantCommand } from '../../../types/assistant'
import CommandItem from './CommandItem'

type CommandListProps = {
  title: string
  commands: AssistantCommand[]
  onSelect: (command: AssistantCommand) => void
  emptyMessage?: string
}

export default function CommandList({
  title,
  commands,
  onSelect,
  emptyMessage,
}: CommandListProps) {
  if (commands.length === 0) {
    return emptyMessage ? (
      <p className="text-xs text-slate-400">{emptyMessage}</p>
    ) : null
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <ul className="m-0 list-none space-y-0.5 p-0">
        {commands.map((command) => (
          <CommandItem key={command.id} command={command} onSelect={onSelect} />
        ))}
      </ul>
    </div>
  )
}
