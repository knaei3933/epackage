'use client';

/**
 * Cookie 同意バナー（標準モデル + Google Consent Mode v2 連携）
 *
 * 機能:
 * - 初回訪問時のみ下部にバナー表示（未同意時のみ）
 * - 「すべて許可」「すべて拒否」「設定」の3アクション
 * - 設定パネルで 分析 / マーケティング を個別切替（必須は固定）
 * - 同意状態は localStorage に12ヶ月保存（consent.ts 経由）
 * - mount 時に保存済み同意を gtag に反映（applyStoredConsent）
 *
 * SSR 対策: mounted フラグで hydration 後にのみ表示（mismatch 防止）
 * 法令対応: 2025年4月個人情報保護法改正
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
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

  // SSR 中・同意済みの場合は非表示
  if (!mounted || !visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie 同意バナー"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-4xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {!showSettings ? (
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-9 h-9 bg-brixa-100 dark:bg-brixa-900 rounded-lg flex items-center justify-center">
                <Cookie className="h-5 w-5 text-brixa-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-text-primary mb-1">
                  Cookie の使用について
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  当サイトでは、サービス向上のため Cookie を使用します。分析（アクセス解析）とマーケティング（広告）の目的で、お客様の閲覧情報を収集します。詳しくは
                  <Link
                    href="/privacy"
                    className="text-brixa-600 hover:text-brixa-700 underline ml-1"
                  >
                    プライバシーポリシー
                  </Link>
                  をご覧ください。
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="text-sm font-medium text-text-secondary hover:text-text-primary px-4 py-2 transition-colors order-3 sm:order-1"
              >
                設定
              </button>
              <button
                type="button"
                onClick={handleDenyAll}
                className="text-sm font-medium px-5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-text-primary hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors order-2 sm:order-2"
              >
                すべて拒否
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-brixa-600 text-white hover:bg-brixa-700 transition-colors order-1 sm:order-3"
              >
                すべて許可
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-primary">
                Cookie の設定
              </h2>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-text-secondary hover:text-text-primary"
                aria-label="戻る"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              どの Cookie を許可するか選択してください。設定はいつでも変更できます。
            </p>

            {/* 必須（固定・制御不可） */}
            <ConsentToggle
              title="必須 Cookie"
              description="ウェブサイトの基本機能に必須。無効にできません。"
              checked={true}
              disabled={true}
            />

            {/* 分析 */}
            <ConsentToggle
              title="分析 Cookie"
              description="アクセス解析による利用状況の分析と改善（Google Analytics 4）。"
              checked={analytics}
              onChange={setAnalytics}
            />

            {/* マーケティング */}
            <ConsentToggle
              title="マーケティング Cookie"
              description="関連製品・サービスのご案内と広告効果の測定（Google Ads）。"
              checked={marketing}
              onChange={setMarketing}
            />

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-5">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-brixa-600 text-white hover:bg-brixa-700 transition-colors flex-1"
              >
                選択を保存
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="text-sm font-medium px-5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-text-primary hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex-1"
              >
                すべて許可
              </button>
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
    <div className="flex items-start justify-between gap-3 py-3 border-t border-gray-100 dark:border-slate-700 first:border-t-0">
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
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors
          ${checked ? 'bg-brixa-600' : 'bg-gray-300 dark:bg-slate-600'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}
