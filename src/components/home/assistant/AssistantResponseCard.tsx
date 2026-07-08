import { Loader2 } from 'lucide-react'
import { ASSISTANT_EMPTY_MESSAGE, formatAssistantCheckedAt } from '../../../lib/assistantUi'
import type { AssistantResponse } from '../../../types/assistant'
import { Button } from '../../ui/primitives'

type AssistantResponseCardProps = {
  response: AssistantResponse | null
  checkedAt?: Date | null
  onAction?: (path: string) => void
  compact?: boolean
  hero?: boolean
}

function resolveActions(response: AssistantResponse) {
  if (response.actions && response.actions.length > 0) {
    return response.actions.slice(0, 2)
  }
  if (response.action) return [response.action]
  return []
}

export default function AssistantResponseCard({
  response,
  checkedAt,
  onAction,
  compact = false,
  hero = false,
}: AssistantResponseCardProps) {
  if (!response) {
    if (hero) return null

    return (
      <div
        className={
          (compact ? 'rounded-btn border border-dashed border-line/70 bg-canvas/30 px-2.5 py-2 ' : 'mt-3 rounded-btn border border-dashed border-line/70 bg-canvas/30 px-3 py-3 ')
        }
      >
        <p className="text-xs leading-relaxed text-slate-400">{ASSISTANT_EMPTY_MESSAGE}</p>
      </div>
    )
  }

  const isLoading = response.state === 'loading'
  const isError = response.state === 'error'
  const actions = resolveActions(response)

  return (
    <div
      className={
        (hero
          ? 'rounded-2xl border p-4 shadow-soft '
          : compact
            ? 'rounded-btn border p-2.5 '
            : 'mt-3 rounded-btn border p-3 ') +
        (isError
          ? 'border-danger/20 bg-red-50/30'
          : isLoading
            ? 'border-line/60 bg-canvas/40'
            : hero
              ? 'border-line/60 bg-white/90'
              : 'border-line/70 bg-canvas/50')
      }
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-slate-900">{response.title}</p>
        {isLoading ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-slate-400">
            <Loader2 size={11} className="animate-spin" aria-hidden="true" />
            확인 중...
          </span>
        ) : checkedAt ? (
          <span className="shrink-0 text-[10px] font-medium text-slate-400">
            {formatAssistantCheckedAt(checkedAt)}
          </span>
        ) : null}
      </div>

      {response.message ? (
        <p
          className={
            'mt-1 text-xs leading-relaxed ' +
            (isLoading ? 'text-slate-400' : isError ? 'text-slate-600' : 'text-slate-500')
          }
        >
          {response.message}
        </p>
      ) : null}

      {response.hint ? (
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{response.hint}</p>
      ) : null}

      {response.lines.length > 0 ? (
        <ul
          className={
            'mt-1.5 list-none space-y-0.5 overflow-y-auto p-0 ' +
            (hero ? 'max-h-40' : compact ? 'max-h-14' : 'max-h-28')
          }
        >
          {response.lines.map((line) => (
            <li key={line} className="text-xs leading-relaxed text-slate-600">
              {line.startsWith('- ') ? line : `· ${line}`}
            </li>
          ))}
        </ul>
      ) : null}

      {actions.length > 0 && onAction && !isLoading ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {actions.map((action) => (
            <Button
              key={action.path + action.label}
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => onAction(action.path)}
              className="h-7 px-2.5 text-xs"
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
