import { resolveAssistantResponse } from '../../lib/assistantIntent'
import { ASSISTANT_UNAUTHENTICATED_MESSAGE } from '../../lib/assistantUi'
import { supabase } from '../../lib/supabase'
import type { AssistantResponse } from '../../types/assistant'
import {
  findBestEmployeeMatch,
  formatEmployeeForAssistant,
  searchEmployees,
} from '../../services/employeeDirectoryService'
import {
  formatMealMenuForAssistant,
  getTodayMealMenu,
} from '../../services/mealMenuService'
import {
  applyMeal,
  cancelMeal,
  getMyApplication,
  getTodayLunchService,
} from '../../services/mealService'
import { getProfiles, type Profile } from '../../services/userService'
import { UNKNOWN_INTENT_EXAMPLES } from './assistantIntent'
import type { DetectedRuleIntent, EmployeeLookupField } from './assistantTypes'

export const ASSISTANT_DATA_UPDATED_EVENT = 'officeflow:assistant-data-updated'

function notifyAssistantDataUpdated() {
  window.dispatchEvent(new CustomEvent(ASSISTANT_DATA_UPDATED_EVENT))
}

function readyResponse(partial: AssistantResponse): AssistantResponse {
  return { ...partial, state: 'ready' }
}

function errorResponse(partial: AssistantResponse): AssistantResponse {
  return { ...partial, state: 'error' }
}

export function getLoadingRuleAssistantResponse(): AssistantResponse {
  return {
    title: 'Assistant',
    message: '요청을 확인하고 있습니다.',
    lines: [],
    state: 'loading',
  }
}

export function getUnknownIntentResponse(): AssistantResponse {
  return readyResponse({
    title: '요청을 이해하지 못했습니다',
    message: '아직 이해하지 못한 요청입니다. 아래처럼 질문해보세요.',
    lines: UNKNOWN_INTENT_EXAMPLES.map((example) => `- ${example}`),
  })
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

function unauthenticatedResponse(title: string): AssistantResponse {
  return errorResponse({
    title,
    message: ASSISTANT_UNAUTHENTICATED_MESSAGE,
    lines: ['로그인 후 Assistant에서 업무를 확인하고 처리할 수 있습니다.'],
    action: { label: '로그인하기', path: '/login' },
  })
}

async function executeGetTodayMeal(): Promise<AssistantResponse> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return unauthenticatedResponse('오늘 점심 메뉴')
  }

  const menuResult = await getTodayMealMenu()

  if (menuResult.status === 'ok') {
    const formatted = formatMealMenuForAssistant(menuResult.menu)
    return readyResponse({
      ...formatted,
      action: { label: '식수 페이지 보기', path: '/meal' },
    })
  }

  if (menuResult.status === 'unavailable') {
    return readyResponse({
      title: '오늘 점심 메뉴',
      message: '식단 데이터가 아직 연결되지 않았습니다.',
      lines: [
        '관리자가 meal_menus 테이블을 적용하면 이곳에서 오늘 식단을 확인할 수 있습니다.',
        '식수 신청은 식수 페이지에서 계속 이용할 수 있습니다.',
      ],
      action: { label: '식수 페이지 보기', path: '/meal' },
    })
  }

  const todayService = await getTodayLunchService()
  if (!todayService) {
    return readyResponse({
      title: '오늘 점심 메뉴',
      message: '오늘 등록된 식단 정보가 없습니다.',
      lines: ['관리자에게 오늘 식단 등록을 요청하세요.'],
      action: { label: '식수 페이지 보기', path: '/meal' },
    })
  }

  return readyResponse({
    title: '오늘 점심 메뉴',
    message: '오늘 등록된 식단 정보가 없습니다.',
    lines: [
      '오늘 구내식당 운영일이지만 메뉴 항목은 아직 등록되지 않았습니다.',
      '관리자에게 식단 등록을 요청하세요.',
    ],
    action: { label: '식수 페이지 보기', path: '/meal' },
  })
}

