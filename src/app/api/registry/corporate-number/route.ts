/**
 * Corporate Number Search API Route
 *
 * 日本の適格請求書発行事業者登録番号公表サイトAPI
 * - 会社名から登録番号を検索
 * - 適格請求書発行事業者の情報を取得
 * - 国税庁適格請求書発行事業者登録番号公表サイトAPIを使用
 *
 * APIドキュメント: https://www.invoice-kohyo.nta.go.jp/web-api/index.html
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// =====================================================
// Types
// =====================================================

interface CorporateNumberResponse {
  name: string;          // 事業者名
  corporateNumber: string; // 登録番号
  address: string;       // 本店所在地
}

interface InvoiceKohyoResponse {
  status?: number;
  message?: string;
  searchResult?: {
    registrationNumber: string;  // 登録番号 (T + 13桁)
    name: string;                 // 事業者名
    nameKana: string;             // 事業者名カナ
    address: string;              // 本店所在地
  }[];
}

// =====================================================
// API Handler
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    // バリデーション
    if (!name || name.length < 2) {
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: 400 }
      );
    }

    // 環境変数からAPIキーを取得
    const apiKey = process.env.KEI_CORPORATE_API_ID || process.env.INVOICE_KOHYO_API_KEY;
    if (!apiKey) {
      console.error('KEI_CORPORATE_API_ID or INVOICE_KOHYO_API_KEY is not set');
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: 500 }
      );
    }

    // 適格請求書発行事業者登録番号公表サイトAPI呼び出し
    // エンドポイント: /web-api/api (事業者名検索)
    const apiUrl = new URL('https://invoice-kohyo.nta.go.jp/web-api/api');
    apiUrl.searchParams.set('id', apiKey);
    apiUrl.searchParams.set('searchWord', name);
    apiUrl.searchParams.set('type', '1'); // 事業者名検索

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Invoice Kohyo API error:', response.status);
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: response.status }
      );
    }

    const data: InvoiceKohyoResponse = await response.json();

    // レスポンスデータの変換
    if (data.searchResult && data.searchResult.length > 0) {
      const results: CorporateNumberResponse[] = data.searchResult.map((item) => ({
        name: item.name,
        corporateNumber: item.registrationNumber,
        address: item.address,
      }));

      return NextResponse.json<CorporateNumberResponse[]>(results);
    }

    return NextResponse.json<CorporateNumberResponse[]>([]);

  } catch (error) {
    console.error('Corporate number search error:', error);
    return NextResponse.json<CorporateNumberResponse[]>(
      [],
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS for CORS
// =====================================================

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
