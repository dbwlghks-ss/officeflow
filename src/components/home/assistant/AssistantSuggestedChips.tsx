import { SUGGESTED_ASSISTANT_QUERIES } from '../../../features/assistant/assistantIntent'

type AssistantSuggestedChipsProps = {
  onSelect: (query: string) => void
}

export default function AssistantSuggestedChips({ onSelect }: AssistantSuggestedChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SUGGESTED_ASSISTANT_QUERIES.map((query) => (
        <button
          key={query}
          type="button"
          onClick={() => onSelect(query)}
          className="rounded-full border border-line/70 bg-surface px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-brand/20 hover:bg-brand-light/40 hover:text-brand"
        >
          {query}
        </button>
      ))}
    </div>
  )
}
