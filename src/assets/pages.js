// Site root path such as "/" or "/vietnote/", written by src/build.py.
const BASE = document.querySelector('meta[name="vietnote-base"]')?.content || "/";
const content = window.VIETNOTE_CONTENT || [];
const categoryNames = {
  destinations: "여행지",
  itineraries: "추천 일정",
  food: "음식과 카페",
  journal: "현지인의 노트",
  guides: "여행 준비",
};
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}
function saveStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    toast("브라우저 저장 공간을 사용할 수 없습니다.");
    return false;
  }
}
let saved = readStore("vietnote.saved", []);
if (!Array.isArray(saved)) saved = [];
function toast(message) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.textContent = message;
  document.body.append(el);
  setTimeout(() => el.remove(), 3200);
}
function syncSave() {
  document.querySelectorAll("[data-save]").forEach((b) => {
    let yes = saved.includes(b.dataset.save);
    b.setAttribute("aria-pressed", String(yes));
    b.setAttribute("aria-label", yes ? "여행 노트에서 삭제" : "여행 노트에 저장");
    b.textContent = b.classList.contains("save-button")
      ? yes
        ? "♥"
        : "♡"
      : yes
        ? "♥ 저장됨"
        : "♡ 여행 노트에 저장";
  });
}
// Same markup as src/templates/card.html, for cards drawn in the browser (notebook).
const regionClass = { 북부: "north", 중부: "central", 남부: "south" };
function card(x) {
  const image = x.photo
    ? `<img loading="lazy" src="${x.photo}" alt="${esc(x.title)} 관련 풍경">`
    : '<div class="guide-art">✦</div>';
  const region = x.region
    ? ` <span class="region-tag ${regionClass[x.region] || ""}">${esc(x.region)}</span>`
    : "";
  const stamp = x.vi && x.photo ? `<span class="postcard-stamp" lang="vi">${esc(x.vi)}</span>` : "";
  return (
    `<article class="browse-card">` +
    `<div class="card-image"><a href="${x.url}" tabindex="-1" aria-hidden="true">${image}</a>${stamp}` +
    `<button class="save-button" data-save="${x.id}" aria-label="여행 노트에 저장">♡</button></div>` +
    `<div class="meta">${categoryNames[x.category]}${region}</div>` +
    `<h2><a href="${x.url}">${esc(x.title)}</a></h2><p>${esc(x.desc)}</p>` +
    `<span class="card-go" aria-hidden="true">↗</span></article>`
  );
}
function renderNotebook() {
  const host = document.getElementById("notebookItems");
  if (!host) return;
  const items = content.filter((x) => saved.includes(x.id));
  host.innerHTML = items.map(card).join("");
  document.getElementById("notebookEmpty").hidden = items.length > 0;
  syncSave();
  renderFeedback();
}
document.addEventListener("click", async (e) => {
  const save = e.target.closest("[data-save]");
  if (save) {
    const id = save.dataset.save;
    const next = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    if (saveStore("vietnote.saved", next)) {
      saved = next;
      syncSave();
      renderNotebook();
      toast(saved.includes(id) ? "여행 노트에 저장했습니다." : "여행 노트에서 삭제했습니다.");
    }
  }
  const share = e.target.closest("[data-share]");
  if (share) {
    try {
      if (navigator.share) await navigator.share({ title: document.title, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        toast("페이지 링크를 복사했습니다.");
      }
    } catch (err) {
      if (err.name !== "AbortError") toast("주소창의 링크를 복사해 공유해 주세요.");
    }
  }
  const copy = e.target.closest("[data-copy]");
  if (copy) {
    try {
      await navigator.clipboard.writeText(copy.dataset.copy);
      toast("베트남어 문장을 복사했습니다.");
    } catch {
      toast("문장을 선택해 복사해 주세요.");
    }
  }
});
function toggleMenu(open) {
  document.getElementById("mobilemenu")?.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
}
let previousFocus = null;
function closeModal() {
  document.getElementById("searchOverlay")?.remove();
  document.body.style.overflow = "";
  previousFocus?.focus();
}
function openSearch(query = "") {
  closeModal();
  previousFocus = document.activeElement;
  const el = document.createElement("div");
  el.className = "overlay open";
  el.id = "searchOverlay";
  el.innerHTML = `
    <div class="modal global-search" role="dialog" aria-modal="true" aria-labelledby="searchTitle">
      <button class="close" aria-label="검색 닫기">×</button>
      <div class="section-no">SEARCH VIETNOTE</div>
      <h2 id="searchTitle">Find your story.</h2>
      <input id="globalQuery" aria-label="검색어" placeholder="도시, 음식, 여행 정보 검색">
      <p class="list-count" id="searchCount" role="status"></p>
      <div class="search-results" id="searchResults"></div>
    </div>`;
  document.body.append(el);
  document.body.style.overflow = "hidden";
  el.querySelector(".close").onclick = closeModal;
  el.onclick = (e) => {
    if (e.target === el) closeModal();
  };
  const input = el.querySelector("input");
  input.value = query;
  input.oninput = renderResults;
  renderResults();
  input.focus();
  el.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const nodes = [...el.querySelectorAll("button,input,a")];
      let first = nodes[0],
        last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
// ---- Search -----------------------------------------------------------
// Readers type several words ("다낭 12월 날씨"), other spellings ("호치민",
// "나짱") and travel slang ("유심", "그랩", "맛집"). Each word becomes a group of
// synonyms; items are ranked by how many groups they match, then by where
// (title > place > summary > body). Diacritics are ignored.
const SEARCH_SYNONYMS = [
  ["호치민", "호찌민", "호찌민시", "사이공", "saigon", "ho chi minh", "hcm"],
  ["나짱", "나트랑", "nha trang"], ["다낭", "da nang", "danang"], ["호이안", "hoi an"],
  ["하노이", "hanoi", "ha noi"], ["푸꾸옥", "푸국", "phu quoc"], ["하롱", "하롱베이", "ha long", "halong"],
  ["달랏", "da lat", "dalat"], ["사파", "sa pa", "sapa"], ["후에", "hue"], ["무이네", "mui ne"],
  ["유심", "usim", "심카드", "sim", "esim", "이심", "데이터", "로밍", "통신"],
  ["그랩", "grab", "택시", "차량 호출", "콜택시"],
  ["맛집", "음식", "먹거리", "식당", "food"],
  ["치안", "안전", "소매치기", "위험", "사기"],
  ["무비자", "비자", "입국", "전자비자", "evisa", "e-visa", "45일"],
  ["환전", "환율", "현금", "카드", "atm", "vnd", "물가", "예산", "경비"],
  ["날씨", "기후", "우기", "건기", "태풍", "계절", "언제"],
  ["쌀국수", "퍼", "pho", "phở"], ["반미", "banh mi"], ["분짜", "bun cha"],
  ["커피", "카페", "에그커피", "cà phê"], ["야시장", "시장", "night market"],
  ["가는 법", "가는법", "교통", "이동", "공항", "버스", "기차"],
  ["부모님", "효도", "어르신"], ["아이", "아기", "유모차", "가족"], ["마사지", "스파"], ["쇼핑", "기념품"],
];
const foldText = (s) =>
  // NFC again afterwards: NFD also splits Hangul syllables into jamo.
  String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC").replace(/đ/gi, "d").toLocaleLowerCase();
const SEARCH_GROUPS = SEARCH_SYNONYMS.map((g) => g.map(foldText));
function queryGroups(q) {
  const text = foldText(q).replace(/(가는) (법)/g, "$1$2");
  const words = text.split(/[\s,·/]+/).filter((w) => w.length > 0);
  return words.map((w) => {
    if (/^\d{1,2}월$/.test(w)) return [w, ...SEARCH_GROUPS.find((g) => g.includes("날씨"))];
    const hit = SEARCH_GROUPS.find((g) => g.some((t) => t === w || (w.length > 1 && t.startsWith(w))));
    return hit ? [...new Set([w, ...hit])] : [w];
  });
}
function searchItems(q, items = content) {
  const groups = queryGroups(q);
  if (!groups.length) return items;
  const ranked = items.map((x) => {
    const fields = [
      [foldText(x.title), 6], [foldText([x.city, x.keywords, categoryNames[x.category]].join(" ")), 5],
      [foldText(x.desc), 3], [foldText(x.sections.flat().join(" ")), 1],
    ];
    let matched = 0, score = 0;
    for (const g of groups) {
      let best = 0;
      for (const [text, w] of fields) if (w > best && g.some((t) => text.includes(t))) best = w;
      if (best) { matched++; score += best; }
    }
    return { x, matched, score };
  });
  const top = Math.max(0, ...ranked.map((r) => r.matched));
  return ranked.filter((r) => top && r.matched === top).sort((a, b) => b.score - a.score).map((r) => r.x);
}
function monthHint(q) {
  const m = foldText(q).match(/(\d{1,2})월/);
  const data = window.VIETNOTE_MONTHS;
  if (!m || !data || +m[1] < 1 || +m[1] > 12) return "";
  const i = +m[1] - 1;
  return `<div class="search-month"><strong>${i + 1}월 지역별 날씨</strong>${data.regions
    .map((r) => `<span class="m-${r.months[i]}">${esc(r.label)} · ${esc(data.legend[r.months[i]])}</span>`)
    .join("")}</div>`;
}
function renderResults() {
  const q = document.getElementById("globalQuery").value.trim();
  const results = q ? searchItems(q) : content;
  document.getElementById("searchCount").textContent = results.length + "개의 여행 노트";
  document.getElementById("searchResults").innerHTML =
    monthHint(q) +
    (results.length
      ? results
          .map(
            (x) =>
              `<a class="search-result" href="${x.url}"><small>${categoryNames[x.category]}</small><strong>${esc(x.title)}</strong><p>${esc(x.desc)}</p></a>`,
          )
          .join("")
      : '<p class="empty">검색 결과가 없습니다. 도시 이름이나 "비자", "환전", "날씨"처럼 짧게 입력해 보세요.</p>');
}
function setupFilters() {
  const grid = document.getElementById("browseGrid");
  if (!grid) return;
  const input = document.getElementById("browseQuery");
  let filter = "전체";
  function run() {
    let count = 0;
    const q = input.value.trim().toLowerCase();
    for (const el of grid.children) {
      const link = el.querySelector("h2 a");
      const x = content.find((v) => v.url === link.getAttribute("href"));
      const matches =
        (!q || searchItems(q, [x]).length > 0) &&
        (filter === "전체" || x.region === filter || x.city === filter);
      el.hidden = !matches;
      if (matches) count++;
    }
    document.getElementById("listCount").textContent = count + "개의 노트";
    document.getElementById("browseEmpty").hidden = count > 0;
  }
  input.oninput = run;
  document.querySelectorAll("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        filter = b.dataset.filter;
        document.querySelectorAll("[data-filter]").forEach((c) => {
          c.classList.toggle("active", c === b);
          c.setAttribute("aria-pressed", String(c === b));
        });
        run();
      }),
  );
  run();
}
function renderFeedback() {
  const host = document.getElementById("savedFeedback");
  if (!host) return;
  let notes = readStore("vietnote.feedback", []);
  if (!Array.isArray(notes)) notes = [];
  host.innerHTML = notes.length
    ? notes
        .map(
          (n, i) =>
            `<div class="feedback-entry"><button data-delete-note="${i}">삭제</button><strong>${esc(n.article)}</strong><p>${esc(n.message)}</p></div>`,
        )
        .join("")
    : "<p>저장한 메모가 없습니다.</p>";
  host.querySelectorAll("button").forEach(
    (b) =>
      (b.onclick = () => {
        notes.splice(Number(b.dataset.deleteNote), 1);
        if (saveStore("vietnote.feedback", notes)) renderFeedback();
      }),
  );
}
const feedback = document.getElementById("feedbackForm");
if (feedback) {
  const id = new URLSearchParams(location.search).get("article");
  const x = content.find((v) => v.id === id);
  if (x) feedback.elements.article.value = x.title;
  feedback.onsubmit = (e) => {
    e.preventDefault();
    let notes = readStore("vietnote.feedback", []);
    if (!Array.isArray(notes)) notes = [];
    notes.unshift({
      article: feedback.elements.article.value.trim(),
      message: feedback.elements.message.value.trim(),
    });
    if (saveStore("vietnote.feedback", notes)) {
      document.getElementById("feedbackStatus").textContent =
        "이 브라우저에 저장했습니다. 운영자에게 전송되지는 않았습니다.";
      feedback.reset();
    }
  };
}
function setupAI() {
  // Worker URL from site.json "ai_endpoint" (see scripts/setup-ai.py). Empty = not connected.
  const endpoint = document.querySelector('meta[name="vietnote-ai"]')?.content.trim() || "";
  const host = document.createElement("div");
  const suggestions = endpoint
    ? `<div class="ai-suggestions">
          <button type="button">부모님과 다낭 3박 4일 일정 추천해 줘</button>
          <button type="button">푸꾸옥 4박 5일 예산은 얼마나 들까요?</button>
          <button type="button">고수 못 먹는 사람을 위한 베트남 음식 추천</button>
          <button type="button">택시·그랩 탈 때 쓰는 베트남어 알려 줘</button>
        </div>`
    : `<div class="connection-note"><strong>AI 연결 준비 중</strong><br>DeepSeek API가 아직 연결되지 않아 AI 답변을 생성할 수 없습니다. 아래 항목은 편집된 여행 콘텐츠로 이동합니다.</div>
        <div class="ai-suggestions">
          <a href="${BASE}articles/danang-4days/">부모님과 다낭 3박 4일 ↗</a>
          <a href="${BASE}food/">베트남 음식과 커피 알아보기 ↗</a>
          <a href="${BASE}articles/language/">여행 베트남어 표현 보기 ↗</a>
        </div>`;
  host.innerHTML = `
    <div class="ai-mascot-dock">
      <button type="button" class="ai-launcher" aria-label="AI에게 물어보기" title="AI에게 물어보기" aria-expanded="false" aria-controls="aiPanel">
        <span class="ai-mascot" aria-hidden="true"></span>
      </button>
      <button type="button" class="ai-motion-toggle" aria-label="자동 재생 일시 정지" aria-pressed="false">Ⅱ</button>
    </div>
    <section class="ai-panel" id="aiPanel" role="dialog" aria-label="베트남 여행 도우미" hidden>
      <header class="ai-header">
        <span class="ai-avatar" aria-hidden="true"></span>
        <div class="ai-title"><strong>베트남 여행 도우미</strong><small>VIETNOTE · AI 여행 도우미</small></div>
        <button type="button" class="ai-close" aria-label="도우미 닫기">×</button>
      </header>
      <div class="ai-body">
        <p class="ai-greeting"><strong class="ai-hello" lang="vi">Xin chào!</strong> 어떤 베트남 여행을 꿈꾸세요?<br>${endpoint ? "궁금한 것을 편하게 물어보세요." : "먼저 여행 노트에서 아이디어를 찾아보세요."}</p>
        ${suggestions}
        <div class="ai-messages" role="log" aria-live="polite"></div>
      </div>
      <footer class="ai-footer">
        <form class="ai-compose">${
          endpoint
            ? '<input name="q" maxlength="1000" autocomplete="off" enterkeyhint="send" aria-label="질문 입력" placeholder="베트남 여행에 대해 물어보세요"><button type="submit" class="ai-send" aria-label="전송"><span aria-hidden="true">↑</span></button>'
            : '<input disabled aria-label="AI 연결 후 질문 가능" placeholder="API 연결 후 질문할 수 있어요"><button type="submit" class="ai-send" aria-label="전송" disabled><span aria-hidden="true">↑</span></button>'
        }</form>
        ${endpoint ? '<p class="ai-disclaimer">AI 답변은 틀릴 수 있어요. 요금·운영 시간·입국 조건은 공식 안내를 확인해 주세요.</p>' : ""}
      </footer>
    </section>`;
  document.body.append(host);
  const launcher = host.querySelector(".ai-launcher"),
    panel = host.querySelector(".ai-panel");
  const dock = host.querySelector(".ai-mascot-dock"),
    motionToggle = host.querySelector(".ai-motion-toggle"),
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let motionPaused = reducedMotion.matches;
  function syncMotion() {
    dock.classList.toggle("is-paused", motionPaused);
    motionToggle.textContent = motionPaused ? "▶" : "Ⅱ";
    motionToggle.setAttribute("aria-pressed", String(motionPaused));
    motionToggle.setAttribute(
      "aria-label",
      motionPaused ? "자동 재생 시작" : "자동 재생 일시 정지",
    );
  }
  motionToggle.onclick = () => {
    motionPaused = !motionPaused;
    syncMotion();
  };
  reducedMotion.addEventListener("change", (event) => {
    motionPaused = event.matches;
    syncMotion();
  });
  document.addEventListener("visibilitychange", () =>
    dock.classList.toggle("is-away", document.hidden),
  );
  syncMotion();
  function show(open) {
    panel.hidden = !open;
    dock.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("ai-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    if (open)
      (
        panel.querySelector(".ai-compose input:not(:disabled)") || panel.querySelector(".ai-close")
      ).focus();
    else launcher.focus();
  }
  launcher.onclick = () => show(panel.hidden);
  host.querySelector(".ai-close").onclick = () => show(false);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) show(false);
  });
  if (endpoint) setupChat(host, endpoint);
}
function setupChat(host, endpoint) {
  const form = host.querySelector(".ai-compose"),
    input = form.elements.q,
    send = form.querySelector(".ai-send"),
    scroller = host.querySelector(".ai-body"),
    log = host.querySelector(".ai-messages"),
    history = [];
  let controller = null; // AbortController of the reply being received
  // Follow the reply as it grows, unless the reader has scrolled up to reread.
  let follow = true;
  scroller.addEventListener("scroll", () => {
    follow = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 60;
  });
  function toBottom() {
    if (follow) scroller.scrollTop = scroller.scrollHeight;
  }
  function add(role, text) {
    const p = document.createElement("div");
    p.className = `ai-msg ai-msg-${role}`;
    p.textContent = text; // never innerHTML: replies are untrusted text
    log.append(p);
    follow = true;
    toBottom();
    return p;
  }
  // Minimal Markdown (### headings, - / 1. lists, **bold**) built as DOM
  // nodes with textContent, so model output can never inject HTML.
  function inline(el, text) {
    text.split(/(\*\*[^*]+\*\*)/).forEach((part) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        const b = document.createElement("strong");
        b.textContent = part.slice(2, -2);
        el.append(b);
      } else if (part) el.append(part.replace(/\*\*/g, ""));
    });
  }
  function renderReply(el, text) {
    el.textContent = "";
    let list = null;
    for (const raw of text.replace(/\r/g, "").split("\n")) {
      const line = raw.trim();
      const bullet = line.match(/^[-*•]\s+(.*)/),
        numbered = line.match(/^(\d+)[.)]\s+(.*)/);
      if (bullet || numbered) {
        const tag = bullet ? "UL" : "OL";
        if (!list || list.tagName !== tag) el.append((list = document.createElement(tag)));
        const li = document.createElement("li");
        inline(li, bullet ? bullet[1] : numbered[2]);
        list.append(li);
        continue;
      }
      list = null;
      if (!line || /^-{3,}$/.test(line)) continue;
      const heading = line.match(/^#{1,6}\s+(.*)/);
      const node = document.createElement(heading ? "h4" : "p");
      inline(node, heading ? heading[1] : line);
      el.append(node);
    }
  }
  // Reads "data: {...}" server-sent events and calls onText with each piece.
  async function readStream(response, onText) {
    const reader = response.body.getReader(),
      decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split("\n");
      buffer = done ? "" : lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue; // ": keep-alive" comments, blank lines
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return;
        let event = null;
        try {
          event = JSON.parse(payload);
        } catch {
          continue;
        }
        const piece = event?.choices?.[0]?.delta?.content;
        if (piece) onText(piece);
      }
      if (done) return;
    }
  }
  function setBusy(busy) {
    form.classList.toggle("is-busy", busy);
    send.setAttribute("aria-label", busy ? "답변 멈추기" : "전송");
    send.innerHTML = busy
      ? '<span aria-hidden="true">■</span>'
      : '<span aria-hidden="true">↑</span>';
  }
  async function ask(question) {
    const q = question.trim();
    if (!q || controller) return;
    controller = new AbortController();
    setBusy(true);
    host.querySelector(".ai-suggestions")?.remove();
    add("user", q);
    history.push({ role: "user", content: q });
    const reply = add("assistant", "");
    reply.classList.add("is-pending");
    reply.innerHTML =
      '<span class="ai-typing" aria-label="답변을 준비하고 있어요"><i></i><i></i><i></i></span>';
    let text = "",
      frame = 0;
    const paint = () => {
      frame = 0;
      renderReply(reply, text);
      toBottom();
    };
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-10), stream: true }),
        signal: controller.signal,
      });
      if (!r.ok) throw new Error(r.status);
      if ((r.headers.get("Content-Type") || "").includes("text/event-stream") && r.body) {
        await readStream(r, (piece) => {
          if (!text) reply.classList.remove("is-pending");
          text += piece;
          // Redraw at most once per frame however fast the pieces arrive.
          if (!frame) frame = requestAnimationFrame(paint);
        });
      } else {
        const data = await r.json(); // a Worker deployed before streaming
        text = data.reply || "";
      }
      if (!text) throw new Error("empty");
      cancelAnimationFrame(frame);
      paint();
      history.push({ role: "assistant", content: text });
    } catch (error) {
      cancelAnimationFrame(frame);
      if (error.name === "AbortError" && text) {
        paint();
        const note = document.createElement("p");
        note.className = "ai-stopped";
        note.textContent = "답변을 멈췄어요.";
        reply.append(note);
        history.push({ role: "assistant", content: text });
      } else {
        reply.textContent =
          error.name === "AbortError"
            ? "답변을 멈췄어요."
            : "지금은 답변할 수 없어요. 잠시 후 다시 시도해 주세요.";
        reply.classList.add("is-error");
        history.pop(); // let the user ask the same question again
      }
    } finally {
      reply.classList.remove("is-pending");
      controller = null;
      setBusy(false);
      toBottom();
      input.focus();
    }
  }
  form.onsubmit = (e) => {
    e.preventDefault();
    if (controller) {
      controller.abort(); // the send button doubles as "stop" while a reply streams
      return;
    }
    const q = input.value;
    input.value = "";
    ask(q);
  };
  host
    .querySelectorAll(".ai-suggestions button")
    .forEach((b) => (b.onclick = () => ask(b.textContent)));
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    toggleMenu(false);
  }
});
window.addEventListener("storage", () => {
  saved = readStore("vietnote.saved", []);
  syncSave();
  renderNotebook();
});
syncSave();
setupFilters();
renderNotebook();
setupAI();

