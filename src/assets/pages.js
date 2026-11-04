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
  const host = document.createElement("div");
  host.innerHTML = `
    <button class="ai-launcher" aria-expanded="false" aria-controls="aiPanel"><span>✦</span> AI에게 물어보기</button>
    <section class="ai-panel" id="aiPanel" aria-label="베트남 여행 도우미" hidden>
      <div class="ai-header">
        <div><strong>베트남 여행 도우미</strong><small>VIETNOTE · DEEPSEEK</small></div>
        <button aria-label="도우미 닫기">×</button>
      </div>
      <div class="ai-body">
        <p class="ai-greeting">어떤 베트남 여행을 꿈꾸세요?<br>먼저 여행 노트에서 아이디어를 찾아보세요.</p>
        <div class="connection-note"><strong>AI 연결 준비 중</strong><br>DeepSeek API가 아직 연결되지 않아 AI 답변을 생성할 수 없습니다. 아래 항목은 편집된 여행 콘텐츠로 이동합니다.</div>
        <div class="ai-suggestions">
          <a href="${BASE}articles/danang-4days/">부모님과 다낭 3박 4일 ↗</a>
          <a href="${BASE}food/">베트남 음식과 커피 알아보기 ↗</a>
          <a href="${BASE}articles/language/">여행 베트남어 표현 보기 ↗</a>
        </div>
        <div class="ai-compose"><input disabled aria-label="AI 연결 후 질문 가능" placeholder="API 연결 후 질문할 수 있어요"><button disabled>전송</button></div>
      </div>
    </section>`;
  document.body.append(host);
  const launcher = host.querySelector(".ai-launcher"),
    panel = host.querySelector(".ai-panel");
  function show(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) panel.querySelector("button").focus();
    else launcher.focus();
  }
  launcher.onclick = () => show(panel.hidden);
  host.querySelector(".ai-header button").onclick = () => show(false);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) show(false);
  });
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
