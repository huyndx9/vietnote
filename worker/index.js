// VIETNOTE travel assistant proxy.
// The browser sends the conversation here; this Worker adds the secret
// DEEPSEEK_API_KEY (stored with `wrangler secret put`, never in the repo)
// and forwards the request to DeepSeek.

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MAX_MESSAGES = 10;
const MAX_CHARS = 1000; // per user message
const MAX_REPLY_CHARS = 6000; // earlier assistant replies kept as context
const SYSTEM_PROMPT = [
  "당신은 베트남 여행 매거진 VIETNOTE의 여행 도우미입니다. 현지 사정을 잘 아는 친절한 여행 작가처럼 답하세요.",
  "질문한 사람의 언어로 답하세요(한국어 질문에는 한국어, 베트남어 질문에는 베트남어). 언어가 분명하지 않으면 한국어로 답하세요.",
  "답변은 구체적이고 실용적으로 작성하세요. 일반론 대신 실제 장소 이름, 동선, 이동 수단과 대략적인 소요 시간, 추천 음식과 식당 종류, 대략적인 비용(베트남 동과 원화), 시기·날씨 팁, 주의할 점을 담으세요.",
  "여행 일정 질문에는 날짜별로 '오전 / 오후 / 저녁'을 나누고, 각 일정에 무엇을 왜 하는지 한두 문장씩 설명한 뒤 마지막에 교통·숙소 위치·예산 팁을 정리하세요.",
  "읽기 쉽게 짧은 소제목(### ), 목록(- ), 굵은 글씨(**)를 사용하세요. 표는 쓰지 마세요.",
  "간단한 질문에는 짧게, 일정·비교·추천 질문에는 충분히 자세하게 답하세요.",
  "베트남 여행, 음식, 문화, 일정, 교통, 간단한 베트남어 표현에 관한 질문에 답합니다. 관련 없는 질문은 정중히 거절하고 베트남 여행 이야기로 안내하세요.",
  "요금, 운영 시간, 입국 조건처럼 바뀔 수 있는 정보는 끝에 한 줄로 방문 전 공식 안내를 확인하라고 덧붙이세요.",
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
        content: m.content.slice(0, m.role === "assistant" ? MAX_REPLY_CHARS : MAX_CHARS),
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
          max_tokens: 2500,
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
