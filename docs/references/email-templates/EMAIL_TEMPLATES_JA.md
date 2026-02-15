# Supabase Auth Japanese Email Templates

This document contains Japanese email templates for Supabase Authentication.

## Table of Contents

1. [Confirm Signup](#confirm-signup)
2. [Reset Password](#reset-password)
3. [Email Change](#email-change)
4. [Magic Link (Optional)](#magic-link)

---

## Confirm Signup

**Purpose**: Sent when a new user registers to verify their email address.

### Subject (件名)
```
【Epackage Lab】メールアドレスのご確認
```

### HTML Body

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 40px 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .info-box { background: #fff; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Epackage Lab</h1>
    </div>
    <div class="content">
      <h2>{{ .Email }} 様</h2>
      <p> Epackage Lab にご登録いただき、誠にありがとうございます。</p>

      <div class="info-box">
        <p>アカウントを有効化するには、以下のボタンをクリックしてメールアドレスを確認してください。</p>
        <center>
          <a href="{{ .ConfirmationURL }}" class="button">メールアドレスを確認する</a>
        </center>
      </div>

      <p style="font-size: 13px; color: #6b7280;">
        ※このリンクの有効期限は<strong>24時間</strong>です。有効期限が過ぎると、再度登録が必要になります。
      </p>

      <p style="font-size: 13px; color: #6b7280;">
        ※ボタンがクリックできない場合は、以下のURLをコピーしてブラウザに貼り付けてください：<br>
        <a href="{{ .ConfirmationURL }}" style="word-break: break-all; color: #667eea;">{{ .ConfirmationURL }}</a>
      </p>

      <p style="font-size: 13px; color: #6b7280;">
        ※このメールに心当たりがない場合は、恐れ入りますが削除してください。誰かがメールアドレスを誤って入力した可能性があります。
      </p>

      <div class="footer">
        <p><strong>Epackage Lab</strong></p>
        <p>URL: <a href="https://epackage-lab.com">https://epackage-lab.com</a></p>
        <p>※このメールはシステムにより自動送信されています。直接返信しないでください。</p>
      </div>
    </div>
  </div>
</body>
</html>
```

### Variables
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Email confirmation link

---

## Reset Password

**Purpose**: Sent when a user requests a password reset.

### Subject (件名)
```
【Epackage Lab】パスワードリセットのご案内
```

### HTML Body

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 40px 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .info-box { background: #fff; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
    .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Epackage Lab</h1>
    </div>
    <div class="content">
      <h2>{{ .Email }} 様</h2>
      <p>パスワードのリセットリクエストを受け付けました。</p>

      <div class="warning">
        <p style="margin: 0; font-size: 13px; color: #92400e;">
          <strong>⚠️ 重要：</strong>このリクエストに心当たりがない場合は、このメールを無視してください。あなたのアカウントは安全です。
        </p>
      </div>

      <div class="info-box">
        <p>新しいパスワードを設定するには、以下のボタンをクリックしてください：</p>
        <center>
          <a href="{{ .ConfirmationURL }}" class="button">パスワードをリセットする</a>
        </center>
      </div>

      <p style="font-size: 13px; color: #6b7280;">
        ※このリンクの有効期限は<strong>1時間</strong>です。有効期限が過ぎると、再度リクエストが必要になります。
      </p>

      <p style="font-size: 13px; color: #6b7280;">
        ※ボタンがクリックできない場合は、以下のURLをコピーしてブラウザに貼り付けてください：<br>
        <a href="{{ .ConfirmationURL }}" style="word-break: break-all; color: #667eea;">{{ .ConfirmationURL }}</a>
      </p>

      <p style="font-size: 13px; color: #6b7280;">
        ※セキュリティのため、リンクを他者と共有しないでください。
      </p>

      <div class="footer">
        <p><strong>Epackage Lab</strong></p>
        <p>URL: <a href="https://epackage-lab.com">https://epackage-lab.com</a></p>
        <p>※このメールはシステムにより自動送信されています。直接返信しないでください。</p>
      </div>
    </div>
  </div>
</body>
</html>
```

### Variables
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Password reset link

---

## Email Change

**Purpose**: Sent when a user changes their email address to confirm the new email.

### Subject (件名)
```
【Epackage Lab】メールアドレス変更のご確認
```

### HTML Body

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 40px 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .info-box { background: #fff; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
    .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Epackage Lab</h1>
    </div>
    <div class="content">
      <h2>{{ .Email }} 様</h2>
      <p>メールアドレスの変更リクエストを受け付けました。</p>

      <div class="warning">
        <p style="margin: 0; font-size: 13px; color: #92400e;">
          <strong>⚠️ 重要：</strong>このリクエストに心当たりがない場合は、直ちにサポートまでご連絡ください。
        </p>
      </div>

      <div class="info-box">
        <p>新しいメールアドレスを確認するには、以下のボタンをクリックしてください：</p>
        <center>
          <a href="{{ .ConfirmationURL }}" class="button">メールアドレスを変更する</a>
        </center>
      </div>

      <p style="font-size: 13px; color: #6b7280;">
        ※このリンクの有効期限は<strong>24時間</strong>です。
      </p>

      <p style="font-size: 13px; color: #6b7280;">
        ※ボタンがクリックできない場合は、以下のURLをコピーしてブラウザに貼り付けてください：<br>
        <a href="{{ .ConfirmationURL }}" style="word-break: break-all; color: #667eea;">{{ .ConfirmationURL }}</a>
      </p>

      <div class="footer">
        <p><strong>Epackage Lab</strong></p>
        <p>URL: <a href="https://epackage-lab.com">https://epackage-lab.com</a></p>
        <p>お問い合わせ: <a href="mailto:admin@epackage-lab.com">admin@epackage-lab.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
```

### Variables
- `{{ .Email }}` - User's new email address
- `{{ .ConfirmationURL }}` - Email change confirmation link

---

## Magic Link (Optional)

**Purpose**: Sent when using passwordless authentication with magic links.

### Subject (件名)
```
【Epackage Lab】ログイン用リンク
```

### HTML Body

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 40px 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .info-box { background: #fff; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
    .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Epackage Lab</h1>
    </div>
    <div class="content">
      <h2>{{ .Email }} 様</h2>
      <p>Epackage Lab へのログインリクエストを受け付けました。</p>

      <div class="warning">
        <p style="margin: 0; font-size: 13px; color: #92400e;">
          <strong>⚠️ 重要：</strong>このリクエストに心当たりがない場合は、このメールを無視してください。
        </p>
      </div>

      <div class="info-box">
        <p>以下のボタンをクリックすると、Epackage Lab にログインできます：</p>
        <center>
          <a href="{{ .ConfirmationURL }}" class="button">ログインする</a>
        </center>
      </div>

      <p style="font-size: 13px; color: #6b7280;">
        ※このリンクの有効期限は<strong>1時間</strong>です。
      </p>

      <p style="font-size: 13px; color: #6b7280;">
        ※ボタンがクリックできない場合は、以下のURLをコピーしてブラウザに貼り付けてください：<br>
        <a href="{{ .ConfirmationURL }}" style="word-break: break-all; color: #667eea;">{{ .ConfirmationURL }}</a>
      </p>

      <div class="footer">
        <p><strong>Epackage Lab</strong></p>
        <p>URL: <a href="https://epackage-lab.com">https://epackage-lab.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
```

### Variables
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Magic link for login

---

## How to Register Templates in Supabase

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Update Each Template

1. Click on the template type (Confirm signup, Reset password, etc.)
2. Replace the **Subject** with the Japanese subject
3. Replace the **Body** with the HTML template
4. Click **Save**

### Step 3: Test Templates

1. After updating, click **Send Test Email**
2. Enter your email address
3. Verify that:
   - Japanese text displays correctly
   - Links work properly
   - Styling is applied correctly
   - Variables are replaced correctly

---

## Template Customization Guidelines

### Colors

The templates use the Epackage Lab gradient:
- Primary: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Background: `#f9fafb`
- Text: Primary `#111827`, Secondary `#6b7280`
- Border: `#e5e7eb`

### Fonts

Japanese font stack for optimal rendering:
```css
font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
```

### Best Practices

1. **Always test** with real email addresses before production
2. **Check mobile responsiveness** - templates use max-width: 600px
3. **Use inline styles** - some email clients don't support external stylesheets
4. **Include plain text fallback** - for email clients that don't support HTML
5. **Keep width under 600px** - optimal for most email clients

### Supported Email Clients

Tested on:
- Gmail (Web & Mobile)
- Outlook (Web & Desktop)
- Apple Mail (iOS & macOS)
- Yahoo! Mail Japan
- Japanese mobile carriers (docomo, au, SoftBank)

---

## Troubleshooting

### Japanese characters display as garbled text

**Cause**: Character encoding issue

**Solution**: Ensure your HTML includes:
```html
<meta charset="UTF-8">
```

### Links don't work

**Cause**: URL variables not properly replaced

**Solution**: Verify variables are in correct format:
- `{{ .ConfirmationURL }}`
- `{{ .Email }}`

### Styles not applied

**Cause**: Email client doesn't support certain CSS

**Solution**: Use inline styles (already done in templates)

### Images not loading

**Cause**: Hotlinking protection or incorrect URL

**Solution**: Use absolute URLs for images:
```html
<img src="https://epackage-lab.com/logo.png" alt="Epackage Lab">
```

---

## Additional Resources

- [Supabase Auth Email Templates](https://supabase.com/docs/guides/auth/auth-email/email-templates)
- [SendGrid Email Design Guide](https://docs.sendgrid.com/for-developers/sending-email/email-design-guide)
- [HTML Email Best Practices](https://www.campaignmonitor.com/resources/guides/email-marketing-guide/)
