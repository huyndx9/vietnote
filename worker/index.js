// VIETNOTE travel assistant proxy.
// The browser sends the conversation here; this Worker adds the secret
// DEEPSEEK_API_KEY (stored with `wrangler secret put`, never in the repo)
// and forwards the request to DeepSeek.

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MAX_MESSAGES = 10;
const MAX_CHARS = 1000;
const SYSTEM_PROMPT = [
  "당신은 베트남 여행 매거진 VIETNOTE의 여행 도우미입니다.",
  "한국 여행자에게 한국어로, 친절하고 간결하게(보통 5문장 이내) 답하세요.",
  "베트남 여행, 음식, 문화, 일정, 교통, 간단한 베트남어 표현에 관한 질문에 답합니다.",
  "관련 없는 질문은 정중히 거절하고 베트남 여행 이야기로 안내하세요.",
  "요금, 운영 시간, 입국 조건처럼 바뀔 수 있는 정보는 방문 전 공식 안내를 확인하라고 덧붙이세요.",
  "확실하지 않은 내용은 지어내지 말고 모른다고 말하세요.",
].join("\n");

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const okOrigin = allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": okOrigin ? origin : allowed[0] || "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);
    if (!okOrigin) return json({ error: "forbidden_origin" }, 403, cors);
    if (!env.DEEPSEEK_API_KEY) return json({ error: "missing_api_key" }, 500, cors);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "bad_request" }, 400, cors);
    }
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0)
      return json({ error: "bad_request" }, 400, cors);

    const history = body.messages
      .slice(-MAX_MESSAGES)
      .filter((m) => m && typeof m.content === "string" && m.content.trim())
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content.slice(0, MAX_CHARS),
      }));
    if (history.length === 0) return json({ error: "bad_request" }, 400, cors);

    let upstream;
    try {
      upstream = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.DEEPSEEK_MODEL || "deepseek-chat",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
          max_tokens: 700,
          temperature: 0.7,
        }),
      });
    } catch {
      return json({ error: "upstream_unreachable" }, 502, cors);
    }
    if (!upstream.ok) {
      // 401 = wrong key, 402 = no balance, 429 = rate limited.
      return json({ error: "upstream_error", status: upstream.status }, 502, cors);
    }
    const data = await upstream.json().catch(() => null);
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) return json({ error: "empty_reply" }, 502, cors);
    return json({ reply }, 200, cors);
  },
};
