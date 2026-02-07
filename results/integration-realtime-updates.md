# integration/realtime-updates

**시나리오**: integration/realtime-updates
**시작 시간**: 2026-01-22T15:21:13.023Z
**종료 시간**: 2026-01-22T15:21:56.004Z
**소요 시간**: 43.0s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 14 |
| 성공 | ✅ 14 |
| 실패 | 0 |
| 성공률 | 100.0% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:13.023Z

**설명**: navigate  {"url":"http://localhost:3000/auth/signin"}

**실제 결과**: Navigated to http://localhost:3000/auth/signin

---

### 단계 1: type

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:13.658Z

**설명**: type on メールアドレス {"text":"member@test.com"}

**실제 결과**: Typed "member@test.com" on メールアドレス

---

### 단계 2: type

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:14.248Z

**설명**: type on パスワード {"text":"Test1234!"}

**실제 결과**: Typed "Test1234!" on パスワード

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:14.818Z

**설명**: click on 로그인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:15.334Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 5: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:18.852Z

**설명**: navigate  {"url":"http://localhost:3000/member/dashboard"}

**실제 결과**: Navigated to http://localhost:3000/member/dashboard

---

### 단계 6: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:19.488Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 7: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:22.003Z

**설명**: navigate  {"url":"http://localhost:3000/auth/signin"}

**실제 결과**: Navigated to http://localhost:3000/auth/signin

---

### 단계 8: type

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:22.644Z

**설명**: type on メールアドレス {"text":"admin@example.com"}

**실제 결과**: Typed "admin@example.com" on メールアドレス

---

### 단계 9: type

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:23.235Z

**설명**: type on パスワード {"text":"TestAdmin123!"}

**실제 결과**: Typed "TestAdmin123!" on パスワード

---

### 단계 10: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:23.809Z

**설명**: click on 로그인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 11: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:24.324Z

**설명**: navigate  {"url":"http://localhost:3000/admin/orders"}

**실제 결과**: Navigated to http://localhost:3000/admin/orders

---

### 단계 12: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:24.958Z

**설명**: click on 주문 승인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 13: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:21:25.487Z

**설명**: wait  {"time":30000}

**실제 결과**: Waited 30000ms

---
