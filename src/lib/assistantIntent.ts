import type { AssistantIntent, AssistantResponse } from '../types/assistant'
import {
  ASSISTANT_ERROR_HINT,
  ASSISTANT_ERROR_MESSAGE,
  ASSISTANT_LOADING_MESSAGE,
  ASSISTANT_UNAUTHENTICATED_MESSAGE,
} from './assistantUi'
import {
  buildUpdateItems,
  fetchAssistantSnapshot,
  type AssistantSnapshot,
} from '../services/assistantDataService'
import { getRecentUpdatesSections } from './recentUpdatesMockData'

function buildFromSnapshot(intent: AssistantIntent, snapshot: AssistantSnapshot): AssistantResponse {
  switch (intent) {
    case 'summary':
      return {
        title: '오늘 해야 할 일',
        message: '오늘 확인해야 할 업무를 정리했습니다.',
        lines: [
          `오늘 식수: ${snapshot.meal.statusLabel}`,
          `읽지 않은 공지: ${snapshot.notices.unreadCount}건`,
          `참여 대기 설문: ${snapshot.surveys.pendingCount}건`,
          `최근 업데이트: ${buildUpdateItems(snapshot).length}건`,
        ],
        actions: [
          { label: '공지사항 보기', path: '/notice' },
          { label: '설문조사 보기', path: '/survey' },
        ],
        state: 'ready',
      }

    case 'notices': {
      const lines =
        snapshot.notices.unreadCount > 0
          ? snapshot.notices.unreadTitles.map((title) => `- ${title}`)
          : ['모든 공지를 확인했습니다.']

      return {
        title: '읽지 않은 공지',
        message:
          snapshot.notices.unreadCount > 0
            ? `읽지 않은 공지가 ${snapshot.notices.unreadCount}건 있습니다.`
            : '읽지 않은 공지가 없습니다.',
        lines,
        action: { label: '공지사항 보기', path: '/notice' },
        state: 'ready',
      }
    }

    case 'surveys': {
      const lines =
        snapshot.surveys.pendingTitles.length > 0
          ? snapshot.surveys.pendingTitles.map((title) => `- ${title}`)
          : ['참여 대기 중인 설문이 없습니다.']

      return {
        title: '참여 대기 설문',
        message:
          snapshot.surveys.pendingCount > 0
            ? `참여해야 할 설문이 ${snapshot.surveys.pendingCount}건 있습니다.`
            : '참여 대기 중인 설문이 없습니다.',
        lines,
        action: { label: '설문조사 보기', path: '/survey' },
        state: 'ready',
      }
    }

    case 'meal':
      return {
        title: '오늘 식수 신청 상태',
        message: snapshot.meal.applied
          ? '오늘 식수 신청이 완료되어 있습니다.'
          : '오늘 식수 신청 내역이 없습니다.',
        lines: [`오늘 식수: ${snapshot.meal.statusLabel}`],
        action: snapshot.meal.applied
          ? undefined
          : { label: '식수 신청하기', path: '/meal' },
        state: 'ready',
      }

    case 'updates': {
      const liveItems = buildUpdateItems(snapshot)
      const fallbackItems = getRecentUpdatesSections()
        .flatMap((section) => section.items)
        .slice(0, 5)
        .map((item) => {
          const detail = item.description ? `: ${item.description}` : ''
          return `${item.title}${detail}`
        })

      const lines = liveItems.length > 0 ? liveItems : fallbackItems

      return {
        title: '최근 업데이트',
        message: '최근 업무 업데이트를 확인했습니다.',
        lines: lines.length > 0 ? lines : ['표시할 업데이트가 없습니다.'],
        state: 'ready',
      }
    }
  }
}

export function getLoadingAssistantResponse(): AssistantResponse {
  return {
    title: '업무 확인',
    message: ASSISTANT_LOADING_MESSAGE,
    lines: [],
    state: 'loading',
  }
}

export function getFallbackAssistantResponse(intent: AssistantIntent): AssistantResponse {
  const updates = getRecentUpdatesSections().flatMap((section) => section.items)

  const fallbackByIntent: Record<AssistantIntent, AssistantResponse> = {
    summary: {
      title: '오늘 해야 할 일',
      message: ASSISTANT_ERROR_MESSAGE,
      hint: ASSISTANT_ERROR_HINT,
      lines: ['오늘 식수: 확인 불가', '읽지 않은 공지: 확인 불가', '참여 대기 설문: 확인 불가'],
      actions: [
        { label: '공지사항 보기', path: '/notice' },
        { label: '설문조사 보기', path: '/survey' },
      ],
      state: 'error',
    },
    notices: {
      title: '읽지 않은 공지',
      message: ASSISTANT_ERROR_MESSAGE,
      hint: ASSISTANT_ERROR_HINT,
      lines: [],
      action: { label: '공지사항 보기', path: '/notice' },
      state: 'error',
    },
    surveys: {
      title: '참여 대기 설문',
      message: ASSISTANT_ERROR_MESSAGE,
      hint: ASSISTANT_ERROR_HINT,
      lines: [],
      action: { label: '설문조사 보기', path: '/survey' },
      state: 'error',
    },
    meal: {
      title: '오늘 식수 신청 상태',
      message: ASSISTANT_ERROR_MESSAGE,
      hint: ASSISTANT_ERROR_HINT,
      lines: [],
      action: { label: '식수 신청 보기', path: '/meal' },
      state: 'error',
    },
    updates: {
      title: '최근 업데이트',
      message: ASSISTANT_ERROR_MESSAGE,
      hint: ASSISTANT_ERROR_HINT,
      lines: updates.slice(0, 3).map((item) => item.title),
      state: 'error',
    },
  }

  return fallbackByIntent[intent]
}

export function getUnauthenticatedAssistantResponse(intent: AssistantIntent): AssistantResponse {
  return {
    ...getFallbackAssistantResponse(intent),
    message: ASSISTANT_UNAUTHENTICATED_MESSAGE,
    hint: undefined,
    action: getFallbackAssistantResponse(intent).action,
    actions: getFallbackAssistantResponse(intent).actions,
    state: 'error',
  }
}

export async function resolveAssistantResponse(intent: AssistantIntent): Promise<AssistantResponse> {
  try {
    const snapshot = await fetchAssistantSnapshot()
    if (!snapshot) {
      return getUnauthenticatedAssistantResponse(intent)
    }
    return buildFromSnapshot(intent, snapshot)
  } catch (error) {
    console.error('[assistant] resolveAssistantResponse failed:', error)
    return getFallbackAssistantResponse(intent)
  }
}
