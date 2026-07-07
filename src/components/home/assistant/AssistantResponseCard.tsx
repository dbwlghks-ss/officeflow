import { ArrowRight } from 'lucide-react'
import type { AssistantResponse } from '../../../types/assistant'

type AssistantResponseCardProps = {
  response: AssistantResponse | null
  onAction?: (path: string) => void
}

export default function AssistantResponseCard({ response, onAction }: AssistantResponseCardProps) {
  if (!response) return null

  const isLoading = response.state === 'loading'

  return (
    <div className="mt-3 rounded-btn border border-line/70 bg-canvas/50 p-3">
      <p className="text-xs font-semibold text-slate-900">{response.title}</p>
      {response.message ? (
        <p className={`mt-1 text-xs leading-relaxed ${isLoading ? 'text-slate-400' : 'text-slate-500'}`}>
          {response.message}
        </p>
      ) : null}
      {response.lines.length > 0 ? (
        <ul className="mt-2 max-h-28 list-none space-y-1 overflow-y-auto p-0">
          {response.lines.map((line) => (
            <li key={line} className="text-xs leading-relaxed text-slate-600">
              {line}
            </li>
          ))}
        </ul>
      ) : null}
      {response.action && onAction && !isLoading ? (
        <button
          type="button"
          onClick={() => onAction(response.action!.path)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand-hover"
        >
          {response.action.label}
          <ArrowRight size={12} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
