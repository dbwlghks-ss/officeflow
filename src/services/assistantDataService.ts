import { supabase } from '../lib/supabase'
import { getTodayDate, getTodayLunchService, getMyApplication } from './mealService'
import { getNotices } from './noticeService'
import { getUnreadNoticeSummary } from './noticeReadService'
import { getOpenSurveys } from './surveyService'

export type AssistantMealSnapshot = {
  applied: boolean
  statusLabel: string
  serviceAvailable: boolean
}

export type AssistantNoticesSnapshot = {
  unreadCount: number
  unreadTitles: string[]
  /** Latest published notices — used by updates intent only, not unread list. */
  recentTitles: string[]
}

export type AssistantSurveysSnapshot = {
  pendingCount: number
  pendingTitles: string[]
}

export type AssistantSnapshot = {
  userId: string
  meal: AssistantMealSnapshot
  notices: AssistantNoticesSnapshot
  surveys: AssistantSurveysSnapshot
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

async function fetchMealSnapshot(userId: string): Promise<AssistantMealSnapshot> {
  const todayService = await getTodayLunchService()
  if (!todayService) {
    return { applied: false, statusLabel: '운영 없음', serviceAvailable: false }
  }

  const application = await getMyApplication(todayService.id, userId)
  const applied = application?.status === 'applied'
  return {
    applied,
    statusLabel: applied ? '신청 완료' : '미신청',
    serviceAvailable: true,
  }
}

async function fetchNoticesSnapshot(userId: string): Promise<AssistantNoticesSnapshot> {
  try {
    const summary = await getUnreadNoticeSummary(userId)
    return {
      unreadCount: summary.unreadCount,
      unreadTitles: summary.unreadNotices.map((notice) => notice.title),
      recentTitles: summary.recentNotices.map((notice) => notice.title),
    }
  } catch (error) {
    console.error('[assistant] unread notice summary failed:', error)
    const notices = await getNotices()
    return {
      unreadCount: notices.length,
      unreadTitles: notices.map((notice) => notice.title),
      recentTitles: notices.slice(0, 3).map((notice) => notice.title),
    }
  }
}

async function fetchSurveysSnapshot(userId: string): Promise<AssistantSurveysSnapshot> {
  const openSurveys = await getOpenSurveys()
  if (openSurveys.length === 0) {
    return { pendingCount: 0, pendingTitles: [] }
  }

  const surveyIds = openSurveys.map((survey) => survey.id)
  const { data: responses, error } = await supabase
    .from('survey_responses')
    .select('survey_id')
    .eq('user_id', userId)
    .in('survey_id', surveyIds)

  if (error) throw error

  const respondedIds = new Set((responses ?? []).map((row) => row.survey_id as number))
  const pending = openSurveys.filter((survey) => !respondedIds.has(survey.id))

  return {
    pendingCount: pending.length,
    pendingTitles: pending.slice(0, 3).map((survey) => survey.title),
  }
}

export async function fetchAssistantSnapshot(): Promise<AssistantSnapshot | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const [meal, notices, surveys] = await Promise.all([
    fetchMealSnapshot(userId),
    fetchNoticesSnapshot(userId),
    fetchSurveysSnapshot(userId),
  ])

  return { userId, meal, notices, surveys }
}

export function buildUpdateItems(snapshot: AssistantSnapshot): string[] {
  const items: string[] = []

  if (snapshot.notices.recentTitles[0]) {
    items.push(`새 공지: ${snapshot.notices.recentTitles[0]}`)
  }

  snapshot.surveys.pendingTitles.slice(0, 2).forEach((title) => {
    items.push(`설문: ${title} 참여 대기`)
  })

  items.push(`식수: 오늘 ${snapshot.meal.statusLabel}`)

  return items.slice(0, 5)
}

export { getTodayDate }
