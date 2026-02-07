# admin/shipments

**시나리오**: admin/shipments
**시작 시간**: 2026-01-22T15:19:36.452Z
**종료 시간**: 2026-01-22T15:19:46.376Z
**소요 시간**: 9.9s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 9 |
| 성공 | ✅ 8 |
| 실패 | ❌ 1 |
| 성공률 | 88.9% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:36.452Z

**설명**: navigate  {"url":"http://localhost:3000/admin/shipments"}

**실제 결과**: Navigated to http://localhost:3000/admin/shipments

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:37.087Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:40.590Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\admin\shipments_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:41.288Z

**설명**: click on 운송장 등록 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:19:41.802Z

**설명**: type on 送り状番号 {"text":"JP-9876543210"}

**에러**:
```
Element not found: 送り状番号
```

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:42.315Z

**설명**: click on 배송업체 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:42.828Z

**설명**: click on 佐川急便 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:43.340Z

**설명**: click on 등록 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:43.853Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---
