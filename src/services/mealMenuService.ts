import { getTodayDateKST } from '../lib/koreanDate'
import { isMissingTableError, isPermissionError } from '../lib/adminDataErrors'
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

export type MealMenuInput = {
  menu_date: string
  meal_type?: string
  items: string[]
  note?: string
  calories?: number | null
  cafeteria?: string
  is_published?: boolean
}

export type MealMenuQueryResult =
  | { status: 'ok'; menu: MealMenu }
  | { status: 'not_found' }
  | { status: 'unavailable'; reason: 'missing_table' | 'permission' | 'error' }

function mapMealMenuError(error: unknown): MealMenuQueryResult {
  if (isMissingTableError(error, 'meal_menus')) {
    return { status: 'unavailable', reason: 'missing_table' }
  }
  if (isPermissionError(error)) {
    return { status: 'unavailable', reason: 'permission' }
  }
  console.error('[mealMenu] query failed:', error)
  return { status: 'unavailable', reason: 'error' }
}

export function parseMenuItemsText(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function formatMenuItemsText(items: string[]): string {
  return items.join('\n')
}

function normalizeMealMenuInput(input: MealMenuInput) {
  return {
    menu_date: input.menu_date,
    meal_type: input.meal_type?.trim() || 'lunch',
    items: input.items.filter(Boolean),
    note: input.note?.trim() || null,
    calories: input.calories ?? null,
    cafeteria: input.cafeteria?.trim() || 'main',
    is_published: input.is_published ?? true,
  }
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
    return mapMealMenuError(error)
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

export async function listMealMenusForAdmin(): Promise<MealMenu[]> {
  const { data, error } = await supabase
    .from('meal_menus')
    .select('id, menu_date, meal_type, items, note, calories, cafeteria, is_published')
    .order('menu_date', { ascending: false })
    .order('meal_type', { ascending: true })

  if (error) throw error
  return (data ?? []) as MealMenu[]
}

export async function createMealMenu(input: MealMenuInput): Promise<MealMenu> {
  const payload = normalizeMealMenuInput(input)
  const { data, error } = await supabase
    .from('meal_menus')
    .insert(payload)
    .select('id, menu_date, meal_type, items, note, calories, cafeteria, is_published')
    .single()

  if (error) throw error
  return data as MealMenu
}

export async function updateMealMenu(id: string, input: MealMenuInput): Promise<MealMenu> {
  const payload = normalizeMealMenuInput(input)
  const { data, error } = await supabase
    .from('meal_menus')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, menu_date, meal_type, items, note, calories, cafeteria, is_published')
    .single()

  if (error) throw error
  return data as MealMenu
}

export async function deleteMealMenu(id: string): Promise<void> {
  const { error } = await supabase.from('meal_menus').delete().eq('id', id)
  if (error) throw error
}

export async function toggleMealMenuPublished(id: string, isPublished: boolean): Promise<void> {
  const { error } = await supabase
    .from('meal_menus')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
