# Epackage Lab Backend Deployment Guide

## 배포 준비 목록

### 1. 환경 설정

#### 데이터베이스 설정
```sql
-- PostgreSQL 데이터베이스 생성
CREATE DATABASE epackage_lab;
CREATE USER epackage_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE epackage_lab TO epackage_user;
```

#### 환경 변수 설정
```bash
# 프로덕션 환경 변수
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=epackage_lab
DB_USER=epackage_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key_very_long_and_secure
JWT_REFRESH_SECRET=your_refresh_token_secret_very_long_and_secure
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. 서버 배포

#### 빌드 및 실행
```bash
# 의존성 설치
npm ci --production

# TypeScript 빌드
npm run build

# 데이터베이스 마이그레이션
npm run migrate

# 서버 시작
npm start
```

### 3. PM2 설정 (프로세스 관리)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'epackage-lab-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# PM2로 애플리케이션 시작
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Nginx 리버스 프록시 설정

```nginx
# /etc/nginx/sites-available/epackage-lab-api
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 5. SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d api.yourdomain.com
```

### 6. 데이터베이스 최적화

#### PostgreSQL 설정
```sql
-- 성능 최적화를 위한 설정
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
SELECT pg_reload_conf();
```

#### 인덱스 생성
```sql
-- 추가 성능 인덱스
CREATE INDEX CONCURRENTLY idx_users_email_active ON users(email, is_active);
CREATE INDEX CONCURRENTLY idx_products_category_active_price ON products(category, is_active, price);
CREATE INDEX CONCURRENTLY idx_quotations_user_status ON quotations(user_id, status);
CREATE INDEX CONCURRENTLY idx_inquiries_status_priority ON inquiries(status, priority);
```

### 7. 모니터링 설정

#### Health Check Endpoint
- `/health` 엔드포인트로 서버 상태 모니터링
- 로그 파일 모니터링: `logs/app.log`
- 에러 로그 모니터링: `logs/error.log`

#### PM2 모니터링
```bash
# PM2 프로세스 상태 확인
pm2 status
pm2 logs epackage-lab-api
pm2 monit

# 자동 재시작 설정
pm2 set pm2-watchdog true
```

### 8. 백업 전략

#### 데이터베이스 백업
```bash
# 일일 백업 스크립트
#!/bin/bash
BACKUP_DIR="/var/backups/epackage_lab"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="epackage_lab"

mkdir -p $BACKUP_DIR
pg_dump -h localhost -U epackage_user $DB_NAME > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# 7일 이전 백업 삭제
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

#### 로그 백업
```bash
# 로그 로테이션 설정
sudo nano /etc/logrotate.d/epackage-lab-api

/var/log/epackage-lab-api/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload epackage-lab-api
    endscript
}
```

### 9. 보안 강화

#### 방화벽 설정
```bash
# UFW 방화벽 설정
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3001/tcp  # 외부에서 직접 접속 차단
```

#### Fail2Ban 설정
```bash
# Fail2Ban 설치 및 설정
sudo apt install fail2ban
sudo nano /etc/fail2ban/jail.local

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 600
```

### 10. 성능 테스트

#### API 응답 시간 테스트
```bash
# Apache Bench 테스트
ab -n 1000 -c 100 http://api.yourdomain.com/health

# curl 응답 시간 측정
curl -o /dev/null -s -w "%{time_total}\n" http://api.yourdomain.com/api/products
```

### 11. CI/CD 설정 (선택사항)

#### GitHub Actions 예시
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build
      run: npm run build

    - name: Deploy to server
      run: |
        # 배포 스크립트
        scp -r dist/* user@server:/path/to/api/
        ssh user@server 'pm2 reload epackage-lab-api'
```

### 12. 롤백 계획

#### 이전 버전으로 롤백
```bash
# PM2를 통한 롤백
pm2 stop epackage-lab-api
pm2 start ecosystem.config.js.backup
pm2 save

# 데이터베이스 롤백
psql -h localhost -U epackage_user -d epackage_lab < backup_20241208.sql
```

### 13. 장애 대응 절차

#### 서버 다운 시 대응
1. 로그 확인: `pm2 logs epackage-lab-api --lines 50`
2. 서비스 재시작: `pm2 restart epackage-lab-api`
3. 데이터베이스 연결 확인
4. 디스크 공간 확인
5. 메모리 사용량 확인

#### 데이터베이스 장애 시 대응
1. PostgreSQL 서비스 상태 확인
2. 연결 풀 상태 확인
3. 쿼리 성능 확인
4. 최신 백업에서 복구

이 가이드를 통해 안정적인 프로덕션 환경에 Epackage Lab Backend API를 배포할 수 있습니다.