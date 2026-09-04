'use client';

/**
 * Admin Samples Client
 *
 * サンプル依頼一覧 + ラベル再印字ボタン（label_prints pending ジョブ作成）。
 * 印刷本体は事務所 PC のラベルエージェントが実行する（60秒ポーリング）。
 */

import { useCallback, useEffect, useState } from 'react';
import type { SampleRequestListItem } from '@/lib/admin/sample-labels';

const PRINT_STATUS_LABELS: Record<string, string> = {
  unprinted: '未印刷',
  pending: '印刷待ち',
  printing: '印刷中',
  printed: '印刷済',
  failed: '失敗',
  partial: '一部印刷',
};

const PRINT_STATUS_CLASSES: Record<string, string> = {
  printed: 'bg-green-100 text-green-800',
  pending: 'bg-blue-100 text-blue-800',
  printing: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
  partial: 'bg-yellow-100 text-yellow-800',
  unprinted: 'bg-gray-100 text-gray-700',
};

export default function AdminSamplesClient() {
  const [items, setItems] = useState<SampleRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reprintingId, setReprintingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);
  const [profilesLookupFailed, setProfilesLookupFailed] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/samples', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setProfilesLookupFailed(Boolean(data.profilesLookupFailed));
    } catch (e) {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const handleReprint = useCallback(async (item: SampleRequestListItem) => {
    setReprintingId(item.id);
    setToast(null);
    try {
      const res = await fetch(`/api/admin/samples/${item.id}/reprint`, { method: 'POST' });
      const data = await res.json();
      setToast({
        ok: res.ok && data.success,
        message: data.message ?? (res.ok ? 'リクエスト完了' : '再印字に失敗しました'),
      });
      if (res.ok && data.success) await fetchItems();
    } catch {
      setToast({ ok: false, message: '通信エラーが発生しました' });
    } finally {
      setReprintingId(null);
    }
  }, [fetchItems]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">サンプル依頼管理</h1>
        <button
          type="button"
          onClick={() => void fetchItems()}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          更新
        </button>
      </div>

      {toast && (
        <div
          role="status"
          className={`mb-4 rounded border px-4 py-3 text-sm ${
            toast.ok
              ? 'border-green-300 bg-green-50 text-green-800'
              : 'border-red-300 bg-red-50 text-red-800'
          }`}
        >
          {toast.message}
        </div>
      )}

      {profilesLookupFailed && (
        <div className="mb-4 rounded border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          회원 이름 조회에 일시적 실패가 있었습니다. 일부 고객명이 게스트로 표시될 수 있습니다.
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-500">読み込み中...</div>
      ) : error ? (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-gray-500">サンプル依頼はまだありません</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">受付番号</th>
                <th className="px-4 py-3 text-left font-medium">受付日時</th>
                <th className="px-4 py-3 text-left font-medium">顧客名</th>
                <th className="px-4 py-3 text-left font-medium">宛先</th>
                <th className="px-4 py-3 text-left font-medium">印刷状態</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {items.map((item) => (
                <tr key={item.id} data-testid={`sample-row-${item.requestNumber}`}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono">{item.requestNumber}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(item.createdAt).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-4 py-3">{item.customerName ?? '（ゲスト）'}</td>
                  <td className="px-4 py-3">
                    <ul className="space-y-1">
                      {item.destinations.map((d) => (
                        <li key={d.id} className="flex items-center gap-2">
                          <span>{d.companyName ?? d.contactPerson}</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-xs ${PRINT_STATUS_CLASSES[d.printStatus] ?? 'bg-gray-100'}`}
                          >
                            {PRINT_STATUS_LABELS[d.printStatus] ?? d.printStatus}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{item.printSummary}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      data-testid={`reprint-${item.requestNumber}`}
                      disabled={reprintingId === item.id}
                      onClick={() => void handleReprint(item)}
                      className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {reprintingId === item.id ? '処理中...' : 'ラベル再印刷'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
