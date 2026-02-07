# 회원 로그인 & 대시보드 시나리오

**작성일**: 2026-01-21
**목적**: 회원 로그인 및 대시보드 통계 확인

---

## 1.1 회원 로그인

**목표**: 회원으로 로그인하여 대시보드 접근

**전제 조건**:
- 활성화된 회원 계정 필요
- 이메일 인증 완료 상태 (status: 'ACTIVE')

**테스트 단계**:

```bash
# 1. 로그인 페이지 접속
[Browser_navigate] http://localhost:3002/auth/signin

# 2. 이메일 입력
[Browser_type] element="メールアドレス" text="member@test.epac.co.jp"

# 3. 비밀번호 입력
[Browser_type] element="パスワード" text="Member1234!"

# 4. 로그인 상태 유지 체크
[Browser_click] element="로그인 상태 유지 체크박스"]

# 5. 로그인 버튼 클릭
[Browser_click] element="로그인 버튼"]

# 6. 대시보드 리다이렉트 확인
[Browser_wait_for] time: 3
```

**API 확인**:

```bash
# POST /api/auth/signin
{
  "email": "member@test.epac.co.jp",
  "password": "Member1234!"
}

# 예상 응답:
{
  "success": true,
  "user": {
    "id": "member-uuid",
    "email": "member@test.epac.co.jp",
    "role": "MEMBER",
    "status": "ACTIVE"
  }
}
```

**데이터베이스 검증**:

```sql
-- 테스트용 회원 계정 확인
SELECT id, email, role, status
FROM profiles
WHERE email = 'member@test.epac.co.jp' AND status = 'ACTIVE';
```

**예상 결과**:
- 로그인 성공
- URL이 /member/dashboard로 변경됨

**성공 기준**:
- ✅ 로그인이 성공적으로 완료됨
- ✅ 대시보드 페이지로 정확히 이동함

---

## 2.1 대시보드 접속 및 통계 확인

**목표**: 회원 대시보드에서 통계 확인

**전제 조건**:
- 로그인된 상태

**테스트 단계**:

```bash
# 1. 대시보드 접속 (이미 로그인된 상태)
[Browser_navigate] http://localhost:3002/member/dashboard

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 스냅샷 확인
[Browser_snapshot]

# 4. 통계 카드 확인
# - 진행 중인 주문 수
# - 견적 수
# - 샘플 요청 수
# - 미읽은 알림 수
```

**API 확인**:

```bash
# GET /api/member/dashboard/stats
# 예상 응답:
{
  "activeOrders": 2,
  "pendingQuotations": 1,
  "totalSamples": 3,
  "unreadNotifications": 5
}
```

**예상 결과**:
- 통계 카드 4개가 표시됨
- 각 카드에 숫자가 표시됨

**성공 기준**:
- ✅ 대시보드가 정상적으로 표시됨
- ✅ 통계 데이터가 로딩됨
- ✅ 자동 새로고침(30초)이 작동함

---

## 대시보드 구성 요소

### 통계 카드

| 카드 | 설명 | API |
|------|------|-----|
| 진행 중인 주문 | 현재 진행 중인 주문 수 | `/api/member/orders?status=active` |
| 견적 수 | 전체/대기 중 견적 수 | `/api/member/quotations` |
| 샘플 요청 | 총 샘플 요청 수 | `/api/member/samples` |
| 미읽은 알림 | 읽지 않은 알림 수 | `/api/member/notifications?unreadOnly=true` |

### 최근 활동

- 최근 주문 목록 (5건)
- 최근 견적 목록 (5건)
- 최근 알림 (5건)

---

## 오류 처리

**문제**: 로그인 실패
**해결**:
1. 이메일/비밀번호 확인
2. 계정 상태 확인 (ACTIVE 여부)
3. 이메일 인증 완료 여부 확인

**문제**: 대시보드 로딩 실패
**해결**:
1. API 응답 확인
2. 통계 데이터 존재 여부 확인
3. 네트워크 연결 상태 확인

---

## 다음 단계

이 시나리오 완료 후:
- [주문 관리](./order-management.md)로 이동
- [견적 관리](./quotation-management.md)로 이동
