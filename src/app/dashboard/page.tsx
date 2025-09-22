import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardContent from '@/components/DashboardContent'

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

  return <DashboardContent profile={profile} groups={groups || []} />
}