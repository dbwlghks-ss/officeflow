import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, ChevronRight, ClipboardList } from 'lucide-react'
import Header from '../components/layout/Header'
import { supabase } from '../lib/supabase'
import { Badge, Button, Card, inputClass } from '../components/ui/primitives'
import {
  getMyResponseAnswers,
  getOpenSurveys,
  getQuestions,
  hasResponded,
  submitSurveyResponse,
  updateSurveyResponse,
  type ExistingAnswer,
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

function extractMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message
  }
  return fallback
}

type AnswerState = {
  optionId?: number
  text?: string
  rating?: number
}

function buildAnswersState(
  questions: SurveyQuestion[],
  existing: ExistingAnswer[],
): Record<number, AnswerState> {
  const byQuestion = new Map(existing.map((answer) => [answer.questionId, answer]))
  const state: Record<number, AnswerState> = {}

  for (const question of questions) {
    const answer = byQuestion.get(question.id)
    if (!answer) continue

    if (question.question_type === 'single') {
      if (answer.optionId != null) state[question.id] = { optionId: answer.optionId }
    } else if (question.question_type === 'rating') {
      const score = Number(answer.answerText)
      if (!Number.isNaN(score)) state[question.id] = { rating: score }
    } else {
      state[question.id] = { text: answer.answerText ?? '' }
    }
  }

  return state
}

function SurveyDetail({ survey, onBack }: { survey: Survey; onBack: () => void }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [preparingEdit, setPreparingEdit] = useState(false)
  const [updatedMessage, setUpdatedMessage] = useState<string | null>(null)

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
        setUserId(user.id)
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

  async function startEditing() {
    if (!userId) return
    setPreparingEdit(true)
    setError(null)
    try {
      const existing = await getMyResponseAnswers(survey.id, userId)
      setAnswers(existing ? buildAnswersState(questions, existing) : {})
      setUpdatedMessage(null)
      setEditing(true)
    } catch (err) {
      setError(extractMessage(err, '기존 응답을 불러오지 못했습니다.'))
    } finally {
      setPreparingEdit(false)
    }
  }

  function cancelEditing() {
    setEditing(false)
    setError(null)
  }

  async function handleSave() {
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
      if (editing) {
        await updateSurveyResponse({ surveyId: survey.id, answers: payload })
        setEditing(false)
        setSubmitted(true)
        setUpdatedMessage('응답이 수정되었습니다.')
      } else {
        await submitSurveyResponse({ surveyId: survey.id, answers: payload })
        setSubmitted(true)
        setUpdatedMessage(null)
      }
    } catch (err) {
      setError(extractMessage(err, editing ? '수정에 실패했습니다.' : '제출에 실패했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
      >
        <ArrowLeft size={16} />
        목록으로
      </button>

      <h2 className="mb-2 text-2xl font-bold text-slate-900">{survey.title}</h2>
      <p className="mb-6 text-sm text-slate-400">{formatDate(survey.created_at)}</p>
      {survey.description && (
        <p className="mb-8 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-600">
          {survey.description}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">불러오는 중...</p>
      ) : submitted && !editing ? (
        <div className="flex flex-col items-center rounded-card bg-green-50 px-4 py-10 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
            <CheckCircle2 size={28} />
          </div>
          <p className="text-base font-semibold text-slate-900">
            {updatedMessage ?? '이미 제출한 설문입니다.'}
          </p>
          <p className="mt-1 text-sm text-slate-500">응답해 주셔서 감사합니다.</p>
          <Button
            type="button"
            variant="secondary"
            onClick={startEditing}
            disabled={preparingEdit}
            className="mt-5"
          >
            {preparingEdit ? '불러오는 중...' : '응답 수정'}
          </Button>
          {error && (
            <p className="mt-3 rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
          )}
        </div>
      ) : questions.length === 0 ? (
        <p className="rounded-btn bg-slate-50 px-4 py-3 text-sm text-slate-500">
          등록된 문항이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-7">
          {editing && (
            <p className="rounded-btn bg-brand-light px-4 py-3 text-sm font-medium text-brand">
              응답 수정 중입니다. 수정 후 &lsquo;수정 완료&rsquo;를 눌러 저장하세요.
            </p>
          )}
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-card border border-line bg-canvas/60 p-6">
              <p className="mb-4 text-[15px] font-semibold text-slate-800">
                <span className="mr-1.5 text-brand">Q{index + 1}.</span>
                {question.question_text}
                {question.is_required && <span className="ml-1 text-danger">*</span>}
              </p>

              {question.question_type === 'single' && (
                <div className="flex flex-col gap-2">
                  {question.survey_options.map((option) => {
                    const active = answers[question.id]?.optionId === option.id
                    return (
                      <label
                        key={option.id}
                        className={
                          'flex cursor-pointer items-center gap-3 rounded-btn border px-4 py-3 text-sm transition-colors ' +
                          (active
                            ? 'border-brand bg-brand-light font-medium text-brand'
                            : 'border-line bg-surface text-slate-700 hover:border-slate-300')
                        }
                      >
                        <input
                          type="radio"
                          name={`q-${question.id}`}
                          checked={active}
                          onChange={() => setOption(question.id, option.id)}
                          disabled={submitting}
                          className="accent-brand"
                        />
                        {option.option_text}
                      </label>
                    )
                  })}
                </div>
              )}

              {question.question_type === 'text' && (
                <textarea
                  value={answers[question.id]?.text ?? ''}
                  onChange={(e) => setText(question.id, e.target.value)}
                  disabled={submitting}
                  rows={4}
                  className={inputClass + ' resize-y'}
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
                            ? 'h-11 w-11 rounded-btn bg-brand text-sm font-semibold text-white transition-colors'
                            : 'h-11 w-11 rounded-btn border border-line bg-surface text-sm font-medium text-slate-600 transition-colors hover:border-slate-300'
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
            <p className="rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="button" onClick={handleSave} disabled={submitting} size="lg">
              {submitting
                ? editing
                  ? '저장 중...'
                  : '제출 중...'
                : editing
                  ? '수정 완료'
                  : '제출'}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="secondary"
                onClick={cancelEditing}
                disabled={submitting}
                size="lg"
              >
                취소
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
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
    <div className="min-h-screen bg-canvas text-slate-800">
      <Header />

      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <ClipboardList size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">설문조사</h1>
            <p className="text-sm text-slate-400">진행 중인 설문에 참여하세요.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-card bg-slate-100/70" />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-btn bg-red-50 px-4 py-3 text-sm text-danger">{error}</p>
        ) : selected ? (
          <SurveyDetail survey={selected} onBack={() => setSelected(null)} />
        ) : surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-card border border-line bg-surface px-6 py-16 text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <ClipboardList size={22} />
            </div>
            <p className="text-sm font-medium text-slate-600">진행 중인 설문이 없습니다.</p>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-line">
              {surveys.map((survey) => (
                <li key={survey.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(survey)}
                    className="group flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50/60"
                  >
                    <span className="flex items-center gap-3">
                      <Badge tone="success">진행중</Badge>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-800">
                          {survey.title}
                        </span>
                        {survey.description && (
                          <span className="mt-0.5 block truncate text-sm text-slate-500">
                            {survey.description}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-slate-400">{formatDate(survey.created_at)}</span>
                      <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>
    </div>
  )
}
