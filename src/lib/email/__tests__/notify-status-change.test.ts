/**
 * notifyStatusChange 매핑 스모크 테스트 (STEP4·G004)
 * - 실제 발송 없이 콘솔 모드에서 매핑·데이터 구조 검증
 * - epack-mailer는 transportType이 console이면 성공 반환 (콘솔 출력)
 */

// 콘솔 모드 강제: transporter 미초기화 시나리오를 위해 env 제거 후 모듈 로드
process.env.XSERVER_SMTP_HOST = ''
process.env.XSERVER_SMTP_USER = ''
process.env.XSERVER_SMTP_PASSWORD = ''
process.env.SUPABASE_SMTP_HOST = ''
process.env.SUPABASE_SMTP_USER = ''
process.env.SUPABASE_SMTP_PASSWORD = ''
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.package-lab.com'

// Supabase mock: createServiceClient만 사용 (delivery_tracking 조회)
jest.mock('@/lib/supabase', () => ({
  createServiceClient: () => ({
    from: (table: string) => {
      const result = { data: null, error: null }
      const client: Record<string, unknown> = {}
      client.select = jest.fn(() => client)
      client.eq = jest.fn(() => client)
      client.maybeSingle = jest.fn(() => Promise.resolve(result))
      return client
    },
  }),
}))

const { notifyStatusChange } = require('../order-status-emails') as typeof import('../order-status-emails')

const config = {
  orderId: '00000000-0000-0000-0000-000000000001',
  orderNumber: 'ORD-E2E',
  customerEmail: 'customer@example.com',
  customerName: 'テスト太郎',
  productName: 'テスト製品',
}

describe('notifyStatusChange 매핑 검증', () => {
  it('PRODUCTION → productionStarted 발송 (sent: true)', async () => {
    const r = await notifyStatusChange(config, 'PRODUCTION')
    expect(r.sent).toBe(true)
    expect(r.templateId).toBe('productionStarted')
  })

  it('SHIPPED → shipped 발송 (운송장 조회 실패 시에도 발송)', async () => {
    const r = await notifyStatusChange(config, 'SHIPPED')
    expect(r.sent).toBe(true)
    expect(r.templateId).toBe('shipped')
  })

  it('DELIVERED → delivered 발송', async () => {
    const r = await notifyStatusChange(config, 'DELIVERED')
    expect(r.sent).toBe(true)
    expect(r.templateId).toBe('deliveredEmail')
  })

  it('전이 불가 상태(CANCELLED 등)는 의도적으로 생략', async () => {
    const r = await notifyStatusChange(config, 'CANCELLED')
    expect(r.sent).toBe(false)
  })

  it('view_url 미전달 시 env 폴백 (A6)', async () => {
    // 콘솔 모드라 직접 확인은 불가하나 예외 없이 완료되는지 확인
    const r = await notifyStatusChange({ ...config, viewUrl: '' }, 'DATA_UPLOADED')
    expect(r.sent).toBe(true)
  })
})
