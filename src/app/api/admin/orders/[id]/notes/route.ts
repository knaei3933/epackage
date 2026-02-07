/**
 * Admin Order Notes API
 *
 * 管理者注文メモAPI
 * - 管理者メモの更新・取得
 * - 韓国パートナーへの送信（XSERVER SMTP使用）
 *
 * @route /api/admin/orders/[id]/notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const KOREA_EMAIL = 'info@kanei-trade.co.jp';

export const dynamic = 'force-dynamic';

// サービスクライアント (RLSバイパス用)
const getServiceClient = () => createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// XServer SMTP transporter
const getTransporter = () => {
  if (process.env.XSERVER_SMTP_HOST && process.env.XSERVER_SMTP_USER && process.env.XSERVER_SMTP_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.XSERVER_SMTP_HOST,
      port: parseInt(process.env.XSERVER_SMTP_PORT || '587'),
      secure: false, // TLS for port 587
      auth: {
        user: process.env.XSERVER_SMTP_USER,
        pass: process.env.XSERVER_SMTP_PASSWORD,
      },
    });
  }
  return null;
};

/**
 * GET - Get admin notes for an order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const supabase = getServiceClient();

    // Get latest admin note
    const { data: note, error } = await supabase
      .from('admin_order_notes')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Check if table exists or if there's no note yet
    if (error && error.code !== 'PGRST116') {
      console.error('[Notes GET] Failed to get notes:', error);
    }

    return NextResponse.json({
      success: true,
      notes: note?.notes || '',
      sent_to_korea_at: note?.sent_to_korea_at || null,
    });

  } catch (error) {
    console.error('[Notes GET] Error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * POST - Update or create admin notes
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { notes } = body;

    if (typeof notes !== 'string') {
      return NextResponse.json(
        { success: false, error: '無効なリクエストです' },
        { status: 400 }
      );
    }

    // SSR Client for authentication
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      console.error('[Notes POST] Auth error:', authError);
      return NextResponse.json(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }

    // Service client for database operations
    const supabase = getServiceClient();

    // Check if note exists
    const { data: existingNote } = await supabase
      .from('admin_order_notes')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    let result;
    if (existingNote) {
      // Update existing note
      const { data, error } = await supabase
        .from('admin_order_notes')
        .update({ notes: notes.trim() })
        .eq('id', existingNote.id)
        .select('notes')
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new note
      const { data, error } = await supabase
        .from('admin_order_notes')
        .insert({
          order_id: orderId,
          admin_id: user.id,
          notes: notes.trim(),
        })
        .select('notes')
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      notes: result.notes,
    });

  } catch (error) {
    console.error('[Notes POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'メモの更新に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Send to Korea partner
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // SSR Client for authentication
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      console.error('[Notes PUT] Auth error:', authError);
      return NextResponse.json(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }

    // Service client for database operations
    const supabase = getServiceClient();

    // Get order information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email, notes')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    // Get admin notes
    const { data: noteData } = await supabase
      .from('admin_order_notes')
      .select('notes')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const adminNotes = noteData?.notes || '';

    // Get files for this order
    const { data: files } = await supabase
      .from('files')
      .select('original_filename, file_url')
      .eq('order_id', orderId);

    const fileList = (files || []).map((f: any) => f.original_filename).join(', ');

    // Send email to Korea partner using XServer SMTP
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .files { background: #e0f2fe; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .notes { background: #fef3c7; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>新しい注文データの送信</h1>
            </div>
            <div class="content">
              <div class="order-info">
                <h2>注文情報</h2>
                <p><strong>注文番号:</strong> ${order.order_number}</p>
                <p><strong>顧客名:</strong> ${order.customer_name || 'N/A'}</p>
                <p><strong>顧客メール:</strong> ${order.customer_email || 'N/A'}</p>
              </div>

              ${fileList ? `
              <div class="files">
                <h3>アップロードファイル</h3>
                <p>${fileList}</p>
              </div>
              ` : ''}

              ${adminNotes ? `
              <div class="notes">
                <h3>管理者メモ</h3>
                <p>${adminNotes.replace(/\n/g, '<br>')}</p>
              </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>Epackage Lab - Package Lab</p>
              <p>このメールはシステムから自動送信されました</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailText = `
注文番号: ${order.order_number}
顧客名: ${order.customer_name || 'N/A'}
顧客メール: ${order.customer_email || 'N/A'}

${fileList ? `アップロードファイル:\n${fileList}\n` : ''}${adminNotes ? `管理者メモ:\n${adminNotes}` : ''}

---
Epackage Lab - Package Lab
このメールはシステムから自動送信されました
      `;

      // Send email using XServer SMTP
      const transporter = getTransporter();
      if (transporter) {
        const fromEmail = process.env.FROM_EMAIL || 'info@package-lab.com';

        await transporter.sendMail({
          from: `Epackage Lab <${fromEmail}>`,
          to: KOREA_EMAIL,
          subject: `[新規注文] ${order.order_number} - データ送信`,
          html: emailHtml,
          text: emailText,
        });

        console.log('[Notes PUT] Email sent successfully to', KOREA_EMAIL);
      } else {
        console.warn('[Notes PUT] XSERVER_SMTP not configured, skipping email send');
      }

      // Update sent_to_korea_at
      const { data: existingNote } = await supabase
        .from('admin_order_notes')
        .select('id')
        .eq('order_id', orderId)
        .maybeSingle();

      if (existingNote) {
        await supabase
          .from('admin_order_notes')
          .update({ sent_to_korea_at: new Date().toISOString() })
          .eq('id', existingNote.id);
      } else {
        await supabase
          .from('admin_order_notes')
          .insert({
            order_id: orderId,
            admin_id: user.id,
            notes: '',
            sent_to_korea_at: new Date().toISOString(),
          });
      }

      return NextResponse.json({
        success: true,
        message: '韓国パートナーに送信しました',
      });

    } catch (emailError) {
      console.error('[Notes PUT] Email send error:', emailError);
      return NextResponse.json(
        { success: false, error: 'メール送信に失敗しました: ' + (emailError instanceof Error ? emailError.message : 'Unknown error') },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[Notes PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
