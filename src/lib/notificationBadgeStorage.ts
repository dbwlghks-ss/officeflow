const STORAGE_PREFIX = 'officeflow_notification_last_seen_at'

function storageKey(userId?: string | null): string {
  if (userId) return `${STORAGE_PREFIX}_${userId}`
  return STORAGE_PREFIX
}

export function getNotificationLastSeenAt(userId?: string | null): string | null {
  try {
    return localStorage.getItem(storageKey(userId))
  } catch {
    return null
  }
}

export function setNotificationLastSeenAt(
  seenAt: string,
  userId?: string | null,
): void {
  try {
    localStorage.setItem(storageKey(userId), seenAt)
  } catch {
    // Badge metadata is non-critical UI state.
  }
}

/** Marks the notification center as seen without changing notice/survey/meal data. */
export function markNotificationCenterSeen(
  seenAt = new Date().toISOString(),
  userId?: string | null,
): void {
  setNotificationLastSeenAt(seenAt, userId)
}

export function countUnseenNotificationItems<T extends { occurredAt?: string }>(
  items: T[],
  lastSeenAt: string | null,
): number {
  if (!lastSeenAt) return items.length

  const seenMs = Date.parse(lastSeenAt)
  if (Number.isNaN(seenMs)) return items.length

  return items.filter((item) => {
    const stamp = item.occurredAt
    if (!stamp) return true
    const itemMs = Date.parse(stamp)
    if (Number.isNaN(itemMs)) return true
    return itemMs > seenMs
  }).length
}
