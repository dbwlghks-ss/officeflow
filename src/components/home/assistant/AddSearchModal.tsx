import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { SEARCH_SCOPE_OPTIONS } from '../../../lib/assistantSearches'
import type { AssistantSearchScope } from '../../../types/assistant'

type AddSearchModalProps = {
  open: boolean
  onClose: () => void
  onSave: (input: { title: string; query: string; scope: AssistantSearchScope }) => void
}

export default function AddSearchModal({ open, onClose, onSave }: AddSearchModalProps) {
  const [title, setTitle] = useState('')
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<AssistantSearchScope>('all')
  const [showValidation, setShowValidation] = useState(false)

  const isValid = title.trim().length > 0 && query.trim().length > 0

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setTitle('')
      setQuery('')
      setScope('all')
      setShowValidation(false)
    }
  }, [open])

  if (!open) return null

  function handleSave() {
    if (!isValid) {
      setShowValidation(true)
      return
    }
    onSave({ title: title.trim(), query: query.trim(), scope })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="모달 닫기"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-search-title"
        className="relative w-full max-w-md rounded-modal border border-line bg-surface p-6 shadow-pop"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition-colors hover:bg-canvas hover:text-slate-600"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        <h2 id="add-search-title" className="text-lg font-semibold tracking-tight text-slate-900">
          검색어 저장
        </h2>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="search-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              검색어 이름
            </label>
            <input
              id="search-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 안전교육 공지"
              className="h-10 w-full rounded-btn border border-line bg-canvas px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/10"
            />
          </div>

          <div>
            <label htmlFor="search-query" className="mb-1.5 block text-sm font-medium text-slate-700">
              검색어
            </label>
            <input
              id="search-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 안전교육"
              className="h-10 w-full rounded-btn border border-line bg-canvas px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand/30 focus:outline-none focus:ring-4 focus:ring-brand/10"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">검색 범위</p>
            <div className="flex flex-wrap gap-2">
              {SEARCH_SCOPE_OPTIONS.map((option) => {
                const selected = scope === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setScope(option.value)}
                    className={
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-all ' +
                      (selected
                        ? 'border-brand/40 bg-brand-light text-brand ring-2 ring-brand/15'
                        : 'border-line bg-surface text-slate-600 hover:border-slate-300 hover:bg-canvas')
                    }
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          {showValidation && !isValid ? (
            <p className="text-xs text-danger">검색어 이름과 검색어를 입력해주세요.</p>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-btn border border-line bg-surface px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-canvas"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className={
              'rounded-btn px-4 py-2 text-sm font-medium transition-colors ' +
              (isValid
                ? 'bg-brand text-white hover:bg-brand-hover'
                : 'cursor-not-allowed bg-slate-200 text-slate-400')
            }
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
