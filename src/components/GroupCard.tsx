'use client'

import { motion } from 'framer-motion'
import { Crown, Users } from 'lucide-react'
import Link from 'next/link'
import type { Group } from '@/lib/supabase/database.types'
import { formatDate } from '@/lib/utils'

interface GroupCardProps {
  group: Group
  role: 'admin' | 'member'
}

export default function GroupCard({ group, role }: GroupCardProps) {
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
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-primary-100 text-primary-700">
                  Group
                </span>
                <div className="text-xs text-gray-500 mt-1">Created {formatDate(group.created_at)}</div>
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

          {/* Group details */}
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">Open group board</span>
          </div>

          {group.description ? (
            <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
          ) : (
            <p className="text-sm text-gray-500">No description yet.</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}