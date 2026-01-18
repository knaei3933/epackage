/**
 * Admin User Approval API
 *
 * 管理者ユーザー承認API
 * - POST: PENDING状態のユーザーをACTIVEに承認
 * - REJECT: ユーザー登録拒否
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { Database } from '@/types/database';
import { z } from 'zod';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

// ============================================================
// Types
// ============================================================

interface ApprovalRequestBody {
  action: 'approve' | 'reject';
  reason?: string;
}

interface ApprovalResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    status: string;
    role: string;
  };
  error?: string;
}

// ============================================================
// Validation Schema
// ============================================================

const approvalSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if current user is admin
 */
async function isAdmin(
  supabase: ReturnType<typeof createRouteHandlerClient<Database>>,
  userId: string
): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return profile?.role === 'ADMIN';
}

/**
 * Send approval notification email
 */
async function sendApprovalEmail(
  email: string,
  userName: string,
  status: 'approved' | 'rejected',
  reason?: string
): Promise<void> {
  // TODO: Implement email sending via Resend/SendGrid
  console.log('[Email Mock]', {
    to: email,
    type: status,
    userName,
    reason,
  });
}

// ============================================================
// POST Handler - Approve or Reject User
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: userId } = await params;
const { client: supabase } = createSupabaseSSRClient(request);
    // Parse and validate request body
    const body: ApprovalRequestBody = await request.json();
    const validatedData = approvalSchema.parse(body);

    // Get target user profile
    const { data: targetUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is in PENDING status
    if (targetUser.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: `User status is ${targetUser.status}. Only PENDING users can be approved/rejected.`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Process approval or rejection
    let newStatus: 'ACTIVE' | 'DELETED';
    let message: string;

    if (validatedData.action === 'approve') {
      newStatus = 'ACTIVE';
      message = 'User approved successfully';
    } else {
      newStatus = 'DELETED';
      message = 'User registration rejected';
    }

    // Update user status
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('User status update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user status', code: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }

    // Send notification email
    await sendApprovalEmail(
      targetUser.email,
      `${targetUser.kanji_last_name} ${targetUser.kanji_first_name}`,
      validatedData.action === 'approve' ? 'approved' : 'rejected',
      validatedData.reason
    );

    const response: ApprovalResponse = {
      success: true,
      message,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
        role: updatedUser.role,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    console.error('User approval error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
