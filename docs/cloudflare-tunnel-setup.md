# Cloudflare Tunnel設定ガイド（完全版）

チャットボット（LM Studio）をインターネット公開して、Vercelからアクセスできるようにする設定手順です。

## 準備完了状態

✅ cloudflaredインストール済み（`C:\Windows\System32\cloudflared.exe`）
✅ トンネルID: `b0969852-9c7d-4c83-ba3f-5ed679dc8ea1`

---

## 完全コピペ用 - 手順1から5まで順番に実行

### PowerShellで以下を実行

**1. ディレクトリ作成（まだない場合）**
```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\kanei\.cloudflared"
```

**2. トークン取得（表示されたJSONをコピー）**
```powershell
C:\Windows\System32\cloudflared.exe tunnel token b0969852-9c7d-4c83-ba3f-5ed679dc8ea1
```

**3. 認証情報をファイルに保存（上記で表示されたJSONを貼り付け）**
```powershell
# 上記コマンドの結果（eyJhbGciOiJI...のようなJSON）をコピーして、以下を実行：
$token = "ここにコピーしたトークンを貼り付け"
$token | Out-File -FilePath "C:\Users\kanei\.cloudflared\cert.json" -Encoding utf8
```

**重要:** 上記の「ここにコピーしたトークンを貼り付け」の部分を、実際のトークン（`eyJhbGciOiJI...`で始まる文字列）に置き換えて実行してください。

**4. 設定ファイル作成（origincertは不要）**
```powershell
@"
url: http://localhost:1234
tunnel: b0969852-9c7d-4c83-ba3f-5ed679dc8ea1
credentials-file: C:\Users\kanei\.cloudflared\cert.json
"@ | Out-File -FilePath "C:\Users\kanei\.cloudflared\config.yml" -Encoding utf8
```

**5. LM Studioを起動確認してから、トンネル実行**
```powershell
# LM Studioが起動していて、ポート1234で待機していることを確認してから実行
C:\Windows\System32\cloudflared.exe tunnel --config C:\Users\kanei\.cloudflared\config.yml run
```

---

## 実行結果

成功すると、以下のようなURLが表示されます：

```
2026-03-03Txx:xx:xxZ INF ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
2026-03-03Txx:xx:xxZ INF
  b0969852-9c7d-4c83-ba3f-5ed679dc8ea1.trycloudflare.com
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
2026-03-03Txx:xx:xxZ INF https://b0969852-9c7d-4c83-ba3f-5ed679dc8ea1.trycloudflare.com
```

**表示されたURLをコピーしてください：**
```
https://b0969852-9c7d-4c83-ba3f-5ed679dc8ea1.trycloudflare.com/v1
```

---

## Vercel環境変数設定

**Vercelダッシュボード > Settings > Environment Variables** に追加：

```
LMSTUDIO_BASE_URL=https://b0969852-9c7d-4c83-ba3f-5ed679dc8ea1.trycloudflare.com/v1
```

---

## トラブルシューティング

### エラー: tunnel not found

```powershell
C:\Windows\System32\cloudflared.exe tunnel list
```

トンネルが存在するか確認してください。

### エラー: Connection refused

LM Studioが起動していない、またはポート1234で待機していないことを確認してください。

```powershell
# ポート確認
netstat -an | findstr "1234"
```

### エラー: Invalid credentials

cert.jsonファイルの内容が正しいか確認してください。トークンコマンドを再実行して、新しいトークンを取得してください。

---

## 設定ファイル内容

`C:\Users\kanei\.cloudflared\config.yml`:

```yaml
url: http://localhost:1234
tunnel: b0969852-9c7d-4c83-ba3f-5ed679dc8ea1
credentials-file: C:\Users\kanei\.cloudflared\cert.json
```

**注意:** `origincert`は不要です！`credentials-file`だけを使用してください。

---

## ファイル構成

```
C:\Users\kanei\
└── .cloudflared\
    ├── config.yml           # 設定ファイル
    └── cert.json            # 認証ファイル（トークン）
```

---

## 【簡易版】トークンを使った直接実行（設定ファイル不要）

```powershell
# トークン取得
C:\Windows\System32\cloudflared.exe tunnel token b0969852-9c7d-4c83-ba3f-5ed679dc8ea1

# トークンを使って直接実行（トークンを貼り付け）
C:\Windows\System32\cloudflared.exe tunnel run --url http://localhost:1234 b0969852-9c7d-4c83-ba3f-5ed679dc8ea1
```

---
