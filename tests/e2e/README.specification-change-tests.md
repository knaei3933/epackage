# 仕様変更機能 E2Eテスト

## 概要

このE2Eテストスイートは、仕様変更機能の包括的なテストカバレッジを提供します。

- **管理者用**: 注文後の仕様変更処理
- **顧客用**: 注文準備ページでの仕様変更リクエスト
- **統合テスト**: 顧客→管理者の完全なワークフロー
- **見積詳細**: 404エラー修正の確認

## テストファイル構成

| ファイル | 説明 |
|---------|------|
| `admin-specification-change.spec.ts` | 管理者用仕様変更機能のテスト |
| `member-specification-change.spec.ts` | 顧客用仕様変更機能のテスト |
| `specification-change-workflow.spec.ts` | 仕様変更ワークフローの統合テスト |
| `spec-change-quotation-detail.spec.ts` | 仕様変更用見積詳細表示のテスト（404修正確認） |

## 前提条件

1. **テストデータの準備**
   - 管理者アカウント: `admin@epackage-lab.com` / `Admin123!`
   - 顧客アカウント: `member@test.com` / `Member1234!`
   - データ入稿済みの注文が少なくとも1件存在すること

2. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## テストの実行

### 全テスト実行

```bash
npm run test:e2e
# または
npx playwright test
```

### 特定ファイルのみ実行

```bash
# 管理者用仕様変更テスト
npx playwright test admin-specification-change.spec.ts

# 顧客用仕様変更テスト
npx playwright test member-specification-change.spec.ts

# 統合テスト
npx playwright test specification-change-workflow.spec.ts

# 見積詳細テスト
npx playwright test admin-quotation-detail.spec.ts
```

### 特定テストのみ実行

```bash
# 特定のテストケースのみ実行
npx playwright test -g "ADMIN-SPEC-001"
```

### ヘッドレスモードで実行

```bash
npx playwright test --headed
```

### デバッグモードで実行

```bash
npx playwright test --debug
```

## テストシナリオ

### 管理者用仕様変更テスト (`admin-specification-change.spec.ts`)

| ID | テストケース | 説明 |
|----|-------------|------|
| ADMIN-SPEC-001 | 仕様変更ボタンの表示 | 注文詳細ページで仕様変更ボタンが表示されることを確認 |
| ADMIN-SPEC-002 | モーダル表示 | 仕様変更モーダルが正しく表示されることを確認 |
| ADMIN-SPEC-003 | サイズ変更価格再計算 | サイズ変更で価格が正しく再計算されることを確認 |
| ADMIN-SPEC-004 | 仕様変更確定 | 仕様変更確定で新しい見積が作成されることを確認 |
| ADMIN-SPEC-005 | 顧客通知送信 | 顧客に通知が正しく送信されることを確認 |
| ADMIN-SPEC-006 | キャンセル動作 | キャンセルで変更が正しく破棄されることを確認 |
| ADMIN-SPEC-007 | 素材変更価格再計算 | 素材変更で価格が正しく再計算されることを確認 |
| ADMIN-SPEC-008 | 後加工オプション価格再計算 | 後加工オプション変更で価格が正しく再計算されることを確認 |

### 顧客用仕様変更テスト (`member-specification-change.spec.ts`)

| ID | テストケース | 説明 |
|----|-------------|------|
| MEMBER-SPEC-001 | 仕様変更ボタンの表示 | 注文準備ページで仕様変更ボタンが表示されることを確認 |
| MEMBER-SPEC-002 | モーダル表示 | 仕様変更モーダルが正しく表示されることを確認 |
| MEMBER-SPEC-003 | サイズ変更価格再計算 | サイズ変更で価格が正しく再計算されることを確認 |
| MEMBER-SPEC-004 | 仕様変更確定 | 仕様変更確定で新しい見積が作成されることを確認 |
| MEMBER-SPEC-005 | 管理者通知送信 | 管理者に通知が正しく送信されることを確認 |
| MEMBER-SPEC-006 | キャンセル動作 | キャンセルで変更が正しく破棄されることを確認 |
| MEMBER-SPEC-007 | 素材変更価格再計算 | 素材変更で価格が正しく再計算されることを確認 |
| MEMBER-SPEC-008 | 後加工オプション価格再計算 | 後加工オプション変更で価格が正しく再計算されることを確認 |

