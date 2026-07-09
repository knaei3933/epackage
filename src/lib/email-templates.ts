/**
 * Japanese Business Email Templates System (Barrel)
 *
 * ビジネスメールテンプレートシステム（バレルエクスポート）
 *
 * Implementation has been decomposed into src/lib/email-templates/ modules.
 * This file re-exports everything for backward compatibility.
 *
 * @module lib/email-templates
 * @see {@link ./email-templates/} for module implementations
 */

export * from './email-templates/index';
