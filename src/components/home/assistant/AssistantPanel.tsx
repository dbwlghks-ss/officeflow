import { useMemo, useRef, useState } from 'react'
import { Plus, Search } from 'lucide-react'
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
import AssistantDirectSearch from './AssistantDirectSearch'
import AssistantResponseCard from './AssistantResponseCard'
import CommandList from './CommandList'
import RecentItemsList, { type RecentListEntry } from './RecentItemsList'
import SavedSearchList from './SavedSearchList'

type AssistantPanelProps = {
  onNavigate?: (path: string) => void
}

export default function AssistantPanel({ onNavigate }: AssistantPanelProps) {
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

  const searchMap = useMemo(
    () => new Map(allSearches.map((search) => [search.id, search])),
    [allSearches],
  )

  const recentEntries = useMemo(() => {
    return recentItems
      .map((item): RecentListEntry | null => {
        if (item.type === 'command') {
          const command = commandMap.get(item.id)
          return command ? { type: 'command', command } : null
        }
        const search = searchMap.get(item.id)
        return search ? { type: 'search', search } : null
      })
      .filter((entry): entry is RecentListEntry => Boolean(entry))
  }, [recentItems, commandMap, searchMap])

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
            자주 쓰는 명령과 검색어를 저장해두고 빠르게 확인하세요.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCommandModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-btn border border-line bg-surface px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
            >
              <Plus size={15} strokeWidth={1.75} aria-hidden="true" />
              명령 추가
            </button>
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-btn border border-line bg-surface px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
            >
              <Search size={15} strokeWidth={1.75} aria-hidden="true" />
              검색어 저장
            </button>
          </div>
        </div>

        <div className="mt-3 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-line/60 bg-surface/80 p-2.5 lg:mt-0 lg:p-3">
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto scrollbar-slim">
            {recentEntries.length > 0 ? (
              <RecentItemsList
                entries={recentEntries}
                onSelectCommand={handleSelectCommand}
                onSelectSearch={handleSelectSearch}
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

            <SavedSearchList
              searches={allSearches}
              onSelect={handleSelectSearch}
              onDelete={handleDeleteSearch}
            />
          </div>

          <AssistantDirectSearch
            value={directQuery}
            onChange={setDirectQuery}
            onSubmit={handleDirectSearch}
          />

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
