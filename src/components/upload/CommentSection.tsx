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
import BilingualText from './BilingualText';

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
      return { label: 'KO', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'ja':
      return { label: 'JA', color: 'bg-green-100 text-green-800 border-green-200' };
    case 'en':
      return { label: 'EN', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    default:
      return { label: language.toUpperCase(), color: 'bg-gray-100 text-gray-800 border-gray-200' };
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
    <section className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-600" />
          コメント
          <span className="text-sm font-normal text-slate-600">
            ({comments.length})
          </span>
        </h2>
      </div>

      {/* Comments List */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-sm text-slate-600">読み込み中...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">
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
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  {/* Comment Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {comment.author_name_display}
                      </span>
                      {isDesigner && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
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
                    <div className="flex items-center gap-1 text-xs text-slate-500">
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
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="space-y-3">
          {/* Error Display */}
          {submitError && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            disabled={isSubmitting}
            aria-label="コメント入力（Ctrl+Enterで送信）"
          />

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Ctrl+Enter または Cmd+Enter で送信
            </p>
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
                ${!newComment.trim() || isSubmitting
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
