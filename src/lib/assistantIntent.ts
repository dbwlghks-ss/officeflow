import type { AssistantIntent, AssistantResponse } from '../types/assistant'
import {
  ASSISTANT_ERROR_HINT,
  ASSISTANT_ERROR_MESSAGE,
  ASSISTANT_LOADING_MESSAGE,
  ASSISTANT_UNAUTHENTICATED_MESSAGE,
} from './assistantUi'
import { toWorkSummaryPayload } from './assistantResponsePayload'
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
        lines: [],
        kind: 'work_summary',
        workSummary: toWorkSummaryPayload(snapshot, 'summary'),
        actions: [
          { label: '공지사항 보기', path: '/notice' },
          { label: '설문조사 보기', path: '/survey' },
        ],
        state: 'ready',
      }

    case 'notices': {
      return {
        title: '읽지 않은 공지',
        message:
          snapshot.notices.unreadCount > 0
            ? `읽지 않은 공지가 ${snapshot.notices.unreadCount}건 있습니다.`
            : '읽지 않은 공지가 없습니다.',
        lines: [],
        kind: 'notice',
        workSummary: toWorkSummaryPayload(snapshot, 'notices'),
        action: { label: '공지사항 보기', path: '/notice' },
        state: 'ready',
      }
    }

    case 'surveys': {
      return {
        title: '참여 대기 설문',
        message:
          snapshot.surveys.pendingCount > 0
            ? `참여해야 할 설문이 ${snapshot.surveys.pendingCount}건 있습니다.`
            : '참여 대기 중인 설문이 없습니다.',
        lines: [],
        kind: 'survey',
        workSummary: toWorkSummaryPayload(snapshot, 'surveys'),
        action: { label: '설문조사 보기', path: '/survey' },
        state: 'ready',
      }
    }

    case 'meal':
      return {
        title: '오늘 식수 신청 상태',
        message: snapshot.meal.applied
          ? '오늘 식수 신청이 완료되어 있습니다.'
          : snapshot.meal.declined
            ? '오늘 식수를 안 먹는 것으로 처리했습니다.'
            : '오늘 식수 신청 내역이 없습니다.',
        lines: [],
        kind: 'work_summary',
        workSummary: toWorkSummaryPayload(snapshot, 'meal_status'),
        action: snapshot.meal.applied || snapshot.meal.declined
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
        kind: 'generic',
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
    kind: 'generic',
  }
}

export function getFallbackAssistantResponse(intent: AssistantIntent): AssistantResponse {
  const updates = getRecentUpdatesSections().flatMap((section) => section.items)

  const fallbackByIntent: Record<AssistantIntent, AssistantResponse> = {
    summary: {
      title: '오늘 해야 할 일',
      message: ASSISTANT_ERROR_MESSAGE,
      hint: ASSISTANT_ERROR_HINT,
      lines: [],
      kind: 'work_summary',
      workSummary: {
        variant: 'summary',
        mealStatusLabel: '확인 불가',
        mealApplied: false,
        mealDeclined: false,
        mealServiceAvailable: false,
        unreadNoticeCount: 0,
        pendingSurveyCount: 0,
      },
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
      kind: 'notice',
      action: { label: '공지사항 보기', path: '/notice' },
      state: 'error',
    },
    surveys: {
      title: '참여 대기 설문',
      message: ASSISTANT_ERROR_MESSAGE,
      hint: ASSISTANT_ERROR_HINT,
      lines: [],
      kind: 'survey',
      action: { label: '설문조사 보기', path: '/survey' },
      state: 'error',
    },
    meal: {
      title: '오늘 식수 신청 상태',
      message: ASSISTANT_ERROR_MESSAGE,
      hint: ASSISTANT_ERROR_HINT,
      lines: [],
      kind: 'work_summary',
      action: { label: '식수 신청 보기', path: '/meal' },
      state: 'error',
    },
    updates: {
      title: '최근 업데이트',
      message: ASSISTANT_ERROR_MESSAGE,
      hint: ASSISTANT_ERROR_HINT,
      lines: updates.slice(0, 3).map((item) => item.title),
      kind: 'generic',
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
