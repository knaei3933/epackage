# admin/production

**시나리오**: admin/production
**시작 시간**: 2026-01-24T07:47:48.804Z
**종료 시간**: 2026-01-24T07:48:06.134Z
**소요 시간**: 17.3s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 16 |
| 성공 | ✅ 14 |
| 실패 | ❌ 2 |
| 성공률 | 87.5% |

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
**시간**: 2026-01-24T07:47:48.804Z

**설명**: navigate  {"url":"http://localhost:3002/admin/production"}

**실제 결과**: Navigated to http://localhost:3002/admin/production

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:50.195Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:53.719Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\production_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:54.421Z

**설명**: click on 진행중만 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:54.937Z

**설명**: click on 할당 가능 주문 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:55.453Z

**설명**: click on 생산 라인 1 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:55.965Z

**설명**: click on 담당자 선택 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:56.480Z

**설명**: click on 操作担当者A ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:56.996Z

**설명**: click on 생산 할당 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 9: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:47:57.507Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 10: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:00.030Z

**설명**: click on 생산 작업 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 11: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:00.545Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 12: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:48:02.072Z

**설명**: type on 進捗率 {"text":"50"}

**에러**:
```
Element not found: 進捗率
```

---

### 단계 13: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:48:02.588Z

**설명**: type on 作業メモ {"text":"재료 절단 완료, 인쇄 시작"}

**에러**:
```
Element not found: 作業メモ
```

---

### 단계 14: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:03.102Z

**설명**: click on 진척 업데이트 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 15: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:03.615Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---
