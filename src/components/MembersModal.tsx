'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, User } from 'lucide-react'
import type { Profile } from '@/lib/supabase/database.types'
import NeedinessIndicator from './NeedinessIndicator'

interface MembersModalProps {
  members: Array<{
    role: string
    profiles: Profile | null
  }>
  groupId: string
  currentUserRole: 'admin' | 'member'
  onClose: () => void
}

export default function MembersModal({ 
  members, 
  groupId, 
  currentUserRole, 
  onClose 
}: MembersModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-semibold text-gray-800">
              Group Members
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Members List */}
          <div className="space-y-4">
            {members.map((member) => (
              member.profiles && (
                <motion.div
                  key={member.profiles.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-display font-semibold">
                      {member.profiles.display_name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-medium text-gray-800">
                          {member.profiles.display_name}
                        </h3>
                        {member.role === 'admin' && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-lg text-xs font-cute flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-cute">
                        @{member.profiles.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <NeedinessIndicator 
                      level={member.profiles.neediness_level} 
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                </motion.div>
              )
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-gray-500 font-cute">
              {members.length} member{members.length !== 1 ? 's' : ''} in this group
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}