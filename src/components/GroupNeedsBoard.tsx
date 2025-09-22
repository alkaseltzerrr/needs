'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Users, Filter } from 'lucide-react'
import Link from 'next/link'
import type { Group, Need, Profile, NeedResponse } from '@/lib/supabase/database.types'
import NeedCard from './NeedCard'
import CreateNeedModal from './CreateNeedModal'
import MembersModal from './MembersModal'
import { NEED_CATEGORIES, NEED_PRIORITIES } from '@/lib/utils'

interface GroupNeedsBoardProps {
  group: Group
  needs: Array<Need & { 
    profiles: Profile | null
    need_responses: NeedResponse[]
  }>
  members: Array<{
    role: string
    profiles: Profile | null
  }>
  currentUserRole: 'admin' | 'member'
  currentUserId: string
}

export default function GroupNeedsBoard({ 
  group, 
  needs, 
  members, 
  currentUserRole,
  currentUserId 
}: GroupNeedsBoardProps) {
  const [showCreateNeed, setShowCreateNeed] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [filterFulfilled, setFilterFulfilled] = useState<boolean | null>(null)

  // Apply filters
  const filteredNeeds = needs.filter(need => {
    if (filterCategory && need.category !== filterCategory) return false
    if (filterPriority && need.priority !== filterPriority) return false
    if (filterFulfilled !== null && need.is_fulfilled !== filterFulfilled) return false
    return true
  })

  // Group needs by status
  const activeNeeds = filteredNeeds.filter(n => !n.is_fulfilled)
  const fulfilledNeeds = filteredNeeds.filter(n => n.is_fulfilled)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: group.color + '20' }}
                >
                  {group.icon}
                </div>
                <div>
                  <h1 className="font-display font-semibold text-lg text-gray-800">
                    {group.name}
                  </h1>
                  {group.description && (
                    <p className="text-xs text-gray-500 font-cute">{group.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMembers(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-cute text-sm hover:bg-gray-200 transition-colors"
              >
                <Users className="w-4 h-4" />
                {members.length} members
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateNeed(true)}
                className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl font-cute hover:bg-primary-600 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Need
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-display font-medium text-gray-700">Filters</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <select
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value || null)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-cute focus:border-primary-400 focus:outline-none"
            >
              <option value="">All Categories</option>
              {Object.entries(NEED_CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.icon} {value.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority || ''}
              onChange={(e) => setFilterPriority(e.target.value || null)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-cute focus:border-primary-400 focus:outline-none"
            >
              <option value="">All Priorities</option>
              {Object.entries(NEED_PRIORITIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.icon} {value.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterFulfilled === null ? '' : filterFulfilled.toString()}
              onChange={(e) => setFilterFulfilled(e.target.value === '' ? null : e.target.value === 'true')}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-cute focus:border-primary-400 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="false">Active</option>
              <option value="true">Fulfilled</option>
            </select>

            {/* Clear Filters */}
            {(filterCategory || filterPriority || filterFulfilled !== null) && (
              <button
                onClick={() => {
                  setFilterCategory(null)
                  setFilterPriority(null)
                  setFilterFulfilled(null)
                }}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-cute hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Needs */}
        <div className="mb-8">
          <h2 className="text-xl font-display font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>Active Needs</span>
            <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-lg text-sm font-cute">
              {activeNeeds.length}
            </span>
          </h2>
          
          {activeNeeds.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100"
            >
              <p className="text-gray-500 font-cute">No active needs at the moment 🌟</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeNeeds.map((need) => (
                <NeedCard
                  key={need.id}
                  need={need}
                  currentUserId={currentUserId}
                  groupId={group.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Fulfilled Needs */}
        {fulfilledNeeds.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>Fulfilled Needs</span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-sm font-cute">
                {fulfilledNeeds.length}
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
              {fulfilledNeeds.map((need) => (
                <NeedCard
                  key={need.id}
                  need={need}
                  currentUserId={currentUserId}
                  groupId={group.id}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateNeed && (
        <CreateNeedModal 
          groupId={group.id}
          onClose={() => setShowCreateNeed(false)} 
        />
      )}
      
      {showMembers && (
        <MembersModal
          members={members}
          groupId={group.id}
          currentUserRole={currentUserRole}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  )
}