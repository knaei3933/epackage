/**
 * 統合通知サービス
 *
 * 会員・管理者共通の通知機能を提供します
 * - unified_notificationsテーブルを使用
 * - Realtime通知対応
 *
 * CRITICAL FIX FOR NEXT.JS 16 + TURBOPACK:
 * - cookies() is a dynamic API that MUST be imported lazily
 * - Top-level imports cause build hangs during static analysis
 */

import { createServerClient } from '@supabase/ssr';

// =====================================================
// Types
// =====================================================

export interface CreateNotificationParams {
  recipientId: string;
  recipientType: 'member' | 'admin';
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: Date;
}

export interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: 'member' | 'admin';
  type: string;
  title: string;
  message: string;
  related_id?: string;
  related_type?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  action_label?: string;
  expires_at?: string;
  created_at: string;
}

export interface NotificationFilter {
  recipientId: string;
  recipientType: 'member' | 'admin';
  unreadOnly?: boolean;
  limit?: number;
  type?: string;
}

// =====================================================
// UnifiedNotificationService
// =====================================================

export class UnifiedNotificationService {
  private _supabase: any | null = null;

  // 遅延初期化 - 最初のアクセス時に Supabase クライアントを作成
  private get supabase(): any {
    if (!this._supabase) {
      throw new Error('UnifiedNotificationService not initialized. Call initialize() first.');
    }
    return this._supabase;
  }

  /**
   * サービスを初期化（async対応）
   */
  async initialize(): Promise<void> {
    if (this._supabase) return; // 既に初期化済み

    // CRITICAL: Dynamic import to avoid build-time hang
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    this._supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: cookieStore.get, set: cookieStore.set, remove: cookieStore.delete } }
    );
  }

  /**
   * 通知作成
   */
  async createNotification(params: CreateNotificationParams): Promise<string> {
    // 自動初期化
    await this.initialize();

    const { data, error } = await this.supabase
      .from('unified_notifications')
      .insert({
        recipient_id: params.recipientId,
        recipient_type: params.recipientType,
        type: params.type,
        title: params.title,
        message: params.message,
        related_id: params.relatedId,
        related_type: params.relatedType,
        priority: params.priority || 'normal',
        metadata: params.metadata || {},
        action_url: params.actionUrl,
        action_label: params.actionLabel,
        expires_at: params.expiresAt?.toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * 通知一覧取得
   */
  async getNotifications(params: NotificationFilter): Promise<Notification[]> {
    // 自動初期化
    await this.initialize();

    let query = this.supabase
      .from('unified_notifications')
      .select('*')
      .eq('recipient_id', params.recipientId)
      .eq('recipient_type', params.recipientType)
      .order('created_at', { ascending: false });

    if (params.unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (params.type) {
      query = query.eq('type', params.type);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    // 有効期限切れの通知を除外
    query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    const { data, error } = await query;
    if (error) throw error;
    return data as Notification[];
  }

  /**
   * 未読件数取得
   */
  async getUnreadCount(recipientId: string, recipientType: 'member' | 'admin'): Promise<number> {
    // 自動初期化
    await this.initialize();

    const { data, error, count } = await this.supabase
      .from('unified_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', recipientId)
      .eq('recipient_type', recipientType)
      .eq('is_read', false)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    if (error) throw error;
    return count || 0;
  }

  /**
   * 既読にする
   */
  async markAsRead(notificationId: string): Promise<void> {
    // 自動初期化
    await this.initialize();

    const { error } = await this.supabase
      .from('unified_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  }

  /**
   * 全て既読にする
   */
  async markAllAsRead(recipientId: string, recipientType: 'member' | 'admin'): Promise<void> {
    // 自動初期化
    await this.initialize();

    const { error } = await this.supabase
      .from('unified_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', recipientId)
      .eq('recipient_type', recipientType)
      .eq('is_read', false);

    if (error) throw error;
  }

  /**
   * 通知削除
   */
  async deleteNotification(notificationId: string): Promise<void> {
    // 自動初期化
    await this.initialize();

    const { error } = await this.supabase
      .from('unified_notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }
}

// =====================================================
// ヘルパー関数
// =====================================================

/**
 * 統合通知サービスインスタンス作成
 */
export async function createNotificationService(): Promise<UnifiedNotificationService> {
  const service = new UnifiedNotificationService();
  await service.initialize();
  return service;
}
