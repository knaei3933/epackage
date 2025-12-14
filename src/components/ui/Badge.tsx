import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, formatCurrency } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[var(--brixa-primary-100)] text-[var(--brixa-primary-800)] focus:ring-[var(--brixa-primary-500)]',
        secondary: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-light)] focus:ring-[var(--brixa-primary-500)]',
        success: 'bg-[var(--success-100)] text-[var(--success-800)] focus:ring-[var(--success-500)]',
        warning: 'bg-[var(--warning-100)] text-[var(--warning-800)] focus:ring-[var(--warning-500)]',
        error: 'bg-[var(--error-100)] text-[var(--error-800)] focus:ring-[var(--error-500)]',
        info: 'bg-[var(--info-100)] text-[var(--info-800)] focus:ring-[var(--info-500)]',
        outline: 'border border-[var(--brixa-primary-300)] text-[var(--brixa-primary-700)] bg-transparent focus:ring-[var(--brixa-primary-500)]',
        metallic: 'bg-gradient-to-r from-[var(--metallic-silver)] to-[var(--metallic-gold)] text-white focus:ring-[var(--metallic-silver)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot, removable, onRemove, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'mr-1.5 h-2 w-2 rounded-full',
              variant === 'success' && 'bg-[var(--success-500)]',
              variant === 'warning' && 'bg-[var(--warning-500)]',
              variant === 'error' && 'bg-[var(--error-500)]',
              variant === 'info' && 'bg-[var(--info-500)]',
              variant === 'default' && 'bg-[var(--brixa-primary-500)]',
              variant === 'metallic' && 'bg-white',
              variant === 'outline' && 'bg-[var(--brixa-primary-500)]',
              variant === 'secondary' && 'bg-[var(--text-secondary)]'
            )}
          />
        )}

        <span className="flex-1">{children}</span>

        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1.5 flex-shrink-0 hover:opacity-70 focus:outline-none focus:opacity-70 transition-opacity"
            aria-label="Remove badge"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// Status badge variants for common use cases
export const StatusBadge = {
  New: ({ children, ...props }: Omit<BadgeProps, 'variant'>) => (
    <Badge variant="info" dot {...props}>
      {children || '新規'}
    </Badge>
  ),
  Processing: ({ children, ...props }: Omit<BadgeProps, 'variant'>) => (
    <Badge variant="warning" dot {...props}>
      {children || '処理中'}
    </Badge>
  ),
  Completed: ({ children, ...props }: Omit<BadgeProps, 'variant'>) => (
    <Badge variant="success" dot {...props}>
      {children || '完了'}
    </Badge>
  ),
  Error: ({ children, ...props }: Omit<BadgeProps, 'variant'>) => (
    <Badge variant="error" dot {...props}>
      {children || 'エラー'}
    </Badge>
  ),
  Draft: ({ children, ...props }: Omit<BadgeProps, 'variant'>) => (
    <Badge variant="secondary" {...props}>
      {children || '下書き'}
    </Badge>
  ),
};

// Currency badge for pricing display
export const CurrencyBadge = ({
  amount,
  currency = 'JPY',
  ...props
}: {
  amount: number;
  currency?: 'JPY' | 'KRW' | 'USD';
} & Omit<BadgeProps, 'children'>) => {
  return (
    <Badge variant="metallic" size="sm" {...props}>
      {formatCurrency(amount, currency)}
    </Badge>
  );
};

// Tag badge for categories
export const TagBadge = ({ children, removable, onRemove, ...props }: BadgeProps) => (
  <Badge
    variant="outline"
    size="sm"
    removable={removable}
    onRemove={onRemove}
    className="rounded-md"
    {...props}
  >
    {children}
  </Badge>
);

export { Badge, badgeVariants };