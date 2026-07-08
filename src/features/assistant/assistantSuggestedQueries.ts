import type { AssistantSnapshot } from '../../services/assistantDataService'

const BASE_QUERIES = ['오늘 밥 뭐야?', '오늘 할 일 알려줘', '직원 연락처 찾기']

const MAX_SUGGESTED_QUERIES = 6

export function buildSuggestedAssistantQueries(
  snapshot: AssistantSnapshot | null,
): string[] {
  const dynamic: string[] = []

  if (snapshot?.meal.serviceAvailable) {
    if (snapshot.meal.applied) {
      dynamic.push('내 식수 신청 상태 알려줘', '오늘 식수 안 먹는 걸로 해줘')
    } else if (snapshot.meal.declined) {
      dynamic.push('내 식수 신청 상태 알려줘', '오늘 식수 먹는 걸로 해줘')
    } else {
      dynamic.push('오늘 식수 먹는 걸로 해줘', '오늘 식수 안 먹는 걸로 해줘')
    }
  }

  if (snapshot && snapshot.notices.unreadCount > 0) {
    dynamic.push('읽지 않은 공지 보여줘')
  }

  if (snapshot && snapshot.surveys.pendingCount > 0) {
    dynamic.push('참여할 설문 보여줘')
  }

  const merged: string[] = []
  for (const query of [...BASE_QUERIES, ...dynamic]) {
    if (!merged.includes(query)) merged.push(query)
    if (merged.length >= MAX_SUGGESTED_QUERIES) break
  }

  return merged
}
