/**
 * Company Search API Route
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name || name.length < 2) {
    return NextResponse.json([], { status: 400 });
  }

  const apiKey = process.env.KEI_CORPORATE_API_ID || process.env.INVOICE_KOHYO_API_KEY;
  if (!apiKey) {
    return NextResponse.json([], { status: 500 });
  }

  try {
    const apiUrl = new URL('https://api.houjin-bangou.nta.go.jp/4/name');
    apiUrl.searchParams.set('id', apiKey);
    apiUrl.searchParams.set('name', name);
    apiUrl.searchParams.set('mode', '1');
    apiUrl.searchParams.set('type', '12');
    apiUrl.searchParams.set('history', '0');
    apiUrl.searchParams.set('close', '0');

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      return NextResponse.json([], { status: response.status });
    }

    const text = await response.text();

    // Parse XML response
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
    console.error('Error:', error);
    return NextResponse.json([], { status: 500 });
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
