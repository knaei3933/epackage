/**
 * Notes API Route
 *
 * 노트 시스템 API:
 * - GET: 노트 목록 조회
 * - POST: 새 노트 생성
 *
 * Notes can be attached to:
 * - Orders (order_id)
 * - Quotations (quote_id)
 * - Customers (user_id)
 *
 * Security:
 * - 인증된 사용자만 접근 가능
 * - 관리자는 모든 노트 접근 가능
 * - 일반 사용자는 자신의 노트만 접근 가능
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

// =====================================================
// Schema Validation
// =====================================================

// Note schema
const noteSchema = z.object({
  content: z.string().min(1, '노트 내용을 입력하세요').max(5000, '노트는 최대 5000자까지 가능합니다'),
  orderId: z.string().optional(),
  quoteId: z.string().optional(),
  userId: z.string().optional(),
  isPrivate: z.boolean().default(false), // true면 관리자만 볼 수 있음
});

type Note = z.infer<typeof noteSchema>;

// =====================================================
// GET: List Notes
// =====================================================

export async function GET(request: NextRequest) {
  console.log('[Notes API] GET request received');

  try {
    const supabase = createServiceClient();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '無効なトークンです' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = request.nextUrl;
    const orderId = searchParams.get('orderId');
    const quoteId = searchParams.get('quoteId');
    const userId = searchParams.get('userId');

    // Build query
    let query = supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const profileTyped = profile as any;
    const isAdmin = profileTyped?.role === 'ADMIN';

    // Apply filters
    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    if (quoteId) {
      query = query.eq('quote_id', quoteId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Non-admin users can only see non-private notes or their own
    if (!isAdmin) {
      query = query.or(`is_private.eq.false,and(user_id.eq.${user.id})`);
    }

    const { data: notes, error } = await query;

    if (error) throw error;

    console.log('[Notes API] Notes loaded successfully:', notes?.length || 0);
    return NextResponse.json({
      success: true,
      data: notes || []
    });

  } catch (error) {
    console.error('[Notes API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'ノートの読み込みに失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST: Create Note
// =====================================================

export async function POST(request: NextRequest) {
  console.log('[Notes API] POST request received');

  try {
    const supabase = createServiceClient();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '無効なトークンです' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = noteSchema.parse(body);

    // Create note
    const { data, error } = await (supabase as any)
      .from('notes')
      .insert({
        content: validatedData.content,
        order_id: validatedData.orderId,
        quote_id: validatedData.quoteId,
        user_id: validatedData.userId || user.id,
        is_private: validatedData.isPrivate,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    console.log('[Notes API] Note created successfully:', data.id);
    return NextResponse.json({
      success: true,
      message: 'ノートを作成しました',
      data
    });

  } catch (error) {
    console.error('[Notes API] POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '入力データに誤りがあります',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'ノートの作成に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
