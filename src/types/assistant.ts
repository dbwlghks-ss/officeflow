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

export type AssistantResponseKind =
  | 'employee'
  | 'meal'
  | 'meal_action'
  | 'work_summary'
  | 'notice'
  | 'survey'
  | 'unknown'
  | 'generic'

export type AssistantEmployeeInfo = {
  name: string
  department: string | null
  position: string | null
  workEmail: string | null
  extension: string | null
  workPhone: string | null
}

export type AssistantEmployeePayload = {
  employees: AssistantEmployeeInfo[]
  query?: string
  empty?: boolean
}

export type AssistantMealMenuPayload = {
  menuDate: string
  mealType: string
  cafeteria: string
  items: string[]
  note: string | null
  calories: number | null
  empty?: boolean
  unavailable?: boolean
}

export type AssistantMealActionPayload = {
  action: 'applied' | 'cancelled' | 'already_applied' | 'error'
}

export type AssistantWorkSummaryPayload = {
  variant: 'summary' | 'notices' | 'surveys' | 'meal_status'
  mealStatusLabel: string
  mealApplied: boolean
  mealDeclined: boolean
  mealServiceAvailable: boolean
  unreadNoticeCount: number
  pendingSurveyCount: number
  noticeTitles?: string[]
  surveyTitles?: string[]
}

export type AssistantUnknownPayload = {
  suggestions: string[]
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
  kind?: AssistantResponseKind
  employee?: AssistantEmployeePayload
  mealMenu?: AssistantMealMenuPayload
  mealAction?: AssistantMealActionPayload
  workSummary?: AssistantWorkSummaryPayload
  unknown?: AssistantUnknownPayload
}

export type AssistantIntentOption = {
  value: AssistantIntent
  label: string
}

export type AssistantSearchScope = 'all' | 'notices' | 'surveys' | 'mail' | 'users'

export type AssistantSavedSearchSource = 'default' | 'custom'

export type AssistantSavedSearch = {
  id: string
  title: string
  query: string
  scope: AssistantSearchScope
  source: AssistantSavedSearchSource
  createdAt: string
  lastUsedAt?: string
}

export type AssistantRecentItem = {
  type: 'command' | 'search'
  id: string
}
