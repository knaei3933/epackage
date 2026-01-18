/**
 * Alert Component
 *
 * アラートコンポーネント
 * - Various alert styles (destructive, warning, info, success)
 * - Icons support
 * - Dismissible alerts
 *
 * @module components/ui/alert
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
} from 'lucide-react';

// ============================================================
// Alert Variants
// ============================================================

export const alertVariants = cva(
  'relative w-full rounded-lg border p-4 flex items-start gap-3',
  {
    variants: {
      variant: {
        default: 'bg-bg-primary border-border-light text-text-primary dark:bg-bg-secondary dark:border-border-dark',
        destructive: 'border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive dark:text-destructive',
        warning: 'border-yellow-500/50 bg-yellow-50 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-100',
        info: 'border-info-500/50 bg-info-50 text-info-900 dark:border-info-700 dark:bg-info-950 dark:text-info-100',
        success: 'border-success-500/50 bg-success-50 text-success-900 dark:border-success-700 dark:bg-success-950 dark:text-success-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// ============================================================
// Alert Types
// ============================================================

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

// ============================================================
// Alert Component
// ============================================================

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({
    className,
    variant,
    title,
    icon,
    dismissible = false,
    onDismiss,
    children,
    ...props
  }, ref) => {
    const defaultIcon = {
      default: <Info className="h-5 w-5" />,
      destructive: <AlertCircle className="h-5 w-5" />,
      warning: <AlertTriangle className="h-5 w-5" />,
      info: <Info className="h-5 w-5" />,
      success: <CheckCircle className="h-5 w-5" />,
    }[variant || 'default'];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {icon || defaultIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <AlertTitle>{title}</AlertTitle>
          )}
          {children && (
            <AlertDescription variant={variant}>
              {children}
            </AlertDescription>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 rounded-sm opacity-70 ring-offset-bg-primary transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

// ============================================================
// Alert Sub-components
// ============================================================

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h5
        ref={ref}
        className={cn('mb-1 font-medium leading-none tracking-tight', className)}
        {...props}
      />
    );
  }
);

AlertTitle.displayName = 'AlertTitle';

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement>,
  VariantProps<typeof alertVariants> {}

export const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-sm leading-relaxed', className)}
        {...props}
      />
    );
  }
);

AlertDescription.displayName = 'AlertDescription';

// ============================================================
// Pre-configured Alert Components
// ============================================================

export const DestructiveAlert = React.forwardRef<HTMLDivElement, Omit<AlertProps, 'variant'>>(
  (props, ref) => <Alert ref={ref} variant="destructive" {...props} />
);
DestructiveAlert.displayName = 'DestructiveAlert';

export const WarningAlert = React.forwardRef<HTMLDivElement, Omit<AlertProps, 'variant'>>(
  (props, ref) => <Alert ref={ref} variant="warning" {...props} />
);
WarningAlert.displayName = 'WarningAlert';

export const InfoAlert = React.forwardRef<HTMLDivElement, Omit<AlertProps, 'variant'>>(
  (props, ref) => <Alert ref={ref} variant="info" {...props} />
);
InfoAlert.displayName = 'InfoAlert';

export const SuccessAlert = React.forwardRef<HTMLDivElement, Omit<AlertProps, 'variant'>>(
  (props, ref) => <Alert ref={ref} variant="success" {...props} />
);
SuccessAlert.displayName = 'SuccessAlert';
