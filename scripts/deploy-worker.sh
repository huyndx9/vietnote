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
if ! out=$(npx --yes wrangler@4 deploy 2>&1); then
  echo "$out"
  echo "::error::Triển khai Cloudflare Worker thất bại. Kiểm tra CLOUDFLARE_API_TOKEN (mẫu 'Edit Cloudflare Workers'). Nếu báo thiếu workers.dev subdomain: mở dash.cloudflare.com → Workers & Pages một lần rồi chạy lại."
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
