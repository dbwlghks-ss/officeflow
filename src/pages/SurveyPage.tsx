import { useEffect, useState } from 'react'
import Header from '../components/layout/Header'
import { supabase } from '../lib/supabase'
import {
  getOpenSurveys,
  getQuestions,
  hasResponded,
  submitSurveyResponse,
  type SubmitAnswer,
  type Survey,
  type SurveyQuestion,
} from '../services/surveyService'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

type AnswerState = {
  optionId?: number
  text?: string
  rating?: number
}

function SurveyDetail({ survey, onBack }: { survey: Survey; onBack: () => void }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          if (active) setError('로그인이 필요합니다.')
          return
        }

        const [alreadyResponded, questionList] = await Promise.all([
          hasResponded(survey.id, user.id),
          getQuestions(survey.id),
        ])

        if (!active) return
        setSubmitted(alreadyResponded)
        setQuestions(questionList)
      } catch {
        if (active) setError('설문을 불러오지 못했습니다.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [survey.id])

  function setOption(questionId: number, optionId: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: { optionId } }))
  }

  function setText(questionId: number, text: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: { text } }))
  }

  function setRating(questionId: number, rating: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: { rating } }))
  }

  async function handleSubmit() {
    const payload: SubmitAnswer[] = []

    for (const question of questions) {
      const answer = answers[question.id]

      if (question.question_type === 'single') {
        if (answer?.optionId != null) {
          payload.push({ questionId: question.id, optionId: answer.optionId })
        } else if (question.is_required) {
          setError('필수 문항에 모두 응답해 주세요.')
          return
        }
      } else if (question.question_type === 'text') {
        const text = answer?.text?.trim()
        if (text) {
          payload.push({ questionId: question.id, answerText: text })
        } else if (question.is_required) {
          setError('필수 문항에 모두 응답해 주세요.')
          return
        }
      } else if (question.question_type === 'rating') {
        if (answer?.rating != null) {
          payload.push({ questionId: question.id, answerText: String(answer.rating) })
        } else if (question.is_required) {
          setError('필수 문항에 모두 응답해 주세요.')
          return
        }
      }
    }

    setSubmitting(true)
    setError(null)
    try {
      await submitSurveyResponse({ surveyId: survey.id, answers: payload })
      setSubmitted(true)
    } catch {
      setError('제출에 실패했습니다. 이미 응답했을 수 있습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-sm font-medium text-[#002c5f] transition-colors hover:underline"
      >
        &larr; 목록으로
      </button>

      <h2 className="mb-2 text-xl font-semibold text-slate-800">{survey.title}</h2>
      <p className="mb-6 text-sm text-slate-400">{formatDate(survey.created_at)}</p>
      {survey.description && (
        <p className="mb-8 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {survey.description}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">불러오는 중...</p>
      ) : submitted ? (
        <div className="rounded-md bg-emerald-50 px-4 py-6 text-center">
          <p className="text-sm font-semibold text-emerald-700">이미 제출한 설문입니다.</p>
          <p className="mt-1 text-sm text-emerald-600">응답해 주셔서 감사합니다.</p>
        </div>
      ) : questions.length === 0 ? (
        <p className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
          등록된 문항이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {questions.map((question, index) => (
            <div key={question.id}>
              <p className="mb-3 text-sm font-medium text-slate-800">
                <span className="mr-1 text-slate-400">{index + 1}.</span>
                {question.question_text}
                {question.is_required && <span className="ml-1 text-red-500">*</span>}
              </p>

              {question.question_type === 'single' && (
                <div className="flex flex-col gap-2">
                  {question.survey_options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="radio"
                        name={`q-${question.id}`}
                        checked={answers[question.id]?.optionId === option.id}
                        onChange={() => setOption(question.id, option.id)}
                        disabled={submitting}
                        className="accent-[#002c5f]"
                      />
                      {option.option_text}
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === 'text' && (
                <textarea
                  value={answers[question.id]?.text ?? ''}
                  onChange={(e) => setText(question.id, e.target.value)}
                  disabled={submitting}
                  rows={4}
                  className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50"
                  placeholder="답변을 입력하세요"
                />
              )}

              {question.question_type === 'rating' && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const active = answers[question.id]?.rating === score
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setRating(question.id, score)}
                        disabled={submitting}
                        className={
                          active
                            ? 'h-10 w-10 rounded-md bg-[#002c5f] text-sm font-medium text-white transition-colors'
                            : 'h-10 w-10 rounded-md border border-slate-300 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50'
                        }
                      >
                        {score}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="self-start rounded-md bg-[#002c5f] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00234c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? '제출 중...' : '제출'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function SurveyPage() {
  const [loading, setLoading] = useState(true)
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [selected, setSelected] = useState<Survey | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getOpenSurveys()
      .then((data) => {
        if (active) setSurveys(data)
      })
      .catch(() => {
        if (active) setError('설문을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-800">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#002c5f]">설문조사</h1>

        {loading ? (
          <p className="text-sm text-slate-500">불러오는 중...</p>
        ) : error ? (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : selected ? (
          <SurveyDetail survey={selected} onBack={() => setSelected(null)} />
        ) : surveys.length === 0 ? (
          <p className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            진행 중인 설문이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {surveys.map((survey) => (
              <li key={survey.id}>
                <button
                  type="button"
                  onClick={() => setSelected(survey)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {survey.title}
                    </span>
                    {survey.description && (
                      <span className="mt-0.5 block truncate text-sm text-slate-500">
                        {survey.description}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDate(survey.created_at)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
