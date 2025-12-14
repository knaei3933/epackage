# Epackage Lab - お問い合わせシステム

Epackage Labの製品に関するお問い合わせとサンプルリクエストを管理するNext.jsアプリケーションです。

## 🚀 主な機能

### お問い合わせシステム
- **一般お問い合わせフォーム**: 製品やサービスに関する質問を受け付ける
- **サンプルリクエストフォーム**: 製品サンプルを無料でリクエスト（最大5個まで）
- **リアルタイムバリデーション**: 日本語のビジネスルールに対応した入力チェック
- **自動メール送信**: SendGridを利用した確認メールと通知メール
- **CRM連携**: お問い合わせデータの自動管理

### 技術仕様
- **フレームワーク**: Next.js 16 with App Router
- **UI**: React 19 + TypeScript + Tailwind CSS 4
- **フォーム管理**: React Hook Form + Zodバリデーション
- **メール送信**: SendGrid Node.js SDK
- **データ管理**: Supabase (準備完了)

## 📋 ページ一覧

### お問い合わせページ
- **URL**: `/contact`
- **機能**: 一般お問い合わせフォーム
- **入力項目**: お名前、会社名、メールアドレス、電話番号、件名、お問い合わせ内容、種別、緊急度、希望連絡方法

### サンプルリクエストページ
- **URL**: `/samples`
- **機能**: 製品サンプルのリクエスト
- **入力項目**: 基本情報、サンプル詳細（最大5個）、プロジェクト詳細、個人情報保護同意

### サンクスページ
- **URL**: `/contact/thank-you` - お問い合わせ完了
- **URL**: `/samples/thank-you` - サンプルリクエスト完了

## 🛠️ セットアップ

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd epackage-lab-web
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.local.example` を `.env.local` にコピーして、必要な値を設定してください：

```bash
cp .env.local.example .env.local
```

#### 必須環境変数
```env
# SendGrid設定
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
ADMIN_EMAIL=admin@epackage-lab.com
FROM_EMAIL=noreply@epackage-lab.com

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📧 SendGrid設定

### 1. SendGridアカウントの作成
- [SendGrid](https://sendgrid.com/) でアカウントを作成
- APIキーを発行（メール送信権限を付与）

### 2. 送信者認証
- 送信者メールアドレスを認証
- ドメイン認証（推奨）または単一メール認証

### 3. 環境変数の設定
```env
SENDGRID_API_KEY=発行したAPIキー
FROM_EMAIL=認証済みの送信者メールアドレス
ADMIN_EMAIL=通知を受け取る管理者メールアドレス
```

## 🎨 UIコンポーネント

### ContactForm コンポーネント
- お名前、会社名、連絡先情報の入力
- お問い合わせ種別の選択（一般、技術、営業、サポート）
- 緊急度設定（低、中、高）
- リアルタイムバリデーション
- 日本語エラーメッセージ

### SampleRequestForm コンポーネント
- 複数サンプルのリクエスト（最大5個）
- 製品カタログからの選択
- プロジェクト詳細の入力
- 個人情報保護同意
- 数量と仕様の指定

## 📊 APIエンドポイント

### POST `/api/contact`
お問い合わせフォームの処理
- リクエストボディのバリデーション
- 管理者への通知メール送信
- 顧客への確認メール送信
- CRMシステムへのデータ保存

### POST `/api/samples`
サンプルリクエストの処理
- サンプル在庫確認（連携準備）
- 管理者への優先通知
- 顧客への詳細確認メール
- 発送準備の開始

## 📝 メールテンプレート

### 日本語ビジネスメール
- 管理者向け通知メール（HTML形式）
- 顧客向け確認メール（HTML形式）
- ブランドカラーや企業ロゴの統一
- レスポンシブデザイン対応

### カスタマイズ可能項目
- 企業情報とロゴ
- 連絡先情報
- 営業時間
- ウェブサイトリンク

## 🔄 CRM連携

### データ保存項目
- お客様情報（氏名、会社、連絡先）
- お問い合わせ内容と種別
- サンプルリクエスト詳細
- タイムスタンプとステータス
- 追跡IDの生成

### 将来拡張
- HubSpot/Salesforce連携
- 顧客セグメント管理
- フォローアップ自動化
- レポートと分析

## 🚀 デプロイ

### Vercelへのデプロイ
```bash
# Vercel CLIをインストール
npm install -g vercel

# デプロイ
vercel --prod
```

### 環境変数の設定
Vercelダッシュボードで環境変数を設定：
- `SENDGRID_API_KEY`
- `ADMIN_EMAIL`
- `FROM_EMAIL`
- Supabase関連の変数

## 🔧 開発

### コードスタイル
- TypeScriptによる型安全性
- ESLintによるコード品質
- Prettierによるコードフォーマット

### コンポーネント構造
```
src/
├── components/
│   └── contact/
│       ├── ContactForm.tsx
│       ├── SampleRequestForm.tsx
│       └── index.ts
├── app/
│   ├── api/
│   │   ├── contact/route.ts
│   │   └── samples/route.ts
│   ├── contact/
│   │   ├── page.tsx
│   │   └── thank-you/page.tsx
│   └── samples/
│       ├── page.tsx
│       └── thank-you/page.tsx
└── types/
    └── contact.ts
```

## 📝 ライセンス

プロジェクトのライセンス情報をここに記載してください。

## 🆘 サポート

問題が発生した場合や質問がある場合は、以下の連絡先までご連絡ください：
- メール: support@epackage-lab.com
- ドキュメント: [プロジェクトWiki](link-to-wiki)
