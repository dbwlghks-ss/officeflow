import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  applyMeal,
  cancelMeal,
  getMyApplication,
  getTodayLunchService,
  type MealApplication,
  type MealService,
} from '../services/mealService'

export default function MealPage() {
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [service, setService] = useState<MealService | null>(null)
  const [application, setApplication] = useState<MealApplication | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const isApplied = application?.status === 'applied'

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('로그인이 필요합니다.')
        return
      }
      setUserId(user.id)

      const lunch = await getTodayLunchService()
      setService(lunch)

      if (lunch) {
        const app = await getMyApplication(lunch.id, user.id)
        setApplication(app)
      } else {
        setApplication(null)
      }
    } catch {
      setError('식수 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleApply() {
    if (!service || !userId) return
    setActionLoading(true)
    setMessage(null)
    setError(null)
    try {
      await applyMeal(service.id, userId)
      const app = await getMyApplication(service.id, userId)
      setApplication(app)
      setMessage('신청 완료')
    } catch {
      setError('신청에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel() {
    if (!service || !userId) return
    setActionLoading(true)
    setMessage(null)
    setError(null)
    try {
      await cancelMeal(service.id, userId)
      const app = await getMyApplication(service.id, userId)
      setApplication(app)
      setMessage('신청 취소')
    } catch {
      setError('취소에 실패했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#002c5f]">
            <span className="text-sm font-bold text-white">OF</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#002c5f]">OfficeFlow</span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-lg border border-slate-200 bg-white p-8">
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-[#002c5f]">
            오늘의 식수 신청
          </h1>
          <p className="mb-6 text-sm text-slate-500">{today}</p>

          {loading ? (
            <p className="text-sm text-slate-500">불러오는 중...</p>
          ) : !service ? (
            <p className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
              오늘 등록된 식수가 없습니다.
            </p>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between rounded-md bg-[#002c5f]/5 px-4 py-3">
                <span className="text-sm font-medium text-slate-600">현재 신청 상태</span>
                <span
                  className={
                    isApplied
                      ? 'text-sm font-semibold text-[#002c5f]'
                      : 'text-sm font-semibold text-slate-400'
                  }
                >
                  {isApplied ? '신청됨' : '미신청'}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={actionLoading || isApplied}
                  className="flex-1 rounded-md bg-[#002c5f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00234c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  신청
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={actionLoading || !isApplied}
                  className="flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  취소
                </button>
              </div>

              {message && (
                <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {message}
                </p>
              )}
            </>
          )}

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </main>
    </div>
  )
}
