# homepage/guest-quotation

**시나리오**: homepage/guest-quotation
**시작 시간**: 2026-01-23T05:10:12.668Z
**종료 시간**: 2026-01-23T05:10:26.318Z
**소요 시간**: 13.7s

## 요약

| 항목 | 값 |
|------|-----|
| 총 단계 | 19 |
| 성공 | ✅ 16 |
| 실패 | ❌ 3 |
| 성공률 | 84.2% |

## 데이터베이스 상태 변화

| 테이블 | Before | After | 변화 |
|--------|--------|-------|------|
| quotations | 30 | 30 | 0 |
| orders | 9 | 9 | 0 |
| contracts | 0 | 0 | 0 |
| users | 18 | 18 | 0 |
| notifications | 1 | 1 | 0 |
| samples | 22 | 22 | 0 |

## 단계별 결과

### 단계 0: navigate

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:12.668Z

**설명**: navigate  {"url":"http://localhost:3002"}

**실제 결과**: Navigated to http://localhost:3002

---

### 단계 1: wait

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:13.372Z

**설명**: wait  {"time":2000}

**실제 결과**: Waited 2000ms

---

### 단계 2: snapshot

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:15.893Z

**설명**: snapshot  ""

**실제 결과**: Screenshot captured

**스크린샷**:

![Screenshot](C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\results\screenshots\homepage\guest-quotation_step2.png)

---

### 단계 3: evaluate

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:17.280Z

**설명**: evaluate  {"script":"window.scrollTo(0, 500)"}

**실제 결과**: Script executed: window.scrollTo(0, 500)

---

### 단계 4: click

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:17.792Z

**설명**: click on お見積り ""

**실제 결과**: Clicked on お見積り

---

### 단계 5: click

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:18.962Z

**설명**: click on スタンディングパウチ ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 6: click

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:19.489Z

**설명**: click on 中ロット ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 7: click

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:20.019Z

**설명**: click on 大サイズ ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 8: click

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:20.548Z

**설명**: click on 次へ進む ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 9: click

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:21.078Z

**설명**: click on スタンダードPET ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 10: click

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:21.606Z

**설명**: click on スポットカラー ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 11: click

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:22.119Z

**설명**: click on 標準 ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 12: click

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:22.633Z

**설명**: click on 次へ進む ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 13: type

**상태**: ❌ Failed
**시간**: 2026-01-23T05:10:23.146Z

**설명**: type on お名前 {"text":"テストユーザー"}

**에러**:
```
Element not found: お名前
```

---

### 단계 14: type

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:23.659Z

**설명**: type on メールアドレス {"text":"test@example.com"}

**실제 결과**: Typed "test@example.com" on メールアドレス

---

### 단계 15: type

**상태**: ❌ Failed
**시간**: 2026-01-23T05:10:24.240Z

**설명**: type on 電話番号 {"text":"08012345678"}

**에러**:
```
Element not found: 電話番号
```

---

### 단계 16: type

**상태**: ❌ Failed
**시간**: 2026-01-23T05:10:24.768Z

**설명**: type on 会社名 {"text":"テスト株式会社"}

**에러**:
```
Element not found: 会社名
```

---

### 단계 17: click

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:25.285Z

**설명**: click on 個人情報の取り扱いに同意します ""

**실제 결과**: Page loaded (click fallback)

---

### 단계 18: click

**상태**: ✅ Passed
**시간**: 2026-01-23T05:10:25.800Z

**설명**: click on 見積もり計算 ""

**실제 결과**: Page loaded (click fallback)

---
