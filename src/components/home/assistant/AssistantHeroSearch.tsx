import { ArrowUp, Loader2, Sparkles } from 'lucide-react'

type AssistantHeroSearchProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  loading?: boolean
}

export default function AssistantHeroSearch({
  value,
  onChange,
  onSubmit,
  loading = false,
}: AssistantHeroSearchProps) {
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
          'flex h-[52px] w-full items-center gap-2.5 rounded-full border border-slate-200/70 bg-white px-3.5 ' +
          'shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-shadow focus-within:border-brand/25 ' +
          'focus-within:ring-4 focus-within:ring-blue-500/10 lg:h-[56px] lg:gap-3 lg:px-4'
        }
      >
        <Sparkles
          size={18}
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
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim() || loading}
          aria-label="질문 실행"
          className={
            'grid h-9 w-9 shrink-0 place-items-center rounded-full text-white ' +
            'bg-gradient-to-r from-[#1648B8] to-[#2F63E6] transition-opacity hover:opacity-95 ' +
            'disabled:cursor-not-allowed disabled:opacity-40 lg:h-10 lg:w-10'
          }
        >
          {loading ? (
            <Loader2 size={16} strokeWidth={2} className="animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUp size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
    </form>
  )
}
