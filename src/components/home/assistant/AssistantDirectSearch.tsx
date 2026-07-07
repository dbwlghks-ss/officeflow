import { Search } from 'lucide-react'

type AssistantDirectSearchProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export default function AssistantDirectSearch({
  value,
  onChange,
  onSubmit,
}: AssistantDirectSearchProps) {
  return (
    <form
      className="shrink-0 border-t border-line/60 pt-2"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label htmlFor="assistant-direct-search" className="sr-only">
        검색어 또는 업무 질문 입력
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={14}
          aria-hidden="true"
        />
        <input
          id="assistant-direct-search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="검색어 또는 업무 질문을 입력하세요."
          className="h-8 w-full rounded-btn border border-line/70 bg-canvas/50 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-brand/30 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/10"
        />
      </div>
    </form>
  )
}
