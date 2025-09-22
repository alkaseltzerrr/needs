'use client'

import { motion } from 'framer-motion'
import { getNeedinessLevel } from '@/lib/utils'

interface NeedinessIndicatorProps {
  level: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function NeedinessIndicator({ 
  level, 
  showLabel = true, 
  size = 'md' 
}: NeedinessIndicatorProps) {
  const needinessLevel = getNeedinessLevel(level)
  
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center"
    >
      <div className="relative">
        <motion.div
          animate={{ 
            rotate: level > 60 ? [0, -10, 10, -10, 10, 0] : 0,
          }}
          transition={{ 
            duration: 0.5, 
            repeat: level > 60 ? Infinity : 0, 
            repeatDelay: 3 
          }}
          className={sizeClasses[size]}
        >
          {needinessLevel.emoji}
        </motion.div>
        
        {/* Progress ring */}
        <svg 
          className="absolute inset-0 -z-10 w-full h-full"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className={needinessLevel.color}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: level / 100 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              transformOrigin: '50% 50%',
              transform: 'rotate(-90deg)',
              strokeDasharray: `${2 * Math.PI * 45}`,
            }}
          />
        </svg>
      </div>
      
      {showLabel && (
        <div className="mt-2 text-center">
          <p className={`font-display font-medium ${needinessLevel.color}`}>
            {needinessLevel.label}
          </p>
          <p className="text-xs text-gray-500 font-cute">{level}% needy</p>
        </div>
      )}
    </motion.div>
  )
}