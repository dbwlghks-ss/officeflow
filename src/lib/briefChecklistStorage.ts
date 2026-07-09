const STORAGE_PREFIX = 'officeflow_brief_checklist_'

export function getBriefChecklistDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function storageKey(dateKey: string): string {
  return `${STORAGE_PREFIX}${dateKey}`
}

export function readBriefChecklistChecks(dateKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(dateKey))
    if (!raw) return new Set()

    const parsed = JSON.parse(raw) as { checkedIds?: string[] }
    if (!Array.isArray(parsed.checkedIds)) return new Set()

    return new Set(parsed.checkedIds.filter((id) => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

export function writeBriefChecklistChecks(dateKey: string, checkedIds: Set<string>): void {
  try {
    localStorage.setItem(
      storageKey(dateKey),
      JSON.stringify({ checkedIds: [...checkedIds] }),
    )
  } catch {
    // Checklist state is non-critical UI metadata.
  }
}

export function toggleBriefChecklistCheck(dateKey: string, itemId: string): Set<string> {
  const next = readBriefChecklistChecks(dateKey)
  if (next.has(itemId)) {
    next.delete(itemId)
  } else {
    next.add(itemId)
  }
  writeBriefChecklistChecks(dateKey, next)
  return next
}
