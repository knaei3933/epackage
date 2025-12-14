# TASK-010: 론칭 및 배포 (Deployment Guide)

## 프로젝트 개요

Epackage Lab 홈페이지 재설계 프로젝트의 최종 배포 문서입니다. X서버 호스팅 환경에 Next.js 16 애플리케이션을 배포하고 운영하는 전 과정을 문서화합니다.

**프로젝트 현황**: 9개 태스크 완료, 프로덕션 준비 상태: 90%
**배포 대상**: X서버 (일국 호스팅)
**타겟 시장**: 일본 B2B 시장

---

## 📋 배포 체크리스트

### 사전 준비사항
- [x] 프로덕션 빌드 최적화 및 Turbopack-Webpack 전환
- [x] API 라우트 params 타입 수정 (50+개 파일)
- [x] X서버 호스팅 환경 설정 및 배포 준비
- [x] 도메인 설정 및 SSL 인증서/HTTPS 구성
- [x] 성능 모니터링 시스템 구축 (GA4, 에러 로깅, uptime)
- [x] 백업 및 복구 시스템 구현
- [x] 기술 문서화 및 운영 매뉴얼 작성

### 배포 파일 구조
```
epackage-lab-web/
├── scripts/                    # 배포 스크립트
│   ├── deploy.sh              # 메인 배포 스크립트
│   ├── setup-ssl.sh           # SSL 설정 스크립트
│   ├── setup-monitoring.sh    # 모니터링 설정 스크립트
│   └── backup-system.sh       # 백업 시스템 스크립트
├── nginx.conf                 # Nginx 설정
├── pm2.config.js              # PM2 설정
├── src/lib/
│   ├── analytics.ts           # GA4 및 성능 모니터링
│   └── monitoring.ts          # 에러 로깅 및 모니터링
└── docs/
    └── TASK-010-Deployment.md # 이 문서
```

---

## 🚀 배포 과정

### 1. 서버 환경 준비

#### 최소 사양
- **OS**: Ubuntu 20.04 LTS 이상
- **CPU**: 2코어 이상
- **RAM**: 4GB 이상
- **스토리지**: 50GB SSD 이상
- **네트워크**: 일본 내 고속 접속 최적화

#### 필수 소프트웨어 설치
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 18+ 설치
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 필수 도구 설치
sudo apt install -y nginx git certbot python3-certbot-nginx
sudo apt install -y htop iotop nethogs sysstat

# PM2 전역 설치
sudo npm install -g pm2
```

### 2. 애플리케이션 배포

#### 배포 스크립트 실행
```bash
# 배포 스크립트 실행
sudo ./scripts/deploy.sh
```

#### 수동 배포 순서
1. **애플리케이션 디렉토리 생성**
   ```bash
   sudo mkdir -p /var/www/epackage-lab-web
   sudo chown www-data:www-data /var/www/epackage-lab-web
   cd /var/www/epackage-lab-web
   ```

2. **소스 코드 배포**
   ```bash
   # git clone 또는 파일 복사
   sudo -u www-data npm install --production
   sudo -u www-data npm run build
   ```

3. **환경 변수 설정**
   ```bash
   # .env.local 파일 설정
   sudo cp .env.local.example .env.local
   sudo nano .env.local
   ```

4. **PM2 애플리케이션 시작**
   ```bash
   sudo -u www-data pm2 start pm2.config.js --env production
   sudo -u www-data pm2 save
   ```

### 3. Nginx 설정

#### 설정 파일 적용
```bash
# Nginx 설정 복사
sudo cp nginx.conf /etc/nginx/sites-available/epackage-lab-web

# 사이트 활성화
sudo ln -s /etc/nginx/sites-available/epackage-lab-web /etc/nginx/sites-enabled/

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

#### 주요 설정 내용
- **HTTP → HTTPS 리디렉션**
- **정적 파일 캐싱 최적화**
- **API 라우트 프록시 설정**
- **보안 헤더 설정**
- **GZIP 압축 활성화**

### 4. SSL 인증서 설정

#### Let's Encrypt 인증서 발급
```bash
# SSL 설정 스크립트 실행
sudo ./scripts/setup-ssl.sh

# 또는 수동 실행
sudo certbot --nginx -d epackage-lab.com -d www.epackage-lab.com
```

#### SSL 설정 내용
- **자동 갱신 설정**
- **보안 강화 (HSTS, 보안 헤더)**
- **최신 TLS 프로토콜 사용**
- **OCSP Stapling 활성화**

