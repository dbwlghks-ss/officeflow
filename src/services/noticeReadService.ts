import { supabase } from '../lib/supabase'
import { getNotices, type Notice } from './noticeService'

export const NOTICE_READ_EVENT = 'officeflow:notice-read'

export type UnreadNoticeSummary = {
  unreadCount: number
  unreadNotices: Notice[]
  recentNotices: Notice[]
  readNoticeIds: Set<number>
}

export async function getReadNoticeIds(userId: string): Promise<Set<number>> {
  const { data, error } = await supabase
    .from('notice_reads')
    .select('notice_id')
    .eq('user_id', userId)

  if (error) throw error
  return new Set((data ?? []).map((row) => row.notice_id as number))
}

export async function getUnreadNoticeSummary(userId: string): Promise<UnreadNoticeSummary> {
  const notices = await getNotices()
  const readNoticeIds = await getReadNoticeIds(userId)
  const unreadNotices = notices.filter((notice) => !readNoticeIds.has(notice.id))

  return {
    unreadCount: unreadNotices.length,
    unreadNotices,
    recentNotices: notices.slice(0, 3),
    readNoticeIds,
  }
}

function dispatchNoticeReadEvent(noticeId: number) {
  window.dispatchEvent(new CustomEvent(NOTICE_READ_EVENT, { detail: { noticeId } }))
}

/** Marks the current user's notice as read. Idempotent — safe to call repeatedly. */
export async function markNoticeAsRead(noticeId: number): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: existing, error: selectError } = await supabase
    .from('notice_reads')
    .select('notice_id')
    .eq('user_id', user.id)
    .eq('notice_id', noticeId)
    .maybeSingle()

  if (selectError) {
    console.error('[notice-read] existing read check failed:', selectError)
    return false
  }

  if (existing) {
    dispatchNoticeReadEvent(noticeId)
    return true
  }

  const { error: insertError } = await supabase.from('notice_reads').insert({
    notice_id: noticeId,
    user_id: user.id,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      dispatchNoticeReadEvent(noticeId)
      return true
    }
    console.error('[notice-read] insert failed:', insertError)
    return false
  }

  dispatchNoticeReadEvent(noticeId)
  return true
}
