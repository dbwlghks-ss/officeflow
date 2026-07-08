import { resolveAssistantResponse } from '../../lib/assistantIntent'
import {
  toAssistantEmployeeFromDirectory,
  toAssistantEmployeeFromProfile,
  toAssistantMealMenuPayload,
} from '../../lib/assistantResponsePayload'
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
import { applyTodayMeal, cancelTodayMeal } from '../../services/mealActionService'
import {
  getTodayLunchService,
} from '../../services/mealService'
import { getProfiles, type Profile } from '../../services/userService'
import { UNKNOWN_INTENT_EXAMPLES } from './assistantIntent'
import type { DetectedRuleIntent, EmployeeLookupField } from './assistantTypes'

export { ASSISTANT_DATA_UPDATED_EVENT, notifyAssistantDataUpdated } from '../../lib/assistantDataEvents'

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
    kind: 'generic',
  }
}

export function getUnknownIntentResponse(): AssistantResponse {
  return readyResponse({
    title: '요청을 이해하지 못했습니다',
    message: '아직 이해하지 못한 요청입니다. 아래처럼 질문해보세요.',
    lines: [],
    kind: 'unknown',
    unknown: {
      suggestions: [
        ...UNKNOWN_INTENT_EXAMPLES,
        '읽지 않은 공지 보여줘',
      ],
    },
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
    kind: 'generic',
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
      kind: 'meal',
      mealMenu: toAssistantMealMenuPayload(menuResult.menu),
      action: { label: '식수 페이지 보기', path: '/meal' },
    })
  }

  if (menuResult.status === 'unavailable') {
    return readyResponse({
      title: '오늘 점심 메뉴',
      message: '식단 데이터가 아직 연결되지 않았습니다.',
      lines: [],
      kind: 'meal',
      mealMenu: {
        menuDate: '',
        mealType: 'lunch',
        cafeteria: '',
        items: [],
        note: null,
        calories: null,
        unavailable: true,
      },
      action: { label: '식수 페이지 보기', path: '/meal' },
    })
  }

  const todayService = await getTodayLunchService()
  if (!todayService) {
    return readyResponse({
      title: '오늘 점심 메뉴',
      message: '오늘 등록된 식단 정보가 없습니다.',
      lines: [],
      kind: 'meal',
      mealMenu: {
        menuDate: '',
        mealType: 'lunch',
        cafeteria: '',
        items: [],
        note: null,
        calories: null,
        empty: true,
      },
      action: { label: '식수 페이지 보기', path: '/meal' },
    })
  }

  return readyResponse({
    title: '오늘 점심 메뉴',
    message: '오늘 등록된 식단 정보가 없습니다.',
    lines: [],
    kind: 'meal',
    mealMenu: {
      menuDate: todayService.service_date,
      mealType: todayService.meal_type,
      cafeteria: '',
      items: [],
      note: null,
      calories: null,
      empty: true,
    },
    action: { label: '식수 페이지 보기', path: '/meal' },
  })
}

async function executeApplyTodayMeal(): Promise<AssistantResponse> {
  const result = await applyTodayMeal()

  if (!result.ok) {
    if (result.reason === 'unauthenticated') {
      return unauthenticatedResponse('오늘 식수 신청')
    }
    if (result.reason === 'already_applied') {
      return readyResponse({
        title: '오늘 식수 신청',
        message: result.message,
        lines: [],
        kind: 'meal_action',
        mealAction: { action: 'already_applied' },
      })
    }
    return errorResponse({
      title: '오늘 식수 신청',
      message: result.message,
      lines: [],
      kind: 'meal_action',
      mealAction: { action: 'error' },
      action: result.reason === 'no_service' ? { label: '식수 페이지 보기', path: '/meal' } : undefined,
    })
  }

  return readyResponse({
    title: '오늘 식수 신청',
    message: result.message,
    lines: [],
    kind: 'meal_action',
    mealAction: { action: 'applied' },
  })
}

