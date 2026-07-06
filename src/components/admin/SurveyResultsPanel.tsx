import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import {
  getSurveyResults,
  type QuestionResult,
  type Survey,
} from '../../services/surveyService'
import { Badge, Card } from '../ui/primitives'

const TYPE_LABELS: Record<string, string> = {
  single: '객관식',
  text: '주관식',
  rating: '평점',
}

export default function SurveyResultsPanel({
  survey,
  onBack,
}: {
  survey: Survey
  onBack: () => void
}) {
  const [results, setResults] = useState<QuestionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setResults(await getSurveyResults(survey.id))
    } catch {
      setError('결과를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [survey.id])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Card className="max-w-3xl overflow-hidden">
      <div className="border-b border-line px-6 py-5">
        <button
          type="button"
          onClick={onBack}
          className="mb-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
        >
          <ArrowLeft size={16} />
          설문 목록
        </button>
        <h2 className="truncate text-lg font-bold text-slate-900">설문 결과 · {survey.title}</h2>
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-btn bg-slate-100/70" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-slate-400">등록된 문항이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-line">
          {results.map((result, index) => (
            <li key={result.question.id} className="px-6 py-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                  {index + 1}
                </span>
                <Badge tone="brand">{TYPE_LABELS[result.question.question_type]}</Badge>
                <span className="text-sm font-semibold text-slate-800">
                  {result.question.question_text}
                </span>
              </div>

              {result.single && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-slate-400">총 {result.single.total}명 응답</p>
                  {result.single.options.map((option) => (
                    <div key={option.optionId}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-700">{option.optionText}</span>
                        <span className="text-slate-500">
                          {option.count}명 ({option.percent}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand transition-all"
                          style={{ width: `${option.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.rating && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-slate-700">
                    평균{' '}
                    <span className="font-semibold text-brand">
                      {result.rating.average.toFixed(1)}
                    </span>{' '}
                    <span className="text-xs text-slate-400">
                      / 5.0 (총 {result.rating.total}명 응답)
                    </span>
                  </p>
                  {result.rating.counts.map((item) => {
                    const percent =
                      result.rating!.total > 0
                        ? Math.round((item.count / result.rating!.total) * 100)
                        : 0
                    return (
                      <div key={item.score}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-slate-700">{item.score}점</span>
                          <span className="text-slate-500">{item.count}명</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-brand transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {result.text && (
                <div>
                  <p className="mb-2 text-xs text-slate-400">총 {result.text.length}개 응답</p>
                  {result.text.length === 0 ? (
                    <p className="rounded-btn bg-slate-50 px-3 py-2 text-sm text-slate-500">
                      응답이 없습니다.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {result.text.map((answer, i) => (
                        <li
                          key={i}
                          className="whitespace-pre-wrap rounded-btn bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700"
                        >
                          {answer}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
