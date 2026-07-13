export type MeetingActionPriority = 'low' | 'medium' | 'high'
export type MeetingActionStatus = 'todo' | 'in_progress' | 'done' | 'blocked'

export type MeetingActionItem = {
  task_title: string
  description: string
  owner_name: string | null
  due_label: string | null
  due_date: string | null
  priority: MeetingActionPriority
  status: MeetingActionStatus
  evidence_text: string
  confidence: number
}

export type MeetingAnalysisResult = {
  summary: string
  decisions: string[]
  risks: string[]
  action_items: MeetingActionItem[]
  follow_up_questions: string[]
}

export type MeetingAnalysisState =
  | { status: 'idle' }
  | { status: 'loading'; rawText: string }
  | { status: 'ready'; rawText: string; result: MeetingAnalysisResult }
  | { status: 'error'; rawText: string; message: string }

export type MeetingSaveState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'saved'; actionItemCount: number }
  | { status: 'error'; message: string }
