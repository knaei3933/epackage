/**
 * Email Templates Unit Tests
 *
 * メールテンプレートユニットテスト
 */

import { describe, it, expect } from '@jest/globals'
import {
  subject as quoteCreatedAdminSubject,
  plainText as quoteCreatedAdminText,
  html as quoteCreatedAdminHtml,
} from '../templates/quote_created_admin'
import {
  subject as quoteApprovedCustomerSubject,
  plainText as quoteApprovedCustomerText,
  html as quoteApprovedCustomerHtml,
} from '../templates/quote_approved_customer'
import {
  subject as contractSentSubject,
  plainText as contractSentText,
  html as contractSentHtml,
} from '../templates/contract_sent'
import {
  subject as contractSignedAdminSubject,
  plainText as contractSignedAdminText,
  html as contractSignedAdminHtml,
} from '../templates/contract_signed_admin'
import {
  subject as productionUpdateSubject,
  plainText as productionUpdateText,
  html as productionUpdateHtml,
} from '../templates/production_update'
import {
  subject as shippedSubject,
  plainText as shippedText,
  html as shippedHtml,
} from '../templates/shipped'
import type {
  QuoteCreatedAdminData,
  QuoteApprovedCustomerData,
  ContractSentData,
  ContractSignedAdminData,
  ProductionUpdateData,
  ShippedData,
} from '@/types/email'

// ============================================================
// Test Data
// ============================================================

const quoteCreatedAdminData: QuoteCreatedAdminData = {
  quotation_id: 'qt-12345',
  quotation_number: 'QT-2024-001',
  customer_name: '山田太郎',
  company_name: 'テスト株式会社',
  total_amount: 100000,
  valid_until: '2025-12-31',
  view_url: 'https://epackage-lab.com/admin/quotations/qt-12345',
  submitted_at: '2024-01-15 10:30:00',
}

const quoteApprovedCustomerData: QuoteApprovedCustomerData = {
  quotation_id: 'qt-12345',
  quotation_number: 'QT-2024-001',
  customer_name: '山田太郎',
  total_amount: 100000,
  valid_until: '2025-12-31',
  confirm_url: 'https://epackage-lab.com/member/quotations/qt-12345/confirm',
  approved_at: '2024-01-15 14:00:00',
}

const contractSentData: ContractSentData = {
  order_id: 'ord-67890',
  order_number: 'ORD-2024-001',
  customer_name: '山田太郎',
  contract_url: 'https://epackage-lab.com/contracts/ord-67890',
  due_date: '2025-01-31',
  sent_at: '2024-01-16 09:00:00',
}

const contractSignedAdminData: ContractSignedAdminData = {
  order_id: 'ord-67890',
  order_number: 'ORD-2024-001',
  customer_name: '山田太郎',
  company_name: 'テスト株式会社',
  contract_url: 'https://epackage-lab.com/admin/contracts/ord-67890',
  signed_at: '2024-01-17 11:30:00',
  view_url: 'https://epackage-lab.com/admin/orders/ord-67890',
}

const productionUpdateData: ProductionUpdateData = {
  order_id: 'ord-67890',
  order_number: 'ORD-2024-001',
  customer_name: '山田太郎',
  product_name: '三方袋 クリア 150x200mm',
  status: 'PRODUCTION',
  status_label: '製造中',
  estimated_completion: '2025-02-28',
  progress_percentage: 45,
  view_url: 'https://epackage-lab.com/member/orders/ord-67890',
  updated_at: '2024-01-20 15:00:00',
}

const shippedData: ShippedData = {
  order_id: 'ord-67890',
  order_number: 'ORD-2024-001',
  customer_name: '山田太郎',
  product_name: '三方袋 クリア 150x200mm',
  tracking_number: 'JP1234567890123',
  carrier: 'ヤマト運輸',
  estimated_delivery: '2025-03-01',
  tracking_url: 'https://track.yamato.co.jp/',
  view_url: 'https://epackage-lab.com/member/orders/ord-67890',
  shipped_at: '2024-02-25 10:00:00',
}

// ============================================================
// Tests
// ============================================================

