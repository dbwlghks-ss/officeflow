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
  /** Secondary helper text (e.g. error guidance). */
  hint?: string
  lines: string[]
  action?: AssistantResponseAction
  /** Up to two secondary action buttons when multiple destinations apply. */
  actions?: AssistantResponseAction[]
  state?: 'loading' | 'ready' | 'error'
}

export type AssistantIntentOption = {
  value: AssistantIntent
  label: string
}
