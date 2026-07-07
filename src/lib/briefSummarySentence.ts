import type { BriefDisplayMode, BriefSummaryData } from './homeBriefSummary'

export type { BriefDisplayMode }

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
  const {
    mealApplied,
    mealServiceAvailable,
    unreadNoticeCount,
    pendingSurveyCount,
    todayScheduleCount,
  } = data
  const actionLine = formatActionLine(
    unreadNoticeCount,
    pendingSurveyCount,
    todayScheduleCount,
  )
  const mealLine = mealServiceAvailable
    ? mealApplied
      ? '식수 신청 완료.'
      : '식수 신청이 필요합니다.'
    : null

  if (!actionLine) {
    if (!mealServiceAvailable || mealApplied) {
      return {
        lines: ['오늘 확인할 업무는 없습니다.', '여유 있게 하루를 시작하세요.'],
      }
    }

    return {
      lines: ['식수 신청이 필요합니다.', '여유 있게 하루를 시작하세요.'],
    }
  }

  if (!mealLine) {
    return { lines: [actionLine] }
  }

  return { lines: [mealLine, actionLine] }
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
