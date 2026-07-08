import { supabase } from '../lib/supabase'
import { notifyAssistantDataUpdated } from '../lib/assistantDataEvents'
import {
  applyMeal,
  getMyApplication,
  getTodayLunchService,
  setMealCancelled,
} from './mealService'

export type MealActionResult =
  | { ok: true; applied: boolean; message: string }
  | {
      ok: false
      reason: 'unauthenticated' | 'no_service' | 'no_application' | 'already_applied' | 'error'
      message: string
    }

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function applyTodayMeal(): Promise<MealActionResult> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return { ok: false, reason: 'unauthenticated', message: '로그인 후 식수를 신청할 수 있습니다.' }
  }

  try {
    const todayService = await getTodayLunchService()
    if (!todayService) {
      return {
        ok: false,
        reason: 'no_service',
        message: '오늘 등록된 점심 식수 서비스가 없습니다.',
      }
    }

    const existing = await getMyApplication(todayService.id, userId)
    if (existing?.status === 'applied') {
      return {
        ok: false,
        reason: 'already_applied',
        message: '이미 오늘 식수 신청이 완료되어 있습니다.',
      }
    }

    await applyMeal(todayService.id, userId)
    notifyAssistantDataUpdated()

    return { ok: true, applied: true, message: '오늘 식수 신청을 완료했습니다.' }
  } catch (error) {
    console.error('[mealAction] apply failed:', error)
    return { ok: false, reason: 'error', message: '식수 신청에 실패했습니다. 잠시 후 다시 시도해주세요.' }
  }
}

export async function cancelTodayMeal(): Promise<MealActionResult> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return { ok: false, reason: 'unauthenticated', message: '로그인 후 식수 상태를 변경할 수 있습니다.' }
  }

  try {
    const todayService = await getTodayLunchService()
    if (!todayService) {
      return {
        ok: false,
        reason: 'no_service',
        message: '오늘 등록된 점심 식수 서비스가 없습니다.',
      }
    }

    const existing = await getMyApplication(todayService.id, userId)
    if (!existing || existing.status !== 'applied') {
      await setMealCancelled(todayService.id, userId)
      notifyAssistantDataUpdated()

      return {
        ok: true,
        applied: false,
        message: '오늘 식수를 안 먹는 것으로 처리했습니다.',
      }
    }

    await setMealCancelled(todayService.id, userId)
    notifyAssistantDataUpdated()

    return { ok: true, applied: false, message: '오늘 식수를 안 먹는 것으로 처리했습니다.' }
  } catch (error) {
    console.error('[mealAction] cancel failed:', error)
    return { ok: false, reason: 'error', message: '식수 취소에 실패했습니다. 잠시 후 다시 시도해주세요.' }
  }
}
