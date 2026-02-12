/**
 * Quotation API Route (Supabase)
 *
 * 見積作成および一覧取得API（会員専用）
 * - POST: 新しい見積を作成
 * - GET: 見積一覧を取得
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Zodスキーマ
const createQuotationSchema = z.object({
  projectName: z.string().min(1, 'プロジェクト名を入力してください。').max(200),
  productCategory: z.enum(['COSMETICS', 'CLOTHING', 'ELECTRONICS', 'KITCHEN', 'FURNITURE', 'OTHER']),
  quantity: z.number().min(1, '数量は1以上である必要があります。'),
  unitPrice: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// Helper: Create Supabase client with cookie support
async function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured');
  }

  const cookieStore = await cookies();

  return createClient(supabaseUrl, supabaseAnonKey, {
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
}

// POST: 新しい見積を作成
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    // セッション確認 (SECURE: using getUser() instead of getSession())
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'ログインが必要です。' },
        { status: 401 }
      );
    }

    // プロフィールからユーザー状態を確認
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: '有効なアカウントのみ見積を作成できます。' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // スキーマ検証
    const validationResult = createQuotationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '入力値が正しくありません。',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 見積番号生成 (Q + 年 + 月 + 日 + 連番)
    const quotationNumber = `Q${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${Date.now().toString(36).toUpperCase()}`;

    // 価格計算
    const unitPrice = data.unitPrice || 0;
    const totalPrice = unitPrice * data.quantity;
    const tax = Math.floor(totalPrice * 0.1); // 10%消費税
    const grandTotal = totalPrice + tax;

    // 見積作成 (Supabase quotationsテーブル)
    const { data: quotation, error: insertError } = await supabase
      .from('quotations')
      .insert({
        user_id: user.id,
        quotation_number: quotationNumber,
        total_amount: grandTotal,
        status: 'draft',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: data.notes,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Create quotation error:', insertError);
      throw insertError;
    }

    // 見積項目作成 (quotation_itemsテーブル)
    const { error: itemError } = await supabase
      .from('quotation_items')
      .insert({
        quotation_id: quotation.id,
        product_name: data.projectName,
        quantity: data.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        specifications: {
          productCategory: data.productCategory,
        } as any,
      });

    if (itemError) {
      console.error('Create quotation item error:', itemError);
      throw itemError;
    }

    return NextResponse.json(
      {
        message: '見積を作成しました。',
        quotation: {
          ...quotation,
          items: [{
            id: crypto.randomUUID(),
            quotation_id: quotation.id,
            product_name: data.projectName,
            quantity: data.quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
          }],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create quotation error:', error);

    return NextResponse.json(
      {
        error: '見積作成中にエラーが発生しました。',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// GET: 見積一覧を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    // セッション確認 (SECURE: using getUser() instead of getSession())
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'ログインが必要です。' },
        { status: 401 }
      );
    }

    // クエリパラメータ
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 見積一覧取得 (Supabase quotationsテーブル)
    let query = supabase
      .from('quotations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: quotations, error, count } = await query;

    if (error) {
      console.error('Get quotations error:', error);
      throw error;
    }

    const total = count || 0;

    return NextResponse.json(
      {
        quotations: quotations || [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get quotations error:', error);

    return NextResponse.json(
      {
        error: '見積一覧の取得中にエラーが発生しました。',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
