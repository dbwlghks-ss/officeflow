import type { BriefDisplayMode, BriefSummaryData } from './homeBriefSummary'

export type BriefActionButton = {
  id: string
  label: string
  kind: 'meal_apply' | 'meal_cancel' | 'navigate'
  path?: string
}

export type WorkQueueItemStatus = 'action_needed' | 'review' | 'done'

export type WorkQueueItem = {
  id: string
  status: WorkQueueItemStatus
  message: string
  actions: BriefActionButton[]
}

export type WorkQueueResult = {
  items: WorkQueueItem[]
  isAllComplete: boolean
}

const MAX_WORK_QUEUE_ITEMS = 4

const EMPTY_SUMMARY: BriefSummaryData = {
  mealStatusLabel: '',
  mealApplied: false,
  mealDeclined: false,
  mealServiceAvailable: false,
  unreadNoticeCount: 0,
  pendingSurveyCount: 0,
  todayScheduleCount: 0,
  meetingActionCount: 0,
}

function buildMealCheckItem(): WorkQueueItem {
  return {
    id: 'meal-check',
    status: 'action_needed',
    message: '오늘 식수 체크가 필요합니다.',
    actions: [
      { id: 'meal-apply', label: '먹는 걸로 신청', kind: 'meal_apply' },
      { id: 'meal-cancel', label: '안 먹는 걸로 신청', kind: 'meal_cancel' },
    ],
  }
}

function buildMealAppliedItem(): WorkQueueItem {
  return {
    id: 'meal-done',
    status: 'done',
    message: '오늘 식수 신청이 완료되었습니다.',
    actions: [{ id: 'meal-cancel', label: '안 먹는 걸로 변경', kind: 'meal_cancel' }],
  }
}

function buildMealDeclinedItem(): WorkQueueItem {
  return {
    id: 'meal-declined',
    status: 'done',
    message: '오늘 식수를 안 먹는 것으로 처리했습니다.',
    actions: [{ id: 'meal-apply', label: '먹는 걸로 변경', kind: 'meal_apply' }],
  }
}

function buildNoticeItem(count: number): WorkQueueItem {
  return {
    id: 'notice',
    status: 'review',
    message: `읽지 않은 공지 ${count}건이 있습니다.`,
    actions: [{ id: 'notice-open', label: '공지 확인하기', kind: 'navigate', path: '/notice' }],
  }
}

function buildSurveyItem(count: number): WorkQueueItem {
  return {
    id: 'survey',
    status: 'review',
    message: `참여 대기 설문 ${count}건이 있습니다.`,
    actions: [{ id: 'survey-open', label: '설문 확인하기', kind: 'navigate', path: '/survey' }],
  }
}

function buildSurveyEmptyItem(): WorkQueueItem {
  return {
    id: 'survey-empty',
    status: 'done',
    message: '참여 대기 설문은 없습니다.',
    actions: [],
  }
}

function buildMeetingActionsItem(count: number): WorkQueueItem {
  return {
    id: 'meeting-actions',
    status: 'review',
    message: `회의록에서 추출된 업무 ${count}건이 있습니다.`,
    actions: [],
  }
}

function buildCandidateItems(data: BriefSummaryData): WorkQueueItem[] {
  const items: WorkQueueItem[] = []

  if (data.mealServiceAvailable && !data.mealApplied && !data.mealDeclined) {
    items.push(buildMealCheckItem())
  }

  if (data.unreadNoticeCount > 0) {
    items.push(buildNoticeItem(data.unreadNoticeCount))
  }

  if (data.pendingSurveyCount > 0) {
    items.push(buildSurveyItem(data.pendingSurveyCount))
  }

  if (data.meetingActionCount > 0) {
    items.push(buildMeetingActionsItem(data.meetingActionCount))
  }

  if (data.mealServiceAvailable && data.mealApplied) {
    items.push(buildMealAppliedItem())
  } else if (data.mealServiceAvailable && data.mealDeclined) {
    items.push(buildMealDeclinedItem())
  }

  return items
}

export function buildWorkQueueItems(
  data: BriefSummaryData,
  mode: BriefDisplayMode,
): WorkQueueResult {
  if (mode !== 'ready') {
    return { items: [], isAllComplete: false }
  }

  const candidates = buildCandidateItems(data)
  const primary = candidates.filter(
    (item) => item.status === 'action_needed' || item.status === 'review',
  )

  if (primary.length === 0) {
    return { items: [], isAllComplete: true }
  }

  const items: WorkQueueItem[] = [...primary]

  for (const item of candidates) {
    if (item.status !== 'done') continue
    if (items.length >= MAX_WORK_QUEUE_ITEMS) break
    if (items.some((existing) => existing.id === item.id)) continue
    items.push(item)
  }

  if (
    data.pendingSurveyCount === 0 &&
    items.length < MAX_WORK_QUEUE_ITEMS &&
    !items.some((item) => item.id === 'survey-empty')
  ) {
    items.push(buildSurveyEmptyItem())
  }

  return { items: items.slice(0, MAX_WORK_QUEUE_ITEMS), isAllComplete: false }
}

export { EMPTY_SUMMARY as BRIEF_EMPTY_SUMMARY }
