import type { AssistantIntent, AssistantResponse } from '../../types/assistant'

export type RuleIntentType =
  | 'GET_TODAY_MEAL'
  | 'APPLY_TODAY_MEAL'
  | 'CANCEL_TODAY_MEAL'
  | 'EMPLOYEE_LOOKUP'
  | 'LEGACY'
  | 'UNKNOWN'

export type EmployeeLookupField = 'position' | 'department' | 'phone' | 'email' | 'summary'

export type DetectedRuleIntent =
  | { type: 'GET_TODAY_MEAL' }
  | { type: 'APPLY_TODAY_MEAL' }
  | { type: 'CANCEL_TODAY_MEAL' }
  | { type: 'EMPLOYEE_LOOKUP'; nameQuery: string; field: EmployeeLookupField }
  | { type: 'LEGACY'; intent: AssistantIntent }
  | { type: 'UNKNOWN' }

export type RuleAssistantResult = AssistantResponse
