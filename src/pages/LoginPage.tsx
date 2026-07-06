import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (data.session) {
        navigate('/', { replace: true })
      } else {
        setCheckingSession(false)
      }
    })

    return () => {
      active = false
    }
  }, [navigate])

  async function handleResend() {
    if (!email) {
      setError('이메일을 입력한 후 다시 시도해 주세요.')
      return
    }
    setResending(true)
    setError(null)
    setInfo(null)

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (resendError) {
      setError(`인증 메일 재발송에 실패했습니다: ${resendError.message}`)
    } else {
      setInfo('인증 메일을 다시 발송했습니다.')
    }
    setResending(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      const code = (signInError as { code?: string }).code
      if (code === 'email_not_confirmed' || /not confirmed/i.test(signInError.message)) {
        setError('이메일 인증이 완료되지 않았습니다.\n메일함에서 인증을 완료한 후 로그인해주세요.')
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      }
      setLoading(false)
      return
    }

    const user = data.user
    if (user) {
      const { data: existing, error: selectError } = await supabase
        .from('profiles')
        .select('id, is_active')
        .eq('id', user.id)
        .maybeSingle()

      if (selectError) {
        await supabase.auth.signOut()
        setError(`프로필 확인에 실패했습니다: ${selectError.message}`)
        setLoading(false)
        return
      }

      let profile = existing

      if (!profile) {
        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.email ? user.email.split('@')[0] : '',
            department_id: null,
            role: 'employee',
            is_active: true,
          })
          .select('id, is_active')
          .single()

        if (insertError) {
          await supabase.auth.signOut()
          setError(`프로필 생성에 실패했습니다: ${insertError.message}`)
          setLoading(false)
          return
        }

        profile = inserted
      }

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut()
        setError('비활성화된 계정입니다.')
        setLoading(false)
        return
      }
    }

    navigate('/', { replace: true })
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7]">
        <span className="text-sm text-slate-500">불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded bg-[#002c5f]">
            <span className="text-base font-bold text-white">OF</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#002c5f]">로그인</h1>
          <p className="text-sm text-slate-500">OfficeFlow 계정으로 로그인하세요</p>
        </div>

        {info && (
          <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-700">
            {info}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-6"
        >
          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50"
              placeholder="name@company.com"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50"
              placeholder="비밀번호를 입력하세요"
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
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/signup')}
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center rounded-md border border-[#002c5f] px-4 py-2.5 text-sm font-medium text-[#002c5f] transition-colors hover:bg-[#002c5f]/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            회원가입
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading || resending}
            className="mt-3 flex w-full items-center justify-center text-sm font-medium text-slate-500 transition-colors hover:text-[#002c5f] disabled:opacity-60"
          >
            {resending ? '재발송 중...' : '인증 메일을 받지 못했나요?'}
          </button>
        </form>
      </div>
    </div>
  )
}
