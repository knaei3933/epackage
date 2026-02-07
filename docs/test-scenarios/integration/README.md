# 통합 E2E 테스트 시나리오

**작성일**: 2026-01-21
**목적**: 고객과 관리자의 기능을 유기적으로 연결하는 종단 간(E2E) 테스트

---

## 시나리오 목록

| 시나리오 | 설명 | 파일 |
|---------|------|------|
| 1. 게스트 견적~관리자 승인 | 게스트 견적 생성부터 관리자 승인까지 | [guest-quotation-flow.md](./guest-quotation-flow.md) |
| 2. 회원 가입~이용 시작 | 회원 가입, 승인, 대시보드 이용 | [member-registration-flow.md](./member-registration-flow.md) |
| 3. 주문~배송 | 견적→주문→생산→배송 완전 흐름 | [order-shipping-flow.md](./order-shipping-flow.md) |
| 4. 알림 연동 | 크로스 시스템 알림 검증 | [notification-flow.md](./notification-flow.md) |
| 5. 실시간 업데이트 | Supabase Realtime 검증 | [realtime-updates.md](./realtime-updates.md) |
| 6. 오류 & 성능 | 에러 핸들링, 성능, 보안 검증 | [error-performance.md](./error-performance.md) |

---

## 공통 전제 조건

- **고객**: 게스트 또는 회원
- **관리자**: admin@test.epac.co.jp / Admin1234!
- **서버**: http://localhost:3002
- **데이터베이스**: Supabase 연결됨

---

## 테스트 완료 기준

### ✅ 기능 요구사항
- 게스트 견적~관리자 승인 완료
- 회원 가입~이용 시작 완료
- 주문~배송 완료
- 알림 정상 작동
- 실시간 업데이트 기능

### ✅ 비기능 요구사항
- 페이지 로드 3초 이내
- API 응답 1초 이내
- 데이터 무결성 유지
- 권한 제어 작동
- 보안 대책 구현

---

## 데이터베이스 검증

```sql
-- 전체 흐름 검증
SELECT
  q.quotation_number,
  q.status as quotation_status,
  o.order_number,
  o.status as order_status,
  s.tracking_number
FROM quotations q
LEFT JOIN orders o ON o.quotation_id = q.id
LEFT JOIN shipments s ON s.order_id = o.id
ORDER BY q.created_at DESC
LIMIT 10;
```

---

## 다음 단계

- 개별 시나리오 파일로 이동하여 테스트 실행
