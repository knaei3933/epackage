import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, formatCurrency } from '@/lib/utils';

// Epackage UI 基準 v1: 四角（rounded-inner）・13px・font-medium。ピル型・グラデーションは使わない。
const BRAND = 'bg-brand-muted text-on-brand-muted';

const badgeVariants = cva(
  'inline-flex items-center rounded-inner px-2 py-0.5 text-[13px] font-medium transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: BRAND,
        secondary: 'bg-bg-muted text-text-secondary',
        success: 'bg-success-muted text-on-success-muted',
        warning: 'bg-warning-muted text-on-warning-muted',
        error: 'bg-error-muted text-on-error-muted',
        info: 'bg-info-muted text-on-info-muted',
        outline: 'border border-border-strong bg-transparent text-text-secondary',
        /** @deprecated Use "default". 見た目はブランドと同じ。 */
        metallic: BRAND,
      },
      size: {
        sm: 'px-2 py-0.5 text-[13px]',
        md: 'px-2 py-0.5 text-[13px]',
        lg: 'px-2.5 py-1 text-sm',
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
              variant === 'success' && 'bg-success',
              variant === 'warning' && 'bg-warning',
              variant === 'error' && 'bg-error',
              variant === 'info' && 'bg-info',
              (variant === 'default' || variant === 'metallic' || !variant) && 'bg-brand',
              (variant === 'outline' || variant === 'secondary') && 'bg-text-secondary'
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
    <Badge variant="default" size="sm" {...props}>
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
    {...props}
  >
    {children}
  </Badge>
);

export { Badge, badgeVariants };