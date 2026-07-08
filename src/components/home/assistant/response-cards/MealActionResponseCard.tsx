import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { BriefActionButton } from '../../../../lib/briefActions'
import type { AssistantMealActionPayload } from '../../../../types/assistant'
import WorkActionButtons from '../../WorkActionButtons'

type MealActionResponseCardProps = {
  payload: AssistantMealActionPayload
  message?: string
  isError?: boolean
}

function buildFollowUpActions(action: AssistantMealActionPayload['action']): BriefActionButton[] {
  if (action === 'applied' || action === 'already_applied') {
    return [{ id: 'meal-cancel', label: '안 먹는 걸로 변경', kind: 'meal_cancel' }]
  }
  if (action === 'cancelled') {
    return [{ id: 'meal-apply', label: '먹는 걸로 신청', kind: 'meal_apply' }]
  }
  return []
}

function resolveCopy(action: AssistantMealActionPayload['action'], message?: string) {
  if (message) return message

  switch (action) {
    case 'applied':
      return '오늘 식수 신청을 완료했습니다.'
    case 'already_applied':
      return '이미 오늘 식수 신청이 완료되어 있습니다.'
    case 'cancelled':
      return '오늘 식수를 안 먹는 것으로 처리했습니다.'
    default:
      return '식수 상태를 변경하지 못했습니다.'
  }
}

function resolveHint(action: AssistantMealActionPayload['action']) {
  switch (action) {
    case 'applied':
    case 'already_applied':
      return 'Brief와 Work Queue에 반영되었습니다.'
    case 'cancelled':
      return '필요하면 다시 먹는 것으로 변경할 수 있습니다.'
    default:
      return undefined
  }
}

export default function MealActionResponseCard({
  payload,
  message,
  isError = false,
}: MealActionResponseCardProps) {
  const [currentAction, setCurrentAction] = useState(payload.action)
  const [feedback, setFeedback] = useState<string | null>(null)

  const title = resolveCopy(currentAction, feedback ?? message)
  const hint = resolveHint(currentAction)
  const followUpActions = isError ? [] : buildFollowUpActions(currentAction)

  return (
    <div
      className={
        'mt-3 rounded-xl border px-3.5 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ' +
        (isError ? 'border-danger/20 bg-red-50/30' : 'border-line/70 bg-surface')
      }
    >
      <div className="flex items-start gap-2.5">
        {!isError ? (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          {hint ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
          {followUpActions.length > 0 ? (
            <div className="mt-2.5">
              <WorkActionButtons
                actions={followUpActions}
                variant="default"
                onActionComplete={(nextMessage) => {
                  setFeedback(nextMessage)
                  if (nextMessage.includes('완료')) setCurrentAction('applied')
                  if (nextMessage.includes('안 먹는')) setCurrentAction('cancelled')
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
