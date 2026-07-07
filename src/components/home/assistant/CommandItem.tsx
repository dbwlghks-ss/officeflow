import { Terminal } from 'lucide-react'
import type { AssistantCommand } from '../../../types/assistant'

type CommandItemProps = {
  command: AssistantCommand
  onSelect: (command: AssistantCommand) => void
}

export default function CommandItem({ command, onSelect }: CommandItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(command)}
        className="group flex w-full items-center gap-2.5 rounded-btn px-2 py-2 text-left transition-colors hover:bg-canvas"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-canvas text-slate-500">
          <Terminal size={14} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-900">{command.title}</span>
          <span className="block truncate text-xs text-slate-500">{command.prompt}</span>
        </span>
      </button>
    </li>
  )
}
