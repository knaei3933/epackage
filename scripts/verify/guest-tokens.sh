#!/usr/bin/env bash
# ============================================================
# G1/G2: ゲストトークン検証スクリプト (curl ベース)
# ------------------------------------------------------------
# /designer-order/[token] と /upload/[token] の token 検証を
# curl で実行し、HTTP ステータスと本文を期待結果と突き合わせる。
#
# [前提]
#   - ターゲットサーバが起動中であること
#     (dev: http://localhost:3000 / 本番: https://www.package-lab.com)
#   - 検証用 token が DB に登録済みであること
#     (作成手順は guest-tokens-db.md 参照)
#
# [必須環境変数]
#   BASE_URL         例: http://localhost:3000
#   DESIGNER_TOKEN   designer_task_assignments に登録した有効 token (43文字)
#   UPLOAD_TOKEN     designer_upload_tokens    に登録した有効 token (43文字)
#
# [任意環境変数]
#   EXPIRED_DESIGNER_TOKEN    期限切れ designer-order 用 token
#   CANCELLED_DESIGNER_TOKEN  status='cancelled' の designer-order 用 token
#   EXPIRED_UPLOAD_TOKEN      期限切れ upload 用 token
#   REVOKED_UPLOAD_TOKEN      status!='active' の upload 用 token
#
# [使い方]
#   BASE_URL=http://localhost:3000 \
#   DESIGNER_TOKEN=xxx \
#   UPLOAD_TOKEN=yyy \
#   bash scripts/verify/guest-tokens.sh
#
# [注意]
#   - このスクリプトは GET のみで副作用なし。ただし
#     designer_task_assignments.last_accessed_at は更新される。
#   - bash(Git Bash / Linux / macOS) で動作。POSIX sh では動かない。
# ============================================================
set -u

# ---- 色付け (TTY のみ) ----
if [ -t 1 ]; then
  GREEN=$'\033[0;32m'; RED=$'\033[0;31m'; YELLOW=$'\033[0;33m'
  CYAN=$'\033[0;36m'; RESET=$'\033[0m'
else
  GREEN=""; RED=""; YELLOW=""; CYAN=""; RESET=""
fi

PASS=0
FAIL=0

# ---- 必須環境変数チェック ----
check_env() {
  local missing=0
  for v in BASE_URL DESIGNER_TOKEN UPLOAD_TOKEN; do
    # 間接展開で変数名を組み立てて値を取り出す
    val=${!v:-}
    if [ -z "$val" ]; then
      printf "%s[ENV] 必須環境変数 %s が未設定です%s\n" "$RED" "$v" "$RESET"
      missing=1
    fi
  done
  if [ "$missing" -ne 0 ]; then
    printf "%s使い方: BASE_URL=... DESIGNER_TOKEN=... UPLOAD_TOKEN=... bash %s%s\n" \
      "$YELLOW" "$0" "$RESET"
    exit 2
  fi
}

# ---- HTTP ステータス + Location を取得 ----
# 標準出力: "<status>|<location>"
fetch_status() {
  local url="$1"
  local hdrs
  # -D - でレスポンスヘッダを stdout へ。tr で CR を除去。
  hdrs=$(curl -sS -o /dev/null -D - --max-time 30 "$url" 2>/dev/null | tr -d '\r')
  local status loc
  status=$(printf '%s' "$hdrs" | awk 'NR==1{print $2}')
  loc=$(printf '%s' "$hdrs" | awk -F': ' 'tolower($1)=="location"{print $2}')
  printf '%s|%s' "$status" "$loc"
}

# ---- 本文に文言が含まれるか (200 ページ用) ----
contains_body() {
  local url="$1" needle="$2"
  curl -sS --max-time 30 "$url" 2>/dev/null | grep -q -- "$needle"
}

# ---- 期待: HTTP ステータス一致 ----
assert_status() {
  local label="$1" url="$2" expected="$3"
  local result status
  result=$(fetch_status "$url")
  status=${result%%|*}
  if [ "$status" = "$expected" ]; then
    printf "%s[PASS]%s %s -> HTTP %s (期待:%s)\n" \
      "$GREEN" "$RESET" "$label" "$status" "$expected"
    PASS=$((PASS+1))
  else
    printf "%s[FAIL]%s %s -> HTTP %s (期待:%s)\n" \
      "$RED" "$RESET" "$label" "$status" "$expected"
    FAIL=$((FAIL+1))
  fi
}