// Homepage postcards: every few seconds one card turns over and shows a
// destination that has not been on screen yet. One card at a time, zig-zagging
// between the two rows so a column never turns twice in a row. The pool comes from
// the build (postcardPool). Pauses on hover/focus, off screen, in a hidden tab,
// with the pause button, and never starts with reduced motion.
function setupPostcards() {
  const host = document.querySelector(".postcards"),
    data = document.getElementById("postcardPool"),
    pauseButton = document.querySelector(".postcard-pause");
  if (!host || !data) return;
  const cards = [...host.querySelectorAll(".postcard")];
  let queue = [];
  try {
    queue = JSON.parse(data.textContent);
  } catch {
    return;
  }
  if (!queue.length || !cards.length) return;
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  // The cards' own places join the end of the queue as they are replaced.
  const showing = cards.map((card) => ({
    url: card.getAttribute("href"),
    vi: card.querySelector(".postcard-stamp").textContent,
    name: card.querySelector(".postcard-body strong").textContent,
    region: [...card.querySelector(".region-tag").classList].find((c) => c !== "region-tag"),
    regionLabel: card.querySelector(".region-tag").textContent,
    tagline: card.querySelector(".postcard-body > span:last-child").textContent,
    src: card.querySelector("img").getAttribute("src"),
    srcset: card.querySelector("img").getAttribute("srcset") || "",
    alt: card.querySelector("img").alt,
  }));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const INTERVAL = 3200;
  // Zig-zag through the grid as laid out now (2 x 4 on wide screens, 2 x 2 on
  // phones): column +1 each turn, rows alternating, so a column never turns
  // twice in a row. Wide: r1c1, r2c2, r1c3, r2c4, r2c1, r1c2, r2c3, r1c4.
  function cardForStep(i) {
    const visible = cards.filter((c) => c.offsetParent);
    const xs = [...new Set(visible.map((c) => Math.round(c.offsetLeft)))].sort((a, b) => a - b);
    const ys = [...new Set(visible.map((c) => Math.round(c.offsetTop)))].sort((a, b) => a - b);
    const cols = xs.length,
      rows = ys.length;
    if (cols < 2 || rows < 2) return cards.indexOf(visible[i % visible.length]);
    const col = i % cols,
      row = (Math.floor(i / cols) + i) % rows;
    const card = visible.find(
      (c) => Math.round(c.offsetLeft) === xs[col] && Math.round(c.offsetTop) === ys[row],
    );
    return cards.indexOf(card || visible[i % visible.length]);
  }
  let step = 0,
    slot = 0,
    timer = 0,
    busy = false,
    onScreen = false,
    hovering = false,
    paused = reduce.matches;

  function fill(card, place) {
    card.href = place.url;
    card.querySelector(".postcard-stamp").textContent = place.vi;
    card.querySelector(".postcard-body strong").textContent = place.name;
    const tag = card.querySelector(".region-tag");
    tag.className = `region-tag ${place.region}`;
    tag.textContent = place.regionLabel;
    card.querySelector(".postcard-body > span:last-child").textContent = place.tagline;
    const img = card.querySelector("img");
    if (place.srcset) img.srcset = place.srcset;
    else img.removeAttribute("srcset");
    img.src = place.src;
    img.alt = place.alt;
  }
  async function preload(place) {
    const img = new Image();
    if (place.srcset) {
      img.sizes = cards[0].querySelector("img").sizes || "25vw";
      img.srcset = place.srcset;
    }
    img.src = place.src;
    try {
      await img.decode();
    } catch {
      /* show it anyway; the browser will finish loading */
    }
  }
  async function turn() {
    if (busy) return;
    busy = true;
    slot = cardForStep(step);
    step++;
    const card = cards[slot],
      next = queue.shift();
    await preload(next);
    const half = { duration: 380, fill: "forwards" };
    await card.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(90deg)" }], {
      ...half,
      easing: "cubic-bezier(.5,0,.75,0)",
    }).finished;
    queue.push(showing[slot]);
    showing[slot] = next;
    fill(card, next);
    const back = card.animate([{ transform: "rotateY(-90deg)" }, { transform: "rotateY(0deg)" }], {
      ...half,
      easing: "cubic-bezier(.25,1,.5,1)",
    });
    await back.finished;
    card.getAnimations().forEach((a) => a.cancel());
    busy = false;
  }
  function running() {
    return !paused && !hovering && onScreen && !document.hidden;
  }
  function schedule() {
    clearTimeout(timer);
    if (running())
      timer = setTimeout(async () => {
        await turn();
        schedule();
      }, INTERVAL);
  }
  function syncButton() {
    if (!pauseButton) return;
    pauseButton.hidden = false;
    pauseButton.setAttribute("aria-pressed", String(paused));
    pauseButton.innerHTML = paused ? "▶ <span>자동 넘기기</span>" : "Ⅱ <span>멈추기</span>";
    pauseButton.setAttribute(
      "aria-label",
      paused ? "여행지 카드 자동 넘기기 시작" : "여행지 카드 자동 넘기기 멈추기",
    );
  }
  pauseButton?.addEventListener("click", () => {
    paused = !paused;
    syncButton();
    schedule();
  });
  host.addEventListener("pointerenter", () => {
    hovering = true;
    schedule();
  });
  host.addEventListener("pointerleave", () => {
    hovering = false;
    schedule();
  });
  host.addEventListener("focusin", () => {
    hovering = true;
    schedule();
  });
  host.addEventListener("focusout", () => {
    hovering = host.matches(":hover");
    schedule();
  });
  document.addEventListener("visibilitychange", schedule);
  new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      schedule();
    },
    { threshold: 0.35 },
  ).observe(host);
  syncButton();
}
setupPostcards();

