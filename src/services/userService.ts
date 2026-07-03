import { supabase } from '../lib/supabase'

export type ProfileRole = 'employee' | 'admin'

export type Profile = {
  id: string
  full_name: string
  email: string
  role: ProfileRole
  is_active: boolean
  department: { name: string } | null
}

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, department:departments(name)')
    .order('full_name', { ascending: true })

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
