import type { BriefDisplayMode, BriefSummaryData } from './homeBriefSummary'

export type BriefChecklistItem = {
  id: string
  label: string
  /** Local checklist toggle — does not mutate notice/survey/meal data. */
  checkable: boolean
  hint?: string
}

export type BriefChecklistResult = {
  items: BriefChecklistItem[]
  isEmpty: boolean
}

const MAX_CHECKLIST_ITEMS = 4

export function buildBriefChecklistItems(
  data: BriefSummaryData,
  mode: BriefDisplayMode,
): BriefChecklistResult {
  if (mode !== 'ready') {
    return { items: [], isEmpty: false }
  }

  const items: BriefChecklistItem[] = []

  if (data.mealServiceAvailable && !data.mealApplied && !data.mealDeclined) {
    items.push({
      id: 'meal-check',
      label: '오늘 식수 체크가 필요합니다.',
      checkable: false,
      hint: 'Work Queue에서 처리',
    })
  }

  if (data.unreadNoticeCount > 0) {
    items.push({
      id: 'notice',
      label: `읽지 않은 공지 ${data.unreadNoticeCount}건을 확인하세요.`,
      checkable: true,
    })
  }

  if (data.pendingSurveyCount > 0) {
    items.push({
      id: 'survey',
      label: `참여 대기 설문 ${data.pendingSurveyCount}건이 있습니다.`,
      checkable: true,
    })
  }

  if (data.todayScheduleCount > 0) {
    items.push({
      id: 'schedule',
      label: `오늘 일정 ${data.todayScheduleCount}건을 확인하세요.`,
      checkable: true,
    })
  }

  return {
    items: items.slice(0, MAX_CHECKLIST_ITEMS),
    isEmpty: items.length === 0,
  }
}
