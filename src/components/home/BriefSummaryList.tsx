import { Calendar, ClipboardList, Megaphone, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import type { BriefSummaryItem } from '../../lib/homeBriefSummary'

const ICON_BY_ID: Record<BriefSummaryItem['id'], LucideIcon> = {
  meal: UtensilsCrossed,
  notice: Megaphone,
  survey: ClipboardList,
  schedule: Calendar,
}

type BriefSummaryListProps = {
  items: BriefSummaryItem[]
  className?: string
}

export default function BriefSummaryList({ items, className = '' }: BriefSummaryListProps) {
  return (
    <div
      className={`border-t border-line/70 pt-4${className ? ` ${className}` : ''}`}
      aria-label="오늘의 업무 요약"
    >
      <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = ICON_BY_ID[item.id]

          return (
            <li
              key={item.id}
              className="rounded-btn border border-line/70 bg-canvas/40 px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5">
                <Icon
                  size={14}
                  strokeWidth={1.75}
                  className="shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium text-slate-400">{item.label}</span>
              </div>
              <p
                className={
                  'mt-1.5 text-sm tabular-nums tracking-tight ' +
                  (item.emphasis
                    ? 'font-semibold text-slate-900'
                    : 'font-semibold text-slate-700')
                }
              >
                {item.value}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
