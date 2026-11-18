import { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

/**
 * @deprecated Use `Card`. Epackage UI 基準 v1 ではガラス風（ぼかし・半透明）を使わない。
 * 互換のため、Card と同じ見た目の薄い別名として残している。
 */
export const GlassCard = ({ children, className, hoverEffect = false, onClick }: GlassCardProps) => {
  return (
    <Card
      onClick={onClick}
      variant={hoverEffect ? 'interactive' : 'default'}
      size="none"
      className={cn('overflow-hidden', className)}
    >
      {children}
    </Card>
  );
};