// Homepage route notes: every few seconds one note is torn in half across the
// middle (the top half stays on the peg a moment, the bottom half drops) and a
// new itinerary from #routePool swings onto the peg.
function setupRouteNotes() {
  const grid = document.querySelector(".route-grid"),
    data = document.getElementById("routePool"),
    pauseButton = document.querySelector(".route-pause");
  if (!grid || !data) return;
  const cards = [...grid.querySelectorAll(".route-card")];
  let queue = [];
  try {
    queue = JSON.parse(data.textContent);
  } catch {
    return;
  }
  if (!queue.length || !cards.length) return;
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  const read = (card) => {
    const img = card.querySelector("img");
    return {
      url: card.querySelector("h3 a").getAttribute("href"),
      title: card.querySelector("h3 a").textContent,
      city: card.querySelector(".meta").textContent,
      length: card.querySelector(".route-length").textContent,
      days: [...card.querySelectorAll(".route-days li")].map((li) => li.textContent),
      src: img.getAttribute("src"),
      srcset: img.getAttribute("srcset") || "",
      alt: img.alt,
    };
  };
  const showing = cards.map(read);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const INTERVAL = 4200;
  let step = 0,
    timer = 0,
    busy = false,
    onScreen = false,
    hovering = false,
    paused = reduce.matches;

  function fill(card, r) {
    card.querySelectorAll("a").forEach((a) => (a.href = r.url));
    card.querySelector("h3 a").textContent = r.title;
    card.querySelector(".meta").textContent = r.city;
    card.querySelector(".route-length").textContent = r.length;
    const list = card.querySelector(".route-days");
    list.replaceChildren(
      ...r.days.map((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        return li;
      }),
    );
    const img = card.querySelector("img");
    if (r.srcset) img.srcset = r.srcset;
    else img.removeAttribute("srcset");
    img.src = r.src;
    img.alt = r.alt;
  }
  async function preload(r) {
    const img = new Image();
    if (r.srcset) {
      img.sizes = cards[0].querySelector("img").sizes || "31vw";
      img.srcset = r.srcset;
    }
    img.src = r.src;
    try {
      await img.decode();
    } catch {
      /* show it anyway */
    }
  }
  // A ragged line across the middle of the note, as polygon points (x%, y%).
  function tearLine() {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const y = 48 + (i % 2 ? 1.6 : -1.6) + (Math.random() * 2 - 1) * 1.8 + (i / 16) * 4;
      pts.push(`${(i / 16) * 100}% ${y.toFixed(2)}%`);
    }
    return pts;
  }
  function shred(card, tilt, tint, half, clip) {
    const piece = card.cloneNode(true);
    piece.classList.add("route-shred", half);
    piece.setAttribute("aria-hidden", "true");
    piece.inert = true;
    piece.querySelectorAll("img").forEach((i) => (i.loading = "eager"));
    Object.assign(piece.style, {
      left: card.offsetLeft + "px",
      top: card.offsetTop + "px",
      width: card.offsetWidth + "px",
      height: card.offsetHeight + "px",
      clipPath: `polygon(${clip})`,
    });
    piece.style.setProperty("--tilt", tilt + "deg");
    piece.style.setProperty("--paper-tint", tint);
    grid.append(piece);
    return piece;
  }
  async function turn() {
    if (busy) return;
    busy = true;
    const slot = step % cards.length;
    step++;
    const card = cards[slot],
      next = queue.shift();
    await preload(next);
    const cs = getComputedStyle(card);
    const tilt = parseFloat(cs.getPropertyValue("--tilt")) || 0,
      tint = cs.getPropertyValue("--paper-tint");
    const line = tearLine();
    const top = shred(card, tilt, tint, "top", ["0% -80px", "100% -80px", ...line.slice().reverse()].join(","));
    const bottom = shred(card, tilt, tint, "bottom", [...line, "100% calc(100% + 80px)", "0% calc(100% + 80px)"].join(","));
    const rot = (d) => `rotate(${(tilt + d).toFixed(2)}deg)`;
    card.style.opacity = "0";
    queue.push(showing[slot]);
    showing[slot] = next;
    fill(card, next);
    const fell = bottom.animate(
      [
        { transform: rot(0) },
        { transform: `translate(2px, 8px) ${rot(4)}`, offset: 0.18 },
        { transform: `translate(26px, 260px) ${rot(16)}`, opacity: 0 },
      ],
      { duration: 1100, easing: "cubic-bezier(.5,0,.85,.55)", fill: "forwards" },
    );
    const hung = top.animate(
      [
        { transform: rot(0) },
        { transform: rot(-5), offset: 0.3 },
        { transform: rot(3), opacity: 1, offset: 0.55 },
        { transform: `translateY(-10px) ${rot(1)}`, opacity: 0 },
      ],
      { duration: 1000, easing: "ease-out", fill: "forwards" },
    );
    await new Promise((r) => setTimeout(r, 650));
    card.style.opacity = "";
    const swing = card.animate(
      [
        { transform: `translateY(-36px) ${rot(9)}`, opacity: 0 },
        { opacity: 1, offset: 0.3 },
        { transform: rot(-4), offset: 0.6 },
        { transform: rot(1.5), offset: 0.82 },
        { transform: rot(0) },
      ],
      { duration: 900, easing: "ease-out" },
    );
    await Promise.all([fell.finished, hung.finished, swing.finished]);
    top.remove();
    bottom.remove();
    busy = false;
  }
  function running() {
    return !paused && !hovering && onScreen && !document.hidden;
  }
  function schedule() {
    clearTimeout(timer);
    if (running())
      timer = setTimeout(async () => {
        await turn();
        schedule();
      }, INTERVAL);
  }
  function syncButton() {
    if (!pauseButton) return;
    pauseButton.hidden = false;
    pauseButton.setAttribute("aria-pressed", String(paused));
    pauseButton.innerHTML = paused ? "▶ <span>자동 넘기기</span>" : "Ⅱ <span>멈추기</span>";
    pauseButton.setAttribute("aria-label", paused ? "추천 일정 자동 넘기기 시작" : "추천 일정 자동 넘기기 멈추기");
  }
  pauseButton?.addEventListener("click", () => {
    paused = !paused;
    syncButton();
    schedule();
  });
  for (const [type, value] of [
    ["pointerenter", true],
    ["pointerleave", false],
    ["focusin", true],
  ])
    grid.addEventListener(type, (e) => {
      if (e.pointerType === "touch") return;
      hovering = value;
      schedule();
    });
  grid.addEventListener("focusout", () => {
    hovering = grid.matches(":hover");
    schedule();
  });
  document.addEventListener("visibilitychange", schedule);
  new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      schedule();
    },
    { threshold: 0.35 },
  ).observe(grid);
  syncButton();
}
setupRouteNotes();

