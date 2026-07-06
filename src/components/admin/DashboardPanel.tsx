import { useEffect, useState, type ReactNode } from 'react'
import {
  ClipboardList,
  Megaphone,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import {
  getDashboardData,
  type DashboardData,
  type RecentSurvey,
} from '../../services/dashboardService'
import { Badge, Card } from '../ui/primitives'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function KpiCard({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon
  value: number
  label: string
}) {
  return (
    <Card className="p-6 transition-shadow duration-200 hover:shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <Icon size={22} strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </Card>
  )
}

const SURVEY_STATUS_LABELS: Record<RecentSurvey['status'], string> = {
  draft: '임시저장',
  open: '공개',
  closed: '마감',
}

const SURVEY_STATUS_TONE: Record<RecentSurvey['status'], 'neutral' | 'success' | 'warning'> = {
  draft: 'neutral',
  open: 'success',
  closed: 'warning',
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </Card>
  )
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
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[132px] animate-pulse rounded-card border border-line bg-slate-100/60" />
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <p className="max-w-xl rounded-btn bg-red-50 px-4 py-3 text-sm text-danger">
        {error ?? '데이터가 없습니다.'}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={UtensilsCrossed} value={data.stats.todayMeals} label="오늘 식수 신청 인원" />
        <KpiCard icon={Users} value={data.stats.totalEmployees} label="전체 직원 수" />
        <KpiCard icon={Megaphone} value={data.stats.publishedNotices} label="게시중 공지 수" />
        <KpiCard icon={ClipboardList} value={data.stats.openSurveys} label="진행중 설문 수" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="최근 공지">
          {data.recentNotices.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-400">등록된 공지가 없습니다.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.recentNotices.map((notice) => (
                <li key={notice.id} className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-slate-50/60">
                  <span className="truncate text-sm font-medium text-slate-700">{notice.title}</span>
                  <span className="shrink-0 text-xs text-slate-400">{formatDate(notice.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="최근 설문">
          {data.recentSurveys.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-400">등록된 설문이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.recentSurveys.map((survey) => (
                <li key={survey.id} className="flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-slate-50/60">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Badge tone={SURVEY_STATUS_TONE[survey.status]}>
                      {SURVEY_STATUS_LABELS[survey.status]}
                    </Badge>
                    <span className="truncate text-sm font-medium text-slate-700">{survey.title}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{formatDate(survey.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
