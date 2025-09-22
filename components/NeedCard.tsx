'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Heart, MessageCircle, CheckCircle, User } from 'lucide-react'
import type { Need, Profile, NeedResponse } from '@/lib/supabase/database.types'
import { NEED_CATEGORIES, NEED_PRIORITIES, formatDate, getNeedinessLevel } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NeedCardProps {
  need: Need & { 
    profiles: Profile | null
    need_responses: NeedResponse[]
  }
  currentUserId: string
  groupId: string
}

export default function NeedCard({ need, currentUserId, groupId }: NeedCardProps) {
  const [isHelping, setIsHelping] = useState(false)
  const [showResponses, setShowResponses] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const category = NEED_CATEGORIES[need.category]
  const priority = NEED_PRIORITIES[need.priority]
  const needinessLevel = getNeedinessLevel(need.profiles?.neediness_level || 0)

  const handleHelp = async () => {
    setIsHelping(true)
    try {
      // Add response
      const { error } = await supabase
        .from('need_responses')
        .insert({
          need_id: need.id,
          user_id: currentUserId,
          message: responseMessage,
          is_helping: true
        })

      if (error) throw error

      // Update neediness level of need creator (decrease by 5)
      await supabase.rpc('update_neediness_level', {
        p_user_id: need.created_by,
        p_delta: -5,
        p_reason: `Help received for: ${need.title}`
      })

      // Increase helper's neediness by 2 (helping others makes you a bit needier for reciprocation)
      await supabase.rpc('update_neediness_level', {
        p_user_id: currentUserId,
        p_delta: 2,
        p_reason: `Helped with: ${need.title}`
      })

      setResponseMessage('')
      router.refresh()
    } catch (error) {
      console.error('Error helping:', error)
    } finally {
      setIsHelping(false)
    }
  }

  const handleFulfill = async () => {
    try {
      const { error } = await supabase
        .from('needs')
        .update({
          is_fulfilled: true,
          fulfilled_by: currentUserId,
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', need.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error fulfilling need:', error)
    }
  }

  const isOwner = need.created_by === currentUserId
  const hasResponded = need.need_responses.some(r => r.user_id === currentUserId)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
        need.is_fulfilled ? 'border-green-200' : 'border-gray-100'
      } hover:shadow-xl transition-shadow`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${category.color}`}>
            {category.icon}
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-gray-800">
              {need.title}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 font-cute">by {need.profiles?.display_name}</span>
              <span className="text-xl">{needinessLevel.emoji}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-1 rounded-lg text-xs font-cute ${priority.color}`}>
            {priority.icon} {priority.label}
          </span>
          {need.is_fulfilled && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-cute flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Fulfilled
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {need.description && (
        <p className="text-gray-600 font-cute mb-4">{need.description}</p>
      )}

      {/* Due Date */}
      {need.due_date && (
        <div className="flex items-center gap-2 text-sm text-gray-500 font-cute mb-4">
          <Clock className="w-4 h-4" />
          <span>Due: {formatDate(need.due_date)}</span>
        </div>
      )}

      {/* Responses */}
      {need.need_responses.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowResponses(!showResponses)}
            className="flex items-center gap-2 text-sm text-gray-600 font-cute hover:text-gray-800 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {need.need_responses.length} response{need.need_responses.length !== 1 ? 's' : ''}
          </button>
          
          {showResponses && (
            <div className="mt-2 space-y-2">
              {need.need_responses.map((response) => (
                <div key={response.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500 font-cute">
                      {formatDate(response.created_at)}
                    </span>
                    {response.is_helping && (
                      <span className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-xs font-cute">
                        Helping
                      </span>
                    )}
                  </div>
                  {response.message && (
                    <p className="text-sm text-gray-700 font-cute">{response.message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!need.is_fulfilled && !isOwner && (
        <div className="border-t pt-4">
          {!hasResponded ? (
            <div className="space-y-3">
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="How can you help? (optional)"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-400 focus:outline-none transition-colors font-cute text-sm resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleHelp}
                  disabled={isHelping}
                  className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-xl font-cute hover:bg-primary-600 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isHelping ? (
                    <span>Helping...</span>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      I can help!
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFulfill}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl font-cute hover:bg-green-600 transition-colors shadow-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Done
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-cute">You've responded to this need</span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFulfill}
                className="bg-green-500 text-white px-4 py-2 rounded-xl font-cute hover:bg-green-600 transition-colors shadow-lg flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Done
              </motion.button>
            </div>
          )}
        </div>
      )}

      {isOwner && !need.is_fulfilled && (
        <div className="border-t pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFulfill}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-xl font-cute hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Mark as Fulfilled
          </motion.button>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 pt-3 border-t text-xs text-gray-400 font-cute">
        Posted {formatDate(need.created_at)}
      </div>
    </motion.div>
  )
}