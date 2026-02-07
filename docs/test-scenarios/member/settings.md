# 설정 시나리오

**작성일**: 2026-01-21
**목적**: 회원이 계정 설정 관리

---

## 계정 설정 페이지

**목표**: 회원 계정 설정 확인 및 수정

**전제 조건**:
- 회원으로 로그인된 상태

**테스트 단계**:

```bash
# 1. 설정 페이지 접속
[Browser_navigate] http://localhost:3002/member/settings

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 설정 카테고리 확인
[Browser_snapshot]
```

**설정 카테고리**:

| 카테고리 | 설명 |
|----------|------|
| 알림 | 이메일, 푸시 알림 설정 |
| 개인정보 | 연락처 정보 표시 |
| 보안 | 2단계 인증, 로그인 기록 |
| 결제 | 결제 수단 관리 |

---

## 알림 설정

**목표**: 알림 수신 설정

### 테스트 단계

```bash
# 1. 알림 탭 클릭
[Browser_click] element="알림 탭"]

# 2. 이메일 알림 설정
[Browser_click] element="이메일 알림 ON"]

# 3. 주문 알림 설정
[Browser_click] element="주문 알림 ON"]
[Browser_click] element="배송 알림 ON"]

# 4. 저장
[Browser_click] element="저장 버튼"]
[Browser_wait_for] time: 2
```

---

## 데이터베이스 검증

```sql
-- 설정 확인
SELECT category, settings
FROM user_settings
WHERE user_id = 'member-uuid';
```

---

## 다음 단계

- [알림 센터](./notifications.md)로 이동
