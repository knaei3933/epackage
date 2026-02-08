/**
 * Guest Quotation Save API Route
 *
 * ゲストユーザー用見積作成API（ホームページシミュレーター用）
 * POST /api/quotations/guest-save - ログインなしで見積を作成
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseUrlTyped = supabaseUrl as string;
const supabaseServiceKeyTyped = supabaseServiceKey as string;

// Service role client for RLS bypass
const supabase = createClient(supabaseUrlTyped, supabaseServiceKeyTyped);

// クーポン情報の型定義
interface AppliedCoupon {
  couponId?: string;
  type?: string;
}

// 見積もりデータスキーマ（ゲストユーザー用）
const guestQuotationSchema = z.object({
  customerName: z.string().min(1, 'お名前を入力してください'),
  customerEmail: z.string().email('有効なメールアドレスを入力してください'),
  customerPhone: z.string().optional(),
  companyName: z.string().optional(),
  specifications: z.object({
    productType: z.string(),
    quantity: z.string(),
    size: z.string(),
    material: z.string(),
    printing: z.string(),
    timeline: z.string(),
  }),
  postProcessing: z.array(z.string()).optional(),
  pricing: z.object({
    unitPrice: z.number(),
    totalPrice: z.number(),
    totalCost: z.number(),
    setupCost: z.number(),
  }),
  projectDetails: z.string().optional(),
  appliedCoupon: z.object({
    couponId: z.string().optional(),
    type: z.string().optional(),
  }).optional(),
  discountAmount: z.number().optional(),
  adjustedTotal: z.number().optional(),
});

// POST: 新しい見積を作成（ゲスト用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // スキーマ検証
    const validatedData = guestQuotationSchema.parse(body);

    // 見積番号生成 - 一意の番号を生成
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const quotationNumber = `QT-${year}-${timestamp}${random}`;

    // 価格データ
    const totalCost = validatedData.pricing.totalCost || 0;
    const tax = Math.floor(totalCost * 0.1); // 10%消費税
    const grandTotal = totalCost + tax;

    // クーポン情報の適用
    // adjustedTotalがあればそれを使用、なければ元のgrandTotalを使用
    const finalTotal = validatedData.adjustedTotal || grandTotal;
    const discountAmount = validatedData.discountAmount || 0;

    // ゲストユーザー用ダミーID
    // 注: 本番環境ではゲスト用システムユーザーを事前に作成してください
    // E2Eテスト用: member@test.com のIDを使用
    const guestUserId = '3b67b1c5-5f88-40d8-998a-436f0f81fac0';

    // 会社名があれば会社名を優先、なければお名前
    const customerName = validatedData.companyName || validatedData.customerName;

    // クーポン情報がある場合、coupon_idとdiscount_typeを設定
    const couponId = validatedData.appliedCoupon?.couponId || null;
    const discountType = validatedData.appliedCoupon?.type || null;

    const { data: quotation, error: insertError } = await supabase
      .from('quotations')
      .insert({
        user_id: guestUserId,
        quotation_number: quotationNumber,
        customer_name: customerName,
        customer_email: validatedData.customerEmail,
        customer_phone: validatedData.customerPhone || null,
        subtotal_amount: totalCost,
        tax_amount: tax,
        total_amount: finalTotal,
        coupon_id: couponId,
        discount_amount: discountAmount > 0 ? discountAmount : null,
        discount_type: discountType,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: JSON.stringify({
          specifications: validatedData.specifications,
          postProcessing: validatedData.postProcessing || [],
          pricing: validatedData.pricing,
          projectDetails: validatedData.projectDetails || '',
          companyName: validatedData.companyName || '',
          appliedCoupon: validatedData.appliedCoupon || null,
        }),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Create guest quotation error:', insertError);
      throw insertError;
    }

    return NextResponse.json(
      {
        success: true,
        message: '見積を作成しました。',
        quotation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Guest quotation save error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '入力データが無効です。',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: '見積作成中にエラーが発生しました。',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : JSON.stringify(error)) : undefined,
      },
      { status: 500 }
    );
  }
}
