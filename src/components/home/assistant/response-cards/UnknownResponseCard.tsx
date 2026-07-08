import type { AssistantUnknownPayload } from '../../../../types/assistant'

type UnknownResponseCardProps = {
  payload: AssistantUnknownPayload
  message?: string
  onSuggestedQuery?: (query: string) => void
}

export default function UnknownResponseCard({
  payload,
  message,
  onSuggestedQuery,
}: UnknownResponseCardProps) {
  return (
    <div className="mt-3 rounded-xl border border-dashed border-line/80 bg-canvas/40 px-4 py-4">
      <p className="text-sm leading-relaxed text-slate-600">
        {message ?? '아직 이해하지 못한 요청입니다. 아래처럼 질문해보세요.'}
      </p>
      <p className="mt-2 text-[11px] font-medium text-slate-400">추천</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {payload.suggestions.map((query) => (
          <button
            key={query}
            type="button"
            onClick={() => onSuggestedQuery?.(query)}
            className="rounded-full border border-line/80 bg-surface px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-brand/25 hover:bg-brand-light/40 hover:text-brand"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  )
}
