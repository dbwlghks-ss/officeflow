import { supabase } from '../lib/supabase'

export type ProfileRole = 'employee' | 'admin'

export type Profile = {
  id: string
  full_name: string
  email: string
  role: ProfileRole
  is_active: boolean
  position: string | null
  department: string | null
  department_name: string | null
}

// 이메일 인증(auth.users.email_confirmed_at)이 완료된 사용자만 반환한다.
// auth.users 조인이 필요하므로 SECURITY DEFINER RPC 를 통해 조회한다.
export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.rpc('get_confirmed_profiles')

  if (error) throw error
  return (data ?? []) as unknown as Profile[]
}

export async function updateProfileRole(id: string, role: ProfileRole): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) throw error
}

export async function updateProfileActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}
