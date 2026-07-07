import {
  Calendar,
  ClipboardList,
  Mail,
  Megaphone,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import type { RecentUpdateItemData, RecentUpdateSourceType } from '../../../lib/recentUpdatesMockData'

const ICON_BY_SOURCE: Record<RecentUpdateSourceType, LucideIcon> = {
  notice: Megaphone,
  survey: ClipboardList,
  meal: UtensilsCrossed,
  schedule: Calendar,
  mail: Mail,
  calendar: Calendar,
  ai: Sparkles,
}

type RecentUpdateItemProps = {
  item: RecentUpdateItemData
}

export default function RecentUpdateItem({ item }: RecentUpdateItemProps) {
  const Icon = ICON_BY_SOURCE[item.source]

  return (
    <li className="flex gap-3 border-b border-line/60 py-3 last:border-b-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-slate-500">
        <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
        {item.description ? (
          <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
        ) : null}
        {item.timeLabel ? (
          <p className="mt-1 text-xs font-medium text-slate-400">{item.timeLabel}</p>
        ) : null}
      </div>
    </li>
  )
}
