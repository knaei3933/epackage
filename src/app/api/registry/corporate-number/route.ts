/**
 * Corporate Number Search API Route
 *
 * 日本の法人番号システムWeb-API
 * - 会社名から法人番号を検索
 * - 法人情報を取得
 * - 国税庁法人番号システムWeb-APIを使用
 *
 * APIドキュメント: https://www.houjin-bangou.nta.go.jp/webapi/
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

interface CorporateNumberResponse {
  name: string;
  corporateNumber: string;
  address: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    if (!name || name.length < 2) {
      return NextResponse.json<CorporateNumberResponse[]>([], { status: 400 });
    }

    const apiKey = process.env.KEI_CORPORATE_API_ID || process.env.INVOICE_KOHYO_API_KEY;
    if (!apiKey) {
      console.error('KEI_CORPORATE_API_ID or INVOICE_KOHYO_API_KEY is not set');
      return NextResponse.json<CorporateNumberResponse[]>([], { status: 500 });
    }

    // 法人番号システムWeb-API呼び出し
    const apiUrl = new URL('https://api.houjin-bangou.nta.go.jp/4/name');
    apiUrl.searchParams.set('id', apiKey);
    apiUrl.searchParams.set('name', name);
    apiUrl.searchParams.set('mode', '1');
    apiUrl.searchParams.set('type', '12');
    apiUrl.searchParams.set('history', '0');
    apiUrl.searchParams.set('close', '0');

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/xml' },
    });

    if (!response.ok) {
      console.error('Houjin Bangou API error:', response.status);
      return NextResponse.json<CorporateNumberResponse[]>([], { status: response.status });
    }

    const xmlText = await response.text();

    // Simple XML parsing for corporate data
    const corporationMatches = xmlText.match(/<corporation[^>]*>[\s\S]*?<\/corporation>/g);
    if (corporationMatches) {
      const results: CorporateNumberResponse[] = corporationMatches.map((corpXml) => {
        const nameMatch = corpXml.match(/<name[^>]*>([^<]+)<\/name>/);
        const corpNumMatch = corpXml.match(/<corporateNumber[^>]*>([^<]+)<\/corporateNumber>/);
        const addressMatch = corpXml.match(/<address[^>]*>([^<]+)<\/address>/);

        return {
          name: nameMatch ? nameMatch[1] : '',
          corporateNumber: corpNumMatch ? corpNumMatch[1] : '',
          address: addressMatch ? addressMatch[1] : '',
        };
      });

      return NextResponse.json<CorporateNumberResponse[]>(results);
    }

    return NextResponse.json<CorporateNumberResponse[]>([]);

  } catch (error) {
    console.error('Corporate number search error:', error);
    return NextResponse.json<CorporateNumberResponse[]>([], { status: 500 });
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
