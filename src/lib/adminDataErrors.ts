export function isMissingTableError(error: unknown, tableHint?: string): boolean {
  if (!error || typeof error !== 'object') return false
  const record = error as { code?: string; message?: string }
  const message = record.message ?? ''
  return (
    record.code === '42P01' ||
    record.code === 'PGRST205' ||
    Boolean(tableHint && message.includes(tableHint)) ||
    message.includes('does not exist')
  )
}

export function isPermissionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const record = error as { code?: string; message?: string }
  return record.code === '42501' || Boolean(record.message?.includes('permission'))
}

export function resolveAdminDataError(error: unknown, tableHint?: string): string {
  if (isMissingTableError(error, tableHint)) {
    return '데이터 테이블이 아직 적용되지 않았습니다. Supabase migration을 먼저 적용하세요.'
  }
  if (isPermissionError(error)) {
    return '관리자 권한이 필요합니다.'
  }
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.'
}
