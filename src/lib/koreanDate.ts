const KST_TIMEZONE = 'Asia/Seoul'

/** YYYY-MM-DD in Korea Standard Time. */
export function getTodayDateKST(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
