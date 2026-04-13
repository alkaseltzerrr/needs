'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Heart, Bell, LogOut, Settings, TrendingUp, AlertTriangle, CheckCircle2, ArrowUpRight, Search, Command } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getNeedinessLevel, getRandomCuteMessage, NEED_PRIORITIES } from '@/lib/utils'
import type { Profile, Group } from '@/lib/supabase/database.types'
import NeedinessIndicator from './NeedinessIndicator'
import CreateGroupModal from './CreateGroupModal'

interface DashboardContentProps {
  profile: Profile | null
  groups: Array<{
    group_id: string
    role: string
    groups: Group | null
  }>
  needs: Array<{
    id: string
    title: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    is_fulfilled: boolean
    created_by: string
    group_id: string
    due_date: string | null
    created_at: string
    groups: {
      id: string
      name: string
      color: string
      icon: string
    } | null
    profiles: {
      id: string
      display_name: string
      username: string
    } | null
  }>
  helperResponses: Array<{ need_id: string }>
  currentUserId: string
}

export default function DashboardContent({
  profile,
  groups,
  needs,
  helperResponses,
  currentUserId,
}: DashboardContentProps) {
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const needinessLevel = getNeedinessLevel(profile?.neediness_level || 0)
  const cuteMessage = getRandomCuteMessage()
  const openNeeds = needs.filter((need) => !need.is_fulfilled)
  const urgentNeeds = openNeeds.filter((need) => need.priority === 'urgent')
  const myOpenNeeds = openNeeds.filter((need) => need.created_by === currentUserId)
  const helperNeedIds = new Set(helperResponses.map((response) => response.need_id))
  const helpingOpenNeeds = openNeeds.filter(
    (need) => helperNeedIds.has(need.id) && need.created_by !== currentUserId
  )
  const recentUrgentNeeds = urgentNeeds
    .filter((need) => need.created_by !== currentUserId)
    .slice(0, 5)
  const openNeedsByGroup = openNeeds.reduce<Record<string, number>>((acc, need) => {
    acc[need.group_id] = (acc[need.group_id] || 0) + 1
    return acc
  }, {})

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []

    const groupResults = groups
      .filter((membership) => membership.groups)
      .map((membership) => {
        const group = membership.groups!
        return {
          id: `group-${membership.group_id}`,
          kind: 'group' as const,
          title: group.name,
          subtitle: group.description || `${membership.role} group`,
          href: `/groups/${membership.group_id}`,
          priority: null,
        }
      })
      .filter((item) =>
        `${item.title} ${item.subtitle}`.toLowerCase().includes(query)
      )

    const needResults = openNeeds
      .map((need) => ({
        id: `need-${need.id}`,
        kind: 'need' as const,
        title: need.title,
        subtitle: `${need.groups?.name || 'Group'} • ${need.profiles?.display_name || need.profiles?.username || 'Member'}`,
        href: `/groups/${need.group_id}`,
        priority: need.priority,
      }))
      .filter((item) =>
        `${item.title} ${item.subtitle}`.toLowerCase().includes(query)
      )

    return [...needResults, ...groupResults].slice(0, 10)
  }, [groups, openNeeds, searchQuery])

  const handleOpenSearch = () => {
    setShowSearch(true)
  }

  const handleCloseSearch = () => {
    setShowSearch(false)
    setSearchQuery('')
  }

  const handleSelectSearchResult = (href: string) => {
    handleCloseSearch()
    router.push(href)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMetaShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'
      if (isMetaShortcut) {
        event.preventDefault()
        setShowSearch(true)
      }

      if (event.key === 'Escape') {
        setShowSearch(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-purple">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="sidebar-glass hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64">
          <div className="relative h-full p-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-purple-light rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="font-pixel text-lg font-bold text-gray-800">Needs</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-100 text-primary-700 text-sm">
                <Heart className="w-4 h-4" />
                Dashboard
              </Link>
              
              <Link href="/groups" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm transition-colors">
                <Users className="w-4 h-4" />
                Groups
              </Link>
              
              <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm transition-colors">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </Link>
              
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </nav>

            {/* Bottom section */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-primary-50 rounded-lg p-4 mb-4">
                <div className="text-xs text-primary-600 font-medium mb-1">Get the extension</div>
                <div className="text-xs text-primary-700 mb-2">Install Now</div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                  <span className="text-sm text-gray-600">Needs</span>
                  <span className="text-sm text-gray-400">/</span>
                  <span className="text-sm font-medium text-gray-900">Dashboard</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenSearch}
                    className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Search className="h-4 w-4" />
                    Search
                    <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-500">
                      <Command className="h-3 w-3" />K
                    </span>
                  </button>

                  <button aria-label="Open notifications" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
              </div>

              <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden" aria-label="Mobile dashboard navigation">
                <button
                  type="button"
                  onClick={handleOpenSearch}
                  className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm text-gray-700 border border-gray-200"
                >
                  Search
                </button>
                <Link href="/dashboard" className="shrink-0 rounded-lg bg-primary-100 px-3 py-1.5 text-sm text-primary-700">
                  Dashboard
                </Link>
                <Link href="/groups" className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm text-gray-700 border border-gray-200">
                  Groups
                </Link>
                <Link href="/analytics" className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm text-gray-700 border border-gray-200">
                  Analytics
                </Link>
                <Link href="/settings" className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm text-gray-700 border border-gray-200">
                  Settings
                </Link>
              </nav>
            </div>
          </header>

          <div className="p-4 sm:p-6">
            {/* Welcome */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="mb-6 flex flex-col gap-4 rounded-2xl card-glass p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-pixel font-bold text-gray-900 sm:text-3xl">
                    Hi, {profile?.display_name || profile?.username || 'friend'}
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">{cuteMessage}</p>
                </div>
                <NeedinessIndicator level={profile?.neediness_level || 0} />
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-2">
                <Link href="/groups" className="rounded-lg bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                  Open groups
                </Link>
                <Link href="/analytics" className="rounded-lg bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                  View analytics
                </Link>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-purple-light px-4 py-2 text-sm text-white shadow-purple"
                >
                  <Plus className="h-4 w-4" />
                  Create group
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card-glass rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">My Open Needs</h3>
                      <div className="text-2xl font-bold text-gray-900">{myOpenNeeds.length}</div>
                      <p className="mt-1 text-xs text-gray-500">Needs waiting for support</p>
                    </div>
                    <Heart className="h-6 w-6 text-primary-500" />
                  </div>
                </div>

                <div className="card-glass rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Help I Offered</h3>
                      <div className="text-2xl font-bold text-gray-900">{helpingOpenNeeds.length}</div>
                      <p className="mt-1 text-xs text-gray-500">Needs still open after your response</p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                </div>

                <div className="card-glass rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Urgent Queue</h3>
                      <div className="text-2xl font-bold text-gray-900">{urgentNeeds.length}</div>
                      <p className="mt-1 text-xs text-gray-500">Urgent needs across your groups</p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="card-glass rounded-2xl p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-pixel text-lg text-gray-900">Urgent Queue</h3>
                  <span className="rounded-lg bg-red-100 px-2 py-1 text-xs text-red-700">{recentUrgentNeeds.length}</span>
                </div>

                {recentUrgentNeeds.length === 0 ? (
                  <p className="text-sm text-gray-600">No urgent needs right now.</p>
                ) : (
                  <div className="space-y-3">
                    {recentUrgentNeeds.map((need) => (
                      <Link
                        key={need.id}
                        href={`/groups/${need.group_id}`}
                        className="block rounded-xl border border-gray-200 bg-white/80 p-3 transition-colors hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">{need.title}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              {need.groups?.icon} {need.groups?.name} • {need.profiles?.display_name || need.profiles?.username}
                            </p>
                          </div>
                          <span className={`rounded-md px-2 py-0.5 text-xs ${NEED_PRIORITIES[need.priority].color}`}>
                            {NEED_PRIORITIES[need.priority].label}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Opened {formatDate(need.created_at)}
                          {need.due_date ? ` • Due ${formatDate(need.due_date)}` : ''}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section className="card-glass rounded-2xl p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-pixel text-lg text-gray-900">Group Health</h3>
                  <span className="rounded-lg bg-primary-100 px-2 py-1 text-xs text-primary-700">{groups.length} groups</span>
                </div>

                {groups.length === 0 ? (
                  <p className="text-sm text-gray-600">Create first group to start sharing needs.</p>
                ) : (
                  <div className="space-y-3">
                    {groups.map((groupMember) => {
                      if (!groupMember.groups) return null

                      const openCount = openNeedsByGroup[groupMember.group_id] || 0
                      const isBusy = openCount >= 4

                      return (
                        <Link
                          key={groupMember.group_id}
                          href={`/groups/${groupMember.group_id}`}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 p-3 transition-colors hover:bg-white"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {groupMember.groups.icon} {groupMember.groups.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">{groupMember.role} • {openCount} open needs</p>
                          </div>
                          <span className={`rounded-md px-2 py-0.5 text-xs ${isBusy ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {isBusy ? 'Busy' : 'Stable'}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>

            <section className="mt-6 card-glass rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-pixel text-lg text-gray-900">Open Needs Snapshot</h3>
                <Link href="/groups" className="inline-flex items-center gap-1 text-xs text-primary-700 hover:text-primary-800">
                  View all
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              {openNeeds.length === 0 ? (
                <p className="text-sm text-gray-600">No open needs in your groups.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {openNeeds.slice(0, 6).map((need) => (
                    <Link
                      key={need.id}
                      href={`/groups/${need.group_id}`}
                      className="rounded-xl border border-gray-200 bg-white/80 p-3 transition-colors hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-2 text-sm font-medium text-gray-900">{need.title}</p>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs ${NEED_PRIORITIES[need.priority].color}`}>
                          {NEED_PRIORITIES[need.priority].label}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {need.groups?.icon} {need.groups?.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">Opened {formatDate(need.created_at)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
            </div>
          </div>
        </main>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}

      {showSearch && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20"
          onClick={handleCloseSearch}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-gray-100 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && searchResults.length > 0) {
                      event.preventDefault()
                      handleSelectSearchResult(searchResults[0].href)
                    }
                  }}
                  placeholder="Search groups or open needs"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none focus:border-primary-400"
                />
              </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-3">
              {searchQuery.trim() === '' ? (
                <p className="px-2 py-3 text-sm text-gray-500">Type to search. Press Enter to open first result.</p>
              ) : searchResults.length === 0 ? (
                <p className="px-2 py-3 text-sm text-gray-500">No matches for "{searchQuery}".</p>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(result.href)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{result.title}</p>
                        <p className="truncate text-xs text-gray-500">{result.kind} • {result.subtitle}</p>
                      </div>

                      {result.priority && (
                        <span className={`ml-3 shrink-0 rounded-md px-2 py-0.5 text-xs ${NEED_PRIORITIES[result.priority].color}`}>
                          {NEED_PRIORITIES[result.priority].label}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}