### 統合テスト (`specification-change-workflow.spec.ts`)

| ID | テストケース | 説明 |
|----|-------------|------|
| WORKFLOW-001 | 完全ワークフロー | 顧客からの仕様変更リクエストから管理者処理までの完全なワークフローを確認 |
| WORKFLOW-002 | 双方向仕様変更 | 管理者と顧客の双方向での仕様変更を確認 |
| WORKFLOW-003 | キャンセルワークフロー | キャンセルでのワークフロー中断を確認 |
| WORKFLOW-004 | 通知優先度変化 | 価格増減による通知優先度の変化を確認 |

### 見積詳細テスト (`admin-quotation-detail.spec.ts`)

| ID | テストケース | 説明 |
|----|-------------|------|
| ADMIN-QUOTE-001 | 見積一覧表示 | 見積一覧ページが正しく表示されることを確認 |
| ADMIN-QUOTE-002 | 見積詳細表示 | 見積詳細パネルが正しく表示されることを確認（404エラー修正確認） |
| ADMIN-QUOTE-003 | 原価内訳表示 | 原価内訳が正しく表示されることを確認 |
| ADMIN-QUOTE-004 | API動作確認 | 見積詳細APIが正しく動作することを確認 |
| ADMIN-QUOTE-005 | 認証ヘッダー確認 | 認証ヘッダーが正しく送信されることを確認 |
| ADMIN-QUOTE-006 | 計算式表示 | 計算式が正しく表示されることを確認 |
| ADMIN-QUOTE-007 | 複数見積表示 | 複数の見積を順番に詳細表示できることを確認 |

## テストデータ

テストで使用するアカウント情報は `tests/e2e/test-data.ts` で定義されています。

```typescript
export const TEST_USERS = {
  admin: {
    email: 'admin@epackage-lab.com',
    password: 'Admin123!',
    name: 'Admin User',
    role: 'admin',
  },
  member: {
    email: 'member@test.com',
    password: 'Member1234!',
    name: 'Test Member',
    role: 'member',
  },
};
```

## 期待される動作

### 仕様変更ワークフロー

1. **顧客が仕様変更をリクエスト**
   - 注文準備ページで「仕様変更」ボタンをクリック
   - サイズ、素材、印刷、後加工を変更
   - 価格差額がリアルタイムで表示される
   - 変更理由を入力して確定

2. **管理者に通知が送信**
   - 通知センターに「仕様変更リクエスト」が表示される
   - 通知をクリックして注文詳細ページへ移動

3. **管理者が仕様変更を処理**
   - 注文詳細ページで「仕様変更」ボタンをクリック
   - 管理者用モーダルが表示される
   - 追加変更や承認を行う
   - 顧客に通知を送信するオプション

4. **顧客に完了通知**
   - 通知センターに「仕様変更のお知らせ」が表示される
   - 新しい見積が作成されていることを確認

5. **変更履歴の記録**
   - `order_audit_log` テーブルに変更履歴が記録される
   - 変更前後の仕様と価格が保持される

## トラブルシューティング

### タイムアウトエラー

```
Error: Test timeout of 30000ms exceeded
```

**解決方法**:
- 開発サーバーが起動しているか確認
- ネットワーク接続を確認
- ページ読み込みの待機時間を延長

### 要素が見つからないエラー

```
Error: locator.click: Target closed
```

**解決方法**:
- ページのURLが正しいか確認
- セレクタが正しいか確認
- 要素が表示されるまで待機する時間を延長

### 認証エラー

```
Error: 401 Unauthorized
```

**解決方法**:
- テストユーザーが存在するか確認
- パスワードが正しいか確認
- Supabase Authの設定を確認

## 今後の拡張

- [ ] モバイルデバイスでのテスト
- [ ] アクセシビリティテストの追加
- [ ] パフォーマンステストの追加
- [ ] エッジケースのテスト追加（同時アクセス等）
- [ ] API負荷テストの追加
