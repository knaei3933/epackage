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
import { Shield, User, MessageSquare, Clock } from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface OrderComment {
  id: string;
  order_id: string;
  content: string;
  comment_type: string;
  author_id: string;
  author_role: 'customer' | 'admin' | 'production';
  is_internal: boolean;
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
}

// ============================================================
// Component
// ============================================================

export function OrderCommentsSection({ orderId }: OrderCommentsSectionProps) {
  const [comments, setComments] = useState<OrderComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load comments - memoized with useCallback
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/member/orders/${orderId}/comments`);
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

      const response = await fetch(`/api/member/orders/${orderId}/comments`, {
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
      <CardContent className="space-y-4">
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
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              コメントを読み込み中...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              まだコメントはありません。
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg border ${
                  comment.author_role === 'admin'
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    comment.author_role === 'admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    {comment.author_role === 'admin' ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {comment.author?.full_name || '不明'}
                      </span>
                      {comment.author_role === 'admin' && (
                        <Badge variant="secondary" className="text-xs">
                          管理者
                        </Badge>
                      )}
                      {comment.is_internal && (
                        <Badge variant="outline" className="text-xs">
                          内部
                        </Badge>
                      )}
                    </div>
                    <p
                      className="text-sm whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(comment.content, {
                          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
                          ALLOWED_ATTR: ['href'],
                        }),
                      }}
                    />
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(comment.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize component to prevent unnecessary re-renders
OrderCommentsSection = memo(OrderCommentsSection) as typeof OrderCommentsSection;
