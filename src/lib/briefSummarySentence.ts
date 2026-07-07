import type { BriefSummaryData } from './homeBriefSummary'

function formatNoticeSurveyClause(noticeCount: number, surveyCount: number): string {
  const hasNotice = noticeCount > 0
  const hasSurvey = surveyCount > 0

  if (hasNotice && hasSurvey) {
    return `확인할 공지 ${noticeCount}건과 설문 ${surveyCount}건이 있습니다`
  }
  if (hasNotice) {
    return `확인할 공지 ${noticeCount}건이 있습니다`
  }
  return `확인할 설문 ${surveyCount}건이 있습니다`
}

/** Natural one-line brief from existing summary snapshot data. */
export function buildBriefSummarySentence(data: BriefSummaryData): string {
  const { mealApplied, unreadNoticeCount, pendingSurveyCount, todayScheduleCount } = data
  const hasNoticeOrSurvey = unreadNoticeCount > 0 || pendingSurveyCount > 0

  let sentence: string

  if (!hasNoticeOrSurvey) {
    if (mealApplied) {
      sentence = '오늘 확인할 공지와 설문은 없습니다. 여유 있게 업무를 시작하세요.'
    } else {
      sentence =
        '오늘 식수 신청이 필요하고, 확인할 공지와 설문은 없습니다. 여유 있게 업무를 시작하세요.'
    }
  } else {
    const mealLead = mealApplied
      ? '오늘 식수는 신청 완료되었고'
      : '오늘 식수 신청이 필요하고'

    sentence = `${mealLead}, ${formatNoticeSurveyClause(unreadNoticeCount, pendingSurveyCount)}.`
  }

  if (todayScheduleCount > 0) {
    sentence += ` 오늘 일정 ${todayScheduleCount}건도 함께 확인해보세요.`
  }

  return sentence
}
