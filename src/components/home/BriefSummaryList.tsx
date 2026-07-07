import { ClipboardList, Megaphone, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import type { BriefSummaryItem } from '../../lib/homeBriefSummary'

const ICON_BY_ID: Record<BriefSummaryItem['id'], LucideIcon> = {
  meal: UtensilsCrossed,
  notice: Megaphone,
  survey: ClipboardList,
}

type BriefSummaryListProps = {
  items: BriefSummaryItem[]
}

export default function BriefSummaryList({ items }: BriefSummaryListProps) {
  return (
    <div
      className="mt-5 max-w-3xl border-t border-line/70 pt-4"
      aria-label="오늘의 업무 요약"
    >
      <ul className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-0">
        {items.map((item, index) => {
          const Icon = ICON_BY_ID[item.id]
          const isLast = index === items.length - 1

          return (
            <li key={item.id} className="flex items-center sm:shrink-0">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Icon
                  size={15}
                  strokeWidth={1.75}
                  className="shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <span className="text-slate-400">{item.label}</span>
                <span
                  className={
                    item.emphasis ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'
                  }
                >
                  {item.value}
                </span>
              </div>
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="mx-4 hidden h-3 w-px bg-line sm:inline-block"
                />
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
