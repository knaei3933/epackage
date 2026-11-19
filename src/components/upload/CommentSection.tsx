/**
 * Comment Section Component
 *
 * コメントセクションコンポーネント
 * - コメント一覧表示（翻訳付き）
 * - コメント入力・投稿
 * - 自動リフレッシュ
 * - 言語バッジ表示
 *
 * @client
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Send, Loader2, User, Clock } from 'lucide-react';
import { BilingualText } from './BilingualText';

// =====================================================
// Types
// =====================================================

interface DesignReviewComment {
  id: string;
  order_id: string;
  revision_id: string | null;
  content: string;
  content_translated: string | null;
  original_language: string;
  author_name_display: string;
  author_role: string;
  created_at: string;
}

interface CommentSectionProps {
  token: string;
  orderId: string;
  initialComments: DesignReviewComment[];
  onCommentsUpdate: (comments: DesignReviewComment[]) => void;
  isLoading?: boolean;
}

// =====================================================
// Helper Functions
// =====================================================

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  });
}

function getLanguageBadgeInfo(language: string): { label: string; color: string } {
  switch (language) {
    case 'ko':
      return { label: 'KO', color: 'bg-brand-muted text-brand border-brand-soft' };
    case 'ja':
      return { label: 'JA', color: 'bg-success-muted text-on-success-muted border-success' };
    case 'en':
      return { label: 'EN', color: 'bg-brand-muted text-brand border-brand-soft' };
    default:
      return { label: language.toUpperCase(), color: 'bg-bg-muted text-text-primary border-border-medium' };
  }
}

// =====================================================
// Main Component
// =====================================================

export function CommentSection({
  token,
  orderId,
  initialComments,
  onCommentsUpdate,
  isLoading = false,
}: CommentSectionProps) {
  // State
  const [comments, setComments] = useState<DesignReviewComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const commentEndRef = useRef<HTMLDivElement>(null);

  // Update comments when initialComments changes
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Handle comment submit
  const handleSubmit = async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment) {
      setSubmitError('コメントを入力してください');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/upload/${token}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: trimmedComment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'コメントの投稿に失敗しました');
      }

      const result = await response.json();

      if (result.success) {
        // Add new comment to list
        const newCommentData: DesignReviewComment = {
          id: result.comment.id,
          order_id: orderId,
          revision_id: result.comment.revision_id || null,
          author_name_display: result.comment.author_name_display || 'Korean Designer',
          author_role: result.comment.author_role || 'korea_designer',
          content: trimmedComment,
          content_translated: result.comment.content_translated || null,
          original_language: 'ko',
          created_at: new Date().toISOString(),
        };

        const updatedComments = [...comments, newCommentData];
        setComments(updatedComments);
        onCommentsUpdate(updatedComments);
        setNewComment('');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key (submit on Ctrl+Enter or Cmd+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="bg-white rounded-container border border-border-medium overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-medium bg-bg-secondary">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Send className="w-5 h-5 text-brand" />
          コメント
          <span className="text-sm font-normal text-text-secondary">
            ({comments.length})
          </span>
        </h2>
      </div>

      {/* Comments List */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
            <span className="ml-2 text-sm text-text-secondary">読み込み中...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">
              コメントはまだありません
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const langBadge = getLanguageBadgeInfo(comment.original_language);
              const isDesigner = comment.author_role === 'korea_designer';

              return (
                <div
                  key={comment.id}
                  className={`p-3 rounded-lg ${
                    isDesigner
                      ? 'bg-brand-muted border border-brand-soft'
                      : 'bg-bg-secondary border border-border-medium'
                  }`}
                >
                  {/* Comment Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-text-muted" />
                      <span className="text-sm font-medium text-text-primary">
                        {comment.author_name_display}
                      </span>
                      {isDesigner && (
                        <span className="px-2 py-0.5 bg-brand-muted text-brand rounded text-xs font-medium">
                          デザイナー
                        </span>
                      )}
                      <span className={`
                        px-2 py-0.5 rounded text-xs font-medium border
                        ${langBadge.color}
                      `}>
                        {langBadge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="w-3 h-3" />
                      {formatTime(comment.created_at)}
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="text-sm">
                    <BilingualText
                      content={comment.content}
                      content_translated={comment.content_translated}
                      original_language={comment.original_language}
                    />
                  </div>
                </div>
              );
            })}
            <div ref={commentEndRef} />
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className="p-4 border-t border-border-medium bg-bg-secondary">
        <div className="space-y-3">
          {/* Error Display */}
          {submitError && (
            <div className="p-2 bg-error-muted border border-error rounded text-sm text-on-error-muted">
              {submitError}
            </div>
          )}

          {/* Textarea */}
          <textarea
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              setSubmitError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="한국어로 댓글을 입력하세요..."
            rows={3}
            className="min-h-24 py-2 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted resize-none"
            disabled={isSubmitting}
            aria-label="コメント入力（Ctrl+Enterで送信）"
          />

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Ctrl+Enter または Cmd+Enter で送信
            </p>
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
                ${!newComment.trim() || isSubmitting
                  ? 'bg-bg-muted text-text-muted cursor-not-allowed'
                  : 'bg-brand text-white hover:bg-brand-hover'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  送信
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