async function executeApplyTodayMeal(): Promise<AssistantResponse> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return unauthenticatedResponse('오늘 식수 신청')
  }

  const todayService = await getTodayLunchService()
  if (!todayService) {
    return errorResponse({
      title: '오늘 식수 신청',
      message: '오늘 등록된 점심 식수 서비스가 없습니다.',
      lines: ['관리자가 오늘 식수를 등록한 뒤 다시 시도해주세요.'],
      action: { label: '식수 페이지 보기', path: '/meal' },
    })
  }

  const existing = await getMyApplication(todayService.id, userId)
  if (existing?.status === 'applied') {
    return readyResponse({
      title: '오늘 식수 신청',
      message: '이미 오늘 식수 신청이 완료되어 있습니다.',
      lines: ['오늘 식수: 신청 완료'],
    })
  }

  await applyMeal(todayService.id, userId)
  notifyAssistantDataUpdated()

  return readyResponse({
    title: '오늘 식수 신청',
    message: '오늘 식수 신청을 완료했습니다.',
    lines: ['오늘 식수: 신청 완료'],
  })
}

async function executeCancelTodayMeal(): Promise<AssistantResponse> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return unauthenticatedResponse('오늘 식수 취소')
  }

  const todayService = await getTodayLunchService()
  if (!todayService) {
    return errorResponse({
      title: '오늘 식수 취소',
      message: '오늘 등록된 점심 식수 서비스가 없습니다.',
      lines: [],
      action: { label: '식수 페이지 보기', path: '/meal' },
    })
  }

  const existing = await getMyApplication(todayService.id, userId)
  if (!existing || existing.status !== 'applied') {
    return readyResponse({
      title: '오늘 식수 취소',
      message: '오늘 식수 신청 내역이 없어 취소할 항목이 없습니다.',
      lines: ['오늘 식수: 미신청'],
    })
  }

  await cancelMeal(todayService.id, userId)
  notifyAssistantDataUpdated()

  return readyResponse({
    title: '오늘 식수 취소',
    message: '오늘 식수를 안 먹는 것으로 처리했습니다.',
    lines: ['오늘 식수: 미신청'],
  })
}

function fieldLabel(field: EmployeeLookupField): string {
  switch (field) {
    case 'position':
      return '직급'
    case 'department':
      return '부서'
    case 'phone':
      return '연락처'
    case 'email':
      return '이메일'
    case 'summary':
      return '정보'
  }
}

function buildEmployeeLookupResponse(
  name: string,
  field: EmployeeLookupField,
  value: string,
): AssistantResponse {
  if (field === 'summary') {
    return readyResponse({
      title: `${name} 사원 정보`,
      message: `${name} 사원 정보입니다.`,
      lines: value.split('\n').map((line) => `- ${line}`),
    })
  }

  return readyResponse({
    title: `${name} ${fieldLabel(field)}`,
    message: `${name} 사원의 ${fieldLabel(field)} 정보입니다.`,
    lines: [`${fieldLabel(field)}: ${value}`],
  })
}

function buildMultipleMatchesResponse(nameQuery: string, names: string[]): AssistantResponse {
  return readyResponse({
    title: '직원 정보 조회',
    message: `"${nameQuery}" 검색 결과가 ${names.length}건 있습니다. 더 구체적으로 입력해주세요.`,
    lines: names.slice(0, 3).map((name) => `- ${name}`),
  })
}

async function executeEmployeeLookupFromDirectory(
  nameQuery: string,
  field: EmployeeLookupField,
): Promise<AssistantResponse | null> {
  const result = await searchEmployees(nameQuery)

  if (result.status === 'unavailable') {
    return null
  }

  if (result.status === 'empty') {
    return readyResponse({
      title: '직원 정보 조회',
      message: '조회 가능한 직원 정보를 찾지 못했습니다.',
      lines: ['이름을 확인하거나 다른 표현으로 다시 질문해보세요.'],
    })
  }

  const matches = findBestEmployeeMatch(result.employees, nameQuery)

  if (matches.length === 0) {
    return readyResponse({
      title: '직원 정보 조회',
      message: '조회 가능한 직원 정보를 찾지 못했습니다.',
      lines: ['이름을 확인하거나 다른 표현으로 다시 질문해보세요.'],
    })
  }

  if (matches.length > 1) {
    return buildMultipleMatchesResponse(
      nameQuery,
      matches.map((employee) => employee.name),
    )
  }

  const employee = matches[0]
  return buildEmployeeLookupResponse(
    employee.name,
    field,
    formatEmployeeForAssistant(employee, field),
  )
}

