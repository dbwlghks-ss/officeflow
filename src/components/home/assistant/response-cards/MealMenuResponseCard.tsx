import {
  formatCafeteriaLabel,
  formatMealTypeLabel,
  formatMenuDateLabel,
} from '../../../../lib/assistantResponsePayload'
import type { AssistantMealMenuPayload } from '../../../../types/assistant'

type MealMenuResponseCardProps = {
  payload: AssistantMealMenuPayload
  message?: string
}

export default function MealMenuResponseCard({ payload, message }: MealMenuResponseCardProps) {
  if (payload.unavailable) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-line/80 bg-canvas/40 px-4 py-5 text-center">
        <p className="text-sm text-slate-600">식단 데이터가 아직 연결되지 않았습니다.</p>
        <p className="mt-1 text-xs text-slate-400">
          관리자가 meal_menus 테이블을 적용하면 이곳에서 오늘 식단을 확인할 수 있습니다.
        </p>
      </div>
    )
  }

  if (payload.empty || payload.items.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-line/80 bg-canvas/40 px-4 py-5 text-center">
        <p className="text-sm text-slate-600">{message ?? '오늘 등록된 식단 정보가 없습니다.'}</p>
      </div>
    )
  }

  const mealLabel = formatMealTypeLabel(payload.mealType)
  const cafeteriaLabel = formatCafeteriaLabel(payload.cafeteria)

  return (
    <div className="mt-3 rounded-xl border border-line/70 bg-surface px-3.5 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <p className="text-[11px] font-medium text-slate-400">{formatMenuDateLabel(payload.menuDate)}</p>
      <h3 className="mt-0.5 text-base font-semibold text-slate-900">오늘 {mealLabel} 메뉴</h3>
      <p className="mt-0.5 text-sm text-slate-500">{cafeteriaLabel}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {payload.items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-line/80 bg-canvas/60 px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            {item}
          </span>
        ))}
      </div>

      {payload.note?.trim() ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">비고: {payload.note.trim()}</p>
      ) : null}
      {payload.calories ? (
        <p className="mt-1 text-xs text-slate-400">{payload.calories} kcal</p>
      ) : null}
    </div>
  )
}
