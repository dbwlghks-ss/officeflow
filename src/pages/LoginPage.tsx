import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { OfficeFlowLogo } from '../components/ui/Logo'
import { Button, Card, inputClass } from '../components/ui/primitives'

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
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <span className="text-sm text-slate-500">불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <OfficeFlowLogo />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">다시 오신 것을 환영합니다</h1>
            <p className="mt-1 text-sm text-slate-500">OfficeFlow 계정으로 로그인하세요</p>
          </div>
        </div>

        {info && (
          <p className="mb-4 rounded-btn bg-green-50 px-3 py-2.5 text-center text-sm font-medium text-success">
            {info}
          </p>
        )}

        <Card className="p-7 shadow-card">
          <form onSubmit={handleSubmit}>
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
                className={inputClass}
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
                className={inputClass}
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && (
              <p className="mb-4 whitespace-pre-line rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '로그인 중...' : '로그인'}
            </Button>

            <div className="mt-5 flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                disabled={loading}
                className="font-medium text-slate-500 transition-colors hover:text-brand disabled:opacity-60"
              >
                회원가입
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                disabled={loading}
                className="font-medium text-slate-500 transition-colors hover:text-brand disabled:opacity-60"
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading || resending}
              className="mt-3 flex w-full items-center justify-center text-sm font-medium text-slate-400 transition-colors hover:text-brand disabled:opacity-60"
            >
              {resending ? '재발송 중...' : '인증 메일을 받지 못했나요?'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}
