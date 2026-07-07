import type { AssistantRecentItem, AssistantSavedSearch, AssistantSearchScope } from '../types/assistant'

export const SAVED_SEARCHES_STORAGE_KEY = 'officeflow_assistant_saved_searches'
export const RECENT_ITEMS_STORAGE_KEY = 'officeflow_assistant_recent_items'
/** @deprecated Migrated to RECENT_ITEMS_STORAGE_KEY */
export const LEGACY_RECENT_COMMANDS_KEY = 'officeflow_assistant_recent_commands'
export const MAX_RECENT_ITEMS = 3

export const SEARCH_SCOPE_OPTIONS: { value: AssistantSearchScope; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'notices', label: '공지' },
  { value: 'surveys', label: '설문' },
  { value: 'mail', label: '메일' },
  { value: 'users', label: '직원' },
]

export const SEARCH_SCOPE_LABELS: Record<AssistantSearchScope, string> = {
  all: '전체',
  notices: '공지',
  surveys: '설문',
  mail: '메일',
  users: '직원',
}

export const DEFAULT_SAVED_SEARCHES: AssistantSavedSearch[] = [
  {
    id: 'default-search-safety',
    title: '안전교육',
    query: '안전교육',
    scope: 'all',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'default-search-vacation',
    title: '휴가 신청',
    query: '휴가',
    scope: 'notices',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'default-search-quality',
    title: '품질 회의',
    query: '품질',
    scope: 'all',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'default-search-meal',
    title: '식수 신청',
    query: '식수',
    scope: 'notices',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'default-search-survey',
    title: '설문조사',
    query: '설문',
    scope: 'surveys',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadCustomSavedSearches(): AssistantSavedSearch[] {
  return readStorage<AssistantSavedSearch[]>(SAVED_SEARCHES_STORAGE_KEY, [])
}

export function saveCustomSavedSearches(searches: AssistantSavedSearch[]): void {
  writeStorage(
    SAVED_SEARCHES_STORAGE_KEY,
    searches.filter((search) => search.source === 'custom'),
  )
}

export function getAllSavedSearches(customSearches: AssistantSavedSearch[]): AssistantSavedSearch[] {
  return [...DEFAULT_SAVED_SEARCHES, ...customSearches]
}

export function createCustomSavedSearch(input: {
  title: string
  query: string
  scope: AssistantSearchScope
}): AssistantSavedSearch {
  return {
    id: `search-${crypto.randomUUID()}`,
    title: input.title.trim(),
    query: input.query.trim(),
    scope: input.scope,
    source: 'custom',
    createdAt: new Date().toISOString(),
  }
}

export function loadRecentItems(): AssistantRecentItem[] {
  const stored = readStorage<AssistantRecentItem[]>(RECENT_ITEMS_STORAGE_KEY, [])
  if (stored.length > 0) return stored.slice(0, MAX_RECENT_ITEMS)

  const legacyIds = readStorage<string[]>(LEGACY_RECENT_COMMANDS_KEY, [])
  return legacyIds.map((id) => ({ type: 'command' as const, id })).slice(0, MAX_RECENT_ITEMS)
}

export function saveRecentItems(items: AssistantRecentItem[]): void {
  writeStorage(RECENT_ITEMS_STORAGE_KEY, items.slice(0, MAX_RECENT_ITEMS))
}

export function pushRecentItem(
  items: AssistantRecentItem[],
  entry: AssistantRecentItem,
): AssistantRecentItem[] {
  const filtered = items.filter((item) => !(item.type === entry.type && item.id === entry.id))
  return [entry, ...filtered].slice(0, MAX_RECENT_ITEMS)
}
