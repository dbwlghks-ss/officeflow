import type { AssistantIntent, AssistantResponse } from '../types/assistant'
import { getBriefSummaryData, toBriefSummaryItems } from './homeBriefSummary'
import { getRecentUpdatesSections } from './recentUpdatesMockData'

const MOCK_NOTICE_TITLES = [
  '사내 안전 수칙 업데이트',
  '식수 메뉴 변경 안내',
  '7월 사내 교육 일정',
]

const MOCK_SURVEY_TITLES = ['안전교육 설문', '만족도 조사', '업무 환경 개선 설문']

export function resolveAssistantResponse(intent: AssistantIntent): AssistantResponse {
  const summary = getBriefSummaryData()
  const summaryItems = toBriefSummaryItems(summary)
  const updates = getRecentUpdatesSections().flatMap((section) => section.items)

  switch (intent) {
    case 'summary':
      return {
        title: '오늘 확인할 업무',
        lines: summaryItems.map((item) => `${item.label}: ${item.value}`),
      }

    case 'notices':
      return {
        title: `읽지 않은 공지 ${summary.unreadNoticeCount}건`,
        lines: MOCK_NOTICE_TITLES.slice(0, 3).map((title, index) => `${index + 1}. ${title}`),
        action: { label: '공지사항 페이지로 이동', path: '/notice' },
      }

    case 'surveys':
      return {
        title: `참여 대기 설문 ${summary.pendingSurveyCount}건`,
        lines: MOCK_SURVEY_TITLES.slice(0, 3).map((title, index) => `${index + 1}. ${title}`),
        action: { label: '설문조사 페이지로 이동', path: '/survey' },
      }

    case 'meal':
      return {
        title: '오늘 식수 신청 상태',
        lines: [
          `상태: ${summary.mealStatusLabel}`,
          summary.mealApplied ? '오늘 점심 식수가 신청되어 있습니다.' : '아직 신청하지 않았습니다.',
        ],
        action: { label: '식수 신청 페이지로 이동', path: '/meal' },
      }

    case 'updates':
      return {
        title: '최근 업데이트',
        lines: updates.slice(0, 5).map((item) => {
          const detail = item.description ? ` — ${item.description}` : ''
          const time = item.timeLabel ? ` (${item.timeLabel})` : ''
          return `${item.title}${detail}${time}`
        }),
      }
  }
}
