import { supabase } from '../lib/supabase'

export type Notice = {
  id: number
  title: string
  content: string
  is_pinned: boolean
  created_at: string
}

export type AdminNotice = {
  id: number
  title: string
  content: string
  is_pinned: boolean
  is_published: boolean
  created_at: string
}

export async function getNotices(): Promise<Notice[]> {
  const { data, error } = await supabase
    .from('notices')
    .select('id, title, content, is_pinned, created_at')
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAllNotices(): Promise<AdminNotice[]> {
  const { data, error } = await supabase
    .from('notices')
    .select('id, title, content, is_pinned, is_published, created_at')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createNotice(input: { title: string; content: string }): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const { error } = await supabase.from('notices').insert({
    title: input.title,
    content: input.content,
    author_id: user.id,
  })

  if (error) throw new Error(error.message)
}

export async function updateNotice(
  id: number,
  input: { title: string; content: string },
): Promise<void> {
  const { error } = await supabase
    .from('notices')
    .update({ title: input.title, content: input.content })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function deleteNotice(id: number): Promise<void> {
  const { error } = await supabase.from('notices').delete().eq('id', id)
  if (error) throw error
}

export async function setNoticePinned(id: number, isPinned: boolean): Promise<void> {
  const { error } = await supabase.from('notices').update({ is_pinned: isPinned }).eq('id', id)
  if (error) throw error
}

export async function setNoticePublished(id: number, isPublished: boolean): Promise<void> {
  const { error } = await supabase
    .from('notices')
    .update({ is_published: isPublished })
    .eq('id', id)

  if (error) throw error
}
