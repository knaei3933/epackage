'use client';

/**
 * Order Comments Section Component
 *
 * 注文コメントセクションコンポーネント
 * - コメント一覧表示
 * - コメント投稿
 * - 作成者役割別表示 (管理者/顧客)
 *
 * @module components/orders/OrderCommentsSection
 */

import { useState, useEffect, useCallback, memo } from 'react';
import DOMPurify from 'dompurify';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Textarea, Badge } from '@/components/ui';
import { Shield, User, MessageSquare, Clock, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================
// Types
// ============================================================

interface OrderComment {
  id: string;
  order_id: string;
  content: string;
  comment_type: string;
  author_id: string;
  author_role: 'customer' | 'admin' | 'korean_member' | 'production';
  is_internal: boolean;
  visibility?: 'all' | 'admin_only' | 'korean_only';
  attachments: string[];
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  author?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface OrderCommentsSectionProps {
  orderId: string;
  currentUserId?: string; // Current user ID for permission check
  fetchFn?: typeof fetch; // Optional custom fetch function (e.g., adminFetch)
  compact?: boolean; // コンパクトモード（デフォルト: false）
  maxHeight?: string; // 最大高さ（スクロール用）
}

// ============================================================
// Constants
// ============================================================

const DELETE_TIME_LIMIT_HOURS = 24; // 削除可能時間（時間）

// ============================================================
// Component
// ============================================================

export function OrderCommentsSection({ orderId, currentUserId, fetchFn = fetch, compact = false, maxHeight = '300px' }: OrderCommentsSectionProps) {
  const [comments, setComments] = useState<OrderComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);

  // コンパクトモード: 表示するコメント数を制限
  const INITIAL_VISIBLE_COUNT = 3;
  const visibleComments = compact && !showAllComments
    ? comments.slice(0, INITIAL_VISIBLE_COUNT)
    : comments;
  const hiddenCount = comments.length - INITIAL_VISIBLE_COUNT;

  // Load comments - memoized with useCallback
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFn(`/api/member/orders/${orderId}/comments`);
      const result = await response.json();

      if (result.success) {
        setComments(result.data || []);
      } else {
        setError(result.error || 'コメントの読み込みに失敗しました。');
      }
    } catch (err) {
      console.error('[OrderCommentsSection] Load error:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Submit new comment - memoized with useCallback
  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetchFn(`/api/member/orders/${orderId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          comment_type: 'general',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewComment('');
        await loadComments(); // Reload comments
      } else {
        setError(result.error || 'コメントの投稿に失敗しました。');
      }
    } catch (err) {
      console.error('[OrderCommentsSection] Submit error:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setSubmitting(false);
    }
  }, [newComment, orderId, loadComments]);

  // Delete comment - memoized with useCallback
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!confirm('このコメントを削除してもよろしいですか？')) {
      return;
    }

    try {
      setDeletingId(commentId);
      setError(null);

      const response = await fetchFn(`/api/member/orders/${orderId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await loadComments(); // Reload comments
      } else {
        setError(result.error || 'コメントの削除に失敗しました。');
      }
    } catch (err) {
      console.error('[OrderCommentsSection] Delete error:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setDeletingId(null);
    }
  }, [orderId, loadComments]);

  // Check if comment can be deleted (owner + within 24 hours)
  const canDeleteComment = useCallback((comment: OrderComment): boolean => {
    if (!currentUserId) return false;

    // Check ownership
    if (comment.author_id !== currentUserId) return false;

    // Check time limit (24 hours)
    const createdAt = new Date(comment.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    return hoursSinceCreation <= DELETE_TIME_LIMIT_HOURS;
  }, [currentUserId]);

  // Get deletion reason message
  const getDeletionMessage = useCallback((comment: OrderComment): string | null => {
    if (!currentUserId) return null;

    if (comment.author_id !== currentUserId) {
      return '自分のコメントのみ削除できます';
    }

    const createdAt = new Date(comment.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation > DELETE_TIME_LIMIT_HOURS) {
      return `作成から${DELETE_TIME_LIMIT_HOURS}時間を経過したコメントは削除できません`;
    }

    return null;
  }, [currentUserId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [orderId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          コメント
          <span className="text-sm font-normal text-muted-foreground">
            ({comments.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent
        className={`space-y-4 ${compact ? 'overflow-y-auto' : ''}`}
        style={compact ? { maxHeight } : undefined}
      >
        {/* Error message */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* New comment form */}
        <div className="space-y-3">
          <Textarea
            placeholder="コメントを入力してください..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            disabled={submitting}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              size="sm"
            >
              {submitting ? '投稿中...' : 'コメントを投稿'}
            </Button>
          </div>
        </div>

        {/* Comments list */}
        <div className={`space-y-3 ${compact ? 'flex-1 overflow-y-auto' : ''}`}>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              コメントを読み込み中...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              まだコメントはありません。
            </div>
          ) : (
            <>
              {visibleComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-lg border ${
                    comment.author_role === 'admin'
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      comment.author_role === 'admin' || comment.author_role === 'korean_member'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {comment.author_role === 'admin' || comment.author_role === 'korean_member' ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.author?.full_name || '不明'}
                          </span>
                          {comment.author_role === 'admin' && (
                            <Badge variant="secondary" className="text-xs">
                              管理者
                            </Badge>
                          )}
                          {comment.author_role === 'korean_member' && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                              韓国メンバー
                            </Badge>
                          )}
                          {comment.author_role === 'production' && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                              生産
                            </Badge>
                          )}
                          {comment.is_internal && (
                            <Badge variant="outline" className="text-xs">
                              内部
                            </Badge>
                          )}
                        </div>
                        {/* Delete button */}
                        {canDeleteComment(comment) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingId === comment.id}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={getDeletionMessage(comment) || 'コメントを削除'}
                          >
                            {deletingId === comment.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      <p
                        className={`text-sm whitespace-pre-wrap break-words ${compact ? 'line-clamp-2' : ''}`}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(comment.content, {
                            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
                            ALLOWED_ATTR: ['href'],
                          }),
                        }}
                      />
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(comment.created_at)}
                        </div>
                        {getDeletionMessage(comment) && (
                          <div className="flex items-center gap-1 text-muted-foreground/70">
                            <AlertCircle className="w-3 h-3" />
                            {getDeletionMessage(comment)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* さらに表示ボタン */}
              {compact && hiddenCount > 0 && !showAllComments && (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                >
                  さらに{hiddenCount}件を表示
                </button>
              )}
              {compact && showAllComments && comments.length > INITIAL_VISIBLE_COUNT && (
                <button
                  onClick={() => setShowAllComments(false)}
                  className="w-full text-center py-2 text-sm text-muted-foreground hover:text-text-primary hover:bg-muted rounded transition-colors"
                >
                  折りたたむ
                </button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize component to prevent unnecessary re-renders
OrderCommentsSection = memo(OrderCommentsSection) as typeof OrderCommentsSection;

// ============================================================
// Wrapper Component - Provides current user ID
// ============================================================

interface OrderCommentsSectionWrapperProps {
  orderId: string;
  fetchFn?: typeof fetch; // Optional custom fetch function (e.g., adminFetch)
  compact?: boolean; // コンパクトモード
  maxHeight?: string; // 最大高さ
}

export function OrderCommentsSectionWrapper({ orderId, fetchFn, compact, maxHeight }: OrderCommentsSectionWrapperProps) {
  // Try to use AuthContext, but handle case where it's not available (admin pages)
  let currentUserId: string | undefined = undefined;

  try {
    const { user } = useAuth();
    currentUserId = user?.id;
  } catch (error) {
    // AuthProvider not available (admin pages), currentUserId remains undefined
    console.debug('[OrderCommentsSectionWrapper] AuthProvider not available, running without auth context');
  }

  return <OrderCommentsSection orderId={orderId} currentUserId={currentUserId} fetchFn={fetchFn} compact={compact} maxHeight={maxHeight} />;
}

