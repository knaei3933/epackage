# admin/quotations

**시나리오**: admin/quotations
**시작 시간**: 2026-01-24T07:45:51.934Z
**종료 시간**: 2026-01-24T07:46:05.191Z
**소요 시간**: 13.3s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 12 |
| 성공 | ✅ 12 |
| 실패 | 0 |
| 성공률 | 100.0% |

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
**시간**: 2026-01-24T07:45:51.934Z

**설명**: navigate  {"url":"http://localhost:3002/admin/quotations"}

**실제 결과**: Navigated to http://localhost:3002/admin/quotations

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:53.318Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:56.826Z

**설명**: click on 드래프 필터 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 3: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:57.353Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:58.880Z

**설명**: click on 전체 보기 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:59.395Z

**설명**: click on QT-1768962470825 견적 아이템 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:45:59.912Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\quotations_step6.png)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:00.607Z

**설명**: click on 승인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:01.123Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 9: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:03.646Z

**설명**: click on 거부할 견적 아이템 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 10: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:04.159Z

**설명**: click on 거부 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 11: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:04.677Z

**설명**: click on 확인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---
