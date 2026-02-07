# admin/customers

**시나리오**: admin/customers
**시작 시간**: 2026-01-24T07:46:24.004Z
**종료 시간**: 2026-01-24T07:46:48.286Z
**소요 시간**: 24.3s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 22 |
| 성공 | ✅ 18 |
| 실패 | ❌ 4 |
| 성공률 | 81.8% |

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
**시간**: 2026-01-24T07:46:24.004Z

**설명**: navigate  {"url":"http://localhost:3002/admin/customers"}

**실제 결과**: Navigated to http://localhost:3002/admin/customers

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:25.499Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:29.003Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\customers_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:29.673Z

**설명**: click on 활성 회원만 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:30.189Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:31.704Z

**설명**: click on 전체 보기 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:32.217Z

**설명**: click on 고객 상세 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:32.729Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 8: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:34.244Z

**설명**: click on 편집 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 9: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:34.765Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 10: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:46:36.266Z

**설명**: type on 会社電話番号 {"text":"03-9999-8888"}

**에러**:
```
Element not found: 会社電話番号
```

---

### 단계 11: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:46:36.781Z

**설명**: type on 携帯電話 {"text":"090-1234-5678"}

**에러**:
```
Element not found: 携帯電話
```

---

### 단계 12: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:37.295Z

**설명**: click on 저장 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 13: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:37.811Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 14: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:40.334Z

**설명**: navigate  {"url":"http://localhost:3002/auth/signin"}

**실제 결과**: Navigated to http://localhost:3002/auth/signin

---

### 단계 15: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:40.975Z

**설명**: type on メールアドレス {"text":"member@test.epac.co.jp"}

**실제 결과**: Typed "member@test.epac.co.jp" on メールアドレス

---

### 단계 16: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:41.565Z

**설명**: type on パスワード {"text":"Member1234!"}

**실제 결과**: Typed "Member1234!" on パスワード

---

### 단계 17: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:42.128Z

**설명**: click on 로그인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 18: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:42.641Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 19: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:46.155Z

**설명**: navigate  {"url":"http://localhost:3002/member/profile"}

**실제 결과**: Navigated to http://localhost:3002/member/profile

---

### 단계 20: verify_text_visible

**상태**: ❌ Failed
**시간**: 2026-01-24T07:46:47.197Z

**설명**: verify_text_visible  {"text":"수정된 회사명"}

**실제 결과**: Text "수정된 회사명" not found

---

### 단계 21: verify_text_visible

**상태**: ❌ Failed
**시간**: 2026-01-24T07:46:47.711Z

**설명**: verify_text_visible  {"text":"수정 담당자"}

**실제 결과**: Text "수정 담당자" not found

---
