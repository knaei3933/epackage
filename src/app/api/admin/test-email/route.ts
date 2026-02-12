/**
 * Email Test API
 *
 * 이메일 전송 테스트 API
 * - 실제 이메일 발송 테스트
 * - Xserver SMTP 연결 확인
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { epackMailer } from '@/lib/email/epack-mailer';
import { getEmailConfigStatus } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, template = 'shipped' } = body;

    if (!to) {
      return NextResponse.json({
        success: false,
        error: '수신자 이메일 주소가 필요합니다.',
      }, { status: 400 });
    }

    // 이메일 설정 확인
    const config = getEmailConfigStatus();

    // 테스트 이메일 발송
    const result = await epackMailer.send(template, {
      customer_email: to,
      customer_name: 'テスト様',
      company_name: 'テスト株式会社',
      order_number: 'TEST-2025-001',
      product_name: 'スタンドアップパウチ（サンプル）',
      quantity: 100,
      tracking_number: '1234567890JP',
      carrier: 'ヤマト運輸',
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tracking_url: 'https://track.yamato-transport.co.jp/',
      view_url: 'https://epackage-lab.com/orders/TEST-2025-001',
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        config: {
          mode: config.mode,
          transportType: config.transportType,
          configured: config.configured,
        },
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '테스트 이메일을 발송했습니다.',
      messageId: result.messageId,
      previewUrl: result.previewUrl,
      config: {
        mode: config.mode,
        transportType: config.transportType,
        configured: config.configured,
        hasXServer: config.hasXServer,
        hasSendGrid: config.hasSendGrid,
        hasAwsSes: config.hasAwsSes,
      },
    });

  } catch (error: any) {
    console.error('[Email Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// GET 요청으로 설정 확인
export async function GET() {
  const config = getEmailConfigStatus();

  return NextResponse.json({
    config: {
      mode: config.mode,
      transportType: config.transportType,
      configured: config.configured,
      hasXServer: config.hasXServer,
      hasSendGrid: config.hasSendGrid,
      hasAwsSes: config.hasAwsSes,
      hasFromEmail: config.hasFromEmail,
      hasAdminEmail: config.hasAdminEmail,
    },
    message: '이메일 설정 상태입니다. POST 요청으로 테스트 이메일을 발송할 수 있습니다.',
  });
}
