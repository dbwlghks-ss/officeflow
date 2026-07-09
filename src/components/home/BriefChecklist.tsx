import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { buildBriefChecklistItems, type BriefChecklistItem } from '../../lib/briefChecklist'
import {
  getBriefChecklistDateKey,
  readBriefChecklistChecks,
  toggleBriefChecklistCheck,
} from '../../lib/briefChecklistStorage'
import type { BriefDisplayMode, BriefSummaryData } from '../../lib/homeBriefSummary'

type BriefChecklistProps = {
  data: BriefSummaryData
  mode: BriefDisplayMode
  date?: Date
}

function ChecklistRow({
  item,
  checked,
  onToggle,
}: {
  item: BriefChecklistItem
  checked: boolean
  onToggle: (itemId: string) => void
}) {
  const isChecked = checked && item.checkable

  if (!item.checkable) {
    return (
      <li className="flex items-start gap-2 rounded-md px-0.5 py-0.5">
        <span
          className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-white/25 bg-white/8"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-relaxed text-white/85">{item.label}</p>
          {item.hint ? (
            <p className="mt-0.5 text-[10px] text-white/50">{item.hint}</p>
          ) : null}
        </div>
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        aria-label={item.label}
        onClick={() => onToggle(item.id)}
        className="flex w-full items-start gap-2 rounded-md px-0.5 py-0.5 text-left transition-colors hover:bg-white/8"
      >
        <span
          className={
            'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors ' +
            (isChecked
              ? 'border-white/35 bg-white/25 text-white'
              : 'border-white/35 bg-transparent text-transparent')
          }
          aria-hidden="true"
        >
          <Check size={10} strokeWidth={2.5} />
        </span>
        <span
          className={
            'min-w-0 flex-1 text-xs leading-relaxed transition-colors ' +
            (isChecked ? 'text-white/55' : 'text-white/90')
          }
        >
          {item.label}
        </span>
      </button>
    </li>
  )
}

export default function BriefChecklist({ data, mode, date = new Date() }: BriefChecklistProps) {
  const dateKey = getBriefChecklistDateKey(date)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => readBriefChecklistChecks(dateKey))
  const { items, isEmpty } = buildBriefChecklistItems(data, mode)

  useEffect(() => {
    setCheckedIds(readBriefChecklistChecks(dateKey))
  }, [dateKey])

  if (mode === 'loading') {
    return (
      <div className="mt-1.5 space-y-1" aria-busy="true" aria-label="오늘 할 일 확인 중">
        <p className="text-xs text-white/60">오늘 할 일을 확인하는 중입니다.</p>
      </div>
    )
  }

  if (mode === 'error' || mode === 'unauthenticated') {
    return null
  }

  if (isEmpty) {
    return (
      <div className="mt-1.5 space-y-0.5" aria-label="오늘 할 일">
        <p className="text-xs leading-relaxed text-white/85">오늘 확인할 업무는 없습니다.</p>
        <p className="text-xs leading-relaxed text-white/65">여유 있게 하루를 시작하세요.</p>
      </div>
    )
  }

  function handleToggle(itemId: string) {
    const next = toggleBriefChecklistCheck(dateKey, itemId)
    setCheckedIds(new Set(next))
  }

  return (
    <div className="mt-1.5 min-h-0" aria-label="오늘 할 일">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/55">오늘 할 일</p>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {items.map((item) => (
          <ChecklistRow
            key={item.id}
            item={item}
            checked={checkedIds.has(item.id)}
            onToggle={handleToggle}
          />
        ))}
      </ul>
    </div>
  )
}
