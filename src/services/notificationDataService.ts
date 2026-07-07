import type { RecentUpdateItemData } from '../lib/recentUpdatesMockData'
import { getNotificationItems } from '../lib/recentUpdatesMockData'
import { supabase } from '../lib/supabase'
import { getUnreadNoticeSummary, normalizeNoticeId } from './noticeReadService'

function formatNoticeTimeLabel(iso: string): string {
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
): RecentUpdateItemData[] {
  return unreadNotices.slice(0, 5).map((notice) => {
    const noticeId = normalizeNoticeId(notice.id) ?? notice.id

    return {
      id: `notice-${noticeId}`,
    source: 'notice',
    title: notice.title,
    description: '읽지 않은 공지',
    timeLabel: formatNoticeTimeLabel(notice.created_at),
    occurredAt: notice.created_at,
    statusLabel: '미확인',
    actionPath: '/notice',
    isUnread: true,
    }
  })
}

/** Live notice items plus existing mock items for other sources. */
export async function getLiveNotificationItems(): Promise<RecentUpdateItemData[]> {
  const mockNonNoticeItems = getNotificationItems().filter((item) => item.source !== 'notice')

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return getNotificationItems()
  }

  try {
    const summary = await getUnreadNoticeSummary(user.id)
    return [...unreadNoticesToItems(summary.unreadNotices), ...mockNonNoticeItems]
  } catch (error) {
    console.error('[notification] live notice items failed:', error)
    return getNotificationItems()
  }
}

export async function getLiveNotificationUnreadCount(): Promise<number> {
  const items = await getLiveNotificationItems()
  return items.filter((item) => item.isUnread !== false).length
}
