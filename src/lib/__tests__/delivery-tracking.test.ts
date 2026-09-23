/**
 * Member Delivery Tracking Lookup Tests
 *
 * 소유권 3분기(본인/타인/없음) + URL 생성 위임 검증 (Architect 조건 A·C, Critic 체크리스트)
 */

process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// 테이블별 mock 결과 — jest.mock factory에서 참조되므로 hoisted 영역에 선언
var mockTableResults: Record<string, { data: unknown; error: unknown }> = {};

jest.mock('@/lib/supabase', () => ({
  createServiceClient: () => ({
    from: (table: string) => {
      const result = mockTableResults[table] ?? { data: null, error: null };
      const client: Record<string, unknown> = {};
      // 체이닝 메서드는 자기 자신을 반환
      for (const m of ['select', 'eq']) {
        client[m] = jest.fn(() => client);
      }
      client.maybeSingle = jest.fn(() => Promise.resolve(result));
      return client;
    },
  }),
}));

jest.mock('@/lib/ems-tracking', () => ({
  getEMSTrackingURL: jest.fn((n: string) => `https://track.example/ems/${n}`),
  getJapanPostTrackingURL: jest.fn((n: string) => `https://track.example/jp/${n}`),
}));

// NOTE: @swc/jest 변환은 ESM import hoisting을 유지하므로 jest.mock이 먼저 실행되도록
// 테스트 대상 모듈은 require로 로드해야 한다 (import 사용 시 실제 모듈이 로드됨)
const {
  getOrderDeliveryTracking,
  resolveTrackingUrl,
} = require('../delivery-tracking') as typeof import('../delivery-tracking');

const USER_ID = '11111111-1111-1111-1111-111111111111';
const ORDER_UUID = '8b50965e-66cd-4139-97ae-9e853cfd2eb0';

describe('getOrderDeliveryTracking — 소유권 검증 (조건 A)', () => {
  beforeEach(() => {
    mockTableResults = {};
  });

  it('본인 주문 + 추적 레코드 → 추적정보 반환', async () => {
    mockTableResults['orders'] = { data: { id: ORDER_UUID }, error: null };
    mockTableResults['delivery_tracking'] = {
      data: {
        tracking_number: 'EM123456789JP',
        carrier: 'ems',
        shipping_date: '2026-09-01',
        estimated_delivery_date_min: '2026-09-05',
        estimated_delivery_date_max: null,
        actual_delivery_date: null,
      },
      error: null,
    };

    const result = await getOrderDeliveryTracking(ORDER_UUID, USER_ID);

    expect(result).not.toBeNull();
    expect(result!.trackingNumber).toBe('EM123456789JP');
    expect(result!.carrierLabel).toBe('EMS');
    expect(result!.isDelivered).toBe(false);
  });

  it('타인의 주문 → null (조건 A)', async () => {
    // user_id 불일치 → orders 조회 결과 없음
    mockTableResults['orders'] = { data: null, error: null };

    const result = await getOrderDeliveryTracking(ORDER_UUID, USER_ID);
    expect(result).toBeNull();
  });

  it('존재하지 않는 주문 → null', async () => {
    mockTableResults['orders'] = { data: null, error: null };
    const result = await getOrderDeliveryTracking('nonexistent', USER_ID);
    expect(result).toBeNull();
  });

  it('추적 레코드 미생성(출하 전) → null', async () => {
    mockTableResults['orders'] = { data: { id: ORDER_UUID }, error: null };
    mockTableResults['delivery_tracking'] = { data: null, error: null };

    const result = await getOrderDeliveryTracking(ORDER_UUID, USER_ID);
    expect(result).toBeNull();
  });
});

describe('getOrderDeliveryTracking — 필드 화이트리스트 (조건 C)', () => {
  beforeEach(() => {
    mockTableResults = {};
  });

  it('admin_notes 등 내부 필드가 결과에 포함되지 않는다', async () => {
    mockTableResults['orders'] = { data: { id: ORDER_UUID }, error: null };
    mockTableResults['delivery_tracking'] = {
      data: {
        tracking_number: 'EM999',
        carrier: 'ems',
        actual_delivery_date: '2026-09-04',
        // 아래는 select에 없는 필드 — DB가 반환해도 결과 객체에 없어야 함
        admin_notes: 'internal only',
        status: 'delivered',
      },
      error: null,
    };

    const result = (await getOrderDeliveryTracking(ORDER_UUID, USER_ID)) as Record<
      string,
      unknown
    > | null;

    expect(result).not.toBeNull();
    expect(result!['admin_notes']).toBeUndefined();
    expect(result!['status']).toBeUndefined();
  });

  it('actual_delivery_date 있으면 isDelivered true (갭2 해소)', async () => {
    mockTableResults['orders'] = { data: { id: ORDER_UUID }, error: null };
    mockTableResults['delivery_tracking'] = {
      data: {
        tracking_number: 'EM999',
        carrier: 'ems',
        actual_delivery_date: '2026-09-04',
      },
      error: null,
    };

    const result = await getOrderDeliveryTracking(ORDER_UUID, USER_ID);
    expect(result!.isDelivered).toBe(true);
    expect(result!.actualDeliveryDate).toBe('2026-09-04');
  });
});

describe('resolveTrackingUrl — URL 생성 위임', () => {
  it('ems → getEMSTrackingURL 위임', () => {
    expect(resolveTrackingUrl('ems', 'EM123')).toBe('https://track.example/ems/EM123');
  });

  it('surface_mail → getJapanPostTrackingURL 위임', () => {
    expect(resolveTrackingUrl('surface_mail', 'JP999')).toBe('https://track.example/jp/JP999');
  });

  it('해상/항공/기타/미지정 → null (추적 URL 사양 미확정)', () => {
    expect(resolveTrackingUrl('sea_freight', 'X1')).toBeNull();
    expect(resolveTrackingUrl('air_freight', 'X2')).toBeNull();
    expect(resolveTrackingUrl('other', 'X3')).toBeNull();
    expect(resolveTrackingUrl(null, 'X4')).toBeNull();
  });
});
