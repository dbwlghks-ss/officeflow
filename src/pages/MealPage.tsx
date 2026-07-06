import { useEffect, useState } from 'react'
import { CheckCircle2, UtensilsCrossed, XCircle } from 'lucide-react'
import Header from '../components/layout/Header'
import { supabase } from '../lib/supabase'
import {
  applyMeal,
  cancelMeal,
  getMyApplication,
  getTodayLunchService,
  type MealApplication,
  type MealService,
} from '../services/mealService'
import { Badge, Button, Card } from '../components/ui/primitives'

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
    <div className="min-h-screen bg-canvas text-slate-800">
      <Header />

      <main className="mx-auto w-full max-w-lg px-6 py-12 lg:py-16">
        <div className="mb-8">
          <p className="mb-1 text-sm font-medium text-slate-400">{today}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">오늘의 식수 신청</h1>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-4 border-b border-line bg-gradient-to-br from-brand to-brand-hover px-8 py-7 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <UtensilsCrossed size={26} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm text-white/70">중식 신청</p>
              <p className="text-lg font-semibold">간편하게 신청하세요</p>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="space-y-3">
                <div className="h-14 animate-pulse rounded-btn bg-slate-100/70" />
                <div className="h-11 animate-pulse rounded-btn bg-slate-100/70" />
              </div>
            ) : !service ? (
              <p className="rounded-btn bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">
                오늘 등록된 식수가 없습니다.
              </p>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between rounded-btn border border-line bg-canvas px-4 py-4">
                  <span className="text-sm font-medium text-slate-500">현재 신청 상태</span>
                  {isApplied ? (
                    <Badge tone="success">
                      <CheckCircle2 size={13} />
                      신청됨
                    </Badge>
                  ) : (
                    <Badge tone="neutral">미신청</Badge>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleApply}
                    disabled={actionLoading || isApplied}
                    className="flex-1"
                  >
                    <CheckCircle2 size={16} />
                    신청
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={actionLoading || !isApplied}
                    className="flex-1"
                  >
                    <XCircle size={16} />
                    취소
                  </Button>
                </div>

                {message && (
                  <p className="mt-4 rounded-btn bg-green-50 px-3 py-2 text-sm font-medium text-success">
                    {message}
                  </p>
                )}
              </>
            )}

            {error && (
              <p className="mt-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
