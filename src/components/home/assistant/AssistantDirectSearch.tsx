import { ArrowUp } from 'lucide-react'

type AssistantDirectSearchProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  compact?: boolean
}

export default function AssistantDirectSearch({
  value,
  onChange,
  onSubmit,
  compact = false,
}: AssistantDirectSearchProps) {
  return (
    <form
      className={compact ? 'shrink-0' : 'shrink-0 border-t border-line/60 pt-2'}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label htmlFor="assistant-direct-search" className="sr-only">
        OfficeFlow Assistant 질문 입력
      </label>
      <div className="relative flex items-center gap-2">
        <input
          id="assistant-direct-search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="예: 오늘 밥 뭐야?, 홍길동 직급 알려줘"
          className="h-9 min-w-0 flex-1 rounded-btn border border-line/70 bg-canvas/50 px-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-brand/30 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/10"
        />
        <button
          type="submit"
          aria-label="질문 실행"
          disabled={!value.trim()}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-btn bg-brand text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-brand/40"
        >
          <ArrowUp size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
