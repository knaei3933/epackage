/**
 * Email Settings Loader
 *
 * メール設定ローダー
 * データベースからメール設定を読み込み、キャッシュ管理を行う
 *
 * @module lib/email/email-settings
 */

import { createClient } from '@supabase/supabase-js';
import type {
  EmailSettings,
  SmtpConfig,
  EmailToggles,
  CompanyInfo,
  BankInfo,
  NotificationRecipients,
  DEFAULT_SMTP_CONFIG,
  DEFAULT_EMAIL_TOGGLES,
  DEFAULT_COMPANY_INFO,
  DEFAULT_BANK_INFO,
  DEFAULT_NOTIFICATION_RECIPIENTS,
} from '@/types/email';

// ============================================================
// Cache Management
// ============================================================

interface EmailSettingsCache {
  settings: EmailSettings | null;
  timestamp: number;
  version: string;
}

// In-memory cache with TTL
let settingsCache: EmailSettingsCache | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache version for invalidation
const CACHE_VERSION = '1.0.0';

// ============================================================
// Supabase Client (Server-side)
// ============================================================

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[EmailSettings] Supabase credentials not configured');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ============================================================
// Settings Keys
// ============================================================

const SETTINGS_KEYS = {
  SMTP_CONFIG: 'smtp_config',
  EMAIL_TOGGLES: 'email_toggles',
  COMPANY_INFO: 'email_company_info',
  BANK_INFO: 'bank_account_info',
  ADMIN_EMAILS: 'admin_notification_emails',
  SALES_EMAILS: 'sales_notification_emails',
  PRODUCTION_EMAILS: 'production_notification_emails',
} as const;

// ============================================================
// Default Values
// ============================================================

function getDefaultSmtpConfig(): SmtpConfig {
  return {
    host: process.env.XSERVER_SMTP_HOST || '',
    port: parseInt(process.env.XSERVER_SMTP_PORT || '587'),
    user: process.env.XSERVER_SMTP_USER || '',
    password: process.env.XSERVER_SMTP_PASSWORD,
    from_email: process.env.FROM_EMAIL || 'noreply@package-lab.com',
    reply_to: process.env.REPLY_TO_EMAIL || 'support@package-lab.com',
    admin_email: process.env.ADMIN_EMAIL || 'admin@package-lab.com',
  };
}

function getDefaultToggles(): EmailToggles {
  return {
    order_confirmation: true,
    shipping_notification: true,
    quote_approval: true,
    production_status: true,
    admin_notifications: true,
    designer_notifications: true,
    data_upload_reminders: true,
    approval_reminders: true,
  };
}

function getDefaultCompanyInfo(): CompanyInfo {
  return {
    company_name_ja: 'イーパックラボ',
    company_name_en: 'EPackage Lab',
    support_email: 'design@package-lab.com',
    support_phone: '050-1793-8500',
    postal_code: '673-0846',
    address: '兵庫県明石市上ノ丸2-11-21',
  };
}

function getDefaultBankInfo(): BankInfo {
  return {
    bank_name: 'PayPay銀行',
    branch_name: 'ビジネス営業部支店(005)',
    account_type: '普通',
    account_number: '5630235',
    account_holder: 'カネイボウエキ（カ',
  };
}

function getDefaultRecipients(): NotificationRecipients {
  return {
    admin_emails: ['admin@package-lab.com'],
    sales_emails: ['sales@package-lab.com'],
    production_emails: ['production@package-lab.com'],
  };
}

// ============================================================
// Core Settings Loader
// ============================================================

/**
 * データベースからメール設定を読み込む
 *
 * @param useCache - キャッシュを使用するかどうか
 * @returns メール設定オブジェクト
 */
