import { useState } from 'react'
import type { BriefActionItem } from '../../lib/briefActions'
import { applyTodayMeal, cancelTodayMeal } from '../../services/mealActionService'

type BriefActionPanelProps = {
  items: BriefActionItem[]
  onNavigate?: (path: string) => void
}

export default function BriefActionPanel({ items, onNavigate }: BriefActionPanelProps) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  if (items.length === 0 && !feedback) return null

  async function handleMealApply(actionId: string) {
    setBusyId(actionId)
    setFeedback(null)
    const result = await applyTodayMeal()
    setBusyId(null)
    setFeedback(result.message)
  }

  async function handleMealCancel(actionId: string) {
    setBusyId(actionId)
    setFeedback(null)
    const result = await cancelTodayMeal()
    setBusyId(null)
    setFeedback(result.message)
  }

  return (
    <div className="mt-2 space-y-2">
      {feedback ? (
        <p className="rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-medium text-white/90">
          {feedback}
        </p>
      ) : null}

      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-btn border border-white/[0.16] bg-white/[0.10] px-3 py-2.5"
        >
          <p className="text-xs leading-relaxed text-white/85">{item.message}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.actions.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={busyId !== null}
                onClick={() => {
                  if (action.kind === 'meal_apply') {
                    void handleMealApply(action.id)
                    return
                  }
                  if (action.kind === 'meal_cancel') {
                    void handleMealCancel(action.id)
                    return
                  }
                  if (action.kind === 'navigate' && action.path && onNavigate) {
                    onNavigate(action.path)
                  }
                }}
                className="rounded-full border border-white/20 bg-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyId === action.id ? '처리 중...' : action.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