async function executeCancelTodayMeal(): Promise<AssistantResponse> {
  const result = await cancelTodayMeal()

  if (!result.ok) {
    if (result.reason === 'unauthenticated') {
      return unauthenticatedResponse('오늘 식수 취소')
    }
    return errorResponse({
      title: '오늘 식수 취소',
      message: result.message,
      lines: [],
      kind: 'meal_action',
      mealAction: { action: 'error' },
      action: result.reason === 'no_service' ? { label: '식수 페이지 보기', path: '/meal' } : undefined,
    })
  }

  return readyResponse({
    title: '오늘 식수 취소',
    message: result.message,
    lines: [],
    kind: 'meal_action',
    mealAction: { action: 'cancelled' },
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
  employee: ReturnType<typeof toAssistantEmployeeFromDirectory>,
  field: EmployeeLookupField,
  value: string,
): AssistantResponse {
  if (field === 'summary') {
    return readyResponse({
      title: `${employee.name} 사원 정보`,
      message: `${employee.name} 사원 정보입니다.`,
      lines: [],
      kind: 'employee',
      employee: { employees: [employee] },
    })
  }

  return readyResponse({
    title: `${employee.name} ${fieldLabel(field)}`,
    message: `${employee.name} 사원의 ${fieldLabel(field)} 정보입니다.`,
    lines: [`${fieldLabel(field)}: ${value}`],
    kind: 'employee',
    employee: { employees: [employee] },
  })
}

function buildMultipleMatchesResponse(
  nameQuery: string,
  employees: ReturnType<typeof toAssistantEmployeeFromDirectory>[],
): AssistantResponse {
  return readyResponse({
    title: '직원 정보 조회',
    message: `"${nameQuery}" 검색 결과가 ${employees.length}건 있습니다. 더 구체적으로 입력해주세요.`,
    lines: [],
    kind: 'employee',
    employee: { employees, query: nameQuery },
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
      lines: [],
      kind: 'employee',
      employee: { employees: [], empty: true },
    })
  }

  const matches = findBestEmployeeMatch(result.employees, nameQuery)

  if (matches.length === 0) {
    return readyResponse({
      title: '직원 정보 조회',
      message: '조회 가능한 직원 정보를 찾지 못했습니다.',
      lines: [],
      kind: 'employee',
      employee: { employees: [], empty: true },
    })
  }

  if (matches.length > 1) {
    return buildMultipleMatchesResponse(
      nameQuery,
      matches.map((employee) => toAssistantEmployeeFromDirectory(employee)),
    )
  }

  const employee = matches[0]
  return buildEmployeeLookupResponse(
    toAssistantEmployeeFromDirectory(employee),
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
      kind: 'employee',
      employee: { employees: [], empty: true },
    })
  }

  if (profiles.length === 0) {
    return readyResponse({
      title: '직원 정보 조회',
      message: '현재 조회 가능한 직원 디렉토리가 설정되어 있지 않습니다.',
      lines: ['관리자에게 employee_directory 설정을 요청하세요.'],
      kind: 'employee',
      employee: { employees: [], empty: true },
    })
  }

  const matches = profiles.filter((profile) => profileMatchesQuery(profile, nameQuery))

  if (matches.length === 0) {
    return readyResponse({
      title: '직원 정보 조회',
      message: '조회 가능한 직원 정보를 찾지 못했습니다.',
      lines: [],
      kind: 'employee',
      employee: { employees: [], empty: true },
    })
  }

  if (matches.length > 1) {
    return buildMultipleMatchesResponse(
      nameQuery,
      matches.map((profile) => toAssistantEmployeeFromProfile(profile)),
    )
  }

  const profile = matches[0]
  const employee = toAssistantEmployeeFromProfile(profile)
  return buildEmployeeLookupResponse(
    employee,
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
      lines: [],
      kind: 'unknown',
      unknown: {
        suggestions: UNKNOWN_INTENT_EXAMPLES.filter((example) => example.includes('홍길동')),
      },
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
      kind: 'generic',
    })
  }
}
