/**
 * Corporate Number Verification API Route
 *
 * 日本の法人番号検証API
 * - 法人番号から会社情報を検索
 * - 国税庁法人番号システムWeb-API v4.0を使用
 * - Application ID: K2gaDNtfauzdk
 * - ドキュメント: https://www.houjin-bangou.nta.go.jp/webapi/index.html
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

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

// 国税庁API XML Response Structure
interface HoujinApiResponse {
  corporations?: {
    lastUpdateDate?: string[];
    count?: string[];
    corporation?: CorporationData[];
  };
  // Error response
  error?: {
    code?: string[];
    message?: string[];
  };
}

interface CorporationData {
  corporateNumber?: string[];
  name?: string[];
  nameEnglish?: string[];
  prefectureName?: string[];
  cityName?: string[];
  streetNumber?: string[];
  postCode?: string[];
  corporateType?: string[];
  corporateTypeCode?: string[];
  processType?: string[];
  processTypeCode?: string[];
  registrationDate?: string[];
  updateDate?: string[];
  changeDate?: string[];
  closeDate?: string[];
  deleteFlag?: string[];
  successorCorporateNumber?: string[];
  successorName?: string[];
  successorNameEnglish?: string[];
  prefectureNameEnglish?: string[];
  cityNameEnglish?: string[];
  streetNumberEnglish?: string[];
  addressEnglish?: string[];
  nameImageId?: string[];
  addressImageId?: string[];
  jurisdictionMinistryCode?: string[];
  fundType?: string[];
  fundTypeCode?: string[];
  capitalStock?: string[];
  surplus?: string[];
  profit?: string[];
  ordinaryProfit?: string[];
  revenue?: string[];
  employeeRange?: string[];
  employeeRangeCode?: string[];
  standAloneFlag?: string[];
  subsidiariesFlag?: string[];
  parentCompanyFlag?: string[];
  listedFlag?: string[];
  listedFlagCode?: string[];
  capitalCode?: string[];
  establishmentDate?: string[];
  closeCause?: string[];
  closeCauseCode?: string[];
  successorAssignmentDate?: string[];
  assignmentDate?: string[];
}

// =====================================================
// XML Parser Helper
// =====================================================

async function parseXmlResponse(xmlText: string): Promise<HoujinApiResponse> {
  try {
    const result = await parseStringPromise(xmlText, {
      explicitArray: false,
      mergeAttrs: true,
    });
    return result as HoujinApiResponse;
  } catch (error) {
    console.error('XML parse error:', error);
    throw new Error('XML解析に失敗しました');
  }
}

function convertToCorporateNumberResponse(data: CorporationData): CorporateNumberResponse {
  return {
    name: data.name?.[0] || '',
    corporateNumber: data.corporateNumber?.[0] || '',
    postalCode: data.postCode?.[0] || '',
    prefecture: data.prefectureName?.[0] || '',
    city: data.cityName?.[0] || '',
    street: data.streetNumber?.[0] || '',
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

    // 数字のみチェック
    if (!/^\d{13}$/.test(corporateNumber)) {
      return NextResponse.json(
        { error: '法人番号は数字のみで入力してください。' },
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

    // 国税庁法人番号システムWeb-API v4.0 呼び出し
    // エンドポイント: https://api.houjin-bangou.nta.go.jp/4/num
    // ドキュメント: https://www.houjin-bangou.nta.go.jp/webapi/index.html
    const apiUrl = new URL('https://api.houjin-bangou.nta.go.jp/4/num');
    apiUrl.searchParams.set('id', appId);
    apiUrl.searchParams.set('number', corporateNumber);
    apiUrl.searchParams.set('type', '12'); // XML形式
    apiUrl.searchParams.set('history', '0'); // 変更履歴なし

    console.log('[Corp API] Fetching:', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },
    });

    if (!response.ok) {
      console.error('[Corp API] HTTP error:', response.status);
      return NextResponse.json(
        { error: '法人番号の検証に失敗しました。' },
        { status: response.status }
      );
    }

    const xmlText = await response.text();

    // エラーレスポンスチェック
    if (xmlText.match(/^\d{3},/)) {
      const errorCode = xmlText.substring(0, 3);
      const errorMessage = xmlText.substring(4);
      console.error('[Corp API] API error:', errorCode, errorMessage);
      return NextResponse.json(
        { error: `APIエラー: ${errorMessage || '不明なエラー'}` },
        { status: 400 }
      );
    }

    // XML解析
    const parsedData = await parseXmlResponse(xmlText);

    // エラーレスポンスチェック
    if (parsedData.error) {
      const errorCode = parsedData.error.code?.[0] || '';
      const errorMessage = parsedData.error.message?.[0] || '不明なエラー';
      console.error('[Corp API] API error:', errorCode, errorMessage);
      return NextResponse.json(
        { error: `APIエラー: ${errorMessage} (${errorCode})` },
        { status: 400 }
      );
    }

    // データ変換
    if (parsedData.corporations?.corporation) {
      const corporations = Array.isArray(parsedData.corporations.corporation)
        ? parsedData.corporations.corporation
        : [parsedData.corporations.corporation];

      if (corporations.length > 0) {
        const result = convertToCorporateNumberResponse(corporations[0]);
        return NextResponse.json(result);
      }
    }

    // 見つからなかった場合
    return NextResponse.json(
      { error: '法人番号が見つかりませんでした。' },
      { status: 404 }
    );

  } catch (error) {
    console.error('[Corp API] Unexpected error:', error);
    return NextResponse.json(
      { error: '法人番号の検証に失敗しました。' },
      { status: 500 }
    );
  }
}

// =====================================================
// GET Handler - Name Search
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

    // 環境変数からアプリケーションIDを取得
    const appId = process.env.KEI_CORPORATE_API_ID;
    if (!appId) {
      console.error('KEI_CORPORATE_API_ID is not set');
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: 500 }
      );
    }

    // 国税庁法人番号システムWeb-API v4.0 呼び出し（法人名検索）
    // エンドポイント: https://api.houjin-bangou.nta.go.jp/4/name
    const apiUrl = new URL('https://api.houjin-bangou.nta.go.jp/4/name');
    apiUrl.searchParams.set('id', appId);
    apiUrl.searchParams.set('name', name);
    apiUrl.searchParams.set('type', '12'); // XML形式
    apiUrl.searchParams.set('mode', '1'); // 完全一致

    console.log('[Corp API GET] Fetching:', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },
    });

    if (!response.ok) {
      console.error('[Corp API GET] HTTP error:', response.status);
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: response.status }
      );
    }

    const xmlText = await response.text();

    // エラーレスポンスチェック
    if (xmlText.match(/^\d{3},/)) {
      const errorCode = xmlText.substring(0, 3);
      const errorMessage = xmlText.substring(4);
      console.error('[Corp API GET] API error:', errorCode, errorMessage);
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: 400 }
      );
    }

    // XML解析
    const parsedData = await parseXmlResponse(xmlText);

    // エラーレスポンスチェック
    if (parsedData.error) {
      console.error('[Corp API GET] API error:', parsedData.error);
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: 400 }
      );
    }

    // データ変換
    if (parsedData.corporations?.corporation) {
      const corporations = Array.isArray(parsedData.corporations.corporation)
        ? parsedData.corporations.corporation
        : [parsedData.corporations.corporation];

      const results = corporations.map(convertToCorporateNumberResponse);
      return NextResponse.json<CorporateNumberResponse[]>(results);
    }

    return NextResponse.json<CorporateNumberResponse[]>([]);

  } catch (error) {
    console.error('[Corp API GET] Unexpected error:', error);
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
