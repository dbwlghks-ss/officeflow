import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { formatAssistantCheckedAt } from '../../../../lib/assistantUi'
import type { AssistantResponse } from '../../../../types/assistant'

type AssistantResponseShellProps = {
  response: AssistantResponse
  checkedAt?: Date | null
  hero?: boolean
  compact?: boolean
  children?: ReactNode
}

export default function AssistantResponseShell({
  response,
  checkedAt,
  hero = false,
  compact = false,
  children,
}: AssistantResponseShellProps) {
  const isLoading = response.state === 'loading'
  const isError = response.state === 'error'

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
              ? 'border-line/60 bg-white/95'
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

      {children}

      {isError && response.hint ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-400">{response.hint}</p>
      ) : null}
    </div>
  )
}
