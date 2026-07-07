import type { RecentUpdateSourceType } from '../lib/recentUpdatesMockData'
import { supabase } from '../lib/supabase'
import { fetchAssistantSnapshot } from './assistantDataService'
import { getUnreadNoticeSummary, normalizeNoticeId } from './noticeReadService'

export type NotificationDataSource = 'live' | 'mock'

export type NotificationCenterItem = {
  id: string
  source: RecentUpdateSourceType
  dataSource: NotificationDataSource
  title: string
  description: string
  timeLabel?: string
  occurredAt: string
  statusLabel?: string
  actionPath?: string
  isUnread?: boolean
  priority?: 'normal' | 'important' | 'urgent'
}

export type NotificationCenterData = {
  items: NotificationCenterItem[]
  badgeCount: number
  state: 'ready' | 'error' | 'unauthenticated'
}

function formatRelativeTimeLabel(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`

  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

function unreadNoticesToItems(
  unreadNotices: Awaited<ReturnType<typeof getUnreadNoticeSummary>>['unreadNotices'],
): NotificationCenterItem[] {
  return unreadNotices.map((notice) => {
    const noticeId = normalizeNoticeId(notice.id) ?? notice.id

    return {
      id: `notice-${noticeId}`,
      source: 'notice',
      dataSource: 'live',
      title: '새 공지',
      description: notice.title,
      timeLabel: formatRelativeTimeLabel(notice.created_at),
      occurredAt: notice.created_at,
      statusLabel: '미확인',
      actionPath: '/notice',
      isUnread: true,
      priority: 'important',
    }
  })
}

function pendingSurveysToItems(pendingTitles: string[]): NotificationCenterItem[] {
  const now = new Date().toISOString()

  return pendingTitles.map((title, index) => ({
    id: `survey-pending-${index}-${title}`,
    source: 'survey',
    dataSource: 'live',
    title: '참여 대기 설문',
    description: title,
    timeLabel: '참여 대기',
    occurredAt: now,
    statusLabel: '참여 대기',
    actionPath: '/survey',
    isUnread: true,
    priority: 'normal',
  }))
}

function mealStatusToItem(
  applied: boolean,
  serviceAvailable: boolean,
): NotificationCenterItem | null {
  if (!serviceAvailable || applied) return null

  const now = new Date().toISOString()
  return {
    id: 'meal-today',
    source: 'meal',
    dataSource: 'live',
    title: '오늘 식수 신청',
    description: '아직 신청하지 않았습니다.',
    timeLabel: '오늘',
    occurredAt: now,
    statusLabel: '신청 필요',
    actionPath: '/meal',
    isUnread: true,
    priority: 'normal',
  }
}

function countActionableItems(
  unreadNoticeCount: number,
  pendingSurveyCount: number,
  mealNeedsAction: boolean,
): number {
  return unreadNoticeCount + pendingSurveyCount + (mealNeedsAction ? 1 : 0)
}

export async function fetchNotificationCenterData(): Promise<NotificationCenterData> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { items: [], badgeCount: 0, state: 'unauthenticated' }
  }

  try {
    const [noticeSummary, snapshot] = await Promise.all([
      getUnreadNoticeSummary(user.id),
      fetchAssistantSnapshot(),
    ])

    if (!snapshot) {
      return { items: [], badgeCount: 0, state: 'unauthenticated' }
    }

    const mealItem = mealStatusToItem(snapshot.meal.applied, snapshot.meal.serviceAvailable)
    const liveItems: NotificationCenterItem[] = [
      ...unreadNoticesToItems(noticeSummary.unreadNotices),
      ...pendingSurveysToItems(snapshot.surveys.pendingTitles),
      ...(mealItem ? [mealItem] : []),
    ]

    const badgeCount = countActionableItems(
      noticeSummary.unreadCount,
      snapshot.surveys.pendingCount,
      Boolean(mealItem),
    )

    return {
      items: liveItems,
      badgeCount,
      state: 'ready',
    }
  } catch (error) {
    console.error('[notification] fetch failed:', error)
    return { items: [], badgeCount: 0, state: 'error' }
  }
}

/** @deprecated Use fetchNotificationCenterData().items */
export async function getLiveNotificationItems(): Promise<NotificationCenterItem[]> {
  const data = await fetchNotificationCenterData()
  return data.items
}

export async function getLiveNotificationUnreadCount(): Promise<number> {
  const data = await fetchNotificationCenterData()
  return data.badgeCount
}
