import { useCallback, useEffect, useState } from 'react'
import { BarChart3, ClipboardList, Plus, Send, Trash2 } from 'lucide-react'
import {
  deleteSurvey,
  getSurveys,
  publishSurvey,
  type Survey,
  type SurveyStatus,
} from '../../services/surveyService'
import { Badge, Button, Card } from '../ui/primitives'
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
  if (status === 'open') return <Badge tone="success">공개</Badge>
  if (status === 'closed') return <Badge tone="neutral">마감</Badge>
  return <Badge tone="warning">임시저장</Badge>
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
    <Card className="max-w-4xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-6 py-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">설문 관리</h2>
          <p className="mt-0.5 text-sm text-slate-500">사내 설문을 생성하고 관리합니다.</p>
        </div>
        <Button type="button" size="sm" onClick={() => setBuilding(true)}>
          <Plus size={16} />
          새 설문
        </Button>
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3 p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-btn bg-slate-100/70" />
          ))}
        </div>
      ) : surveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <ClipboardList size={22} />
          </div>
          <p className="text-sm font-medium text-slate-600">등록된 설문이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {surveys.map((survey) => (
            <li key={survey.id} className="px-6 py-4 transition-colors hover:bg-slate-50/40">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <StatusBadge status={survey.status} />
                <span className="truncate text-sm font-semibold text-slate-800">{survey.title}</span>
              </div>
              {survey.description && (
                <p className="mb-1 line-clamp-2 text-sm text-slate-500">{survey.description}</p>
              )}
              <p className="text-xs text-slate-400">{formatDate(survey.created_at)}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {survey.status === 'draft' && (
                  <Button
                    type="button"
                    variant="success"
                    size="sm"
                    onClick={() => handlePublish(survey.id)}
                    disabled={busyId === survey.id}
                  >
                    <Send size={13} />
                    {busyId === survey.id ? '게시 중...' : '게시'}
                  </Button>
                )}
                <Button type="button" variant="secondary" size="sm" onClick={() => setViewingResults(survey)} disabled={busyId === survey.id}>
                  <BarChart3 size={13} />
                  결과보기
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(survey.id)} disabled={busyId === survey.id} className="text-danger hover:bg-red-50">
                  <Trash2 size={13} />
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
