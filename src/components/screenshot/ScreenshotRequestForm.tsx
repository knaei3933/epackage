/**
 * Screenshot Request Form Component
 *
 * 스크린샷 요청 폼 컴포넌트입니다.
 * - URL 입력
 * - 여러 URL 관리
 * - 우선순위 설정
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

    // 유효한 URL만 필터링
    const validUrls = urls.filter(url => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      setServerError('최소 1개의 유효한 URL을 입력해주세요.');
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
        throw new Error(result.error || '스크린샷 요청에 실패했습니다.');
      }

      onSuccess?.();

      // 생성된 요청의 상세 페이지로 이동 또는 목록으로 이동
      router.push('/screenshot/history');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '스크린샷 요청에 실패했습니다.';
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
        {/* 서버 에러 메시지 */}
        {serverError && (
          <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
            <p className="text-sm text-error-600 dark:text-error-400">{serverError}</p>
          </div>
        )}

        {/* 제목 */}
        <Input
          label="제목 / タイトル"
          name="title"
          placeholder="스크린샷 요청 제목"
          required
          className="mb-4"
        />

        {/* 설명 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-2">
            설명 / 説明 (선택사항)
          </label>
          <Textarea
            name="description"
            placeholder="스크린샷 요청에 대한 설명을 입력하세요."
            rows={3}
            className="w-full"
          />
        </div>

        {/* URL 목록 */}
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
              + URL 추가 / 追加
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
                  삭제 / 削除
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 우선순위 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-2">
            우선순위 / 優先順位
          </label>
          <select
            name="priority"
            defaultValue="NORMAL"
            className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-brixa-500"
          >
            <option value="LOW">낮음 / 低</option>
            <option value="NORMAL">보통 / 普通</option>
            <option value="HIGH">높음 / 高</option>
            <option value="URGENT">긴급 / 緊急</option>
          </select>
        </div>

        {/* 제출 버튼 */}
        <div className="flex gap-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? '제출 중... / 提出中...' : '스크린샷 요청 / リクエスト'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소 / キャンセル
          </Button>
        </div>
      </form>
    </Card>
  );
}
