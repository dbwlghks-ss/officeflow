import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { HwashinLogo, OfficeFlowLogoImage } from '../components/ui/Logo'
import { Button, Card, inputClass } from '../components/ui/primitives'

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

    await supabase.auth.signOut()
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex justify-center">
            <OfficeFlowLogoImage />
          </div>
          <Card className="p-7 shadow-card">
            <div className="flex flex-col items-center rounded-btn bg-green-50 px-4 py-8 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
                <CheckCircle2 size={28} />
              </div>
              <h1 className="text-lg font-bold text-slate-900">변경 완료</h1>
              <p className="mt-3 text-sm font-semibold text-slate-700">비밀번호가 변경되었습니다.</p>
              <p className="mt-1.5 text-sm text-slate-500">잠시 후 로그인 화면으로 이동합니다.</p>
            </div>
            <Button type="button" onClick={() => navigate('/login', { replace: true })} className="mt-5 w-full">
              로그인으로 이동
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <OfficeFlowLogoImage />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">비밀번호 변경</h1>
            <p className="mt-1 text-sm text-slate-500">새로운 비밀번호를 입력하세요</p>
          </div>
        </div>

        <Card className="p-7 shadow-card">
          <form onSubmit={handleSubmit}>
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
              <label htmlFor="password-confirm" className="mb-1.5 block text-sm font-medium text-slate-700">
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
              <p className="mb-4 whitespace-pre-line rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </form>
        </Card>

        <div className="mt-8 flex items-center justify-center opacity-70">
          <HwashinLogo />
        </div>
      </div>
    </div>
  )
}
