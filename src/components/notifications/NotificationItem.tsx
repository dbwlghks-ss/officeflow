import {
  Calendar,
  ClipboardList,
  Mail,
  Megaphone,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import {
  getNotificationStatusTone,
  type RecentUpdateItemData,
  type RecentUpdateSourceType,
} from '../../lib/recentUpdatesMockData'
import { Badge } from '../ui/primitives'

const ICON_BY_SOURCE: Record<RecentUpdateSourceType, LucideIcon> = {
  notice: Megaphone,
  survey: ClipboardList,
  meal: UtensilsCrossed,
  schedule: Calendar,
  mail: Mail,
  calendar: Calendar,
  ai: Sparkles,
}

type NotificationItemProps = {
  item: RecentUpdateItemData
  onAction?: (path: string) => void
}

export default function NotificationItem({ item, onAction }: NotificationItemProps) {
  const Icon = ICON_BY_SOURCE[item.source]
  const badgeTone = getNotificationStatusTone(item.statusLabel)

  return (
    <li className="border-b border-line/60 px-4 py-3 last:border-b-0">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-slate-500">
          <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            {item.statusLabel ? <Badge tone={badgeTone}>{item.statusLabel}</Badge> : null}
          </div>
          {item.description ? (
            <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
          ) : null}
          {item.timeLabel ? (
            <p className="mt-1 text-xs font-medium text-slate-400">{item.timeLabel}</p>
          ) : null}
          {item.actionPath && onAction ? (
            <button
              type="button"
              onClick={() => onAction(item.actionPath!)}
              className="mt-2 text-xs font-medium text-brand transition-colors hover:text-brand-hover"
            >
              바로가기
            </button>
          ) : null}
        </div>
      </div>
    </li>
  )
}
