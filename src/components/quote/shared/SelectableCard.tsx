'use client';

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export interface SelectableCardProps {
  id: string;
  isSelected: boolean;
  isConflicting?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  selectedClassName?: string;
  conflictClassName?: string;
  disabledClassName?: string;
  showCheckIcon?: boolean;
  showConflictIcon?: boolean;
  ariaLabel?: string;
}

/**
 * 共通選択カードコンポーネント
 *
 * BasicInfoSection、MaterialSelection、SizeSpecification、PostProcessingGroupsで
 * 共通に使用されているカード選択UIパターンを統一
 */
export const SelectableCard: React.FC<SelectableCardProps> = ({
  id,
  isSelected,
  isConflicting = false,
  isDisabled = false,
  onClick,
  children,
  className = '',
  selectedClassName = 'border-green-500 bg-green-50 shadow-md',
  conflictClassName = 'border-amber-300 bg-amber-50/30 hover:border-amber-400',
  disabledClassName = 'opacity-50 cursor-not-allowed',
  showCheckIcon = true,
  showConflictIcon = true,
  ariaLabel,
}) => {
  const baseClassName = 'w-full p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden';

  const stateClassName = isSelected
    ? selectedClassName
    : isConflicting
    ? conflictClassName
    : isDisabled
    ? disabledClassName
    : 'border-gray-200 bg-white hover:border-navy-300 hover:shadow-sm';

  const combinedClassName = `${baseClassName} ${stateClassName} ${className}`;

  return (
    <button
      id={id}
      onClick={isDisabled ? undefined : onClick}
      className={combinedClassName}
      aria-pressed={isSelected}
      aria-label={ariaLabel}
      disabled={isDisabled}
      type="button"
    >
      {/* Selection Indicator */}
      {isSelected && showCheckIcon && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Conflict Indicator */}
      {isConflicting && !isSelected && showConflictIcon && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center animate-pulse shadow-sm">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {children}
    </button>
  );
};

/**
 * カードコンテンツ用の共通レイアウトコンポーネント
 */
export interface CardContentProps {
  icon?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
  };
  title: string;
  subtitle?: string;
  description?: string;
  tags?: Array<{
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'info';
  }>;
  metadata?: Array<{
    label: string;
    value: string;
  }>;
  extraContent?: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  icon,
  image,
  title,
  subtitle,
  description,
  tags = [],
  metadata = [],
  extraContent,
}) => {
  const tagStyles = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="flex items-start space-x-4">
      {/* Icon or Image */}
      {(icon || image) && (
        <div className="flex-shrink-0">
          {icon && (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          )}
          {image && (
            <div className={`overflow-hidden border border-gray-200 ${image.className || 'w-20 h-20 rounded-lg'}`}>
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (image.fallback) {
                    const parent = target.parentElement;
                    if (parent) {
                      target.style.display = 'none';
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gray-50';
                      fallbackDiv.innerHTML = image.fallback as string;
                      parent.appendChild(fallbackDiv);
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <div className="font-medium text-gray-900">{title}</div>
          {subtitle && (
            <div className="text-sm text-gray-600">{subtitle}</div>
          )}
        </div>

        {description && (
          <div className="text-sm text-gray-600 mt-1">{description}</div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded ${
                  tagStyles[tag.variant || 'default']
                }`}
              >
                {tag.text}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        {metadata.length > 0 && (
          <div className="mt-2 space-y-1">
            {metadata.map((item, index) => (
              <div key={index} className="text-xs text-gray-500">
                <span className="font-medium">{item.label}:</span> {item.value}
              </div>
            ))}
          </div>
        )}

        {/* Extra Content */}
        {extraContent}
      </div>
    </div>
  );
};

export default SelectableCard;
