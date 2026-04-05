import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Neediness level configuration
export const NEEDINESS_LEVELS = [
  { min: 0, max: 20, emoji: '😌', label: 'Chill', color: 'text-green-500' },
  { min: 21, max: 40, emoji: '🙂', label: 'Okay', color: 'text-blue-500' },
  { min: 41, max: 60, emoji: '😕', label: 'Needy', color: 'text-yellow-500' },
  { min: 61, max: 80, emoji: '😰', label: 'Very Needy', color: 'text-orange-500' },
  { min: 81, max: 100, emoji: '🆘', label: 'Emergency!', color: 'text-red-500' },
]

export function getNeedinessLevel(level: number) {
  return NEEDINESS_LEVELS.find(l => level >= l.min && level <= l.max) || NEEDINESS_LEVELS[0]
}

// Category configuration
export const NEED_CATEGORIES = {
  groceries: { icon: '🛒', label: 'Groceries', color: 'bg-blue-100 text-blue-700' },
  chores: { icon: '🧹', label: 'Chores', color: 'bg-purple-100 text-purple-700' },
  emotional: { icon: '💭', label: 'Emotional', color: 'bg-pink-100 text-pink-700' },
  social: { icon: '👥', label: 'Social', color: 'bg-indigo-100 text-indigo-700' },
  food_craving: { icon: '🍕', label: 'Food Craving', color: 'bg-yellow-100 text-yellow-700' },
  help: { icon: '🤝', label: 'Help', color: 'bg-green-100 text-green-700' },
  company: { icon: '🫂', label: 'Company', color: 'bg-teal-100 text-teal-700' },
  other: { icon: '📌', label: 'Other', color: 'bg-gray-100 text-gray-700' },
} as const

// Priority configuration
export const NEED_PRIORITIES = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600', icon: '⬇️' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-600', icon: '➡️' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-600', icon: '⬆️' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600', icon: '🚨' },
} as const

// Format date helper
export function formatDate(date: string | Date) {
  const d = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - d.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return d.toLocaleDateString()
}

// Random cute messages
export const CUTE_MESSAGES = [
  'You got this! 💪',
  'Sending virtual hugs! 🤗',
  'We\'re here for you! 💝',
  'Together we\'re stronger! 🌈',
  'You\'re not alone! 🫶',
  'Let\'s help each other! ✨',
]

export function getRandomCuteMessage() {
  return CUTE_MESSAGES[Math.floor(Math.random() * CUTE_MESSAGES.length)]
}

export function toUserFacingError(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
) {
  if (!(error instanceof Error) || !error.message) {
    return fallback
  }

  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials')) {
    return 'Incorrect email or password.'
  }

  if (message.includes('email not confirmed')) {
    return 'Please confirm your email before logging in.'
  }

  if (message.includes('user already registered')) {
    return 'An account with this email already exists.'
  }

  if (message.includes('password should be at least')) {
    return 'Password is too short.'
  }

  if (message.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  if (message.includes('not authenticated')) {
    return 'Your session has expired. Please log in again.'
  }

  return fallback
}