function profileMatchesQuery(profile: Profile, nameQuery: string): boolean {
  if (!nameQuery) return false
  const normalizedQuery = nameQuery.toLowerCase()
  return (
    profile.full_name.toLowerCase().includes(normalizedQuery) ||
    normalizedQuery.includes(profile.full_name.toLowerCase())
  )
}

function formatProfileForAssistant(profile: Profile, field: EmployeeLookupField): string {
  switch (field) {
    case 'position':
      return profile.position?.trim() || '등록된 정보가 없습니다'
    case 'department':
      return profile.department_name?.trim() || profile.department?.trim() || '등록된 정보가 없습니다'
    case 'phone':
      return '등록된 연락처 정보가 없습니다'
    case 'email':
      return profile.email?.trim() || '등록된 정보가 없습니다'
    case 'summary':
      return [
        `부서: ${profile.department_name?.trim() || profile.department?.trim() || '등록된 정보가 없습니다'}`,
        `직급: ${profile.position?.trim() || '등록된 정보가 없습니다'}`,
        `회사 이메일: ${profile.email?.trim() || '등록된 정보가 없습니다'}`,
        `연락처: 등록된 연락처 정보가 없습니다`,
      ].join('\n')
  }
}

async function executeEmployeeLookupFromProfiles(
  nameQuery: string,
  field: EmployeeLookupField,
): Promise<AssistantResponse> {
  let profiles: Profile[] = []
  try {
    profiles = await getProfiles()
  } catch (error) {
    console.error('[assistant] profile fallback lookup failed:', error)
    return readyResponse({
      title: '직원 정보 조회',
      message: '현재 조회 가능한 직원 디렉토리가 설정되어 있지 않습니다.',
      lines: ['관리자에게 employee_directory 설정을 요청하세요.'],
    })
  }

  if (profiles.length === 0) {
    return readyResponse({
      title: '직원 정보 조회',
      message: '현재 조회 가능한 직원 디렉토리가 설정되어 있지 않습니다.',
      lines: ['관리자에게 employee_directory 설정을 요청하세요.'],
    })
  }

  const matches = profiles.filter((profile) => profileMatchesQuery(profile, nameQuery))

  if (matches.length === 0) {
    return readyResponse({
      title: '직원 정보 조회',
      message: '조회 가능한 직원 정보를 찾지 못했습니다.',
      lines: ['이름을 확인하거나 다른 표현으로 다시 질문해보세요.'],
    })
  }

  if (matches.length > 1) {
    return buildMultipleMatchesResponse(
      nameQuery,
      matches.map((profile) => profile.full_name),
    )
  }

  const profile = matches[0]
  return buildEmployeeLookupResponse(
    profile.full_name,
    field,
    formatProfileForAssistant(profile, field),
  )
}

async function executeEmployeeLookup(
  nameQuery: string,
  field: EmployeeLookupField,
): Promise<AssistantResponse> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return unauthenticatedResponse('직원 정보 조회')
  }

  if (!nameQuery.trim()) {
    return readyResponse({
      title: '직원 정보 조회',
      message: '조회할 직원 이름을 함께 입력해주세요.',
      lines: UNKNOWN_INTENT_EXAMPLES.filter((example) => example.includes('홍길동')).map(
        (example) => `- ${example}`,
      ),
    })
  }

  const directoryResult = await executeEmployeeLookupFromDirectory(nameQuery, field)
  if (directoryResult) {
    return directoryResult
  }

  return executeEmployeeLookupFromProfiles(nameQuery, field)
}

export async function executeRuleBasedIntent(intent: DetectedRuleIntent): Promise<AssistantResponse> {
  try {
    switch (intent.type) {
      case 'GET_TODAY_MEAL':
        return await executeGetTodayMeal()
      case 'APPLY_TODAY_MEAL':
        return await executeApplyTodayMeal()
      case 'CANCEL_TODAY_MEAL':
        return await executeCancelTodayMeal()
      case 'EMPLOYEE_LOOKUP':
        return await executeEmployeeLookup(intent.nameQuery, intent.field)
      case 'LEGACY':
        return await resolveAssistantResponse(intent.intent)
      case 'UNKNOWN':
        return getUnknownIntentResponse()
    }
  } catch (error) {
    console.error('[assistant] executeRuleBasedIntent failed:', error)
    return errorResponse({
      title: 'Assistant',
      message: '요청을 처리하는 중 문제가 발생했습니다.',
      hint: '잠시 후 다시 시도해주세요.',
      lines: [],
    })
  }
}
