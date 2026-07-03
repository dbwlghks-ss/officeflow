import { useCallback, useEffect, useState } from 'react'
import {
  getSurveyResults,
  type QuestionResult,
  type Survey,
} from '../../services/surveyService'

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
    <section className="max-w-3xl rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-1 text-sm font-medium text-[#002c5f] transition-colors hover:underline"
        >
          &larr; 설문 목록
        </button>
        <h2 className="truncate text-base font-semibold text-slate-800">
          설문 결과 &middot; {survey.title}
        </h2>
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="px-6 py-6 text-sm text-slate-500">불러오는 중...</p>
      ) : results.length === 0 ? (
        <p className="px-6 py-6 text-sm text-slate-600">등록된 문항이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {results.map((result, index) => (
            <li key={result.question.id} className="px-6 py-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  {index + 1}
                </span>
                <span className="rounded bg-[#002c5f]/10 px-2 py-0.5 text-xs font-semibold text-[#002c5f]">
                  {TYPE_LABELS[result.question.question_type]}
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {result.question.question_text}
                </span>
              </div>

              {/* 객관식 */}
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
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#002c5f]"
                          style={{ width: `${option.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 평점 */}
              {result.rating && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-slate-700">
                    평균{' '}
                    <span className="font-semibold text-[#002c5f]">
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
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#002c5f]"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 주관식 */}
              {result.text && (
                <div>
                  <p className="mb-2 text-xs text-slate-400">총 {result.text.length}개 응답</p>
                  {result.text.length === 0 ? (
                    <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">
                      응답이 없습니다.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {result.text.map((answer, i) => (
                        <li
                          key={i}
                          className="whitespace-pre-wrap rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700"
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
    </section>
  )
}
