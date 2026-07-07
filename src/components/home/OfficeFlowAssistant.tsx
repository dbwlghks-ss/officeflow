import { Search } from 'lucide-react'

const EXAMPLE_PROMPTS = [
  '오늘 설문 뭐 남았어?',
  '읽지 않은 공지 보여줘',
  '내 식수 신청 상태 알려줘',
]

export default function OfficeFlowAssistant() {
  return (
    <div className="flex h-full flex-col">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        OfficeFlow Assistant
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
        자연어로 업무를 처리하세요
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">
        궁금한 업무를 입력하면 필요한 정보를 찾아드립니다.
      </p>

      <div className="mt-5">
        <label htmlFor="assistant-input" className="sr-only">
          OfficeFlow Assistant 검색
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="assistant-input"
            type="text"
            readOnly
            placeholder="무엇을 도와드릴까요?"
            className="h-11 w-full rounded-btn border border-line bg-surface pl-10 pr-4 text-sm text-slate-700 shadow-soft placeholder:text-slate-400 focus:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/10"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-canvas"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
