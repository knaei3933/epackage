/**
 * Next Action Banner Component (Member)
 *
 * 注文ステータスに応じた次のアクション案内バナー
 *
 * アニメーションは機能的案内のみ:
 * - action トーン: 目を引く穏やかなパルス（顧客の操作が必要な合図）
 * - success トーン: チェックマーク描画（操作結果の確認）
 * - prefers-reduced-motion 時はアニメーションなし
 *
 * @client
 */

'use client';

import { useEffect, useState } from 'react';

import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Factory,
  FilePenLine,
  Info,
  Upload,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NextActionTone =
  | 'action'    // 顧客の操作が必要
  | 'success'   // 操作完了・承認済み
  | 'info'      // 進行中・案内
  | 'warning'   // 注意
  | 'error';    // 拒否・エラー

/**
 * 아이콘 지정용 직렬화 가능 키 (Server Component → Client Component 전달용).
 * 컴포넌트 자체는 함수라 직렬화할 수 없으므로 키 문자열로만 받는다.
 */
export type NextActionIconKey =
  | 'clipboard'
  | 'filePen'
  | 'factory'
  | 'upload'
  | 'clock'
  | 'check'
  | 'warning'
  | 'error';

const ICON_BY_KEY: Record<NextActionIconKey, LucideIcon> = {
  clipboard: ClipboardCheck,
  filePen: FilePenLine,
  factory: Factory,
  upload: Upload,
  clock: Clock,
  check: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

interface NextActionBannerProps {
  tone: NextActionTone;
  title: string;
  description?: string;
  /** tone='action' で入稿案内時に使用するアイコン指定（デフォルトは tone 別） */
  /** Server Component에서는 사용할 수 없다 — iconKey를 사용할 것 */
  icon?: LucideIcon;
  /** 직렬화 가능한 아이콘 키 (Server Component 안전) */
  iconKey?: NextActionIconKey;
  /**
   * スクロール中も画面上部に固定表示するか。
   * デフォルト: action トーン（顧客の操作が必要な案内）のみ固定。
   * 情報系バナーは固定しない（通常の流れで表示）。
   */
  sticky?: boolean;
  className?: string;
}

const TONE_STYLES: Record<
  NextActionTone,
  { container: string; iconBg: string; icon: string; title: string; desc: string; defaultIcon: LucideIcon }
> = {
  action: {
    container: 'bg-orange-50 border-orange-300',
    iconBg: 'bg-orange-100',
    icon: 'text-orange-600',
    title: 'text-orange-900',
    desc: 'text-orange-700',
    defaultIcon: Upload,
  },
  success: {
    container: 'bg-green-50 border-green-300',
    iconBg: 'bg-green-100',
    icon: 'text-green-600',
    title: 'text-green-900',
    desc: 'text-green-700',
    defaultIcon: CheckCircle2,
  },
  info: {
    container: 'bg-blue-50 border-blue-300',
    iconBg: 'bg-blue-100',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    desc: 'text-blue-700',
    defaultIcon: Clock,
  },
  warning: {
    container: 'bg-amber-50 border-amber-300',
    iconBg: 'bg-amber-100',
    icon: 'text-amber-600',
    title: 'text-amber-900',
    desc: 'text-amber-700',
    defaultIcon: AlertTriangle,
  },
  error: {
    container: 'bg-red-50 border-red-300',
    iconBg: 'bg-red-100',
    icon: 'text-red-600',
    title: 'text-red-900',
    desc: 'text-red-700',
    defaultIcon: XCircle,
  },
};

export function NextActionBanner({
  tone,
  title,
  description,
  icon,
  iconKey,
  sticky,
  className,
}: NextActionBannerProps) {
  const prefersReducedMotion = useReducedMotion();
  // SSR/초기 클라이언트 렌더 일치를 위해 마운트 전에는 비애니메이션 버전 사용
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const disableAnimation = !isMounted || !!prefersReducedMotion;
  const styles = TONE_STYLES[tone];
  const Icon = (iconKey && ICON_BY_KEY[iconKey]) || icon || styles.defaultIcon;
  // action トーン（要対応）はデフォルトでスティッキー。明示指定ならそれに従う
  const isSticky = sticky ?? tone === 'action';

  return (
    <div
      role="status"
      className={cn(
        'p-4 border-2 rounded-lg flex items-center gap-3',
        styles.container,
        isSticky &&
          // サイトヘッダー(sticky top-0 h-16 z-50)の直下に固定
          'sticky top-16 z-30 shadow-lg shadow-black/10 backdrop-blur-sm',
        className
      )}
    >
      <div className="relative flex-shrink-0">
        {tone === 'action' && !disableAnimation && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: 'rgb(251 146 60 / 0.3)' }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 0.15, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        <div
          className={cn(
            'relative w-10 h-10 rounded-full flex items-center justify-center',
            styles.iconBg
          )}
        >
          {tone === 'success' && !disableAnimation ? (
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex"
            >
              <Icon className={cn('w-5 h-5', styles.icon)} />
            </motion.span>
          ) : (
            <Icon className={cn('w-5 h-5', styles.icon)} />
          )}
        </div>
      </div>
      <div className="flex-1">
        <p className={cn('font-medium', styles.title)}>{title}</p>
        {description && (
          <p className={cn('text-sm mt-1', styles.desc)}>{description}</p>
        )}
      </div>
    </div>
  );
}

/** info トーンの別名（進行中表示に Info アイコンを使いたい場合） */
export function InfoBanner(props: Omit<NextActionBannerProps, 'tone'>) {
  return <NextActionBanner {...props} tone="info" icon={props.icon ?? Info} />;
}
