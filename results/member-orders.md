# member/orders

**시나리오**: member/orders
**시작 시간**: 2026-01-22T15:15:01.563Z
**종료 시간**: 2026-01-22T15:15:15.503Z
**소요 시간**: 13.9s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 18 |
| 성공 | ✅ 13 |
| 실패 | ❌ 5 |
| 성공률 | 72.2% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:01.563Z

**설명**: navigate  {"url":"http://localhost:3000/member/orders"}

**실제 결과**: Navigated to http://localhost:3000/member/orders

---

### 단계 1: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:02.188Z

**설명**: click on 새 주문 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 2: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:02.718Z

**설명**: click on 견적에서 주문 생성 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:03.231Z

**설명**: click on 견적 선택 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:15:03.745Z

**설명**: type on 郵便番号 {"text":"100-0001"}

**에러**:
```
Element not found: 郵便番号
```

---

### 단계 5: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:15:04.262Z

**설명**: type on 都道府県 {"text":"東京都"}

**에러**:
```
Element not found: 都道府県
```

---

### 단계 6: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:15:04.778Z

**설명**: type on 市区町村 {"text":"千代田区"}

**에러**:
```
Element not found: 市区町村
```

---

### 단계 7: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:15:05.306Z

**설명**: type on 番地・建物名 {"text":"テスト1-2-3 テストビル"}

**에러**:
```
Element not found: 番地・建物名
```

---

### 단계 8: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:15:05.818Z

**설명**: type on 希望納入日 {"text":"2026-02-28"}

**에러**:
```
Element not found: 希望納入日
```

---

### 단계 9: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:06.333Z

**설명**: click on 주문 확인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 10: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:06.850Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 11: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:09.375Z

**설명**: click on 주문 제출 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 12: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:09.887Z

**설명**: navigate  {"url":"http://localhost:3000/member/orders"}

**실제 결과**: Navigated to http://localhost:3000/member/orders

---

### 단계 13: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:10.510Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 14: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:13.024Z

**설명**: click on 주문 번호 클릭 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 15: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:13.541Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\member\orders_step15.png)

---

### 단계 16: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:14.228Z

**설명**: click on 배송 추적 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 17: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:14.757Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\member\orders_step17.png)

---
