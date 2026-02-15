import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg border transition-all duration-fast',
  {
    variants: {
      variant: {
        default: 'bg-bg-primary border-border-light text-text-primary dark:bg-bg-secondary dark:border-border-dark',
        elevated: 'bg-bg-primary border-border-light text-text-primary shadow-md hover:shadow-lg dark:bg-bg-secondary dark:border-border-dark',
        outlined: 'bg-bg-primary border-2 border-brixa-200 text-text-primary dark:border-brixa-700',
        ghost: 'bg-transparent border-transparent text-text-primary hover:bg-bg-accent dark:hover:bg-bg-accent',
        metallic: 'bg-gradient-metallic border-metallic-silver/30 text-text-primary shadow-sm dark:from-metallic-silver/5 dark:to-metallic-gold/5',
        interactive: 'bg-bg-primary border-border-light text-text-primary shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer active:scale-[0.98] dark:bg-bg-secondary dark:border-border-dark',
        brixa: 'bg-gradient-to-br from-brixa-50 to-brixa-100 border-brixa-200 text-brixa-900 shadow-sm hover:shadow-md dark:from-brixa-900/20 dark:to-brixa-800/20 dark:border-brixa-700 dark:text-brixa-100',
        success: 'bg-success-50 border-success-200 text-success-900 shadow-sm hover:shadow-md dark:bg-success-950 dark:border-success-800 dark:text-success-100',
        warning: 'bg-warning-50 border-warning-200 text-warning-900 shadow-sm hover:shadow-md dark:bg-warning-950 dark:border-warning-800 dark:text-warning-100',
        error: 'bg-error-50 border-error-200 text-error-900 shadow-sm hover:shadow-md dark:bg-error-950 dark:border-error-800 dark:text-error-100',
        info: 'bg-info-50 border-info-200 text-info-900 shadow-sm hover:shadow-md dark:bg-info-950 dark:border-info-800 dark:text-info-100',
        glass: 'bg-white/80 backdrop-blur-sm border-white/20 text-text-primary shadow-lg hover:shadow-xl dark:bg-black/80 dark:border-white/10',
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
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        '2xl': 'shadow-2xl',
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
          hover && 'hover:shadow-lg transition-shadow',
          loading && 'opacity-75 pointer-events-none',
          className
        )}
        {...props}
      >
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/50 dark:bg-bg-secondary/50 rounded-lg z-10">
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