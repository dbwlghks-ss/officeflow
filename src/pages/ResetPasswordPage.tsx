import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => navigate('/login', { replace: true }), 2000)
    return () => clearTimeout(timer)
  }, [success, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(
        `비밀번호 변경에 실패했습니다: ${updateError.message}\n메일의 재설정 링크를 통해 다시 접속해주세요.`,
      )
      setLoading(false)
      return
    }

    // 새 비밀번호로 다시 로그인하도록 재설정 세션을 종료한다.
    await supabase.auth.signOut()
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded bg-[#002c5f]">
              <span className="text-base font-bold text-white">OF</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#002c5f]">변경 완료</h1>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="rounded-md bg-emerald-50 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-emerald-700">비밀번호가 변경되었습니다.</p>
              <p className="mt-2 text-sm text-emerald-600">잠시 후 로그인 화면으로 이동합니다.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
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
          <h1 className="text-2xl font-semibold tracking-tight text-[#002c5f]">비밀번호 변경</h1>
          <p className="text-sm text-slate-500">새로운 비밀번호를 입력하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              새 비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={inputClass}
              placeholder="6자 이상 입력하세요"
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="password-confirm"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              새 비밀번호 확인
            </label>
            <input
              id="password-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={loading}
              className={inputClass}
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          {error && (
            <p className="mb-4 whitespace-pre-line rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-[#002c5f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00234c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  )
}
