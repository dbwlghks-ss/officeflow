import { supabase } from '../lib/supabase'
import { getNotices, type Notice } from './noticeService'

export const NOTICE_READ_EVENT = 'officeflow:notice-read'

/** Matches public.notices.id and notice_reads.notice_id (bigint). */
export type NoticeIdInput = number | string

export type UnreadNoticeSummary = {
  unreadCount: number
  unreadNotices: Notice[]
  recentNotices: Notice[]
  readNoticeIds: Set<number>
}

/** Coerce notice id to a positive integer for bigint columns. */
export function normalizeNoticeId(noticeId: NoticeIdInput): number | null {
  if (typeof noticeId === 'number') {
    return Number.isInteger(noticeId) && noticeId > 0 ? noticeId : null
  }

  const trimmed = noticeId.trim()
  if (!trimmed) return null

  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed) || parsed <= 0) return null

  return parsed
}

function normalizeNoticeIdFromRow(value: unknown): number | null {
  if (typeof value === 'number' || typeof value === 'string') {
    return normalizeNoticeId(value)
  }
  return null
}

export async function getReadNoticeIds(userId: string): Promise<Set<number>> {
  const { data, error } = await supabase
    .from('notice_reads')
    .select('notice_id')
    .eq('user_id', userId)

  if (error) throw error

  const readIds = new Set<number>()
  for (const row of data ?? []) {
    const noticeId = normalizeNoticeIdFromRow(row.notice_id)
    if (noticeId !== null) readIds.add(noticeId)
  }

  return readIds
}

export async function getUnreadNoticeSummary(userId: string): Promise<UnreadNoticeSummary> {
  const notices = await getNotices()
  const readNoticeIds = await getReadNoticeIds(userId)
  const unreadNotices = notices.filter((notice) => {
    const noticeId = normalizeNoticeId(notice.id)
    return noticeId !== null && !readNoticeIds.has(noticeId)
  })

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
export async function markNoticeAsRead(noticeId: NoticeIdInput): Promise<boolean> {
  const normalizedId = normalizeNoticeId(noticeId)
  if (normalizedId === null) {
    console.error('[notice-read] invalid notice id:', noticeId)
    return false
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: existing, error: selectError } = await supabase
    .from('notice_reads')
    .select('notice_id')
    .eq('user_id', user.id)
    .eq('notice_id', normalizedId)
    .maybeSingle()

  if (selectError) {
    console.error('[notice-read] existing read check failed:', selectError)
    return false
  }

  if (existing) {
    dispatchNoticeReadEvent(normalizedId)
    return true
  }

  const { error: insertError } = await supabase.from('notice_reads').insert({
    notice_id: normalizedId,
    user_id: user.id,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      dispatchNoticeReadEvent(normalizedId)
      return true
    }
    console.error('[notice-read] insert failed:', insertError)
    return false
  }

  dispatchNoticeReadEvent(normalizedId)
  return true
}
