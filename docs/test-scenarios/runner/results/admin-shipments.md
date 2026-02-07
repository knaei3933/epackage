# admin/shipments

**시나리오**: admin/shipments
**시작 시간**: 2026-01-24T07:48:25.180Z
**종료 시간**: 2026-01-24T07:48:37.379Z
**소요 시간**: 12.2s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 10 |
| 성공 | ✅ 9 |
| 실패 | ❌ 1 |
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
**시간**: 2026-01-24T07:48:25.180Z

**설명**: navigate  {"url":"http://localhost:3002/admin/shipments"}

**실제 결과**: Navigated to http://localhost:3002/admin/shipments

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:26.572Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:30.096Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\shipments_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:30.780Z

**설명**: click on 운송장 등록 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:31.299Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 5: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:48:32.803Z

**설명**: type on 送り状番号 {"text":"JP-9876543210"}

**에러**:
```
Element not found: 送り状番号
```

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:33.318Z

**설명**: click on 배송업체 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:33.834Z

**설명**: click on 佐川急便 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:34.349Z

**설명**: click on 등록 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 9: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:48:34.866Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---
