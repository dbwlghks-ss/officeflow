import type { BriefSummaryData } from './homeBriefSummary'

export type BriefSummaryCopy = {
  lines: [string] | [string, string]
}

function formatActionLine(
  noticeCount: number,
  surveyCount: number,
  scheduleCount: number,
): string | null {
  const parts: string[] = []

  if (noticeCount > 0) parts.push(`공지 ${noticeCount}건`)
  if (surveyCount > 0) parts.push(`설문 ${surveyCount}건`)
  if (scheduleCount > 0) parts.push(`일정 ${scheduleCount}건`)

  if (parts.length === 0) return null
  if (parts.length === 1) return `${parts[0]}을 확인해보세요.`
  if (parts.length === 2) return `${parts[0]}과 ${parts[1]}을 확인해보세요.`

  return `${parts[0]}, ${parts[1]}, ${parts[2]}을 확인해보세요.`
}

/** Short, scannable brief copy from existing summary snapshot data. */
export function buildBriefSummaryCopy(data: BriefSummaryData): BriefSummaryCopy {
  const { mealApplied, unreadNoticeCount, pendingSurveyCount, todayScheduleCount } = data
  const actionLine = formatActionLine(
    unreadNoticeCount,
    pendingSurveyCount,
    todayScheduleCount,
  )

  if (!actionLine) {
    if (mealApplied) {
      return {
        lines: ['오늘 확인할 업무는 없습니다.', '여유 있게 하루를 시작하세요.'],
      }
    }

    return {
      lines: ['식수 신청이 필요합니다.', '여유 있게 하루를 시작하세요.'],
    }
  }

  const mealLine = mealApplied ? '식수 신청 완료.' : '식수 신청이 필요합니다.'
  return { lines: [mealLine, actionLine] }
}
