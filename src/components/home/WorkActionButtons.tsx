import { useState } from 'react'
import type { BriefActionButton } from '../../lib/briefActions'
import { applyTodayMeal, cancelTodayMeal } from '../../services/mealActionService'

type WorkActionButtonsProps = {
  actions: BriefActionButton[]
  onNavigate?: (path: string) => void
  variant?: 'brand' | 'default'
  disabled?: boolean
}

function isSecondaryAction(action: BriefActionButton, actions: BriefActionButton[]): boolean {
  if (action.kind === 'meal_cancel' && actions.length > 1) return true
  if (action.kind === 'meal_cancel' && actions.length === 1) return true
  return false
}

export default function WorkActionButtons({
  actions,
  onNavigate,
  variant = 'default',
  disabled = false,
}: WorkActionButtonsProps) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (actions.length === 0) return null

  async function handleMealApply(actionId: string) {
    setBusyId(actionId)
    setError(null)
    const result = await applyTodayMeal()
    setBusyId(null)
    if (!result.ok && result.reason !== 'already_applied') {
      setError(result.message)
    }
  }

  async function handleMealCancel(actionId: string) {
    setBusyId(actionId)
    setError(null)
    const result = await cancelTodayMeal()
    setBusyId(null)
    if (!result.ok) {
      setError(result.message)
    }
  }

  const isBrand = variant === 'brand'
  const brandClass =
    'rounded-full border border-white/20 bg-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60'
  const primaryClass =
    'rounded-full bg-brand px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60'
  const secondaryClass =
    'rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {actions.map((action) => {
          const buttonClass = isBrand
            ? brandClass
            : isSecondaryAction(action, actions)
              ? secondaryClass
              : primaryClass

          return (
            <button
              key={action.id}
              type="button"
              disabled={disabled || busyId !== null}
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
              className={buttonClass}
            >
              {busyId === action.id ? '처리 중...' : action.label}
            </button>
          )
        })}
      </div>
      {error ? <p className="text-[11px] text-danger">{error}</p> : null}
    </div>
  )
}
