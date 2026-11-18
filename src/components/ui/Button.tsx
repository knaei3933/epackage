import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Epackage UI 基準 v1（src/styles/DESIGN_STANDARD.md 8 章）
// 単色・影なし・拡大なし。色はトークン（bg-brand など）だけを使う。
const PRIMARY = 'bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-pressed';
const STATUS = 'hover:brightness-90 active:brightness-75';

const buttonVariantsBase = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: PRIMARY,
        secondary: 'border border-border-strong bg-bg-primary text-text-primary hover:bg-bg-secondary',
        outline: 'border border-brand bg-transparent text-brand hover:bg-brand-subtle',
        ghost: 'bg-transparent text-brand hover:bg-brand-subtle',
        link: 'text-brand underline-offset-4 hover:text-brand-pressed hover:underline',
        destructive: `bg-error text-on-error ${STATUS}`,
        success: `bg-success text-on-success ${STATUS}`,
        warning: `bg-warning text-on-warning ${STATUS}`,
        info: `bg-info text-on-info ${STATUS}`,
        /** @deprecated Use "primary". 見た目は primary と同じ。 */
        metallic: PRIMARY,
        /** @deprecated Use "primary". 見た目は primary と同じ。 */
        'brixa-gradient': PRIMARY,
      },
      size: {
        /** 管理画面の密な表だけ */
        xs: 'h-8 px-2.5 text-[13px] gap-1',
        sm: 'h-9 px-3.5 text-sm gap-1.5',
        md: 'h-10 px-4 text-sm gap-2 max-sm:h-11',
        lg: 'h-12 px-6 text-base gap-2.5',
        /** @deprecated Use "lg". */
        xl: 'h-12 px-6 text-base gap-2.5',
        /** @deprecated Use "lg". */
        '2xl': 'h-12 px-6 text-base gap-2.5',
        icon: 'h-10 w-10 p-0 max-sm:h-11 max-sm:w-11',
        'icon-sm': 'h-9 w-9 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        /** @deprecated 基準では rounded-container(8px) か element(6px) */
        xl: 'rounded-xl',
        /** @deprecated 同上 */
        '2xl': 'rounded-2xl',
        full: 'rounded-full',
      },
    },
    compoundVariants: [
      // link は文中の文字なので、高さと左右の余白を持たない（size のクラスより後に効かせる）
      { variant: 'link', className: 'h-auto px-0' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      rounded: 'md',
    },
  }
);

/**
 * 見た目のクラス列を返す。Link など Button 以外で直接使っても、
 * 基本の text-sm と size の text-base のような競合が残らないよう、tailwind-merge を通す。
 */
const buttonVariants = (props?: Parameters<typeof buttonVariantsBase>[0]) => cn(buttonVariantsBase(props));

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariantsBase> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  badge?: React.ReactNode;
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    rounded,
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    badge,
    badgePosition = 'top-right',
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          'relative',
          buttonVariants({ variant, size, fullWidth, rounded, className })
        )}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading ? 'true' : undefined}
        {...props}
      >
        {/* Badge */}
        {badge && (
          <div
            className={cn(
              'absolute z-10',
              {
                'top-0 right-0 translate-x-1/2 -translate-y-1/2': badgePosition === 'top-right',
                'top-0 left-0 -translate-x-1/2 -translate-y-1/2': badgePosition === 'top-left',
                'bottom-0 right-0 translate-x-1/2 translate-y-1/2': badgePosition === 'bottom-right',
                'bottom-0 left-0 -translate-x-1/2 translate-y-1/2': badgePosition === 'bottom-left',
              }
            )}
          >
            {badge}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        {/* Left Icon */}
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}

        {/* Content */}
        <span className={cn('truncate', loading && 'opacity-75')}>
          {loading && loadingText ? loadingText : children}
        </span>

        {/* Right Icon */}
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };