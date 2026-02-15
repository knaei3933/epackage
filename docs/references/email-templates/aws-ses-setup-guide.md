# AWS SES 설정 가이드 (Epackage Lab)

## 개요
AWS SES (Simple Email Service)로 이메일 시스템을 구축하는 방법입니다.

---

## 1단계: AWS SES 콘솔 접속

### 1.1 AWS 콘솔 접속
1. AWS Console 접속: https://console.aws.amazon.com/
2. 검색창에 **`SES`** 또는 **`Simple Email Service`** 입력
3. **`Simple Email Service`** 클릭하여 이동

### 1.2 리전 선택
- 상단 메뉴의 **리전 선택** 드롭다운 클릭
- **`아시아 태평양(도쿄) ap-northeast-1`** 선택
  - 일본 고객에게 더 빠른 이메일 전송

---

## 2단계: SMTP 자격 증명 생성 ✅ 완료

이미 완료되었습니다!

**발급받으신 자격 증명:**
```
사용자 이름: AKIAUTEMTLFR5XW5UWKY
비밀번호: BBdqt85wcpLnLV50YaozThbgyyxj1sj+MH800wTQI3Wx
```

---

## 3단계: 이메일 발송 도메인/주소 검증

### 옵션 A: 도메인 검증 (권장) - DKIM 포함

1. **좌측 메뉴** → **`Configuration`** → **`Verified identities`**
2. **`Create identity`** 버튼 클릭
3. **`Domain`** 선택
4. 도메인 입력: `epackage-lab.com`
5. **`Generate DKIM settings`** 체크 ✅
6. **`Create identity`** 버튼 클릭

**DNS 레코드 추가 (도메인 관리 사이트에서):**

AWS가 생성한 DKIM 토큰을 확인하고 DNS에 추가:

```
타입: CNAME
이름: epackage._domainkey
값: epackage.dkim.amazonses.com

타입: CNAME
이름: (AWS에서 생성한 3번째 토큰)
값: (해당 값)
```

7. DNS 설정 후 **30분-2시간** 기다린 후 **`Verify`** 버튼 클릭

---

### 옵션 B: 이메일 주소 검증 (빠른 테스트용) ⭐

1. **`Create identity`** 버튼 클릭
2. **`Email address`** 선택
3. 발신자 이메일 입력: `noreply@epackage-lab.com` 또는 개인 이메일
4. **`Create identity`** 버튼 클릭
5. 수신 이메일에서 **검증 링크** 클릭

---

## 4단계: 발송 권한 요청 (샌드박스 → 프로덕션)

초기에는 **샌드박스 모드**로 제한됩니다.

### 제한 사항:
- 검증된 이메일 주소로만 발송 가능
- 24시간 동안 200통 제한

### 프로덕션 모드 전환 방법:

1. **좌측 메뉴** → **`Configuration`** → **`Sending limits`** 또는 **`Request production access`**
2. **`Request production access`** 버튼 클릭
3. **`Case details`**에 내용 작성:
   ```
   Use case: Transactional emails for Japanese B2B packaging company
   Website: https://epackage-lab.com
   Daily volume: Initially 10-100 emails/day, growing to 1,000+
   How you will handle bounces/complaints: We'll monitor and implement webhooks
   Type: Marketing and Transactional
   ```
4. **`Request`** 버튼 클릭

**승인까지:** 보통 **1-2영업일** (일본어로 작성하면 더 빠름)

---

## 5단계: .env.local 설정

### .env.local 파일 열기:
프로젝트 루트의 `.env.local` 파일을 엽니다.

### 환경변수 추가:

```bash
# =====================================================
# AWS SES 이메일 설정
# =====================================================

# AWS SES SMTP 자격 증명
AWS_SES_SMTP_USERNAME=AKIAUTEMTLFR5XW5UWKY
AWS_SES_SMTP_PASSWORD=BBdqt85wcpLnLV50YaozThbgyyxj1sj+MH800wTQI3Wx
AWS_SES_SMTP_HOST=email-smtp.ap-northeast-1.amazonaws.com
AWS_SES_SMTP_PORT=587

# 이메일 설정
ADMIN_EMAIL=admin@epackage-lab.com
FROM_EMAIL=noreply@epackage-lab.com
```

### .env.local 파일 위치:
```
C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.env.local
```

---

## 6단계: 이메일 발송 테스트

### 6.1 개발 서버 시작

```bash
npm run dev
```

### 6.2 테스트 방법

**샌드박스 모드에서 (프로덕션 승인 전):**
1. 검증된 이메일 주소로만 발송 가능
2. `/contact` 페이지 접속
3. 폼 작성 후 제출
4. 검증된 이메일로 도착 확인

**프로덕션 모드에서 (승인 후):**
- 모든 이메일 주소로 발송 가능
- 발송 한도 제거됨

---

## 비용 절감 (AWS SES vs SendGrid)

| 항목 | AWS SES | SendGrid | 절감 |
|------|---------|----------|------|
| 거래 이메일 | **$0.10/1,000통** | $1.00/1,000통 | **90%** |
| 1,000통/월 | **$0.10** | ~$100 | **$119.88/년** |
| 10,000통/월 | **$1** | ~$300 | **$3,588/년** |
| 100,000통/월 | **$10** | ~$1,000+ | **$11,880/년** |

**월 1만통 발송 시 연간 절감:** 약 **$3,500+** (약 470만원)

---

## 문제 해결

### 1. "Email address is not verified" 에러
- **원인:** 샌드박스 모드에서 검증되지 않은 이메일로 발송 시도
- **해결:**
  1. **Verified identities**에서 수신 이메일 추가
  2. 또는 프로덕션 액세스 승인 대기

### 2. SMTP 연결 거부
- **원인:** 자격 증명 오류
- **해결:**
  1. 사용자 이름과 비밀번호 재확인
  2. 리전이 올바른지 확인 (ap-northeast-1)

### 3. 이메일이 스팸함으로 분류
- **원인:** SPF/DKIM 레코드 미설정
- **해결:**
  1. 도메인 검증 완료
  2. DNS 레코드 확인
  3. 발신자 평판 관리

---

## 다음 단계 체크리스트

- [x] SMTP 자격 증명 생성 완료
- [ ] 이메일 주소 또는 도메인 검증
- [ ] .env.local에 자격 증명 추가
- [ ] 프로덕션 액세스 요청 (선택사항)
- [ ] 개발 서버로 테스트
- [ ] 이메일 수신 확인

---

## 참고 자료

- AWS SES 문서: https://docs.aws.amazon.com/ses/
- SMTP 자격 증명: https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html
- 프로덕션 액세스: https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html
