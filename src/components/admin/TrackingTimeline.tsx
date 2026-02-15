/**
 * Tracking Timeline Component
 * Enhanced shipment tracking history with live updates
 */

'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, Package, Truck, MapPin, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { TrackingEvent, ShipmentStatus, SHIPMENT_STATUS_NAMES } from '@/types/shipment';
import { cn } from '@/lib/utils';

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: ShipmentStatus;
  estimatedDelivery?: Date;
  trackingUrl?: string;
  locale?: 'ja' | 'en';
  showFullHistory?: boolean;
  className?: string;
}

export function TrackingTimeline({
  events,
  currentStatus,
  estimatedDelivery,
  trackingUrl,
  locale = 'ja',
  showFullHistory = false,
  className = '',
}: TrackingTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(showFullHistory);

  // Sort events by time (newest first)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.event_time).getTime() - new Date(a.event_time).getTime()
  );

  // Show limited events unless expanded
  const displayEvents = isExpanded ? sortedEvents : sortedEvents.slice(0, 5);

  if (!events || events.length === 0) {
    return (
      <div className={cn('bg-white rounded-lg shadow', className)}>
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{locale === 'ja' ? '追跡情報がまだありません' : 'No tracking information yet'}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (locale === 'ja') {
      if (diffDays === 0) {
        return `今日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 1) {
        return `昨日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays < 7) {
        return `${diffDays}日前 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
      }
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (diffDays === 0) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string, isLatest: boolean) => {
    const statusUpper = status.toUpperCase();

    if (statusUpper === 'FAILED' || statusUpper === 'EXCEPTION') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }

    if (isLatest) {
      return <Truck className="w-4 h-4 animate-pulse" />;
    }

    return <CheckCircle2 className="w-4 h-4" />;
  };

  return (
    <div className={cn('bg-white rounded-lg shadow', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Truck className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {locale === 'ja' ? '配送状況' : 'Tracking Status'}
              </h3>
              <p className="text-sm text-gray-600">
                {SHIPMENT_STATUS_NAMES[currentStatus][locale]}
              </p>
            </div>
          </div>
          <div className="text-right">
            {estimatedDelivery && (
              <>
                <p className="text-xs text-gray-600">
                  {locale === 'ja' ? '配達予定日' : 'Est. Delivery'}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {estimatedDelivery.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6 py-4">
        <div className="space-y-0">
          {displayEvents.map((event, index) => {
            const isLatest = index === 0;

            return (
              <div key={event.id} className="flex gap-4 pb-6 last:pb-0">
                {/* Timeline Icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                      isLatest
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'border-gray-300 bg-white text-gray-400'
                    )}
                  >
                    {getStatusIcon(event.status, isLatest)}
                  </div>
                  {/* Timeline line */}
                  {index < displayEvents.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                  )}
                </div>

                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={cn(
                        'font-medium',
                        isLatest ? 'text-blue-900' : 'text-gray-700'
                      )}>
                        {locale === 'ja' ? event.description_ja : event.description_en}
                      </p>
                      {event.location && (
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(event.event_time)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expand/Collapse Button */}
        {sortedEvents.length > 5 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <span>
                {isExpanded
                  ? (locale === 'ja' ? '折りたたむ' : 'Show Less')
                  : (locale === 'ja'
                      ? `${sortedEvents.length - 5}件の追跡履歴を表示`
                      : `Show ${sortedEvents.length - 5} More Events`
                    )
                }
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer with tracking link */}
      {(trackingUrl || sortedEvents.length > 0) && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {locale === 'ja'
                ? '※配送状況は配送業者のシステムと同期しています'
                : 'Tracking information synced with carrier system'}
            </p>
            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {locale === 'ja' ? '配送業者サイトで確認' : 'Track on carrier site'} →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
