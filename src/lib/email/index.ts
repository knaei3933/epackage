/**
 * Email Module Index
 *
 * メールモジュール一覧
 * 通知サービスとテンプレートをエクスポート
 */

export * from './notificationService'
export * from './templates'
export { emailTemplates } from './templates'

// Epackage Lab 専用メールテンプレート・サービス
export * from './epack-templates'
export * from './epack-mailer'
export * from './order-status-emails'
export { epackEmailTemplates } from './epack-templates'
export { epackMailer } from './epack-mailer'
export { orderStatusEmails } from './order-status-emails'
