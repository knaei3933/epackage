# integration/realtime-updates

**시나리오**: integration/realtime-updates
**시작 시간**: 2026-01-24T07:49:55.652Z
**종료 시간**: 2026-01-24T07:50:42.205Z
**소요 시간**: 46.6s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 14 |
| 성공 | ✅ 14 |
| 실패 | 0 |
| 성공률 | 100.0% |

## 데이터베이스 상태 변화

| 테이블 | Before | After | 변화 |
|--------|--------|-------|------|
| quotations | 0 | 0 | 0 |
| orders | 0 | 0 | 0 |
| contracts | 0 | 0 | 0 |
| users | 0 | 0 | 0 |
| notifications | 0 | 0 | 0 |
| samples | 0 | 0 | 0 |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:55.652Z

**설명**: navigate  {"url":"http://localhost:3002/auth/signin"}

**실제 결과**: Navigated to http://localhost:3002/auth/signin

---

### 단계 1: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:56.276Z

**설명**: type on メールアドレス {"text":"member@test.epac.co.jp"}

**실제 결과**: Typed "member@test.epac.co.jp" on メールアドレス

---

### 단계 2: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:56.855Z

**설명**: type on パスワード {"text":"Member1234!"}

**실제 결과**: Typed "Member1234!" on パスワード

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:57.432Z

**설명**: click on 로그인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:57.945Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 5: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:50:01.465Z

**설명**: navigate  {"url":"http://localhost:3002/member/dashboard"}

**실제 결과**: Navigated to http://localhost:3002/member/dashboard

---

### 단계 6: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:50:04.919Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 7: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:50:07.445Z

**설명**: navigate  {"url":"http://localhost:3002/auth/signin"}

**실제 결과**: Navigated to http://localhost:3002/auth/signin

---

### 단계 8: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:50:08.071Z

**설명**: type on メールアドレス {"text":"admin@test.epac.co.jp"}

**실제 결과**: Typed "admin@test.epac.co.jp" on メールアドレス

---

### 단계 9: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:50:08.664Z

**설명**: type on パスワード {"text":"Admin1234!"}

**실제 결과**: Typed "Admin1234!" on パスワード

---

### 단계 10: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:50:09.239Z

**설명**: click on 로그인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 11: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:50:09.757Z

**설명**: navigate  {"url":"http://localhost:3002/admin/orders"}

**실제 결과**: Navigated to http://localhost:3002/admin/orders

---

### 단계 12: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:50:11.149Z

**설명**: click on 주문 승인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 13: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:50:11.678Z

**설명**: wait  {"time":30000}

**실제 결과**: Waited 30000ms

---
