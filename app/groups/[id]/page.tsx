import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import GroupNeedsBoard from '@/components/GroupNeedsBoard'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GroupPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (!user || userError) {
    redirect('/auth/login')
  }

  // Check if user is a member of the group
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    notFound()
  }

  // Get group details
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single()

  if (!group) {
    notFound()
  }

  // Get group members with profiles
  const { data: members } = await supabase
    .from('group_members')
    .select(`
      role,
      profiles (
        id,
        username,
        display_name,
        avatar_url,
        neediness_level
      )
    `)
    .eq('group_id', id)

  // Get group needs with creator profiles
  const { data: needs } = await supabase
    .from('needs')
    .select(`
      *,
      profiles!created_by (
        id,
        username,
        display_name,
        avatar_url,
        neediness_level
      ),
      need_responses (
        id,
        user_id,
        message,
        is_helping,
        created_at
      )
    `)
    .eq('group_id', id)
    .order('created_at', { ascending: false })

  return (
    <GroupNeedsBoard 
      group={group}
      needs={needs || []}
      members={members || []}
      currentUserRole={membership.role as 'admin' | 'member'}
      currentUserId={user.id}
    />
  )
}