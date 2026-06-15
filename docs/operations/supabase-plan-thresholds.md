# Supabase Plan Thresholds & Pro 移行判断基準

> AC-S1 運用ドキュメント。本プロジェクト（EPAC Homepage）の Supabase project `ijlgpzjdfipzmjvawofp`（ap-southeast-2）が現在 Free Plan で運用されていることを前提とする。
>
> 閾値は Supabase 公式ドキュメント（2026-06-15 確認、`search_docs` MCP 経由）に基づく。公式ドキュメントは定期的に更新されるため、移行判断の前に最新値を再確認すること。

## 1. Free Plan の主要閾値

| リソース | Free Plan | Pro Plan | 備考 |
|---------|-----------|----------|------|
| **Database Size** | **500 MB / project**（超過で read-only モード） | **8 GB disk included**、超過分 $0.125/GB | Free は disk 1GB 割当だが、DB データサイズ 500MB 超過で read-only に移行。Pro は disk 90% 到達で自動拡張（50%増・24hに4回まで）、最大 60 TB |
| **Monthly Active Users (MAU)** | **50,000 MAU** | **100,000 MAU included**、超過分 $0.00325/MAU | Auth の月間アクティブユーザー数 |
| **Concurrent DB Connections** | **200** | **500** included（Team/Enterprise は 10,000） | プロジェクトあたりの同時接続数。Pooler（Supavisor）経由で効率化 |
| **Realtime Peak Connections** | **200** | **500** included、超過分 $10/1,000 接続 | Realtime（WebSocket）のピーク接続 |
| **Bandwidth / Storage Egress** | **10 GB**（5 GB cached + 5 GB uncached） | Pro プラン枠あり | 組織（Organization）単位で計算 |
| **Edge Function Invocations** | 無料枠あり（クォータ内は課金なし） | Pro プラン枠あり | クォータ超過で従量課金 |
| **プロジェクト一時停止 (Pause)** | **非アクティブで一時停止対象**（Free は利用頻度の低いプロジェクトが pause される） | **一時停止されない** | Free は週1回程度のアクセス維持が推奨。Pro は pause 対象外 |

### read-only モード（Free Plan）
- DB データサイズが 500MB を超過すると、プロジェクトが **read-only** に移行する（disk サイズ 1GB ではなく DB データサイズ基準）。
- read-only 中は INSERT/UPDATE/DELETE が失敗する。会員登録・見積保存・注文作成が全てブロックされるため、**本番障害に直結**。
- 復旧手段: データ削減（`execute_sql` で不要行削除）、または Pro 移行。

---

## 2. RTT 削減が接続数削減に寄与する仕組み

Phase 2（auth-performance）で実施している `createClient` 最適化・クライアント統合（AC-A4: 7 → 6 + middleware 内聯）が、なぜ Supabase の接続数・コストに直結するかを説明する。

### 2-1. Supabase の接続アーキテクチャ

Supabase は Postgres への接続を **2 種類**のエンドポイントで提供する:

| エンドポイント | 用途 | 接続の性質 |
|---------------|------|-----------|
| **Direct connection** (`db.{project}.supabase.co:5432`) | サーバーサイド・長期間の接続 | 1 接続 = 1 Postgres バックエンドプロセス。重い |
| **Connection Pooler / Supavisor** (`aws-0-{region}.pooler.supabase.com:6543`) | サーバーレス・Edge Functions・多数の短命接続 | PgBotor 系。複数の論理接続を少ない物理接続に多重化 |

- **Concurrent connections の上限（Free 200 / Pro 500）は物理接続の目安**。Pooler 経由なら論理接続を多数束ねられるが、Direct 接続を各クライアントが開くと上限に達しやすい。
- Next.js の API Route で `createClient()` を呼ぶたびに新規接続を開く実装だと、リクエスト毎に接続が増え、**200 接続（Free）に到達**すると新規接続が拒否される（`too_many_connections`）。

### 2-2. RTT（Round Trip Time）と接続持続時間の相関

- RTT が大きい（例: クライアント ↔ DB 間の往復 100ms 以上）と、1 リクエストあたりの接続保持時間が長くなる。
- 接続が長く保持されると、**同時に開いている接続数（concurrent）が増加**し、200/500 の上限に近づく。
- 逆に、RTT を削減（Pooler 経由、リージョン統一、1 リクエスト内の往復最小化）すると、接続が素早く解放され、**同じトラフィックでも concurrent 接続数が減少**する。

### 2-3. 具体的な改善パターン（本プロジェクト該当）

