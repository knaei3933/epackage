/**
 * Company Search API Route
 * Searches Japanese corporate numbers using Houjin Bangou API
 *
 * IMPORTANT: The API often requires company names WITHOUT legal suffixes.
 * We automatically try both full name and name without suffix.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

// Legal suffixes to remove for better search results
const LEGAL_SUFFIXES = [
  '株式会社', '有限会社', '合同会社', '合名会社', '合資会社',
  'ＧＫ', 'ＫＫ', 'LLP', 'LLC'
];

function removeLegalSuffix(name: string): string {
  let cleaned = name;
  for (const suffix of LEGAL_SUFFIXES) {
    if (cleaned.startsWith(suffix)) {
      cleaned = cleaned.substring(suffix.length);
    }
    if (cleaned.endsWith(suffix)) {
      cleaned = cleaned.substring(0, cleaned.length - suffix.length);
    }
  }
  return cleaned.trim();
}

// Convert half-width alphanumeric to full-width (zenkaku)
// The Houjin Bangou API stores company names with full-width characters
function toZenkaku(input: string): string {
  const halfWidth = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ';
  const fullWidth = '０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ　';

  let result = '';
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const index = halfWidth.indexOf(char);
    if (index !== -1) {
      result += fullWidth[index];
    } else {
      result += char;
    }
  }
  return result;
}

function parseXmlResponse(text: string): any[] {
  const corps: any[] = [];
  const regex = /<corporation[^>]*>([\s\S]*?)<\/corporation>/g;
  let matchResult;
  while ((matchResult = regex.exec(text)) !== null) {
    const corpXml = matchResult[1];
    const nameMatch = corpXml.match(/<name[^>]*>([^<]+)<\/name>/);
    const numMatch = corpXml.match(/<corporateNumber[^>]*>([^<]+)<\/corporateNumber>/);
    const prefMatch = corpXml.match(/<prefectureName[^>]*>([^<]*)<\/prefectureName>/);
    const cityMatch = corpXml.match(/<cityName[^>]*>([^<]*)<\/cityName>/);
    const streetMatch = corpXml.match(/<streetNumber[^>]*>([^<]*)<\/streetNumber>/);
    const postMatch = corpXml.match(/<postCode[^>]*>([^<]*)<\/postCode>/);

    // Format postal code if available (XXX-XXXX format)
    const postCode = postMatch?.[1] || '';
    const formattedPostalCode = postCode.length === 7
      ? `${postCode.substring(0, 3)}-${postCode.substring(3)}`
      : postCode;

    corps.push({
      name: nameMatch?.[1] || '',
      corporateNumber: numMatch?.[1] || '',
      prefecture: prefMatch?.[1] || '',
      city: cityMatch?.[1] || '',
      streetNumber: streetMatch?.[1] || '',
      postalCode: formattedPostalCode,
      // Full address for backward compatibility
      address: [prefMatch?.[1], cityMatch?.[1], streetMatch?.[1]]
        .filter(Boolean)
        .join('')
    });
  }
  return corps;
}

function getResultCount(xmlText: string): number {
  const countMatch = xmlText.match(/<count>(\d+)<\/count>/);
  return countMatch ? parseInt(countMatch[1], 10) : 0;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const decodedName = searchParams.get('name');

  if (!decodedName || decodedName.length < 2) {
    return NextResponse.json({ error: 'Name parameter required (min 2 characters)' }, { status: 400 });
  }

  const apiKey = process.env.KEI_CORPORATE_API_ID || process.env.INVOICE_KOHYO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Search terms to try in order:
    // 1. Original name
    // 2. Name without legal suffix
    // 3. Full-width converted name (for English company names)
    // 4. Full-width name without legal suffix
    const searchTerms = [decodedName];

    // Try without legal suffix
    const cleanedName = removeLegalSuffix(decodedName);
    if (cleanedName !== decodedName && cleanedName.length >= 2) {
      searchTerms.push(cleanedName);
    }

    // Try full-width conversion (for English company names)
    const zenkakuName = toZenkaku(decodedName);
    if (zenkakuName !== decodedName) {
      searchTerms.push(zenkakuName);
      // Also try full-width without legal suffix
      const zenkakuCleaned = removeLegalSuffix(zenkakuName);
      if (zenkakuCleaned !== zenkakuName && zenkakuCleaned.length >= 2) {
        searchTerms.push(zenkakuCleaned);
      }
    }

    for (const searchTerm of searchTerms) {
      const encodedTerm = encodeURIComponent(searchTerm);
      const apiUrl = `https://api.houjin-bangou.nta.go.jp/4/name?id=${apiKey}&name=${encodedTerm}&mode=1&type=12&history=0&close=0`;

      const response = await fetch(apiUrl);

      if (response.ok) {
        const text = await response.text();
        const corps = parseXmlResponse(text);

        // Return results if found
        if (corps.length > 0) {
          return NextResponse.json(corps);
        }
      }
    }

    // No results found
    return NextResponse.json([]);

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
