import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const containerVariants = cva(
  'mx-auto px-4 sm:px-6 lg:px-8',
  {
    variants: {
      size: {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: 'max-w-full',
        screen: 'max-w-screen-xl',
        screenSm: 'max-w-screen-sm',
        screenMd: 'max-w-screen-md',
        screenLg: 'max-w-screen-lg',
        none: '',
      },
      padding: {
        none: 'px-0',
        xs: 'px-2 sm:px-3 lg:px-4',
        sm: 'px-3 sm:px-4 lg:px-6',
        md: 'px-4 sm:px-6 lg:px-8',
        lg: 'px-6 sm:px-8 lg:px-12',
        xl: 'px-8 sm:px-12 lg:px-16',
        '2xl': 'px-12 sm:px-16 lg:px-20',
        '3xl': 'px-16 sm:px-20 lg:px-24',
        '4xl': 'px-20 sm:px-24 lg:px-32',
        py: 'py-4 sm:py-6 lg:py-8',
        'py-sm': 'py-2 sm:py-3 lg:py-4',
        'py-lg': 'py-6 sm:py-8 lg:py-12',
        'py-xl': 'py-8 sm:py-12 lg:py-16',
        y: 'py-4 sm:py-6 lg:py-8',
        x: 'px-4 sm:px-6 lg:px-8',
      },
      center: {
        true: 'flex items-center justify-center',
        false: '',
      },
    },
    defaultVariants: {
      size: '7xl',
      padding: 'md',
      center: false,
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({
    className,
    size,
    padding,
    center,
    as: Component = 'div',
    children,
    ...props
  }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          containerVariants({ size, padding, center }),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = 'Container';

export { Container, containerVariants };