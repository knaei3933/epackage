/**
 * Specification Sheet Approval Request API
 *
 * 仕様書承認リクエストAPI
 * - POST: 新しい承認リクエストを送信
 * - GET: 承認リクエスト情報を取得
 * - PUT: 承認ステータスを更新
 * - DELETE: 承認リクエストをキャンセル
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import type { SpecSheetData } from '@/types/specsheet';

// ============================================================
// Types
// ============================================================

interface ApprovalRequest {
  id?: string;
  specSheetId: string;
  specNumber: string;
  revision: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  approvers: ApproverInfo[];
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  title: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  deadline?: string;
  attachments?: string[];
}

interface ApproverInfo {
  userId: string;
  name: string;
  email: string;
  title?: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  respondedAt?: string;
}

interface ApprovalRequestBody {
  specSheetData: SpecSheetData;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  approvers: Array<{
    userId: string;
    name: string;
    email: string;
    title?: string;
  }>;
  title?: string;
  description?: string;
  deadline?: string;
}

interface ApprovalResponseBody {
  success: boolean;
  approvalId?: string;
  message?: string;
  error?: string;
}

// ============================================================
// Supabase Client
// ============================================================

function getSupabaseClient(userId: string) {
  // Use authenticated service client with audit logging
  return createAuthenticatedServiceClient({
    operation: 'spec_sheet_approval',
    userId,
    route: '/api/specsheet/approval',
  });
}

// ============================================================
// POST Handler - Create Approval Request
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // ✅ STEP 1: Check authentication (SECURE: using getUser() instead of getSession())
    // Initialize Supabase client using modern @supabase/ssr pattern
    const { client: supabaseAuth } = createSupabaseSSRClient(request);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: '認証されていません。ログインしてください。',
        } as ApprovalResponseBody,
        { status: 401 }
      );
    }

    // ✅ STEP 2: Verify user is active member
    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('id, role, status')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: '有効なアカウントではありません。',
        } as ApprovalResponseBody,
        { status: 403 }
      );
    }

    const body = (await request.json()) as ApprovalRequestBody;

    // Validate required fields
    if (!body.specSheetData) {
      return NextResponse.json(
        {
          success: false,
          error: '仕様書データが必要です',
        } as ApprovalResponseBody,
        { status: 400 }
      );
    }

    if (!body.requesterId || !body.requesterName || !body.requesterEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'リクエスト者情報が必要です',
        } as ApprovalResponseBody,
        { status: 400 }
      );
    }

    if (!body.approvers || body.approvers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '承認者を少なくとも1名指定してください',
        } as ApprovalResponseBody,
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient(user.id);

    // Check if spec sheet already has a pending approval
    const { data: existingApproval } = await supabase
      .from('spec_sheet_approvals')
      .select('id, status')
      .eq('spec_number', body.specSheetData.specNumber)
      .eq('revision', body.specSheetData.revision)
      .eq('status', 'pending')
      .single();

    if (existingApproval) {
      return NextResponse.json(
        {
          success: false,
          error: 'この仕様書にはすでに承認待ちのリクエストが存在します',
          approvalId: existingApproval.id,
        } as ApprovalResponseBody,
        { status: 409 }
      );
    }

    // Create approval request
    const approvalRequest: Omit<ApprovalRequest, 'id'> = {
      specSheetId: body.specSheetData.specNumber,
      specNumber: body.specSheetData.specNumber,
      revision: body.specSheetData.revision,
      requesterId: body.requesterId,
      requesterName: body.requesterName,
      requesterEmail: body.requesterEmail,
      approvers: body.approvers.map(a => ({
        ...a,
        status: 'pending' as const,
      })),
      status: 'pending',
      title: body.title || `仕様書承認: ${body.specSheetData.specNumber}`,
      description: body.description,
      createdAt: new Date().toISOString(),
      deadline: body.deadline,
    };

    // Insert into database
    const { data: insertedApproval, error: insertError } = await supabase
      .from('spec_sheet_approvals')
      .insert({
        ...approvalRequest,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    // Create notification for each approver
    for (const approver of body.approvers) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: approver.userId,
          type: 'spec_sheet_approval',
          title: approvalRequest.title,
          message: `仕様書「${body.specSheetData.title}」の承認リクエストが届きました`,
          metadata: {
            approvalId: insertedApproval.id,
            specNumber: body.specSheetData.specNumber,
            revision: body.specSheetData.revision,
            requesterName: body.requesterName,
            deadline: body.deadline,
          },
          action_url: `/b2b/specsheet/${body.specSheetData.specNumber}/approval/${insertedApproval.id}`,
          read: false,
          created_at: new Date().toISOString(),
        });

      if (notificationError) {
        console.error('Notification creation error:', notificationError);
        // Continue even if notification fails
      }
    }

    // Send email notifications (optional - implement based on your email service)
    // await sendApprovalEmails(body.approvers, approvalRequest);

    return NextResponse.json({
      success: true,
      approvalId: insertedApproval.id,
      message: `${body.approvers.length}名の承認者にリクエストを送信しました`,
    } as ApprovalResponseBody);
  } catch (error) {
    console.error('Approval request creation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '承認リクエストの作成に失敗しました',
      } as ApprovalResponseBody,
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - Get Approval Requests
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client for auth check
    const { client: supabaseAuth } = createSupabaseSSRClient(request);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: '認証されていません。ログインしてください。',
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const specNumber = searchParams.get('specNumber');
    const revision = searchParams.get('revision');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const approvalId = searchParams.get('approvalId');

    const supabase = getSupabaseClient(user.id);

    let query: any = supabase.from('spec_sheet_approvals').select('*');

    if (approvalId) {
      query = query.eq('id', approvalId).single();
    } else if (specNumber && revision) {
      query = query.eq('spec_number', specNumber).eq('revision', revision);
    } else if (userId) {
      // Get approvals where user is either requester or approver
      query = query.or(`requester_id.eq.${userId},approvers.cs.{${userId}}`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Order by created date descending
    query = query.order('created_at', { ascending: false });

    const { data: approvals, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      approvals: approvals || [],
    });
  } catch (error) {
    console.error('Approval fetch error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '承認リクエストの取得に失敗しました',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT Handler - Update Approval Status
// ============================================================

interface PutBody {
  approvalId: string;
  userId: string;
  action: 'approve' | 'reject';
  comment?: string;
}

export async function PUT(request: NextRequest) {
  try {
    // Initialize Supabase client for auth check
    const { client: supabaseAuth } = createSupabaseSSRClient(request);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: '認証されていません。ログインしてください。',
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as PutBody;

    if (!body.approvalId || !body.userId || !body.action) {
      return NextResponse.json(
        {
          success: false,
          error: '必須パラメータが不足しています',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient(user.id);

    // Get current approval
    const { data: currentApproval, error: fetchError } = await supabase
      .from('spec_sheet_approvals')
      .select('*')
      .eq('id', body.approvalId)
      .single();

    if (fetchError || !currentApproval) {
      return NextResponse.json(
        {
          success: false,
          error: '承認リクエストが見つかりません',
        },
        { status: 404 }
      );
    }

    if (currentApproval.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: 'このリクエストは既に処理されています',
        },
        { status: 400 }
      );
    }

    // Check if user is an approver
    const approverIndex = currentApproval.approvers.findIndex(
      (a: ApproverInfo) => a.userId === body.userId
    );

    if (approverIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'この操作を実行する権限がありません',
        },
        { status: 403 }
      );
    }

    // Update approver status
    const updatedApprovers = [...currentApproval.approvers];
    updatedApprovers[approverIndex] = {
      ...updatedApprovers[approverIndex],
      status: body.action === 'approve' ? 'approved' : 'rejected',
      comment: body.comment,
      respondedAt: new Date().toISOString(),
    };

    // Check if all approvers have responded
    const allResponded = updatedApprovers.every(
      (a: ApproverInfo) => a.status !== 'pending'
    );

    // Determine overall status
    let newStatus: 'pending' | 'approved' | 'rejected' = 'pending';
    if (allResponded) {
      const allApproved = updatedApprovers.every(
        (a: ApproverInfo) => a.status === 'approved'
      );
      newStatus = allApproved ? 'approved' : 'rejected';
    } else {
      // If any rejection, immediately reject
      const anyRejected = updatedApprovers.some(
        (a: ApproverInfo) => a.status === 'rejected'
      );
      if (anyRejected) {
        newStatus = 'rejected';
      }
    }

    // Update approval record
    const { data: updatedApproval, error: updateError } = await supabase
      .from('spec_sheet_approvals')
      .update({
        approvers: updatedApprovers,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.approvalId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Create notification for requester
    if (allResponded || newStatus !== 'pending') {
      const resultText = newStatus === 'approved' ? '承認' : '拒否';
      await supabase.from('notifications').insert({
        user_id: currentApproval.requesterId,
        type: 'spec_sheet_approval_result',
        title: `仕様書承認${resultText}のお知らせ`,
        message: `仕様書「${currentApproval.specNumber}」が${resultText}されました`,
        metadata: {
          approvalId: body.approvalId,
          specNumber: currentApproval.specNumber,
          revision: currentApproval.revision,
          result: newStatus,
        },
        action_url: `/b2b/specsheet/${currentApproval.specNumber}`,
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      approval: updatedApproval,
      message: `承認${body.action === 'approve' ? '済み' : '拒否'}として記録しました`,
    });
  } catch (error) {
    console.error('Approval update error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '承認ステータスの更新に失敗しました',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE Handler - Cancel Approval Request
// ============================================================

export async function DELETE(request: NextRequest) {
  try {
    // Initialize Supabase client for auth check
    const { client: supabaseAuth } = createSupabaseSSRClient(request);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: '認証されていません。ログインしてください。',
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const approvalId = searchParams.get('approvalId');
    const userId = searchParams.get('userId');

    if (!approvalId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '必須パラメータが不足しています',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient(user.id);

    // Get current approval
    const { data: currentApproval, error: fetchError } = await supabase
      .from('spec_sheet_approvals')
      .select('*')
      .eq('id', approvalId)
      .single();

    if (fetchError || !currentApproval) {
      return NextResponse.json(
        {
          success: false,
          error: '承認リクエストが見つかりません',
        },
        { status: 404 }
      );
    }

    // Check if user is the requester
    if (currentApproval.requesterId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'この操作を実行する権限がありません',
        },
        { status: 403 }
      );
    }

    if (currentApproval.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: '処理済みのリクエストはキャンセルできません',
        },
        { status: 400 }
      );
    }

    // Update status to cancelled
    const { data: cancelledApproval, error: updateError } = await supabase
      .from('spec_sheet_approvals')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Notify approvers
    for (const approver of currentApproval.approvers) {
      await supabase.from('notifications').insert({
        user_id: approver.userId,
        type: 'spec_sheet_approval_cancelled',
        title: '仕様書承認リクエストのキャンセル',
        message: `仕様書「${currentApproval.specNumber}」の承認リクエストがキャンセルされました`,
        metadata: {
          approvalId,
          specNumber: currentApproval.specNumber,
        },
        action_url: `/b2b/specsheet/${currentApproval.specNumber}`,
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      approval: cancelledApproval,
      message: '承認リクエストをキャンセルしました',
    });
  } catch (error) {
    console.error('Approval cancellation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '承認リクエストのキャンセルに失敗しました',
      },
      { status: 500 }
    );
  }
}
