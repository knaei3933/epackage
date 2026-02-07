# 시스템 관리 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 시스템 설정 및 구성 관리

---

## 시스템 설정 페이지

**목표**: 시스템 전체 설정 확인 및 수정

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 시스템 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/settings

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 설정 카테고리 확인
[Browser_snapshot]
```

**설정 카테고리**:

| 카테고리 | 설명 |
|----------|------|
| 일반 | 사이트 이름, 로고, 연락처 |
| 견적 | 기본 유효기간, 최소/최대 수량 |
| 주문 | 기본 배송비, 무료 배송 조건 |
| 배송 | 배송업체, 배송비 설정 |
| 알림 | 이메일, SMS 템플릿 |
| 보안 | 세션 타임아웃, 비밀번호 정책 |

---

## 가격 설정

**목표**: 가격 관련 기본값 설정

### 테스트 단계

```bash
# 1. 価格設定 탭 클릭
[Browser_click] element="価格設定"]

# 1.5. 폼 표시 대기
[Browser_wait_for] time: 1

# 2. 스냅샷 확인 (설정 항목 확인)
[Browser_snapshot]

# 3. 첫 번째 입력 필드에 테스트 값 입력 (setting-pricing-{key} 형식)
# 입력 필드가 있는지 확인
[Browser_evaluate] function="() => document.querySelectorAll('input[type=number]').length"
```

---

## 배송 설정

**목표**: 배송비 및 배송업체 설정

### 테스트 단계

```bash
# 1. 配送 탭 클릭
[Browser_click] element="配送"]

# 1.5. 폼 표시 대기
[Browser_wait_for] time: 1

# 2. 스냅샷 확인
[Browser_snapshot]

# 3. 설정값 확인 (필드가 표시되는지 확인)
[Browser_evaluate] function="() => document.querySelectorAll('input[type=number]').length"
```

---

## 상호 검증: 설정 변경 반영 확인

**목표**: 관리자가 설정 변경 후 회원 페이지에 반영 확인

### 스텝 1: 관리자 설정 확인

```bash
# 관리자 로그인 상태에서 설정 페이지 접속 확인
[Browser_navigate] http://localhost:3002/admin/settings
[Browser_wait_for] time: 2
[Browser_snapshot]
```

**성공 기준**:
- ✅ 관리자 설정 페이지 접근 가능
- ✅ 각 탭 클릭 시 해당 설정 표시됨

---

## 데이터베이스 검증

```sql
-- 시스템 설정 확인
SELECT category, settings
FROM system_settings
ORDER BY category;
```

---

## 다음 단계

- [관리자 알림](./notifications.md)로 이동
