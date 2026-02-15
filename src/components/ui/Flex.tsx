import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const flexVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        row: 'flex-row',
        rowReverse: 'flex-row-reverse',
        col: 'flex-col',
        colReverse: 'flex-col-reverse',
      },
      wrap: {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        wrapReverse: 'flex-wrap-reverse',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
        baseline: 'items-baseline',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      gap: {
        0: 'gap-0',
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
        10: 'gap-10',
        12: 'gap-12',
        xs: 'gap-xs',
        sm: 'gap-sm',
        md: 'gap-md',
        lg: 'gap-lg',
        xl: 'gap-xl',
        '2xl': 'gap-2xl',
        '3xl': 'gap-3xl',
      },
      gapX: {
        0: 'gap-x-0',
        1: 'gap-x-1',
        2: 'gap-x-2',
        3: 'gap-x-3',
        4: 'gap-x-4',
        5: 'gap-x-5',
        6: 'gap-x-6',
        8: 'gap-x-8',
        10: 'gap-x-10',
        12: 'gap-x-12',
      },
      gapY: {
        0: 'gap-y-0',
        1: 'gap-y-1',
        2: 'gap-y-2',
        3: 'gap-y-3',
        4: 'gap-y-4',
        5: 'gap-y-5',
        6: 'gap-y-6',
        8: 'gap-y-8',
        10: 'gap-y-10',
        12: 'gap-y-12',
      },
    },
    defaultVariants: {
      direction: 'row',
      wrap: 'nowrap',
      align: 'stretch',
      justify: 'start',
      gap: 'md',
    },
  }
);

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {
  as?: React.ElementType;
  // Responsive breakpoints
  xs?: Partial<VariantProps<typeof flexVariants>>;
  sm?: Partial<VariantProps<typeof flexVariants>>;
  md?: Partial<VariantProps<typeof flexVariants>>;
  lg?: Partial<VariantProps<typeof flexVariants>>;
  xl?: Partial<VariantProps<typeof flexVariants>>;
  '2xl'?: Partial<VariantProps<typeof flexVariants>>;
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({
    className,
    direction,
    wrap,
    align,
    justify,
    gap,
    gapX,
    gapY,
    as: Component = 'div',
    xs,
    sm,
    md,
    lg,
    xl,
    '2xl': xl2,
    children,
    ...props
  }, ref) => {
    const getResponsiveClasses = (breakpoint: string, variants: Partial<VariantProps<typeof flexVariants>>) => {
      if (!variants) return '';

      const classes = [];

      if (variants.direction) {
        classes.push(`${breakpoint}:${flexVariants({ direction: variants.direction }).split(' ')[1]}`);
      }
      if (variants.wrap) {
        classes.push(`${breakpoint}:${flexVariants({ wrap: variants.wrap }).split(' ')[1]}`);
      }
      if (variants.align) {
        classes.push(`${breakpoint}:${flexVariants({ align: variants.align }).split(' ')[1]}`);
      }
      if (variants.justify) {
        classes.push(`${breakpoint}:${flexVariants({ justify: variants.justify }).split(' ')[1]}`);
      }
      if (variants.gap) {
        classes.push(`${breakpoint}:${flexVariants({ gap: variants.gap }).split(' ')[2]}`);
      }
      if (variants.gapX) {
        classes.push(`${breakpoint}:${flexVariants({ gapX: variants.gapX }).split(' ')[2]}`);
      }
      if (variants.gapY) {
        classes.push(`${breakpoint}:${flexVariants({ gapY: variants.gapY }).split(' ')[2]}`);
      }

      return classes.join(' ');
    };

    const responsiveClasses = cn(
      xs && getResponsiveClasses('xs', xs),
      sm && getResponsiveClasses('sm', sm),
      md && getResponsiveClasses('md', md),
      lg && getResponsiveClasses('lg', lg),
      xl && getResponsiveClasses('xl', xl),
      xl2 && getResponsiveClasses('2xl', xl2),
    );

    return (
      <Component
        ref={ref}
        className={cn(
          flexVariants({ direction, wrap, align, justify, gap, gapX, gapY }),
          responsiveClasses,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Flex.displayName = 'Flex';

// Flex Item component for specific item controls
const flexItemVariants = cva(
  '',
  {
    variants: {
      flex: {
        1: 'flex-1',
        auto: 'flex-auto',
        initial: 'flex-initial',
        none: 'flex-none',
      },
      grow: {
        0: 'grow-0',
        true: 'grow',
      },
      shrink: {
        0: 'shrink-0',
        true: 'shrink',
      },
      basis: {
        0: 'basis-0',
        '1/2': 'basis-1/2',
        '1/3': 'basis-1/3',
        '2/3': 'basis-2/3',
        '1/4': 'basis-1/4',
        '3/4': 'basis-3/4',
        '1/5': 'basis-1/5',
        '2/5': 'basis-2/5',
        '3/5': 'basis-3/5',
        '4/5': 'basis-4/5',
        '1/6': 'basis-1/6',
        '5/6': 'basis-5/6',
        full: 'basis-full',
        auto: 'basis-auto',
      },
      align: {
        auto: 'self-auto',
        start: 'self-start',
        center: 'self-center',
        end: 'self-end',
        stretch: 'self-stretch',
        baseline: 'self-baseline',
      },
    },
    defaultVariants: {
      flex: 'initial',
      grow: 0,
      shrink: true,
      basis: 'auto',
      align: 'auto',
    },
  }
);

export interface FlexItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexItemVariants> {
  // Responsive breakpoints
  xs?: Partial<VariantProps<typeof flexItemVariants>>;
  sm?: Partial<VariantProps<typeof flexItemVariants>>;
  md?: Partial<VariantProps<typeof flexItemVariants>>;
  lg?: Partial<VariantProps<typeof flexItemVariants>>;
  xl?: Partial<VariantProps<typeof flexItemVariants>>;
  '2xl'?: Partial<VariantProps<typeof flexItemVariants>>;
}

const FlexItem = React.forwardRef<HTMLDivElement, FlexItemProps>(
  ({
    className,
    flex,
    grow,
    shrink,
    basis,
    align,
    xs,
    sm,
    md,
    lg,
    xl,
    '2xl': xl2,
    children,
    ...props
  }, ref) => {
    const getResponsiveClasses = (breakpoint: string, variants: Partial<VariantProps<typeof flexItemVariants>>) => {
      if (!variants) return '';

      const classes = [];

      if (variants.flex) {
        classes.push(`${breakpoint}:${flexItemVariants({ flex: variants.flex }).split(' ')[0]}`);
      }
      if (variants.grow !== undefined) {
        classes.push(`${breakpoint}:${flexItemVariants({ grow: variants.grow }).split(' ')[1]}`);
      }
      if (variants.shrink !== undefined) {
        classes.push(`${breakpoint}:${flexItemVariants({ shrink: variants.shrink }).split(' ')[2]}`);
      }
      if (variants.basis) {
        classes.push(`${breakpoint}:${flexItemVariants({ basis: variants.basis }).split(' ')[3]}`);
      }
      if (variants.align) {
        classes.push(`${breakpoint}:${flexItemVariants({ align: variants.align }).split(' ')[4]}`);
      }

      return classes.join(' ');
    };

    const responsiveClasses = cn(
      xs && getResponsiveClasses('xs', xs),
      sm && getResponsiveClasses('sm', sm),
      md && getResponsiveClasses('md', md),
      lg && getResponsiveClasses('lg', lg),
      xl && getResponsiveClasses('xl', xl),
      xl2 && getResponsiveClasses('2xl', xl2),
    );

    return (
      <div
        ref={ref}
        className={cn(
          flexItemVariants({ flex, grow, shrink, basis, align }),
          responsiveClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FlexItem.displayName = 'FlexItem';

export { Flex, FlexItem, flexVariants, flexItemVariants };