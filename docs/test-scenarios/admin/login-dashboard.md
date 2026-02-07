# 관리자 로그인 & 대시보드 시나리오

**작성일**: 2026-01-21
**목적**: 관리자 로그인 및 대시보드 통계 확인

---

## 1.1 관리자 로그인

**목표**: 관리자 계정으로 로그인하여 대시보드 접근

**전제 조건**:
- 관리자 계정 (role: 'ADMIN', status: 'ACTIVE')
- 테스트용 관리자: admin@test.epac.co.jp / Admin1234!

**테스트 단계**:

```bash
# 1. 로그인 페이지 접속
[Browser_navigate] http://localhost:3002/auth/signin

# 2. 관리자 이메일 입력
[Browser_type] element="メールアドレス" text="admin@test.epac.co.jp"

# 3. 비밀번호 입력
[Browser_type] element="パスワード" text="Admin1234!"

# 4. 로그인 버튼 클릭
[Browser_click] element="로그인 버튼"]

# 5. 리다이렉트 확인
[Browser_wait_for] time: 3
```

**API 확인**:

```bash
# POST /api/auth/signin
{
  "email": "admin@test.epac.co.jp",
  "password": "Admin1234!"
}

# 예상 응답:
{
  "success": true,
  "user": {
    "id": "admin-uuid",
    "email": "admin@test.epac.co.jp",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

**데이터베이스 검증**:

```sql
-- 관리자 계정 확인
SELECT id, email, role, status
FROM profiles
WHERE email = 'admin@test.epac.co.jp' AND role = 'ADMIN' AND status = 'ACTIVE';
```

**예상 결과**:
- 로그인 성공
- URL이 /admin/dashboard로 변경됨
- 관리자 네비게이션 메뉴 표시

**성공 기준**:
- ✅ 관리자 로그인이 성공적으로 완료됨
- ✅ 대시보드 페이지로 정확히 이동함
- ✅ 관리자 전용 메뉴가 표시됨

---

## 2.1 대시보드 통계 확인

**목표**: 관리자 대시보드에서 전체 시스템 통계 확인

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 관리자 대시보드 접속
[Browser_navigate] http://localhost:3002/admin/dashboard

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 스냅샷 확인
[Browser_snapshot]

# 4. 통계 카드 확인
# - 총 주문 수
# - 대기 주문 수
# - 총 매출
# - 활성 사용자 수
# - 미승인 회원 수
```

**API 확인**:

```bash
# GET /api/admin/dashboard/unified-stats?period=30
# 예상 응답:
{
  "totalOrders": 156,
  "pendingOrders": 12,
  "totalRevenue": 12500000,
  "activeUsers": 45,
  "pendingApprovals": 3
}
```

**예상 결과**:
- 통계 카드 5개가 표시됨
- 각 카드에 정확한 숫자가 표시됨
- 실시간 데이터가 표시됨

**성공 기준**:
- ✅ 대시보드가 정상적으로 표시됨
- ✅ 통계 데이터가 로딩됨
- ✅ 자동 새로고침(30초)이 작동함

---

## 대시보드 구성 요소

### 통계 카드

| 카드 | 설명 | API |
|------|------|-----|
| 총 주문 수 | 기간 내 총 주문 수 | `/api/admin/orders?period=30` |
| 대기 주문 수 | 승인 대기 중인 주문 | `/api/admin/orders?status=pending` |
| 총 매출 | 기간 내 총 매출액 | `/api/admin/dashboard/revenue?period=30` |
| 활성 사용자 | 활성 상태 회원 수 | `/api/admin/users?status=ACTIVE` |
| 미승인 회원 | 승인 대기 중인 회원 | `/api/admin/users?status=PENDING` |

### 최근 활동

- 최근 주문 (10건)
- 최근 견적 (10건)
- 미승인 회원 (전체)
- 생산 대기 작업 (10건)

---

## 오류 처리

**문제**: 로그인 실패
**해결**:
1. 관리자 계정 존재 확인
2. 비밀번호 정확성 확인
3. 계정 상태(ACTIVE) 확인

**문제**: 대시보드 로딩 실패
**해결**:
1. API 응답 확인
2. 관리자 권한 확인
3. 네트워크 연결 확인

---

## 다음 단계

이 시나리오 완료 후:
- [견적 승인](./quotation-approval.md)으로 이동
- [회원 관리](./member-management.md)으로 이동
