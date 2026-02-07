# admin/customers

**시나리오**: admin/customers
**시작 시간**: 2026-01-22T15:18:10.334Z
**종료 시간**: 2026-01-22T15:18:30.351Z
**소요 시간**: 20.0s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 20 |
| 성공 | ✅ 16 |
| 실패 | ❌ 4 |
| 성공률 | 80.0% |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:10.334Z

**설명**: navigate  {"url":"http://localhost:3000/admin/customers"}

**실제 결과**: Navigated to http://localhost:3000/admin/customers

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:10.970Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:14.485Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\admin\customers_step2.png)

---

### 단계 3: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:15.185Z

**설명**: click on 활성 회원만 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 4: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:15.698Z

**설명**: wait  {"time":1000}

**실제 결과**: Waited 1000ms

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:17.224Z

**설명**: click on 전체 보기 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:17.739Z

**설명**: click on 고객 상세 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:18.265Z

**설명**: click on 편집 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:18:18.796Z

**설명**: type on 会社電話番号 {"text":"03-9999-8888"}

**에러**:
```
Element not found: 会社電話番号
```

---

### 단계 9: type

**상태**: ❌ Failed
**시간**: 2026-01-22T15:18:19.309Z

**설명**: type on 携帯電話 {"text":"090-1234-5678"}

**에러**:
```
Element not found: 携帯電話
```

---

### 단계 10: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:19.823Z

**설명**: click on 저장 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 11: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:20.336Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 12: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:22.860Z

**설명**: navigate  {"url":"http://localhost:3000/auth/signin"}

**실제 결과**: Navigated to http://localhost:3000/auth/signin

---

### 단계 13: type

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:23.483Z

**설명**: type on メールアドレス {"text":"member@test.com"}

**실제 결과**: Typed "member@test.com" on メールアドレス

---

### 단계 14: type

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:24.074Z

**설명**: type on パスワード {"text":"Test1234!"}

**실제 결과**: Typed "Test1234!" on パスワード

---

### 단계 15: click

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:24.650Z

**설명**: click on 로그인 버튼 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 16: wait

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:25.164Z

**설명**: wait  {"time":3000}

**실제 결과**: Waited 3000ms

---

### 단계 17: navigate

**상태**: ✅ Passed
**시간**: 2026-01-22T15:18:28.676Z

**설명**: navigate  {"url":"http://localhost:3000/member/profile"}

**실제 결과**: Navigated to http://localhost:3000/member/profile

---

### 단계 18: verify_text_visible

**상태**: ❌ Failed
**시간**: 2026-01-22T15:18:29.328Z

**설명**: verify_text_visible  {"text":"수정된 회사명"}

**실제 결과**: Text "수정된 회사명" not found

---

### 단계 19: verify_text_visible

**상태**: ❌ Failed
**시간**: 2026-01-22T15:18:29.841Z

**설명**: verify_text_visible  {"text":"수정 담당자"}

**실제 결과**: Text "수정 담당자" not found

---
