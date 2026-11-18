import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Epackage UI 基準 v1: 不透明 + 細い枠線 + rounded-container。既定は影なし。
const FLAT = 'bg-bg-primary border-border-medium text-text-primary';
const CLICKABLE = 'hover:border-border-dark hover:shadow-low';

const cardVariants = cva(
  'rounded-container border transition-colors duration-fast',
  {
    variants: {
      variant: {
        default: FLAT,
        elevated: `${FLAT} ${CLICKABLE}`,
        outlined: 'bg-bg-primary border-border-dark text-text-primary',
        ghost: 'bg-transparent border-transparent text-text-primary hover:bg-bg-secondary',
        /** @deprecated Use "default". */
        metallic: FLAT,
        interactive: `${FLAT} ${CLICKABLE} cursor-pointer`,
        /** 選ばれた状態 */
        brixa: 'bg-brand-subtle border-brand text-text-primary',
        success: 'bg-success-muted border-success text-on-success-muted',
        warning: 'bg-warning-muted border-warning text-on-warning-muted',
        error: 'bg-error-muted border-error text-on-error-muted',
        info: 'bg-info-muted border-info text-on-info-muted',
        /** @deprecated Use "default". ガラス風は使わない。 */
        glass: FLAT,
      },
      size: {
        xs: 'p-3',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
        '2xl': 'p-12',
        none: '',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        /** @deprecated 値は 8px に揃えてある。rounded-container を使う。 */
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-low',
        md: 'shadow-med',
        lg: 'shadow-high',
        /** @deprecated Use "lg". */
        xl: 'shadow-high',
        /** @deprecated Use "lg". */
        '2xl': 'shadow-high',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'lg',
      shadow: 'none',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hover?: boolean;
  loading?: boolean;
  overlay?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant,
    size,
    rounded,
    shadow,
    hover = false,
    loading = false,
    overlay,
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          cardVariants({ variant, size, rounded, shadow }),
          hover && CLICKABLE,
          loading && 'opacity-75 pointer-events-none',
          className
        )}
        {...props}
      >
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary rounded-container z-10 opacity-90">
            <div className="flex items-center space-x-2 text-text-primary">
              <svg
                className="animate-spin h-5 w-5"
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
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        )}

        {/* Card Content */}
        {children}

        {/* Overlay */}
        {overlay && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {overlay}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-2 pb-6', className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-xl font-semibold leading-none tracking-tight text-text-primary mb-1">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0 ml-4">
              {action}
            </div>
          )}
        </div>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-xl font-semibold leading-none tracking-tight text-text-primary',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-text-secondary leading-relaxed', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('pt-0', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, justify = 'start', children, ...props }, ref) => {
    const justifyClass = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    }[justify];

    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-6 gap-3', justifyClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };