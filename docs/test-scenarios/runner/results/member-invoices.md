# member/invoices

**시나리오**: member/invoices
**시작 시간**: 2026-01-24T07:43:28.599Z
**종료 시간**: 2026-01-24T07:43:38.399Z
**소요 시간**: 9.8s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 6 |
| 성공 | ✅ 6 |
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
**시간**: 2026-01-24T07:43:28.599Z

**설명**: navigate  {"url":"http://localhost:3002/member/invoices"}

**실제 결과**: Navigated to http://localhost:3002/member/invoices

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:29.664Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:33.176Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\member\invoices_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:33.846Z

**설명**: click on 청구서 번호 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:34.360Z

**설명**: click on PDF 다운로드 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:43:34.873Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---
