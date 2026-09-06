export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import {
  RATE_LIMIT_CONFIG,
  RateLimiter,
  createRateLimitResponse,
} from '@/lib/rate-limiter';
import { sampleRequestConfirmationSchema } from '@/lib/member/sample-prefill';
import { createMemberFixedSampleRequest } from '@/lib/samples/create-fixed-sample-request';
import { scheduleMemberSampleNotifications } from '@/lib/samples/member-sample-notifications';
import type { Database } from '@/types/database';

/**
 * GET  /api/member/samples returns the authenticated member's sample requests.
 * POST /api/member/samples creates the fixed member sample request.
 */

const memberSampleRateLimiter = new RateLimiter({
  ...RATE_LIMIT_CONFIG.api,
  maxRequests: 3,
  blockDurationMs: 15 * 60 * 1000,
});

function validationDetails(error: z.ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const field = issue.path.map(String).join('.') || '_form';
    details[field] = [...(details[field] ?? []), issue.message];
  }
  return details;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  let authClient: Awaited<ReturnType<typeof createSupabaseSSRClient>>['client'];
  try {
    ({ client: authClient } = await createSupabaseSSRClient(request));
  } catch (error) {
    console.error('[samples API] Auth client construction failed', {
      method: 'GET',
      route: '/api/member/samples',
      reason: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'ただいまサンプル履歴を取得できません。しばらくしてから再度お試しください。',
        error_code: 'AUTH_CLIENT_UNAVAILABLE',
      },
      { status: 500 },
    );
  }

  let authResult: Awaited<ReturnType<typeof authClient.auth.getUser>>;
  try {
    authResult = await authClient.auth.getUser();
  } catch (error) {
    console.error('[samples API] Authentication check failed', {
      method: 'GET',
      route: '/api/member/samples',
      reason: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json(
      {
        success: false,
        error: '認証状態の確認に失敗しました。しばらくしてから再度お試しください。',
        error_code: 'AUTHENTICATION_CHECK_FAILED',
      },
      { status: 500 },
    );
  }

  const { data: authData, error: authError } = authResult;
  const user = authError ? null : authData.user;

  if (authError) {
    console.error('[samples API] Authentication check returned an error', {
      method: 'GET',
      route: '/api/member/samples',
      status: authError.status ?? null,
    });
    return NextResponse.json(
      {
        success: false,
        error: '認証状態の確認に失敗しました。しばらくしてから再度お試しください。',
        error_code: 'AUTHENTICATION_CHECK_FAILED',
      },
      { status: 500 },
    );
  }

  // Success with no user is the only false-style empty-history response.
  if (!user?.id) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supabase = createServiceClient();

    let query = supabase
      .from('sample_requests')
      .select(`
        *,
        sample_items (
          id,
          product_name,
          category,
          quantity
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq(
        'status',
        status as Database['public']['Enums']['sample_request_status'],
      );
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('[samples API] Database query failed', {
        code: error.code,
        method: 'GET',
        route: '/api/member/samples',
      });
      return NextResponse.json(
        {
          success: false,
          error: 'サンプル依頼の取得に失敗しました',
          code: 'FETCH_ERROR',
        },
        { status: 500 },
      );
    }

    const sampleRequests = requests?.map((request) => ({
      id: request.id,
      userId: request.user_id,
      requestNumber:
        request.request_number || `SMP-${String(request.id).padStart(6, '0')}`,
      status: request.status || 'received',
      samples: request.sample_items || [],
      deliveryAddress: request.delivery_address_id,
      trackingNumber: request.tracking_number,
      createdAt: request.created_at,
      shippedAt: request.shipped_at,
      deliveredAt: null as string | null,
    })) || [];

    return NextResponse.json({ success: true, data: sampleRequests });
  } catch (error) {
    console.error('[samples API] Sample history transformation failed', {
      method: 'GET',
      route: '/api/member/samples',
      reason: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'サンプル依頼の取得に失敗しました',
        code: 'FETCH_ERROR',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let authClient: Awaited<ReturnType<typeof createSupabaseSSRClient>>['client'];
  try {
    const ssrClient = await createSupabaseSSRClient(request);
    authClient = ssrClient.client;
  } catch (error) {
    console.error('[samples API] Auth client construction failed', {
      method: 'POST',
      route: '/api/member/samples',
      reason: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'ただいまサンプル依頼を受け付けられません。しばらくしてから再度お試しください。',
        error_code: 'AUTH_CLIENT_UNAVAILABLE',
      },
      { status: 500 },
    );
  }

  let authData: Awaited<ReturnType<typeof authClient.auth.getUser>>['data'];
  let authError: Awaited<ReturnType<typeof authClient.auth.getUser>>['error'];
  try {
    ({ data: authData, error: authError } = await authClient.auth.getUser());
  } catch (error) {
    console.error('[samples API] Authentication check failed', {
      method: 'POST',
      route: '/api/member/samples',
      reason: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'ただいまサンプル依頼を受け付けられません。しばらくしてから再度お試しください。',
        error_code: 'AUTHENTICATION_CHECK_FAILED',
      },
      { status: 500 },
    );
  }

  const user = authError ? null : authData.user;
  if (!user?.id) {
    return NextResponse.json(
      { success: false, error: 'ログが必要です。', error_code: 'UNAUTHORIZED' },
      { status: 401 },
    );
  }

  const rateLimit = memberSampleRateLimiter.check(user.id);
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  const { data: profile, error: profileError } = await authClient
    .from('profiles')
    .select('id, status, kana_last_name, kana_first_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[samples API] Profile query failed', {
      method: 'POST',
      route: '/api/member/samples',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'ただいまサンプル依頼を受け付けられません。しばらくしてから再度お試しください。',
        error_code: 'PROFILE_QUERY_FAILED',
      },
      { status: 500 },
    );
  }

  if (!profile || profile.status !== 'ACTIVE') {
    return NextResponse.json(
      {
        success: false,
        error: 'サンプル依頼は有効な会員のみご利用できます。',
        error_code: 'MEMBER_NOT_ACTIVE',
      },
      { status: 403 },
    );
  }

  // The SSR client carries the member's cookies and must not be reused for
  // privileged writes. Only after authentication and ACTIVE status do we mint
  // an explicitly audited service client for the fixed request pipeline.
  let serviceClient: ReturnType<typeof createAuthenticatedServiceClient>;
  try {
    serviceClient = createAuthenticatedServiceClient({
      operation: 'create_member_fixed_sample_request',
      userId: user.id,
      route: '/api/member/samples',
    });
  } catch (error) {
    console.error('[samples API] Service client construction failed', {
      method: 'POST',
      route: '/api/member/samples',
      reason: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'ただいまサンプル依頼を受け付けられません。しばらくしてから再度お試しください。',
        error_code: 'SERVICE_CLIENT_UNAVAILABLE',
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const parsed = sampleRequestConfirmationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: '入力内容をご確認ください。',
        error_code: 'VALIDATION_ERROR',
        details: validationDetails(parsed.error),
      },
      { status: 400 },
    );
  }

  const sessionEmail = user.email;
  if (!sessionEmail) {
    return NextResponse.json(
      {
        success: false,
        error: 'メールアドレスが確認できません。',
        error_code: 'SESSION_EMAIL_MISSING',
      },
      { status: 403 },
    );
  }

  const result = await createMemberFixedSampleRequest({
    supabase: serviceClient,
    userId: user.id,
    sessionEmail,
    confirmation: parsed.data,
    profileKana: {
      lastName: profile.kana_last_name,
      firstName: profile.kana_first_name,
    },
  });

  if (result.status === 'failed') {
    return NextResponse.json(
      {
        success: false,
        error: 'サンプル依頼の処理に失敗しました。',
        error_code: 'SAMPLE_PIPELINE_FAILED',
        stage: result.stage,
      },
      { status: 500 },
    );
  }

  // Intentional structured success log for submission traceability (M01).
  // eslint-disable-next-line no-console
  console.log('[samples API] Fixed member sample created', {
    inquiryId: result.inquiryId,
    sampleRequestId: result.sampleRequestId,
    sampleItemId: result.sampleItemId,
    destinationId: result.destinationId,
    labelId: result.labelId,
    inquiryNumber: result.inquiryNumber,
    requestNumber: result.requestNumber,
  });

  try {
    scheduleMemberSampleNotifications({
      sessionEmail,
      confirmation: parsed.data,
      inquiryId: result.inquiryId,
      sampleRequestId: result.sampleRequestId,
      sampleItemId: result.sampleItemId,
      destinationId: result.destinationId,
      labelId: result.labelId,
      inquiryNumber: result.inquiryNumber,
      requestNumber: result.requestNumber,
    });
  } catch (error) {
    // Commitment remains authoritative; scheduling is an isolated post-commit task.
    console.error('[samples API] Notification scheduling failed', {
      sampleRequestId: result.sampleRequestId,
      reason: error instanceof Error ? error.message : 'unknown',
    });
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        inquiryId: result.inquiryId,
        sampleRequestId: result.sampleRequestId,
        sampleItemId: result.sampleItemId,
        destinationId: result.destinationId,
        labelId: result.labelId,
        inquiryNumber: result.inquiryNumber,
        requestNumber: result.requestNumber,
      },
    },
    { status: 201 },
  );
}
