# Vercel 무료 플랜 배포 가이드

Next.js 16 + Supabase 프로젝트를 Vercel 무료 플랜에 배포하는 가이드입니다.

---

## 목차

1. [왜 Vercel 무료 플랜인가?](#왜-vercel-무료-플랜인가)
2. [Vercel 무료 플랜 한도](#vercel-무료-플랜-한도)
3. [배포 단계](#배포-단계)
4. [커스텀 도메인 설정](#커스텀-도메인-설정)
5. [환경 변수 설정](#환경-변수-설정)
6. [Supabase 설정](#supabase-설정)

---

## 왜 Vercel 무료 플랜인가?

### 비교: 월 1만 방문자 기준

| 항목 | Vercel 무료 | Xserver VPS |
|------|-------------|-------------|
| **월 비용** | **0원** | 2,200엔 (~20,000원) |
| 설정 난이도 | ★☆☆ (매우 쉬움) | ★★★ (어려움) |
| 서버 관리 | **필요 없음** | 직접 해야 함 |
| SSL 인증서 | **자동 발급** | 직접 설정 |
| 자동 배포 | **지원** | 직접 설정 |
| API Routes | **완벽 지원** | 지원 |
| 전체 기능 | **모두 사용 가능** | 모두 사용 가능 |

### 결론

**월 1만 방문자라면 Vercel 무료 플랜이 완벽한 선택입니다.**

---

## Vercel 무료 플랜 한도

### 무료 플랜 (Hobby) 제한 (2024년 기준)

| 항목 | 한도 | 월 1만 방문자 시 |
|------|------|-----------------|
| **Bandwidth** | 100GB/월 | 약 3~5GB 사용 ✅ |
| **실행 시간** | 무제한 | 문제 없음 ✅ |
| **Build 시간** | 6,000분/월 | 약 10분 사용 ✅ |
| **프로젝트 수** | 무제한 | 문제 없음 ✅ |
| **Edge Functions** | 무제한 | 문제 없음 ✅ |

### 계산: 월 1만 방문자

```
페이지 로드 당 평균: 300KB ~ 500KB
1만 방문자 × 400KB = 4GB/월

Vercel 무료 한도: 100GB/월
사용량: 4GB / 100GB = 4% 🎉
```

**여유가 매우 큽니다!**

---

## 배포 단계

### 1단계: Vercel 계정 생성

1. [vercel.com](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "Continue with GitHub" 클릭

### 2단계: 프로젝트 가져오기

1. **"Add New..."** → **"Project"** 클릭
2. GitHub 리포지토리 선택
3. 설정 확인

```bash
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: (Next.js가 자동 감지)
Install Command: npm ci
```

4. **"Deploy"** 클릭

### 3단계: 배포 완료

- 자동으로 빌드 시작
- 약 1~2분 후 배포 완료
- `https://your-project.vercel.app` 주소 생성

---

## 커스텀 도메인 설정 (CNAME 방식)

Xserver 네임서버를 유지하며 메일 서버를 그대로 사용합니다.

### 왜 CNAME 방식인가?

- ✅ Xserver 메일 서버 그대로 사용
- ✅ MX 레코드 자동 관리 (실수 없음)
- ✅ 설정이 간단함
- ✅ 5분 안에 완료

### 1단계: Vercel에서 도메인 추가

1. 프로젝트 → **Settings** → **Domains**
2. 도메인 입력: `your-domain.com`
3. **"Add"** 클릭
4. 안내되는 DNS 레코드 확인

### 2단계: Xserver DNS에 레코드 추가

Xserver 서버 패널 → DNS 설정

#### A. 루트 도메인 (A 레코드)

```
호스트명: @ (또는 비워둠)
타입: A
값: 76.76.21.21
TTL: 3600
```

#### B. www 서브도메인 (CNAME)

```
호스트명: www
타입: CNAME
값: cname.vercel-dns.com
TTL: 3600
```

#### C. (선택) CNAME 플랫

루트 도메인에 A 레코드 대신 CNAME도 가능:

```
호스트명: your-domain.com
타입: CNAME
값: cname.vercel-dns.com
TTL: 3600
```

### 3단계: DNS 전파 확인

```bash
# DNS 전파 확인 (약 5~30분)
dig your-domain.com
dig www.your-domain.com
```

### 완료 후

- Vercel이 자동으로 SSL 인증서 발급
- HTTPS 접속 확인
- **메일 서버는 Xserver 그대로 사용** (MX 레코드 유지)

---

## 메일 서버 확인

### MX 레코드 확인

Xserver 네임서버를 유지하므로 기존 MX 레코드가 자동으로 작동:

```bash
# MX 레코드 확인
dig MX your-domain.com

# 결과 예시:
# your-domain.com.  IN MX 10 your-domain.com.xsmtp.jp
```

### 메일 테스트

```bash
# 송수신 테스트
1. info@your-domain.com으로 메일 발송
2. 수신 확인
3. 답장 발송 테스트
```

---

## 환경 변수 설정

### Vercel 대시보드에서 설정

1. 프로젝트 → **Settings** → **Environment Variables**
2. 각 변수 추가

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Next.js Public
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Email
RESEND_API_KEY=re_xxx
SENDGRID_API_KEY=SG.xxx

# Twilio (선택)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
```

3. 각 환경 선택
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **"Save"** 클릭

5. 재배포
   - 설정 후 자동으로 재배포되거나
   - **Deployments** → **Redeploy** 클릭

---

## Supabase 설정

### 1. CORS 설정

Supabase Dashboard → Settings → API

```
Allowed origins:
https://your-domain.com
https://your-project.vercel.app
```

### 2. Redirect URLs

Supabase Dashboard → Authentication → URL Configuration

```
Redirect URLs (allow list):
https://your-domain.com/auth/callback
https://www.your-domain.com/auth/callback
https://your-project.vercel.app/auth/callback
```

### 3. Site URL

```bash
Site URL: https://your-domain.com
```

### 4. Email Templates

인증 이메일 템플릿의 URL을 본 도메인으로 변경:

```html
<!-- Confirm Signup -->
<a href="{{ .ConfirmationURL }}?redirect_to=https://your-domain.com/auth/confirm">
  이메일 확인
</a>
```

---

## 자동 배포

### Git 푸시로 자동 배포

```bash
# main 브랜치에 푸시하면 자동 배포
git add .
git commit -m "feat: 새 기능 추가"
git push origin main

# 자동으로 Vercel에서 빌드 & 배포
```

### 프리뷰 배포

```bash
# feature 브랜치에 푸시하면 프리뷰 URL 생성
git checkout -b feature/new-feature
git push origin feature/new-feature

# 프리뷰 URL: https://your-project-feature-new-feature.vercel.app
```

---

## 성능 최적화

### Vercel 자동 최적화

Vercel은 다음을 자동으로 수행:

- ✅ 글로벌 CDN (서울 포함)
- ✅ 자동 이미지 최적화
- ✅ 정적 자동 캐싱
- ✅ Edge Network 배포
- ✅ HTTP/3 지원

### 리전 확인

대시보드 → Settings → General → **Edge Function Region**

```
Region: Hong Kong (한국에 가장 가까움)
```

---

## 모니터링

### Vercel 대시보드

1. **Deployments** - 배포 내역
2. **Analytics** - 방문자 수 (기본 제공)
3. **Logs** - 실시간 로그
4. **Speed Insights** - 페이지 로드 속도

### 무료 Analytics

```
방문자 수, 페이지 뷰, 총 방문 시간
바운스 비율, 장치/브라우저 분포
```

---

## 트러블슈팅

### 문제: 배포 실패

```bash
# 로그 확인
Deployments → 실패한 배포 → Build Logs
```

### 문제: API Routes 404

```bash
# Next.js App Router 확인
src/app/api/  # ← 이 경로에 있는 파일만 배포됨

# pages/api/ 사용 시
next.config.ts 확인 필요
```

### 문제: 환경 변수 작동 안 함

```bash
# .env.local은 로컬 전용
# Vercel 대시보드에서 Environment Variables 설정 확인
```

### 문제: Supabase 연결 오류

```bash
# 1. CORS 설정 확인
# 2. Redirect URLs 확인
# 3. 환경 변수 확인
# 4. Site URL 확인
```

---

## 비용 절감 팁

### 1. 이미지 최적화

```typescript
// Next.js Image 컴포넌트 사용 (자동 최적화)
import Image from 'next/image'

<Image
  src="/product.jpg"
  alt="Product"
  width={800}
  height={600}
  loading="lazy"
/>
```

### 2. 정적 페이지로 변환

```typescript
// 동적 → 정적
export const dynamic = 'force-static'
```

### 3. 캐싱 활용

```typescript
// revalidate 설정
export const revalidate = 3600 // 1시간
```

---

## 체크리스트

배포 전:

- [ ] Vercel 계정 생성
- [ ] GitHub 연동
- [ ] 프로젝트 배포
- [ ] 환경 변수 설정
- [ ] Supabase CORS 설정
- [ ] Supabase Redirect URLs 설정
- [ ] 커스텀 도메인 설정
- [ ] HTTPS 접속 확인
- [ ] 관리자 페이지 동작 확인
- [ ] 회원 페이지 동작 확인
- [ ] 견적 시스템 동작 확인
- [ ] 모든 API 테스트

---

## 요약

### ✅ Vercel 무료 플랜 추천 이유

1. **비용**: 0원 (월 2,200엔 절약)
2. **설정**: 5분 안에 배포 완료
3. **관리**: 서버 관리 불필요
4. **성능**: 글로벌 CDN, 서울 리전
5. **기능**: 모든 Next.js 기능 지원
6. **확장성**: 월 10만 방문자까지 무료로 충분

### ⚠️ Xserver VPS 필요한 경우

- 월 10만+ 방문자 (Vercel 한도 초과)
- 완전한 서버 제어 필요
- 특정 서버 소프트웨어 필요

### 🎯 결론

**현재 프로젝트(월 1만 방문자)에는 Vercel 무료 플랜이 완벽합니다!**

---

## 다음 단계

1. [Vercel](https://vercel.com) 접속
2. GitHub 연동
3. 프로젝트 배포
4. 커스텀 도메인 설정
5. 완료! 🎉

도움이 필요하시면 언제든 물어보세요.
