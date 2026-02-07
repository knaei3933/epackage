# member/samples

**시나리오**: member/samples
**시작 시간**: 2026-01-24T07:43:42.367Z
**종료 시간**: 2026-01-24T07:43:53.133Z
**소요 시간**: 10.8s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 9 |
| 성공 | ✅ 8 |
| 실패 | ❌ 1 |
| 성공률 | 88.9% |

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
**시간**: 2026-01-24T07:43:42.367Z

**설명**: navigate  {"url":"http://localhost:3002/samples"}

**실제 결과**: Navigated to http://localhost:3002/samples

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:42.993Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 2: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:45.507Z

**설명**: click on 스탠드 파우치 샘플 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 3: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:46.040Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 4: type

**상태**: ❌ Failed
**시간**: 2026-01-24T07:43:47.550Z

**설명**: type on 数量 {"text":"10"}

**에러**:
```
Element not found: 数量
```

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:48.064Z

**설명**: click on 납품처 선택 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:48.580Z

**설명**: click on 본사 창고 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:49.094Z

**설명**: click on 샘플 요청 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:49.610Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---
