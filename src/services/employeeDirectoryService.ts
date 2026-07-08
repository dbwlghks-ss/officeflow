import { supabase } from '../lib/supabase'
import type { EmployeeLookupField } from '../features/assistant/assistantTypes'

export type EmployeeDirectoryEntry = {
  id: string
  name: string
  department: string | null
  position: string | null
  work_email: string | null
  extension: string | null
  work_phone: string | null
  is_active: boolean
}

export type EmployeeDirectoryQueryResult =
  | { status: 'ok'; employees: EmployeeDirectoryEntry[] }
  | { status: 'unavailable'; reason: 'missing_table' | 'permission' | 'error' }
  | { status: 'empty' }

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const record = error as { code?: string; message?: string }
  return (
    record.code === '42P01' ||
    record.code === 'PGRST205' ||
    Boolean(record.message?.includes('employee_directory')) ||
    Boolean(record.message?.includes('does not exist'))
  )
}

export async function searchEmployees(query: string): Promise<EmployeeDirectoryQueryResult> {
  const trimmed = query.trim()
  if (!trimmed) return { status: 'empty' }

  const safeQuery = trimmed.replace(/[,()]/g, ' ').trim()
  const pattern = `%${safeQuery}%`

  const { data, error } = await supabase
    .from('employee_directory')
    .select('id, name, department, position, work_email, extension, work_phone, is_active')
    .eq('is_active', true)
    .or(`name.ilike.${pattern},department.ilike.${pattern},position.ilike.${pattern},work_email.ilike.${pattern}`)
    .order('name', { ascending: true })
    .limit(10)

  if (error) {
    if (isMissingTableError(error)) {
      return { status: 'unavailable', reason: 'missing_table' }
    }
    if (error.code === '42501' || error.message?.includes('permission')) {
      return { status: 'unavailable', reason: 'permission' }
    }
    console.error('[employeeDirectory] search failed:', error)
    return { status: 'unavailable', reason: 'error' }
  }

  const employees = (data ?? []) as EmployeeDirectoryEntry[]
  if (employees.length === 0) return { status: 'empty' }
  return { status: 'ok', employees }
}

export function findBestEmployeeMatch(
  employees: EmployeeDirectoryEntry[],
  nameQuery: string,
): EmployeeDirectoryEntry[] {
  const normalized = nameQuery.trim().toLowerCase()
  if (!normalized) return employees

  const exact = employees.filter((employee) => employee.name.toLowerCase() === normalized)
  if (exact.length > 0) return exact

  const partial = employees.filter((employee) => employee.name.toLowerCase().includes(normalized))
  if (partial.length > 0) return partial

  return employees.filter((employee) => normalized.includes(employee.name.toLowerCase()))
}

export function formatEmployeePhone(employee: EmployeeDirectoryEntry): string {
  const parts: string[] = []
  if (employee.extension?.trim()) parts.push(`내선 ${employee.extension.trim()}`)
  if (employee.work_phone?.trim()) parts.push(employee.work_phone.trim())
  if (parts.length === 0) return '등록된 연락처 정보가 없습니다.'
  return parts.join(' · ')
}

export function formatEmployeeForAssistant(
  employee: EmployeeDirectoryEntry,
  field: EmployeeLookupField,
): string {
  switch (field) {
    case 'position':
      return employee.position?.trim() || '등록된 정보가 없습니다'
    case 'department':
      return employee.department?.trim() || '등록된 정보가 없습니다'
    case 'phone':
      return formatEmployeePhone(employee)
    case 'email':
      return employee.work_email?.trim() || '등록된 정보가 없습니다'
    case 'summary':
      return [
        `부서: ${employee.department?.trim() || '등록된 정보가 없습니다'}`,
        `직급: ${employee.position?.trim() || '등록된 정보가 없습니다'}`,
        `회사 이메일: ${employee.work_email?.trim() || '등록된 정보가 없습니다'}`,
        `연락처: ${formatEmployeePhone(employee)}`,
      ].join('\n')
  }
}
