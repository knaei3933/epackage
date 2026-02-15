'use client'

import { AlertCircle, Info, Megaphone, Wrench } from 'lucide-react'
import type { Announcement } from '@/lib/products'
import { getAnnouncementCategoryLabel, formatAnnouncementDate } from '@/lib/products'
import { MotionWrapper } from '@/components/ui/MotionWrapper'

interface AnnouncementBannerProps {
  announcements: Announcement[]
}

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
  if (announcements.length === 0) {
    return null
  }

  const getCategoryIcon = (category: Announcement['category']) => {
    switch (category) {
      case 'maintenance':
        return <Wrench className="h-5 w-5" />
      case 'update':
        return <AlertCircle className="h-5 w-5" />
      case 'promotion':
        return <Megaphone className="h-5 w-5" />
      case 'notice':
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: Announcement['category']) => {
    switch (category) {
      case 'maintenance':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'update':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'promotion':
        return 'bg-pink-50 border-pink-200 text-pink-800'
      case 'notice':
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <MotionWrapper delay={0}>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`
                  flex items-start gap-3 p-4 rounded-lg border
                  ${getCategoryColor(announcement.category)}
                `}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getCategoryIcon(announcement.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white bg-opacity-60">
                      {getAnnouncementCategoryLabel(announcement.category)}
                    </span>
                    {announcement.published_at && (
                      <span className="text-xs opacity-75">
                        {formatAnnouncementDate(announcement.published_at)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">
                    {announcement.title}
                  </h3>
                  <p className="text-sm opacity-90 line-clamp-2">
                    {announcement.content}
                  </p>
                </div>
                {announcement.priority === 'high' && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                      重要
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </MotionWrapper>
      </div>
    </div>
  )
}
