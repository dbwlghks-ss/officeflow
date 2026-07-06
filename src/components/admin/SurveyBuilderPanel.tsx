import { useState } from 'react'
import {
  createSurveyWithQuestions,
  type NewSurveyQuestion,
} from '../../services/surveyService'
import QuestionEditor, {
  type BuilderQuestion,
  type BuilderQuestionType,
} from './QuestionEditor'

let questionCounter = 0
function nextQuestionId() {
  questionCounter += 1
  return `q-${Date.now()}-${questionCounter}`
}

function createEmptyQuestion(): BuilderQuestion {
  return { id: nextQuestionId(), text: '', type: 'single', options: ['', ''] }
}

export default function SurveyBuilderPanel({
  onCancel,
  onSaved,
}: {
  onCancel: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<BuilderQuestion[]>([createEmptyQuestion()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateQuestion(id: string, patch: Partial<BuilderQuestion>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, createEmptyQuestion()])
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  function moveQuestion(id: string, direction: -1 | 1) {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function changeText(id: string, text: string) {
    updateQuestion(id, { text })
  }

  function changeType(id: string, type: BuilderQuestionType) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q
        if (type === 'single' && q.options.length === 0) {
          return { ...q, type, options: ['', ''] }
        }
        return { ...q, type }
      }),
    )
  }

  function addOption(id: string) {
    updateQuestionOptions(id, (options) => [...options, ''])
  }

  function changeOption(id: string, optionIndex: number, value: string) {
    updateQuestionOptions(id, (options) =>
      options.map((opt, i) => (i === optionIndex ? value : opt)),
    )
  }

  function removeOption(id: string, optionIndex: number) {
    updateQuestionOptions(id, (options) =>
      options.length <= 1 ? options : options.filter((_, i) => i !== optionIndex),
    )
  }

  function moveOption(id: string, optionIndex: number, direction: -1 | 1) {
    updateQuestionOptions(id, (options) => {
      const target = optionIndex + direction
      if (target < 0 || target >= options.length) return options
      const next = [...options]
      ;[next[optionIndex], next[target]] = [next[target], next[optionIndex]]
      return next
    })
  }

  function updateQuestionOptions(id: string, updater: (options: string[]) => string[]) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, options: updater(q.options) } : q)),
    )
  }

  function buildPayload(): NewSurveyQuestion[] {
    const payload: NewSurveyQuestion[] = []
    for (const question of questions) {
      const text = question.text.trim()
      if (!text) continue
      const options =
        question.type === 'single'
          ? question.options.map((o) => o.trim()).filter((o) => o.length > 0)
          : []
      payload.push({
        questionText: text,
        questionType: question.type,
        isRequired: true,
        options,
      })
    }
    return payload
  }

  function validateForPublish(): string | null {
    if (questions.length === 0) return '문항을 최소 1개 이상 추가하세요.'
    for (const question of questions) {
      if (!question.text.trim()) return '모든 문항의 질문을 입력하세요.'
      if (question.type === 'single') {
        const options = question.options.map((o) => o.trim()).filter((o) => o.length > 0)
        if (options.length < 2) return '객관식 문항은 보기를 2개 이상 입력하세요.'
      }
    }
    return null
  }

  async function handleSave(status: 'draft' | 'open') {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('제목을 입력하세요.')
      return
    }

    if (status === 'open') {
      const validationError = validateForPublish()
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setSaving(true)
    setError(null)
    try {
      await createSurveyWithQuestions({
        title: trimmedTitle,
        description: description.trim(),
        status,
        questions: buildPayload(),
      })
      onSaved()
    } catch {
      setError(status === 'open' ? '게시에 실패했습니다.' : '임시저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="mb-4 text-sm font-medium text-[#002c5f] transition-colors hover:underline disabled:opacity-50"
      >
        &larr; 설문 목록
      </button>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mb-6 rounded-lg border-t-4 border-[#002c5f] bg-white p-6 shadow-sm">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
          className="w-full border-b border-slate-200 pb-2 text-xl font-semibold text-slate-800 outline-none transition-colors focus:border-[#002c5f] disabled:bg-slate-50"
          placeholder="설문 제목"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={saving}
          rows={2}
          className="mt-3 w-full resize-y border-b border-slate-200 pb-2 text-sm text-slate-700 outline-none transition-colors focus:border-[#002c5f] disabled:bg-slate-50"
          placeholder="설문 설명 (선택)"
        />
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            index={index}
            total={questions.length}
            disabled={saving}
            onChangeText={changeText}
            onChangeType={changeType}
            onMoveUp={(id) => moveQuestion(id, -1)}
            onMoveDown={(id) => moveQuestion(id, 1)}
            onRemove={removeQuestion}
            onAddOption={addOption}
            onChangeOption={changeOption}
            onRemoveOption={removeOption}
            onMoveOption={moveOption}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addQuestion}
        disabled={saving}
        className="mt-4 w-full rounded-lg border border-dashed border-slate-300 bg-white py-3 text-sm font-medium text-[#002c5f] transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        + 문항 추가
      </button>

      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? '저장 중...' : '임시저장'}
        </button>
        <button
          type="button"
          onClick={() => handleSave('open')}
          disabled={saving}
          className="rounded-md bg-[#002c5f] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00234c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? '저장 중...' : '게시'}
        </button>
      </div>
    </div>
  )
}
