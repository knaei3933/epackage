# G5: Vercel Cron 設定チェックリスト

## 現状の重要な所見

**`vercel.json` に `crons` 定義が無い。**

現状の `vercel.json` は `redirects` / `headers` / `cleanUrls` / `trailingSlash` のみで、
`crons` フィールドが未定義。このままだと Vercel Cron は実行されず、
毎日 0 時の自動アーカイブと予約投稿公開が **スケジュール実行されない**。

手動 curl（`cron.sh`）でエンドポイント自体は動いても、
本番での定期実行は別途設定が必要。

---

## チェックリスト

### 1. `vercel.json` への `crons` 追加

以下を `vercel.json` に追加する（推奨設定）。

```json
{
  "crons": [
    {
      "path": "/api/cron/archive-orders",
      "schedule": "0 15 * * *"
    },
    {
      "path": "/api/cron/publish-scheduled-posts",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

#### スケジュールの根拠

| ジョブ | schedule (UTC) | 日本時間 | 理由 |
|--------|---------------|---------|------|
| `archive-orders` | `0 15 * * *` | 毎日 00:00 | コードコメント「毎日深夜0時に実行」。日本時間 0 時 = UTC 15 時。 |
| `publish-scheduled-posts` | `*/15 * * * *` | 15 分ごと | 予約時刻を過ぎた記事を早く公開するため。Hobby プランの制限（後述）に収めるよう頻度は調整すること。 |

> Vercel Cron の `schedule` は **UTC** で指定する。日本時間 -9 時間で換算。
> 「毎日 0 時」は UTC では前日 15 時。

### 2. `CRON_SECRET` 環境変数の設定

Vercel ダッシュボードで環境変数を設定する。

- **Production** と **Preview** 両方に設定する（dev ローカルは `.env.local`）。
- 値はランダムな長文字列（`openssl rand -hex 32` 等で生成）。
- アプリ側の検証（`route.ts`）は `Authorization: Bearer ${CRON_SECRET}` 形式。

> Production で `CRON_SECRET` 未設定の場合、`archive-orders` は 500 を返す
> （コード内で production 必須チェックあり）。`publish-scheduled-posts` は
> `CRON_SECRET` 未設定でも誰でも実行できる状態になるため **必ず設定すること**。

確認手順:
1. Vercel Dashboard → 対象プロジェクト → Settings → Environment Variables
2. `CRON_SECRET` が Production / Preview 両方に存在すること
3. デプロイ後に `cron.sh` で 200 / 401 を確認

### 3. Vercel Cron 実行ログの確認

デプロイ後に Cron が認識されているか確認する。

1. Vercel Dashboard → 対象プロジェクト → **Cron Jobs** メニュー
2. 2 つのジョブ（archive-orders / publish-scheduled-posts）が一覧に表示されること
3. 各ジョブの `schedule` が意図通り（UTC 表示）であること
4. 「Last Run」／「Next Run」が表示されること
5. 実行履歴（Logs）でステータス 200 を確認

### 4. 失敗時の通知設定

Vercel Cron は失敗時に自動でメール通知を送る（Hobby / Pro 共通）。
設定確認:

1. Vercel Dashboard → Settings → Notifications
2. Cron 実行失敗の通知が有効であること
3. 通知先メールアドレスが正しいこと

失敗が続く場合の確認ポイント:
- `CRON_SECRET` が合致しているか
- `SUPABASE_SERVICE_ROLE_KEY` / `NEXT_PUBLIC_SUPABASE_URL` が設定されているか
- Supabase 側でサービスロールキーがローテーションされていないか

### 5. Hobby プランの実行回数制限

**Hobby（無料）プランでは 1 日 2 回まで**（2024 年以降の制限）。

現状の想定スケジュール:

| ジョブ | 1 日の実行回数 |
|--------|---------------|
| `archive-orders` (毎日 0 時) | 1 回 / 日 |
| `publish-scheduled-posts` (15 分ごと) | **96 回 / 日** |

→ **publish-scheduled-posts が制限を大きく超過する。**

#### 対応案（いずれかを選択）

- **案 A: Pro プランへアップグレード**（Cron 実行回数の制限が実質なし）
- **案 B: publish-scheduled-posts の頻度を下げる**
  - 例: 毎時 0 分 `0 * * * *`（1 日 24 回）→ 依然 Hobby 超過
  - 例: 1 日 2 回 `0 0,12 * * *`（UTC）→ 制限内だが公開まで最大 12 時間遅れ
- **案 C: 2 ジョブを統合**（1 日 2 回の実行で両方処理）
  - 単一 cron から両エンドポイントを呼ぶ薄いラッパーを置くか、
    片方のルート内で両方の処理を行うよう改修

**推奨**: Pro プラン（案 A）が運用上は無難。Hobby のままなら
案 C で 1 日 2 回にまとめる。現状の 15 分間隔設定は Hobby では動かない。

### 6. デプロイ後の最終確認

- [ ] `vercel.json` に `crons` を追加してデプロイ
- [ ] Vercel Dashboard の Cron Jobs 一覧に 2 ジョブ表示
- [ ] `CRON_SECRET` が Production / Preview に設定済み
- [ ] `cron.sh` で本番 URL を叩き 200 / 401 を確認
- [ ] 初回スケジュール実行後に Vercel Logs で成功を確認
- [ ] DB 側（`cron-db.md` のクエリ）で対象レコードが更新されたか確認

---

## 参照
- Vercel Cron 公式: https://vercel.com/docs/cron-jobs
- プラン別制限: https://vercel.com/docs/cron-jobs/limits
- `vercel.json` crons 仕様: https://vercel.com/docs/projects/project-configuration#crons
