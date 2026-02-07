# 게스트 견적~관리자 승인 플로우

**작성일**: 2026-01-21
**목적**: 게스트 사용자가 견적을 생성하고 관리자가 승인하는 완전한 플로우

---

## 1.1 게스트 견적 생성

**목표**: 게스트 사용자가 견적을 생성하고 PDF 다운로드

**전제 조건**:
- 게스트 사용자 (비로그인 상태)
- 관리자 계정 존재

### 스텝 1: 홈페이지에서 견적 생성

```bash
# 1. 홈페이지 접속
[Browser_navigate] http://localhost:3002

# 2. 견적 시뮬레이터 시작
[Browser_evaluate] window.scrollTo(0, 800)
[Browser_click] element="견적 시작 버튼"]

# 3. 제품 선택: 스탠드 파우치
[Browser_click] element="스탠드 파우치"]

# 4. 사양 입력
[Browser_click] element="PET_AL(알루미늄라미네이트)"]
[Browser_type] element="너비" text="200"]
[Browser_type] element="높이" text="300"]
[Browser_click] element="중간(0.08mm)"]
[Browser_click] element="디지털 인쇄"]
[Browser_click] element="단색 인쇄"]
[Browser_type] element="색수" text="1"]

# 5. 수량/배송
[Browser_click] element="다음"]
[Browser_type] element="수량" text="500"]
[Browser_click] element="후가공 없음"]
[Browser_click] element="일본 국내 배송"]
[Browser_click] element="표준(25-30일)"]

# 6. 견적 확인/저장
[Browser_click] element="견적 확인 버튼"]
[Browser_wait_for] time: 3
[Browser_click] element="PDF 다운로드 버튼"]
[Browser_wait_for] time: 2
[Browser_click] element="견적 저장 버튼"]
```

**데이터베이스 검증**:

```sql
SELECT quotation_number, customer_name, status, total_amount, created_at
FROM quotations
WHERE customer_email = 'guest@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

**성공 기준**:
- ✅ PDF 다운로드됨
- ✅ DB에 견적 저장됨
- ✅ status: 'draft'

---

## 1.2 관리자 확인

**목표**: 관리자가 견적을 확인

### 스텝 2: 관리자 로그인

```bash
# 1. 관리자 로그인
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="admin@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Admin1234!"]
[Browser_click] element="로그인 버튼"]
[Browser_wait_for] time: 2

# 2. 대시보드 통계 확인
[Browser_snapshot]
# 신규 견적 수 증가 확인

# 3. 견적 관리 페이지로 이동
[Browser_navigate] http://localhost:3002/admin/quotations
[Browser_wait_for] time: 2

# 4. 필터: 드래프만
[Browser_click] element="드래프 필터"]

# 5. 견적 클릭
[Browser_click] element="견적 번호 클릭"]
```

**성공 기준**:
- ✅ 대시보드에 신규 견적 표시
- ✅ 견적 목록에 게스트 견적 표시

---

## 1.3 견적 승인

**목표**: 관리자가 견적 승인

### 스텝 3: 견적 승인

```bash
# 1. 견적 상세 확인
[Browser_snapshot]

# 2. "승인" 버튼 클릭
[Browser_click] element="견적 승인 버튼"]

# 3. 코멘트 입력
[Browser_type] element="승인 코멘트" text="견적을 승인했습니다."]

# 4. 확인
[Browser_click] element="확인 버튼"]
[Browser_wait_for] time: 2
```

**데이터베이스 검증**:

```sql
SELECT quotation_number, status, approved_at
FROM quotations
WHERE quotation_number = 'QT-1768962470825';
```

**성공 기준**:
- ✅ 상태가 'approved'로 변경
- ✅ 성공 메시지 표시

---

## 1.4 알림 확인

**목표**: 승인 시 알림 생성 확인

**데이터베이스 검증**:

```sql
SELECT type, title, message, is_read, created_at
FROM unified_notifications
WHERE type = 'quotation_approved'
ORDER BY created_at DESC
LIMIT 1;
```

**성공 기준**:
- ✅ 알림 레코드 생성됨
- ✅ 타입: 'quotation_approved'

---

## 전체 성공 기준

- ✅ 게스트 견적 정상 생성
- ✅ 관리자가 견적 확인 가능
- ✅ 관리자가 견적 승인 가능
- ✅ 상태 정확히 업데이트
- ✅ 알림 생성됨

---

## 다음 단계

- [회원 가입 플로우](./member-registration-flow.md)로 이동
