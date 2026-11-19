'use client';

import React, { useEffect, useState } from 'react';
import { Check, X, Minus } from 'lucide-react';
import { contrastRatio } from './contrast';

// 3 章の色の見本。見本の塗りはトークンのクラスで描く（ダークに切り替えると見本も変わる）。
// 値と比は、マウント後に CSS 変数から読む（ハイドレーションの不一致を避ける）。

type Pair = {
  fg: string;
  bg: string;
  /** 4.5 / 3 / null（装飾・無効状態など、基準の対象外） */
  need: 4.5 | 3 | null;
  label: string;
};

type Swatch = {
  name: string;
  token: string;
  /** 見本の描き方 */
  kind: 'fill' | 'text' | 'surface' | 'line' | 'ring';
  cls: string;
  /** fill の上に乗せる文字のクラス */
  onCls?: string;
  checks: Pair[];
};

type Group = { title: string; note: string; swatches: Swatch[] };

const GROUPS: Group[] = [
  {
    title: 'ブランド',
    note: '基準色は brand（#3A827B）。ほかの 1 色は、ここから決まります。',
    swatches: [
      {
        name: 'brand',
        token: '--color-brand',
        kind: 'fill',
        cls: 'bg-brand',
        onCls: 'text-on-brand',
        checks: [{ fg: '--color-on-brand', bg: '--color-brand', need: 4.5, label: 'on-brand の文字' }],
      },
      {
        name: 'brand-hover',
        token: '--color-brand-hover',
        kind: 'fill',
        cls: 'bg-brand-hover',
        onCls: 'text-on-brand',
        checks: [{ fg: '--color-on-brand', bg: '--color-brand-hover', need: 4.5, label: 'on-brand の文字' }],
      },
      {
        name: 'brand-pressed',
        token: '--color-brand-pressed',
        kind: 'fill',
        cls: 'bg-brand-pressed',
        onCls: 'text-on-brand',
        checks: [{ fg: '--color-on-brand', bg: '--color-brand-pressed', need: 4.5, label: 'on-brand の文字' }],
      },
      {
        name: 'brand-muted',
        token: '--color-brand-muted',
        kind: 'fill',
        cls: 'bg-brand-muted',
        onCls: 'text-on-brand-muted',
        checks: [
          { fg: '--color-on-brand-muted', bg: '--color-brand-muted', need: 4.5, label: 'on-brand-muted の文字' },
        ],
      },
      {
        name: 'brand-subtle',
        token: '--color-brand-subtle',
        kind: 'fill',
        cls: 'bg-brand-subtle',
        onCls: 'text-text-primary',
        checks: [{ fg: '--color-text-primary', bg: '--color-brand-subtle', need: 4.5, label: 'text-primary の文字' }],
      },
      {
        name: 'brand-soft',
        token: '--color-brand-soft',
        kind: 'fill',
        cls: 'bg-brand-soft',
        checks: [
          { fg: '--color-brand-soft', bg: '--color-background-body', need: null, label: '面（body）の上。装飾の細線だけ' },
        ],
      },
      {
        name: 'on-brand',
        token: '--color-on-brand',
        kind: 'fill',
        cls: 'bg-brand',
        onCls: 'text-on-brand',
        checks: [{ fg: '--color-on-brand', bg: '--color-brand', need: 4.5, label: 'brand の塗りの上' }],
      },
      {
        name: 'text-brand',
        token: '--color-text-brand',
        kind: 'text',
        cls: 'text-brand',
        checks: [
          { fg: '--color-text-brand', bg: '--color-background-body', need: 4.5, label: 'body の上' },
          { fg: '--color-text-brand', bg: '--color-background-muted', need: 4.5, label: 'muted（Mist）の上' },
          { fg: '--color-text-brand', bg: '--color-brand-muted', need: 4.5, label: 'brand-muted の上' },
        ],
      },
      {
        name: 'ring',
        token: '--color-ring',
        kind: 'ring',
        cls: '',
        checks: [{ fg: '--color-ring', bg: '--color-background-body', need: 3, label: 'body の上（フォーカスリング）' }],
      },
    ],
  },
  {
    title: '文字',
    note: '本文は primary。補助は secondary、注記は muted。disabled は無効状態だけに使います。',
    swatches: [
      {
        name: 'text-primary',
        token: '--color-text-primary',
        kind: 'text',
        cls: 'text-text-primary',
        checks: [
          { fg: '--color-text-primary', bg: '--color-background-body', need: 4.5, label: 'body の上' },
          { fg: '--color-text-primary', bg: '--color-background-muted', need: 4.5, label: 'muted（Mist）の上' },
        ],
      },
      {
        name: 'text-secondary',
        token: '--color-text-secondary',
        kind: 'text',
        cls: 'text-text-secondary',
        checks: [
          { fg: '--color-text-secondary', bg: '--color-background-body', need: 4.5, label: 'body の上' },
          { fg: '--color-text-secondary', bg: '--color-background-muted', need: 4.5, label: 'muted（Mist）の上' },
        ],
      },
      {
        name: 'text-muted',
        token: '--color-text-muted',
        kind: 'text',
        cls: 'text-text-muted',
        checks: [
          { fg: '--color-text-muted', bg: '--color-background-body', need: 4.5, label: 'body の上' },
          { fg: '--color-text-muted', bg: '--color-background-muted', need: 4.5, label: 'muted（Mist）の上' },
        ],
      },
      {
        name: 'text-disabled',
        token: '--color-text-disabled',
        kind: 'text',
        cls: 'text-text-disabled',
        checks: [
          { fg: '--color-text-disabled', bg: '--color-background-body', need: null, label: 'body の上（無効状態だけ。対象外）' },
        ],
      },
    ],
  },
  {
    title: '面',
    note: 'ページと card は body / surface（白）。交互の帯は muted（Mist）。紺の帯は、ページ末尾の CTA だけ。',
    swatches: [
      {
        name: 'background-body',
        token: '--color-background-body',
        kind: 'surface',
        cls: 'bg-bg-primary',
        onCls: 'text-text-primary',
        checks: [{ fg: '--color-text-primary', bg: '--color-background-body', need: 4.5, label: 'text-primary の文字' }],
      },
      {
        name: 'background-surface',
        token: '--color-background-surface',
        kind: 'surface',
        cls: 'bg-bg-primary',
        onCls: 'text-text-primary',
        checks: [{ fg: '--color-text-primary', bg: '--color-background-surface', need: 4.5, label: 'text-primary の文字' }],
      },
      {
        name: 'background-muted（Mist）',
        token: '--color-background-muted',
        kind: 'surface',
        cls: 'bg-bg-secondary',
        onCls: 'text-text-primary',
        checks: [{ fg: '--color-text-primary', bg: '--color-background-muted', need: 4.5, label: 'text-primary の文字' }],
      },
      {
        name: 'background-subtle',
        token: '--color-background-subtle',
        kind: 'surface',
        cls: 'bg-bg-muted',
        onCls: 'text-text-primary',
        checks: [{ fg: '--color-text-primary', bg: '--color-background-subtle', need: 4.5, label: 'text-primary の文字' }],
      },
      {
        name: 'background-inverted',
        token: '--color-background-inverted',
        kind: 'surface',
        cls: 'bg-bg-inverted',
        onCls: 'text-text-inverse',
        checks: [{ fg: '--color-text-inverse', bg: '--color-background-inverted', need: 4.5, label: 'text-inverse の文字' }],
      },
    ],
  },
  {
    title: '線',
    note: '区切りの線は装飾なので 3:1 は求めません。入力欄の枠は、唯一の手がかりなので 3:1 が必要です。',
    swatches: [
      {
        name: 'border',
        token: '--color-border',
        kind: 'line',
        cls: 'border-border-medium',
        checks: [{ fg: '--color-border', bg: '--color-background-body', need: null, label: 'body の上（装飾。対象外）' }],
      },
      {
        name: 'border-emphasized',
        token: '--color-border-emphasized',
        kind: 'line',
        cls: 'border-border-dark',
        checks: [{ fg: '--color-border-emphasized', bg: '--color-background-body', need: null, label: 'body の上（装飾。対象外）' }],
      },
      {
        name: 'border-control',
        token: '--color-border-control',
        kind: 'line',
        cls: 'border-border-strong',
        checks: [{ fg: '--color-border-control', bg: '--color-background-body', need: 3, label: 'body の上（入力欄の枠）' }],
      },
    ],
  },
  {
    title: '状態',
    note: '塗りは白い文字で 4.5:1 以上。状態は、色だけで伝えません。かならず言葉かアイコンを添えます。',
    swatches: (['success', 'warning', 'error', 'info'] as const).flatMap((s): Swatch[] => {
      const jp = { success: '成功', warning: '注意', error: 'エラー', info: 'お知らせ' }[s];
      const fill = { success: 'bg-success', warning: 'bg-warning', error: 'bg-error', info: 'bg-info' }[s];
      const muted = { success: 'bg-success-muted', warning: 'bg-warning-muted', error: 'bg-error-muted', info: 'bg-info-muted' }[s];
      const onFill = { success: 'text-on-success', warning: 'text-on-warning', error: 'text-on-error', info: 'text-on-info' }[s];
      const onMuted = {
        success: 'text-on-success-muted',
        warning: 'text-on-warning-muted',
        error: 'text-on-error-muted',
        info: 'text-on-info-muted',
      }[s];
      return [
        {
          name: `${s}（塗り）`,
          token: `--color-${s}`,
          kind: 'fill',
          cls: fill,
          onCls: onFill,
          checks: [{ fg: `--color-on-${s}`, bg: `--color-${s}`, need: 4.5, label: `${jp}の塗りの上の文字` }],
        },
        {
          name: `${s}-muted（淡い塗り）`,
          token: `--color-${s}-muted`,
          kind: 'fill',
          cls: muted,
          onCls: onMuted,
          checks: [{ fg: `--color-on-${s}-muted`, bg: `--color-${s}-muted`, need: 4.5, label: `${jp}の淡い塗りの上の文字` }],
        },
      ];
    }),
  },
];

