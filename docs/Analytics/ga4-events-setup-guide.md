# GA4 이벤트 설정 가이드

**작성일:** 2026-03-05
**대상:** Epackage Lab (epackage-lab-web)
**목적:** Google Ads 전환 추적을 위한 GA4 이벤트 설정
**GA4 속성:** G-VBCB77P21T
**Google Ads:** 508-696-1395

---

## 목차

1. [개요](#1-개요)
2. [사전 준비](#2-사전-준비)
3. [커스텀 이벤트 생성](#3-커스텀-이벤트-생성)
4. [회원가입 이벤트 설정](#4-회원가입-이벤트-설정)
5. [전환 파라미터 설정](#5-전환-파라미터-설정)
6. [Google Ads 연동](#6-google-ads-연동)
7. [검증 방법](#7-검증-방법)
8. [문제 해결](#8-문제-해결)

---

## 1. 개요

### 1.1 설정할 이벤트

| 이벤트명 | 목적 | 우선순위 | 가치 |
|---------|----|---------|----|
| `contact_submit` | 문의하기 제출 | 🔴 높음 | 동적 (추정) |
| `quote_complete` | 견적 완료 | 🔴 높음 | 동적 (견적액) |
| `sample_request` | 샘플 요청 | 🟡 중간 | 0 |
| `signup_pending` | 회원가입 (대기) | 🟢 낮음 | 0 |
| `signup_complete` | 회원가입 (완료) | 🟢 낮음 | 동적 |

### 1.2 회원가입 전략

**왜 회원가입 추적인가?**

B2B 기업(Epackage Lab)에서 회원가입의 중요도:

| 항목 | 설명 |
|-----|------|
| **리드 품질** | 회원가입 = 진지한 고객 (평균 전환율 2-3배) |
| **리타겟팅** | 가입하지 않은 방문자에게 리마케팅 가능 |
| **데이터 축적** | 이메일, 연락처 등 확보로 재마케팅 강화 |
| **고객 LTV** | 회원은 평균 2-3회 이상 재주문 |

**전략적 우선순위:**
1. **견적 요청** (회원가입 불필요) - 가장 중요
2. **문의하기** (회원가입 불필요) - 중요
3. **샘플 요청** (회원가입 불필요) - 중간
4. **회원가입** - 리마케팅용 리스트 구축

---

## 2. 사전 준비

### 2.1 필요한 정보

- GA4 계정 접속 권한
- Google Ads 계정 접속 권한
- GTM 컨테이너: `GTM-T4PL5XMC`

### 2.2 코드 구현 확인

이미 코드베이스에 구현되어 있습니다:

```typescript
// src/lib/analytics/dataLayer.ts
export function trackContactFormSubmit() {
  trackEvent('contact_submit', {
    form_type: 'contact',
    category: 'inquiry'
  });
}

export function trackQuoteComplete(value: number) {
  trackEvent('quote_complete', {
    currency: 'JPY',
    value: value,
    form_type: 'quote_simulation'
  });
}

export function trackSampleRequest() {
  trackEvent('sample_request', {
    form_type: 'sample',
    category: 'sample'
  });
}
```

---

## 3. 커스텀 이벤트 생성

### 3.1 GA4 이벤트 생성 화면으로 이동

```
1. [Google Analytics](https://analytics.google.com/analytics/web/#/p526398226/) 접속
2. 왼쪽 메뉴 > [구성] 클릭
3. [이벤트] 클릭
4. [이벤트 만들기] 버튼 클릭
```

### 3.2 이벤트 생성 단계

#### 이벤트 생성 옵션 선택

```
┌─────────────────────────────────┐
│  이벤트 만들기                 │
├─────────────────────────────────┤
│  • GA4 이벤트                   │ ← 선택
│  • Google 시그널 이벤트         │
└─────────────────────────────────┘
```

---

## 4. 이벤트별 설정 상세

### 4.1 contact_submit (문의하기 제출)

**기본 설정:**

| 항목 | 값 |
|-----|-----|
| **이벤트 이름** | `contact_submit` |
| **설정 위치** | 모든 웹사이트 |
| **카테고리** | `inquiry` |
| **라벨** | `문의하기` |

**단계:**

1. **이벤트 이름 입력**
   ```
   이벤트 이름: contact_submit
   ```

2. **카테고리 설정**
   ```
   카테고리: inquiry (문의)
   라벨: 문의하기 제출
   ```

3. **매개변수 (옵션)**
   ```
   매개변수 추가:
   - 이름: form_type
   - 타입: 문자열
   ```

4. **[만들기] 클릭**

---

### 4.2 quote_complete (견적 완료)

**기본 설정:**

| 항목 | 값 |
|-----|-----|
| **이벤트 이름** | `quote_complete` |
| **설정 위치** | 모든 웹사이트 |
| **카테고리** | `quote` |
| **라벨** | `견적 완료` |

**매개변수 설정 (중요!):**

1. **이벤트 이름**
   ```
   이벤트 이름: quote_complete
   ```

2. **매개변수 추가 (견적액 전용)**

   | 매개변수 | 타입 | 설명 |
   |---------|----|----|
   | `currency` | 문자열 | 통화 (JPY) |
   | `value` | 숫자 | 견적 금액 |

   ```
   매개변수 > 매개변수 만들기 클릭:

   매개변수 1:
   - 이름: value
   - 타입: 숫자
   - 설명: 견적 금액

   매개변수 2:
   - 이름: currency
   - 타입: 문자열
   - 설명: 통화
   ```

3. **[만들기] 클릭**

---

### 4.3 sample_request (샘플 요청)

**기본 설정:**

| 항목 | 값 |
|-----|-----|
| **이벤트 이름** | `sample_request` |
| **설정 위치** | 모든 웹사이트 |
| **카테고리** | `sample` |
| **라벨** | `샘플 요청` |

---

### 4.4 signup_pending (회원가입 - 대기)

**목적:** 이메일 인증 전 가입 완료 추적

**기본 설정:**

| 항목 | 값 |
|-----|-----|
| **이벤트 이름** | `signup_pending` |
| **설정 위치** | 모든 웹사이트 |
| **카테고리** | `signup` |
| **라벨** | `회원가입 대기` |

---

### 4.5 signup_complete (회원가입 - 완료)

**목적:** 이메일 인증 완료 후 최종 가입 완료 추적

**기본 설정:**

| 항목 | 값 |
|-----|-----|
| **이벤트 이름** | `signup_complete` |
| **설정 위치** | 모든 웹사이트 |
| **카테고리** | `signup` |
| **라벨** | `회원가입 완료` |

**매개변수:**

| 매개변수 | 타입 | 설명 |
|---------|----|----|
| `user_id` | 문자열 | 사용자 ID |
| `signup_method` | 문자열 | 가입 방법 (email, google) |

---

## 5. 전환 파라미터 설정

### 5.1 중요 이벤트로 표시

이벤트 생성 후 중요 이벤트로 표시합니다:

```
1. [구성] > [이벤트] 클릭
2. 생성된 이벤트 찾기 (예: contact_submit)
3. 이벤트 이름 옆 [별 표시] 클릭
4. [중요 이벤트로 표시] 선택
```

**중요 이벤트로 표시할 이벤트:**
- ✅ contact_submit
- ✅ quote_complete
- ✅ sample_request
- ✅ signup_pending
- ✅ signup_complete

---

## 6. Google Ads 연동

### 6.1 전환으로 가져오기

**GA4 이벤트 생성 후 Google Ads에서 전환 설정:**

```
1. [Google Ads](https://ads.google.com/aw/conversions) 접속
2. [도구 및 설정] > [전환] 클릭
3. [+] 플러스 버튼 클릭
4. [가져오기] 선택
5. [Google Analytics 4 (GA4) 속성] 선택
6. 연결된 속성 선택 (G-VBCB77P21T)
```

### 6.2 가져올 이벤트 선택

**가져올 이벤트 체크리스트:**

| 이벤트 | Google Ads 전환명 | 가치 | 우선순위 |
|-------|-------------------|----|---------|
| `contact_submit` | 문의하기_GA4 | 0 | 필수 |
| `quote_complete` | 견적완료_GA4 | 동적 | 필수 |
| `sample_request` | 샘플요청_GA4 | 0 | 권장 |
| `signup_complete` | 회원가입_GA4 | 0 | 선택 |

**단계:**

1. 이벤트 목록에서 체크박스 선택
2. [가져오기 및 계속] 클릭
3. 전환 설정 화면에서 세부 설정 입력

### 6.3 전환 세부 설정

#### contact_submit 설정

| 항목 | 값 |
|-----|-----|
| **전환 이름** | 문의하기_GA4 |
| **가치** | 0 |
| **수** | 1 (모든 전환) |
| **전환 작업 최적화** | 사용 |

#### quote_complete 설정

| 항목 | 값 |
|-----|-----|
| **전환 이름** | 견적완료_GA4 |
| **가치** | 동적 가치 사용 |
| **수** | 1 (모든 전환) |
| **클릭 30일 전환** | 30일 |
| **참여 1일 전환** | 1일 |
| **전환 작업 최적화** | 사용 |
| **카테고리** | 구매 |

#### sample_request 설정

| 항목 | 값 |
|-----|-----|
| **전환 이름** | 샘플요청_GA4 |
| **가치** | 0 |
| **수** | 1 |
| **전환 작업 최적화** | 사용 |

#### signup_complete 설정

| 항목 | 값 |
|-----|-----|
| **전환 이름** | 회원가입_GA4 |
| **가치** | 0 |
| **수** | 1 |
| **전환 작업 최적화** | 사용 |

---

## 7. 검증 방법

### 7.1 GA4 DebugView 확인

```
1. [GA4 DebugView](https://analytics.google.com/analytics/web/#/p526398226/debugview) 접속
2. 이벤트 발생 테스트 (아래 7.2 참고)
3. DebugView에서 이벤트 표시 확인
```

### 7.2 이벤트 발생 테스트

| 이벤트 | 테스트 방법 |
|-------|-----------|
| `contact_submit` | 문의하기 폼 제출 |
| `quote_complete` | 견적 시뮬레이터 완료 |
| `sample_request` | 샘플 요청 폼 제출 |
| `signup_pending` | 회원가입 폼 제출 |
| `signup_complete` | 이메일 인증 클릭 |

### 7.3 Google Ads 전환 확인

```
1. Google Ads > 도구 및 설정 > 전환
2. 해당 전환 이름 검색 (예: 문의하기_GA4)
3. 상태가 "활성"인지 확인
```

---

## 8. 문제 해결

### 8.1 이벤트가 표시되지 않음

**증상:** DebugView에 이벤트가 표시되지 않음

**해결:**
1. 브라우저 개발자 도구 > 콘솔 확인
2. dataLayer에 이벤트가 푸시되는지 확인
3. GTM 미리보기 모드로 태그 발생 확인

### 8.2 매개변수가 전달되지 않음

**증상:** value, currency가 undefined

**해결:**
```typescript
// 코드에서 매개변수 전달 확인
gtag('event', 'quote_complete', {
  currency: 'JPY',
  value: 150000, // 숫자로 전달 필수
});
```

### 8.3 Google Ads에 전환 기록되지 않음

**증상:** GA4에는 기록되지만 Google Ads에는 없음

**해결:**
1. GA4와 Google Ads 연결 상태 확인
2. 전환 설정에서 "데이터 소스"가 GA4인지 확인
3. 24시간 대기 (데이터 동기화 시간)

---

## 9. 회원가입 추적 구현

### 9.1 회원가입 폼 수정

**파일:** `src/app/member/signup/page.tsx`

```typescript
// 가입 완료 시 이벤트 추적
const handleSignup = async (formData: SignupFormData) => {
  // 1. 회원가입 API 호출
  const response = await fetch('/api/member/signup', {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    // 2. GA4 이벤트 전송 (대기 상태)
    gtag('event', 'signup_pending', {
      signup_method: formData.provider || 'email',
    });
  }
};
```

### 9.2 이메일 인증 완료 시 이벤트

**파일:** 이메일 인증 페이지 또는 콜백 URL 처리

```typescript
// 이메일 인증 확인 후
gtag('event', 'signup_complete', {
  user_id: userId,
  signup_method: 'email',
});
```

---

## 10. 체크리스트

### 10.1 GA4 이벤트 생성

- [ ] contact_submit 생성 완료
- [ ] quote_complete 생성 완료
- [ ] sample_request 생성 완료
- [ ] signup_pending 생성 완료
- [ ] signup_complete 생성 완료

### 10.2 중요 이벤트 설정

- [ ] 모든 이벤트를 중요 이벤트로 표시

### 10.3 Google Ads 연동

- [ ] GA4 속성 연결 확인
- [ ] 전환 가져오기 완료
- [ ] 전환 세부 설정 완료

### 10.4 검증

- [ ] DebugView에서 이벤트 확인
- [ ] 실제 페이지에서 테스트 완료
- [ ] Google Ads에서 전환 기록 확인 (24시간 후)

---

## 11. 다음 단계

1. ✅ 이 가이드에 따라 이벤트 생성
2. ✅ Google Ads에서 전환 설정
3. ✅ DebugView로 이벤트 검증
4. ✅ 실제 광고 캠페인 시작

---

**문서 버전:** 1.0
**작성일:** 2026-03-05
**마지막 수정:** 2026-03-05
**관련 문서:** [google-ads-campaign-guide.md](./google-ads-campaign-guide.md)
