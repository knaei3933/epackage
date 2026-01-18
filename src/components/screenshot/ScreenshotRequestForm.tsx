/**
 * Screenshot Request Form Component
 *
 * スクリーンショットリクエストフォームコンポーネントです。
 * - URL入力
 * - 複数URL管理
 * - 優先順位設定
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Card, Textarea } from '@/components/ui';

export interface ScreenshotRequestFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function ScreenshotRequestForm({ onSuccess, onError }: ScreenshotRequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [urls, setUrls] = useState<string[]>(['']);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;

    // 有効なURLのみフィルタリング
    const validUrls = urls.filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      setServerError('最低1つの有効なURLを入力してください。');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          referenceUrls: validUrls,
          priority,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'スクリーンショットリクエストが失敗しました。');
      }

      onSuccess?.();

      // 生成されたリクエストの詳細ページへ移動または一覧へ移動
      router.push('/screenshot/history');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'スクリーンショットリクエストが失敗しました。';
      setServerError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addUrl = () => {
    setUrls([...urls, '']);
  };

  const removeUrl = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit}>
        {/* サーバーエラーメッセージ */}
        {serverError && (
          <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
            <p className="text-sm text-error-600 dark:text-error-400">{serverError}</p>
          </div>
        )}

        {/* タイトル */}
        <Input
          label="제목 / タイトル"
          name="title"
          placeholder="スクリーンショットリクエストタイトル"
          required
          className="mb-4"
        />

        {/* 説明 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-2">
            説明 / 説明 (オプション)
          </label>
          <Textarea
            name="description"
            placeholder="スクリーンショットリクエストの説明を入力してください。"
            rows={3}
            className="w-full"
          />
        </div>

        {/* URL一覧 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-primary">
              참조 URL / 参照URL *
            </label>
            <button
              type="button"
              onClick={addUrl}
              className="text-sm text-brixa-500 hover:text-brixa-600"
            >
              + URL追加 / 追加
            </button>
          </div>

          {urls.map((url, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                required
                className="flex-1"
              />
              {urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrl(index)}
                  className="px-3 py-2 text-error-500 hover:text-error-600"
                >
                  削除 / 削除
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 優先順位 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-2">
            우선순위 / 優先順位
          </label>
          <select
            name="priority"
            defaultValue="NORMAL"
            className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-brixa-500"
          >
            <option value="LOW">低 / 低</option>
            <option value="NORMAL">普通 / 普通</option>
            <option value="HIGH">高 / 高</option>
            <option value="URGENT">緊急 / 緊急</option>
          </select>
        </div>

        {/* 送信ボタン */}
        <div className="flex gap-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? '送信中... / 送信中...' : 'スクリーンショットリクエスト / リクエスト'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            キャンセル / キャンセル
          </Button>
        </div>
      </form>
    </Card>
  );
}
