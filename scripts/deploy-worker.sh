#!/usr/bin/env bash
# Deploy worker/ and store the DeepSeek key as its secret. Used by the Pages
# workflow; needs CLOUDFLARE_API_TOKEN and DEEPSEEK_API_KEY in the environment
# (CLOUDFLARE_ACCOUNT_ID only if the token can see several accounts).
# Prints the Worker URL as `url=...` to $GITHUB_OUTPUT (or stdout).
set -euo pipefail
cd "$(dirname "$0")/../worker"
if [ -z "${DEEPSEEK_API_KEY:-}" ]; then
  echo "::error::Thiếu secret DEEPSEEK_API_KEY (Settings → Secrets and variables → Actions)."
  exit 1
fi
# A new Cloudflare account has no workers.dev subdomain yet and wrangler cannot
# create one non-interactively, so register it through the API when missing.
register_subdomain() {
  local api=https://api.cloudflare.com/client/v4 acct cur name
  local auth="Authorization: Bearer ${CLOUDFLARE_API_TOKEN:-}"
  acct=${CLOUDFLARE_ACCOUNT_ID:-$(curl -fsS -H "$auth" "$api/accounts" | python3 -c \
    'import sys,json; r=json.load(sys.stdin).get("result") or []; print(r[0]["id"] if len(r)==1 else "")' 2>/dev/null || true)}
  [ -n "$acct" ] || { echo "Không xác định được tài khoản Cloudflare; bỏ qua đăng ký subdomain."; return 0; }
  cur=$(curl -sS -H "$auth" "$api/accounts/$acct/workers/subdomain" | python3 -c \
    'import sys,json; print(((json.load(sys.stdin).get("result")) or {}).get("subdomain",""))' 2>/dev/null || true)
  if [ -n "$cur" ]; then echo "workers.dev subdomain: $cur"; return 0; fi
  owner=$(printf '%s' "${GITHUB_REPOSITORY_OWNER:-vietnote}" | tr 'A-Z_' 'a-z-')
  for name in "$owner" "$owner-vietnote" "vietnote-$(date +%s)"; do
    if curl -sS -X PUT -H "$auth" -H 'Content-Type: application/json' \
         --data "{\"subdomain\":\"$name\"}" "$api/accounts/$acct/workers/subdomain" \
       | python3 -c 'import sys,json; sys.exit(0 if json.load(sys.stdin).get("success") else 1)'; then
      echo "Đã đăng ký workers.dev subdomain: $name"
      return 0
    fi
  done
  echo "Không tự đăng ký được workers.dev subdomain."
}
register_subdomain || true

if ! out=$(npx --yes wrangler@4 deploy 2>&1); then
  echo "$out"
  echo "::error::Triển khai Cloudflare Worker thất bại. Kiểm tra CLOUDFLARE_API_TOKEN (mẫu 'Edit Cloudflare Workers'). Nếu báo thiếu workers.dev subdomain: vào dash.cloudflare.com → Workers & Pages → Account details → Subdomain để đặt tên, rồi chạy lại."
  exit 1
fi
echo "$out"
url=$(printf '%s\n' "$out" | grep -oE 'https://[A-Za-z0-9.-]+\.workers\.dev' | tail -n 1 || true)
if [ -z "$url" ]; then
  echo "::error::Không đọc được URL workers.dev từ kết quả triển khai."
  exit 1
fi
printf '%s' "$DEEPSEEK_API_KEY" | npx --yes wrangler@4 secret put DEEPSEEK_API_KEY
echo "Worker URL: $url"
echo "url=$url" >> "${GITHUB_OUTPUT:-/dev/stdout}"
