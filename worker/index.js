// VIETNOTE travel assistant proxy.
// The browser sends the conversation here; this Worker adds the secret
// DEEPSEEK_API_KEY (stored with `wrangler secret put`, never in the repo)
// and forwards the request to DeepSeek.

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MAX_MESSAGES = 10;
const MAX_CHARS = 1000; // per user message
const MAX_REPLY_CHARS = 6000; // earlier assistant replies kept as context
const SYSTEM_PROMPT = [
  "당신은 한국인 여행자를 위한 베트남 여행 매거진 VIETNOTE의 여행 도우미입니다. 베트남을 잘 아는 한국인 여행 작가처럼 답하세요.",
  // Language: the site is only for Korean visitors.
  "질문이 어떤 언어로 오더라도 항상 자연스러운 한국어(존댓말)로 답하세요.",
  "장소·음식 이름은 한국에서 흔히 쓰는 한글 표기를 먼저 쓰고 처음 한 번만 베트남어 원어를 괄호로 병기하세요. 예: 호안끼엠 호수(Hồ Hoàn Kiếm), 반미(bánh mì).",
  "베트남어 표현을 알려 줄 때는 베트남어, 한글 발음, 뜻을 함께 쓰세요. 예: Cảm ơn(깜언) = 감사합니다.",
  // Korean traveller context.
  "비용은 원화를 먼저, 베트남 동을 괄호로 함께 쓰세요. 예: 약 3만 원(약 60만 동). 환율은 대략적인 값이라고 밝히세요.",
  "한국인 여행자 관점의 실용 정보를 담으세요: 한국 출발 직항 도시와 대략적인 비행시간, 한국과의 시차(베트남이 2시간 느림), 짧은 일정(3박 4일, 4박 5일 등)에 맞춘 동선, 부모님·아이·커플 등 동행별 팁, 그랩(Grab) 같은 현지 앱 사용, 환전·카드·팁 문화, 한국 사람 입맛에 맞는 음식 추천과 향신료(고수 등) 팁.",
  "입국·비자·면세 한도처럼 한국 여권 기준으로 자주 바뀌는 정보는 단정하지 말고 외교부 해외안전여행이나 주한 베트남 대사관 등 공식 안내를 확인하라고 안내하세요.",
  // Answer shape.
  "답변은 구체적이고 실용적으로 작성하세요. 일반론 대신 실제 장소 이름, 동선, 이동 수단과 대략적인 소요 시간, 추천 음식과 식당 종류, 대략적인 비용, 시기·날씨 팁, 주의할 점을 담으세요.",
  "여행 일정 질문에는 날짜별로 '오전 / 오후 / 저녁'을 나누고, 각 일정에 무엇을 왜 하는지 한두 문장씩 설명한 뒤 마지막에 교통·숙소 위치·예산 팁을 정리하세요.",
  "읽기 쉽게 짧은 소제목(### ), 목록(- ), 굵은 글씨(**)를 사용하세요. 표는 쓰지 마세요.",
  "간단한 질문에는 짧게, 일정·비교·추천 질문에는 충분히 자세하게 답하세요.",
  "베트남 여행, 음식, 문화, 일정, 교통, 간단한 베트남어 표현에 관한 질문에 답합니다. 관련 없는 질문은 정중히 거절하고 베트남 여행 이야기로 안내하세요.",
  "요금, 운영 시간처럼 바뀔 수 있는 정보는 끝에 한 줄로 방문 전 공식 안내를 확인하라고 덧붙이세요.",
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
    const allowed = (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
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

    // stream: true (current site) relays DeepSeek's server-sent events as they
    // arrive so the reply appears word by word; without it the whole reply is
    // returned as JSON (pages built before streaming existed).
    const stream = body.stream === true;
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
          stream,
        }),
      });
    } catch {
      return json({ error: "upstream_unreachable" }, 502, cors);
    }
    if (!upstream.ok) {
      // 401 = wrong key, 402 = no balance, 429 = rate limited.
      return json({ error: "upstream_error", status: upstream.status }, 502, cors);
    }
    if (stream) {
      // Lines are "data: {json}", "data: [DONE]" or ": keep-alive" comments.
      return new Response(upstream.body, {
        status: 200,
        headers: {
          ...cors,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        },
      });
    }
    const data = await upstream.json().catch(() => null);
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) return json({ error: "empty_reply" }, 502, cors);
    return json({ reply }, 200, cors);
  },
};
