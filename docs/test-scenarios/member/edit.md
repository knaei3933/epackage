# 会員情報編集ページ（廃止・リダイレクト確認）

**最終更新**: 2026-08-04
**目的**: `/member/edit` は廃止され `/member/profile` へリダイレクトすることを確認する

---

## 背景

会員ページ統合（3ページ → 2ページ化）により、`/member/edit` は廃止されました。

- 連絡先編集（電話番号・FAX）→ `/member/profile` にインライン統合
- パスワード変更・アカウント削除 → `/member/settings` に統合

`/member/edit` ルートは後方互換のためリダイレクトのみ残存（実装: `src/app/member/edit/page.tsx`）。

---

## テストシナリオ: リダイレクト確認

本ファイルでは redirect 挙動の確認のみ行う。連絡先編集は [profile.md](./profile.md)、パスワード変更は [settings.md](./settings.md) を参照。

### AC-1: 未認証時のリダイレクト

**前提条件**: ログアウト状態

**手順**:

```bash
# 1. /member/edit にアクセス（未認証）
[Browser_navigate] http://localhost:3000/member/edit

# 2. リダイレクト先を確認
[Browser_snapshot]
```

**期待結果**:

- `/auth/signin?redirect=/member/edit` へリダイレクトすること
- ログインページが表示されること

### AC-2: 認証済み時のリダイレクト

**前提条件**: 会員としてログイン済み

**手順**:

```bash
# 1. /member/edit にアクセス（認証済み）
[Browser_navigate] http://localhost:3000/member/edit

# 2. リダイレクト先を確認
[Browser_snapshot]
```

**期待結果**:

- `/member/profile` へリダイレクトすること
- プロフィールページ（認証情報・連絡先・会社情報）が正常に表示されること

---

## 関連シナリオ

- [プロフィール・連絡先編集](./profile.md)
- [パスワード変更・アカウント設定](./settings.md)
