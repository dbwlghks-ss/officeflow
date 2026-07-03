import { useCallback, useEffect, useState } from 'react'
import {
  createSurvey,
  deleteSurvey,
  getSurveys,
  type Survey,
  type SurveyStatus,
} from '../../services/surveyService'
import SurveyQuestionsPanel from './SurveyQuestionsPanel'
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

  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'open'>('draft')
  const [saving, setSaving] = useState(false)
  const [managing, setManaging] = useState<Survey | null>(null)
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

  function openNew() {
    setCreating(true)
    setTitle('')
    setDescription('')
    setStatus('draft')
    setError(null)
  }

  function closeForm() {
    setCreating(false)
    setTitle('')
    setDescription('')
    setStatus('draft')
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('제목을 입력하세요.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createSurvey({ title: title.trim(), description: description.trim(), status })
      closeForm()
      await load()
    } catch {
      setError('설문 생성에 실패했습니다.')
    } finally {
      setSaving(false)
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

  if (managing) {
    return <SurveyQuestionsPanel survey={managing} onBack={() => setManaging(null)} />
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
        {!creating && (
          <button
            type="button"
            onClick={openNew}
            className="rounded-md bg-[#002c5f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00234c]"
          >
            새 설문
          </button>
        )}
      </div>

      {error && (
        <p className="mx-6 mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {creating ? (
        <div className="px-6 py-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">새 설문 생성</h3>
          <div className="mb-4">
            <label htmlFor="survey-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              제목
            </label>
            <input
              id="survey-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50"
              placeholder="설문 제목"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="survey-description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              설명
            </label>
            <textarea
              id="survey-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={4}
              className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50"
              placeholder="설문 설명 (선택)"
            />
          </div>
          <div className="mb-5">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">상태</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="survey-status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  disabled={saving}
                  className="accent-[#002c5f]"
                />
                임시저장
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="survey-status"
                  value="open"
                  checked={status === 'open'}
                  onChange={() => setStatus('open')}
                  disabled={saving}
                  className="accent-[#002c5f]"
                />
                공개
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-[#002c5f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00234c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? '생성 중...' : '생성'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      ) : loading ? (
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
                <button
                  type="button"
                  onClick={() => setManaging(survey)}
                  disabled={busyId === survey.id}
                  className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  문항 관리
                </button>
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
