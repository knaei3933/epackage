# member/login-dashboard

**시나리오**: member/login-dashboard
**시작 시간**: 2026-01-24T07:41:24.526Z
**종료 시간**: 2026-01-24T07:41:35.737Z
**소요 시간**: 11.2s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 9 |
| 성공 | ✅ 9 |
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
**시간**: 2026-01-24T07:41:24.526Z

**설명**: navigate  {"url":"http://localhost:3002/auth/signin"}

**실제 결과**: Navigated to http://localhost:3002/auth/signin

---

### 단계 1: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:25.163Z

**설명**: type on メールアドレス {"text":"member@test.epac.co.jp"}

**실제 결과**: Typed "member@test.epac.co.jp" on メールアドレス

---

### 단계 2: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:25.752Z

**설명**: type on パスワード {"text":"Member1234!"}

**실제 결과**: Typed "Member1234!" on パスワード

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:26.326Z

**설명**: click on 로그인 상태 유지 체크박스 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:26.839Z

**설명**: click on 로그인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:27.357Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 6: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:30.880Z

**설명**: navigate  {"url":"http://localhost:3002/member/dashboard"}

**실제 결과**: Navigated to http://localhost:3002/member/dashboard

---

### 단계 7: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:31.523Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 8: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:35.038Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\member\login-dashboard_step8.png)

---
