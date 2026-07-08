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
  /** Visual tone for Brief bento card backgrounds. */
  tone?: 'light' | 'brand'
  /** Column count for summary grid. */
  columns?: 2 | 4
}

export default function BriefSummaryList({
  items,
  className = '',
  tone = 'light',
  columns = 4,
}: BriefSummaryListProps) {
  const onBrand = tone === 'brand'
  const colClass = columns === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'

  return (
    <div
      className={
        (onBrand ? 'border-t border-white/18 pt-3' : 'border-t border-line/70 pt-3') +
        (className ? ` ${className}` : '')
      }
      aria-label="오늘의 업무 요약"
    >
      <ul className={`grid ${colClass} gap-2`}>
        {items.map((item) => {
          const Icon = ICON_BY_ID[item.id]

          return (
            <li
              key={item.id}
              className={
                onBrand
                  ? 'rounded-btn border border-white/[0.16] bg-white/[0.12] px-2 py-1.5 transition-colors hover:bg-white/[0.14]'
                  : 'rounded-btn border border-line/70 bg-canvas/40 px-3 py-2.5'
              }
            >
              <div className="flex items-center gap-1.5">
                <Icon
                  size={13}
                  strokeWidth={1.75}
                  className={'shrink-0 ' + (onBrand ? 'text-white/65' : 'text-slate-400')}
                  aria-hidden="true"
                />
                <span
                  className={
                    'text-[11px] font-medium ' + (onBrand ? 'text-white/70' : 'text-slate-400')
                  }
                >
                  {item.label}
                </span>
              </div>
              <p
                className={
                  'mt-1 text-sm tabular-nums tracking-tight font-semibold ' +
                  (onBrand
                    ? 'text-white'
                    : item.emphasis
                      ? 'text-slate-900'
                      : 'text-slate-700')
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
