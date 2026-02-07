# Vercel 배포 가이드

Xserver 도메인, 메일 SMTP, Supabase를 사용하는 프로젝트를 Vercel에 배포하는 방법입니다.

---

## 목차

1. [배포 전 준비](#배포-전-준비)
2. [Vercel에 프로젝트 배포](#vercel에-프로젝트-배포)
3. [환경 변수 설정](#환경-변수-설정)
4. [Xserver 도메인 연결](#xserver-도메인-연결)
5. [Supabase 설정](#supabase-설정)
6. [메일 SMTP 설정](#메일-smtp-설정)
7. [배포 후 확인](#배포-후-확인)
8. [트러블슈팅](#트러블슈팅)

---

## 배포 전 준비

### 필요한 것들

- ✅ GitHub 리포지토리 (프로젝트 코드)
- ✅ Vercel 계정 (GitHub로 로그인)
- ✅ Xserver 도메인 (이미 보유)
- ✅ Supabase 프로젝트 (이미 설정됨)
- ✅ Xserver SMTP 정보 (이미 사용 중)

### 현재 인프라 구조

```
┌─────────────────────────────────────────────────────────────┐
│                      사용자 인프라                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Xserver    │    │   Vercel     │    │   Supabase   │  │
│  │   도메인     │───▶│   웹호스팅   │◀──▶│   데이터베이스 │  │
│  │              │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                                     │            │
│         └─────────────────────────────────────┘            │
│                    (메일 SMTP는 Xserver 그대로)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Vercel에 프로젝트 배포

### 1단계: Vercel 계정 생성

1. [vercel.com](https://vercel.com) 접속
2. **"Sign Up"** 클릭
3. **"Continue with GitHub"** 클릭
4. GitHub 권한 승인

### 2단계: 프로젝트 가져오기

1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭

2. GitHub 리포지토리 선택
   - 개인 리포지토리 또는 조직 리포지토리
   - **"Import"** 클릭

3. 프로젝트 설정 확인

```bash
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: (Next.js가 자동 감지)
Install Command: npm ci
Node.js Version: 20.x (또는 18.x)
```

4. **"Deploy"** 클릭

### 3단계: 첫 배포 완료

- 자동으로 빌드 시작 (약 1~2분)
- 배포 완료 후 `https://your-project.vercel.app` 생성
- **"Visit"** 버튼으로 배포된 사이트 확인

---

## 환경 변수 설정

### Vercel 대시보드에서 설정

1. 프로젝트 → **Settings** → **Environment Variables**
2. 각 변수 추가

#### Supabase 환경 변수

```bash
# Supabase URL
SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon Key (공개)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (비밀)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js Public (클라이언트에서 사용)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**값 가져오는 방법:**
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **API**
4. URL과 keys 복사

#### 이메일 SMTP 환경 변수 (Xserver)

```bash
# SMTP 설정 (Xserver)
SMTP_HOST=xxx.xserver.jp
SMTP_PORT=587
SMTP_USER=your-email@your-domain.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=Epackage Lab

# 또는 Resend 사용하는 경우
RESEND_API_KEY=re_xxxxxxxxxxxxx

# SendGrid 사용하는 경우
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
```

**Xserver SMTP 정보 확인:**
1. Xserver 서버 패널 로그인
2. **메일 설정** → **SMTP 설정**
3. SMTP 호스트, 포트, 사용자 정보 확인

#### 기타 환경 변수

```bash
# Twilio (SMS 사용 시)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+81xxxxxxxxxx
```

### 3단계: 환경 적용

1. 각 환경 선택
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development** (선택)

2. **"Save"** 클릭

3. 재배포
   - 설정 후 자동으로 재배포되거나
   - **Deployments** → 최신 배포 → **"Redeploy"** 클릭

---

## Xserver 도메인 연결

### 방법: CNAME 방식 (메일 서버 유지)

Xserver 네임서버를 유지하며 Vercel에만 연결합니다.

### 1단계: Vercel에서 도메인 추가

1. Vercel 프로젝트 → **Settings** → **Domains**
2. 도메인 입력: `your-domain.com`
3. **"Add"** 클릭

### 2단계: Xserver DNS 설정

Xserver 서버 패널 → DNS 설정

#### A. 루트 도메인 (@)

```
호스트명: @ (또는 비워둠)
타입: A
값: 76.76.21.21
TTL: 3600
```

#### B. www 서브도메인

```
호스트명: www
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

예상 결과:
```
your-domain.com.  IN  A  76.76.21.21
www.your-domain.com. IN  A  76.76.21.21
```

### 4단계: Vercel에서 SSL 확인

- Vercel이 자동으로 SSL 인증서 발급
- 대시보드에서 **"Valid Configuration"** 확인
- HTTPS 접속 테스트: `https://your-domain.com`

---

## Supabase 설정

### 1. CORS 설정

Supabase Dashboard → Settings → **API** → **CORS**

```
Allowed origins:
https://your-domain.com
https://www.your-domain.com
https://your-project.vercel.app
```

### 2. Redirect URLs (인증)

Supabase Dashboard → **Authentication** → **URL Configuration**

```
Redirect URLs (allow list):
https://your-domain.com/auth/callback
https://www.your-domain.com/auth/callback
https://your-project.vercel.app/auth/callback
```

### 3. Site URL

Supabase Dashboard → **Authentication** → **URL Configuration**

```
Site URL: https://your-domain.com
```

### 4. Email Templates 확인

인증 이메일 템플릿의 URL을 본 도메인으로 확인:

```
{{ .ConfirmationURL }}?redirect_to=https://your-domain.com/auth/confirm
```

---

## 메일 SMTP 설정

### Xserver SMTP 그대로 사용

Xserver 메일 서버를 그대로 사용합니다.

#### SMTP 정보 확인

```bash
호스트: xxx.xserver.jp (또는 svxxx.xserver.jp)
포트: 587 (TLS) 또는 465 (SSL)
사용자명: your-email@your-domain.com
비밀번호: Xserver 메일 비밀번호
```

#### 프로젝트에서 SMTP 사용

이미 프로젝트에서 설정되어 있다면 추가 작업 불필요.

환경 변수만 Vercel에 설정하면 됩니다:

```bash
SMTP_HOST=xxx.xserver.jp
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@your-domain.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@your-domain.com
```

### 메일 테스트

```bash
# 배포 후 연락처 폼 테스트
1. https://your-domain.com/contact 접속
2. 문의 폼 작성
3. 제출
4. 이메일 수신 확인
```

---

## 배포 후 확인

### 체크리스트

#### 1. 기본 기능

- [ ] 홈페이지 접속: `https://your-domain.com`
- [ ] HTTPS 정상 작동
- [ ] 페이지 라우팅 정상
- [ ] 정적 파일 로드 (이미지, CSS, JS)

#### 2. 인증 기능

- [ ] 회원가입 작동
- [ ] 이메일 인증 수신 (Xserver SMTP)
- [ ] 로그인 작동
- [ ] 로그아웃 작동

#### 3. API 기능

- [ ] 견적 시스템 작동
- [ ] 제품 검색 작동
- [ ] 문의 제출 작동
- [ ] Supabase 연결 확인

#### 4. 관리자 기능

- [ ] 관리자 로그인
- [ ] 대시보드 데이터 표시
- [ ] 주문 관리 작동

#### 5. 이메일

- [ ] 문의 이메일 수신 (Xserver SMTP)
- [ ] 인증 이메일 발송
- [ ] 알림 이메일 발송

---

## 자동 배포 설정

### Git 푸시로 자동 배포

```bash
# main 브랜치에 푸시하면 자동 배포
git add .
git commit -m "feat: 새 기능 추가"
git push origin main

# Vercel에서 자동으로 빌드 & 배포
```

### 프리뷰 배포

```bash
# feature 브랜치에 푸시하면 프리뷰 URL 생성
git checkout -b feature/new-feature
git push origin feature/new-feature

# 프리뷰 URL:
# https://your-project-feature-new-feature.vercel.app
```

---

## 트러블슈팅

### 문제: 배포 실패

```bash
# 로그 확인
Vercel 대시보드 → Deployments → 실패한 배포 → Build Logs
```

**일반적인 원인:**
- 환경 변수 미설정
- 의존성 설치 실패
- 빌드 타임아웃 (45분 제한)

**해결책:**
```bash
# 로컬에서 빌드 테스트
npm run build

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 문제: API Routes 404

```bash
# 확인 사항
1. src/app/api/ 경로 확인
2. 파일명이 route.ts인지 확인
3. export async function GET/POST 등 확인
```

### 문제: 환경 변수 작동 안 함

```bash
# Vercel 대시보드에서 Environment Variables 재확인
# .env.local은 로컬 전용, 배포에는 영향 없음

# 배포 후 환경 변수 확인
Vercel 대시보드 → Deployments → 최신 배포 → Environment
```

### 문제: Supabase 연결 오류

```bash
# 확인 사항
1. SUPABASE_URL 정확한지
2. SUPABASE_ANON_KEY 정확한지
3. CORS 설정 확인
4. Redirect URLs 확인

# 테스트
# Vercel 대시보드 → Logs → Runtime Logs
```

### 문제: 이메일 발송 안 됨

```bash
# 확인 사항
1. SMTP 환경 변수 확인
2. Xserver SMTP 정보 확인
3. 방화벽에서 587/465 포트 열려있는지 확인

# 테스트
# 연락처 폼에서 실제로 전송해보기
```

### 문제: 도메인 연결 안 됨

```bash
# DNS 전파 확인
dig your-domain.com
dig www.your-domain.com

# 예상 결과:
# your-domain.com.  IN  A  76.76.21.21

# 전파 안 되면 5~30분 기다리기
```

### 문제: HTTPS 작동 안 함

```bash
# Vercel 대시보드 → Domains
# "Valid Configuration" 상태 확인

# "Configuration Error" 라면:
# 1. DNS 레코드 확인
# 2. A 레코드: 76.76.21.21
# 3. CNAME 레코드: cname.vercel-dns.com
```

---

## 모니터링

### Vercel 대시보드

1. **Deployments** - 배포 내역 및 상태
2. **Logs** - 실시간 로그
3. **Analytics** - 방문자 수 (기본 제공)
4. **Usage** - Bandwidth 사용량 확인

### Bandwidth 모니터링

```bash
Vercel 대시보드 → Settings → Usage

# 확인할 항목
- Bandwidth: 100GB 한도 중 얼마나 사용했는지
- Edge Functions: 실행 횟수
- Build time: 빌드 시간

# 목표
# - 50GB 미만: 안전 ✅
# - 50~80GB: 주의 ⚠️
# - 80GB+: Pro 플랜 검토
```

---

## 비용 요약

### 월 1만 방문자 기준

| 항목 | 비용 |
|------|------|
| **Vercel 무료 플랜** | **0원** |
| Xserver 도메인 | 이미 보유 |
| Xserver SMTP | 이미 사용 중 |
| Supabase 무료 플랜 | **0원** |
| **월 합계** | **0원** |

### Vercel Pro 필요 시점

```
월 방문자 8만 명 초과 시
(현재 1만 명의 8배)
```

---

## 요약

### 배포 단계

```
1. Vercel 계정 생성 (5분)
2. GitHub 리포지토리 연동 (2분)
3. 프로젝트 배포 (3분)
4. 환경 변수 설정 (5분)
5. 도메인 연결 (10분 + DNS 전파 대기)
6. Supabase 설정 (5분)
7. 테스트 (10분)

총 소요 시간: 약 40분 (DNS 전파 대기 제외)
```

### 최종 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    배포 후 인프라                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Xserver    │    │   Vercel     │    │   Supabase   │  │
│  │   도메인     │───▶│   웹호스팅   │◀──▶│   데이터베이스 │  │
│  │   + SMTP     │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
│  비용: 0원 + 이미 비용 (도메인)                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 다음 단계

1. **Vercel** 접속
2. **GitHub** 연동
3. **배포** 시작
4. **완료!** 🎉

---

## 추가 자료

### 공식 문서

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

### 도움말

- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Supabase Discord](https://supabase.com/discord)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
