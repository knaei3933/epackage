/**
 * Quotations API Route (Supabase)
 *
 * 見積履歴APIエンドポイント
 * - GET: 現在のユーザーの見積履歴を取得
 * - POST: 新しい見積を作成
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Type assertions for TypeScript (throw doesn't narrow types in all cases)
const supabaseUrlTyped = supabaseUrl as string;
const supabaseAnonKeyTyped = supabaseAnonKey as string;

// GET: ユーザーの見積履歴を取得
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrlTyped, supabaseAnonKeyTyped, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          removeItem: (key: string) => {
            cookieStore.delete(key);
          },
        },
      },
    });

    // 現在のユーザー確認 (SECURE: using getUser() instead of getSession())
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    // 見積履歴の取得（quotationsテーブルが存在すると仮定）
    const { data: quotations, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      // テーブルがない場合は空の配列を返す
      if (error.code === '42P01') {
        return NextResponse.json({ quotations: [] });
      }
      throw error;
    }

    return NextResponse.json({
      quotations: quotations || [],
    });
  } catch (error) {
    console.error('Get quotations error:', error);

    return NextResponse.json(
      {
        error: '見積履歴の取得に失敗しました。',
      },
      { status: 500 }
    );
  }
}

// POST: 新しい見積を作成
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrlTyped, supabaseAnonKeyTyped, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          removeItem: (key: string) => {
            cookieStore.delete(key);
          },
        },
      },
    });

    // 現在のユーザー確認 (SECURE: using getUser() instead of getSession())
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 見積作成 - DBカラムと一致するように修正
    const { data: quotation, error } = await supabase
      .from('quotations')
      .insert({
        user_id: user.id,
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        customer_phone: body.customerPhone,
        subtotal: body.subtotal,
        subtotal_amount: body.subtotalAmount,
        tax_amount: body.taxAmount,
        total_amount: body.totalAmount,
        notes: body.notes,
        status: 'draft', // 小文字に統一
        valid_until: body.validUntil,
        estimated_delivery_date: body.estimatedDeliveryDate,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        quotation: {
          id: quotation.id,
          quotation_number: quotation.quotation_number,
          status: quotation.status,
          total_amount: quotation.total_amount,
          createdAt: quotation.created_at,
        },
        message: '見積を作成しました。',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create quotation error:', error);

    return NextResponse.json(
      {
        error: '見積の作成に失敗しました。',
      },
      { status: 500 }
    );
  }
}

// OPTIONSメソッド - CORS preflightリクエスト処理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
