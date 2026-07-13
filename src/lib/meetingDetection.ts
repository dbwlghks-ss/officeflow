const MEETING_KEYWORDS = [
  '회의',
  '검토',
  '정리',
  '마감',
  '담당',
  '결정',
  '논의',
  '필요',
  '다음 주',
  '금요일',
  '하기로',
] as const

export function countLineBreaks(text: string): number {
  return (text.match(/\n/g) ?? []).length
}

export function isLongWorkMemo(text: string): boolean {
  const trimmed = text.trim()
  return trimmed.length >= 100 || countLineBreaks(trimmed) >= 2
}

export function containsMeetingKeyword(text: string): boolean {
  return MEETING_KEYWORDS.some((keyword) => text.includes(keyword))
}

/** Returns true when input should route to meeting analysis instead of rule-based assistant. */
export function shouldAnalyzeMeetingMinutes(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  if (!isLongWorkMemo(trimmed)) return false
  return containsMeetingKeyword(trimmed)
}
