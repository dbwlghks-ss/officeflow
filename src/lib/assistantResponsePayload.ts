import type {
  AssistantEmployeeInfo,
  AssistantMealMenuPayload,
  AssistantWorkSummaryPayload,
} from '../types/assistant'
import type { AssistantSnapshot } from '../services/assistantDataService'
import type { EmployeeDirectoryEntry } from '../services/employeeDirectoryService'
import type { MealMenu } from '../services/mealMenuService'
import type { Profile } from '../services/userService'
import { mapSnapshotToBriefSummary } from './homeBriefSummary'

export function toAssistantEmployeeFromDirectory(
  employee: EmployeeDirectoryEntry,
): AssistantEmployeeInfo {
  return {
    name: employee.name,
    department: employee.department,
    position: employee.position,
    workEmail: employee.work_email,
    extension: employee.extension,
    workPhone: employee.work_phone,
  }
}

export function toAssistantEmployeeFromProfile(profile: Profile): AssistantEmployeeInfo {
  return {
    name: profile.full_name,
    department: profile.department_name?.trim() || profile.department?.trim() || null,
    position: profile.position?.trim() || null,
    workEmail: profile.email?.trim() || null,
    extension: null,
    workPhone: null,
  }
}

export function toAssistantMealMenuPayload(menu: MealMenu): AssistantMealMenuPayload {
  return {
    menuDate: menu.menu_date,
    mealType: menu.meal_type,
    cafeteria: menu.cafeteria,
    items: menu.items,
    note: menu.note,
    calories: menu.calories,
  }
}

export function toWorkSummaryPayload(
  snapshot: AssistantSnapshot,
  variant: AssistantWorkSummaryPayload['variant'],
): AssistantWorkSummaryPayload {
  const summary = mapSnapshotToBriefSummary(snapshot)
  return {
    variant,
    mealStatusLabel: summary.mealStatusLabel,
    mealApplied: summary.mealApplied,
    mealDeclined: summary.mealDeclined,
    mealServiceAvailable: summary.mealServiceAvailable,
    unreadNoticeCount: summary.unreadNoticeCount,
    pendingSurveyCount: summary.pendingSurveyCount,
    meetingActionCount: summary.meetingActionCount,
    noticeTitles: snapshot.notices.unreadTitles,
    surveyTitles: snapshot.surveys.pendingTitles,
  }
}

export function formatMealTypeLabel(mealType: string): string {
  if (mealType === 'lunch') return '점심'
  if (mealType === 'dinner') return '저녁'
  if (mealType === 'breakfast') return '아침'
  return mealType
}

export function formatCafeteriaLabel(cafeteria: string): string {
  const trimmed = cafeteria.trim()
  if (!trimmed || trimmed === 'main') return '구내식당'
  return trimmed
}

export function formatMenuDateLabel(menuDate: string): string {
  const [year, month, day] = menuDate.split('-').map(Number)
  if (!year || !month || !day) return menuDate
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export function displayOrFallback(value: string | null | undefined, fallback = '등록된 정보가 없습니다') {
  const trimmed = value?.trim()
  return trimmed || fallback
}