# ---- 期待: 本文に文言が含まれる ----
assert_body() {
  local label="$1" url="$2" needle="$3"
  if contains_body "$url" "$needle"; then
    printf "%s[PASS]%s %s -> 本文に「%s」を確認\n" \
      "$GREEN" "$RESET" "$label" "$needle"
    PASS=$((PASS+1))
  else
    printf "%s[FAIL]%s %s -> 本文に「%s」が見つからない\n" \
      "$RED" "$RESET" "$label" "$needle"
    FAIL=$((FAIL+1))
  fi
}

# ---- 期待: リダイレクト (307/308) で Location に文言を含む ----
assert_redirect() {
  local label="$1" url="$2" needle_loc="$3"
  local result status loc
  result=$(fetch_status "$url")
  status=${result%%|*}
  loc=${result#*|}
  if { [ "$status" = "307" ] || [ "$status" = "308" ]; } \
     && printf '%s' "$loc" | grep -q -- "$needle_loc"; then
    printf "%s[PASS]%s %s -> %s -> %s\n" \
      "$GREEN" "$RESET" "$label" "$status" "$loc"
    PASS=$((PASS+1))
  else
    printf "%s[FAIL]%s %s -> %s (loc=%s) 期待:307/308 -> ...%s\n" \
      "$RED" "$RESET" "$label" "$status" "$loc" "$needle_loc"
    FAIL=$((FAIL+1))
  fi
}

# ---- ランダム token 生成 (推測攻撃の模擬, 43文字 base64url) ----
gen_token() {
  node -e "console.log(require('crypto').randomBytes(32).toString('base64url').substring(0,43))" 2>/dev/null
}

# ============================================================
# 検証開始
# ============================================================
check_env

RANDOM_TOKEN=$(gen_token)
SHORT_TOKEN="short-invalid-token"  # 形式不正 (43文字でない)

# ============================================================
# G1: /designer-order/[token]
#   実装メモ (src/app/designer-order/[token]/page.tsx):
#   - token 形式は /^[A-Za-z0-9_-]{43}$/
#   - SHA-256(token) で access_token_hash を検索 (designer_task_assignments)
#   - 期限切れ / 無効 / 形式不正 はすべて HTTP 200 でインライン表示
#     (リダイレクトではない)
#   - status='cancelled' は現状チェックされない → TC5 で実証
# ============================================================
printf "\n%s==== G1: /designer-order/[token] 検証 ====%s\n" "$CYAN" "$RESET"
printf "対象: %s/designer-order/<token>\n" "$BASE_URL"

# TC1: 有効 token → 200
assert_status "TC1 有効 token" \
  "$BASE_URL/designer-order/$DESIGNER_TOKEN" "200"

# TC2: 期限切れ token → 200 + 本文に「만료」
if [ -n "${EXPIRED_DESIGNER_TOKEN:-}" ]; then
  assert_status "TC2 期限切れ token" \
    "$BASE_URL/designer-order/$EXPIRED_DESIGNER_TOKEN" "200"
  assert_body   "TC2 期限切れ token 本文" \
    "$BASE_URL/designer-order/$EXPIRED_DESIGNER_TOKEN" "만료"
else
  printf "%s[SKIP] TC2 期限切れ token (EXPIRED_DESIGNER_TOKEN 未設定)%s\n" "$YELLOW" "$RESET"
fi

# TC3: 形式不正 (短縮) → 200 + 本文に「형식」
#   ※ SHORT_TOKEN が43文字でないため tokenFormatValid=false →
#      「잘못된 토큰 형식입니다」を表示
assert_status "TC3 形式不正(短縮) token" \
  "$BASE_URL/designer-order/$SHORT_TOKEN" "200"
assert_body   "TC3 形式不正(短縮) token 本文" \
  "$BASE_URL/designer-order/$SHORT_TOKEN" "형식"

# TC4: ランダム token (推測) → 200 + 本文に「올바른」
#   ※ 形式は妥当(43字)だが DB に存在しない →
#      「올바른 링크인지 확인해 주세요」を表示
if [ -n "$RANDOM_TOKEN" ]; then
  assert_status "TC4 推測 token (ランダム43字)" \
    "$BASE_URL/designer-order/$RANDOM_TOKEN" "200"
  assert_body   "TC4 推測 token 本文" \
    "$BASE_URL/designer-order/$RANDOM_TOKEN" "올바른"
else
  printf "%s[SKIP] TC4 ランダム token 生成失敗 (node 要インストール)%s\n" "$YELLOW" "$RESET"
fi

# TC5: status='cancelled' の designer-order token
#   現状は access_token_hash 合致で 200 表示。遮断ロジックなし。
#   期待: 200 (後述のとおり、これは仕様上の懸念点)
if [ -n "${CANCELLED_DESIGNER_TOKEN:-}" ]; then
  assert_status "TC5 cancelled designer token (現状 200で表示)" \
    "$BASE_URL/designer-order/$CANCELLED_DESIGNER_TOKEN" "200"
  printf "%s      ※ designer-order は status=cancelled でも hash 合致で 200 を返す。%s\n" "$YELLOW" "$RESET"
  printf "%s         遮断が必要な場合は page.tsx 側で status チェックを追加すること。%s\n" "$YELLOW" "$RESET"
else
  printf "%s[SKIP] TC5 cancelled designer token (CANCELLED_DESIGNER_TOKEN 未設定)%s\n" "$YELLOW" "$RESET"
fi

# ============================================================
# G2: /upload/[token]
#   実装メモ (src/app/upload/[token]/page.tsx):
#   - token 形式は /^[A-Za-z0-9_-]{43}$/
#   - SHA-256(token) で token_hash を検索 (designer_upload_tokens)
#   - 期限切れ / status!='active' / 形式不正 は
#     すべて /upload/invalid へリダイレクト (307 または 308)
# ============================================================
printf "\n%s==== G2: /upload/[token] 検証 ====%s\n" "$CYAN" "$RESET"
printf "対象: %s/upload/<token>\n" "$BASE_URL"

# TC6: 有効 token → 200
assert_status "TC6 有効 token" \
  "$BASE_URL/upload/$UPLOAD_TOKEN" "200"

# TC7: 期限切れ → 307/308 -> /upload/invalid?reason=expired
if [ -n "${EXPIRED_UPLOAD_TOKEN:-}" ]; then
  assert_redirect "TC7 期限切れ upload token" \
    "$BASE_URL/upload/$EXPIRED_UPLOAD_TOKEN" "reason=expired"
else
  printf "%s[SKIP] TC7 期限切れ upload token (EXPIRED_UPLOAD_TOKEN 未設定)%s\n" "$YELLOW" "$RESET"
fi

# TC8: revoked/used token (status!='active') -> /upload/invalid?reason=cancelled
if [ -n "${REVOKED_UPLOAD_TOKEN:-}" ]; then
  assert_redirect "TC8 revoked upload token" \
    "$BASE_URL/upload/$REVOKED_UPLOAD_TOKEN" "reason=cancelled"
else
  printf "%s[SKIP] TC8 revoked upload token (REVOKED_UPLOAD_TOKEN 未設定)%s\n" "$YELLOW" "$RESET"
fi

# TC9: 形式不正 (短縮) -> /upload/invalid
assert_redirect "TC9 形式不正 upload token" \
  "$BASE_URL/upload/$SHORT_TOKEN" "/upload/invalid"

# TC10: ランダム token (推測) -> /upload/invalid
if [ -n "$RANDOM_TOKEN" ]; then
  assert_redirect "TC10 推測 upload token" \
    "$BASE_URL/upload/$RANDOM_TOKEN" "/upload/invalid"
fi

# ============================================================
# 集計
# ============================================================
printf "\n%s==== 集計 ====%s\n" "$CYAN" "$RESET"
printf "PASS: %d / FAIL: %d\n" "$PASS" "$FAIL"

[ "$FAIL" -ne 0 ] && exit 1
exit 0
