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
  INBOX_SOURCE_META,
  type InboxItemData,
  type InboxSourceType,
} from '../../../lib/unifiedInboxMockData'

const ICON_BY_SOURCE: Record<InboxSourceType, LucideIcon> = {
  notice: Megaphone,
  survey: ClipboardList,
  meal: UtensilsCrossed,
  schedule: Calendar,
  mail: Mail,
  calendar: Calendar,
  ai: Sparkles,
}

type InboxItemProps = {
  item: InboxItemData
  isLast?: boolean
}

export default function InboxItem({ item, isLast = false }: InboxItemProps) {
  const Icon = ICON_BY_SOURCE[item.source]
  const meta = INBOX_SOURCE_META[item.source]

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast ? (
        <span
          aria-hidden="true"
          className="absolute left-[17px] top-9 bottom-0 w-px bg-line"
        />
      ) : null}

      <div
        className={`relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.accentClass}`}
      >
        <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
          {item.timeLabel ? (
            <span className="shrink-0 text-xs font-medium text-slate-400">{item.timeLabel}</span>
          ) : null}
        </div>
        {item.description ? (
          <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
        ) : null}
      </div>
    </li>
  )
}
