/**
 * Company Search API Route
 * Searches Japanese corporate numbers using Houjin Bangou API
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Debug: log the raw URL
  const rawUrl = request.url;
  console.log('Raw URL:', rawUrl);

  // Extract using regex
  const urlMatch = rawUrl.match(/[?&]name=([^&]+)/);
  const encodedName = urlMatch ? urlMatch[1] : null;
  console.log('Extracted encoded name:', encodedName);

  // Also get using searchParams for comparison
  const { searchParams } = new URL(rawUrl);
  const decodedName = searchParams.get('name');
  console.log('Decoded name from searchParams:', decodedName);

  if (!decodedName || decodedName.length < 2) {
    return NextResponse.json({ error: 'Name parameter required (min 2 characters)', debug: { rawUrl, encodedName, decodedName } }, { status: 400 });
  }

  const apiKey = process.env.KEI_CORPORATE_API_ID || process.env.INVOICE_KOHYO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Try with the extracted encoded name
    const apiUrl1 = `https://api.houjin-bangou.nta.go.jp/4/name?id=${apiKey}&name=${encodedName}&mode=1&type=12&history=0&close=0`;
    console.log('API URL 1 (extracted):', apiUrl1);

    const response1 = await fetch(apiUrl1);
    console.log('Response 1 status:', response1.status);

    if (response1.ok) {
      const text = await response1.text();
      // Parse XML response
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
    }

    const errorText1 = await response1.text();
    console.error('API Error 1:', errorText1);

    // Try with re-encoded name
    const reEncodedName = encodeURIComponent(decodedName);
    const apiUrl2 = `https://api.houjin-bangou.nta.go.jp/4/name?id=${apiKey}&name=${reEncodedName}&mode=1&type=12&history=0&close=0`;
    console.log('API URL 2 (re-encoded):', apiUrl2);

    const response2 = await fetch(apiUrl2);
    console.log('Response 2 status:', response2.status);

    if (response2.ok) {
      const text = await response2.text();
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
    }

    const errorText2 = await response2.text();
    console.error('API Error 2:', errorText2);

    return NextResponse.json({
      error: 'Both attempts failed',
      attempt1: { status: response1.status, error: errorText1.substring(0, 100) },
      attempt2: { status: response2.status, error: errorText2.substring(0, 100) },
      debug: { rawUrl, encodedName, decodedName, reEncodedName }
    }, { status: 500 });

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
