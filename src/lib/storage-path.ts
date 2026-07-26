/**
 * Storage path utility
 *
 * Supabase Storage の public URL から object path（bucket 内の相対パス）を
 * 抽出する純関数。member / admin の download route で共通利用する。
 *
 * public URL の形式:
 *   https://{project}.supabase.co/storage/v1/object/public/{bucket}/{objectPath}
 *
 * 抽出される objectPath の例（production-files バケット）:
 *   production_data/{userId}/{orderId}/{timestamp}_{fileName}.{ext}
 *
 * 背景: file.file_url は public URL だが、storage.download() には bucket 内の
 * object path を渡す必要がある。URL の最終セグメントだけを取り出すと
 * パスのプレフィックス（production_data/{userId}/{orderId}/）が欠落し、
 * storage 上に存在しないパスへの download になってしまう。この関数で
 * {bucket} より後ろ全体を取り出す。
 */

/**
 * Extract storage object path from Supabase Storage public URL.
 *
 * @param url - Supabase Storage public URL（空文字 / null / undefined は null 扱い）
 * @returns object path（bucket 内相対パス）。パターン不一致時は null
 */
export function extractPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Handle Supabase Storage public URL format
  // https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
  const publicUrlPattern = /\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/;
  const match = url.match(publicUrlPattern);
  if (match) {
    return match[1];
  }

  return null;
}
