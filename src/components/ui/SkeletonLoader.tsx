'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  pulse?: boolean;
  variant?: 'default' | 'circle' | 'text';
}

export function Skeleton({
  className,
  width,
  height,
  pulse = true,
  variant = 'default',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200 animate-pulse rounded',
        className,
        !className && (width ? `w-[${width}]` : 'w-full'),
        !className && (height ? `h-[${height}]` : 'h-4'),
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'rounded-sm h-4'
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circle" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton height={20} />
        <Skeleton height={20} />
        <Skeleton height={20} width="70%" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <Skeleton width={200} />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center space-x-4">
              <Skeleton width={40} height={20} />
              <Skeleton width="30%" height={20} />
              <Skeleton width="20%" height={20} />
              <Skeleton width={100} height={20} />
              <Skeleton width={80} height={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <Skeleton width={120} />
            <Skeleton height={32} className="mt-2" />
            <Skeleton width={80} className="mt-2" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <Skeleton width={150} />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton variant="circle" width={32} height={32} />
              <div className="space-y-2 flex-1">
                <Skeleton width="40%" height={16} />
                <Skeleton width="60%" height={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Skeleton;

// Additional skeleton variants for demo pages
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      <Skeleton variant="circle" width={200} height={200} className="mx-auto" />
      <Skeleton width="80%" />
      <Skeleton width="60%" />
      <Skeleton width={100} height={32} />
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
          <Skeleton variant="circle" width={48} height={48} />
          <div className="space-y-2 flex-1">
            <Skeleton width="50%" />
            <Skeleton width="70%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton width={120} />
        <Skeleton height={40} />
      </div>
      <div className="space-y-2">
        <Skeleton width={100} />
        <Skeleton height={40} />
      </div>
      <div className="space-y-2">
        <Skeleton width={150} />
        <Skeleton height={80} />
      </div>
      <Skeleton height={40} width="100%" />
    </div>
  );
}
