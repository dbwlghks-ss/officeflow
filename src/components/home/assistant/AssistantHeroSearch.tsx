import { ArrowUp, Sparkles } from 'lucide-react'

type AssistantHeroSearchProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export default function AssistantHeroSearch({ value, onChange, onSubmit }: AssistantHeroSearchProps) {
  return (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label htmlFor="assistant-hero-search" className="sr-only">
        Ask OfficeFlow 질문 입력
      </label>
      <div
        className={
          'flex h-[64px] w-full items-center gap-3 rounded-full border border-slate-200/70 bg-white px-4 ' +
          'shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-shadow focus-within:border-brand/25 ' +
          'focus-within:ring-4 focus-within:ring-blue-500/10 lg:h-[68px] lg:px-5'
        }
      >
        <Sparkles
          size={20}
          strokeWidth={1.75}
          className="shrink-0 text-brand/70"
          aria-hidden="true"
        />
        <input
          id="assistant-hero-search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="직원 정보, 오늘 식단, 식수 신청을 물어보세요"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none lg:text-base"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label="질문 실행"
          className={
            'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium text-white ' +
            'bg-gradient-to-r from-[#1648B8] to-[#2F63E6] transition-opacity hover:opacity-95 ' +
            'disabled:cursor-not-allowed disabled:opacity-40 lg:px-5'
          }
        >
          <span className="hidden sm:inline">실행</span>
          <ArrowUp size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
