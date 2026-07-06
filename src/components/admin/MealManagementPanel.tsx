import { useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'
import { createTodayLunchService } from '../../services/mealService'
import { Button, Card } from '../ui/primitives'

export default function MealManagementPanel() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRegister() {
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const result = await createTodayLunchService()
      setMessage(result === 'exists' ? '이미 등록되어 있습니다.' : '오늘 점심 등록 완료')
    } catch {
      setError('등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-xl overflow-hidden">
      <div className="flex items-center gap-4 border-b border-line px-6 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <UtensilsCrossed size={22} strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">오늘 점심 식수 등록</h2>
          <p className="mt-0.5 text-sm text-slate-500">오늘 날짜의 점심 식수 서비스를 등록합니다.</p>
        </div>
      </div>

      <div className="px-6 py-6">
        <Button type="button" onClick={handleRegister} disabled={loading}>
          {loading ? '등록 중...' : '오늘 점심 등록'}
        </Button>

        {message && (
          <p className="mt-4 rounded-btn bg-green-50 px-3 py-2 text-sm font-medium text-success">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
        )}
      </div>
    </Card>
  )
}
