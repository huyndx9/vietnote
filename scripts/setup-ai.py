"""Connect the VIETNOTE travel assistant to DeepSeek in one step.

    python3 scripts/setup-ai.py

You paste your DeepSeek API key once. The script then
  1. signs in to Cloudflare (a browser window opens the first time),
  2. deploys the small proxy in worker/ (free Cloudflare Worker),
  3. stores the key as a Worker secret (it never goes into the repository
     or the public website),
  4. writes the Worker URL into src/content/site.json ("ai_endpoint"),
  5. sends a test question and rebuilds dist/.

Requirements: Node.js (for `npx wrangler`) and a free Cloudflare account.

Other uses:
    python3 scripts/setup-ai.py --endpoint https://vietnote-ai.NAME.workers.dev
        only write an existing Worker URL into site.json
    python3 scripts/setup-ai.py --test
        ask the configured Worker a test question
"""
import argparse
import getpass
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKER = ROOT / 'worker'
SITE_JSON = ROOT / 'src' / 'content' / 'site.json'
WRANGLER = 'wrangler@4'
TEST_ORIGIN = 'http://localhost:8000'


def fail(message):
    print(f'\n[!] {message}')
    sys.exit(1)


def npx():
    path = shutil.which('npx')
    if not path:
        fail('Không tìm thấy Node.js (npx). Cài Node.js LTS từ https://nodejs.org rồi chạy lại.')
    return path


def wrangler(*args, capture=False, stdin_text=None):
    """Run wrangler inside worker/. With capture=True the output is shown live
    (prompts included) and also returned so the Worker URL can be read."""
    cmd = [npx(), '--yes', WRANGLER, *args]
    if stdin_text is not None:
        r = subprocess.run(cmd, cwd=WORKER, input=stdin_text, text=True)
        return r.returncode, ''
    if not capture:
        return subprocess.run(cmd, cwd=WORKER).returncode, ''
    proc = subprocess.Popen(cmd, cwd=WORKER, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    chunks = []
    while True:
        data = proc.stdout.read1(4096) if hasattr(proc.stdout, 'read1') else proc.stdout.read(1)
        if not data:
            break
        chunks.append(data)
        sys.stdout.buffer.write(data)
        sys.stdout.flush()
    return proc.wait(), b''.join(chunks).decode('utf-8', 'replace')


def save_endpoint(url):
    config = json.loads(SITE_JSON.read_text(encoding='utf-8'))
    config['ai_endpoint'] = url
    SITE_JSON.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'\n✓ Đã ghi ai_endpoint = {url} vào src/content/site.json')


def test(url):
    print(f'\nĐang hỏi thử: {url}')
    body = json.dumps({'messages': [{'role': 'user', 'content': '하노이에서 꼭 먹어야 할 음식 하나만 알려 주세요.'}]}).encode()
    req = urllib.request.Request(url, data=body, method='POST', headers={
        'Content-Type': 'application/json', 'Origin': TEST_ORIGIN})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            reply = json.loads(r.read().decode())['reply']
        print('✓ AI trả lời:\n  ' + reply.replace('\n', '\n  '))
        return True
    except urllib.error.HTTPError as e:
        detail = e.read().decode('utf-8', 'replace')
        hint = {'401': 'API key sai', '402': 'tài khoản DeepSeek hết tiền',
                '429': 'gọi quá nhiều, đợi một lát'}
        code = (re.search(r'"status":\s*(\d+)', detail) or [None, ''])[1]
        print(f'[!] Worker trả lỗi {e.code}: {detail}' + (f' → {hint[code]}' if code in hint else ''))
    except Exception as e:  # network errors, DNS not ready yet, ...
        print(f'[!] Chưa gọi được Worker: {e}. Worker mới có thể cần 1–2 phút để hoạt động.')
    return False


def rebuild():
    subprocess.run([sys.executable, str(ROOT / 'src' / 'build.py')], cwd=ROOT, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--endpoint', help='chỉ ghi URL Worker có sẵn vào site.json')
    parser.add_argument('--test', action='store_true', help='hỏi thử Worker đã cấu hình')
    args = parser.parse_args()

    if args.test:
        url = json.loads(SITE_JSON.read_text(encoding='utf-8')).get('ai_endpoint')
        if not url:
            fail('site.json chưa có ai_endpoint.')
        sys.exit(0 if test(url) else 1)
    if args.endpoint:
        if not re.match(r'^https://\S+$', args.endpoint):
            fail('URL phải bắt đầu bằng https://')
        save_endpoint(args.endpoint.rstrip('/'))
        rebuild()
        return

    print('=== Kết nối trợ lý VIETNOTE với DeepSeek ===\n')
    key = os.environ.get('DEEPSEEK_API_KEY') or getpass.getpass(
        'Dán DeepSeek API key rồi nhấn Enter (ký tự sẽ không hiện ra): ').strip()
    if not key:
        fail('Chưa nhập API key.')
    if not key.startswith('sk-'):
        print('  (Lưu ý: key DeepSeek thường bắt đầu bằng "sk-". Vẫn tiếp tục.)')

    print('\n[1/4] Kiểm tra đăng nhập Cloudflare…')
    code, out = wrangler('whoami', capture=True)
    if code != 0 or 'not authenticated' in out.lower() or 'You are not' in out:
        print('Trình duyệt sẽ mở để đăng nhập Cloudflare (tạo tài khoản miễn phí nếu chưa có).')
        if wrangler('login')[0] != 0:
            fail('Đăng nhập Cloudflare không thành công.')

    print('\n[2/4] Triển khai Worker…')
    code, out = wrangler('deploy', capture=True)
    if code != 0:
        fail('Triển khai Worker không thành công (xem thông báo ở trên).')
    found = re.findall(r'https://[A-Za-z0-9.-]+\.workers\.dev', out)
    url = found[-1] if found else input('\nKhông tự đọc được URL. Dán URL Worker (https://…workers.dev): ').strip()

    print('\n[3/4] Lưu API key thành secret của Worker…')
    if wrangler('secret', 'put', 'DEEPSEEK_API_KEY', stdin_text=key + '\n')[0] != 0:
        fail('Không lưu được secret.')

    print('\n[4/4] Cập nhật website…')
    save_endpoint(url)
    rebuild()
    test(url)
    print('\nXong. Chạy thử: python3 -m http.server 8000 --directory dist  → http://localhost:8000')
    print('Để website công khai có chatbot: commit src/content/site.json rồi push lên main.')


if __name__ == '__main__':
    main()
