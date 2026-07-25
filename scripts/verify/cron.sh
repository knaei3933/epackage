#!/usr/bin/env bash
# ============================================================
# G3/G4: Cron ジョブ手動実行スクリプト (curl ベース)
# ------------------------------------------------------------
# /api/cron/archive-orders        (POST と GET 両方サポート)
# /api/cron/publish-scheduled-posts (GET のみ)
#
# 2 つのエンドポイントを正しい CRON_SECRET で叩き、
# その後、誤った SECRET で 401 になることを確認する。
#
# [必須環境変数]
#   BASE_URL    例: http://localhost:3000
#   CRON_SECRET Cron 検証用シークレット (.env.local の CRON_SECRET と同じ値)
#
# [使い方]
#   BASE_URL=http://localhost:3000 \
#   CRON_SECRET=your-secret \
#   bash scripts/verify/cron.sh
#
# [注意]
#   - 正しい SECRET で実行すると、実際にアーカイブ / 公開が走る。
#     dev 環境または検証用データでのみ実行すること。
#   - 期待ステータス: 正常=200, 認証失敗=401, 設定不備=500
# ============================================================
set -u

if [ -t 1 ]; then
  GREEN=$'\033[0;32m'; RED=$'\033[0;31m'; YELLOW=$'\033[0;33m'
  CYAN=$'\033[0;36m'; RESET=$'\033[0m'
else
  GREEN=""; RED=""; YELLOW=""; CYAN=""; RESET=""
fi

# ---- 必須環境変数チェック ----
if [ -z "${BASE_URL:-}" ] || [ -z "${CRON_SECRET:-}" ]; then
  printf "%s[ENV] BASE_URL と CRON_SECRET は必須です%s\n" "$RED" "$RESET"
  printf "%s使い方: BASE_URL=... CRON_SECRET=... bash %s%s\n" "$YELLOW" "$0" "$RESET"
  exit 2
fi

WRONG_SECRET="wrong-secret-for-401-test"

# ---- 共通: 1 リクエストを実行して HTTP ステータスを表示 ----
# $1: ラベル, $2: HTTP メソッド, $3: URL, $4: Authorization 値(空可)
run_case() {
  local label="$1" method="$2" url="$3" auth="$4"
  local opts=(-sS --max-time 60 -X "$method" -w "\n---\nHTTP_STATUS:%{http_code}\n")
  if [ -n "$auth" ]; then
    opts+=(-H "Authorization: Bearer $auth")
  fi
  printf "\n%s---- %s ----%s\n" "$CYAN" "$label" "$RESET"
  printf "URL: %s %s\n" "$method" "$url"
  curl "${opts[@]}" "$url"
}

# ============================================================
# G3: /api/cron/archive-orders
#   実装メモ (src/app/api/cron/archive-orders/route.ts):
#   - POST と GET 両方実装 (GET は POST へフォワード)
#   - Authorization: Bearer <CRON_SECRET> を検証
#   - 誤 SECRET -> 401
#   - 正常 -> 200 + { success, archivedCount, message }
#   - 環境変数未設定 -> 500
# ============================================================
printf "%s=========================================%s\n" "$CYAN" "$RESET"
printf "%s  G3: /api/cron/archive-orders%s\n" "$CYAN" "$RESET"
printf "%s=========================================%s\n" "$CYAN" "$RESET"

# TC1: POST 正しい SECRET → 期待 200
run_case "TC1 archive-orders POST 正しいSECRET (期待 200)" \
  "POST" "$BASE_URL/api/cron/archive-orders" "$CRON_SECRET"

# TC2: GET 正しい SECRET → 期待 200 (POST へフォワード)
run_case "TC2 archive-orders GET 正しいSECRET (期待 200)" \
  "GET" "$BASE_URL/api/cron/archive-orders" "$CRON_SECRET"

# TC3: POST 誤 SECRET → 期待 401
run_case "TC3 archive-orders POST 誤SECRET (期待 401)" \
  "POST" "$BASE_URL/api/cron/archive-orders" "$WRONG_SECRET"

# TC4: POST 認証ヘッダ無し → 期待 401
run_case "TC4 archive-orders POST 認証ヘッダ無し (期待 401)" \
  "POST" "$BASE_URL/api/cron/archive-orders" ""

# ============================================================
# G4: /api/cron/publish-scheduled-posts
#   実装メモ (src/app/api/cron/publish-scheduled-posts/route.ts):
#   - GET のみ
#   - Authorization: Bearer <CRON_SECRET> を検証
#   - 誤 SECRET / ヘッダ無し -> 401
#   - 正常 -> 200 + { message, count, posts }
# ============================================================
printf "\n%s=========================================%s\n" "$CYAN" "$RESET"
printf "%s  G4: /api/cron/publish-scheduled-posts%s\n" "$CYAN" "$RESET"
printf "%s=========================================%s\n" "$CYAN" "$RESET"

# TC5: GET 正しい SECRET → 期待 200
run_case "TC5 publish-scheduled-posts GET 正しいSECRET (期待 200)" \
  "GET" "$BASE_URL/api/cron/publish-scheduled-posts" "$CRON_SECRET"

# TC6: GET 誤 SECRET → 期待 401
run_case "TC6 publish-scheduled-posts GET 誤SECRET (期待 401)" \
  "GET" "$BASE_URL/api/cron/publish-scheduled-posts" "$WRONG_SECRET"

# TC7: GET 認証ヘッダ無し → 期待 401
run_case "TC7 publish-scheduled-posts GET 認証ヘッダ無し (期待 401)" \
  "GET" "$BASE_URL/api/cron/publish-scheduled-posts" ""

printf "\n%s==== 完了 ====%s\n" "$CYAN" "$RESET"
printf "%s各ケースの HTTP_STATUS を期待値と見比べてください。%s\n" "$YELLOW" "$RESET"
printf "%s  - 正しい SECRET: 200%s\n" "$GREEN" "$RESET"
printf "%s  - 誤 SECRET / ヘッダ無し: 401%s\n" "$YELLOW" "$RESET"
printf "%s  - 環境変数未設定: 500%s\n" "$RED" "$RESET"
