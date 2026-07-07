import { useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  createCustomCommand,
  getAllCommands,
  loadCustomCommands,
  loadRecentCommandIds,
  saveCustomCommands,
  saveRecentCommandIds,
} from '../../../lib/assistantCommands'
import {
  getLoadingAssistantResponse,
  resolveAssistantResponse,
} from '../../../lib/assistantIntent'
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
  const [checkedAt, setCheckedAt] = useState<Date | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const requestSeq = useRef(0)

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

  async function handleSelectCommand(command: AssistantCommand) {
    const nextRecent = [command.id, ...recentIds.filter((id) => id !== command.id)].slice(0, 3)
    setRecentIds(nextRecent)
    saveRecentCommandIds(nextRecent)

    const seq = ++requestSeq.current
    setCheckedAt(null)
    setResponse(getLoadingAssistantResponse())

    const result = await resolveAssistantResponse(command.intent)
    if (seq !== requestSeq.current) return
    setResponse(result)
    if (result.state === 'ready' || result.state === 'error') {
      setCheckedAt(new Date())
    }
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

  function handleDeleteCommand(commandId: string) {
    const nextCustom = customCommands.filter((command) => command.id !== commandId)
    setCustomCommands(nextCustom)
    saveCustomCommands(nextCustom)

    const nextRecent = recentIds.filter((id) => id !== commandId)
    setRecentIds(nextRecent)
    saveRecentCommandIds(nextRecent)
  }

  return (
    <>
      <section
        className="flex h-full min-h-0 flex-col lg:flex-row lg:gap-4"
        aria-label="OfficeFlow Assistant"
      >
        <div className="shrink-0 lg:w-[30%] lg:max-w-[260px]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            OfficeFlow Assistant
          </p>
          <h2 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-slate-900 lg:text-xl">
            반복 업무 명령을 빠르게 실행하세요.
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 lg:text-sm">
            자주 쓰는 업무 명령을 저장하고 클릭 한 번으로 확인하세요.
          </p>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-btn border border-line bg-surface px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
          >
            <Plus size={15} strokeWidth={1.75} aria-hidden="true" />
            명령 추가
          </button>
        </div>

        <div className="mt-3 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-line/60 bg-surface/80 p-2.5 lg:mt-0 lg:p-3">
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto scrollbar-slim">
            {recentCommands.length > 0 ? (
              <CommandList
                title="최근 사용"
                commands={recentCommands}
                onSelect={handleSelectCommand}
                variant="recent"
              />
            ) : null}

            <CommandList
              title="기본 명령"
              commands={allCommands.filter((command) => command.source === 'default')}
              onSelect={handleSelectCommand}
            />

            {customCommands.length > 0 ? (
              <CommandList
                title="저장된 명령"
                commands={customCommands}
                onSelect={handleSelectCommand}
                onDelete={handleDeleteCommand}
              />
            ) : null}
          </div>

          <div className="mt-2 max-h-[108px] shrink-0 overflow-y-auto scrollbar-slim">
            <AssistantResponseCard response={response} checkedAt={checkedAt} onAction={onNavigate} compact />
          </div>
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
