import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { detectRuleBasedIntent } from '../../../features/assistant/assistantIntent'
import {
  ASSISTANT_DATA_UPDATED_EVENT,
  executeRuleBasedIntent,
  getLoadingRuleAssistantResponse,
} from '../../../features/assistant/assistantExecutor'
import { shouldAnalyzeMeetingMinutes } from '../../../lib/meetingDetection'
import {
  notifyAssistantDataUpdated,
  notifyMeetingDataUpdated,
} from '../../../lib/assistantDataEvents'
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
import {
  analyzeMeetingMinutes,
  saveMeetingAnalysis,
} from '../../../services/meetingService'
import type { AssistantCommand, AssistantResponse, AssistantSavedSearch } from '../../../types/assistant'
import type {
  MeetingActionItem,
  MeetingAnalysisState,
  MeetingSaveState,
} from '../../../types/meeting'
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
  clearResponse: () => void
  meetingAnalysisState: MeetingAnalysisState
  meetingSaveState: MeetingSaveState
  isMeetingAnalyzing: boolean
  updateMeetingActionItems: (items: MeetingActionItem[]) => void
  saveMeetingAnalysisResult: () => Promise<void>
  reanalyzeMeeting: () => Promise<void>
  clearMeetingAnalysis: () => void
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
  const [meetingAnalysisState, setMeetingAnalysisState] = useState<MeetingAnalysisState>({
    status: 'idle',
  })
  const [meetingSaveState, setMeetingSaveState] = useState<MeetingSaveState>({
    status: 'idle',
  })
  const requestSeq = useRef(0)
  const meetingRequestSeq = useRef(0)
  const saveInFlightRef = useRef(false)

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

  async function runMeetingAnalysis(rawText: string) {
    const trimmed = rawText.trim()
    if (!trimmed) return

    const seq = ++meetingRequestSeq.current
    saveInFlightRef.current = false
    setMeetingSaveState({ status: 'idle' })
    setMeetingAnalysisState({ status: 'loading', rawText: trimmed })
    clearResponse()

    try {
      const result = await analyzeMeetingMinutes({ rawText: trimmed })
      if (seq !== meetingRequestSeq.current) return
      setMeetingAnalysisState({ status: 'ready', rawText: trimmed, result })
    } catch (error) {
      if (seq !== meetingRequestSeq.current) return
      const message =
        error instanceof Error ? error.message : '회의록 분석에 실패했습니다.'
      setMeetingAnalysisState({
        status: 'error',
        rawText: trimmed,
        message,
      })
    }
  }

  async function handleDirectQuery(query?: string) {
    const trimmed = (query ?? directQuery).trim()
    if (!trimmed) return
    setDirectQuery(trimmed)

    if (shouldAnalyzeMeetingMinutes(trimmed)) {
      await runMeetingAnalysis(trimmed)
      return
    }

    setMeetingAnalysisState({ status: 'idle' })
    setMeetingSaveState({ status: 'idle' })
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

  function clearMeetingAnalysis() {
    meetingRequestSeq.current += 1
    saveInFlightRef.current = false
    setMeetingAnalysisState({ status: 'idle' })
    setMeetingSaveState({ status: 'idle' })
  }

  function updateMeetingActionItems(items: MeetingActionItem[]) {
    setMeetingAnalysisState((current) => {
      if (current.status !== 'ready') return current
      return {
        ...current,
        result: {
          ...current.result,
          action_items: items,
        },
      }
    })
  }

  async function saveMeetingAnalysisResult() {
    if (saveInFlightRef.current) return
    if (meetingSaveState.status === 'saved' || meetingSaveState.status === 'saving') return
    if (meetingAnalysisState.status !== 'ready') return

    saveInFlightRef.current = true
    setMeetingSaveState({ status: 'saving' })

    try {
      const saved = await saveMeetingAnalysis({
        rawText: meetingAnalysisState.rawText,
        analysis: meetingAnalysisState.result,
      })

      setMeetingSaveState({
        status: 'saved',
        actionItemCount: saved.actionItemCount,
      })
      setMeetingAnalysisState({ status: 'idle' })
      notifyMeetingDataUpdated()
      notifyAssistantDataUpdated()
      void refreshSnapshot.current()
    } catch (error) {
      console.error('[meeting] save failed:', error)
      setMeetingSaveState({
        status: 'error',
        message: '업무 저장에 실패했습니다. Supabase 연결과 권한을 확인해주세요.',
      })
    } finally {
      saveInFlightRef.current = false
    }
  }

  async function reanalyzeMeeting() {
    const rawText =
      meetingAnalysisState.status === 'idle'
        ? directQuery
        : meetingAnalysisState.rawText

    await runMeetingAnalysis(rawText)
  }

  function clearResponse() {
    requestSeq.current += 1
    setResponse(null)
    setCheckedAt(null)
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
    clearResponse,
    meetingAnalysisState,
    meetingSaveState,
    isMeetingAnalyzing: meetingAnalysisState.status === 'loading',
    updateMeetingActionItems,
    saveMeetingAnalysisResult,
    reanalyzeMeeting,
    clearMeetingAnalysis,
  }

  return (
    <AssistantWorkspaceContext.Provider value={value}>{children}</AssistantWorkspaceContext.Provider>
  )
}
