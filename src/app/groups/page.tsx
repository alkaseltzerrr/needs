import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

              return (
                <Link
                  key={membership.group_id}
                  href={`/groups/${membership.groups.id}`}
                  className="card-glass rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                        style={{ backgroundColor: `${membership.groups.color}22` }}
                      >
                        {membership.groups.icon}
                      </div>
                      <div>
                        <h2 className="font-pixel text-lg text-gray-800">{membership.groups.name}</h2>
                        <p className="text-xs uppercase tracking-wide text-gray-500">{membership.role}</p>
                      </div>
                    </div>
                  </div>

                  {membership.groups.description && (
                    <p className="text-sm text-gray-600">{membership.groups.description}</p>
                  )}
                </Link>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}
