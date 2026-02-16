# admin/inventory

**시나리오**: admin/inventory
**시작 시간**: 2026-01-24T07:48:10.071Z
**종료 시간**: 2026-01-24T07:48:21.257Z
**소요 시간**: 11.2s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 8 |
| 성공 | ✅ 7 |
| 실패 | ❌ 1 |
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
**시간**: 2026-01-24T07:48:10.071Z

**설명**: navigate  {"url":"http://localhost:3002/admin/inventory"}

**실제 결과**: Navigated to http://localhost:3002/admin/inventory

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:11.474Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:14.996Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\inventory_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:15.680Z

**설명**: click on PET 필름 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:16.193Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 5: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:48:17.714Z

**설명**: type on 入庫数量 {"text":"1000"}

**에러**:
```
Element not found: 入庫数量
```

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:18.227Z

**설명**: click on 입고 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:18.743Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---
