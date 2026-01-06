/**
 * B2B Quotation Detail API
 * GET /api/b2b/quotations/[id] - Get quotation details
 * DELETE /api/b2b/quotations/[id] - Delete a quotation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/b2b/quotations/[id] - Get quotation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されませんでした。' },
        { status: 401 }
      );
    }

    // Get quotation ID from params
    const { id } = await params;

    // Fetch quotation with items
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching quotation:', error);
      return NextResponse.json(
        { error: '見積書の取得に失敗しました。' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quotation
    });

  } catch (error) {
    console.error('Quotation detail API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// DELETE /api/b2b/quotations/[id] - Delete a quotation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されませんでした。' },
        { status: 401 }
      );
    }

    // Get quotation ID from params
    const { id } = await params;

    // Check if quotation exists and belongs to user
    const { data: quotation, error: fetchError } = await supabase
      .from('quotations')
      .select('id, status, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !quotation) {
      return NextResponse.json(
        { error: '見積書が見つかりません。' },
        { status: 404 }
      );
    }

    // Only allow deletion of DRAFT quotations
    if (quotation.status !== 'DRAFT') {
      return NextResponse.json(
        { error: '下書き状態の見積書のみ削除できます。' },
        { status: 400 }
      );
    }

    // Delete quotation items first (foreign key constraint)
    const { error: itemsDeleteError } = await supabase
      .from('quotation_items')
      .delete()
      .eq('quotation_id', id);

    if (itemsDeleteError) {
      console.error('Error deleting quotation items:', itemsDeleteError);
      return NextResponse.json(
        { error: '見積項目の削除に失敗しました。' },
        { status: 500 }
      );
    }

    // Delete quotation
    const { error: deleteError } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting quotation:', deleteError);
      return NextResponse.json(
        { error: '見積書の削除に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '見積書を削除しました。'
    });

  } catch (error) {
    console.error('Quotation delete API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// PATCH /api/b2b/quotations/[id] - Update quotation (optional, for future use)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されませんでした。' },
        { status: 401 }
      );
    }

    // Get quotation ID from params
    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const { notes, status } = body;

    // Check if quotation exists and belongs to user
    const { data: existingQuotation } = await supabase
      .from('quotations')
      .select('id, user_id, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingQuotation) {
      return NextResponse.json(
        { error: '見積書が見つかりません。' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) {
      // Only allow status changes from DRAFT to SENT
      if (existingQuotation.status === 'DRAFT' && status === 'SENT') {
        updateData.status = 'SENT';
        updateData.sent_at = new Date().toISOString();
      } else if (status !== existingQuotation.status) {
        return NextResponse.json(
          { error: '無効なステータス変更です。' },
          { status: 400 }
        );
      }
    }

    // Update quotation
    const { data: quotation, error } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        quotation_items (*)
      `)
      .single();

    if (error) {
      console.error('Error updating quotation:', error);
      return NextResponse.json(
        { error: '見積書の更新に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quotation,
      message: '見積書を更新しました。'
    });

  } catch (error) {
    console.error('Quotation update API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
