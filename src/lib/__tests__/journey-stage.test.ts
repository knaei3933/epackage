/**
 * Journey Stage Mapping Tests (A2)
 *
 * ORDER_STATUS_LABELS의 전체 키를 열거하여
 * 모든 OrderStatus가 유효한 여정 단계로 매핑되는지 검증.
 */

import {
  getOrderJourneyStage,
  getQuotationJourneyStage,
  JOURNEY_STAGES,
  type JourneyStageKey,
  type JourneyStageState,
} from '../journey-stage';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types/order-status';

const VALID_STATES: JourneyStageState[] = ['done', 'current', 'upcoming'];
const STAGE_KEYS: JourneyStageKey[] = JOURNEY_STAGES.map((s) => s.key);

describe('JOURNEY_STAGES definition', () => {
  it('정확히 6단계를 순서대로 가진다', () => {
    expect(STAGE_KEYS).toEqual([
      'quotation',
      'order',
      'data_upload',
      'correction',
      'approval',
      'production',
    ]);
  });

  it('모든 단계에 일본어 라벨이 있다', () => {
    for (const stage of JOURNEY_STAGES) {
      expect(stage.label.length).toBeGreaterThan(0);
    }
  });
});

describe('getOrderJourneyStage — 전체 OrderStatus 열거 검증 (A2)', () => {
  // A2: ORDER_STATUS_LABELS의 모든 키가 매핑 테이블에 존재하고
  // 유효한 결과를 반환하는지 열거 검증
  const allStatuses = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

  it('모든 OrderStatus가 안전하게 매핑된다', () => {
    expect(allStatuses.length).toBeGreaterThan(0);

    for (const status of allStatuses) {
      const result = getOrderJourneyStage(status);

      // 결과 구조 무결성: 5단계 모두 유효한 상태값
      for (const key of STAGE_KEYS) {
        expect(VALID_STATES).toContain(result.stageStates[key]);
      }

      // 현재 단계는 유효 키이거나 완료/취소 시 null
      if (result.currentStage !== null) {
        expect(STAGE_KEYS).toContain(result.currentStage);
        expect(result.stageStates[result.currentStage]).toBe('current');
        expect(result.isComplete).toBe(false);
        expect(result.isCancelled).toBe(false);
      }

      // 'current'는 정확히 하나만 존재 (완료/취소 제외)
      if (result.currentStage !== null) {
        const currentCount = STAGE_KEYS.filter(
          (k) => result.stageStates[k] === 'current'
        ).length;
        expect(currentCount).toBe(1);
      }
    }
  });

  it('취소 상태는 isCancelled 플래그를 반환한다', () => {
    const result = getOrderJourneyStage('CANCELLED');
    expect(result.isCancelled).toBe(true);
    expect(result.currentStage).toBeNull();
    expect(result.isComplete).toBe(false);
  });

  it('승인 후 제조 단계가 현재 위치로 표시된다', () => {
    for (const status of ['PRODUCTION', 'WORK_ORDER'] as OrderStatus[]) {
      const result = getOrderJourneyStage(status);
      expect(result.currentStage).toBe('production');
      expect(result.isComplete).toBe(false);
      // 승인까지는 완료, 제조만 현재
      expect(result.stageStates.approval).toBe('done');
      expect(result.stageStates.production).toBe('current');
    }
  });

  it('출하 이후 상태는 여정 완료로 처리한다 (추적 카드로 안내)', () => {
    for (const status of ['READY_TO_SHIP', 'SHIPPED', 'DELIVERED'] as OrderStatus[]) {
      const result = getOrderJourneyStage(status);
      expect(result.isComplete).toBe(true);
      expect(result.currentStage).toBeNull();
      for (const key of STAGE_KEYS) {
        expect(result.stageStates[key]).toBe('done');
      }
    }
  });

  it('각 대표 상태가 기대 단계를 가리킨다', () => {
    expect(getOrderJourneyStage('QUOTATION_PENDING').currentStage).toBe('quotation');
    expect(getOrderJourneyStage('QUOTATION_APPROVED').currentStage).toBe('order');
    expect(getOrderJourneyStage('DATA_UPLOAD_PENDING').currentStage).toBe('data_upload');
    expect(getOrderJourneyStage('DATA_UPLOADED').currentStage).toBe('correction');
    expect(getOrderJourneyStage('CORRECTION_IN_PROGRESS').currentStage).toBe('correction');
    expect(getOrderJourneyStage('CUSTOMER_APPROVAL_PENDING').currentStage).toBe('approval');
    // 수정 요청 루프는 주문 단계에서 대기
    expect(getOrderJourneyStage('MODIFICATION_REQUESTED').currentStage).toBe('order');
    expect(getOrderJourneyStage('MODIFICATION_APPROVED').currentStage).toBe('correction');
  });

  it('교정 완료는 승인 대기 단계를 가리킨다', () => {
    expect(getOrderJourneyStage('CORRECTION_COMPLETED').currentStage).toBe('approval');
  });
});

describe('getOrderJourneyStage — 알 수 없는 상태 폴백', () => {
  it('레거시 소문자/미지 상태도 안전하게 폴백한다', () => {
    const result = getOrderJourneyStage('unknown_status' as string);
    expect(result.currentStage).toBe('order');
    expect(result.isCancelled).toBe(false);
    expect(result.isComplete).toBe(false);
  });
});

describe('getQuotationJourneyStage', () => {
  it('DRAFT/SENT는 견적 단계', () => {
    expect(getQuotationJourneyStage('DRAFT').currentStage).toBe('quotation');
    expect(getQuotationJourneyStage('sent').currentStage).toBe('quotation');
  });

  it('APPROVED/CONVERTED는 주문 단계', () => {
    expect(getQuotationJourneyStage('APPROVED').currentStage).toBe('order');
    expect(getQuotationJourneyStage('CONVERTED').currentStage).toBe('order');
  });

  it('REJECTED/EXPIRED/CANCELLED는 취소 처리', () => {
    for (const s of ['REJECTED', 'EXPIRED', 'CANCELLED']) {
      const result = getQuotationJourneyStage(s);
      expect(result.isCancelled).toBe(true);
      expect(result.currentStage).toBeNull();
    }
  });

  it('단계 순서 무결성: current 이전은 done, 이후는 upcoming', () => {
    const result = getQuotationJourneyStage('APPROVED');
    expect(result.stageStates.quotation).toBe('done');
    expect(result.stageStates.order).toBe('current');
    expect(result.stageStates.data_upload).toBe('upcoming');
    expect(result.stageStates.correction).toBe('upcoming');
    expect(result.stageStates.approval).toBe('upcoming');
  });
});
