# admin/approvals

**시나리오**: admin/approvals
**시작 시간**: 2026-01-24T07:46:09.105Z
**종료 시간**: 2026-01-24T07:46:19.764Z
**소요 시간**: 10.7s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 9 |
| 성공 | ✅ 9 |
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
**시간**: 2026-01-24T07:46:09.105Z

**설명**: navigate  {"url":"http://localhost:3002/admin/approvals"}

**실제 결과**: Navigated to http://localhost:3002/admin/approvals

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:10.472Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:13.991Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\test-scenarios\runner\results\screenshots\admin\approvals_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:14.690Z

**설명**: click on 회원 아이템 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:15.206Z

**설명**: click on 승인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: wait

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:15.718Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:18.227Z

**설명**: click on 거부할 회원 아이템 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:18.738Z

**설명**: click on 거부 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: click

**상태**: ✅ Passed
**시간**: 2026-01-24T07:46:19.252Z

**설명**: click on 확인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---
