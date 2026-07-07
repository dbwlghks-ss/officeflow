export type BriefPeriod = 'morning' | 'afternoon' | 'evening'

export type HomeBriefContent = {
  period: BriefPeriod
  greeting: string
  title: string
  emoji: string
  intro: string
}

const BRIEF_BY_PERIOD: Record<BriefPeriod, Omit<HomeBriefContent, 'period'>> = {
  morning: {
    greeting: '좋은 아침이에요',
    title: 'Morning Brief',
    emoji: '🌅',
    intro: '오늘도 좋은 하루를 시작해볼까요?',
  },
  afternoon: {
    greeting: '좋은 오후예요',
    title: 'Afternoon Brief',
    emoji: '☀️',
    intro: '남은 업무를 확인해보세요.',
  },
  evening: {
    greeting: '좋은 저녁이에요',
    title: 'Evening Brief',
    emoji: '🌙',
    intro: '오늘 업무를 마무리해볼까요?',
  },
}

/** 05:00–11:59 morning · 12:00–16:59 afternoon · 17:00–04:59 evening */
export function resolveBriefPeriod(date: Date): BriefPeriod {
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  return 'evening'
}

export function getHomeBriefContent(date: Date = new Date()): HomeBriefContent {
  const period = resolveBriefPeriod(date)
  const base = BRIEF_BY_PERIOD[period]

  const greeting =
    period === 'evening' && date.getHours() < 5 ? '좋은 밤이에요' : base.greeting

  return { period, ...base, greeting }
}

export function formatHomeHeroDate(date: Date = new Date()): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}
