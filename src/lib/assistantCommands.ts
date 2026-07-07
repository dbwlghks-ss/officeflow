import type { AssistantCommand } from '../types/assistant'

export const COMMANDS_STORAGE_KEY = 'officeflow_assistant_commands'
export const RECENT_COMMANDS_STORAGE_KEY = 'officeflow_assistant_recent_commands'
export const MAX_RECENT_COMMANDS = 3

export const DEFAULT_COMMANDS: AssistantCommand[] = [
  {
    id: 'default-summary',
    title: '오늘 할 일',
    prompt: '오늘 해야 할 일 알려줘',
    intent: 'summary',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'default-notices',
    title: '읽지 않은 공지',
    prompt: '읽지 않은 공지 보여줘',
    intent: 'notices',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'default-surveys',
    title: '참여 대기 설문',
    prompt: '참여 대기 설문 확인',
    intent: 'surveys',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'default-meal',
    title: '식수 신청 상태',
    prompt: '내 식수 신청 상태 확인',
    intent: 'meal',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'default-updates',
    title: '최근 업데이트',
    prompt: '최근 업데이트 보여줘',
    intent: 'updates',
    source: 'default',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

export const INTENT_OPTIONS = [
  { value: 'summary' as const, label: '오늘 요약' },
  { value: 'notices' as const, label: '공지 확인' },
  { value: 'surveys' as const, label: '설문 확인' },
  { value: 'meal' as const, label: '식수 확인' },
  { value: 'updates' as const, label: '최근 업데이트' },
]

export const INTENT_BADGE_LABELS: Record<AssistantCommand['intent'], string> = {
  summary: '오늘 요약',
  notices: '공지',
  surveys: '설문',
  meal: '식수',
  updates: '업데이트',
}

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

export function loadCustomCommands(): AssistantCommand[] {
  return readStorage<AssistantCommand[]>(COMMANDS_STORAGE_KEY, [])
}

export function saveCustomCommands(commands: AssistantCommand[]): void {
  writeStorage(COMMANDS_STORAGE_KEY, commands)
}

export function loadRecentCommandIds(): string[] {
  return readStorage<string[]>(RECENT_COMMANDS_STORAGE_KEY, [])
}

export function saveRecentCommandIds(ids: string[]): void {
  writeStorage(RECENT_COMMANDS_STORAGE_KEY, ids.slice(0, MAX_RECENT_COMMANDS))
}

export function getAllCommands(customCommands: AssistantCommand[]): AssistantCommand[] {
  return [...DEFAULT_COMMANDS, ...customCommands]
}

export function createCustomCommand(input: {
  title: string
  prompt: string
  intent: AssistantCommand['intent']
}): AssistantCommand {
  return {
    id: `custom-${crypto.randomUUID()}`,
    title: input.title.trim(),
    prompt: input.prompt.trim(),
    intent: input.intent,
    source: 'custom',
    createdAt: new Date().toISOString(),
  }
}
