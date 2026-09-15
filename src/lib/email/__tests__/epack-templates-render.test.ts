/**
 * Email Template Render Tests (STEP8 검증)
 *
 * 1. flex 부재 (Outlook 대응)
 * 2. 컨테이너 인라인 max-width (Gmail 대응)
 * 3. JST 날짜 포맷
 * 4. undefined 노출 부재
 * 5. DELIVERED 템플릿 존재·렌더
 * 6. 자동진행 문구 제거 확인
 * 7. plainText+html 쌍 존재
 */

import { epackEmailTemplates, deliveredEmail, workOrderStartedEmail, shippedEmail, approvalRequestEmail } from '../epack-templates'

const baseData = {
  order_id: 'test-order-id',
  order_number: 'ORD-E2E-TEST',
  quotation_number: 'Q-E2E-TEST',
  customer_email: 'customer@example.com',
  customer_name: 'テスト太郎',
  product_name: 'テスト製品',
  total_amount: 100000,
  valid_until: '2026-12-31',
  estimated_delivery: '2026-10-01',
  view_url: 'https://www.package-lab.com/member/orders/test',
  tracking_number: 'EM999999999JP',
  tracking_url: 'https://track.example/EM999999999JP',
  carrier: 'EMS',
  delivered_at: '2026-09-08T03:00:00Z',
}

describe('이메일 템플릿 렌더 검증 (STEP8)', () => {
  it('[1] 렌더된 HTML에 display:flex가 없다 (Outlook 대응)', () => {
    for (const [name, tpl] of Object.entries(epackEmailTemplates)) {
      const data = { ...baseData }
      const html = tpl.html(data as any)
      expect(html.includes('display: flex')).toBe(false)
      expect(html.includes('display:flex')).toBe(false)
    }
  })

  it('[2] 컨테이너에 인라인 max-width:600px가 있다 (Gmail 대응)', () => {
    const html = shippedEmail.html(baseData as any)
    expect(html).toMatch(/max-width:\s*600px/)
  })

  it('[3] 발송일이 JST 포맷으로 표시된다', () => {
    const text = shippedEmail.plainText(baseData as any)
    expect(text).toContain('(JST)')
    const html = shippedEmail.html(baseData as any)
    expect(html).toContain('(JST)')
  })

  it('[4] 옵션 필드가 누락되어도 undefined가 노출되지 않는다', () => {
    const noOptionals = {
      ...baseData,
      estimated_delivery: undefined,
      product_name: undefined,
      tracking_number: undefined,
      tracking_url: undefined,
      delivered_at: undefined,
    }
    const shipped = shippedEmail.plainText(noOptionals as any)
    expect(shipped.includes('undefined')).toBe(false)
    const delivered = deliveredEmail.plainText(noOptionals as any)
    expect(delivered.includes('undefined')).toBe(false)
    const deliveredHtml = deliveredEmail.html(noOptionals as any)
    expect(deliveredHtml.includes('undefined')).toBe(false)
  })

  it('[5] deliveredEmail 템플릿이 렌더된다 (납품완료 신규)', () => {
    expect(deliveredEmail.subject(baseData as any)).toContain('配達完了')
    expect(deliveredEmail.plainText(baseData as any)).toContain('配達が完了いたしました')
    expect(deliveredEmail.html(baseData as any)).toContain('配達情報')
  })

  it('[5b] workOrderStartedEmail 템플릿이 렌더된다 (WORK_ORDER 신규)', () => {
    expect(workOrderStartedEmail.subject(baseData as any)).toContain('作業指示書')
    expect(workOrderStartedEmail.html(baseData as any)).toContain('作業指示書発行済')
  })

  it('[6] 승인 요청 메일에서 자동 제조 진행 고지가 제거되었다', () => {
    const text = approvalRequestEmail.plainText(baseData as any)
    expect(text.includes('了解とみなして')).toBe(false)
    const html = approvalRequestEmail.html(baseData as any)
    expect(html.includes('了解とみなして')).toBe(false)
  })

  it('[7] 모든 템플릿에 plainText+html 쌍이 존재한다', () => {
    for (const [name, tpl] of Object.entries(epackEmailTemplates)) {
      expect(typeof tpl.subject).toBe('function')
      expect(typeof tpl.plainText).toBe('function')
      expect(typeof tpl.html).toBe('function')
    }
  })
})
