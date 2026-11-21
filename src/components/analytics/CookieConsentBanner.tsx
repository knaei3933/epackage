'use client';

/**
 * Cookie 同意バナー（標準モデル + Google Consent Mode v2 連携）
 *
 * 機能:
 * - 初回訪問時のみ下部にバナー表示（未同意時のみ）
 * - 「すべて許可」「すべて拒否」「詳細設定」の3アクション（小さな帯。ボタンは44px以上。印刷では隠す）
 * - 設定パネルで 分析 / マーケティング を個別切替（必須は固定）
 * - 同意状態は localStorage に12ヶ月保存（consent.ts 経由）
 * - mount 時に保存済み同意を gtag に反映（applyStoredConsent）
 *
 * SSR 対策: mounted フラグで hydration 後にのみ表示（mismatch 防止）
 * 法令対応: 2025年4月個人情報保護法改正
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  hasConsent,
  grantAll,
  denyAll,
  savePreferences,
  applyStoredConsent,
} from '@/lib/analytics/consent';

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // mount 時: 保存済み同意を gtag に反映 + 未同意ならバナー表示
  useEffect(() => {
    applyStoredConsent();
    setMounted(true);
    if (!hasConsent()) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    grantAll();
    setVisible(false);
  };

  const handleDenyAll = () => {
    denyAll();
    setVisible(false);
  };

  const handleSavePreferences = () => {
    savePreferences({ analytics, marketing });
    setVisible(false);
  };

  // バナーが開いている間だけ、ページの下に同じ高さの余白を足す（下の操作を隠さないため）
  const bannerRef = useRef<HTMLDivElement>(null);
  const isOpen = mounted && visible;
  useEffect(() => {
    if (!isOpen) return;
    const el = bannerRef.current;
    if (!el) return;
    const previous = document.body.style.paddingBottom;
    const root = document.documentElement;
    const apply = () => {
      document.body.style.paddingBottom = `${el.offsetHeight}px`;
      // 右下のチャットの丸ボタンなどを、バナーの上に逃がすために、高さを公開する
      root.style.setProperty('--cookie-banner-h', `${el.offsetHeight}px`);
    };
    apply();
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(apply);
      observer.observe(el);
    }
    return () => {
      observer?.disconnect();
      document.body.style.paddingBottom = previous;
      root.style.removeProperty('--cookie-banner-h');
    };
  }, [isOpen, showSettings]);

  // SSR 中・同意済みの場合は非表示
  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-label="Cookie 同意バナー"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-medium bg-bg-primary print:hidden"
    >
      <div className="mx-auto max-h-[80vh] max-w-4xl overflow-y-auto px-4 py-3 sm:px-6">
        {!showSettings ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-sm leading-snug text-text-secondary">
              <span className="font-medium text-text-primary">Cookie を使います。</span>
              アクセス解析と広告のために、閲覧情報を集めます。
            </p>
            <div className="flex flex-shrink-0 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowSettings(true)}
                className="min-h-11 flex-1 px-3 sm:flex-none"
              >
                詳細設定
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDenyAll}
                className="min-h-11 flex-1 px-3 sm:flex-none"
              >
                すべて拒否
              </Button>
              <Button
                type="button"
                onClick={handleAcceptAll}
                className="min-h-11 flex-1 px-3 sm:flex-none"
              >
                すべて許可
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary">Cookie の設定</h2>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-text-secondary hover:text-text-primary"
                aria-label="戻る"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-2 text-sm text-text-secondary">
              どの Cookie を許可するか選んでください。設定は、いつでも変えられます。
              <Link
                href="/privacy"
                className="ml-1 inline-flex min-h-11 items-center text-brand underline underline-offset-4 hover:text-brand-hover"
              >
                プライバシーポリシー
              </Link>
            </p>

            <ConsentToggle
              title="必須 Cookie"
              description="サイトの基本の動きに必要です。無効にできません。"
              checked={true}
              disabled={true}
            />
            <ConsentToggle
              title="分析 Cookie"
              description="アクセス解析で、使われ方を調べて改善します（Google Analytics 4）。"
              checked={analytics}
              onChange={setAnalytics}
            />
            <ConsentToggle
              title="マーケティング Cookie"
              description="関連する案内の表示と、広告の効果をはかります（Google Ads）。"
              checked={marketing}
              onChange={setMarketing}
            />

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button type="button" onClick={handleSavePreferences} className="min-h-11 flex-1">
                選択を保存
              </Button>
              <Button type="button" variant="secondary" onClick={handleAcceptAll} className="min-h-11 flex-1">
                すべて許可
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ConsentToggleProps {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

function ConsentToggle({ title, description, checked, disabled, onChange }: ConsentToggleProps) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-t border-border-medium first:border-t-0">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`inline-flex min-h-11 min-w-11 flex-shrink-0 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            checked ? 'bg-brand' : 'bg-border-strong'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-bg-primary transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </span>
      </button>
    </div>
  );
}
