# member/quotations

**시나리오**: member/quotations
**시작 시간**: 2026-01-24T07:42:02.331Z
**종료 시간**: 2026-01-24T07:42:17.288Z
**소요 시간**: 15.0s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 12 |
| 성공 | ✅ 11 |
| 실패 | ❌ 1 |
| 성공률 | 91.7% |

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
**시간**: 2026-01-24T07:42:02.331Z

**설명**: navigate  {"url":"http://localhost:3002/member/quotations"}

**실제 결과**: Navigated to http://localhost:3002/member/quotations

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:42:04.387Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:42:06.907Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\member\quotations_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:42:07.576Z

**설명**: click on 드래프 필터 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:42:08.103Z

**설명**: click on 전체 보기 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:42:08.616Z

**설명**: navigate  {"url":"http://localhost:3002/member/quotations/[id]"}

**실제 결과**: Navigated to http://localhost:3002/member/quotations/[id]

---

### 단계 6: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:42:11.016Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 7: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:42:13.543Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\member\quotations_step7.png)

---

### 단계 8: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:42:14.197Z

**설명**: navigate  {"url":"http://localhost:3002/member/quotations/[draft-id]"}

**실제 결과**: Navigated to http://localhost:3002/member/quotations/[draft-id]

---

### 단계 9: verify_text_visible

**상태**: ❌ Failed
**시간**: 2026-01-24T07:42:15.261Z

**설명**: verify_text_visible  {"text":"승인 대기 중"}

**실제 결과**: Text "승인 대기 중" not found

---

### 단계 10: navigate

**상태**: ✅ Passed
**시간**: 2026-01-24T07:42:15.776Z

**설명**: navigate  {"url":"http://localhost:3002/member/quotations/[approved-id]"}

**실제 결과**: Navigated to http://localhost:3002/member/quotations/[approved-id]

---

### 단계 11: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:42:16.771Z

**설명**: click on 주문으로 변환 버튼 ""

**실제 결과**: Page loaded (click fallback)

---
