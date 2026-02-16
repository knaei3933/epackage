/**
 * Debug API Route
 * Check environment variables and API connection
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.KEI_CORPORATE_API_ID || process.env.INVOICE_KOHYO_API_KEY;

  const info = {
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
    envVars: Object.keys(process.env).filter(k => k.includes('KEI') || k.includes('INVOICE')),
  };

  // Test API connection
  let testResult = null;
  if (apiKey) {
    try {
      const testUrl = `https://api.houjin-bangou.nta.go.jp/4/name?id=${apiKey}&name=${encodeURIComponent('テスト')}&mode=1&type=12`;
      const response = await fetch(testUrl);
      const text = await response.text();
      testResult = {
        status: response.status,
        ok: response.ok,
        preview: text.substring(0, 200),
      };
    } catch (error) {
      testResult = { error: String(error) };
    }
  }

  return NextResponse.json({ info, testResult });
}
