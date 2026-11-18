import * as React from "react"

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success' | 'warning' | 'ghost' | 'filled';
  label?: string;
  error?: string;
  helperText?: React.ReactNode;
  showCharCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', label, error, helperText, showCharCount, ...props }, ref) => {
    const field = 'border-border-strong bg-bg-primary text-text-primary focus-visible:border-brand focus-visible:ring-brand';
    const variantStyles = {
      default: field,
      error: 'border-error bg-bg-primary text-text-primary focus-visible:border-error focus-visible:ring-error',
      success: 'border-success bg-bg-primary text-text-primary focus-visible:border-success focus-visible:ring-success',
      warning: 'border-warning bg-bg-primary text-text-primary focus-visible:border-warning focus-visible:ring-warning',
      ghost: field,
      filled: 'border-border-strong bg-bg-secondary text-text-primary focus-visible:border-brand focus-visible:ring-brand',
    };

    const textareaEl = (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-bg-muted disabled:text-text-disabled transition-colors duration-fast",
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (!label && !error && !helperText) {
      return textareaEl;
    }

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        {textareaEl}
        {error && (
          <p className="flex items-start gap-1.5 text-sm text-error" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" /><span>{error}</span></p>
        )}
        {helperText && (
          <p className="text-sm text-text-muted">{helperText}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }