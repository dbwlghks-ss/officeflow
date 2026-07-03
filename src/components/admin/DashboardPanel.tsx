import { useEffect, useState, type ReactNode } from 'react'
import {
  getDashboardData,
  type DashboardData,
  type RecentSurvey,
} from '../../services/dashboardService'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const mealIcon = (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12"
    />
  </svg>
)

const usersIcon = (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
)

const noticeIcon = (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
    />
  </svg>
)

const surveyIcon = (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
    />
  </svg>
)

function KpiCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode
  value: number
  label: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-3 inline-flex rounded-md bg-[#002c5f]/5 p-2 text-[#002c5f]">{icon}</div>
      <p className="text-2xl font-bold text-[#002c5f]">{value}</p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </div>
  )
}

const SURVEY_STATUS_LABELS: Record<RecentSurvey['status'], string> = {
  draft: '임시저장',
  open: '공개',
  closed: '마감',
}

export default function DashboardPanel() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getDashboardData()
      .then((result) => {
        if (active) setData(result)
      })
      .catch(() => {
        if (active) setError('대시보드를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <p className="text-sm text-slate-500">불러오는 중...</p>
  }

  if (error || !data) {
    return (
      <p className="max-w-xl rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
        {error ?? '데이터가 없습니다.'}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={mealIcon} value={data.stats.todayMeals} label="오늘 식수 신청 인원" />
        <KpiCard icon={usersIcon} value={data.stats.totalEmployees} label="전체 직원 수" />
        <KpiCard icon={noticeIcon} value={data.stats.publishedNotices} label="게시중 공지 수" />
        <KpiCard icon={surveyIcon} value={data.stats.openSurveys} label="진행중 설문 수" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-800">최근 공지</h2>
          </div>
          {data.recentNotices.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">등록된 공지가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {data.recentNotices.map((notice) => (
                <li
                  key={notice.id}
                  className="flex items-center justify-between gap-4 px-6 py-3"
                >
                  <span className="truncate text-sm text-slate-700">{notice.title}</span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDate(notice.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-800">최근 설문</h2>
          </div>
          {data.recentSurveys.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">등록된 설문이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {data.recentSurveys.map((survey) => (
                <li
                  key={survey.id}
                  className="flex items-center justify-between gap-4 px-6 py-3"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="rounded bg-[#002c5f]/10 px-2 py-0.5 text-xs font-semibold text-[#002c5f]">
                      {SURVEY_STATUS_LABELS[survey.status]}
                    </span>
                    <span className="truncate text-sm text-slate-700">{survey.title}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDate(survey.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
