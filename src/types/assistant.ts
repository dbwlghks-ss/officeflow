export type AssistantIntent = 'summary' | 'notices' | 'surveys' | 'meal' | 'updates'

export type AssistantCommandSource = 'default' | 'custom'

export type AssistantCommand = {
  id: string
  title: string
  prompt: string
  intent: AssistantIntent
  source: AssistantCommandSource
  createdAt: string
  lastUsedAt?: string
}

export type AssistantResponseAction = {
  label: string
  path: string
}

export type AssistantResponse = {
  title: string
  message?: string
  lines: string[]
  action?: AssistantResponseAction
  state?: 'loading' | 'ready' | 'error'
}

export type AssistantIntentOption = {
  value: AssistantIntent
  label: string
}
