/**
 * お問い合わせ添付バケットの抽象化（order-inquiry-link / M3）
 * ============================================================
 *
 * 添付 Storage バケットは2系統:
 *   1. `inquiry-attachments`（従来・一般 inquiry 用）
 *      - private・10MB・画像(jpeg/png/gif/webp) + PDF
 *      - 会員お問い合わせスレッド・ゲスト問い合わせで使用
 *
 *   2. `inquiry-order-attachments`（注文チャット連携用・Phase 1 新設）
 *      - private・100MB・画像 + PDF + デザインデータ(postscript/photoshop/illustrator)
 *      - 注文ページからのチャット（order_id 設定済 inquiry）で使用
 *      - デザインデータ（AI/EPS/PSD/PDF）を扱うため容量・MIME を拡張
 *
 * この関数は API/クライアント層の「どのバケットを使うか」判断を1ヶ所に集約する。
 * 各 API がバケット名をハードコードせず、必ずこの関数を経由すること（M1/M2 CRITICAL 対策）。
 *
 * @example
 *   const bucket = getAttachmentBucketForInquiry(inquiry.order_id)
 *   // inquiry.order_id があれば 'inquiry-order-attachments'・なければ 'inquiry-attachments'
 */

export type InquiryAttachmentBucket =
  | 'inquiry-attachments'
  | 'inquiry-order-attachments'

/**
 * inquiry の order_id の有無から適切な添付バケット名を返す。
 *
 * - order_id が設定済み（注文チャット）→ 'inquiry-order-attachments'
 * - order_id が無い（一般 inquiry）  → 'inquiry-attachments'
 *
 * null / undefined / 空文字はすべて「一般 inquiry 扱い」で安全側に倒す。
 */
export function getAttachmentBucketForInquiry(
  orderId: string | null | undefined,
): InquiryAttachmentBucket {
  return orderId && orderId.length > 0
    ? 'inquiry-order-attachments'
    : 'inquiry-attachments'
}

/**
 * 注文チャット用バケットかどうかの型ガード（ログ・分岐の可読化用）。
 */
export function isOrderInquiryBucket(
  bucket: string,
): bucket is 'inquiry-order-attachments' {
  return bucket === 'inquiry-order-attachments'
}
