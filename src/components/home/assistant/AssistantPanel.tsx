import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  createCustomCommand,
  getAllCommands,
  loadCustomCommands,
  loadRecentCommandIds,
  saveCustomCommands,
  saveRecentCommandIds,
} from '../../../lib/assistantCommands'
import { resolveAssistantResponse } from '../../../lib/assistantIntent'
import type { AssistantCommand, AssistantResponse } from '../../../types/assistant'
import AddCommandModal from './AddCommandModal'
import AssistantResponseCard from './AssistantResponseCard'
import CommandList from './CommandList'

type AssistantPanelProps = {
  onNavigate?: (path: string) => void
}

export default function AssistantPanel({ onNavigate }: AssistantPanelProps) {
  const [customCommands, setCustomCommands] = useState<AssistantCommand[]>(() => loadCustomCommands())
  const [recentIds, setRecentIds] = useState<string[]>(() => loadRecentCommandIds())
  const [response, setResponse] = useState<AssistantResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const allCommands = useMemo(
    () => getAllCommands(customCommands),
    [customCommands],
  )

  const commandMap = useMemo(
    () => new Map(allCommands.map((command) => [command.id, command])),
    [allCommands],
  )

  const recentCommands = recentIds
    .map((id) => commandMap.get(id))
    .filter((command): command is AssistantCommand => Boolean(command))

  function handleSelectCommand(command: AssistantCommand) {
    const nextRecent = [command.id, ...recentIds.filter((id) => id !== command.id)].slice(0, 3)
    setRecentIds(nextRecent)
    saveRecentCommandIds(nextRecent)
    setResponse(resolveAssistantResponse(command.intent))
  }

  function handleSaveCommand(input: {
    title: string
    prompt: string
    intent: AssistantCommand['intent']
  }) {
    const nextCustom = [...customCommands, createCustomCommand(input)]
    setCustomCommands(nextCustom)
    saveCustomCommands(nextCustom)
  }

  return (
    <>
      <section className="flex max-h-[560px] flex-col" aria-label="OfficeFlow Assistant">
        <div className="shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            OfficeFlow Assistant
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
            자주 쓰는 업무 명령
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            반복되는 업무 질문을 저장해두고 빠르게 확인하세요.
          </p>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-btn border border-line bg-surface px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-canvas"
          >
            <Plus size={15} strokeWidth={1.75} aria-hidden="true" />
            명령 추가
          </button>
        </div>

        <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto scrollbar-slim">
          {recentCommands.length > 0 ? (
            <CommandList title="최근 사용한 명령" commands={recentCommands} onSelect={handleSelectCommand} />
          ) : null}

          <CommandList title="기본 명령" commands={allCommands.filter((c) => c.source === 'default')} onSelect={handleSelectCommand} />

          {customCommands.length > 0 ? (
            <CommandList title="저장된 명령" commands={customCommands} onSelect={handleSelectCommand} />
          ) : null}
        </div>

        <div className="shrink-0">
          <AssistantResponseCard response={response} onAction={onNavigate} />
        </div>
      </section>

      <AddCommandModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCommand}
      />
    </>
  )
}
