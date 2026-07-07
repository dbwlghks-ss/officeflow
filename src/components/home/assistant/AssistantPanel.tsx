import { useMemo, useRef, useState } from 'react'
import {
  createCustomCommand,
  getAllCommands,
  loadCustomCommands,
  saveCustomCommands,
} from '../../../lib/assistantCommands'
import {
  createCustomSavedSearch,
  getAllSavedSearches,
  loadCustomSavedSearches,
  loadRecentItems,
  pushRecentItem,
  saveCustomSavedSearches,
  saveRecentItems,
} from '../../../lib/assistantSearches'
import {
  getLoadingAssistantResponse,
  resolveAssistantResponse,
} from '../../../lib/assistantIntent'
import {
  executeAssistantSearch,
  getLoadingSearchResponse,
} from '../../../services/assistantSearchService'
import type { AssistantCommand, AssistantResponse, AssistantSavedSearch } from '../../../types/assistant'
import AddCommandModal from './AddCommandModal'
import AddSearchModal from './AddSearchModal'
import AssistantResponseCard from './AssistantResponseCard'
import AssistantTabs, { type AssistantTab } from './AssistantTabs'
import CommandTab from './CommandTab'
import SearchTab from './SearchTab'

type AssistantPanelProps = {
  onNavigate?: (path: string) => void
}

export default function AssistantPanel({ onNavigate }: AssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<AssistantTab>('command')
  const [customCommands, setCustomCommands] = useState<AssistantCommand[]>(() => loadCustomCommands())
  const [customSearches, setCustomSearches] = useState<AssistantSavedSearch[]>(() =>
    loadCustomSavedSearches(),
  )
  const [recentItems, setRecentItems] = useState(() => loadRecentItems())
  const [response, setResponse] = useState<AssistantResponse | null>(null)
  const [checkedAt, setCheckedAt] = useState<Date | null>(null)
  const [commandModalOpen, setCommandModalOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [directQuery, setDirectQuery] = useState('')
  const requestSeq = useRef(0)

  const allCommands = useMemo(
    () => getAllCommands(customCommands),
    [customCommands],
  )

  const allSearches = useMemo(
    () => getAllSavedSearches(customSearches),
    [customSearches],
  )

  const commandMap = useMemo(
    () => new Map(allCommands.map((command) => [command.id, command])),
    [allCommands],
  )

  const recentCommands = useMemo(() => {
    return recentItems
      .filter((item) => item.type === 'command')
      .map((item) => commandMap.get(item.id))
      .filter((command): command is AssistantCommand => Boolean(command))
      .slice(0, 3)
  }, [recentItems, commandMap])

  const defaultCommands = useMemo(
    () => allCommands.filter((command) => command.source === 'default'),
    [allCommands],
  )

  function recordRecent(entry: { type: 'command' | 'search'; id: string }) {
    const next = pushRecentItem(recentItems, entry)
    setRecentItems(next)
    saveRecentItems(next)
  }

  async function runSearch(query: string, scope: AssistantSavedSearch['scope']) {
    const trimmed = query.trim()
    if (!trimmed) return

    const seq = ++requestSeq.current
    setCheckedAt(null)
    setResponse(getLoadingSearchResponse(trimmed))

    const result = await executeAssistantSearch(trimmed, scope)
    if (seq !== requestSeq.current) return
    setResponse(result)
    if (result.state === 'ready' || result.state === 'error') {
      setCheckedAt(new Date())
    }
  }

  async function handleSelectCommand(command: AssistantCommand) {
    recordRecent({ type: 'command', id: command.id })

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

  async function handleSelectSearch(search: AssistantSavedSearch) {
    recordRecent({ type: 'search', id: search.id })
    await runSearch(search.query, search.scope)
  }

  async function handleDirectSearch() {
    const trimmed = directQuery.trim()
    if (!trimmed) return
    await runSearch(trimmed, 'all')
    setDirectQuery('')
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

  function handleSaveSearch(input: {
    title: string
    query: string
    scope: AssistantSavedSearch['scope']
  }) {
    const nextCustom = [...customSearches, createCustomSavedSearch(input)]
    setCustomSearches(nextCustom)
    saveCustomSavedSearches(nextCustom)
  }

  function handleDeleteCommand(commandId: string) {
    const nextCustom = customCommands.filter((command) => command.id !== commandId)
    setCustomCommands(nextCustom)
    saveCustomCommands(nextCustom)

    const nextRecent = recentItems.filter(
      (item) => !(item.type === 'command' && item.id === commandId),
    )
    setRecentItems(nextRecent)
    saveRecentItems(nextRecent)
  }

  function handleDeleteSearch(searchId: string) {
    const nextCustom = customSearches.filter((search) => search.id !== searchId)
    setCustomSearches(nextCustom)
    saveCustomSavedSearches(nextCustom)

    const nextRecent = recentItems.filter(
      (item) => !(item.type === 'search' && item.id === searchId),
    )
    setRecentItems(nextRecent)
    saveRecentItems(nextRecent)
  }

  return (
    <>
      <section
        className="flex h-full min-h-0 flex-col"
        aria-label="OfficeFlow Assistant"
      >
        <div className="shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            OfficeFlow Assistant
          </p>
          <h2 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-slate-900 lg:text-xl">
            반복 업무 명령을 빠르게 실행하세요.
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 lg:text-sm">
            자주 쓰는 명령과 검색어를 저장해두고 빠르게 확인하세요.
          </p>

          <AssistantTabs active={activeTab} onChange={setActiveTab} />
        </div>

        <div className="mt-3 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-line/60 bg-surface/80 p-2.5 lg:p-3">
          <div
            className="min-h-0 flex-1 overflow-y-auto scrollbar-slim"
            role="tabpanel"
            aria-label={activeTab === 'command' ? '명령' : '검색'}
          >
            {activeTab === 'command' ? (
              <CommandTab
                recentCommands={recentCommands}
                defaultCommands={defaultCommands}
                customCommands={customCommands}
                onAddCommand={() => setCommandModalOpen(true)}
                onSelectCommand={handleSelectCommand}
                onDeleteCommand={handleDeleteCommand}
              />
            ) : (
              <SearchTab
                searches={allSearches}
                directQuery={directQuery}
                onDirectQueryChange={setDirectQuery}
                onDirectSearch={handleDirectSearch}
                onAddSearch={() => setSearchModalOpen(true)}
                onSelectSearch={handleSelectSearch}
                onDeleteSearch={handleDeleteSearch}
              />
            )}
          </div>

          <div className="mt-2 max-h-[108px] shrink-0 overflow-y-auto scrollbar-slim">
            <AssistantResponseCard response={response} checkedAt={checkedAt} onAction={onNavigate} compact />
          </div>
        </div>
      </section>

      <AddCommandModal
        open={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
        onSave={handleSaveCommand}
      />

      <AddSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSave={handleSaveSearch}
      />
    </>
  )
}
