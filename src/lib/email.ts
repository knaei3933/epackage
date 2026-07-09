/**
 * Email Utility Library (Barrel)
 *
 * メール送信ユーティリティ（バレルエクスポート）
 *
 * Implementation has been decomposed into src/lib/email/ modules.
 * This file re-exports everything for backward compatibility.
 *
 * @module lib/email
 * @see {@link ./email/} for module implementations
 */

export * from './email/index';
export { createRecipient } from './email-templates';
