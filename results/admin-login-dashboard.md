# admin/login-dashboard

**시나리오**: admin/login-dashboard
**시작 시간**: 2026-01-22T15:17:37.182Z
**종료 시간**: 2026-01-22T15:17:47.863Z
**소요 시간**: 10.7s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 8 |
| 성공 | ✅ 8 |
| 실패 | 0 |
| 성공률 | 100.0% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:17:37.182Z

**설명**: navigate  {"url":"http://localhost:3000/auth/signin"}

**실제 결과**: Navigated to http://localhost:3000/auth/signin

---

### 단계 1: type

**상태**: ✅ Passed
**시간**: 2026-01-22T15:17:37.818Z

**설명**: type on メールアドレス {"text":"admin@example.com"}

**실제 결과**: Typed "admin@example.com" on メールアドレス

---

### 단계 2: type

**상태**: ✅ Passed
**시간**: 2026-01-22T15:17:38.399Z

**설명**: type on パスワード {"text":"TestAdmin123!"}

**실제 결과**: Typed "TestAdmin123!" on パスワード

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:17:38.965Z

**설명**: click on 로그인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:17:39.480Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 5: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:17:43.003Z

**설명**: navigate  {"url":"http://localhost:3000/admin/dashboard"}

**실제 결과**: Navigated to http://localhost:3000/admin/dashboard

---

### 단계 6: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:17:43.640Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 7: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:17:47.162Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\admin\login-dashboard_step7.png)

---
