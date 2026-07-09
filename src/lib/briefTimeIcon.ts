import type { LucideIcon } from 'lucide-react'
import { MoonStar, Sun, Sunrise, Sunset } from 'lucide-react'

export type BriefTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export type BriefTimeIconMeta = {
  timeOfDay: BriefTimeOfDay
  Icon: LucideIcon
  iconClassName: string
}

const ICON_BY_TIME: Record<BriefTimeOfDay, LucideIcon> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: MoonStar,
}

/** 05:00–10:59 morning · 11:00–16:59 afternoon · 17:00–20:59 evening · 21:00–04:59 night */
export function resolveBriefTimeOfDay(date: Date): BriefTimeOfDay {
  const hour = date.getHours()

  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

export function getBriefTimeIconMeta(date: Date = new Date()): BriefTimeIconMeta {
  const timeOfDay = resolveBriefTimeOfDay(date)

  return {
    timeOfDay,
    Icon: ICON_BY_TIME[timeOfDay],
    iconClassName:
      'pointer-events-none absolute right-2 top-0.5 h-10 w-10 text-white opacity-[0.15] ' +
      'lg:right-3 lg:top-1.5 lg:h-11 lg:w-11',
  }
}
