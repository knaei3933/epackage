/**
 * Corporate Number Verification API Route
 *
 * 日本の法人番号検証API
 * - 法人番号から会社情報を検索
 * - KEIシステムAPIを使用
 * - Application ID: K2gaDNtfauzdk
 */

export const dynamic = 'force-dynamic';

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

interface KeiSystemResponse {
  status: string;
  message?: string;
  data?: {
    corporateNumber: string;
    name: string;
    prefecture?: string;
    city?: string;
    address?: string;
    postCode?: string;
    date?: string;
    updateDate?: string;
    changeDate?: string;
  };
}

// =====================================================
// POST Handler - Corporate Number Verification
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { corporateNumber } = body;

    // バリデーション
    if (!corporateNumber || corporateNumber.length !== 13) {
      return NextResponse.json(
        { error: '法人番号は13桁で入力してください。' },
        { status: 400 }
      );
    }

    // 環境変数からアプリケーションIDを取得
    const appId = process.env.KEI_CORPORATE_API_ID;
    if (!appId) {
      console.error('KEI_CORPORATE_API_ID is not set');
      return NextResponse.json(
        { error: 'API設定が見つかりません。' },
        { status: 500 }
      );
    }

    // KEIシステムAPI呼び出し
    // エンドポイント: https://api.kei-system.com/v1/corporate
    const apiUrl = new URL('https://api.kei-system.com/v1/corporate');
    apiUrl.searchParams.set('id', appId);
    apiUrl.searchParams.set('number', corporateNumber);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('KEI System API error:', response.status);
      return NextResponse.json(
        { error: '法人番号の検証に失敗しました。' },
        { status: response.status }
      );
    }

    const data: KeiSystemResponse = await response.json();

    // レスポンスデータの変換
    if (data.status === 'success' && data.data) {
      const result: CorporateNumberResponse = {
        name: data.data.name,
        corporateNumber: data.data.corporateNumber,
        postalCode: data.data.postCode || '',
        prefecture: data.data.prefecture || '',
        city: data.data.city || '',
        street: data.data.address || '',
      };

      return NextResponse.json(result);
    }

    // 見つからなかった場合
    return NextResponse.json(
      { error: data.message || '法人番号が見つかりませんでした。' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Corporate number verification error:', error);
    return NextResponse.json(
      { error: '法人番号の検証に失敗しました。' },
      { status: 500 }
    );
  }
}

// =====================================================
// GET Handler - Name Search (国税庁APIフォールバック)
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

    // 環境変数からAPIキーを取得（国税庁API）
    const apiKey = process.env.HOUJIN_BANGOU_API_KEY;
    if (!apiKey) {
      console.error('HOUJIN_BANGOU_API_KEY is not set');
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: 500 }
      );
    }

    // 国税庁法人番号公表サイトAPI呼び出し
    const apiUrl = new URL('https://api.houjin-bangou.nta.go.jp/v1/search');
    apiUrl.searchParams.set('id', apiKey);
    apiUrl.searchParams.set('name', name);
    apiUrl.searchParams.set('mode', '1');
    apiUrl.searchParams.set('type', '02');

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

    const data: any = await response.json();

    // レスポンスデータの変換
    if (data.data && data.data.length > 0) {
      const results: CorporateNumberResponse[] = data.data.map((item: any) => ({
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