---

## 🔍 성능 모니터링

### 1. 모니터링 시스템 설정

#### 모니터링 스크립트 실행
```bash
sudo ./scripts/setup-monitoring.sh
```

#### 모니터링 구성 요소
- **Uptime 모니터링**: 5분 간격 상태 확인
- **성능 지표**: CPU, 메모리, 디스크 사용률
- **응답 시간 모니터링**: API 및 페이지 로드 시간
- **에러 로깅**: 자동 에러 감지 및 알림
- **로그 관리**: 자동 로그 로테이션 및 보관

### 2. Google Analytics 4 연동

#### 설정 방법
```typescript
// .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

// 사용 예시
import { sendPageView, sendEvent } from '@/lib/analytics'

sendPageView(window.location.pathname)
sendEvent('contact_form_submit', { form_type: 'inquiry' })
```

#### 추적 이벤트
- **연락처 폼**: 조회, 시작, 제출, 성공, 에러
- **샘플 요청**: 조회, 시작, 제출, 성공, 에러
- **카탈로그**: 조회, 상세보기, 필터링, 검색
- **견적**: 계산, PDF 생성, 이메일 발송
- **성능**: 페이지 로드, API 응답 시간

### 3. 실시간 모니터링 대시보드
- **URL**: `http://your-server-ip:8080`
- **기본 인증**: 설정된 사용자 이름/비밀번호
- **기능**: 상태 모니터링, 성능 지표, 최근 에러, 시스템 리소스

---

## 💾 백업 및 복구

### 1. 자동 백업 설정

#### 백업 시스템 초기화
```bash
sudo ./scripts/backup-system.sh setup
```

#### 백업 일정
- **일일 백업**: 매일 새벽 2시 (7일 보관)
- **주간 백업**: 매주 일요일 새벽 3시 (30일 보관)
- **월간 백업**: 매월 1일 새벽 4시 (365일 보관)

#### 백up 내용
- **애플리케이션 파일**: 소스 코드 및 빌드 결과물
- **데이터베이스**: PostgreSQL 백업 (사용 시)
- **설정 파일**: Nginx, PM2, 환경 변수 등
- **클라우드 저장**: AWS S3에 원격 백업 (선택사항)

### 2. 복구 절차

#### 파일 복구
```bash
# 사용 가능한 백업 목록 확인
sudo ./scripts/backup-system.sh list

# 파일 복구
sudo ./scripts/backup-system.sh restore /path/to/backup.tar.gz files
```

#### 데이터베이스 복구
```bash
# 데이터베이스 복구
sudo ./scripts/backup-system.sh restore /path/to/backup.sql.gz database
```

#### 설정 복구
```bash
# 설정 파일 복구
sudo ./scripts/backup-system.sh restore /path/to/config.tar.gz config
```

---

## 🛠️ 운영 및 유지보수

### 1. 정기 점검 항목

#### 매일 확인
- [ ] 애플리케이션 상태 확인
- [ ] 에러 로그 확인
- [ ] 성능 지표 확인
- [ ] 백업 정상 실행 확인

#### 매주 확인
- [ ] SSL 인증서 유효기간 확인
- [ ] 시스템 리소스 사용량 확인
- [ ] 로그 파일 크기 확인
- [ ] 보안 업데이트 확인

#### 매월 확인
- [ ] 전체 백업 테스트
- [ ] 성능 최적화 검토
- [ ] 사용자 통계 분석
- [ ] 비즈니스 요구사항 검토

### 2. 주요 명령어

#### 애플리케이션 관리
```bash
# 애플리케이션 상태 확인
pm2 status

# 애플리케이션 재시작
pm2 restart epackage-lab-web

# 로그 확인
pm2 logs epackage-lab-web

# 애플리케이션 재배포
cd /var/www/epackage-lab-web
sudo -u www-data git pull
sudo -u www-data npm install --production
sudo -u www-data npm run build
pm2 restart epackage-lab-web
```

#### Nginx 관리
```bash
# 설정 테스트
sudo nginx -t

# 재시작
sudo systemctl restart nginx

# 설정 리로드
sudo systemctl reload nginx

# 상태 확인
sudo systemctl status nginx
```

#### SSL 인증서 관리
```bash
# 인증서 상태 확인
sudo certbot certificates

# 수동 갱신
sudo certbot renew

# 갱신 테스트
sudo certbot renew --dry-run
```

### 3. 문제 해결 가이드

