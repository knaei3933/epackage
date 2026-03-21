'use client';

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export interface OptionCardProps {
  id: string;
  image?: {
    src: string;
    alt: string;
    size?: 'small' | 'medium' | 'large';
  };
  title: string;
  subtitle?: string;
  isSelected: boolean;
  isConflicting?: boolean;
  isDisabled?: boolean;
  onSelect?: () => void;
  className?: string;
  children?: React.ReactNode;
  showSelectionIcon?: boolean;
  showConflictIcon?: boolean;
}

const imageSizes = {
  small: 'w-[80px] h-[80px]',
  medium: 'w-[120px] h-[120px]',
  large: 'w-[150px] h-[150px]',
};

/**
 * 共通オプションカードコンポーネント
 *
 * PostProcessingGroups.tsxのOptionCardを抽出
 * カード選択UIの共通パターンを提供
 */
export const OptionCard: React.FC<OptionCardProps> = ({
  id,
  image,
  title,
  subtitle,
  isSelected,
  isConflicting = false,
  isDisabled = false,
  onSelect,
  className = '',
  children,
  showSelectionIcon = true,
  showConflictIcon = true,
}) => {
  const baseClassName = 'w-full p-3 rounded-xl border-2 transition-all duration-200 relative';

  const stateClassName = isSelected
    ? 'border-green-500 bg-green-50 shadow-md'
    : isConflicting
    ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
    : isDisabled
    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
    : 'border-gray-200 hover:border-navy-300 hover:shadow-sm';

  const combinedClassName = `${baseClassName} ${stateClassName} ${className}`;

  return (
    <button
      id={id}
      onClick={isDisabled ? undefined : onSelect}
      className={combinedClassName}
      disabled={isDisabled}
      type="button"
      aria-pressed={isSelected}
    >
      {/* Selection Indicator */}
      {isSelected && showSelectionIcon && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      {/* Conflict Indicator */}
      {isConflicting && !isSelected && showConflictIcon && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center animate-pulse shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="flex flex-col items-center justify-center gap-3 py-2">
        {/* Preview Image */}
        {image && (
          <div className={`${imageSizes[image.size || 'medium']} bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm`}>
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/pouch.png';
              }}
            />
          </div>
        )}

        {/* Title */}
        {title && (
          <span className="text-sm font-medium text-gray-900 text-center">
            {title}
          </span>
        )}

        {/* Subtitle */}
        {subtitle && (
          <span className="text-xs text-gray-600 text-center">
            {subtitle}
          </span>
        )}

        {/* Additional Content */}
        {children}
      </div>
    </button>
  );
};

/**
 * オプショングリッド用コンテナコンポーネント
 */
export interface OptionCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}

const gridColumns = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

const gridGaps = {
  small: 'gap-2',
  medium: 'gap-3',
  large: 'gap-4',
};

export const OptionCardGrid: React.FC<OptionCardGridProps> = ({
  children,
  columns = 3,
  gap = 'medium',
  className = '',
}) => {
  const responsiveColumns = {
    1: 'grid grid-cols-1',
    2: 'grid grid-cols-1 sm:grid-cols-2',
    3: 'grid grid-cols-2 sm:grid-cols-3',
    4: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  };

  const combinedClassName = `${responsiveColumns[columns]} ${gridGaps[gap]} ${className}`;

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
};

/**
 * オプショングループ用コンテナコンポーネント
 */
export interface OptionCardGroupProps {
  groupId: string;
  groupName: string;
  icon?: React.ReactNode;
  hasSelectedOption?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const OptionCardGroup: React.FC<OptionCardGroupProps> = ({
  groupId,
  groupName,
  icon,
  hasSelectedOption = false,
  children,
  className = '',
}) => {
  return (
    <div
      id={`group-${groupId}`}
      className={`p-4 rounded-xl border-2 transition-all ${
        hasSelectedOption
          ? 'border-navy-300 bg-navy-50/50 shadow-md'
          : 'border-gray-200 bg-white'
      } ${className}`}
    >
      {/* Group Header */}
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center text-xl shadow-sm">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900">{groupName}</h3>
        </div>
        {hasSelectedOption && (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Options */}
      {children}
    </div>
  );
};

export default OptionCard;
