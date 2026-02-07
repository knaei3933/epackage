# member/orders

**시나리오**: member/orders
**시작 시간**: 2026-01-24T07:41:39.276Z
**종료 시간**: 2026-01-24T07:41:58.762Z
**소요 시간**: 19.5s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 21 |
| 성공 | ✅ 16 |
| 실패 | ❌ 5 |
| 성공률 | 76.2% |

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
**시간**: 2026-01-24T07:41:39.276Z

**설명**: navigate  {"url":"http://localhost:3002/member/orders"}

**실제 결과**: Navigated to http://localhost:3002/member/orders

---

### 단계 1: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:39.911Z

**설명**: click on 새 주문 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 2: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:40.440Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:41.964Z

**설명**: click on 견적에서 주문 생성 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:42.493Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:43.995Z

**설명**: click on 견적 선택 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:44.524Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 7: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:41:47.051Z

**설명**: type on 郵便番号 {"text":"100-0001"}

**에러**:
```
Element not found: 郵便番号
```

---

### 단계 8: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:41:47.565Z

**설명**: type on 都道府県 {"text":"東京都"}

**에러**:
```
Element not found: 都道府県
```

---

### 단계 9: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:41:48.080Z

**설명**: type on 市区町村 {"text":"千代田区"}

**에러**:
```
Element not found: 市区町村
```

---

### 단계 10: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:41:48.596Z

**설명**: type on 番地・建物名 {"text":"テスト1-2-3 テストビル"}

**에러**:
```
Element not found: 番地・建物名
```

---

### 단계 11: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:41:49.111Z

**설명**: type on 希望納入日 {"text":"2026-02-28"}

**에러**:
```
Element not found: 希望納入日
```

---

### 단계 12: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:49.627Z

**설명**: click on 주문 확인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 13: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:50.140Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 14: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:52.663Z

**설명**: click on 주문 제출 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 15: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:53.177Z

**설명**: navigate  {"url":"http://localhost:3002/member/orders"}

**실제 결과**: Navigated to http://localhost:3002/member/orders

---

### 단계 16: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:53.819Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 17: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:56.342Z

**설명**: click on 주문 번호 클릭 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 18: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:56.868Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\member\orders_step18.png)

---

### 단계 19: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:57.557Z

**설명**: click on 배송 추적 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 20: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:41:58.074Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\member\orders_step20.png)

---
