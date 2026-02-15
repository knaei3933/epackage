# B2B 시스템 프로덕션 배포 체크리스트

## 배포 전 준비 (Pre-Deployment)

### 1. 데이터베이스 설정
- [ ] Supabase 프로젝트 생성
- [ ] RLS (Row Level Security) 정책 설정
  - [ ] profiles 테이블 RLS
  - [ ] companies 테이블 RLS
  - [ ] orders 테이블 RLS
  - [ ] quotations 테이블 RLS
  - [ ] contracts 테이블 RLS
  - [ ] work_orders 테이블 RLS
  - [ ] production_logs 테이블 RLS
  - [ ] sample_requests 테이블 RLS
  - [ ] order_status_history 테이블 RLS
  - [ ] order_audit_log 테이블 RLS
- [ ] Storage 버킷 생성
  - [ ] contracts (계약서 PDF)
  - [ ] work-orders (작업표준서 PDF)
  - [ ] quotations (견적서 PDF)
  - [ ] production-photos (생산 사진)
  - [ ] stock-in-photos (입고 사진)
  - [ ] signatures (전자서명 이미지)
- [ ] 데이터베이스 함수/트리거 생성
  - [ ] calculate_quotation_total()
  - [ ] calculate_order_total()
  - [ ] update_quotation_updated_at()

### 2. 환경 변수 설정
- [ ] `.env.production` 파일 생성
- [ ] SendGrid API 키 설정
- [ ] Supabase URL 및 키 설정
- [ ] 애플리케이션 URL 설정
- [ ] Analytics ID 설정 (선택)

### 3. 이메일 서비스 설정
- [ ] SendGrid API 키 발급
- [ ] 발신자 인증 (Sender Verification)
- [ ] 이메일 템릿 설정
  - [ ] 견적 요청 알림
  - [ ] 견적 승인 알림
  - [ ] 계약서 서명 요청
  - [ ] 계약서 서명 완료
  - [ ] 생산 시작 알림
  - [ ] 출하 완료 알림

### 4. 코드 준비
- [ ] 모든 타입 스크립트 에러 해결
- [ ] ESLint 경고 해결
- [ ] 번들 크기 확인 (< 250KB JS)
- [ ] 사용하지 않는 의존성 제거
- [ ] 보안 취약점 검사

## 배포 단계 (Deployment)

### 1. 빌드
```bash
# 프로덕션 빌드
npm run build

# 번들 분석
ANALYZE=true npm run build
```

### 2. 빌드 결과 확인
- [ ] 빌드 성공 (에러 없음)
- [ ] JS 번들 크기 < 250KB
- [ ] CSS 번들 크기 < 50KB
- [ ] 페이지 수준 번들 크기 확인
- [ ] Lighthouse 점수 확인 (> 90)

### 3. Vercel에 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로덕션 배포
vercel --prod

# 또는 GitHub 연동 후 자동 배포
```

### 4. 환경 변수 설정 (Vercel Dashboard)
- [ ] Vercel 프로젝트 설정 접속
- [ ] Environment Variables 설정
  - [ ] SENDGRID_API_KEY
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] ADMIN_EMAIL
  - [ ] FROM_EMAIL
  - [ ] NEXT_PUBLIC_APP_URL

### 5. 도메인 설정
- [ ] 커스텀 도메인 연결
- [ ] SSL 인증서 확인
- [ ] DNS 레코드 설정

## 배포 후 검증 (Post-Deployment)

### 1. 기능 테스트
- [ ] 홈페이지 로딩
- [ ] 회원가입/로그인
- [ ] B2B 견적 요청
- [ ] 관리자 대시보드 접속
- [ ] 견적 승인 기능
- [ ] 작업표준서 생성
- [ ] 계약서 생성
- [ ] 전자서명 기능
- [ ] 생산 관리
- [ ] 입고 처리
- [ ] 출하 처리
- [ ] 주문 추적
- [ ] 문서 다운로드

### 2. 성능 테스트
- [ ] Lighthouse 점수 (> 90)
  - [ ] Performance
  - [ ] Accessibility
  - [ ] Best Practices
  - [ ] SEO
- [ ] Core Web Vitals
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] API 응답 시간 (< 500ms)

### 3. 보안 테스트
- [ ] RLS 정책 작동 확인
- [ ] 인증되지 않은 접근 차단
- [ ] 권한 없는 접근 차단
- [ ] XSS 방지
- [ ] CSRF 방지
- [ ] SQL Injection 방지

### 4. 모니터링 설정
- [ ] Vercel Analytics
- [ ] Google Analytics (선택)
- [ ] Web Vitals 모니터링
- [ ] 에러 로깅
- [ ] 성능 모니터링

## 롤백 계획 (Rollback Plan)

### 롤백 시나리오
1. **치명적 버그 발견**
   - 즉시 이전 버전으로 롤백
   - `vercel rollback [deployment-url]`

2. **데이터베이스 이슈**
   - 데이터베이스 백업 복원
   - RLS 정책 재검토

3. **성능 저하**
   - 번들 크기 분석
   - CDN 캐시 확인
   - 데이터베이스 쿼리 최적화

### 롤백 절차
```bash
# Vercel에서 이전 배포로 롤백
vercel rollback [deployment-url]

# 또는 GitHub에서 이전 커밋으로 되돌리기
git revert HEAD
git push origin main
```

## 알림 (Notifications)

### 배포 완료 후 알림 대상
- [ ] 개발 팀
- [ ] 운영 팀
- [ ] 관리자

### 알림 내용
- [ ] 배포 시간
- [ ] 배포 버전
- [ ] 변경 사항
- [ ] 알려진 이슈
- [ ] 롤백 절차

## 정기 유지보수 (Maintenance)

### 매일
- [ ] 에러 로그 확인
- [ ] 성능 모니터링

### 매주
- [ ] 번들 크기 확인
- [ ] 보안 업데이트 확인

### 매월
- [ ] 데이터베이스 백업 확인
- [ ] 사용 현상 분석
- [ ] 개선 사항 도출

## 비상 연락처 (Emergency Contacts)

| 역할 | 이름 | 연락처 |
|------|------|--------|
| 개발 리드 | | |
| 운영 담당자 | | |
| DBA | | |
| 인프라 담당자 | | |
