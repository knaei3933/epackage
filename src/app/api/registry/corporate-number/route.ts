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
import { XMLParser } from 'fast-xml-parser';

// =====================================================
// Types
// =====================================================

interface CorporateNumberResponse {
  name: string;          // 事業者名
  corporateNumber: string; // 法人番号
  address: string;       // 本店所在地
}

// XMLレスポンス構造
interface HoujinBangouXMLResponse {
  count?: string;
  lastUpdateDate?: string;
  divideNumber?: string;
  divideSize?: string;
  hint?: string;
  error?: string;
  message?: string;
  corporationData?: {
    corporation?: CorporationInfo | CorporationInfo[];
  };
}

interface CorporationInfo {
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
}

// =====================================================
// XML Parser Configuration
// =====================================================

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
  alwaysCreateTextNode: false,
});

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

    // 法人番号システムWeb-API呼び出し (法人名検索 Ver.4.0)
    // エンドポイント: /4/name (法人名を指定して情報を取得)
    // 公式ドキュメント: https://www.houjin-bangou.nta.go.jp/webapi/
    // 参考: https://zenn.dev/tenkei/articles/8803f28e5165d9
    const apiUrl = new URL('https://api.houjin-bangou.nta.go.jp/4/name');
    apiUrl.searchParams.set('id', apiKey);
    apiUrl.searchParams.set('name', name);
    apiUrl.searchParams.set('mode', '1'); // 検索モード: 1=前方一致, 2=部分一致
    apiUrl.searchParams.set('type', '12'); // レスポンス形式: 12=XML (JSONは非対応)
    apiUrl.searchParams.set('history', '0'); // 履歴情報: 0=取得しない
    apiUrl.searchParams.set('close', '0'); // 閉鎖済法人: 0=取得しない

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },
    });

    if (!response.ok) {
      console.error('Houjin Bangou API error:', response.status);
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: response.status }
      );
    }

    // XMLをテキストとして取得
    const xmlText = await response.text();

    // XMLを解析
    const data: HoujinBangouXMLResponse = parser.parse(xmlText);

    // エラーチェック
    if (data.error !== undefined && parseInt(data.error) !== 0) {
      console.error('Houjin Bangou API error:', data.message);
      return NextResponse.json<CorporateNumberResponse[]>(
        [],
        { status: 500 }
      );
    }

    // レスポンスデータの変換
    // XMLパーサーは単一要素の場合はオブジェクト、複数の場合は配列を返す
    const corporations = data.corporationData?.corporation;
    if (corporations) {
      // 配列に正規化（単一要素の場合も配列に変換）
      const corpArray: CorporationInfo[] = Array.isArray(corporations) ? corporations : [corporations];

      const results: CorporateNumberResponse[] = corpArray.map((item) => ({
        name: item.name || '',
        corporateNumber: item.corporateNumber || '',
        address: item.address || '',
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
