# 주문~배송 플로우

**작성일**: 2026-01-21
**목적**: 견적에서 주문 생성, 관리자 승인, 생산, 배송까지의 완전한 플로우

---

## 3.1 견적에서 주문 생성

**목표**: 회원이 견적에서 주문 생성

**전제 조건**:
- 회원 로그인 상태
- 승인된 견적 존재

### 스텝 1: 주문 생성 (회원)

```bash
# 1. 견적 관리 페이지로 이동
[Browser_navigate] http://localhost:3002/member/quotations
[Browser_wait_for] time: 2

# 2. 승인된 견적 클릭
[Browser_click] element="견적 상세 버튼"]

# 3. "주문으로 변환" 버튼 클릭
[Browser_click] element="주문으로 변환 버튼"]
[Browser_wait_for] time: 2

# 4. 배송지 정보 입력
[Browser_type] element="우편번호" text="100-0001"]
[Browser_type] element="도도부현" text="東京都"]
[Browser_type] element="시구군" text="千代田区"]
[Browser_type] element="번지" text="テスト1-2-3"]
[Browser_type] element="건물명" text="テストビル"]

# 5. 희망 납입일 지정
[Browser_type] element="희망 납입일" text="2026-02-28"]

# 6. 주문 확인/전송
[Browser_click] element="주문 확인 버튼"]
[Browser_wait_for] time: 2
[Browser_click] element="주문 전송 버튼"]
[Browser_wait_for] time: 3
```

**데이터베이스 검증**:

```sql
-- 주문 생성 확인
SELECT order_number, user_id, status, total_amount, requested_delivery_date
FROM orders
WHERE quotation_id = (
  SELECT id FROM quotations WHERE quotation_number = 'QT-...'
)
ORDER BY created_at DESC LIMIT 1;

-- 견적 상태 확인
SELECT status FROM quotations WHERE quotation_number = 'QT-...';
-- 예상: 'CONVERTED'
```

**성공 기준**:
- ✅ 주문 생성됨
- ✅ 주문 번호 부여됨
- ✅ status: 'pending'
- ✅ 견적 status: 'CONVERTED'

---

## 3.2 관리자 주문 승인

**목표**: 관리자가 주문 승인

### 스텝 2: 주문 승인 (관리자)

```bash
# 1. 주문 관리 페이지로 이동
[Browser_navigate] http://localhost:3002/admin/orders
[Browser_wait_for] time: 2

# 2. 필터: 승인 대기
[Browser_click] element="승인 대기 필터"]

# 3. 주문 클릭
[Browser_click] element="주문 상세 버튼"]

# 4. 주문 정보 확인
[Browser_snapshot]

# 5. "승인" 버튼 클릭
[Browser_click] element="주문 승인 버튼"]
[Browser_wait_for] time: 2
```

**데이터베이스 검증**:

```sql
-- 주문 승인 확인
SELECT order_number, status, approved_at
FROM orders
WHERE order_number = 'ORD-...';

-- 생산 작업 생성 확인
SELECT job_number, status, assigned_to
FROM production_jobs
WHERE order_id = (
  SELECT id FROM orders WHERE order_number = 'ORD-...'
);
```

**성공 기준**:
- ✅ 주문 status: 'approved'
- ✅ 생산 작업 생성됨

---

## 3.3 생산 진척 관리

**목표**: 생산 진척률 업데이트

### 스텝 3: 생산 관리 (관리자)

```bash
# 1. 생산 관리 페이지로 이동
[Browser_navigate] http://localhost:3002/admin/production
[Browser_wait_for] time: 2

# 2. 생산 작업 클릭
[Browser_click] element="생산 작업 상세"]

# 3. 담당자 할당
[Browser_click] element="담당자 할당 버튼"]
[Browser_click] element="담당자 선택"]

# 4. 진척 업데이트
[Browser_type] element="進捗率" text="25"]
[Browser_click] element="진척 업데이트 버튼"]
[Browser_wait_for] time: 2
```

**성공 기준**:
- ✅ 담당자 할당됨
- ✅ 진척률 업데이트됨
- ✅ 회원에게 알림 생성됨

---

## 3.4 배송 처리

**목표**: 출하 시 운송장 등록

### 스텝 4: 배송 관리 (관리자)

```bash
# 1. 배송 관리 페이지로 이동
[Browser_navigate] http://localhost:3002/admin/shipments
[Browser_wait_for] time: 2

# 2. 출하 대기 주문 클릭
[Browser_click] element="출하 대기 버튼"]

# 3. 운송장 정보 입력
[Browser_type] element="送り状番号" text="JP-1234567890"]
[Browser_click] element="배송업체"]
[Browser_click] element="佐川急便"]

# 4. 출하 처리
[Browser_click] element="출하 버튼"]
[Browser_wait_for] time: 2
```

**성공 기준**:
- ✅ 운송장 번호 등록됨
- ✅ 주문 status: 'shipped'
- ✅ 회원에게 배송 알림 생성됨

---

## 3.5 회원 주문 추적

**목표**: 회원이 배송 추적

### 스텝 5: 배송 추적 (회원)

```bash
# 1. 주문 상세 페이지로 이동
[Browser_navigate] http://localhost:3002/member/orders
[Browser_wait_for] time: 2

# 2. 주문 클릭
[Browser_click] element="주문 상세 버튼"]

# 3. 배송 추적 클릭
[Browser_click] element="배송 추적 버튼"]
[Browser_snapshot]
```

**성공 기준**:
- ✅ 추적 번호 표시됨
- ✅ 배송 상태 정확함
- ✅ 배송 이력 표시됨

---

## 전체 성공 기준

- ✅ 견적에서 주문 생성 가능
- ✅ 주문 번호 정상 부여
- ✅ 견적 상태 CONVERTED로 변경
- ✅ 관리자가 주문 승인 가능
- ✅ 생산 작업 생성됨
- ✅ 생산 진척 업데이트 가능
- ✅ 배송 처리 가능
- ✅ 회원이 배송 추적 가능

---

## 다음 단계

- [알림 연동](./notification-flow.md)로 이동
