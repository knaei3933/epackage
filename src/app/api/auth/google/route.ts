/**
 * Google OAuth Initiation API
 *
 * 구글 OAuth 시작
 * - 인증 URL 반환
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google-drive';
import { requireAuth } from '@/lib/dashboard';

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const userId = await requireAuth();

    // OAuth 인증 URL 생성
    const authUrl = getGoogleAuthUrl(`user_${userId}`);

    return NextResponse.json({
      success: true,
      data: {
        authUrl
      }
    });

  } catch (error) {
    console.error('Failed to initiate Google OAuth:', error);

    // 인증되지 않은 경우에도 URL은 반환
    const authUrl = getGoogleAuthUrl();

    return NextResponse.json({
      success: true,
      data: {
        authUrl,
        needsAuth: true
      }
    });
  }
}
