# admin/orders

**시나리오**: admin/orders
**시작 시간**: 2026-01-22T15:18:30.352Z
**종료 시간**: 2026-01-22T15:18:45.880Z
**소요 시간**: 15.5s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 19 |
| 성공 | ✅ 17 |
| 실패 | ❌ 2 |
| 성공률 | 89.5% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:30.352Z

**설명**: navigate  {"url":"http://localhost:3000/admin/orders"}

**실제 결과**: Navigated to http://localhost:3000/admin/orders

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:30.987Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:34.494Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\admin\orders_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:35.197Z

**설명**: click on 대기 주문 필터 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:35.709Z

**설명**: navigate  {"url":"http://localhost:3000/admin/orders/[id]"}

**실제 결과**: Navigated to http://localhost:3000/admin/orders/[id]

---

### 단계 5: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:36.343Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\admin\orders_step5.png)

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:37.059Z

**설명**: click on 배송 추적 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:37.576Z

**설명**: click on 주문 아이템 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:38.090Z

**설명**: click on 주문 승인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 9: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:38.603Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 10: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:41.118Z

**설명**: navigate  {"url":"http://localhost:3000/admin/production"}

**실제 결과**: Navigated to http://localhost:3000/admin/production

---

### 단계 11: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:41.756Z

**설명**: click on 할당할 주문 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 12: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:42.283Z

**설명**: click on 생산 라인 1 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 13: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:42.799Z

**설명**: click on 담당자 선택 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 14: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:43.316Z

**설명**: click on 생산 할당 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 15: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:43.827Z

**설명**: click on 생산 작업 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 16: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:18:44.341Z

**설명**: type on 進捗率 {"text":"25"}

**에러**:
```
Element not found: 進捗率
```

---

### 단계 17: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:18:44.850Z

**설명**: type on 作業メモ {"text":"재료 절단 완료"}

**에러**:
```
Element not found: 作業メモ
```

---

### 단계 18: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:45.366Z

**설명**: click on 진척 업데이트 버튼 ""

**실제 결과**: Page loaded (click fallback)

---
