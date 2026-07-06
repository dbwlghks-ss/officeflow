import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const POSITIONS = ['사원', '주임', '대리', '과장', '차장', '부장', '임원'] as const
const DEPARTMENTS = [
  '설계팀',
  '생산기술팀',
  '품질팀',
  '생산팀',
  '구매팀',
  '인사팀',
  '경영지원팀',
] as const

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f] disabled:bg-slate-50'

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('이름을 입력하세요.')
      return
    }
    if (!position) {
      setError('직급을 선택하세요.')
      return
    }
    if (!department) {
      setError('부서를 선택하세요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name.trim(),
          position,
          department,
        },
      },
    })

    if (signUpError) {
      setError(`회원가입에 실패했습니다: ${signUpError.message}`)
      setLoading(false)
      return
    }

    // 자동 로그인 세션이 생성되는 설정일 수 있으므로 로그아웃 후,
    // 로그인하지 말고 인증 메일 안내 화면을 보여준다.
    await supabase.auth.signOut()
    setSubmittedEmail(email)
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
            <h1 className="text-2xl font-semibold tracking-tight text-[#002c5f]">가입 신청 완료</h1>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="rounded-md bg-emerald-50 px-4 py-5 text-center">
              <p className="text-sm font-semibold text-emerald-700">
                <span className="break-all">{submittedEmail}</span> 으로 인증 메일을 발송했습니다.
              </p>
              <p className="mt-2 text-sm text-emerald-600">
                메일함(스팸함 포함)을 확인하여 인증을 완료한 후 로그인해주세요.
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
          <h1 className="text-2xl font-semibold tracking-tight text-[#002c5f]">회원가입</h1>
          <p className="text-sm text-slate-500">OfficeFlow 계정을 생성하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6">
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

          <div className="mb-4">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              비밀번호
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

          <div className="mb-4">
            <label
              htmlFor="password-confirm"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              비밀번호 확인
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

          <div className="mb-4">
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
              이름
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className={inputClass}
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="position" className="mb-1.5 block text-sm font-medium text-slate-700">
              직급
            </label>
            <select
              id="position"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              disabled={loading}
              className={inputClass}
            >
              <option value="" disabled>
                직급을 선택하세요
              </option>
              {POSITIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-slate-700">
              부서
            </label>
            <select
              id="department"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={loading}
              className={inputClass}
            >
              <option value="" disabled>
                부서를 선택하세요
              </option>
              {DEPARTMENTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-[#002c5f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00234c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '가입 중...' : '회원가입'}
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
