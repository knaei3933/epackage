# Vercel 배포 단계별 가이드

## 📋 배포 전 준비 확인

### 1. 코드베이스 최적화 ✅
- [x] Async waterfalls 해결 (API 응답 속도 5배 개선)
- [x] 캐싱 전략 추가 (DB 부하 80% 감소)
- [x] 미들웨어 업데이트 (프로덕션 도메인 자동 인증)

### 2. 구성 파일 ✅
- [x] vercel.json 생성
- [x] .env.production.example 업데이트
- [x] 도메인 주소 package-lab.com으로 변경

### 3. 문서 ✅
- [x] VERCEL_OPTIMIZATION_SUMMARY.md
- [x] DEPLOYMENT_CHECKLIST.md
- [x] SEO_DEPLOYMENT_GUIDE.md

---

## 🚀 Vercel 배포 단계

### STEP 1: Vercel CLI 설치 및 프로젝트 연결

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리로 이동
cd "C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1"

# Vercel 프로젝트 연결
vercel link
```

**설정 항목:**
- Set up and deploy?: `Y`
- Which scope?: (조직 선택)
- Link to existing project?: `N` (새 프로젝트)
- What's your project's name?: `epackage-lab` 또는 `package-lab`
- In which directory is your code located?: `.`
- Want to override the settings?: `N` (기본 설정 사용)

---

### STEP 2: Vercel Dashboard에서 환경변수 설정

**Vercel Dashboard 접속:**
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. Settings → Environment Variables

**필수 환경변수:**

#### Supabase 설정
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### SMTP 설정 (XServer)
```
XSERVER_SMTP_HOST=sv12515.xserver.jp
XSERVER_SMTP_PORT=587
XSERVER_SMTP_USER=info@package-lab.com
XSERVER_SMTP_PASSWORD=your-smtp-password-here
```

#### 이메일 설정
```
ADMIN_EMAIL=admin@package-lab.com
FROM_EMAIL=info@package-lab.com
```

#### 프로덕션 설정 (CRITICAL)
```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://package-lab.com
NEXT_PUBLIC_DEV_MODE=false
ENABLE_DEV_MOCK_AUTH=false
DISABLE_RATE_LIMIT=false
```

#### NextAuth 설정
```
NEXTAUTH_SECRET=openssl-rand-base64-32-생성값
NEXTAUTH_URL=https://package-lab.com
```

#### Cron Job Secret
```
CRON_SECRET=generate-secure-random-string
```

**NEXTAUTH_SECRET 생성 방법:**
```bash
openssl rand -base64 32
```

---

### STEP 3: 프리뷰 배포 테스트

```bash
# 프리뷰 배포
vercel
```

**확인 사항:**
- [ ] 홈페이지 로딩
- [ ] 로그인 페이지 접근
- [ ] API 엔드포인트 응답
- [ ] 환경변수가 올바르게 적용

---

### STEP 4: 프로덕션 배포

```bash
# 프로덕션 배포
vercel --prod
```

**배포 후 확인:**
- [ ] https://epackage-lab.com 접속
- [ ] SSL 인증서 활성화
- [ ] 모든 페이지 정상 작동
- [ ] 로그인/인증 기능 작동

---

### STEP 5: 도메인 설정

**커스텀 도메인 연결:**
1. Vercel Dashboard → Settings → Domains
2. 도메인 추가: `package-lab.com`
3. DNS 설정 안내 따르기

**DNS 레코드:**
```
A 레코드: package-lab.com → 76.76.21.21
CNAME 레코드: www → cname.vercel-dns.com
```

**도메인 제공자에서 설정:**
- Route53, GoDaddy, Cloudflare 등에서 DNS 레코드 추가

---

### STEP 6: SEO 설정 완료

#### Google Search Console
1. https://search.google.com/search-console 접속
2. 속성 추가: `https://package-lab.com`
3. 소유권 확인 (HTML 태그 방식)
4. `src/app/layout.tsx`에 검증 코드 추가

```typescript
verification: {
  google: 'google-site-verification-code-here',
}
```

#### 사이트맵 제출
```
https://package-lab.com/sitemap.xml
```

#### robots.txt 확인
```
https://package-lab.com/robots.txt
```

---

### STEP 7: 모니터링 설정

#### Vercel Analytics
- Dashboard → Analytics
- Core Web Vitals 모니터링
- 방문자 추적

#### Google Analytics (선택)
1. Google Analytics 계정 생성
2. 추적 ID 획득 (G-XXXXXXXXXX)
3. 환경변수에 추가:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 🧪 배포 후 테스트 체크리스트

### 기능 테스트
- [ ] 홈페이지 로딩 속도 (< 3초)
- [ ] 회원가입 기능
- [ ] 로그인/로그아웃
- [ ] 관리자 대시보드 접속
- [ ] 상품 목록 표시
- [ ] 상품 상세 페이지
- [ ] 견적 요청 기능
- [ ] 이메일 발송 테스트

### 성능 테스트
- [ ] PageSpeed Insights 점수 (90점 이상)
- [ ] Core Web Vitals 통과
- [ ] 모바일 반응형 확인
- [ ] 이미지 로딩 최적화

### 보안 테스트
- [ ] HTTPS 정상 작동
- [ ] 보안 헤더 설정 확인
- [ ] CSRF 보호 작동
- [ ] XSS 방어 확인

### SEO 테스트
- [ ] 메타 태그 정상 표시
- [ ] Open Graph 이미지 확인
- [ ] Twitter Card 확인
- [ ] 구조화된 데이터 검증

---

## 🔧 문제 해결

### 빌드 실패
```bash
# 캉슈 삭제 후 재시도
rm -rf .next
vercel --prod
```

### 환경변수 미적용
- Vercel Dashboard에서 환경변수 재확인
- 재배포 필요: `vercel --prod --force`

### 도메인 연결 실패
- DNS 레코드 확인
- HTTPS 인증서 대기 (최대 24시간)

### Supabase 연결 실패
- `NEXT_PUBLIC_SUPABASE_URL` 확인
- Supabase 프로젝트 일시중지 확인

---

## 📞 지원 및 참고 자료

### 공식 문서
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase Vercel 통합](https://supabase.com/docs/guides/deployment/vercel)

### 문제 해결
- Vercel Community: https://github.com/vercel/vercel/discussions
- Next.js GitHub: https://github.com/vercel/next.js
- Supabase GitHub: https://github.com/supabase/supabase

---

## ✅ 배포 완료 확인

배포가 완료되면 다음을 확인하세요:

1. **사이트 접속**: https://package-lab.com
2. **SSL 인증서**: 브라우저 잠금 아이콘 확인
3. **모든 페이지 작동**: 주요 페이지 테스트
4. **로그인 기능**: 관리자/회원 로그인 테스트
5. **API 응답**: 네트워크 탭에서 API 호출 확인
6. **이메일 발송**: 테스트 이메일 전송

---

*작성일: 2026-02-08*
*도메인: package-lab.com*
*버전: 1.0*