function readAll(): Record<string, string> {
  const out: Record<string, string> = {};
  const style = getComputedStyle(document.documentElement);
  const names = new Set<string>();
  GROUPS.forEach((g) =>
    g.swatches.forEach((s) => {
      names.add(s.token);
      s.checks.forEach((c) => {
        names.add(c.fg);
        names.add(c.bg);
      });
    })
  );
  names.forEach((n) => {
    out[n] = style.getPropertyValue(n).trim().toUpperCase();
  });
  return out;
}

function Verdict({ ratio, need }: { ratio: number | null; need: Pair["need"] }) {
  if (ratio === null) return <span className="text-text-muted">…</span>;
  if (need === null) {
    return (
      <span className="inline-flex items-center gap-1 text-text-secondary">
        <Minus className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        基準の対象外
      </span>
    );
  }
  const ok = ratio >= need;
  const word = need === 4.5 ? (ok ? 'AA 達成' : '4.5:1 未達') : ok ? '3:1 達成' : '3:1 未達';
  return ok ? (
    <span className="inline-flex items-center gap-1 font-medium text-success">
      <Check className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      {word}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 font-medium text-error">
      <X className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      {word}
    </span>
  );
}

function Sample({ s }: { s: Swatch }) {
  const box = 'flex h-20 items-center justify-center rounded-container text-base';
  switch (s.kind) {
    case 'fill':
      return (
        <div className={`${box} ${s.cls} ${s.onCls ?? ''}`} aria-hidden="true">
          {s.onCls ? 'Aa あいう' : ''}
        </div>
      );
    case 'surface':
      return (
        <div className={`${box} border border-border-medium ${s.cls} ${s.onCls ?? ''}`} aria-hidden="true">
          Aa あいう
        </div>
      );
    case 'text':
      return (
        <div className={`${box} border border-border-medium bg-bg-primary font-medium ${s.cls}`} aria-hidden="true">
          Aa あいう
        </div>
      );
    case 'line':
      return (
        <div className={`${box} border-4 bg-bg-primary text-sm text-text-secondary ${s.cls}`} aria-hidden="true">
          線の太さ 4px で表示
        </div>
      );
    case 'ring':
      return (
        <div className={`${box} border border-border-medium bg-bg-primary`} aria-hidden="true">
          <span
            className="rounded-element bg-bg-primary px-3 py-1.5 text-sm text-text-primary"
            style={{ outline: '2px solid var(--color-ring)', outlineOffset: '2px' }}
          >
            フォーカス
          </span>
        </div>
      );
  }
}

