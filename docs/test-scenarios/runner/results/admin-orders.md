# admin/orders

**시나리오**: admin/orders
**시작 시간**: 2026-01-24T07:46:52.221Z
**종료 시간**: 2026-01-24T07:47:11.592Z
**소요 시간**: 19.4s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 20 |
| 성공 | ✅ 18 |
| 실패 | ❌ 2 |
| 성공률 | 90.0% |

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
**시간**: 2026-01-24T07:46:52.221Z

**설명**: navigate  {"url":"http://localhost:3002/admin/orders"}

**실제 결과**: Navigated to http://localhost:3002/admin/orders

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:53.607Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:57.108Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\orders_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:57.812Z

**설명**: click on 대기 주문 필터 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:58.330Z

**설명**: navigate  {"url":"http://localhost:3002/admin/orders/[id]"}

**실제 결과**: Navigated to http://localhost:3002/admin/orders/[id]

---

### 단계 5: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:59.777Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\orders_step5.png)

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:00.476Z

**설명**: click on 배송 추적 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:00.991Z

**설명**: click on 주문 아이템 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:01.506Z

**설명**: click on 주문 승인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 9: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:02.016Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 10: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:04.546Z

**설명**: navigate  {"url":"http://localhost:3002/admin/production"}

**실제 결과**: Navigated to http://localhost:3002/admin/production

---

### 단계 11: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:05.952Z

**설명**: click on 할당할 주문 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 12: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:06.469Z

**설명**: click on 생산 라인 1 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 13: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:06.985Z

**설명**: click on 담당자 선택 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 14: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:07.501Z

**설명**: click on 생산 할당 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 15: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:08.014Z

**설명**: click on 생산 작업 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 16: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:08.530Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 17: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:47:10.041Z

**설명**: type on 進捗率 {"text":"25"}

**에러**:
```
Element not found: 進捗率
```

---

### 단계 18: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:47:10.557Z

**설명**: type on 作業メモ {"text":"재료 절단 완료"}

**에러**:
```
Element not found: 作業メモ
```

---

### 단계 19: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:11.075Z

**설명**: click on 진척 업데이트 버튼 ""

**실제 결과**: Page loaded (click fallback)

---
