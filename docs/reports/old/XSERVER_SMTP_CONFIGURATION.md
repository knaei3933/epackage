# XServer SMTP Configuration Guide

이 가이드는 XServer SMTP를 사용하여 이메일을 발송하도록 Supabase를 설정하는 방법을 설명합니다.

## 환경 변수 설정 (이미 완료됨)

`.env.local` 파일에 XServer SMTP 설정이 이미 추가되어 있습니다:

```bash
# XServer SMTP Settings
XSERVER_SMTP_HOST=sv12515.xserver.jp
XSERVER_SMTP_PORT=587
XSERVER_SMTP_USER=info@package-lab.com
XSERVER_SMTP_PASSWORD=vozlwl1109

# 보내는 사람 정보
FROM_EMAIL=info@package-lab.com
ADMIN_EMAIL=admin@package-lab.com
SAMPLES_CC_EMAIL=samples@package-lab.com
```

## Supabase Dashboard에서 SMTP 설정

### 1. Supabase Dashboard 접속

https://supabase.com/dashboard 로 이동하여 프로젝트를 선택합니다.

### 2. Authentication 설정 이동

1. 왼쪽 메뉴에서 **Authentication** 클릭
2. **Settings** 탭 클릭
3. **SMTP Settings** 섹션 찾기

### 3. XServer SMTP 정보 입력

다음 값을 입력하세요:

| 필드 | 값 |
|------|-----|
| **SMTP Host** | `sv12515.xserver.jp` |
| **SMTP Port** | `587` (TLS) 또는 `465` (SSL) |
| **SMTP User** | `info@package-lab.com` |
| **SMTP Password** | `vozlwl1109` |
| **Sender Email** | `info@package-lab.com` |
| **Sender Name** | `Epackage Lab` |

### 4. Enable Custom SMTP

**Enable Custom SMTP** 스위치를 켭니다 (ON).

### 5. 테스트 이메일 발송

**Send Test Email** 버튼을 클릭하여 설정이 올바른지 확인합니다.

## 이메일 템플릿 확인

Supabase Dashboard에서 다음 이메일 템플릿을 확인하고 필요한 경우 수정하세요:

### 회원가입 이메일 (Confirm Signup)
- **경로**: Authentication > Email Templates > Confirm Signup
- **수정**: `.env.local`의 `NEXT_PUBLIC_SITE_URL`을 실제 도메인으로 변경 후 템플릿 업데이트

### 비밀번호 재설정 이메일 (Reset Password)
- **경로**: Authentication > Email Templates > Reset Password

### 이메일 변경 확인 (Email Change)
- **경로**: Authentication > Email Templates > Email Change

## 코드에서의 사용

### Supabase Auth 자동 이메일

Supabase Auth는 다음 경우에 자동으로 이메일을 발송합니다:

```typescript
// 1. 회원가입 시 확인 이메일
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    emailRedirectTo: `${origin}/auth/callback`
  }
})

// 2. 비밀번호 재설정
await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: `${origin}/auth/reset-password`
})

// 3. 이메일 변경
await supabase.auth.updateUser({
  email: 'newemail@example.com'
})
```

### 커스텀 이메일 발송 (Nodemailer 사용)

프로덕션 환경에서는 애플리케이션 레벨에서도 이메일을 발송할 수 있습니다:

```typescript
import { createTransporter } from '@/lib/email';

const transporter = createTransporter(); // XServer SMTP 사용

await transporter.sendMail({
  from: 'info@package-lab.com',
  to: 'customer@example.com',
  subject: '견적서를 보내드립니다',
  html: '<p>...</p>'
});
```

## 트러블슈팅

### 이메일이 도착하지 않음

1. **스팸 폴더 확인**: 수신측 메일 서비스에서 스팸으로 분류했을 수 있습니다
2. **SMTP 로그 확인**: Supabase Dashboard > Auth > Settings > SMTP Settings > View Logs
3. **포트 번호 확인**: `587` (TLS) 또는 `465` (SSL) 둘 다 시도해보세요

### 인증 오류

XServer 패널에서 SMTP 정보를 다시 확인하세요:
- SMTP 호스트명: 서버 번호에 따라 다름 (예: `sv12515.xserver.jp`)
- SMTP 인증 ID: `info@package-lab.com`
- SMTP 비밀번호: XServer 패널 설정에서 확인

### 속도 제한

XServer SMTP에는 발송 제한이 있습니다:
- 1시간당 최대 300통
- 1일당 최대 2400통

대량 발송이 필요한 경우 SendGrid 백업을 활성화하세요.

## 백업 SMTP 설정

SendGrid를 백업으로 사용하려면:

```bash
# .env.local
SENDGRID_API_KEY=SG.your_actual_sendgrid_key
```

코드에서는 기본 SMTP가 실패할 경우 자동으로 SendGrid로 폴백합니다.

## 참고 자료

- [XServer SMTP 설정 문서](https://www.xserver.ne.jp/manual/man_mail_smtp_setting.php)
- [Supabase SMTP 설정 문서](https://supabase.com/docs/guides/auth/auth-smtp)
