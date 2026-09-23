/**
 * Intake Checklist Modal (Member)
 *
 * 入稿前チェックリスト — 印刷データ作成ガイドの必須事項を簡潔化。
 * 全項目に同意チェックを入れた場合のみアップロードに進める（免責事項の告知義務）。
 *
 * @client
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntakeChecklistModalProps {
  isOpen: boolean;
  /** チェックリスト同意後に呼ばれる（アップロード実行） */
  onConfirm: () => void;
  onCancel: () => void;
}

const CHECKLIST_ITEMS = [
  {
    title: 'カラーモード・プロファイル',
    detail: 'CMYKモード・Japan Color 2001 Coated 設定。特色（DIC・PANTONE）は使用しない。',
  },
  {
    title: 'テキスト・画像の処理',
    detail: 'テキストはすべてアウトライン化、画像は埋め込み＋300dpi以上。',
  },
  {
    title: 'サイズ・塗り足し・安全領域',
    detail: '実寸＋塗り足し3mm（BOX型は5mm）。重要情報は切断線から5mm以上内側に配置。',
  },
  {
    title: 'レイヤー構成',
    detail: '「1design」レイヤーに分割＋クリッピングマスクで整理。白版は別レイヤーでベクトルデータのみ。',
  },
  {
    title: 'グロス・マット加工',
    detail: 'デジタル印刷は全体グロス/マットのいずれかのみ対応（部分加工は不可）。',
  },
  {
    title: '加工位置の指定',
    detail: 'ノッチ・チャック・吊り下げ穴などの位置は正確に指定する。',
  },
  {
    title: '色誤差・裁断誤差への同意',
    detail: 'デジタル印刷はグラビア・オフセットと色味が異なる場合があり、CMYK比率により色誤差が生じる。裁断にも微小な誤差が生じる。',
  },
];

export function IntakeChecklistModal({ isOpen, onConfirm, onCancel }: IntakeChecklistModalProps) {
  const [checked, setChecked] = useState<boolean[]>(() => CHECKLIST_ITEMS.map(() => false));
  const allChecked = checked.every(Boolean);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="入稿前チェックリスト"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">作業前にご確認ください</h3>
            <p className="text-sm text-gray-600 mt-1">
              EPackageLabではご入稿データの編集は行いません。印刷事故を防ぐため、以下を確認してください。
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {CHECKLIST_ITEMS.map((item, index) => (
            <label
              key={index}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors',
                checked[index]
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              )}
            >
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={(e) => {
                  setChecked((prev) => prev.map((v, i) => (i === index ? e.target.checked : v)));
                }}
                className="mt-0.5 w-5 h-5 flex-shrink-0 accent-emerald-600"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  {index + 1}. {item.title}
                </span>
                <span className="block text-xs text-gray-600 mt-0.5">{item.detail}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-5">
          <p className="text-xs text-gray-800 leading-relaxed">
            <strong className="text-red-700">免責事項：</strong>
            上記ガイドラインに従わないデータ（RGBモード、未アウトライン、塗り足し不足など）による
            印刷不良・色ズレ・文字欠け等が発生した場合、弊社では責任を負いかねます。
            ご不明な点はアップロード前にお問い合わせください。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={!allChecked}
            className={cn(
              'flex-1 h-12 rounded-lg font-bold transition-all',
              allChecked
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {allChecked
              ? '同意してアップロード'
              : `${checked.filter(Boolean).length}/${CHECKLIST_ITEMS.length} 項目にチェック`}
          </button>
        </div>
      </div>
    </div>
  );
}
