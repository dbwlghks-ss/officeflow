import { useEffect, useState } from 'react'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { getStatistics, type StatisticsData } from '../../services/statisticsService'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
)

const NAVY = '#002c5f'

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
    },
  },
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="px-6 py-5">
        <div className="h-64">{children}</div>
      </div>
    </section>
  )
}

export default function StatisticsPanel() {
  const [data, setData] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getStatistics()
      .then((result) => {
        if (active) setData(result)
      })
      .catch(() => {
        if (active) setError('통계를 불러오지 못했습니다.')
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
    <div className="flex flex-col gap-6">
      <p className="text-sm text-slate-500">최근 7일 기준 통계입니다.</p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="식수 신청 현황">
          <Bar
            options={baseOptions}
            data={{
              labels: data.labels,
              datasets: [
                {
                  label: '신청 인원',
                  data: data.meals,
                  backgroundColor: NAVY,
                  borderRadius: 4,
                },
              ],
            }}
          />
        </ChartCard>

        <ChartCard title="설문 참여 현황">
          <Bar
            options={baseOptions}
            data={{
              labels: data.labels,
              datasets: [
                {
                  label: '응답 수',
                  data: data.surveyResponses,
                  backgroundColor: '#3b82f6',
                  borderRadius: 4,
                },
              ],
            }}
          />
        </ChartCard>

        <ChartCard title="공지 등록 추이">
          <Line
            options={baseOptions}
            data={{
              labels: data.labels,
              datasets: [
                {
                  label: '공지 수',
                  data: data.notices,
                  borderColor: NAVY,
                  backgroundColor: 'rgba(0, 44, 95, 0.1)',
                  tension: 0.3,
                  fill: true,
                },
              ],
            }}
          />
        </ChartCard>

        <ChartCard title="직원 권한 비율">
          <Doughnut
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
            }}
            data={{
              labels: ['관리자', '직원'],
              datasets: [
                {
                  data: [data.roles.admin, data.roles.employee],
                  backgroundColor: [NAVY, '#94a3b8'],
                },
              ],
            }}
          />
        </ChartCard>
      </div>
    </div>
  )
}
