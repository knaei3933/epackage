# admin/production

**시나리오**: admin/production
**시작 시간**: 2026-01-22T15:19:12.538Z
**종료 시간**: 2026-01-22T15:19:27.571Z
**소요 시간**: 15.0s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 15 |
| 성공 | ✅ 13 |
| 실패 | ❌ 2 |
| 성공률 | 86.7% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:12.538Z

**설명**: navigate  {"url":"http://localhost:3000/admin/production"}

**실제 결과**: Navigated to http://localhost:3000/admin/production

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:13.175Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:16.691Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\admin\production_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:17.389Z

**설명**: click on 진행중만 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:17.902Z

**설명**: click on 할당 가능 주문 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:18.415Z

**설명**: click on 생산 라인 1 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:18.931Z

**설명**: click on 담당자 선택 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:19.443Z

**설명**: click on 操作担当者A ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:19.959Z

**설명**: click on 생산 할당 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 9: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:20.472Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 10: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:22.987Z

**설명**: click on 생산 작업 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 11: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:19:23.503Z

**설명**: type on 進捗率 {"text":"50"}

**에러**:
```
Element not found: 進捗率
```

---

### 단계 12: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:19:24.017Z

**설명**: type on 作業メモ {"text":"재료 절단 완료, 인쇄 시작"}

**에러**:
```
Element not found: 作業メモ
```

---

### 단계 13: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:24.534Z

**설명**: click on 진척 업데이트 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 14: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:19:25.050Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---
