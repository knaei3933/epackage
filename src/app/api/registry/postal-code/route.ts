/**
 * Postal Code Search API Route
 *
 * 日本の郵便番号から住所を検索するAPI
 * - 郵便番号から都道府県、市区町村、番地を自動入力
 * - 日本郵便API（zipcloud.ibsnet.co.jp）を使用
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// =====================================================
// Types
// =====================================================

interface PostalCodeResponse {
  prefecture: string;    // 都道府県
  city: string;          // 市区町村
  street: string;        // 番地
  fullAddress: string;   // 完全住所
}

interface ZipCloudResponse {
  message: string | null;
  results: Array<{
    zipcode: string;
    prefcode: string;
    address1: string;   // 都道府県
    address2: string;   // 市区町村
    address3: string;   // 番地
    kana1: string;      // 都道府県カナ
    kana2: string;      // 市区町村カナ
    kana3: string;      // 番地カナ
  }> | null;
  status: number;
}

// =====================================================
// API Handler
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postalCode = searchParams.get('postalCode');

    // バリデーション
    if (!postalCode) {
      return NextResponse.json<PostalCodeResponse>(
        { prefecture: '', city: '', street: '', fullAddress: '' },
        { status: 400 }
      );
    }

    // 郵便番号からハイフンを除去（xxx-xxxx または xxxxxxx 形式対応）
    const normalizedPostalCode = postalCode.replace('-', '');

    if (!/^\d{7}$/.test(normalizedPostalCode)) {
      return NextResponse.json<PostalCodeResponse>(
        { prefecture: '', city: '', street: '', fullAddress: '' },
        { status: 400 }
      );
    }

    // zipcloud API呼び出し（日本郵便のデータベースを使用）
    // 無料で利用可能、APIキー不要
    const apiUrl = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${normalizedPostalCode}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('ZipCloud API error:', response.status);
      return NextResponse.json<PostalCodeResponse>(
        { prefecture: '', city: '', street: '', fullAddress: '' },
        { status: response.status }
      );
    }

    const data: ZipCloudResponse = await response.json();

    // レスポンスデータの変換
    if (data.results && data.results.length > 0) {
      const item = data.results[0];

      const result: PostalCodeResponse = {
        prefecture: item.address1,
        city: item.address2,
        street: item.address3,
        fullAddress: `${item.address1}${item.address2}${item.address3}`,
      };

      return NextResponse.json<PostalCodeResponse>(result);
    }

    // 該当住所が見つからない場合
    return NextResponse.json<PostalCodeResponse>(
      { prefecture: '', city: '', street: '', fullAddress: '' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Postal code search error:', error);
    return NextResponse.json<PostalCodeResponse>(
      { prefecture: '', city: '', street: '', fullAddress: '' },
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
