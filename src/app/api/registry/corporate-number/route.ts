/**
 * Corporate Number Search API Route
 *
 * 日本の法人番号検索API
 * - 会社名から法人番号を検索
 * - 登記上の正式名称と所在地を取得
 * - 国税庁法人番号公表サイトAPIを使用
 */

import { NextRequest, NextResponse } from 'next/server';

// =====================================================
// Types
// =====================================================

interface CorporateNumberResponse {
  name: string;          // 正式名称
  corporateNumber: string; // 法人番号
  postalCode: string;    // 郵便番号
  prefecture: string;    // 都道府県
  city: string;          // 市区町村
  street: string;        // 番地・建物名
}

interface HoujinBangouResponse {
  status: number;
  message: string;
  data?: {
    name: string;
    corporateNumber: string;
    postalCode?: string;
    prefectureName?: string;
    cityName?: string;
    streetName?: string;
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
    const apiKey = process.env.HOUJIN_BANGOU_API_KEY;
    if (!apiKey) {
      console.error('HOUJIN_BANGOU_API_KEY is not set');
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: 500 }
      );
    }

    // 国税庁法人番号公表サイトAPI呼び出し
    // ドキュメント: https://www.houjin-bangou.nta.go.jp/documents/
    const apiUrl = new URL('https://api.houjin-bangou.nta.go.jp/v1/search');
    apiUrl.searchParams.set('id', apiKey);
    apiUrl.searchParams.set('name', name);
    apiUrl.searchParams.set('mode', '1'); // 完全一致モード
    apiUrl.searchParams.set('type', '02'); // 検索対象: 全て

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

    // レスポンスデータの変換
    if (data.data && data.data.length > 0) {
      const results: CorporateNumberResponse[] = data.data.map((item) => ({
        name: item.name,
        corporateNumber: item.corporateNumber,
        postalCode: item.postalCode || '',
        prefecture: item.prefectureName || '',
        city: item.cityName || '',
        street: item.streetName || '',
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
