# member/deliveries

**시나리오**: member/deliveries
**시작 시간**: 2026-01-22T15:15:57.204Z
**종료 시간**: 2026-01-22T15:16:09.197Z
**소요 시간**: 12.0s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 13 |
| 성공 | ✅ 7 |
| 실패 | ❌ 6 |
| 성공률 | 53.8% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:57.204Z

**설명**: navigate  {"url":"http://localhost:3000/member/deliveries"}

**실제 결과**: Navigated to http://localhost:3000/member/deliveries

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:15:57.837Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:01.353Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\member\deliveries_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:02.037Z

**설명**: click on 새 납품처 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:16:02.554Z

**설명**: type on 納入先名 {"text":"서울 지사"}

**에러**:
```
Element not found: 納入先名
```

---

### 단계 5: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:16:03.068Z

**설명**: type on 連絡先 {"text":"02-5555-6666"}

**에러**:
```
Element not found: 連絡先
```

---

### 단계 6: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:16:03.582Z

**설명**: type on 郵便番号 {"text":"134-857"}

**에러**:
```
Element not found: 郵便番号
```

---

### 단계 7: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:16:04.096Z

**설명**: type on 都道府県 {"text":"서울특별시"}

**에러**:
```
Element not found: 都道府県
```

---

### 단계 8: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:16:04.612Z

**설명**: type on 市区町村 {"text":"강남구"}

**에러**:
```
Element not found: 市区町村
```

---

### 단계 9: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:16:05.125Z

**설명**: type on 番地・建物名 {"text":"테헌로 123"}

**에러**:
```
Element not found: 番地・建物名
```

---

### 단계 10: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:05.640Z

**설명**: click on 기본 납품처 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 11: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:06.156Z

**설명**: click on 저장 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 12: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:16:06.672Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---
