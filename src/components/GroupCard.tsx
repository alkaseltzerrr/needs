'use client'

import { motion } from 'framer-motion'
import { Users, Crown, Calendar, Facebook, Instagram, Activity } from 'lucide-react'
import Link from 'next/link'
import type { Group } from '@/lib/supabase/database.types'
import { formatDate } from '@/lib/utils'

interface GroupCardProps {
  group: Group
  role: 'admin' | 'member'
}

// Mock data for the demo - simulating campaign-like cards
const mockCampaigns = [
  {
    id: 1,
    title: "10 Simple steps to revolutionise workflows with our product",
    platform: "facebook",
    status: "Draft",
    teamMembers: ["/api/placeholder/32/32", "/api/placeholder/32/32", "/api/placeholder/32/32"],
    startDate: "Not Started",
    lastUpdated: "Apr 10, 2023",
    statusColor: "bg-gray-100 text-gray-700"
  },
  {
    id: 2,
    title: "Boost your performance: start using our amazing product",
    platform: "google",
    status: "In Progress",
    teamMembers: ["/api/placeholder/32/32", "/api/placeholder/32/32"],
    startDate: "Jun 1, 2023",
    endDate: "Aug 1, 2023",
    lastUpdated: "July 10, 2023",
    statusColor: "bg-blue-100 text-blue-700",
    progress: 45
  }
]

export default function GroupCard({ group, role }: GroupCardProps) {
  // Use mock data for demo
  const campaign = mockCampaigns[Math.floor(Math.random() * mockCampaigns.length)]
  
  const PlatformIcon = campaign.platform === 'facebook' ? Facebook : 
                      campaign.platform === 'instagram' ? Instagram : Activity

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Link href={`/groups/${group.id}`}>
        <div className="card-glass rounded-xl p-6 hover:shadow-purple transition-all duration-200 cursor-pointer h-full">
          {/* Header with platform icon and status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <PlatformIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${campaign.statusColor}`}>
                  {campaign.status}
                </span>
                <div className="text-xs text-gray-500 mt-1">{campaign.status === "Draft" ? "2" : "2"}</div>
              </div>
            </div>
            
            {role === 'admin' && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>

          {/* Campaign title */}
          <h3 className="font-pixel font-semibold text-gray-900 mb-4 leading-tight">
            {group.name || campaign.title}
          </h3>

          {/* Team members */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {campaign.teamMembers.map((avatar, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white"
                />
              ))}
            </div>
          </div>

          {/* Campaign details */}
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Start:</span>
              <span className="font-medium">{campaign.startDate}</span>
            </div>
            {campaign.endDate && (
              <div className="flex justify-between">
                <span>Ends:</span>
                <span className="font-medium">{campaign.endDate}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Last updated:</span>
              <span className="font-medium">{campaign.lastUpdated}</span>
            </div>
          </div>

          {/* Progress bar for in-progress campaigns */}
          {campaign.progress && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{campaign.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${campaign.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}