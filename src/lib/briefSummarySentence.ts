import type { BriefDisplayMode, BriefSummaryData } from './homeBriefSummary'

export type { BriefDisplayMode }

export type BriefSummaryCopy = {
  lines: [string] | [string, string]
}

function formatReviewSummaryLine(
  noticeCount: number,
  surveyCount: number,
  scheduleCount: number,
): string | null {
  if (noticeCount > 0 && surveyCount === 0 && scheduleCount === 0) {
    return `공지 ${noticeCount}건을 확인해보세요.`
  }

  if (surveyCount > 0 && noticeCount === 0 && scheduleCount === 0) {
    return `참여 대기 설문 ${surveyCount}건이 있습니다.`
  }

  const parts: string[] = []
  if (noticeCount > 0) parts.push(`공지 ${noticeCount}건`)
  if (surveyCount > 0) parts.push(`설문 ${surveyCount}건`)
  if (scheduleCount > 0) parts.push(`일정 ${scheduleCount}건`)

  if (parts.length === 0) return null
  if (parts.length === 1) return `${parts[0]}을 확인해보세요.`
  if (parts.length === 2) return `${parts[0]}과 ${parts[1]}을 확인해보세요.`

  return `${parts[0]}, ${parts[1]}, ${parts[2]}을 확인해보세요.`
}

/** Short digest copy for Today Brief — no action prompts, summary only. */
export function buildBriefSummaryCopy(data: BriefSummaryData): BriefSummaryCopy {
  const mealNeedsAction =
    data.mealServiceAvailable && !data.mealApplied && !data.mealDeclined
  const reviewLine = formatReviewSummaryLine(
    data.unreadNoticeCount,
    data.pendingSurveyCount,
    data.todayScheduleCount,
  )

  if (mealNeedsAction && reviewLine) {
    return { lines: ['오늘 식수 체크가 필요합니다.', reviewLine] }
  }

  if (mealNeedsAction) {
    return { lines: ['오늘 식수 체크가 필요합니다.'] }
  }

  if (reviewLine) {
    return { lines: [reviewLine] }
  }

  return {
    lines: ['오늘 확인할 업무는 없습니다.', '여유 있게 하루를 시작하세요.'],
  }
}

export function buildBriefSummaryDisplay(
  mode: BriefDisplayMode,
  data?: BriefSummaryData,
): BriefSummaryCopy {
  switch (mode) {
    case 'loading':
      return { lines: ['오늘 업무 상태를 확인하고 있습니다.'] }
    case 'error':
      return {
        lines: ['오늘 업무 데이터를 불러오지 못했습니다.', '잠시 후 다시 확인해주세요.'],
      }
    case 'unauthenticated':
      return { lines: ['로그인 후 오늘의 업무 상태를 확인할 수 있습니다.'] }
    case 'ready':
      return buildBriefSummaryCopy(data!)
  }
}
