/**
 * Company Search API Route
 * Searches Japanese corporate numbers using Houjin Bangou API
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Name parameter required (min 2 characters)' }, { status: 400 });
  }

  const apiKey = process.env.KEI_CORPORATE_API_ID || process.env.INVOICE_KOHYO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Use URLSearchParams for proper encoding
    const params = new URLSearchParams();
    params.set('id', apiKey);
    params.set('name', name);
    params.set('mode', '1');
    params.set('type', '12');
    params.set('history', '0');
    params.set('close', '0');

    const apiUrl = `https://api.houjin-bangou.nta.go.jp/4/name?${params.toString()}`;

    console.log('Fetching:', apiUrl);

    const response = await fetch(apiUrl);
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return NextResponse.json({ error: 'External API error', details: errorText }, { status: 500 });
    }

    const text = await response.text();

    // Parse XML response using regex
    const corps: any[] = [];
    const regex = /<corporation[^>]*>([\s\S]*?)<\/corporation>/g;
    let matchResult;

    while ((matchResult = regex.exec(text)) !== null) {
      const corpXml = matchResult[1];
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
    console.error('Corporate number search error:', error);
    return NextResponse.json({ error: 'Internal server error', message: String(error) }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
