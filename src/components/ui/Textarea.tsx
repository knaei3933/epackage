import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success' | 'warning' | 'ghost' | 'filled';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'border-[var(--border-medium)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus-visible:border-[var(--brixa-primary-500)] focus-visible:ring-[var(--brixa-primary-500)] dark:border-[var(--border-dark)] dark:bg-[var(--bg-secondary)]',
      error: 'border-[var(--error-500)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus-visible:border-[var(--error-500)] focus-visible:ring-[var(--error-500)] dark:bg-[var(--bg-secondary)]',
      success: 'border-[var(--success-500)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus-visible:border-[var(--success-500)] focus-visible:ring-[var(--success-500)] dark:bg-[var(--bg-secondary)]',
      warning: 'border-[var(--warning-500)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus-visible:border-[var(--warning-500)] focus-visible:ring-[var(--warning-500)] dark:bg-[var(--bg-secondary)]',
      ghost: 'border-transparent bg-transparent text-[var(--text-primary)] focus-visible:border-[var(--brixa-primary-300)] focus-visible:ring-[var(--brixa-primary-500)] hover:bg-[var(--bg-accent)] dark:hover:bg-[var(--bg-accent)]',
      filled: 'border-transparent bg-[var(--bg-secondary)] text-[var(--text-primary)] focus-visible:border-[var(--brixa-primary-500)] focus-visible:ring-[var(--brixa-primary-500)] dark:bg-[var(--bg-muted)]',
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-[var(--text-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          variantStyles[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }