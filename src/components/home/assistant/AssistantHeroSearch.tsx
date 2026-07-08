import { ArrowUp } from 'lucide-react'

type AssistantHeroSearchProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  fullWidth?: boolean
}

export default function AssistantHeroSearch({
  value,
  onChange,
  onSubmit,
  fullWidth = false,
}: AssistantHeroSearchProps) {
  return (
    <form
      className={
        'w-full ' + (fullWidth ? '' : 'mx-auto max-w-[85%] lg:max-w-[480px]')
      }
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
          'flex h-11 w-full items-center gap-2 rounded-input border border-line bg-surface px-3 ' +
          'motion-subtle focus-within:border-brand/30 focus-within:ring-2 focus-within:ring-brand/8'
        }
      >
        <input
          id="assistant-hero-search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="업무를 물어보거나 요청하세요"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label="질문 실행"
          className={
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white ' +
            'motion-subtle hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40'
          }
        >
          <ArrowUp size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
