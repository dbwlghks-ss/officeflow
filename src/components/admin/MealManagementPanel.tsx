import { useState } from 'react'
import { createTodayLunchService } from '../../services/mealService'

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
    <section className="max-w-xl rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-800">오늘 점심 식수 등록</h2>
        <p className="mt-0.5 text-sm text-slate-500">오늘 날짜의 점심 식수 서비스를 등록합니다.</p>
      </div>

      <div className="px-6 py-6">
        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          className="rounded-md bg-[#002c5f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00234c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '등록 중...' : '오늘 점심 등록'}
        </button>

        {message && (
          <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </section>
  )
}
