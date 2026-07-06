import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { OfficeFlowLogo } from '../components/ui/Logo'
import { Button, Card, inputClass } from '../components/ui/primitives'

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
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex justify-center">
            <OfficeFlowLogo />
          </div>
          <Card className="p-7 shadow-card">
            <div className="flex flex-col items-center rounded-btn bg-green-50 px-4 py-8 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
                <MailCheck size={28} />
              </div>
              <h1 className="text-lg font-bold text-slate-900">메일 발송 완료</h1>
              <p className="mt-3 text-sm font-semibold text-slate-700">
                비밀번호 재설정 메일을 발송했습니다.
              </p>
              <p className="mt-1.5 text-sm text-slate-500">
                메일함(스팸함 포함)을 확인하여 비밀번호를 변경해주세요.
              </p>
            </div>
            <Button type="button" onClick={() => navigate('/login')} className="mt-5 w-full">
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
          <OfficeFlowLogo />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">비밀번호 찾기</h1>
            <p className="mt-1 text-sm text-slate-500">가입한 이메일로 재설정 링크를 보내드립니다</p>
          </div>
        </div>

        <Card className="p-7 shadow-card">
          <form onSubmit={handleSubmit}>
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
              <p className="mb-4 rounded-btn bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '발송 중...' : '재설정 메일 보내기'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/login')}
              disabled={loading}
              className="mt-3 w-full"
            >
              로그인으로 돌아가기
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