export async function loadEmailSettings(useCache: boolean = true): Promise<EmailSettings> {
  // Check cache first
  if (useCache && settingsCache && Date.now() - settingsCache.timestamp < CACHE_TTL) {
    if (settingsCache.settings) {
      return settingsCache.settings;
    }
  }

  const supabase = getSupabaseClient();

  // If no Supabase client, return defaults
  if (!supabase) {
    console.log('[EmailSettings] Using environment defaults (no Supabase client)');
    return {
      smtp: getDefaultSmtpConfig(),
      toggles: getDefaultToggles(),
      companyInfo: getDefaultCompanyInfo(),
      bankInfo: getDefaultBankInfo(),
      recipients: getDefaultRecipients(),
    };
  }

  try {
    // Fetch all settings in parallel
    const [
      smtpResult,
      togglesResult,
      companyInfoResult,
      bankInfoResult,
      adminEmailsResult,
      salesEmailsResult,
      productionEmailsResult,
    ] = await Promise.all([
      supabase.from('notification_settings').select('value').eq('key', SETTINGS_KEYS.SMTP_CONFIG).maybeSingle(),
      supabase.from('notification_settings').select('value').eq('key', SETTINGS_KEYS.EMAIL_TOGGLES).maybeSingle(),
      supabase.from('notification_settings').select('value').eq('key', SETTINGS_KEYS.COMPANY_INFO).maybeSingle(),
      supabase.from('notification_settings').select('value').eq('key', SETTINGS_KEYS.BANK_INFO).maybeSingle(),
      supabase.from('notification_settings').select('value').eq('key', SETTINGS_KEYS.ADMIN_EMAILS).maybeSingle(),
      supabase.from('notification_settings').select('value').eq('key', SETTINGS_KEYS.SALES_EMAILS).maybeSingle(),
      supabase.from('notification_settings').select('value').eq('key', SETTINGS_KEYS.PRODUCTION_EMAILS).maybeSingle(),
    ]);

    // Build settings object with fallbacks
    const settings: EmailSettings = {
      smtp: {
        ...getDefaultSmtpConfig(),
        ...(smtpResult.data?.value || {}),
      },
      toggles: {
        ...getDefaultToggles(),
        ...(togglesResult.data?.value || {}),
      },
      companyInfo: {
        ...getDefaultCompanyInfo(),
        ...(companyInfoResult.data?.value || {}),
      },
      bankInfo: {
        ...getDefaultBankInfo(),
        ...(bankInfoResult.data?.value || {}),
      },
      recipients: {
        admin_emails: adminEmailsResult.data?.value || getDefaultRecipients().admin_emails,
        sales_emails: salesEmailsResult.data?.value || getDefaultRecipients().sales_emails,
        production_emails: productionEmailsResult.data?.value || getDefaultRecipients().production_emails,
      },
    };

    // Update cache
    settingsCache = {
      settings,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    return settings;
  } catch (error) {
    console.error('[EmailSettings] Error loading settings:', error);
    // Return defaults on error
    return {
      smtp: getDefaultSmtpConfig(),
      toggles: getDefaultToggles(),
      companyInfo: getDefaultCompanyInfo(),
      bankInfo: getDefaultBankInfo(),
      recipients: getDefaultRecipients(),
    };
  }
}

/**
 * キャッシュからメール設定を取得（キャッシュがない場合は読み込み）
 */
export async function getCachedEmailSettings(): Promise<EmailSettings> {
  return loadEmailSettings(true);
}

/**
 * キャッシュを無効化
 */
export function invalidateEmailSettingsCache(): void {
  settingsCache = null;
  console.log('[EmailSettings] Cache invalidated');
}

/**
 * 特定セクションの設定のみを取得
 */
export async function getSmtpConfig(): Promise<SmtpConfig> {
  const settings = await getCachedEmailSettings();
  return settings.smtp;
}

export async function getEmailToggles(): Promise<EmailToggles> {
  const settings = await getCachedEmailSettings();
  return settings.toggles;
}

export async function getCompanyInfo(): Promise<CompanyInfo> {
  const settings = await getCachedEmailSettings();
  return settings.companyInfo;
}

export async function getBankInfo(): Promise<BankInfo> {
  const settings = await getCachedEmailSettings();
  return settings.bankInfo;
}

export async function getNotificationRecipients(): Promise<NotificationRecipients> {
  const settings = await getCachedEmailSettings();
  return settings.recipients;
}

// ============================================================
// Bank Info Formatter
// ============================================================

/**
 * 銀行口座情報をテキスト形式で取得
 */
export async function getBankInfoText(): Promise<string> {
  const bankInfo = await getBankInfo();
  return `
振込先銀行口座
━━━━━━━━━━━━━━━━━━━━
銀行名：${bankInfo.bank_name}
支店名：${bankInfo.branch_name}
預金種目：${bankInfo.account_type}
口座番号：${bankInfo.account_number}
口座名義：${bankInfo.account_holder}
━━━━━━━━━━━━━━━━━━━━
`.trim();
}

/**
 * 銀行口座情報をHTML形式で取得
 */
export async function getBankInfoHtml(): Promise<string> {
  const bankInfo = await getBankInfo();
  return `
      <div style="background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 13px;">
        <strong style="display: block; margin-bottom: 10px;">振込先銀行口座</strong>
        <div style="line-height: 1.8;">
          銀行名：${bankInfo.bank_name}<br>
          支店名：${bankInfo.branch_name}<br>
          預金種目：${bankInfo.account_type}<br>
          口座番号：${bankInfo.account_number}<br>
          口座名義：${bankInfo.account_holder}
        </div>
      </div>
  `.trim();
}

// ============================================================
// Company Info Formatter
// ============================================================

/**
 * 会社情報をフッターテキスト形式で取得
 */
export async function getFooterText(year: number = new Date().getFullYear()): Promise<string> {
  const companyInfo = await getCompanyInfo();
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${companyInfo.company_name_en} (${companyInfo.company_name_ja})
〒${companyInfo.postal_code}
${companyInfo.address}
TEL: ${companyInfo.support_phone}
Email: ${companyInfo.support_email}
URL: https://epackage-lab.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
本メールはシステムにより自動送信されています。
お問い合わせ: ${companyInfo.support_email}
Copyright © ${year} ${companyInfo.company_name_en}. All rights reserved.
`.trim();
}

// ============================================================
// Toggle Checkers
// ============================================================

/**
 * 特定のメールタイプが有効かどうかを確認
 */
export async function isEmailEnabled(emailType: keyof EmailToggles): Promise<boolean> {
  const toggles = await getEmailToggles();
  return toggles[emailType] === true;
}

/**
 * すべてのメール機能が有効かどうかを確認
 */
export async function areAllEmailsEnabled(): Promise<boolean> {
  const toggles = await getEmailToggles();
  return Object.values(toggles).every(v => v === true);
}

// ============================================================
// Export All
// ============================================================

export const emailSettingsLoader = {
  load: loadEmailSettings,
  getCached: getCachedEmailSettings,
  invalidateCache: invalidateEmailSettingsCache,
  getSmtpConfig,
  getEmailToggles,
  getCompanyInfo,
  getBankInfo,
  getNotificationRecipients,
  getBankInfoText,
  getBankInfoHtml,
  getFooterText,
  isEmailEnabled,
  areAllEmailsEnabled,
};
