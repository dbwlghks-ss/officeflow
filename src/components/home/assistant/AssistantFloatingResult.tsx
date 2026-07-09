import { X } from 'lucide-react'
import type { RefObject } from 'react'
import type { AssistantResponse } from '../../../types/assistant'
import AssistantResponseCard from './AssistantResponseCard'

type AssistantFloatingResultProps = {
  response: AssistantResponse
  checkedAt: Date | null
  resultRef?: RefObject<HTMLDivElement | null>
  onClose: () => void
  onAction?: (path: string) => void
  onSuggestedQuery?: (query: string) => void
}

export default function AssistantFloatingResult({
  response,
  checkedAt,
  resultRef,
  onClose,
  onAction,
  onSuggestedQuery,
}: AssistantFloatingResultProps) {
  return (
    <div
      ref={resultRef}
      className={
        'assistant-result-popover absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden ' +
        'rounded-3xl border border-slate-200/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]'
      }
      role="dialog"
      aria-label="검색 결과"
      aria-modal="false"
    >
      <div className="flex justify-end px-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="응답 닫기"
          className="grid h-7 w-7 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={15} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div className="scrollbar-slim max-h-[min(420px,60vh)] overflow-y-auto px-4 pb-4 pt-0">
        <AssistantResponseCard
          response={response}
          checkedAt={checkedAt}
          onAction={onAction}
          onSuggestedQuery={onSuggestedQuery}
          floating
        />
      </div>
    </div>
  )
}
