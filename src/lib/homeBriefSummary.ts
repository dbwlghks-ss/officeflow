export type BriefSummaryData = {
  mealStatusLabel: string
  mealApplied: boolean
  unreadNoticeCount: number
  pendingSurveyCount: number
}

export type BriefSummaryItem = {
  id: 'meal' | 'notice' | 'survey'
  label: string
  value: string
  emphasis?: boolean
}

/** Mock snapshot — replace with Supabase-driven data later. */
export const MOCK_BRIEF_SUMMARY: BriefSummaryData = {
  mealStatusLabel: '신청 완료',
  mealApplied: true,
  unreadNoticeCount: 3,
  pendingSurveyCount: 2,
}

export function getBriefSummaryData(
  override?: Partial<BriefSummaryData>,
): BriefSummaryData {
  return { ...MOCK_BRIEF_SUMMARY, ...override }
}

export function toBriefSummaryItems(data: BriefSummaryData): BriefSummaryItem[] {
  return [
    {
      id: 'meal',
      label: '오늘 식수',
      value: data.mealStatusLabel,
      emphasis: !data.mealApplied,
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
  ]
}
