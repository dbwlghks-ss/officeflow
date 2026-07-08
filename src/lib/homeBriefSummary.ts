import type { AssistantSnapshot } from '../services/assistantDataService'

export type BriefSummaryData = {
  mealStatusLabel: string
  mealApplied: boolean
  mealDeclined: boolean
  mealServiceAvailable: boolean
  unreadNoticeCount: number
  pendingSurveyCount: number
  todayScheduleCount: number
}

export type BriefSummaryItem = {
  id: 'meal' | 'notice' | 'survey' | 'schedule'
  label: string
  value: string
  emphasis?: boolean
}

export type BriefDisplayMode = 'loading' | 'ready' | 'error' | 'unauthenticated'

const DEFAULT_BRIEF_SUMMARY: BriefSummaryData = {
  mealStatusLabel: '확인 중',
  mealApplied: false,
  mealDeclined: false,
  mealServiceAvailable: false,
  unreadNoticeCount: 0,
  pendingSurveyCount: 0,
  todayScheduleCount: 0,
}

/** Legacy helper for unused HomeHeroBrief — prefer mapSnapshotToBriefSummary. */
export function getBriefSummaryData(
  override?: Partial<BriefSummaryData>,
): BriefSummaryData {
  return { ...DEFAULT_BRIEF_SUMMARY, ...override }
}

export function mapSnapshotToBriefSummary(snapshot: AssistantSnapshot): BriefSummaryData {
  return {
    mealStatusLabel: snapshot.meal.statusLabel,
    mealApplied: snapshot.meal.applied,
    mealDeclined: snapshot.meal.declined,
    mealServiceAvailable: snapshot.meal.serviceAvailable,
    unreadNoticeCount: snapshot.notices.unreadCount,
    pendingSurveyCount: snapshot.surveys.pendingCount,
    todayScheduleCount: 0,
  }
}

export function toBriefSummaryItems(
  data: BriefSummaryData,
  mode: BriefDisplayMode = 'ready',
): BriefSummaryItem[] {
  if (mode === 'loading') {
    return [
      { id: 'meal', label: '오늘 식수', value: '확인 중' },
      { id: 'notice', label: '읽지 않은 공지', value: '-' },
      { id: 'survey', label: '참여 대기 설문', value: '-' },
      { id: 'schedule', label: '오늘 일정', value: '-' },
    ]
  }

  if (mode === 'error') {
    return [
      { id: 'meal', label: '오늘 식수', value: '확인 필요' },
      { id: 'notice', label: '읽지 않은 공지', value: '-' },
      { id: 'survey', label: '참여 대기 설문', value: '-' },
      { id: 'schedule', label: '오늘 일정', value: '-' },
    ]
  }

  if (mode === 'unauthenticated') {
    return [
      { id: 'meal', label: '오늘 식수', value: '로그인 필요' },
      { id: 'notice', label: '읽지 않은 공지', value: '로그인 필요' },
      { id: 'survey', label: '참여 대기 설문', value: '로그인 필요' },
      { id: 'schedule', label: '오늘 일정', value: '-' },
    ]
  }

  return [
    {
      id: 'meal',
      label: '오늘 식수',
      value: data.mealStatusLabel,
      emphasis: data.mealServiceAvailable && !data.mealApplied && !data.mealDeclined,
    },
    {
      id: 'notice',
      label: '읽지 않은 공지',
      value: data.unreadNoticeCount > 0 ? `${data.unreadNoticeCount}건` : '없음',
      emphasis: data.unreadNoticeCount > 0,
    },
    {
      id: 'survey',
      label: '참여 대기 설문',
      value: data.pendingSurveyCount > 0 ? `${data.pendingSurveyCount}건` : '없음',
      emphasis: data.pendingSurveyCount > 0,
    },
    {
      id: 'schedule',
      label: '오늘 일정',
      value: data.todayScheduleCount > 0 ? `${data.todayScheduleCount}건` : '없음',
      emphasis: data.todayScheduleCount > 0,
    },
  ]
}
