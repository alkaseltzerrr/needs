import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import GroupCard from '@/components/GroupCard'

type GroupMembership = {
  group_id: string
  role: 'admin' | 'member'
  groups: {
    id: string
    name: string
    description: string | null
    icon: string
    color: string
    created_at: string
  } | null
}

type GroupNeed = {
  id: string
  group_id: string
  is_fulfilled: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
}

type GroupMemberRow = {
  group_id: string
}

export default async function GroupsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    redirect('/auth/login')
  }

  const { data: memberships } = await supabase
    .from('group_members')
    .select(
      `
      group_id,
      role,
      groups (
        id,
        name,
        description,
        icon,
        color,
        created_at
      )
    `
    )
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  const groups = (memberships ?? []) as GroupMembership[]
  const groupIds = groups.map((membership) => membership.group_id)

  let needs: GroupNeed[] = []
  let memberRows: GroupMemberRow[] = []

  if (groupIds.length > 0) {
    const [{ data: needsData }, { data: membersData }] = await Promise.all([
      supabase
        .from('needs')
        .select('id, group_id, is_fulfilled, priority, created_at')
        .in('group_id', groupIds)
        .order('created_at', { ascending: false })
        .limit(500),
      supabase
        .from('group_members')
        .select('group_id')
        .in('group_id', groupIds),
    ])

    needs = (needsData ?? []) as GroupNeed[]
    memberRows = (membersData ?? []) as GroupMemberRow[]
  }

  const statsByGroup = groupIds.reduce<
    Record<
      string,
      {
        openNeedsCount: number
        urgentNeedsCount: number
        memberCount: number
        lastActivityAt: string | null
      }
    >
  >((acc, groupId) => {
    acc[groupId] = {
      openNeedsCount: 0,
      urgentNeedsCount: 0,
      memberCount: 0,
      lastActivityAt: null,
    }
    return acc
  }, {})

  for (const need of needs) {
    const groupStats = statsByGroup[need.group_id]
    if (!groupStats) continue

    if (!need.is_fulfilled) {
      groupStats.openNeedsCount += 1
      if (need.priority === 'urgent') {
        groupStats.urgentNeedsCount += 1
      }
    }

    if (!groupStats.lastActivityAt || new Date(need.created_at) > new Date(groupStats.lastActivityAt)) {
      groupStats.lastActivityAt = need.created_at
    }
  }

  for (const memberRow of memberRows) {
    const groupStats = statsByGroup[memberRow.group_id]
    if (!groupStats) continue
    groupStats.memberCount += 1
  }

  return (
    <main className="min-h-screen bg-gradient-purple p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-pixel text-2xl text-white md:text-3xl">Your Groups</h1>
            <p className="mt-1 text-sm text-white/80">
              Jump into a group board to post or respond to needs.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-white"
          >
            Back to Dashboard
          </Link>
        </header>

        {groups.length === 0 ? (
          <section className="card-glass rounded-2xl p-8 text-center">
            <h2 className="font-pixel text-xl text-gray-800">No groups yet</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create your first group from the dashboard to start sharing needs.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {groups.map((membership) => {
              if (!membership.groups) return null

              const stats = statsByGroup[membership.group_id] || {
                openNeedsCount: 0,
                urgentNeedsCount: 0,
                memberCount: 0,
                lastActivityAt: null,
              }

              return (
                <GroupCard
                  key={membership.group_id}
                  group={membership.groups}
                  role={membership.role}
                  openNeedsCount={stats.openNeedsCount}
                  urgentNeedsCount={stats.urgentNeedsCount}
                  memberCount={stats.memberCount}
                  lastActivityAt={stats.lastActivityAt}
                />
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}
