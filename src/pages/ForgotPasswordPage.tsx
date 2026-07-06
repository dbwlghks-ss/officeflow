import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('이메일을 입력해주세요.')
      return
    }

    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(`재설정 메일 발송에 실패했습니다: ${resetError.message}`)
      setLoading(false)
      return
    }

    setSubmittedEmail(email.trim())
    setLoading(false)
  }

  if (submittedEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded bg-[#002c5f]">
              <span className="text-base font-bold text-white">OF</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#002c5f]">메일 발송 완료</h1>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="rounded-md bg-emerald-50 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-emerald-700">
                비밀번호 재설정 메일을 발송했습니다.
              </p>
              <p className="mt-2 text-sm text-emerald-600">
                메일함(스팸함 포함)을 확인하여 비밀번호를 변경해주세요.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-5 flex w-full items-center justify-center rounded-md bg-[#002c5f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00234c]"
            >
              로그인으로 이동
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded bg-[#002c5f]">
            <span className="text-base font-bold text-white">OF</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#002c5f]">비밀번호 찾기</h1>
          <p className="text-sm text-slate-500">가입한 이메일로 재설정 링크를 보내드립니다</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-5">
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={inputClass}
              placeholder="name@company.com"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-[#002c5f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00234c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '발송 중...' : '재설정 메일 보내기'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            로그인으로 돌아가기
          </button>
        </form>
      </div>
    </div>
  )
}
