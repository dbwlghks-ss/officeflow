import { ChevronDown, ChevronUp } from 'lucide-react'
import { inputClass } from '../ui/primitives'

export type BuilderQuestionType = 'single' | 'text'

export type BuilderQuestion = {
  id: string
  text: string
  type: BuilderQuestionType
  options: string[]
}

type QuestionEditorProps = {
  question: BuilderQuestion
  index: number
  total: number
  disabled: boolean
  onChangeText: (id: string, text: string) => void
  onChangeType: (id: string, type: BuilderQuestionType) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onRemove: (id: string) => void
  onAddOption: (id: string) => void
  onChangeOption: (id: string, optionIndex: number, value: string) => void
  onRemoveOption: (id: string, optionIndex: number) => void
  onMoveOption: (id: string, optionIndex: number, direction: -1 | 1) => void
}

const moveButtonClass =
  'flex h-8 w-8 items-center justify-center rounded-lg border border-line text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40'

export default function QuestionEditor({
  question,
  index,
  total,
  disabled,
  onChangeText,
  onChangeType,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddOption,
  onChangeOption,
  onRemoveOption,
  onMoveOption,
}: QuestionEditorProps) {
  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-brand">문항 {index + 1}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onMoveUp(question.id)}
            disabled={disabled || index === 0}
            aria-label="위로 이동"
            className={moveButtonClass}
          >
            <ChevronUp size={15} />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(question.id)}
            disabled={disabled || index === total - 1}
            aria-label="아래로 이동"
            className={moveButtonClass}
          >
            <ChevronDown size={15} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(question.id)}
            disabled={disabled}
            className="ml-1 rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">질문</label>
        <input
          type="text"
          value={question.text}
          onChange={(e) => onChangeText(question.id, e.target.value)}
          disabled={disabled}
          className={inputClass}
          placeholder="질문을 입력하세요"
        />
      </div>

      <div className="mb-4">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">타입</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name={`type-${question.id}`}
              checked={question.type === 'single'}
              onChange={() => onChangeType(question.id, 'single')}
              disabled={disabled}
              className="accent-brand"
            />
            객관식
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name={`type-${question.id}`}
              checked={question.type === 'text'}
              onChange={() => onChangeType(question.id, 'text')}
              disabled={disabled}
              className="accent-brand"
            />
            주관식
          </label>
        </div>
      </div>

      {question.type === 'single' && (
        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">보기</span>
          <div className="flex flex-col gap-2">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-center text-sm text-slate-400">
                  {optionIndex + 1}
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => onChangeOption(question.id, optionIndex, e.target.value)}
                  disabled={disabled}
                  className={inputClass + ' flex-1'}
                  placeholder={`보기 ${optionIndex + 1}`}
                />
                <button
                  type="button"
                  onClick={() => onMoveOption(question.id, optionIndex, -1)}
                  disabled={disabled || optionIndex === 0}
                  aria-label="보기 위로 이동"
                  className={moveButtonClass}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMoveOption(question.id, optionIndex, 1)}
                  disabled={disabled || optionIndex === question.options.length - 1}
                  aria-label="보기 아래로 이동"
                  className={moveButtonClass}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveOption(question.id, optionIndex)}
                  disabled={disabled || question.options.length <= 1}
                  className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onAddOption(question.id)}
            disabled={disabled}
            className="mt-2 text-sm font-medium text-[#004098] transition-colors hover:underline disabled:opacity-50"
          >
            + 보기 추가
          </button>
        </div>
      )}
    </div>
  )
}
