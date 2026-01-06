/**
 * Quotations API Route (Supabase)
 *
 * 견적 내역 API 엔드포인트입니다.
 * - GET: 현재 사용자의 견적 내역 조회
 * - POST: 새 견적 생성
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

// GET: 사용자의 견적 내역 조회
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

    // 현재 사용자 확인 (SECURE: using getUser() instead of getSession())
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    // 견적 내역 조회 (quotations 테이블이 있다고 가정)
    const { data: quotations, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      // 테이블이 없는 경우 빈 배열 반환
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

// POST: 새 견적 생성
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

    // 현재 사용자 확인 (SECURE: using getUser() instead of getSession())
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 견적 생성 - DB 컬럼과 일치하도록 수정
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
        status: 'draft', // 소문자로 통일
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

// OPTIONS 메서드 - CORS preflight 요청 처리
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
