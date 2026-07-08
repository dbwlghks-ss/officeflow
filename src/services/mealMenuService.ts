import { getTodayDateKST } from '../lib/koreanDate'
import { supabase } from '../lib/supabase'

export type MealMenu = {
  id: string
  menu_date: string
  meal_type: string
  items: string[]
  note: string | null
  calories: number | null
  cafeteria: string
  is_published: boolean
}

export type MealMenuQueryResult =
  | { status: 'ok'; menu: MealMenu }
  | { status: 'not_found' }
  | { status: 'unavailable'; reason: 'missing_table' | 'permission' | 'error' }

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const record = error as { code?: string; message?: string }
  return (
    record.code === '42P01' ||
    record.code === 'PGRST205' ||
    Boolean(record.message?.includes('meal_menus')) ||
    Boolean(record.message?.includes('does not exist'))
  )
}

export async function getMealMenuByDate(
  menuDate: string,
  mealType = 'lunch',
): Promise<MealMenuQueryResult> {
  const { data, error } = await supabase
    .from('meal_menus')
    .select('id, menu_date, meal_type, items, note, calories, cafeteria, is_published')
    .eq('menu_date', menuDate)
    .eq('meal_type', mealType)
    .eq('is_published', true)
    .order('cafeteria', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (isMissingTableError(error)) {
      return { status: 'unavailable', reason: 'missing_table' }
    }
    if (error.code === '42501' || error.message?.includes('permission')) {
      return { status: 'unavailable', reason: 'permission' }
    }
    console.error('[mealMenu] fetch failed:', error)
    return { status: 'unavailable', reason: 'error' }
  }

  if (!data) return { status: 'not_found' }
  return { status: 'ok', menu: data as MealMenu }
}

export async function getTodayMealMenu(mealType = 'lunch'): Promise<MealMenuQueryResult> {
  return getMealMenuByDate(getTodayDateKST(), mealType)
}

export function formatMealMenuForAssistant(menu: MealMenu): {
  title: string
  message: string
  lines: string[]
} {
  const mealLabel = menu.meal_type === 'lunch' ? '점심' : menu.meal_type
  const itemLines =
    menu.items.length > 0
      ? menu.items.map((item) => `- ${item}`)
      : ['- 등록된 메뉴 항목이 없습니다.']

  const lines = [...itemLines]
  if (menu.note?.trim()) {
    lines.push(`비고: ${menu.note.trim()}`)
  }
  if (menu.calories) {
    lines.push(`칼로리: ${menu.calories} kcal`)
  }

  return {
    title: `오늘 ${mealLabel} 메뉴`,
    message: `오늘 ${mealLabel} 메뉴입니다.`,
    lines,
  }
}
