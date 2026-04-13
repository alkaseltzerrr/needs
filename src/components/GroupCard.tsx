'use client'

import { motion } from 'framer-motion'
import { Users, Crown, AlertTriangle, CheckCircle2, Activity } from 'lucide-react'
import Link from 'next/link'
import type { Group } from '@/lib/supabase/database.types'
import { formatDate } from '@/lib/utils'

interface GroupCardProps {
  group: Group
  role: 'admin' | 'member'
  openNeedsCount: number
  urgentNeedsCount: number
  memberCount: number
  lastActivityAt: string | null
}

export default function GroupCard({
  group,
  role,
  openNeedsCount,
  urgentNeedsCount,
  memberCount,
  lastActivityAt,
}: GroupCardProps) {
  const status = openNeedsCount === 0 ? 'Calm' : openNeedsCount >= 4 ? 'Busy' : 'Active'
  const statusColor =
    status === 'Calm'
      ? 'bg-green-100 text-green-700'
      : status === 'Busy'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-blue-100 text-blue-700'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Link href={`/groups/${group.id}`}>
        <div className="card-glass rounded-xl p-6 hover:shadow-purple transition-all duration-200 cursor-pointer h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: `${group.color}22` }}
              >
                {group.icon}
              </div>
              <div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColor}`}>
                  {status}
                </span>
                <div className="text-xs text-gray-500 mt-1">{openNeedsCount} open</div>
              </div>
            </div>
            
            {role === 'admin' && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>

          {/* Group title */}
          <h3 className="font-pixel font-semibold text-gray-900 mb-4 leading-tight">
            {group.name}
          </h3>

          {group.description && (
            <p className="mb-4 line-clamp-2 text-sm text-gray-600">{group.description}</p>
          )}

          <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white/70 p-2">
              <div className="flex items-center gap-1 text-gray-500">
                <Users className="h-3 w-3" />
                Members
              </div>
              <p className="mt-1 font-semibold text-gray-800">{memberCount}</p>
            </div>

            <div className="rounded-lg bg-white/70 p-2">
              <div className="flex items-center gap-1 text-gray-500">
                <AlertTriangle className="h-3 w-3" />
                Urgent
              </div>
              <p className="mt-1 font-semibold text-gray-800">{urgentNeedsCount}</p>
            </div>
          </div>

          {/* Group details */}
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Created</span>
              <span className="font-medium">{formatDate(group.created_at)}</span>
            </div>

            <div className="flex justify-between">
              <span>Last activity</span>
              <span className="font-medium">{lastActivityAt ? formatDate(lastActivityAt) : 'No activity'}</span>
            </div>

            <div className="flex justify-between">
              <span>Health</span>
              <span className="inline-flex items-center gap-1 font-medium">
                {status === 'Calm' ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Activity className="h-3 w-3 text-blue-600" />}
                {status}
              </span>
            </div>
          </div>

          {openNeedsCount > 0 && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-gray-600">
                <span>Open load</span>
                <span>{Math.min(100, openNeedsCount * 20)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, openNeedsCount * 20)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}