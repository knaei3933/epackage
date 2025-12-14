# EPackage Lab Website Current Modifications PRD

## プロジェクト概要

EPackage LabウェブサイトのUI/UX改善および機能修正プロジェクト。全11項目の修正要件に基づき、フッター構成変更、製品ページ改善、ヘッダーメニュー修正などを実施する。

## 修正要件

### Requirement 1: フッターレイアウト変更
**Priority**: High
**Description**: フッターが現在2列構成になっているため、1列構成に変更する必要があります。
**Technical Requirements**:
- 現在の2列レイアウトを1列に再設計
- レスポンシブデザインの維持
- 既存のフッターコンテンツを再配置

### Requirement 2: メインホームページ画像復元
**Priority**: High
**Description**: メインホームページにBOX型パウチ写真が表示されていないため、復元する必要があります。
**Technical Requirements**:
- BOX型パウチ画像の表示を復元
- 画像パスの確認と修正
- 画像の最適化と読み込み速度確保

### Requirement 3: 製品ページ検索・フィルター機能削除
**Priority**: Medium
**Description**: catalogページに実装されている検索機能とフィルターセクションを削除します。
**Technical Requirements**:
- 検索コンポーネントの完全削除
- フィルターセクションのUI要素削除
- 関連するステート管理の整理
- ページレイアウトの調整

### Requirement 4: カタログページの製品名日本語化
**Priority**: Medium
**Description**: catalogページの製品写真左上の丸い四角形に表示される韓国語のパウチ名を日本語に変更します。
**Technical Requirements**:
- 韓国語製品名リストの作成
- 日本語への翻訳と置き換え
- 製品名表示コンポーネントの修正
- 多言語対応の考慮

### Requirement 5: カタログページ比較機能削除
**Priority**: Medium
**Description**: catalogページに実装されている製品比較機能（比較追加ボタン）を削除します。
**Technical Requirements**:
- 比較ボタンUI要素の削除
- 比較機能ロジックの削除
- 比較状態管理の整理
- 関連するイベントハンドラーの削除

### Requirement 6: アーカイブページレイアウト変更
**Priority**: Medium
**Description**: archivesページの左側フィルター幅を縮小し、導入事例セクションを2列構成に拡大します。検索機能も削除します。
**Technical Requirements**:
- 左側フィルターを1列構成に集約し幅を縮小
- 導入事例セクションを2列レイアウトに変更
- 検索機能の削除
- レスポンシブデザインの維持

### Requirement 7: ヘッダーメニュー製品カテゴリードロップダウン変更
**Priority**: Medium
**Description**: ヘッダーの製品カテゴリードロップダウンから、製品カタログページのみドロップダウンを削除します。
**Technical Requirements**:
- 製品カテゴリーメニュー項目の特定
- 製品カタログ項目のドロップダウン機能無効化
- 直接リンクへの変更
- ナビゲーションロジックの修正

### Requirement 8: ヘッダーサービスドロップダウン修正
**Priority**: Medium
**Description**: ヘッダーのサービスドロップダウンから「見積シミュレーション」項目を削除します。
**Technical Requirements**:
- サービスドロップダウンメニューの編集
- 見積シミュレーション項目の削除
- メニュー構成の再調整

### Requirement 9: ヘッダー見積タブ直リンク化
**Priority**: High
**Description**: ヘッダーの見積タブをクリックすると直接「見積シミュレーター」ページが開くようにします。ドロップダウンを削除し、デザインテンプレートダウンロード機能を追加します。
**Technical Requirements**:
- 見積タブのドロップダウン削除
- 見積シミュレーターページへの直接リンク設定
- カタログページ各製品へのテンプレートダウンロード機能実装
- ダウンロードUIコンポーネントの設計

### Requirement 10: デザイン納品ガイドページ新設
**Priority**: High
**Description**: 新しいデザイン納品ガイドページを作成し、指定URLの内容を反映します。
**Technical Requirements**:
- 新規ページ「/design-guide」の作成
- 参考URLのコンテンツ分析と実装:
  - https://brixa.jp/guide/color
  - https://brixa.jp/guide/size
  - https://brixa.jp/guide/image
  - https://brixa.jp/guide/shirohan
  - https://brixa.jp/guide/environmentaldisplay
- スクリーンショット内容の反映
- ナビゲーションメニューへの追加

### Requirement 11: 全機能Playwright MCPテスト
**Priority**: High
**Description**: 上記すべての修正について、Playwright MCPを使用して動作確認を実施します。
**Technical Requirements**:
- Playwright MCPテスト環境の準備
- 各修正項目のE2Eテストケース作成
- 自動テストの実行
- テスト結果の検証とレポート作成

## 技術要件

### プラットフォーム
- フレームワーク: Next.js 16
- スタイル: Tailwind CSS
- 言語: TypeScript
- メイン言語: 日本語

### 開発環境
- 開発サーバー: localhost:3000
- テスト環境: Playwright MCP

### 品質要件
- レスポンシブデザイン対応
- クロスブラウザ互換性
- パフォーマンス最適化
- アクセシビリティ対応

## 納期と優先順位

### 高優先度
1. フッターレイアウト変更
2. メインホームページ画像復元
3. ヘッダー見積タブ直リンク化
4. デザイン納品ガイドページ新設
5. 全機能Playwright MCPテスト

### 中優先度
1. 製品ページ検索・フィルター機能削除
2. カタログページの製品名日本語化
3. カタログページ比較機能削除
4. アーカイブページレイアウト変更
5. ヘッダーメニュー製品カテゴリードロップダウン変更
6. ヘッダーサービスドロップダウン修正

## テスト戦略

### 機能テスト
- 各修正項目の動作確認
- UI/UXの検証
- レスポンシブデザインテスト

### 統合テスト
- ナビゲーションフローの確認
- ページ間遷移の検証
- データフローのテスト

### E2Eテスト
- Playwright MCPによる自動テスト
- ユーザーシナリオの網羅
- ブラウザ互換性の確認