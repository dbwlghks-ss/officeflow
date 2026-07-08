import { SUGGESTED_ASSISTANT_QUERIES } from '../../../features/assistant/assistantIntent'

type AssistantSuggestedChipsProps = {
  onSelect: (query: string) => void
  variant?: 'default' | 'hero'
}

export default function AssistantSuggestedChips({
  onSelect,
  variant = 'default',
}: AssistantSuggestedChipsProps) {
  const onHero = variant === 'hero'

  return (
    <div className={'flex flex-wrap gap-2 ' + (onHero ? 'justify-center' : '')}>
      {SUGGESTED_ASSISTANT_QUERIES.map((query) => (
        <button
          key={query}
          type="button"
          onClick={() => onSelect(query)}
          className={
            'rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ' +
            (onHero
              ? 'border-slate-200/80 bg-white text-slate-600 shadow-sm hover:border-brand/25 hover:bg-brand-light/30 hover:text-brand'
              : 'border-line/70 bg-surface text-slate-600 hover:border-brand/20 hover:bg-brand-light/40 hover:text-brand')
          }
        >
          {query}
        </button>
      ))}
    </div>
  )
}
