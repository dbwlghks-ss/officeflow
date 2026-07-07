/** Korean 12-hour time, e.g. "오후 3:42" (no seconds). */
export function formatKoreanTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export const KOREAN_CLOCK_TICK_MS = 60_000
