/**
 * Debug API Route
 * Check environment variables and API connection
 * Also serves as working search endpoint
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const searchName = searchParams.get('name');

  const apiKey = process.env.KEI_CORPORATE_API_ID || process.env.INVOICE_KOHYO_API_KEY;

  // If name parameter provided, perform search
  if (searchName && searchName.length >= 2) {
    try {
      const encodedName = encodeURIComponent(searchName);
      const apiUrl = `https://api.houjin-bangou.nta.go.jp/4/name?id=${apiKey}&name=${encodedName}&mode=1&type=12&history=0&close=0`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ error: 'External API error', details: errorText }, { status: 500 });
      }

      const text = await response.text();

      // Parse XML response using regex
      const corps: any[] = [];
      const regex = /<corporation[^>]*>([\s\S]*?)<\/corporation>/g;
      let match;

      while ((match = regex.exec(text)) !== null) {
        const corpXml = match[1];
        const nameMatch = corpXml.match(/<name[^>]*>([^<]+)<\/name>/);
        const numMatch = corpXml.match(/<corporateNumber[^>]*>([^<]+)<\/corporateNumber>/);
        const addrMatch = corpXml.match(/<address[^>]*>([^<]+)<\/address>/);

        corps.push({
          name: nameMatch?.[1] || '',
          corporateNumber: numMatch?.[1] || '',
          address: addrMatch?.[1] || ''
        });
      }

      return NextResponse.json(corps);
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error', message: String(error) }, { status: 500 });
    }
  }

  // Default: show debug info
  const info = {
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
    envVars: Object.keys(process.env).filter(k => k.includes('KEI') || k.includes('INVOICE')),
  };

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

  return NextResponse.json({ info, testResult, usage: 'Add ?name=会社名 to search' });
}