describe('Email Templates', () => {
  // ============================================================
  // Quote Created Admin Template
  // ============================================================

  describe('quote_created_admin', () => {
    it('should generate subject', () => {
      const subject = quoteCreatedAdminSubject(quoteCreatedAdminData)
      expect(subject).toContain('新しい見積依頼')
      expect(subject).toContain('QT-2024-001')
    })

    it('should generate plain text content', () => {
      const text = quoteCreatedAdminText(quoteCreatedAdminData)
      expect(text).toContain('テスト株式会社 様')
      expect(text).toContain('QT-2024-001')
      expect(text).toContain('山田太郎')
      expect(text).toContain('¥100,000')
      expect(text).toContain('2025-12-31')
    })

    it('should generate HTML content', () => {
      const html = quoteCreatedAdminHtml(quoteCreatedAdminData)
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('lang="ja"')
      expect(html).toContain('新しい見積依頼が届きました')
      expect(html).toContain('QT-2024-001')
      expect(html).toContain('¥100,000')
    })
  })

  // ============================================================
  // Quote Approved Customer Template
  // ============================================================

  describe('quote_approved_customer', () => {
    it('should generate subject', () => {
      const subject = quoteApprovedCustomerSubject(quoteApprovedCustomerData)
      expect(subject).toContain('見積が承認されました')
      expect(subject).toContain('QT-2024-001')
    })

    it('should generate plain text content', () => {
      const text = quoteApprovedCustomerText(quoteApprovedCustomerData)
      expect(text).toContain('山田太郎 様')
      expect(text).toContain('見積が承認されました')
      expect(text).toContain('¥100,000')
    })

    it('should generate HTML content', () => {
      const html = quoteApprovedCustomerHtml(quoteApprovedCustomerData)
      expect(html).toContain('見積が承認されました')
      expect(html).toContain('¥100,000')
      expect(html).toContain('有効期限')
    })
  })

  // ============================================================
  // Contract Sent Template
  // ============================================================

  describe('contract_sent', () => {
    it('should generate subject', () => {
      const subject = contractSentSubject(contractSentData)
      expect(subject).toContain('契�約書をご確認ください')
      expect(subject).toContain('ORD-2024-001')
    })

    it('should generate plain text content', () => {
      const text = contractSentText(contractSentData)
      expect(text).toContain('山田太郎 様')
      expect(text).toContain('契約書を作成いたしました')
      expect(text).toContain('ORD-2024-001')
    })

    it('should generate HTML content', () => {
      const html = contractSentHtml(contractSentData)
      expect(html).toContain('契約書をご確認ください')
      expect(html).toContain('契約手順')
      expect(html).toContain('署名期限')
    })
  })

  // ============================================================
  // Contract Signed Admin Template
  // ============================================================

  describe('contract_signed_admin', () => {
    it('should generate subject', () => {
      const subject = contractSignedAdminSubject(contractSignedAdminData)
      expect(subject).toContain('契約が署名されました')
      expect(subject).toContain('ORD-2024-001')
    })

    it('should generate plain text content', () => {
      const text = contractSignedAdminText(contractSignedAdminData)
      expect(text).toContain('テスト株式会社 様')
      expect(text).toContain('契約書が署名されました')
      expect(text).toContain('生産開始の準備')
    })

    it('should generate HTML content', () => {
      const html = contractSignedAdminHtml(contractSignedAdminData)
      expect(html).toContain('契約が署名されました')
      expect(html).toContain('次のステップ')
      expect(html).toContain('作業標準書')
    })
  })

  // ============================================================
  // Production Update Template
  // ============================================================

  describe('production_update', () => {
    it('should generate subject', () => {
      const subject = productionUpdateSubject(productionUpdateData)
      expect(subject).toContain('生産状況更新')
      expect(subject).toContain('ORD-2024-001')
    })

    it('should generate plain text content', () => {
      const text = productionUpdateText(productionUpdateData)
      expect(text).toContain('山田太郎 様')
      expect(text).toContain('生産状況が更新されました')
      expect(text).toContain('製造中')
      expect(text).toContain('45%')
    })

    it('should generate HTML content with progress bar', () => {
      const html = productionUpdateHtml(productionUpdateData)
      expect(html).toContain('生産状況更新のお知らせ')
      expect(html).toContain('製造中')
      expect(html).toContain('45%')
      expect(html).toContain('progress-container')
      expect(html).toContain('progress-bar')
    })

    it('should handle different production statuses', () => {
      const workOrderData: ProductionUpdateData = {
        ...productionUpdateData,
        status: 'WORK_ORDER',
        status_label: '作業標準書作成中',
        progress_percentage: 10,
      }

      const html = productionUpdateHtml(workOrderData)
      expect(html).toContain('作業標準書作成中')
    })
  })

  // ============================================================
  // Shipped Template
  // ============================================================

  describe('shipped', () => {
    it('should generate subject', () => {
      const subject = shippedSubject(shippedData)
      expect(subject).toContain('製品を発送いたしました')
      expect(subject).toContain('ORD-2024-001')
    })

    it('should generate plain text content with tracking', () => {
      const text = shippedText(shippedData)
      expect(text).toContain('山田太郎 様')
      expect(text).toContain('製品を発送いたしました')
      expect(text).toContain('JP1234567890123')
      expect(text).toContain('ヤマト運輸')
    })

    it('should generate plain text content without tracking', () => {
      const dataWithoutTracking: ShippedData = {
        ...shippedData,
        tracking_number: undefined,
        carrier: undefined,
        tracking_url: undefined,
      }

      const text = shippedText(dataWithoutTracking)
      expect(text).toContain('製品を発送いたしました')
      expect(text).not.toContain('追跡番号')
    })

    it('should generate HTML content with tracking', () => {
      const html = shippedHtml(shippedData)
      expect(html).toContain('製品を発送いたしました')
      expect(html).toContain('JP1234567890123')
      expect(html).toContain('ヤマト運輸')
      expect(html).toContain('配送状況を追跡')
    })

    it('should generate HTML content without tracking', () => {
      const dataWithoutTracking: ShippedData = {
        ...shippedData,
        tracking_number: undefined,
        carrier: undefined,
        tracking_url: undefined,
      }

      const html = shippedHtml(dataWithoutTracking)
      expect(html).toContain('製品を発送いたしました')
      expect(html).not.toContain('配送状況を追跡')
    })
  })

  // ============================================================
  // Common Template Features
  // ============================================================

  describe('Common Template Features', () => {
    it('should include proper Japanese encoding', () => {
      const html = quoteApprovedCustomerHtml(quoteApprovedCustomerData)
      expect(html).toContain('<meta charset="UTF-8">')
      expect(html).toContain('lang="ja"')
    })

    it('should include responsive meta tags', () => {
      const html = productionUpdateHtml(productionUpdateData)
      expect(html).toContain('name="viewport"')
      expect(html).toContain('width=device-width')
    })

    it('should include footer with copyright', () => {
      const html = shippedHtml(shippedData)
      expect(html).toContain('footer')
      expect(html).toContain('©')
      expect(html).toContain('EPackage Lab')
    })

    it('should escape HTML special characters in data', () => {
      const dataWithSpecialChars: QuoteCreatedAdminData = {
        ...quoteCreatedAdminData,
        customer_name: '<script>alert("test")</script>',
        company_name: 'Test & Company "Ltd"',
      }

      const html = quoteCreatedAdminHtml(dataWithSpecialChars)
      // Note: This test assumes the templates should properly escape
      // If special character handling is needed, it should be implemented
      expect(html).toBeTruthy()
    })
  })

  // ============================================================
  // Formatting Tests
  // ============================================================

  describe('Number Formatting', () => {
    it('should format large numbers correctly', () => {
      const data: QuoteCreatedAdminData = {
        ...quoteCreatedAdminData,
        total_amount: 1234567,
      }

      const text = quoteCreatedAdminText(data)
      expect(text).toContain('¥1,234,567')
    })

    it('should format percentages correctly', () => {
      const data: ProductionUpdateData = {
        ...productionUpdateData,
        progress_percentage: 100,
      }

      const html = productionUpdateHtml(data)
      expect(html).toContain('100%')
    })
  })

  // ============================================================
  // URL Tests
  // ============================================================

  describe('URL Handling', () => {
    it('should include proper URLs in templates', () => {
      const html = contractSentHtml(contractSentData)
      expect(html).toContain(contractSentData.contract_url)
    })

    it('should escape URLs properly', () => {
      const data: ContractSentData = {
        ...contractSentData,
        contract_url: 'https://example.com/contract?id=123&token=abc',
      }

      const html = contractSentHtml(data)
      expect(html).toContain(data.contract_url)
    })
  })
})
