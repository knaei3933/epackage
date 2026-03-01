# Xserver DNS 設定手順

## 概要

`chatbot.package-lab.com` サブドメインを、Cloudflare Tunnelに接続するためのDNS設定手順です。

---

## 前提条件

- Cloudflareアカウントを作成済み
- Cloudflare Tunnelを作成済み（トンネルID: `b0969852-9c7d-4c83-ba3f-5ed679dc8ea1`）
- Xserverの管理画面にアクセス可能

---

## 手順1: Cloudflare Tunnel情報の確認

Cloudflare Zero Trustダッシュボードで、トンネルの情報を確認します：

1. [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) にアクセス
2. **Networks** → **Tunnels** をクリック
3. トンネル `chatbot-package-lab` を選択
4. **Public Hostname** を確認：
   - `chatbot.package-lab.com` が設定されているはず
5. トンネルIDをメモ：`b0969852-9c7d-4c83-ba3f-5ed679dc8ea1`

---

## 手順2: Xserver DNS設定

1. **Xserverサーバーパネル** にログイン
   - URL: https://www.xserver.jp/login/

2. **ドメイン** → **DNSレコード設定** をクリック

3. **DNSレコード追加** をクリック

4. 以下の設定を入力：

| 項目 | 値 |
|------|-----|
| **ホスト名** | `chatbot` |
| **種別** | `CNAME` |
| **内容** | `b0969852-9c7d-4c83-ba3f-5ed679dc8ea1.cfargotunnel.com` |
| **TTL** | `3600` （またはデフォルト） |

5. **確認する** をクリック

---

## 手順3: DNS反映確認

DNSの反映には時間がかかります（通常5分〜1時間）。

### 確認コマンド（Windows PowerShell）：

```powershell
# DNS照会（何度か実行）
Resolve-DnsName chatbot.package-lab.com

# または
nslookup chatbot.package-lab.com
```

### 正常に設定されている場合の応答：

```
名前: chatbot.package-lab.com
Addresses:  <CloudflareのIPアドレス>
Aliases: b0969852-9c7d-4c83-ba3f-5ed679dc8ea1.cfargotunnel.com
```

---

## 手順4: 動作確認

DNSが反映されたら、以下のURLでLM Studioにアクセスできることを確認します：

```
https://chatbot.package-lab.com/v1/models
```

**正常な場合の応答：**
```json
{
  "object": "list",
  "data": [
    {
      "id": "zai-org/glm-4.6v-flash",
      ...
    }
  ]
}
```

---

## トラブルシューティング

### Q1. DNSが反映されない

**A:** 以下を確認してください：
- TTLが正しく設定されているか
- Xserverで「変更前の状態に戻す」ボタンを押していないか
- プロバイDNSのキャッシュをクリアする

### Q2. 接続エラーが発生する

**A:** 以下を確認してください：
- LM Studioが起動しているか
- Cloudflare Tunnelが実行中か
- ファイアウォールがブロックしていないか

### Q3. 証証エラー

**A:** ブラウザでシークレットモードを使用して接続してください。

---

## Vercel環境変数設定

### 開発環境（ローカル）

`.env.local` ファイル：
```env
LMSTUDIO_BASE_URL=http://localhost:1234/v1
```

**説明:** ローカル開発時は、この設定でLM Studio（localhost:1234）に接続します。

### 本番環境（Vercel）

Vercelダッシュボード → Settings → Environment Variables：

```env
LMSTUDIO_BASE_URL=https://chatbot.package-lab.com/v1
```

**設定対象:**
- Environment: `Production`, `Preview`
- 保存後、**Redeploy** を実行

---

## アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│  ユーザー（ブラウザ）                                          │
├─────────────────────────────────────────────────────────────┤
│  https://package-lab.com/                                 │
│       ↓                                                     │
│  右下のチャットアイコンをクリック                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Vercel (クラウド)                                           │
├─────────────────────────────────────────────────────────────┤
│  LMSTUDIO_BASE_URL=https://chatbot.package-lab.com/v1      │
│       ↓                                                     │
│  /api/chat POST → chatbot.package-lab.com                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Xserver DNS                                                 │
├─────────────────────────────────────────────────────────────┤
│  chatbot.package-lab.com → CNAME                          │
│       ↓                                                     │
│  b0969852-9c7d-4c83-ba3f-5ed679dc8ea1.cfargotunnel.com      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Tunnel                                           │
├─────────────────────────────────────────────────────────────┤
│  chatbot.package-lab.com                                  │
│       ↓                                                     │
│  軺長接続                                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  あなたのPC（ローカル）                                     │
├─────────────────────────────────────────────────────────────┤
│  LM Studio (localhost:1234)                                │
│       ↓                                                     │
│  モデル: zai-org/glm-4.6v-flash                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 注意事項

1. **PCをシャットダウンするとチャットボットも停止します**
   - 営業時間内はPCを起動したままにしてください
   - または、別のサーバーでLM Studioを実行してください

2. **LM Studioの起動を確認**
   - チャットボットを使用する前に、LM Studioが起動していることを確認してください
   - ポート1234が使用可能であることを確認してください

3. **セキュリティ**
   - トンネルは認証されていません
   - LM Studioの設定で「Allow Cross-Origin Requests」を有効にしてください

---

## 更新日

- 2026-03-01: 作成
