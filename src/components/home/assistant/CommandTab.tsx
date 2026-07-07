import { Plus } from 'lucide-react'
import type { AssistantCommand } from '../../../types/assistant'
import CommandList from './CommandList'

type CommandTabProps = {
  recentCommands: AssistantCommand[]
  defaultCommands: AssistantCommand[]
  customCommands: AssistantCommand[]
  onAddCommand: () => void
  onSelectCommand: (command: AssistantCommand) => void
  onDeleteCommand: (commandId: string) => void
}

export default function CommandTab({
  recentCommands,
  defaultCommands,
  customCommands,
  onAddCommand,
  onSelectCommand,
  onDeleteCommand,
}: CommandTabProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onAddCommand}
        className="inline-flex items-center justify-center gap-1.5 rounded-btn border border-line bg-surface px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
      >
        <Plus size={15} strokeWidth={1.75} aria-hidden="true" />
        명령 추가
      </button>

      {recentCommands.length > 0 ? (
        <CommandList
          title="최근 사용 명령"
          commands={recentCommands}
          variant="recent"
          onSelect={onSelectCommand}
        />
      ) : null}

      <CommandList title="기본 명령" commands={defaultCommands} onSelect={onSelectCommand} />

      {customCommands.length > 0 ? (
        <CommandList
          title="저장된 명령"
          commands={customCommands}
          onSelect={onSelectCommand}
          onDelete={onDeleteCommand}
        />
      ) : null}
    </div>
  )
}
