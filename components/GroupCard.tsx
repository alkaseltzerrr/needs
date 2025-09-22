'use client'

import { motion } from 'framer-motion'
import { Users, Crown, Calendar } from 'lucide-react'
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
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Link href={`/groups/${group.id}`}>
        <div 
          className="bg-white rounded-2xl shadow-lg p-6 border-2 hover:shadow-xl transition-shadow cursor-pointer h-full"
          style={{ borderColor: group.color + '40' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: group.color + '20' }}
            >
              {group.icon}
            </div>
            {role === 'admin' && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-cute flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>

          {/* Content */}
          <h3 className="font-display font-semibold text-lg text-gray-800 mb-2">
            {group.name}
          </h3>
          
          {group.description && (
            <p className="text-sm text-gray-600 font-cute mb-4 line-clamp-2">
              {group.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="font-cute">{formatDate(group.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="font-cute">View needs</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}