function setupHeroSlideshow() {
  const slides = [...document.querySelectorAll(".hero-slide")];
  // With a single photograph there is nothing to rotate; hide the dots and pause button.
  if (slides.length < 2) {
    document.querySelector(".hero-controls")?.remove();
    return;
  }
  const dotsHost = document.querySelector(".hero-dots"),
    pause = document.querySelector(".hero-pause");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0,
    timer = null,
    paused = false;
  const dots = slides.map((slide, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hero-dot";
    button.setAttribute("aria-label", slide.dataset.place);
    button.setAttribute("aria-pressed", String(i === 0));
    button.onclick = () => {
      show(i);
      schedule();
    };
    dotsHost.append(button);
    return button;
  });
  function ready(i) {
    return slides[i].complete && slides[i].naturalWidth > 0;
  }
  function show(next) {
    if (next === current || !ready(next)) return;
    slides.forEach((s, i) => {
      s.classList.toggle("is-leaving", i === current);
      s.classList.toggle("is-active", i === next);
      s.setAttribute("aria-hidden", String(i !== next));
    });
    current = next;
    document.getElementById("heroPlace").textContent = slides[current].dataset.place;
    dots.forEach((dot, i) => dot.setAttribute("aria-pressed", String(i === current)));
  }
  function schedule() {
    clearInterval(timer);
    if (!paused && !document.hidden)
      timer = setInterval(() => {
        for (let step = 1; step < slides.length; step++) {
          const next = (current + step) % slides.length;
          if (ready(next)) {
            show(next);
            break;
          }
        }
      }, 3000);
  }
  function sync() {
    pause.textContent = paused ? "▶" : "Ⅱ";
    pause.setAttribute("aria-label", paused ? "자동 재생 시작" : "자동 재생 일시 정지");
    schedule();
  }
  pause.onclick = () => {
    paused = !paused;
    sync();
  };
  document.addEventListener("visibilitychange", schedule);
  // Reduced motion removes the CSS transition; the requested 3-second rotation remains active.
  sync();
}
setupHeroSlideshow();

