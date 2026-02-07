# admin/coupons

**시나리오**: admin/coupons
**시작 시간**: 2026-01-24T07:48:59.552Z
**종료 시간**: 2026-01-24T07:49:23.430Z
**소요 시간**: 23.9s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 24 |
| 성공 | ✅ 18 |
| 실패 | ❌ 6 |
| 성공률 | 75.0% |

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
**시간**: 2026-01-24T07:48:59.552Z

**설명**: navigate  {"url":"http://localhost:3002/admin/coupons"}

**실제 결과**: Navigated to http://localhost:3002/admin/coupons

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:00.958Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:04.464Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\coupons_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:05.152Z

**설명**: click on 활성만 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:05.665Z

**설명**: click on 전체 보기 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:06.180Z

**설명**: click on 새 쿠폰 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:06.696Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 7: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:49:09.210Z

**설명**: type on クーポンコード {"text":"SALE2025"}

**에러**:
```
Element not found: クーポンコード
```

---

### 단계 8: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:09.727Z

**설명**: click on 할인 유형 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 9: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:10.240Z

**설명**: click on 퍼센트age ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 10: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:49:10.755Z

**설명**: type on 割引額 {"text":"15"}

**에러**:
```
Element not found: 割引額
```

---

### 단계 11: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:49:11.271Z

**설명**: type on 最小購入額 {"text":"50000"}

**에러**:
```
Element not found: 最小購入額
```

---

### 단계 12: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:49:11.788Z

**설명**: type on 最大割引 {"text":"10000"}

**에러**:
```
Element not found: 最大割引
```

---

### 단계 13: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:49:12.304Z

**설명**: type on 有効期間開始 {"text":"2026-01-21"}

**에러**:
```
Element not found: 有効期間開始
```

---

### 단계 14: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:49:12.816Z

**설명**: type on 有効期間終了 {"text":"2026-12-31"}

**에러**:
```
Element not found: 有効期間終了
```

---

### 단계 15: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:13.330Z

**설명**: click on 활성화 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 16: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:13.849Z

**설명**: click on 저장 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 17: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:14.365Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 18: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:16.886Z

**설명**: navigate  {"url":"http://localhost:3002/auth/signin"}

**실제 결과**: Navigated to http://localhost:3002/auth/signin

---

### 단계 19: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:17.525Z

**설명**: type on メールアドレス {"text":"member@test.com"}

**실제 결과**: Typed "member@test.com" on メールアドレス

---

### 단계 20: type

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:18.133Z

**설명**: type on パスワード {"text":"Member1234!"}

**실제 결과**: Typed "Member1234!" on パスワード

---

### 단계 21: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:18.708Z

**설명**: click on ログインボタン ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 22: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:19.226Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 23: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:49:22.742Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\coupons_step23.png)

---