#### 일반적인 문제들

**1. 애플리케이션이 시작되지 않을 경우**
```bash
# PM2 로그 확인
pm2 logs epackage-lab-web

# 환경 변수 확인
cat /var/www/epackage-lab-web/.env.local

# 포트 충돌 확인
sudo netstat -tlnp | grep :3000
```

**2. Nginx 502 Bad Gateway 에러**
```bash
# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log

# PM2 프로세스 상태 확인
pm2 status

# 방화벽 설정 확인
sudo ufw status
```

**3. SSL 인증서 관련 문제**
```bash
# 인증서 유효기간 확인
openssl x509 -in /etc/letsencrypt/live/epackage-lab.com/cert.pem -text -noout

# Nginx 설정 테스트
sudo nginx -t

# Let's Encrypt 로그 확인
sudo journalctl -u certbot
```

**4. 성능 문제**
```bash
# 시스템 리소스 확인
htop
iotop
nethogs

# 애플리케이션 성능 확인
pm2 monit

# 디스크 공간 확인
df -h
```

---

## 📊 성능 목표 및 KPI

### 1. 성능 목표
- **페이지 로드 시간**: 2.5초 이하 (LCP)
- **최초 입력 지연**: 100ms 이하 (FID)
- **누적 레이아웃 이동**: 0.1 이하 (CLS)
- **API 응답 시간**: 500ms 이하
- **가동 시간**: 99.9% 이상

### 2. 모니터링 KPI
- **일일 방문자 수**: 일본 B2B 타겟
- **폼 제출율**: 연락처 및 샘플 요청
- **페이지 이탈률**: 주요 페이지 기준
- **모바일 vs 데스크톱 비율**
- **주요 국가 접속 비율**

### 3. 보안 목표
- **SSL 인증서**: 항상 유효
- **보안 헤더**: 모든 요청에 적용
- **XSS 방어**: CSP 정책 적용
- **SQL 인젝션**: 파라미터화된 쿼리 사용
- **CSRF 방지**: 토큰 기반 보안

---

## 🎯 향후 개선 계획

### 1. 단기 개선 (1-3개월)
- **CDN 도입**: 일본 내 콘텐츠 전송 속도 향상
- **데이터베이스 연동**: Supabase 또는 PostgreSQL 완전 연동
- **검색 엔진 최적화**: 일본어 SEO 추가 최적화
- **성능 모니터링 강화**: 더 상세한 사용자 행동 분석

### 2. 중기 개선 (3-6개월)
- **다국어 지원**: 영어, 중국어 버전 추가
- **고객 관리 시스템**: CRM 기능 강화
- **자동화된 테스트**: CI/CD 파이프라인 구축
- **마이크로서비스**: 기능별 서비스 분리

### 3. 장기 개선 (6-12개월)
- **AI 기반 추천**: 제품 추천 시스템
- **실시간 채팅**: 고객 지원 채팅 시스템
- **분석 대시보드**: 관리자용 통계 대시보드
- **모바일 앱**: iOS/Android 앱 개발

---

## 📞 연락처 및 지원

### 기술 지원
- **개발팀**: development@epackage-lab.com
- **시스템 관리자**: admin@epackage-lab.com
- **긴급 연락처**: +81-XX-XXXX-XXXX

### 관련 문서
- **설계 문서**: `docs/DESIGN_SYSTEM.md`
- **API 문서**: `docs/API_DOCUMENTATION.md`
- **사용자 가이드**: `docs/USER_GUIDE.md`
- **성능 최적화**: `PERFORMANCE_OPTIMIZATION.md`

### 외부 링크
- **X서버 관리자**: https://www.xserver.ne.jp/
- **Let's Encrypt**: https://letsencrypt.org/
- **Next.js 문서**: https://nextjs.org/docs
- **PM2 문서**: https://pm2.keymetrics.io/

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2025-11-28 | 초기 배포 문서 작성 | 개발팀 |
| 1.1 | TBD | 첫 운영 피드백 반영 | 운영팀 |
| 1.2 | TBD | 성능 최적화 내용 추가 | 개발팀 |

---

**문서 최종 업데이트**: 2025-11-28
**배포 버전**: v1.0.0
**배포 환경**: X서버 호스팅 (일본)
**문서 관리자**: 개발팀

---

*이 문서는 Epackage Lab 홈페이지 재설계 프로젝트의 TASK-010 론칭 및 배포 과정을 기록한 공식 문서입니다.*