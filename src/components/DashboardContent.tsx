'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Heart, Bell, LogOut, Settings, Search, Filter, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getNeedinessLevel, getRandomCuteMessage } from '@/lib/utils'
import type { Profile, Group } from '@/lib/supabase/database.types'
import NeedinessIndicator from './NeedinessIndicator'
import GroupCard from './GroupCard'
import CreateGroupModal from './CreateGroupModal'

interface DashboardContentProps {
  profile: Profile | null
  groups: Array<{
    group_id: string
    role: string
    groups: Group | null
  }>
}

export default function DashboardContent({ profile, groups }: DashboardContentProps) {
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const needinessLevel = getNeedinessLevel(profile?.neediness_level || 0)
  const cuteMessage = getRandomCuteMessage()

  return (
    <div className="min-h-screen bg-gradient-purple">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 h-screen sticky top-0 sidebar-glass">
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-purple-light rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="font-pixel text-lg font-bold text-gray-800">Needs</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Favorites
              </div>
              
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

              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 mt-6">
                Main Menu
              </div>
              
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm transition-colors">
                <Heart className="w-4 h-4" />
                Dashboard
              </Link>
              
              <Link href="/groups" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm transition-colors">
                <Users className="w-4 h-4" />
                Groups
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
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Groups / </span>
                  <span className="text-sm font-medium text-gray-900">Analytics</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">⌘K</kbd>
                  </div>
                  
                  <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Revenue Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-pixel font-bold text-gray-900 mb-2">
                Your total revenue
              </h1>
              <div className="text-4xl font-bold gradient-text mb-6">
                $90,239.00
              </div>

              <div className="flex items-center gap-2 mb-6">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  <Calendar className="w-4 h-4" />
                  Select Dates
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card-glass rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">New subscriptions</h3>
                      <div className="text-2xl font-bold text-gray-900">22</div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-success-600">↗ 15%</span>
                        <span className="text-gray-500">compared to last week</span>
                      </div>
                    </div>
                    <div className="w-16 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded opacity-20"></div>
                  </div>
                </div>

                <div className="card-glass rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">New orders</h3>
                      <div className="text-2xl font-bold text-gray-900">320</div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-warning-600">↘ 4%</span>
                        <span className="text-gray-500">compared to last week</span>
                      </div>
                    </div>
                    <div className="w-16 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded opacity-20"></div>
                  </div>
                </div>

                <div className="card-glass rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Avg. order revenue</h3>
                      <div className="text-2xl font-bold text-gray-900">$1,080</div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-success-600">↗ 8%</span>
                        <span className="text-gray-500">compared to last week</span>
                      </div>
                    </div>
                    <div className="w-16 h-12 bg-gradient-to-r from-purple-400 to-pink-600 rounded opacity-20"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Groups Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-pixel font-bold text-gray-900">Recent campaigns</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateGroup(true)}
                  className="flex items-center gap-2 bg-gradient-purple-light text-white px-4 py-2 rounded-lg text-sm shadow-purple transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add campaign
                </motion.button>
              </div>

              {groups.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card-glass rounded-xl p-12 text-center"
                >
                  <div className="max-w-md mx-auto">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-pixel font-medium text-gray-700 mb-2">
                      No groups yet!
                    </h4>
                    <p className="text-gray-500 text-sm mb-6">
                      Create or join a group to start sharing your needs with people who care.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCreateGroup(true)}
                      className="bg-gradient-purple-light text-white px-6 py-3 rounded-xl font-pixel font-medium shadow-purple"
                    >
                      Create Your First Group
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((groupMember) => (
                    groupMember.groups && (
                      <GroupCard
                        key={groupMember.group_id}
                        group={groupMember.groups}
                        role={groupMember.role as 'admin' | 'member'}
                      />
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}
    </div>
  )
}