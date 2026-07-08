import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { detectRuleBasedIntent } from '../../../features/assistant/assistantIntent'
import {
  ASSISTANT_DATA_UPDATED_EVENT,
  executeRuleBasedIntent,
  getLoadingRuleAssistantResponse,
} from '../../../features/assistant/assistantExecutor'
import { buildSuggestedAssistantQueries } from '../../../features/assistant/assistantSuggestedQueries'
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
import {
  fetchAssistantSnapshot,
  type AssistantSnapshot,
} from '../../../services/assistantDataService'
import type { AssistantCommand, AssistantResponse, AssistantSavedSearch } from '../../../types/assistant'
import type { AssistantTab } from './AssistantTabs'

type AssistantWorkspaceContextValue = {
  activeTab: AssistantTab
  setActiveTab: (tab: AssistantTab) => void
  directQuery: string
  setDirectQuery: (value: string) => void
  response: AssistantResponse | null
  checkedAt: Date | null
  commandModalOpen: boolean
  setCommandModalOpen: (open: boolean) => void
  searchModalOpen: boolean
  setSearchModalOpen: (open: boolean) => void
  recentCommands: AssistantCommand[]
  defaultCommands: AssistantCommand[]
  customCommands: AssistantCommand[]
  allSearches: AssistantSavedSearch[]
  handleDirectQuery: (query?: string) => Promise<void>
  handleSuggestedQuery: (query: string) => Promise<void>
  handleSelectCommand: (command: AssistantCommand) => Promise<void>
  handleSelectSearch: (search: AssistantSavedSearch) => Promise<void>
  handleSaveCommand: (input: {
    title: string
    prompt: string
    intent: AssistantCommand['intent']
  }) => void
  handleSaveSearch: (input: {
    title: string
    query: string
    scope: AssistantSavedSearch['scope']
  }) => void
  handleDeleteCommand: (commandId: string) => void
  handleDeleteSearch: (searchId: string) => void
  suggestedQueries: string[]
}

const AssistantWorkspaceContext = createContext<AssistantWorkspaceContextValue | null>(null)

export function useAssistantWorkspace() {
  const context = useContext(AssistantWorkspaceContext)
  if (!context) {
    throw new Error('useAssistantWorkspace must be used within AssistantWorkspaceProvider')
  }
  return context
}

type AssistantWorkspaceProviderProps = {
  children: ReactNode
}

export function AssistantWorkspaceProvider({ children }: AssistantWorkspaceProviderProps) {
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
  const [snapshot, setSnapshot] = useState<AssistantSnapshot | null>(null)
  const requestSeq = useRef(0)

  const refreshSnapshot = useRef(async () => {
    const next = await fetchAssistantSnapshot()
    setSnapshot(next)
  })

  useEffect(() => {
    void refreshSnapshot.current()

    function handleAssistantDataUpdated() {
      void refreshSnapshot.current()
    }

    window.addEventListener(ASSISTANT_DATA_UPDATED_EVENT, handleAssistantDataUpdated)
    return () => {
      window.removeEventListener(ASSISTANT_DATA_UPDATED_EVENT, handleAssistantDataUpdated)
    }
  }, [])

  const suggestedQueries = useMemo(
    () => buildSuggestedAssistantQueries(snapshot),
    [snapshot],
  )

  const allCommands = useMemo(() => getAllCommands(customCommands), [customCommands])
  const allSearches = useMemo(() => getAllSavedSearches(customSearches), [customSearches])

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
      void refreshSnapshot.current()
    }
  }

  async function runNaturalLanguageQuery(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return

    const seq = ++requestSeq.current
    setCheckedAt(null)
    setResponse(getLoadingRuleAssistantResponse())

    const intent = detectRuleBasedIntent(trimmed)
    const result = await executeRuleBasedIntent(intent)
    if (seq !== requestSeq.current) return
    setResponse(result)
    if (result.state === 'ready' || result.state === 'error') {
      setCheckedAt(new Date())
      void refreshSnapshot.current()
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
      void refreshSnapshot.current()
    }
  }

  async function handleSelectSearch(search: AssistantSavedSearch) {
    recordRecent({ type: 'search', id: search.id })
    await runSearch(search.query, search.scope)
  }

  async function handleDirectQuery(query?: string) {
    const trimmed = (query ?? directQuery).trim()
    if (!trimmed) return
    setDirectQuery(trimmed)
    await runNaturalLanguageQuery(trimmed)
  }

  async function handleSuggestedQuery(query: string) {
    setDirectQuery(query)
    await runNaturalLanguageQuery(query)
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

  const value: AssistantWorkspaceContextValue = {
    activeTab,
    setActiveTab,
    directQuery,
    setDirectQuery,
    response,
    checkedAt,
    commandModalOpen,
    setCommandModalOpen,
    searchModalOpen,
    setSearchModalOpen,
    recentCommands,
    defaultCommands,
    customCommands,
    allSearches,
    handleDirectQuery,
    handleSuggestedQuery,
    handleSelectCommand,
    handleSelectSearch,
    handleSaveCommand,
    handleSaveSearch,
    handleDeleteCommand,
    handleDeleteSearch,
    suggestedQueries,
  }

  return (
    <AssistantWorkspaceContext.Provider value={value}>{children}</AssistantWorkspaceContext.Provider>
  )
}
