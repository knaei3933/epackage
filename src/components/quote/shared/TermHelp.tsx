'use client';

import React, { useId, useState } from 'react';

/**
 * 専門語の短い説明。説明は、事実だけ。分からない語は、ここに足さない。
 * （素材の略号は、別の場所で説明している）
 */
export const QUOTE_TERM_HELP = {
  gusset: {
    label: 'ガゼット',
    text: '袋の側面や底に入れる、折りこみの部分です。ここが広がって、袋にふくらみ（マチ）ができます。',
  },
  spout: {
    label: 'スパウト',
    text: '液体などを入れたり、注いだりするために、袋につける注ぎ口です。',
  },
  valve: {
    label: 'ガス抜きバルブ',
    text: '袋の中にたまったガスを、外に出すための小さな弁です。',
  },
  vNotch: {
    label: 'Vノッチ',
    text: '袋のふちに入れる、V字の小さな切りこみです。ここから手で袋を開けやすくなります。',
  },
  roundCorner: {
    label: '角丸',
    text: '袋の四隅を、丸く仕上げる加工です。',
  },
  sealWidth: {
    label: 'シール幅',
    text: '袋のふちを、熱で貼り合わせている部分の幅です（単位はmm）。',
  },
  sku: {
    label: 'SKU',
    text: '柄や中身が違うものを、別々に数えるときの単位です。同じ袋でも、柄が違えば別のSKUになります。',
  },
  pattern: {
    label: 'パターン',
    text: '数量の組み合わせの案です。パターンごとに合計数量と価格を計算して、並べて比べられます。',
  },
  gravure: {
    label: 'グラビア印刷',
    text: '印刷用の版（シリンダー）を作って刷る方法です。版を作る費用がかかります。',
  },
  copperPlate: {
    label: '銅版費用',
    text: 'グラビア印刷で使う版を作る費用です。色の数に応じて加算されます。',
  },
} as const;

export type QuoteTermKey = keyof typeof QUOTE_TERM_HELP;

interface TermHelpProps {
  term: QuoteTermKey;
  className?: string;
}

/**
 * 「?」ボタン。押す（Enter / スペース）と、短い説明が開く。もう一度押すか、Esc で閉じる。
 * ボタンの押せる範囲は 44px 以上。
 */
export function TermHelp({ term, className = '' }: TermHelpProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const { label, text } = QUOTE_TERM_HELP[term];

  return (
    <>
      <button
        type="button"
        aria-label={`${label}の説明`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={(e) => {
          // <label> の中に置かれても、入力欄を動かさない
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${className}`}
      >
        <span
          aria-hidden="true"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-border-strong bg-bg-primary text-xs font-bold text-text-primary"
        >
          ?
        </span>
      </button>
      {open && (
        <span
          id={panelId}
          role="note"
          className="my-1 block w-full basis-full rounded-container border border-border-medium bg-bg-secondary p-3 text-sm font-normal leading-relaxed text-text-primary"
        >
          <strong className="font-bold">{label}：</strong>
          {text}
        </span>
      )}
    </>
  );
}
