'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Heart, Bell, LogOut, Settings } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-primary-500 animate-pulse" />
              <h1 className="font-pixel text-xl text-primary-600">Needs</h1>
            </div>

            <nav className="flex items-center gap-4">
              <Link href="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
              <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-display font-semibold text-gray-800">
                  Welcome back, {profile?.display_name}! 👋
                </h2>
                <p className="text-gray-600 mt-2 font-cute">{cuteMessage}</p>
              </div>
              <NeedinessIndicator level={profile?.neediness_level || 0} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-r from-primary-100 to-primary-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{needinessLevel.emoji}</span>
                  <div>
                    <p className="text-sm text-gray-600 font-cute">Current Mood</p>
                    <p className="font-display font-semibold text-gray-800">{needinessLevel.label}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-secondary-100 to-secondary-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-secondary-600" />
                  <div>
                    <p className="text-sm text-gray-600 font-cute">Groups</p>
                    <p className="font-display font-semibold text-gray-800">{groups.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-accent-100 to-accent-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-8 h-8 text-accent-600" />
                  <div>
                    <p className="text-sm text-gray-600 font-cute">Needs Helped</p>
                    <p className="font-display font-semibold text-gray-800">0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Groups Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-semibold text-gray-800">Your Groups</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl font-cute hover:bg-primary-600 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Group
            </motion.button>
          </div>

          {groups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100"
            >
              <div className="max-w-md mx-auto">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-display font-medium text-gray-700 mb-2">
                  No groups yet!
                </h4>
                <p className="text-gray-500 font-cute mb-6">
                  Create or join a group to start sharing your needs with people who care.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateGroup(true)}
                  className="bg-gradient-to-r from-primary-400 to-primary-500 text-white px-6 py-3 rounded-xl font-display font-medium shadow-lg"
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
      </main>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}
    </div>
  )
}