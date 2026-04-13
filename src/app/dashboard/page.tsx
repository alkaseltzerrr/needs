import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardContent from '@/components/DashboardContent'
import type { Group, Profile } from '@/lib/supabase/database.types'

type DashboardMembership = {
  group_id: string
  role: string
  groups: Group | null
}

type DashboardNeed = {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  is_fulfilled: boolean
  created_by: string
  group_id: string
  due_date: string | null
  created_at: string
  groups: Pick<Group, 'id' | 'name' | 'color' | 'icon'> | null
  profiles: Pick<Profile, 'id' | 'display_name' | 'username'> | null
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (!user || userError) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's groups
  const { data: groups } = await supabase
    .from('group_members')
    .select(`
      group_id,
      role,
      groups (
        id,
        name,
        description,
        color,
        icon,
        created_at
      )
    `)
    .eq('user_id', user.id)

  const memberships = (groups ?? []) as DashboardMembership[]
  const groupIds = memberships.map((membership) => membership.group_id)

  let needs: DashboardNeed[] = []
  if (groupIds.length > 0) {
    const { data: needsData } = await supabase
      .from('needs')
      .select(`
        id,
        title,
        priority,
        is_fulfilled,
        created_by,
        group_id,
        due_date,
        created_at,
        groups (
          id,
          name,
          color,
          icon
        ),
        profiles!created_by (
          id,
          display_name,
          username
        )
      `)
      .in('group_id', groupIds)
      .order('created_at', { ascending: false })
      .limit(150)

    needs = (needsData ?? []) as unknown as DashboardNeed[]
  }

  const { data: helperResponses } = await supabase
    .from('need_responses')
    .select('need_id')
    .eq('user_id', user.id)
    .eq('is_helping', true)

  return (
    <DashboardContent
      profile={profile}
      groups={memberships}
      needs={needs}
      helperResponses={(helperResponses ?? []) as Array<{ need_id: string }>}
      currentUserId={user.id}
    />
  )
}