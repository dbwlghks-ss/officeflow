import { supabase } from '../lib/supabase'
import { getTodayDate } from './mealService'

export type DashboardStats = {
  todayMeals: number
  totalEmployees: number
  publishedNotices: number
  openSurveys: number
}

export type RecentNotice = {
  id: number
  title: string
  created_at: string
}

export type RecentSurvey = {
  id: number
  title: string
  status: 'draft' | 'open' | 'closed'
  created_at: string
}

export type DashboardData = {
  stats: DashboardStats
  recentNotices: RecentNotice[]
  recentSurveys: RecentSurvey[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const today = getTodayDate()

  const [
    todayMealsRes,
    employeesRes,
    noticesCountRes,
    surveysCountRes,
    recentNoticesRes,
    recentSurveysRes,
  ] = await Promise.all([
    supabase
      .from('meal_applications')
      .select('id, meal_services!inner(service_date)', { count: 'exact', head: true })
      .eq('status', 'applied')
      .eq('meal_services.service_date', today),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('notices').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('surveys').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase
      .from('notices')
      .select('id, title, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('surveys')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const firstError =
    todayMealsRes.error ||
    employeesRes.error ||
    noticesCountRes.error ||
    surveysCountRes.error ||
    recentNoticesRes.error ||
    recentSurveysRes.error
  if (firstError) throw firstError

  return {
    stats: {
      todayMeals: todayMealsRes.count ?? 0,
      totalEmployees: employeesRes.count ?? 0,
      publishedNotices: noticesCountRes.count ?? 0,
      openSurveys: surveysCountRes.count ?? 0,
    },
    recentNotices: (recentNoticesRes.data ?? []) as RecentNotice[],
    recentSurveys: (recentSurveysRes.data ?? []) as RecentSurvey[],
  }
}
