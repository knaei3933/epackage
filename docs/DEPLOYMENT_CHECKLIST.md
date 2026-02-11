# Vercel 배포 체크리스트

## 🔧 필수 설정 (배포 전 완료 필수)

### 1. Vercel 프로젝트 환경변수 설정

Vercel Dashboard → Settings → Environment Variables 에서 다음 변수들을 설정하세요:

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

#### 프로덕션 설정
```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://package-lab.com
NEXT_PUBLIC_DEV_MODE=false
ENABLE_DEV_MOCK_AUTH=false
DISABLE_RATE_LIMIT=false
```

#### NextAuth 설정
```
NEXTAUTH_SECRET=openssl rand -base64 32 (생성된 값 사용)
NEXTAUTH_URL=https://package-lab.com
```

#### Cron Job Secret
```
CRON_SECRET=generate-secure-random-string
```

### 2. 프로덕션 도메인 설정

미들웨어 `ALLOWED_ORIGINS` 에 프로덕션 도메인이 자동으로 추가되도록 설정했습니다:
- `NEXT_PUBLIC_SITE_URL` 환경변수에 프로덕션 도메인 설정

### 3. Supabase RLS 정책 확인

프로덕션 배포 전 Supabase Dashboard에서:
- [ ] RLS (Row Level Security) 정책이 활성화되어 있는지 확인
- [ ] Service Role Key가 필요한 API에서만 사용되는지 확인
- [ ] Anon Key로 접근 가능한 데이터가 제한적인지 확인

## 🚀 배포 단계

### 1단계: Vercel 프로젝트 연결
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel link
```

### 2단계: 로컬 빌드 테스트
```bash
npm run build:production
```
- 빌드 에러가 없는지 확인
- `ignoreBuildErrors: true` 설정을 제거하고 타입 에러 수정 권장

### 3단계: 프리뷰 배포
```bash
vercel --env NEXT_PUBLIC_DEV_MODE=false
```
- 프리뷰 환경에서 먼저 테스트

### 4단계: 프로덕션 배포
```bash
vercel --prod
```

## 📊 배포 후 확인 사항

### 기능 테스트
- [ ] 홈페이지 로딩
- [ ] 회원가입/로그인
- [ ] 관리자 대시보드 접속
- [ ] API 엔드포인트 동작
- [ ] 이메일 발송 기능
- [ ] PDF 생성 기능
- [ ] 파일 업로드 기능

### 성능 모니터링
- [ ] Vercel Analytics 확인
- [ ] Lighthouse 스코어 확인
- [ ] Core Web Vitals 확인

### 보안 확인
- [ ] HTTPS 정상 작동
- [ ] 보안 헤더 설정 확인
- [ ] CSP 정책 확인
- [ ] CSRF 보호 동작 확인

## 🔥 성능 최적화 (선택 사항)

### 높은 우선순위
1. **Async Waterfalls 해결** - API 응답 속도 5배 개선
2. **캐싱 전략 추가** - DB 부하 80% 감소
3. **Lucide 아이콘 최적화** - 번들 사이즈 100-200KB 감소

### 중간 우선순위
4. **동적 임포트** - 초기 페이지 로드 속도 개선
5. **이벤트 리스너 정리** - 메모리 누수 방지

## 🆘 문제 해결

### 빌드 에러
```bash
# 타입 에러 무시 설정은 next.config.ts에 있음
# 프로덕션에서는 에러를 수정하는 것을 권장
```

### 환경변수 문제
- Vercel Dashboard에서 환경변수가 설정되었는지 확인
- 재배포 필요: 환경변수 변경 후 `vercel --prod`

### 데이터베이스 연결
- Supabase 프로젝트가 일시중지되지 않았는지 확인
- Connection pool 설정 확인 (serverless 환경)

### CORS 문제
- `ALLOWED_ORIGINS` 에 올바른 도메인이 포함되어 있는지 확인
- `NEXT_PUBLIC_SITE_URL` 환경변수 확인

## 📝 참고 자료

- [Vercel Next.js 공식 문서](https://vercel.com/docs/frameworks/nextjs)
- [Next.js 프로덕션 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase Vercel 통합](https://supabase.com/docs/guides/deployment/vercel)