export function ColorSwatches() {
  const [values, setValues] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const update = () => setValues(readAll());
    update();
    const root = document.documentElement;
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => mo.disconnect();
  }, []);

  return (
    <div className="space-y-12">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <h3 className="text-[18px] font-bold leading-[1.5] text-text-primary md:text-[20px] [word-break:keep-all] [overflow-wrap:anywhere]">
            {g.title}
          </h3>
          <p className="mt-2 max-w-[40em] text-[15px] leading-[1.8] text-text-secondary md:text-base">{g.note}</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.swatches.map((s) => (
              <li key={s.name} className="min-w-0 rounded-container border border-border-medium bg-bg-primary p-4">
                <Sample s={s} />
                <p className="mt-3 text-sm font-medium text-text-primary [overflow-wrap:anywhere]">{s.name}</p>
                <p className="mt-0.5 text-[13px] leading-[1.6] text-text-muted [overflow-wrap:anywhere]">
                  <code className="font-mono">{s.token}</code>
                </p>
                <p className="mt-1 text-sm text-text-primary">
                  値：<span className="font-mono">{values ? values[s.token] || '…' : '…'}</span>
                </p>
                <ul className="mt-2 space-y-1.5 border-t border-border-medium pt-2">
                  {s.checks.map((c) => {
                    const ratio = values ? contrastRatio(values[c.fg] ?? '', values[c.bg] ?? '') : null;
                    return (
                      <li key={c.label} className="text-[13px] leading-[1.6] text-text-secondary">
                        <span>{c.label}：</span>
                        <span className="font-mono text-text-primary">{ratio === null ? '…' : `${ratio.toFixed(2)}:1`}</span>{' '}
                        <Verdict ratio={ratio} need={c.need} />
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
