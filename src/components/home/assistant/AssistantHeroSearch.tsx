import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, Sparkles } from 'lucide-react'

type AssistantHeroSearchProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  loading?: boolean
  loadingLabel?: string
}

const MIN_HEIGHT_PX = 24
const MAX_ROWS = 6

export default function AssistantHeroSearch({
  value,
  onChange,
  onSubmit,
  loading = false,
  loadingLabel = '질문 실행',
}: AssistantHeroSearchProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isMultiline, setIsMultiline] = useState(false)

  useLayoutEffect(() => {
    const element = textareaRef.current
    if (!element) return

    element.style.height = 'auto'
    const lineHeight = 22
    const maxHeight = lineHeight * MAX_ROWS
    const nextHeight = Math.max(MIN_HEIGHT_PX, Math.min(element.scrollHeight, maxHeight))
    element.style.height = `${nextHeight}px`
    setIsMultiline(nextHeight > lineHeight + 4 || value.includes('\n'))
  }, [value])

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
          'flex w-full gap-2.5 border border-slate-200/70 bg-white px-3.5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all ' +
          'focus-within:border-brand/25 focus-within:ring-4 focus-within:ring-blue-500/10 lg:gap-3 lg:px-4 ' +
          (isMultiline
            ? 'items-end rounded-[22px] py-3 lg:rounded-[24px]'
            : 'h-[52px] items-center rounded-full lg:h-[56px]')
        }
      >
        <Sparkles
          size={18}
          strokeWidth={1.75}
          className={'shrink-0 text-brand/70 ' + (isMultiline ? 'mb-1.5' : '')}
          aria-hidden="true"
        />
        <textarea
          ref={textareaRef}
          id="assistant-hero-search"
          value={value}
          rows={1}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSubmit()
            }
          }}
          placeholder="직원 정보, 오늘 식단, 회의록 정리, 업무 요약을 물어보세요"
          className={
            'min-w-0 flex-1 resize-none border-0 bg-transparent text-sm leading-[22px] text-slate-800 ' +
            'placeholder:text-slate-400 focus:outline-none'
          }
        />
        <button
          type="submit"
          disabled={!value.trim() || loading}
          aria-label={loadingLabel}
          className={
            'grid h-9 w-9 shrink-0 place-items-center rounded-full text-white ' +
            'bg-gradient-to-r from-[#1648B8] to-[#2F63E6] transition-opacity hover:opacity-95 ' +
            'disabled:cursor-not-allowed disabled:opacity-40 lg:h-10 lg:w-10 ' +
            (isMultiline ? 'mb-0.5' : '')
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