// Homepage history roll: arrows, timeline chips and the counter follow the
// card nearest the left edge. No autoplay; swipe, trackpad and keys scroll natively.
(() => {
  const track = document.getElementById("historyTrack");
  if (!track) return;
  const disclosure = track.closest("details");
  const cards = [...track.children];
  const marks = [...document.querySelectorAll("[data-history-index]")];
  const prev = document.getElementById("historyPrev");
  const next = document.getElementById("historyNext");
  const status = document.getElementById("historyStatus");
  const timeline = marks[0]?.closest(".history-timeline");
  let active = 0,
    requested = null;
  const pad = (n) => String(n).padStart(2, "0");
  function setActive(i) {
    active = i;
    marks.forEach((m, k) => m.setAttribute("aria-current", String(k === i)));
    status.textContent = `${pad(i + 1)} / ${pad(cards.length)}`;
    prev.disabled = i === 0;
    next.disabled = i === cards.length - 1;
    const m = marks[i];
    if (m && timeline && (!disclosure || disclosure.open)) {
      // offsetLeft is relative to the <li>, so measure against the timeline instead.
      const t = timeline.getBoundingClientRect(),
        r = m.getBoundingClientRect();
      const left = timeline.scrollLeft + (r.left - t.left) - (t.width - r.width) / 2;
      timeline.scrollTo({
        left,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }
  }
  function go(i) {
    i = Math.max(0, Math.min(cards.length - 1, i));
    requested = i;
    const max = track.scrollWidth - track.clientWidth;
    const target = Math.min(cards[i].offsetLeft - cards[0].offsetLeft, max);
    // The last cards cannot reach the left edge: when the track is already
    // where it needs to be, no scroll event fires, so update the state here.
    if (Math.abs(target - track.scrollLeft) < 4) setActive(i);
    else track.scrollTo({ left: target });
  }
  let ticking = false;
  track.addEventListener("scroll", () => {
    if (disclosure && !disclosure.open) return;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (disclosure && !disclosure.open) return;
      const x = track.scrollLeft;
      let best = 0;
      cards.forEach((c, k) => {
        if (
          Math.abs(c.offsetLeft - cards[0].offsetLeft - x) <
          Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - x)
        )
          best = k;
      });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4)
        best = Math.max(best, requested ?? best);
      setActive(best);
    });
  });
  prev.addEventListener("click", () => go(active - 1));
  next.addEventListener("click", () => go(active + 1));
  marks.forEach((m, k) => m.addEventListener("click", () => go(k)));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(active + 1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(active - 1);
    }
  });
  disclosure?.addEventListener("toggle", () => {
    // Measure the timeline once its native disclosure has become visible.
    if (disclosure.open)
      requestAnimationFrame(() => {
        if (disclosure.open) setActive(active);
      });
  });
  setActive(0);
})();
