import { useCallback, useEffect, useState } from 'react'
import {
  deleteSurvey,
  getSurveys,
  publishSurvey,
  type Survey,
  type SurveyStatus,
} from '../../services/surveyService'
import SurveyBuilderPanel from './SurveyBuilderPanel'
import SurveyResultsPanel from './SurveyResultsPanel'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function StatusBadge({ status }: { status: SurveyStatus }) {
  if (status === 'open') {
    return (
      <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        공개
      </span>
    )
  }
  if (status === 'closed') {
    return (
      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
        마감
      </span>
    )
  }
  return (
    <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
      임시저장
    </span>
  )
}

export default function SurveyManagementPanel() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [building, setBuilding] = useState(false)
  const [viewingResults, setViewingResults] = useState<Survey | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSurveys(await getSurveys())
    } catch {
      setError('설문 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handlePublish(id: number) {
    setBusyId(id)
    setError(null)
    try {
      await publishSurvey(id)
      await load()
    } catch {
      setError('게시에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: number) {
    setBusyId(id)
    setError(null)
    try {
      await deleteSurvey(id)
      await load()
    } catch {
      setError('삭제에 실패했습니다.')
    } finally {
      setBusyId(null)
    }
  }

  if (building) {
    return (
      <SurveyBuilderPanel
        onCancel={() => setBuilding(false)}
        onSaved={() => {
          setBuilding(false)
          load()
        }}
      />
    )
  }

  if (viewingResults) {
    return <SurveyResultsPanel survey={viewingResults} onBack={() => setViewingResults(null)} />
  }

  return (
    <section className="max-w-3xl rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">설문 관리</h2>
          <p className="mt-0.5 text-sm text-slate-500">사내 설문을 생성하고 관리합니다.</p>
        </div>
        <button
          type="button"
          onClick={() => setBuilding(true)}
          className="rounded-md bg-[#002c5f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00234c]"
        >
          새 설문
        </button>
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="px-6 py-6 text-sm text-slate-500">불러오는 중...</p>
      ) : surveys.length === 0 ? (
        <p className="px-6 py-6 text-sm text-slate-600">등록된 설문이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {surveys.map((survey) => (
            <li key={survey.id} className="px-6 py-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={survey.status} />
                <span className="truncate text-sm font-medium text-slate-800">{survey.title}</span>
              </div>
              {survey.description && (
                <p className="mb-1 line-clamp-2 text-sm text-slate-500">{survey.description}</p>
              )}
              <p className="text-xs text-slate-400">{formatDate(survey.created_at)}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {survey.status === 'draft' && (
                  <button
                    type="button"
                    onClick={() => handlePublish(survey.id)}
                    disabled={busyId === survey.id}
                    className="rounded border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {busyId === survey.id ? '게시 중...' : '게시'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewingResults(survey)}
                  disabled={busyId === survey.id}
                  className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  결과보기
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(survey.id)}
                  disabled={busyId === survey.id}
                  className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
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
