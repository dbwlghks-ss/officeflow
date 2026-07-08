import type { BriefDisplayMode, BriefSummaryData } from './homeBriefSummary'

export type BriefActionButton = {
  id: string
  label: string
  kind: 'meal_apply' | 'meal_cancel' | 'navigate'
  path?: string
}

export type BriefActionItem = {
  id: string
  message: string
  actions: BriefActionButton[]
}

export function buildBriefActionItems(
  data: BriefSummaryData,
  mode: BriefDisplayMode,
): BriefActionItem[] {
  if (mode !== 'ready') return []

  const items: BriefActionItem[] = []

  if (data.mealServiceAvailable && !data.mealApplied && !data.mealDeclined) {
    items.push({
      id: 'meal-check',
      message: '오늘 식수 체크가 필요합니다.',
      actions: [
        { id: 'meal-apply', label: '먹는 걸로 신청', kind: 'meal_apply' },
        { id: 'meal-cancel', label: '안 먹는 걸로 신청', kind: 'meal_cancel' },
      ],
    })
  } else if (data.mealServiceAvailable && data.mealApplied) {
    items.push({
      id: 'meal-done',
      message: '오늘 식수 신청이 완료되었습니다.',
      actions: [{ id: 'meal-cancel', label: '안 먹는 걸로 변경', kind: 'meal_cancel' }],
    })
  }

  if (data.unreadNoticeCount > 0) {
    items.push({
      id: 'notice',
      message: `읽지 않은 공지 ${data.unreadNoticeCount}건이 있습니다.`,
      actions: [{ id: 'notice-open', label: '공지 확인하기', kind: 'navigate', path: '/notice' }],
    })
  }

  if (data.pendingSurveyCount > 0) {
    items.push({
      id: 'survey',
      message: `참여 대기 설문 ${data.pendingSurveyCount}건이 있습니다.`,
      actions: [{ id: 'survey-open', label: '설문 확인하기', kind: 'navigate', path: '/survey' }],
    })
  }

  return items.slice(0, 3)
}
