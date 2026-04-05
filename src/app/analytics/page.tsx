import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Need } from '@/lib/supabase/database.types'

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    redirect('/auth/login')
  }

  const { data: needs } = await supabase
    .from('needs')
    .select('id, is_fulfilled, priority')
    .eq('created_by', user.id)

  const allNeeds = (needs ?? []) as Array<Pick<Need, 'id' | 'is_fulfilled' | 'priority'>>
  const fulfilledCount = allNeeds.filter((need) => need.is_fulfilled).length
  const activeCount = allNeeds.length - fulfilledCount
  const urgentCount = allNeeds.filter((need) => need.priority === 'urgent' && !need.is_fulfilled).length

  return (
    <main className="min-h-screen bg-gradient-purple p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-pixel text-2xl text-white md:text-3xl">Analytics</h1>
            <p className="mt-1 text-sm text-white/80">A quick view of your current need activity.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-white"
          >
            Back to Dashboard
          </Link>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card-glass rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total Needs</p>
            <p className="mt-2 font-pixel text-3xl text-gray-800">{allNeeds.length}</p>
          </div>

          <div className="card-glass rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Active Needs</p>
            <p className="mt-2 font-pixel text-3xl text-gray-800">{activeCount}</p>
          </div>

          <div className="card-glass rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Urgent Open Needs</p>
            <p className="mt-2 font-pixel text-3xl text-gray-800">{urgentCount}</p>
          </div>
        </section>
      </div>
    </main>
  )
}
