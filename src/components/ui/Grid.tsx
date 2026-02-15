import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const gridVariants = cva(
  'grid',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7',
        8: 'grid-cols-8',
        9: 'grid-cols-9',
        10: 'grid-cols-10',
        11: 'grid-cols-11',
        12: 'grid-cols-12',
        auto: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
        'auto-sm': 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
        'auto-md': 'grid-cols-[repeat(auto-fit,minmax(300px,1fr))]',
        'auto-lg': 'grid-cols-[repeat(auto-fit,minmax(400px,1fr))]',
        none: 'grid-cols-none',
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
      rows: {
        1: 'grid-rows-1',
        2: 'grid-rows-2',
        3: 'grid-rows-3',
        4: 'grid-rows-4',
        5: 'grid-rows-5',
        6: 'grid-rows-6',
        auto: 'grid-rows-[auto]',
        minmax: 'grid-rows-[minmax(0,1fr)]',
        none: 'grid-rows-none',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
        stretch: 'justify-stretch',
      },
    },
    defaultVariants: {
      cols: 'auto',
      gap: 'md',
      align: 'stretch',
      justify: 'start',
    },
  }
);

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  // Responsive breakpoints
  xs?: VariantProps<typeof gridVariants>['cols'];
  sm?: VariantProps<typeof gridVariants>['cols'];
  md?: VariantProps<typeof gridVariants>['cols'];
  lg?: VariantProps<typeof gridVariants>['cols'];
  xl?: VariantProps<typeof gridVariants>['cols'];
  '2xl'?: VariantProps<typeof gridVariants>['cols'];
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({
    className,
    cols,
    xs,
    sm,
    md,
    lg,
    xl,
    '2xl': xl2,
    gap,
    rows,
    align,
    justify,
    children,
    ...props
  }, ref) => {
    const getColsClass = (breakpoint: string, value: VariantProps<typeof gridVariants>['cols']) => {
      if (!value) return '';
      return `${breakpoint}:${gridVariants({ cols: value }).split(' ')[1]}`;
    };

    const responsiveClasses = cn(
      xs && getColsClass('xs', xs),
      sm && getColsClass('sm', sm),
      md && getColsClass('md', md),
      lg && getColsClass('lg', lg),
      xl && getColsClass('xl', xl),
      xl2 && getColsClass('2xl', xl2),
    );

    return (
      <div
        ref={ref}
        className={cn(
          gridVariants({ cols, gap, rows, align, justify }),
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

Grid.displayName = 'Grid';

// Grid Item component
const gridItemVariants = cva(
  '',
  {
    variants: {
      span: {
        1: 'col-span-1',
        2: 'col-span-2',
        3: 'col-span-3',
        4: 'col-span-4',
        5: 'col-span-5',
        6: 'col-span-6',
        7: 'col-span-7',
        8: 'col-span-8',
        9: 'col-span-9',
        10: 'col-span-10',
        11: 'col-span-11',
        12: 'col-span-12',
        full: 'col-span-full',
        auto: 'col-auto',
      },
      rowSpan: {
        1: 'row-span-1',
        2: 'row-span-2',
        3: 'row-span-3',
        4: 'row-span-4',
        5: 'row-span-5',
        6: 'row-span-6',
        full: 'row-span-full',
        auto: 'row-auto',
      },
      start: {
        1: 'col-start-1',
        2: 'col-start-2',
        3: 'col-start-3',
        4: 'col-start-4',
        5: 'col-start-5',
        6: 'col-start-6',
        7: 'col-start-7',
        8: 'col-start-8',
        9: 'col-start-9',
        10: 'col-start-10',
        11: 'col-start-11',
        12: 'col-start-12',
        auto: 'col-auto',
      },
      align: {
        start: 'self-start',
        center: 'self-center',
        end: 'self-end',
        stretch: 'self-stretch',
        baseline: 'self-baseline',
      },
    },
    defaultVariants: {
      span: 'auto',
      rowSpan: 'auto',
      start: 'auto',
      align: 'stretch',
    },
  }
);

export interface GridItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridItemVariants> {
  // Responsive breakpoints
  xs?: VariantProps<typeof gridItemVariants>['span'];
  sm?: VariantProps<typeof gridItemVariants>['span'];
  md?: VariantProps<typeof gridItemVariants>['span'];
  lg?: VariantProps<typeof gridItemVariants>['span'];
  xl?: VariantProps<typeof gridItemVariants>['span'];
  '2xl'?: VariantProps<typeof gridItemVariants>['span'];
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({
    className,
    span,
    rowSpan,
    start,
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
    const getSpanClass = (breakpoint: string, value: VariantProps<typeof gridItemVariants>['span']) => {
      if (!value) return '';
      return `${breakpoint}:${gridItemVariants({ span: value }).split(' ')[0]}`;
    };

    const responsiveClasses = cn(
      xs && getSpanClass('xs', xs),
      sm && getSpanClass('sm', sm),
      md && getSpanClass('md', md),
      lg && getSpanClass('lg', lg),
      xl && getSpanClass('xl', xl),
      xl2 && getSpanClass('2xl', xl2),
    );

    return (
      <div
        ref={ref}
        className={cn(
          gridItemVariants({ span, rowSpan, start, align }),
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

GridItem.displayName = 'GridItem';

export { Grid, GridItem, gridVariants, gridItemVariants };