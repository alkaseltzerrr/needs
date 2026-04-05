'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { NEED_CATEGORIES, NEED_PRIORITIES, toUserFacingError } from '@/lib/utils'
import type { NeedCategory, NeedPriority } from '@/lib/supabase/database.types'

interface CreateNeedModalProps {
  groupId: string
  onClose: () => void
}

export default function CreateNeedModal({ groupId, onClose }: CreateNeedModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<NeedCategory>('other')
  const [priority, setPriority] = useState<NeedPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create the need
      const { error: needError } = await supabase
        .from('needs')
        .insert({
          group_id: groupId,
          created_by: user.id,
          title,
          description,
          category,
          priority,
          due_date: dueDate || null
        })

      if (needError) throw needError

      // Update user's neediness level based on priority
      const needinessIncrease = {
        low: 3,
        medium: 5,
        high: 8,
        urgent: 12
      }[priority]

      await supabase.rpc('update_neediness_level', {
        p_user_id: user.id,
        p_delta: needinessIncrease,
        p_reason: `Posted need: ${title}`
      })

      router.refresh()
      onClose()
    } catch (err: unknown) {
      setError(toUserFacingError(err, 'Unable to share your need right now. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

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
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-pixel font-semibold text-gray-800">
              Share Your Need
            </h2>
            <button
              onClick={onClose}
              aria-label="Close create need modal"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-pixel font-medium text-gray-700 mb-2">
                What do you need? *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none transition-colors text-sm"
                placeholder="I need help with..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-pixel font-medium text-gray-700 mb-2">
                More details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none transition-colors text-sm resize-none"
                placeholder="Provide more context about what you need..."
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-pixel font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(NEED_CATEGORIES).map(([key, value]) => (
                  <motion.button
                    key={key}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCategory(key as NeedCategory)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      category === key
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{value.icon}</span>
                      <span className="text-sm text-sm">{value.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-pixel font-medium text-gray-700 mb-2">
                How urgent is this?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(NEED_PRIORITIES).map(([key, value]) => (
                  <motion.button
                    key={key}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPriority(key as NeedPriority)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      priority === key
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{value.icon}</span>
                      <span className="text-sm text-sm">{value.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-pixel font-medium text-gray-700 mb-2">
                Due date (optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none transition-colors text-sm"
                />
              </div>
            </div>

            {/* Neediness Impact Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 text-sm mb-2">📊 Neediness Impact</p>
              <p className="text-sm text-blue-700 text-sm">
                Posting this {priority} priority need will increase your neediness level by{' '}
                <strong>
                  +{
                    {
                      low: 3,
                      medium: 5,
                      high: 8,
                      urgent: 12
                    }[priority]
                  }
                </strong>{' '}
                points
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !title}
              className="w-full bg-gradient-to-r from-primary-400 to-primary-500 text-white font-pixel font-medium py-3 px-6 rounded-xl hover:from-primary-500 hover:to-primary-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Sharing...
                </span>
              ) : (
                'Share My Need'
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}