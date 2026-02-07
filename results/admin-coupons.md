# admin/coupons

**시나리오**: admin/coupons
**시작 시간**: 2026-01-22T15:19:58.513Z
**종료 시간**: 2026-01-22T15:20:28.263Z
**소요 시간**: 29.8s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 33 |
| 성공 | ✅ 23 |
| 실패 | ❌ 10 |
| 성공률 | 69.7% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:58.513Z

**설명**: navigate  {"url":"http://localhost:3000/admin/coupons"}

**실제 결과**: Navigated to http://localhost:3000/admin/coupons

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:59.179Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:02.710Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\admin\coupons_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:03.421Z

**설명**: click on 활성만 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:03.934Z

**설명**: click on 전체 보기 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:04.446Z

**설명**: click on 새 쿠폰 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:20:04.962Z

**설명**: type on クーポンコード {"text":"SALE2025"}

**에러**:
```
Element not found: クーポンコード
```

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:05.475Z

**설명**: click on 할인 유형 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:05.987Z

**설명**: click on 퍼센트age ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 9: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:20:06.502Z

**설명**: type on 割引額 {"text":"15"}

**에러**:
```
Element not found: 割引額
```

---

### 단계 10: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:20:07.016Z

**설명**: type on 最小購入額 {"text":"50000"}

**에러**:
```
Element not found: 最小購入額
```

---

### 단계 11: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:20:07.530Z

**설명**: type on 最大割引 {"text":"10000"}

**에러**:
```
Element not found: 最大割引
```

---

### 단계 12: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:20:08.041Z

**설명**: type on 有効期間開始 {"text":"2026-01-21"}

**에러**:
```
Element not found: 有効期間開始
```

---

### 단계 13: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:20:08.553Z

**설명**: type on 有効期間終了 {"text":"2026-12-31"}

**에러**:
```
Element not found: 有効期間終了
```

---

### 단계 14: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:09.068Z

**설명**: click on 활성화 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 15: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:09.583Z

**설명**: click on 저장 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 16: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:10.097Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 17: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:12.605Z

**설명**: navigate  {"url":"http://localhost:3000/auth/signin"}

**실제 결과**: Navigated to http://localhost:3000/auth/signin

---

### 단계 18: type

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:13.241Z

**설명**: type on メールアドレス {"text":"member@test.com"}

**실제 결과**: Typed "member@test.com" on メールアドレス

---

### 단계 19: type

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:13.832Z

**설명**: type on パスワード {"text":"Test1234!"}

**실제 결과**: Typed "Test1234!" on パスワード

---

### 단계 20: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:14.403Z

**설명**: click on 로그인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 21: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:14.918Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 22: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:18.441Z

**설명**: navigate  {"url":"http://localhost:3000/quote-simulator"}

**실제 결과**: Navigated to http://localhost:3000/quote-simulator

---

### 단계 23: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:19.078Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 24: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:21.600Z

**설명**: click on 스탠드 파우치 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 25: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:22.130Z

**설명**: click on PET_AL ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 26: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:20:22.647Z

**설명**: type on 数量 {"text":"1000"}

**에러**:
```
Element not found: 数量
```

---

### 단계 27: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:23.164Z

**설명**: click on 쿠폰 입력 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 28: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:20:23.681Z

**설명**: type on クーポンコード {"text":"SALE2025"}

**에러**:
```
Element not found: クーポンコード
```

---

### 단계 29: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:24.198Z

**설명**: click on 적용 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 30: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:20:24.712Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 31: verify_text_visible

**상태**: ❌ Failed
**시간**: 2026-01-22T15:20:27.233Z

**설명**: verify_text_visible  {"text":"15% 할인 적용됨"}

**실제 결과**: Text "15% 할인 적용됨" not found

---

### 단계 32: verify_text_visible

**상태**: ❌ Failed
**시간**: 2026-01-22T15:20:27.749Z

**설명**: verify_text_visible  {"text":"할인 금액: ¥9,000"}

**실제 결과**: Text "할인 금액: ¥9,000" not found

---
