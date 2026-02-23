/**
 * Admin Email Settings API
 *
 * 管理者用メール設定管理API
 * - GET: すべてのメール設定を取得
 * - PUT: 各セクションの設定を更新
 *
 * @route /api/admin/settings/email-config
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { invalidateEmailSettingsCache } from '@/lib/email/email-settings';

// =====================================================
// Types
// =====================================================

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  from_email: string;
  reply_to: string;
  admin_email: string;
}

interface EmailToggles {
  order_confirmation: boolean;
  shipping_notification: boolean;
  quote_approval: boolean;
  production_status: boolean;
  admin_notifications: boolean;
  designer_notifications: boolean;
  data_upload_reminders: boolean;
  approval_reminders: boolean;
}

interface CompanyInfo {
  company_name_ja: string;
  company_name_en: string;
  support_email: string;
  support_phone: string;
  postal_code: string;
  address: string;
}

interface BankInfo {
  bank_name: string;
  branch_name: string;
  account_type: string;
  account_number: string;
  account_holder: string;
}

interface NotificationRecipients {
  admin_emails: string[];
  sales_emails: string[];
  production_emails: string[];
}

interface EmailConfigResponse {
  success: boolean;
  data?: {
    smtp: SmtpConfig;
    toggles: EmailToggles;
    companyInfo: CompanyInfo;
    bankInfo: BankInfo;
    recipients: NotificationRecipients;
  };
  error?: string;
  errorEn?: string;
}

// =====================================================
// Settings Keys Mapping
// =====================================================

const SETTINGS_KEYS = {
  smtp: 'smtp_config',
  toggles: 'email_toggles',
  companyInfo: 'email_company_info',
  bankInfo: 'bank_account_info',
  recipients_admin: 'admin_notification_emails',
  recipients_sales: 'sales_notification_emails',
  recipients_production: 'production_notification_emails',
} as const;

// =====================================================
// Default Values
// =====================================================

function getDefaultSmtpConfig(): SmtpConfig {
  return {
    host: process.env.XSERVER_SMTP_HOST || '',
    port: parseInt(process.env.XSERVER_SMTP_PORT || '587'),
    user: process.env.XSERVER_SMTP_USER || '',
    password: '',
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
    support_email: 'support@epackage-lab.com',
    support_phone: 'XX-XXXX-XXXX',
    postal_code: '000-0000',
    address: '東京都〇〇区〇〇1-2-3',
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

// =====================================================
// Helper: Get authenticated admin
// =====================================================

async function getAuthenticatedAdmin(request: NextRequest) {
  const { client: supabase } = await createSupabaseSSRClient(request);
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser?.id) {
    return null;
  }

  const userId = authUser.id;

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  interface ProfileWithRole { role: string }
  if (!profile || (profile as ProfileWithRole).role !== 'admin') {
    return null;
  }

  return { userId, user: authUser };
}

// =====================================================
// Helper: Validate email format
// =====================================================

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// =====================================================
// GET Handler - Get All Email Settings
// =====================================================

/**
 * GET /api/admin/settings/email-config
 * Get all email settings
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const authResult = await getAuthenticatedAdmin(request);

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { client: supabase } = await createSupabaseSSRClient(request);

    // Fetch all settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchSetting = async (key: string): Promise<any> => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error) return null;
      return data ? (data as { value: any }).value : null;
    };

    const [
      smtpValue,
      togglesValue,
      companyInfoValue,
      bankInfoValue,
      adminEmailsValue,
      salesEmailsValue,
      productionEmailsValue,
    ] = await Promise.all([
      fetchSetting(SETTINGS_KEYS.smtp),
      fetchSetting(SETTINGS_KEYS.toggles),
      fetchSetting(SETTINGS_KEYS.companyInfo),
      fetchSetting(SETTINGS_KEYS.bankInfo),
      fetchSetting(SETTINGS_KEYS.recipients_admin),
      fetchSetting(SETTINGS_KEYS.recipients_sales),
      fetchSetting(SETTINGS_KEYS.recipients_production),
    ]);

    // Build response with fallbacks to defaults
    const response: EmailConfigResponse = {
      success: true,
      data: {
        smtp: { ...getDefaultSmtpConfig(), ...(smtpValue || {}) },
        toggles: { ...getDefaultToggles(), ...(togglesValue || {}) },
        companyInfo: { ...getDefaultCompanyInfo(), ...(companyInfoValue || {}) },
        bankInfo: { ...getDefaultBankInfo(), ...(bankInfoValue || {}) },
        recipients: {
          admin_emails: adminEmailsValue || getDefaultRecipients().admin_emails,
          sales_emails: salesEmailsValue || getDefaultRecipients().sales_emails,
          production_emails: productionEmailsValue || getDefaultRecipients().production_emails,
        },
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Email Config GET] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT Handler - Update Email Settings
// =====================================================

/**
 * PUT /api/admin/settings/email-config
 * Update a specific section of email settings
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const authResult = await getAuthenticatedAdmin(request);

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { client: supabase } = await createSupabaseSSRClient(request);

    // Parse request body
    const body = await request.json();
    const { section, data } = body as {
      section: 'smtp' | 'toggles' | 'companyInfo' | 'bankInfo' | 'recipients';
      data: SmtpConfig | EmailToggles | CompanyInfo | BankInfo | NotificationRecipients;
    };

    // Validate section
    if (!section || !['smtp', 'toggles', 'companyInfo', 'bankInfo', 'recipients'].includes(section)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なセクションが指定されました。',
          errorEn: 'Invalid section specified'
        },
        { status: 400 }
      );
    }

    // Validate data exists
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'データが指定されていません。',
          errorEn: 'No data provided'
        },
        { status: 400 }
      );
    }

    // Section-specific validation
    if (section === 'smtp') {
      const smtpData = data as SmtpConfig;
      if (smtpData.from_email && !validateEmail(smtpData.from_email)) {
        return NextResponse.json(
          { success: false, error: 'From Emailの形式が無効です。', errorEn: 'Invalid From Email format' },
          { status: 400 }
        );
      }
      if (smtpData.reply_to && !validateEmail(smtpData.reply_to)) {
        return NextResponse.json(
          { success: false, error: 'Reply-To Emailの形式が無効です。', errorEn: 'Invalid Reply-To Email format' },
          { status: 400 }
        );
      }
      if (smtpData.admin_email && !validateEmail(smtpData.admin_email)) {
        return NextResponse.json(
          { success: false, error: 'Admin Emailの形式が無効です。', errorEn: 'Invalid Admin Email format' },
          { status: 400 }
        );
      }
    }

    if (section === 'recipients') {
      const recipientsData = data as NotificationRecipients;
      const allEmails = [
        ...(recipientsData.admin_emails || []),
        ...(recipientsData.sales_emails || []),
        ...(recipientsData.production_emails || []),
      ];
      const invalidEmails = allEmails.filter(email => !validateEmail(email));
      if (invalidEmails.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `無効なメールアドレスが含まれています: ${invalidEmails.join(', ')}`,
            errorEn: `Invalid email addresses: ${invalidEmails.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    // Helper function to upsert setting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const upsertSetting = async (key: string, value: any, description: string): Promise<any> => {
      // Use type assertion to avoid Supabase type inference issues
      const table = supabase.from('notification_settings') as any;
      const result = await table.upsert({
        key,
        value,
        description,
        updated_at: new Date().toISOString(),
      });
      return result.error;
    };

    // Update settings based on section
    let errors: string[] = [];

    if (section === 'smtp') {
      const error = await upsertSetting(SETTINGS_KEYS.smtp, data, 'SMTP設定（メールサーバー接続情報）');
      if (error) errors.push(error.message);
    } else if (section === 'toggles') {
      const error = await upsertSetting(SETTINGS_KEYS.toggles, data, 'メール機能トグル設定');
      if (error) errors.push(error.message);
    } else if (section === 'companyInfo') {
      const error = await upsertSetting(SETTINGS_KEYS.companyInfo, data, '会社情報（メール署名用）');
      if (error) errors.push(error.message);
    } else if (section === 'bankInfo') {
      const error = await upsertSetting(SETTINGS_KEYS.bankInfo, data, '銀行口座情報（請求書用）');
      if (error) errors.push(error.message);
    } else if (section === 'recipients') {
      const recipientsData = data as NotificationRecipients;
      const [adminErr, salesErr, prodErr] = await Promise.all([
        upsertSetting(SETTINGS_KEYS.recipients_admin, recipientsData.admin_emails || [], '管理者通知メールアドレス'),
        upsertSetting(SETTINGS_KEYS.recipients_sales, recipientsData.sales_emails || [], '営業チーム通知メールアドレス'),
        upsertSetting(SETTINGS_KEYS.recipients_production, recipientsData.production_emails || [], '生産チーム通知メールアドレス'),
      ]);
      if (adminErr) errors.push(adminErr.message);
      if (salesErr) errors.push(salesErr.message);
      if (prodErr) errors.push(prodErr.message);
    }

    // Check for errors
    if (errors.length > 0) {
      console.error('[Email Config PUT] Database errors:', errors);
      return NextResponse.json(
        { success: false, error: '設定の更新に失敗しました。', errorEn: 'Failed to update settings', details: errors.join(', ') },
        { status: 500 }
      );
    }

    // Invalidate cache
    invalidateEmailSettingsCache();

    // Also call the cache invalidation endpoint
    try {
      await fetch(new URL('/api/admin/settings/cache/invalidate', request.url), {
        method: 'POST',
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      });
    } catch (cacheError) {
      console.warn('[Email Config PUT] Cache invalidation request failed:', cacheError);
    }

    return NextResponse.json({
      success: true,
      message: '設定を更新しました。',
      messageEn: 'Settings updated successfully',
    }, { status: 200 });

  } catch (error) {
    console.error('[Email Config PUT] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
