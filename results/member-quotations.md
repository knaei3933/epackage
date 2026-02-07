# member/quotations

**시나리오**: member/quotations
**시작 시간**: 2026-01-22T15:15:15.504Z
**종료 시간**: 2026-01-22T15:15:26.551Z
**소요 시간**: 11.0s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 12 |
| 성공 | ✅ 11 |
| 실패 | ❌ 1 |
| 성공률 | 91.7% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:15.504Z

**설명**: navigate  {"url":"http://localhost:3000/member/quotations"}

**실제 결과**: Navigated to http://localhost:3000/member/quotations

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:16.140Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:18.647Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\member\quotations_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:19.348Z

**설명**: click on 드래프 필터 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:19.862Z

**설명**: click on 전체 보기 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:20.377Z

**설명**: navigate  {"url":"http://localhost:3000/member/quotations/[id]"}

**실제 결과**: Navigated to http://localhost:3000/member/quotations/[id]

---

### 단계 6: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:21.014Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 7: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:23.540Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\member\quotations_step7.png)

---

### 단계 8: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:24.228Z

**설명**: navigate  {"url":"http://localhost:3000/member/quotations/[draft-id]"}

**실제 결과**: Navigated to http://localhost:3000/member/quotations/[draft-id]

---

### 단계 9: verify_text_visible

**상태**: ❌ Failed
**시간**: 2026-01-22T15:15:24.867Z

**설명**: verify_text_visible  {"text":"승인 대기 중"}

**실제 결과**: Text "승인 대기 중" not found

---

### 단계 10: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:25.385Z

**설명**: navigate  {"url":"http://localhost:3000/member/quotations/[approved-id]"}

**실제 결과**: Navigated to http://localhost:3000/member/quotations/[approved-id]

---

### 단계 11: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:26.021Z

**설명**: click on 주문으로 변환 버튼 ""

**실제 결과**: Page loaded (click fallback)

---