1. **クライアント統合（AC-A4）**: 複数の `createClient` 呼び出しを 1 つの共有インスタンスに集約。接続プールの再利用が進み、新規接続の発生を抑制。
2. **N+1 クエリの解消**: 1 画面で N 回の DB 往復を 1 回にまとめると、RTT × (N-1) 分の接続占有時間を削減。
3. **Pooler エンドポイントの使用**: Edge Functions やサーバーレス環境からは必ず Pooler（ポート 6543）を使用。Direct 接続はバッチ・長期接続用途のみ。
4. **セッション再利用**: `getUser()` をキャッシュせず毎回呼ぶ実装（Phase 2 R9 で 157 箇所）は、Auth 往復の RTT を毎回発生させる。一度取得すれば接続解放が早まる。

### 2-4. 期待効果

- Free Plan の concurrent 200 接続に対するヘッドルームが広がり、**ピーク時の接続枯渇（5xx）を回避**。
- 同じ理由で Realtime 200 接続の枯渇リスクも低下。
- 結果として、**Pro 移行を先延ばし**でき、Free Plan の期間を延長可能（コスト削減）。

---

## 3. Pro 移行の判断基準

以下の **いずれか** に該当した場合、Pro Plan（$25/月 + 従量課金）への移行を検討する。複数同時該当で移行を強く推奨。

### 3-1. 必須移行シグナル（障害レベル）

| シグナル | 閾値 | 影響 |
|---------|------|------|
| **DB データサイズ > 400 MB** | 500 MB 超過で read-only | 80% 到達で警告。会員登録・注文が停止する本番障害 |
| **Concurrent 接続数のピーク > 150** | 200 で新規接続拒否 | 75% 到達で警告。ピーク時に API が 5xx を返す |
| **プロジェクトが pause された** | Free は非アクティブで pause | 初回アクセス時に数秒〜数十秒の起動遅延 |

### 3-2. 容量シグナル（成長レベル）

| シグナル | 閾値 | 影響 |
|---------|------|------|
| **MAU > 40,000** | 50,000 MAU で Free 上限 | 80% 到達で警告。新規ユーザーのログインが失敗し始める |
| **Realtime 接続ピーク > 150** | 200 で接続拒否 | チャット・通知等のリアルタイム機能が停止 |
| **Bandwidth > 8 GB/月** | 10 GB で Free 上限 | 画像・アセット配信が制限される |

### 3-3. ビジネスシグナル（運用レベル）

- **SLA が必要**: Free Plan は SLA なし。商用サービスで稼働率保証が必要なら Pro（Team Plan で SLA 明文化）。
- **サポートが必要**: Free はコミュニティサポートのみ。本番障害時に優先サポートが必要なら Team Plan。
- **監査ログ・コンプライアンス**: 本プロジェクトは個人情報（会員・注文）を扱うため、将来的に監査ログ保持が必要になれば Team Plan 以上を検討。

### 3-4. Pro 移行の手順

1. `mcp__supabase__get_cost` で現在の組織の Pro 移行コストを確認（月額 + 従量課金の見積もり）。
2. `mcp__supabase__confirm_cost` でコスト承認 ID を取得。
3. Supabase Dashboard または API でプラン変更（MCP にはプラン変更ツールはないため Dashboard 操作）。
4. 移行後、`get_advisors`（security/performance）で推奨事項を確認。
5. Pro の spend cap 設定を確認（予想外の従量課金を防ぐ）。

> **注意**: Pro 移行はプロジェクトの downtime を伴わない（データはそのまま）。ただし、Free → Pro への変更後も disk サイズは最小 8 GB に調整される（既存データが 1.2 倍 + 最低 8 GB）。

---

## 4. 定期監視の推奨項目

以下を週次またはアラート設定で監視し、閾値の 80% 到達時に早期対応する。

| 項目 | 監視方法 | アラート閾値（Free） |
|------|---------|---------------------|
| DB データサイズ | `execute_sql`: `SELECT pg_database_size('postgres')` | 400 MB (80%) |
| Concurrent 接続数 | `get_logs` (postgres service) または `pg_stat_activity` | 150 (75%) |
| MAU | `execute_sql`: Auth テーブルの 30日間アクティブユーザー集計 | 40,000 (80%) |
| Bandwidth | Dashboard → Usage | 8 GB (80%) |
| セキュリティ推奨 | `get_advisors` (security) | 新規 Critical/Medium 推奨の有無 |

---

## 5. 参照

- Supabase 公式: <https://supabase.com/docs/guides/platform/exhaust-limits>
- Supabase 料金: <https://supabase.com/pricing>
- 接続プール（Supavisor）: <https://supabase.com/docs/guides/database/connecting-to-postgres>
- Disk 自動拡張: <https://supabase.com/docs/guides/platform/database-size>

---

*作成: 2026-06-15 | AC-S1 | 出典: Supabase `search_docs` MCP（2026-06-15 確認）。閾値は更新されるため移行判断時に再確認推奨。*
