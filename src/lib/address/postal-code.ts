/**
 * Shared Japanese postal-code normalization and registry lookup helpers.
 *
 * Client flows use the same registry endpoint so signup, profile completion,
 * and sample confirmation produce consistent address values.
 */

export const POSTAL_CODE_PATTERN = /^\d{3}-\d{4}$/;

export const JAPANESE_PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
] as const;

export interface PostalAddress {
  /** Registry value in 123-4567 form. */
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
}

/**
 * Convert full-width digits to half-width, remove separators, and format any
 * complete seven-digit value as 123-4567. Partial input remains editable.
 */
export function normalizePostalCodeInput(value: string): string {
  const digits = value.normalize('NFKC').replace(/\D/g, '');
  return digits.length === 7 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
}

export function isCompletePostalCode(value: string): boolean {
  return /^\d{7}$/.test(value.replace(/-/g, ''));
}

export function matchPrefecture(
  value: string,
  options: readonly string[] = JAPANESE_PREFECTURES,
): string | undefined {
  return options.find((option) => value.includes(option));
}

interface RegistryPostalResponse {
  prefecture?: string;
  city?: string;
  street?: string;
}

/** Look up an address through the shared registry endpoint. */
export async function lookupPostalAddress(
  value: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PostalAddress> {
  const postalCode = normalizePostalCodeInput(value);
  if (!isCompletePostalCode(postalCode)) {
    throw new Error('郵便番号を正しく入力してください（例: 123-4567）');
  }

  let response: Response;
  try {
    response = await fetchImpl(
      `/api/registry/postal-code?postalCode=${encodeURIComponent(postalCode)}`,
    );
  } catch {
    throw new Error('住所検索に失敗しました。');
  }

  if (response.status === 404) {
    throw new Error('住所が見つかりませんでした。郵便番号を確認してください。');
  }
  if (!response.ok) {
    throw new Error('住所検索に失敗しました。');
  }

  const data = (await response.json().catch((): null => null)) as RegistryPostalResponse | null;
  const prefecture = data?.prefecture?.trim() ?? '';
  const city = data?.city?.trim() ?? '';
  const street = data?.street?.trim() ?? '';

  if (!prefecture && !city) {
    throw new Error('住所が見つかりませんでした。郵便番号を確認してください。');
  }

  return { postalCode, prefecture, city, street };
}
