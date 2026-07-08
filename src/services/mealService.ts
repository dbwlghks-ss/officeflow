import { supabase } from '../lib/supabase'

export type MealService = {
  id: number
  service_date: string
  meal_type: string
  is_open: boolean
}

export type MealApplication = {
  id: number
  meal_service_id: number
  user_id: string
  status: 'applied' | 'cancelled'
}

export function getTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function getTodayLunchService(): Promise<MealService | null> {
  const { data, error } = await supabase
    .from('meal_services')
    .select('id, service_date, meal_type, is_open')
    .eq('service_date', getTodayDate())
    .eq('meal_type', 'lunch')
    .maybeSingle()

  if (error) throw error
  return data
}

export type CreateLunchResult = 'created' | 'exists'

export async function createTodayLunchService(): Promise<CreateLunchResult> {
  const existing = await getTodayLunchService()
  if (existing) return 'exists'

  const { error } = await supabase.from('meal_services').insert({
    service_date: getTodayDate(),
    meal_type: 'lunch',
  })

  if (error) {
    // UNIQUE(service_date, meal_type) 위반이면 이미 등록된 것으로 처리
    if (error.code === '23505') return 'exists'
    throw error
  }

  return 'created'
}

export async function getMyApplication(
  mealServiceId: number,
  userId: string,
): Promise<MealApplication | null> {
  const { data, error } = await supabase
    .from('meal_applications')
    .select('id, meal_service_id, user_id, status')
    .eq('meal_service_id', mealServiceId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function applyMeal(mealServiceId: number, userId: string): Promise<void> {
  const { error } = await supabase.from('meal_applications').upsert(
    {
      meal_service_id: mealServiceId,
      user_id: userId,
      status: 'applied',
    },
    { onConflict: 'meal_service_id,user_id' },
  )

  if (error) throw error
}

export async function cancelMeal(mealServiceId: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from('meal_applications')
    .update({ status: 'cancelled' })
    .eq('meal_service_id', mealServiceId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function setMealCancelled(mealServiceId: number, userId: string): Promise<void> {
  const { error } = await supabase.from('meal_applications').upsert(
    {
      meal_service_id: mealServiceId,
      user_id: userId,
      status: 'cancelled',
    },
    { onConflict: 'meal_service_id,user_id' },
  )

  if (error) throw error
}
