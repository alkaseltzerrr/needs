'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface CreateGroupModalProps {
  onClose: () => void
}

const GROUP_ICONS = ['🏠', '👨‍👩‍👧‍👦', '🎉', '💼', '🎮', '📚', '🎨', '🍕', '☕', '🌟']
const GROUP_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
]

export default function CreateGroupModal({ onClose }: CreateGroupModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('🏠')
  const [selectedColor, setSelectedColor] = useState('#ef4444')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: groupError } = await supabase.rpc('create_group_with_admin_member', {
        p_name: name.trim(),
        p_description: description.trim() || null,
        p_color: selectedColor,
        p_icon: selectedIcon,
      })

      if (groupError) throw groupError

      router.refresh()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-pixel font-semibold text-gray-800">
              Create New Group
            </h2>
            <button
              onClick={onClose}
              aria-label="Close create group modal"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-pixel font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none transition-colors text-sm"
                placeholder="My Awesome Group"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-pixel font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none transition-colors text-sm resize-none"
                placeholder="What's this group about?"
                rows={3}
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-pixel font-medium text-gray-700 mb-2">
                Choose an Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {GROUP_ICONS.map((icon) => (
                  <motion.button
                    key={icon}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedIcon === icon
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-pixel font-medium text-gray-700 mb-2">
                Choose a Color
              </label>
              <div className="flex flex-wrap gap-2">
                {GROUP_COLORS.map((color) => (
                  <motion.button
                    key={color}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-xl border-2 ${
                      selectedColor === color
                        ? 'border-gray-800 shadow-lg'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 text-sm mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: selectedColor + '20' }}
                >
                  {selectedIcon}
                </div>
                <div>
                  <h3 className="font-pixel font-semibold text-gray-800">
                    {name || 'Group Name'}
                  </h3>
                  {description && (
                    <p className="text-sm text-gray-600 text-sm">
                      {description}
                    </p>
                  )}
                </div>
              </div>
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
              disabled={loading || !name}
              className="w-full bg-gradient-to-r from-primary-400 to-primary-500 text-white font-pixel font-medium py-3 px-6 rounded-xl hover:from-primary-500 hover:to-primary-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Group'
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}