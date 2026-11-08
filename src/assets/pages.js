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
function card(x) {
  const image = x.photo
    ? `<img loading="lazy" src="${x.photo}" alt="${esc(x.title)} 관련 풍경">`
    : '<div class="guide-art">✦</div>';
  return (
    `<article class="browse-card">` +
    `<div class="card-image"><a href="${x.url}">${image}</a>` +
    `<button class="save-button" data-save="${x.id}" aria-label="여행 노트에 저장">♡</button></div>` +
    `<div class="meta">${categoryNames[x.category]}</div>` +
    `<h2><a href="${x.url}">${esc(x.title)}</a></h2><p>${esc(x.desc)}</p></article>`
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
function renderResults() {
  const q = document.getElementById("globalQuery").value.trim().toLocaleLowerCase();
  const results = content.filter((x) =>
    [x.title, x.desc, x.city, x.keywords, ...x.sections.flat()]
      .join(" ")
      .toLocaleLowerCase()
      .includes(q),
  );
  document.getElementById("searchCount").textContent = results.length + "개의 여행 노트";
  document.getElementById("searchResults").innerHTML = results.length
    ? results
        .map(
          (x) =>
            `<a class="search-result" href="${x.url}"><small>${categoryNames[x.category]}</small><strong>${esc(x.title)}</strong><p>${esc(x.desc)}</p></a>`,
        )
        .join("")
    : '<p class="empty">검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p>';
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
        (!q ||
          [x.title, x.desc, x.keywords, ...x.sections.flat()]
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
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
    <section class="ai-panel" id="aiPanel" aria-label="베트남 여행 도우미" hidden>
      <div class="ai-header">
        <div><strong>베트남 여행 도우미</strong><small>VIETNOTE · AI 여행 도우미</small></div>
        <button aria-label="도우미 닫기">×</button>
      </div>
      <div class="ai-body">
        <p class="ai-greeting">어떤 베트남 여행을 꿈꾸세요?<br>${endpoint ? "궁금한 것을 물어보세요." : "먼저 여행 노트에서 아이디어를 찾아보세요."}</p>
        ${suggestions}
        <div class="ai-messages" role="log" aria-live="polite"></div>
        ${endpoint ? '<p class="ai-disclaimer">AI 답변은 틀릴 수 있어요. 요금·운영 시간·입국 조건은 공식 안내를 확인해 주세요.</p>' : ""}
        <form class="ai-compose">${
          endpoint
            ? '<input name="q" maxlength="1000" autocomplete="off" aria-label="질문 입력" placeholder="베트남 여행에 대해 물어보세요"><button type="submit">전송</button>'
            : '<input disabled aria-label="AI 연결 후 질문 가능" placeholder="API 연결 후 질문할 수 있어요"><button type="submit" disabled>전송</button>'
        }</form>
      </div>
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
    motionToggle.setAttribute("aria-label", motionPaused ? "자동 재생 시작" : "자동 재생 일시 정지");
  }
  motionToggle.onclick = () => { motionPaused = !motionPaused; syncMotion(); };
  reducedMotion.addEventListener("change", (event) => { motionPaused = event.matches; syncMotion(); });
  document.addEventListener("visibilitychange", () => dock.classList.toggle("is-away", document.hidden));
  syncMotion();
  function show(open) {
    panel.hidden = !open;
    dock.classList.toggle("is-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    if (open) panel.querySelector("button").focus();
    else launcher.focus();
  }
  launcher.onclick = () => show(panel.hidden);
  host.querySelector(".ai-header button").onclick = () => show(false);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) show(false);
  });
  if (endpoint) setupChat(host, endpoint);
}
function setupChat(host, endpoint) {
  const form = host.querySelector(".ai-compose"),
    input = form.elements.q,
    send = form.querySelector("button"),
    log = host.querySelector(".ai-messages"),
    history = [];
  let busy = false;
  function add(role, text) {
    const p = document.createElement("div");
    p.className = `ai-msg ai-msg-${role}`;
    p.textContent = text; // never innerHTML: replies are untrusted text
    log.append(p);
    p.scrollIntoView({ block: "nearest" });
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
      const bullet = line.match(/^[-*•]\s+(.*)/), numbered = line.match(/^(\d+)[.)]\s+(.*)/);
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
  async function ask(question) {
    const q = question.trim();
    if (!q || busy) return;
    busy = true;
    send.disabled = true;
    host.querySelector(".ai-suggestions")?.remove();
    add("user", q);
    history.push({ role: "user", content: q });
    const pending = add("assistant", "답변을 준비하고 있어요… 자세한 일정은 30초쯤 걸릴 수 있어요.");
    pending.classList.add("is-pending");
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-10) }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.reply) throw new Error(data.error || r.status);
      renderReply(pending, data.reply);
      pending.scrollIntoView({ block: "start" });
      history.push({ role: "assistant", content: data.reply });
    } catch {
      pending.textContent = "지금은 답변할 수 없어요. 잠시 후 다시 시도해 주세요.";
      pending.classList.add("is-error");
      history.pop(); // let the user ask the same question again
    } finally {
      pending.classList.remove("is-pending");
      busy = false;
      send.disabled = false;
      input.focus();
    }
  }
  form.onsubmit = (e) => {
    e.preventDefault();
    const q = input.value;
    input.value = "";
    ask(q);
  };
  host.querySelectorAll(".ai-suggestions button").forEach((b) => (b.onclick = () => ask(b.textContent)));
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
    // Each photo's author and licence travel with it (CC BY requires visible attribution).
    const credit = document.getElementById("heroCredit");
    if (credit && slides[current].dataset.credit) {
      credit.textContent = slides[current].dataset.credit;
      credit.href = slides[current].dataset.creditUrl;
    }
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
  let active = 0, requested = null;
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
      const t = timeline.getBoundingClientRect(), r = m.getBoundingClientRect();
      const left = timeline.scrollLeft + (r.left - t.left) - (t.width - r.width) / 2;
      timeline.scrollTo({ left, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
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
        if (Math.abs(c.offsetLeft - cards[0].offsetLeft - x) < Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - x)) best = k;
      });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = Math.max(best, requested ?? best);
      setActive(best);
    });
  });
  prev.addEventListener("click", () => go(active - 1));
  next.addEventListener("click", () => go(active + 1));
  marks.forEach((m, k) => m.addEventListener("click", () => go(k)));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
  });
  disclosure?.addEventListener("toggle", () => {
    // Measure the timeline once its native disclosure has become visible.
    if (disclosure.open) requestAnimationFrame(() => {
      if (disclosure.open) setActive(active);
    });
  });
  setActive(0);
})();
