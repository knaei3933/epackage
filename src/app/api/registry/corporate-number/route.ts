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

// =====================================================
// Types
// =====================================================

interface CorporateNumberResponse {
  name: string;          // 事業者名
  corporateNumber: string; // 法人番号
  address: string;       // 本店所在地
}

interface HoujinBangouResponse {
  count?: number;
  lastUpdateDate?: string;
  divideNumber?: string;
  divideSize?: number;
  hint?: string;
  error?: number;
  message?: string;
  corporations?: {
    sequenceNumber: string;
    corporateNumber: string;     // 法人番号 (13桁)
    name: string;                 // 商号又は名称
    nameImageId?: string;
    postCode: string;             // 郵便番号
    address: string;              // 本店所在地
    prefectureName: string;       // 都道府県名
    cityCode: string;             // 市区町村コード
    cityName: string;             // 市区町村名
    streetNumber: string;         // 街区画等
    addressImageId?: string;
    prefectureCode?: string;
    closeDate?: string;           // 設立年月日
    updateDate?: string;
    changeDate?: string;
    nameImageId?: string;
    addressImageId?: string;
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

    // 法人番号システムWeb-API呼び出し
    // エンドポイント: /web-api/alpha/v1/search (事業者名検索)
    const apiUrl = new URL('https://api.houjin-bangou.nta.go.jp/v1/search');
    apiUrl.searchParams.set('id', apiKey);
    apiUrl.searchParams.set('name', name);
    apiUrl.searchParams.set('mode', '1'); // 検索モード: 1=完全一致, 2=前方一致, 3=後方一致

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Houjin Bangou API error:', response.status);
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: response.status }
      );
    }

    const data: HoujinBangouResponse = await response.json();

    // エラーチェック
    if (data.error !== undefined && data.error !== 0) {
      console.error('Houjin Bangou API error:', data.message);
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: 500 }
      );
    }

    // レスポンスデータの変換
    if (data.corporations && data.corporations.length > 0) {
      const results: CorporateNumberResponse[] = data.corporations.map((item) => ({
        name: item.name,
        corporateNumber: item.corporateNumber,
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
