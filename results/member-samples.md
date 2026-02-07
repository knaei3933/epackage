# member/samples

**시나리오**: member/samples
**시작 시간**: 2026-01-22T15:16:18.642Z
**종료 시간**: 2026-01-22T15:16:28.094Z
**소요 시간**: 9.5s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 8 |
| 성공 | ✅ 7 |
| 실패 | ❌ 1 |
| 성공률 | 87.5% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:18.642Z

**설명**: navigate  {"url":"http://localhost:3000/samples"}

**실제 결과**: Navigated to http://localhost:3000/samples

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:19.450Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 2: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:21.976Z

**설명**: click on 스탠드 파우치 샘플 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 3: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:16:22.507Z

**설명**: type on 数量 {"text":"10"}

**에러**:
```
Element not found: 数量
```

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:23.034Z

**설명**: click on 납품처 선택 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:23.549Z

**설명**: click on 본사 창고 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:24.064Z

**설명**: click on 샘플 요청 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:24.575Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---
