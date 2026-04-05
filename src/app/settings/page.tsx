import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/database.types'

type SettingsProfile = Pick<Profile, 'username' | 'display_name' | 'avatar_url' | 'neediness_level'>

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, neediness_level')
    .eq('id', user.id)
    .single()

  const userProfile = profile as SettingsProfile | null

  return (
    <main className="min-h-screen bg-gradient-purple p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-pixel text-2xl text-white md:text-3xl">Settings</h1>
            <p className="mt-1 text-sm text-white/80">Your account snapshot.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-white"
          >
            Back to Dashboard
          </Link>
        </header>

        <section className="card-glass rounded-2xl p-6">
          <h2 className="mb-4 font-pixel text-lg text-gray-800">Profile</h2>

          <dl className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <dt className="text-gray-500">Email</dt>
              <dd>{user.email}</dd>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <dt className="text-gray-500">Username</dt>
              <dd>{userProfile?.username ?? '-'}</dd>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <dt className="text-gray-500">Display Name</dt>
              <dd>{userProfile?.display_name ?? '-'}</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Neediness Level</dt>
              <dd>{userProfile?.neediness_level ?? 0}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  )
}
