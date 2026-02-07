# admin/login-dashboard

**시나리오**: admin/login-dashboard
**시작 시간**: 2026-01-23T04:12:50.261Z
**종료 시간**: 2026-01-24T09:56:34.528Z
**소요 시간**: 1783m 44.3s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 8 |
| 성공 | ✅ 5 |
| 실패 | ❌ 3 |
| 성공률 | 62.5% |

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

**상태**: ❌ Failed
**시간**: 2026-01-23T04:12:50.261Z

**설명**: navigate  {"url":"http://localhost:3000/auth/signin"}

**에러**:
```
page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "http://localhost:3000/auth/signin", waiting until "domcontentloaded"[22m

```

---

### 단계 1: type

**상태**: ❌ Failed
**시간**: 2026-01-23T04:13:50.844Z

**설명**: type on メールアドレス {"text":"admin@example.com"}

**에러**:
```
Element not found: メールアドレス
```

---

### 단계 2: type

**상태**: ❌ Failed
**시간**: 2026-01-24T09:56:24.266Z

**설명**: type on パスワード {"text":"TestAdmin123!"}

**에러**:
```
Element not found: パスワード
```

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T09:56:24.777Z

**설명**: click on 로그인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T09:56:25.294Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 5: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T09:56:28.803Z

**설명**: navigate  {"url":"http://localhost:3000/admin/dashboard"}

**실제 결과**: Navigated to http://localhost:3000/admin/dashboard

---

### 단계 6: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T09:56:30.303Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 7: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T09:56:33.811Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\login-dashboard_step7.png)

---
