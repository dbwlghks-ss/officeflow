import { supabase } from '../lib/supabase'

export type StatisticsData = {
  labels: string[]
  meals: number[]
  surveyResponses: number[]
  notices: number[]
  roles: { admin: number; employee: number }
}

function dateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function last7Days(): Date[] {
  const days: Date[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

export async function getStatistics(): Promise<StatisticsData> {
  const days = last7Days()
  const keys = days.map(dateKey)
  const labels = days.map((d) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  const startDateStr = keys[0]
  const startISO = days[0].toISOString()

  const [mealsRes, responsesRes, noticesRes, profilesRes] = await Promise.all([
    supabase
      .from('meal_applications')
      .select('meal_services!inner(service_date)')
      .eq('status', 'applied')
      .gte('meal_services.service_date', startDateStr),
    supabase.from('survey_responses').select('created_at').gte('created_at', startISO),
    supabase.from('notices').select('created_at').gte('created_at', startISO),
    // 이메일 인증 완료 사용자만 집계한다.
    supabase.rpc('get_confirmed_profiles'),
  ])

  const firstError =
    mealsRes.error || responsesRes.error || noticesRes.error || profilesRes.error
  if (firstError) throw firstError

  const confirmedProfiles = (profilesRes.data ?? []) as { role: string }[]
  const adminCount = confirmedProfiles.filter((p) => p.role === 'admin').length
  const employeeCount = confirmedProfiles.filter((p) => p.role === 'employee').length

  const countByDay = (rowKeys: string[]): number[] =>
    keys.map((key) => rowKeys.filter((rk) => rk === key).length)

  const mealKeys = (mealsRes.data ?? []).map((row) => {
    const service = (row as { meal_services: { service_date: string } | { service_date: string }[] })
      .meal_services
    const serviceDate = Array.isArray(service) ? service[0]?.service_date : service?.service_date
    return serviceDate ?? ''
  })

  const responseKeys = (responsesRes.data ?? []).map((row) =>
    dateKey(new Date((row as { created_at: string }).created_at)),
  )

  const noticeKeys = (noticesRes.data ?? []).map((row) =>
    dateKey(new Date((row as { created_at: string }).created_at)),
  )

  return {
    labels,
    meals: countByDay(mealKeys),
    surveyResponses: countByDay(responseKeys),
    notices: countByDay(noticeKeys),
    roles: {
      admin: adminCount,
      employee: employeeCount,
    },
  }
}
