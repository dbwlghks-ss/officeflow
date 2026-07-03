import { useCallback, useEffect, useState } from 'react'
import {
  createQuestion,
  deleteQuestion,
  getQuestions,
  type QuestionType,
  type Survey,
  type SurveyQuestion,
} from '../../services/surveyService'

const TYPE_LABELS: Record<QuestionType, string> = {
  single: '객관식',
  text: '주관식',
  rating: '평점',
}

export default function SurveyQuestionsPanel({
  survey,
  onBack,
}: {
  survey: Survey
  onBack: () => void
}) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const [adding, setAdding] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<QuestionType>('single')
  const [isRequired, setIsRequired] = useState(true)
  const [options, setOptions] = useState<string[]>(['', ''])
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setQuestions(await getQuestions(survey.id))
    } catch {
      setError('문항을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [survey.id])

  useEffect(() => {
    load()
  }, [load])

  function openAdd() {
    setAdding(true)
    setQuestionText('')
    setQuestionType('single')
    setIsRequired(true)
    setOptions(['', ''])
    setError(null)
  }

  function closeAdd() {
    setAdding(false)
    setQuestionText('')
    setOptions(['', ''])
  }

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)))
  }

  function addOptionField() {
    setOptions((prev) => [...prev, ''])
  }

  function removeOptionField(index: number) {
    setOptions((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  async function handleSave() {
    if (!questionText.trim()) {
      setError('문항 내용을 입력하세요.')
      return
    }

    let cleanOptions: string[] = []
    if (questionType === 'single') {
      cleanOptions = options.map((o) => o.trim()).filter((o) => o.length > 0)
      if (cleanOptions.length < 2) {
        setError('객관식 문항은 보기를 2개 이상 입력하세요.')
        return
      }
    }

    const nextPosition =
      questions.length > 0 ? Math.max(...questions.map((q) => q.position)) + 1 : 0

    setSaving(true)
    setError(null)
    try {
      await createQuestion({
        surveyId: survey.id,
        questionText: questionText.trim(),
        questionType,
        isRequired,
        position: nextPosition,
        options: cleanOptions,
      })
      closeAdd()
      await load()
    } catch {
      setError('문항 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setBusyId(id)
    setError(null)
    try {
      await deleteQuestion(id)
      await load()
    } catch {
      setError('삭제에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="max-w-3xl rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="mb-1 text-sm font-medium text-[#002c5f] transition-colors hover:underline"
          >
            &larr; 설문 목록
          </button>
          <h2 className="truncate text-base font-semibold text-slate-800">
            문항 관리 &middot; {survey.title}
          </h2>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={openAdd}
            className="shrink-0 rounded-md bg-[#002c5f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00234c]"
          >
            문항 추가
          </button>
        )}
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {adding && (
        <div className="border-b border-slate-200 px-6 py-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">새 문항 추가</h3>

          <div className="mb-4">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">문항 유형</span>
            <div className="flex flex-wrap gap-4">
              {(['single', 'text', 'rating'] as QuestionType[]).map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="question-type"
                    value={type}
                    checked={questionType === type}
                    onChange={() => setQuestionType(type)}
                    disabled={saving}
                    className="accent-[#002c5f]"
                  />
                  {TYPE_LABELS[type]}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="question-text"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              문항 내용
            </label>
            <input
              id="question-text"
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              disabled={saving}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50"
              placeholder="질문을 입력하세요"
            />
          </div>

          {questionType === 'single' && (
            <div className="mb-4">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">보기</span>
              <div className="flex flex-col gap-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      disabled={saving}
                      className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50"
                      placeholder={`보기 ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOptionField(index)}
                      disabled={saving || options.length <= 1}
                      className="rounded-md border border-slate-300 px-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOptionField}
                disabled={saving}
                className="mt-2 text-sm font-medium text-[#002c5f] transition-colors hover:underline disabled:opacity-50"
              >
                + 보기 추가
              </button>
            </div>
          )}

          <label className="mb-5 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              disabled={saving}
              className="accent-[#002c5f]"
            />
            필수 응답
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-[#002c5f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00234c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={closeAdd}
              disabled={saving}
              className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="px-6 py-6 text-sm text-slate-500">불러오는 중...</p>
      ) : questions.length === 0 ? (
        <p className="px-6 py-6 text-sm text-slate-600">등록된 문항이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {questions.map((question, index) => (
            <li key={question.id} className="px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                      {index + 1}
                    </span>
                    <span className="rounded bg-[#002c5f]/10 px-2 py-0.5 text-xs font-semibold text-[#002c5f]">
                      {TYPE_LABELS[question.question_type]}
                    </span>
                    {question.is_required && (
                      <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                        필수
                      </span>
                    )}
                    <span className="truncate text-sm font-medium text-slate-800">
                      {question.question_text}
                    </span>
                  </div>
                  {question.question_type === 'single' && question.survey_options.length > 0 && (
                    <ul className="mt-1 ml-1 list-inside list-disc text-sm text-slate-500">
                      {question.survey_options.map((option) => (
                        <li key={option.id}>{option.option_text}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(question.id)}
                  disabled={busyId === question.id}
                  className="shrink-0 rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
