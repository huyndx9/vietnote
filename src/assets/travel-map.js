(() => {
  const BASE = document.querySelector('meta[name="vietnote-base"]')?.content || "/";
  const host = document.getElementById("travelMap");
  if (!host) return;
  document.querySelectorAll('a[href="#travel-map"]').forEach((link) =>
    link.addEventListener("click", () => {
      document.getElementById("mobilemenu")?.classList.remove("open");
      document.body.style.overflow = "";
    }),
  );
  const places = window.VIETNOTE_DESTINATIONS;
  // Short Korean name for pins and chips: "하노이 · 호안끼엠 호수" -> "하노이".
  const shortName = (p) => p.title.split(" · ")[0];
  const seasons = window.VIETNOTE_SEASONS;
  // Preview photos come from src/content/photos.json ("places") via map-destinations.js.
  const regionNames = { north: "북부", central: "중부", south: "남부" };
  const list = document.getElementById("mapPlaces"),
    detail = document.getElementById("mapDetail");
  let region = "all",
    category = "all",
    query = "",
    selected = "hanoi";
  const categoryNames = {
    nature: "산과 자연",
    culture: "문화와 역사",
    beach: "해변과 섬",
    city: "도시 산책",
  };
  const normalize = (value) =>
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .toLocaleLowerCase();
  const matches = (p) =>
    (region === "all" || p.region === region) &&
    (category === "all" || p.category === category) &&
    normalize(
      [p.title, p.vi, p.teaser, ...p.paragraphs, ...p.experiences, categoryNames[p.category]].join(
        " ",
      ),
    ).includes(normalize(query));
  const destinationMarkers = new Map();
  const mapElement = document.getElementById("vietnamMap");
  const map = L.map(mapElement, {
    zoomControl: false,
    scrollWheelZoom: false,
    minZoom: 4,
    maxZoom: 11,
    zoomSnap: 0.25,
    maxBounds: [
      [3, 94],
      [29, 120],
    ],
    maxBoundsViscosity: 0.8,
  }).setView([16, 106], 5);
  const pins = map.getPane("markerPane");
  pins.id = "mapPins";
  map.createPane("countryLabels");
  map.getPane("countryLabels").style.zIndex = 450;
  map.getPane("countryLabels").style.pointerEvents = "none";
  L.geoJSON(window.VIETNOTE_GEOGRAPHY.countries, {
    interactive: false,
    smoothFactor: 0.35,
    style: (f) => ({
      color: f.properties.name === "Vietnam" ? "#e0a400" : "#c6d9de",
      weight: f.properties.name === "Vietnam" ? 1.4 : 0.8,
      fillColor: f.properties.name === "Vietnam" ? "#fff1c4" : "#eef5f6",
      fillOpacity: 1,
    }),
  }).addTo(map);
  // Main roads (Natural Earth 1:10m, inside Vietnam), drawn under the rivers.
  if (window.VIETNOTE_GEOGRAPHY.roads)
    L.geoJSON(window.VIETNOTE_GEOGRAPHY.roads, {
      interactive: false,
      style: (f) => ({
        color: f.properties.major ? "#f08a5d" : "#f5b896",
        weight: f.properties.major ? 1.8 : 1,
        opacity: 0.9,
        dashArray: f.properties.major ? null : "3 3",
      }),
    }).addTo(map);
  L.geoJSON(window.VIETNOTE_GEOGRAPHY.rivers, {
    interactive: false,
    style: (f) => ({
      color: "#5cc6c6",
      weight: (f.properties.rank ?? 9) <= 4 ? 1.8 : 1,
      opacity: 0.9,
    }),
  }).addTo(map);
  // Editorial Korean labels for terrain, seas and major cities. Detail labels
  // appear as the reader zooms in so the overview stays calm.
  map.createPane("detailLabels");
  map.getPane("detailLabels").style.zIndex = 440;
  map.getPane("detailLabels").style.pointerEvents = "none";
  const detailLabels = [
    // [text, lat, lon, kind, minZoom]
    ["통킹만", 20.1, 107.75, "sea", 5],
    ["타이만", 9.6, 102.6, "sea", 5],
    ["메콩 삼각주", 9.95, 105.75, "region", 6],
    ["홍강 삼각주", 20.62, 106.25, "region", 6.5],
    ["떠이응우옌 고원", 13.3, 108.05, "region", 6],
    ["쯔엉선 산맥", 17.2, 105.85, "range", 6],
    ["호앙리엔선 산맥", 22.05, 103.55, "range", 6.5],
    ["▲ 판시판산 3,143m", 22.303, 103.775, "peak", 7],
    ["홍강", 21.55, 104.95, "river", 7],
    ["메콩강", 11.45, 105.1, "river", 7],
    ["• 하이퐁", 20.86, 106.68, "city", 6.5],
    ["• 빈", 18.68, 105.68, "city", 6.5],
    ["• 꽝응아이", 15.12, 108.8, "city", 7],
    ["• 플래이꾸", 13.98, 108.0, "city", 7],
    ["• 비엔호아", 10.95, 106.82, "city", 7.5],
    ["• 롱쑤옌", 10.38, 105.43, "city", 7.5],
    ["• 박닌", 21.19, 106.07, "city", 7.5],
    ["• 타인호아", 19.81, 105.78, "city", 7],
  ];
  const detailMarkers = detailLabels.map(([text, lat, lon, kind, minZoom]) => ({
    minZoom,
    marker: L.marker([lat, lon], {
      interactive: false,
      keyboard: false,
      pane: "detailLabels",
      icon: L.divIcon({
        className: "atlas-detail-label atlas-detail-" + kind,
        html: text,
        iconSize: [150, 18],
        iconAnchor: kind === "city" || kind === "peak" ? [6, 9] : [75, 9],
      }),
    }),
  }));
  const syncDetailLabels = () => {
    const z = map.getZoom();
    for (const { minZoom, marker } of detailMarkers) {
      if (z >= minZoom) marker.addTo(map);
      else marker.remove();
    }
  };
  map.on("zoomend", syncDetailLabels);
  const labels = [
    ["베트남", 16.8, 107.3, "country-vietnam"],
    ["라오스", 18.4, 103.4, ""],
    ["캄보디아", 12.9, 104.3, ""],
    ["태국", 16.4, 100.8, ""],
    ["중국", 24.5, 106, ""],
    ["비엔동 (남중국해)", 14, 114, "ocean-label"],
  ];
  for (const [name, lat, lon, extra] of labels)
    L.marker([lat, lon], {
      interactive: false,
      keyboard: false,
      pane: "countryLabels",
      icon: L.divIcon({
        className: "atlas-country-label " + extra,
        html: name,
        iconSize: [130, 22],
        iconAnchor: [65, 11],
      }),
    }).addTo(map);
  // Geographic labels and representative island locations; no maritime boundaries.
  const archipelagos = [
    {
      id: "hoang-sa",
      name: "호앙사 군도",
      english: "Hoàng Sa · 파라셀 제도",
      label: [17.7, 112],
      islands: [
        [16.834, 112.337],
        [16.534, 111.603],
        [16.451, 111.706],
        [15.783, 111.2],
        [16.661, 112.731],
      ],
    },
    {
      id: "truong-sa",
      name: "쯔엉사 군도",
      english: "Trường Sa · 스프래틀리 제도",
      label: [12.15, 114.1],
      islands: [
        [8.643, 111.92],
        [11.431, 114.331],
        [9.883, 114.333],
        [10.178, 114.365],
        [10.377, 114.482],
        [7.891, 112.916],
        [8.816, 112.585],
      ],
    },
  ];
  map.createPane("islandLabels");
  map.getPane("islandLabels").style.zIndex = 455;
  map.getPane("islandLabels").style.pointerEvents = "none";
  for (const group of archipelagos) {
    for (const location of group.islands)
      L.circleMarker(location, {
        pane: "islandLabels",
        radius: 2.8,
        color: "#007c75",
        weight: 1,
        fillColor: "#ffffff",
        fillOpacity: 1,
        interactive: false,
      }).addTo(map);
    const label = L.marker(group.label, {
      interactive: false,
      keyboard: false,
      pane: "islandLabels",
      icon: L.divIcon({
        className: "atlas-archipelago-label",
        html: "<strong>" + group.name + "</strong><small>" + group.english + "</small>",
        iconSize: [180, 38],
        iconAnchor: [90, 19],
      }),
    }).addTo(map);
    label.getElement().dataset.archipelago = group.id;
  }
  syncDetailLabels();
  const markerLayer = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 38,
    disableClusteringAtZoom: 9,
    spiderfyOnMaxZoom: true,
    animate: !matchMedia("(prefers-reduced-motion: reduce)").matches,
    iconCreateFunction: (cluster) =>
      L.divIcon({
        html: "<span>" + cluster.getChildCount() + "</span>",
        className: "atlas-cluster",
        iconSize: [38, 38],
      }),
  }).addTo(map);
  const resetBounds = () => {
    const visible = places.filter(matches);
    if (!visible.length) return;
    const bounds =
      region === "all" && category === "all" && !query
        ? L.latLngBounds([
            [6.8, 101.7],
            [24.1, 117.2],
          ])
        : L.latLngBounds(visible.map((p) => [p.lat, p.lon]));
    map.fitBounds(bounds, { padding: [35, 38], maxZoom: 8, animate: false });
  };
  L.control.zoom({ position: "topright", zoomInTitle: "확대", zoomOutTitle: "축소" }).addTo(map);
  const Reset = L.Control.extend({
    options: { position: "topright" },
    onAdd() {
      const box = L.DomUtil.create("div", "leaflet-bar atlas-reset");
      const button = L.DomUtil.create("button", "", box);
      button.type = "button";
      button.title = "선택 지역 전체 보기";
      button.setAttribute("aria-label", "선택 지역 전체 보기");
      button.textContent = "⌂";
      L.DomEvent.disableClickPropagation(box);
      L.DomEvent.on(button, "click", resetBounds);
      return box;
    },
  });
  new Reset().addTo(map);
  L.control.scale({ position: "bottomleft", imperial: false, maxWidth: 90 }).addTo(map);
  map.attributionControl.setPrefix(
    '<a href="https://leafletjs.com/" target="_blank" rel="noopener">Leaflet</a>',
  );
  map.attributionControl.addAttribution(
    '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a>',
  );
  map.on("movestart zoomstart", () => hidePreview());
  map.on("zoomend", () => {
    mapElement.dataset.detailed = String(map.getZoom() >= 7);
  });
  let resizeFrame;
  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      map.invalidateSize({ pan: false });
      resetBounds();
    });
  });
  resizeObserver.observe(mapElement);
  // One reusable, hoverable preview for pins and list rows. Selection stays unchanged.
  const preview = document.createElement("a");
  preview.id = "mapHoverPreview";
  preview.className = "map-hover-preview";
  preview.setAttribute("aria-label", "여행 가이드 읽기");
  preview.hidden = true;
  document.body.append(preview);
  let previewAnchor = null,
    hideTimer = null;
  function hidePreview() {
    clearTimeout(hideTimer);
    if (previewAnchor) previewAnchor.removeAttribute("aria-describedby");
    previewAnchor = null;
    preview.hidden = true;
  }
  function deferHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hidePreview, 160);
  }
  function showPreview(p, anchor) {
    clearTimeout(hideTimer);
    if (previewAnchor && previewAnchor !== anchor)
      previewAnchor.removeAttribute("aria-describedby");
    previewAnchor = anchor;
    anchor.setAttribute("aria-describedby", preview.id);
    preview.href = p.url;
    preview.setAttribute("aria-label", p.title + " 여행 가이드 읽기");
    preview.replaceChildren();
    const photo = document.createElement("div");
    photo.className = "map-preview-photo " + p.region;
    if (p.photo) {
      const image = document.createElement("img");
      image.src = p.photo;
      image.alt = p.photo_alt;
      image.onerror = () => {
        image.remove();
        photo.classList.add("no-photo");
        photo.textContent = shortName(p);
      };
      photo.append(image);
    } else {
      photo.classList.add("no-photo");
      photo.textContent = shortName(p);
    }
    const body = document.createElement("div");
    body.className = "map-preview-body";
    const label = document.createElement("small");
    label.textContent = regionNames[p.region] + " · " + categoryNames[p.category];
    const title = document.createElement("strong");
    title.textContent = p.title;
    const description = document.createElement("p");
    description.textContent = p.teaser;
    const hint = document.createElement("span");
    hint.className = "map-preview-hint";
    hint.textContent = p.photo ? "여행 가이드 읽기 ↗" : "여행 가이드 읽기 ↗";
    body.append(label, title, description, hint);
    preview.append(photo, body);
    preview.hidden = false;
    positionPreview();
  }
  function positionPreview() {
    if (!previewAnchor) return;
    const rect = previewAnchor.getBoundingClientRect(),
      box = preview.getBoundingClientRect(),
      gap = 12,
      edge = 10;
    const left = Math.max(
      edge,
      Math.min(rect.left + rect.width / 2 - box.width / 2, innerWidth - box.width - edge),
    );
    const above = rect.top - box.height - gap;
    const top =
      above >= edge ? above : Math.min(innerHeight - box.height - edge, rect.bottom + gap);
    // In desktop-site mode the page is zoomed (see desktop_mode.py); rects are
    // in zoomed pixels while style lengths are multiplied by the zoom.
    const zoom = parseFloat(document.documentElement.style.zoom) || 1;
    preview.style.left = left / zoom + "px";
    preview.style.top = Math.max(edge, top) / zoom + "px";
  }
  function bindPreview(el, p) {
    el.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") showPreview(p, el);
    });
    el.addEventListener("pointerleave", deferHide);
    el.addEventListener("focus", () => {
      if (matchMedia("(hover: hover)").matches || el.matches(":focus-visible")) showPreview(p, el);
    });
    el.addEventListener("blur", (e) => {
      if (e.relatedTarget !== preview) hidePreview();
    });
  }
  preview.addEventListener("blur", hidePreview);
  preview.addEventListener("pointerenter", () => clearTimeout(hideTimer));
  preview.addEventListener("pointerleave", deferHide);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !preview.hidden) {
      e.preventDefault();
      hidePreview();
    }
  });
  window.addEventListener(
    "scroll",
    () => {
      if (!previewAnchor) return;
      requestAnimationFrame(() => {
        if (!previewAnchor) return;
        const r = previewAnchor.getBoundingClientRect(),
          parent = previewAnchor.closest("#mapPlaces"),
          clip = parent?.getBoundingClientRect();
        if (
          r.bottom < 0 ||
          r.top > innerHeight ||
          (clip && (r.bottom < clip.top || r.top > clip.bottom))
        )
          hidePreview();
        else positionPreview();
      });
    },
    true,
  );
  window.addEventListener("resize", hidePreview);
  function seasonCard(p) {
    const climate = seasons.regions.find((r) => r.id === p.region);
    const node = (tag, className, text) => {
      const el = document.createElement(tag);
      el.className = className;
      if (text) el.textContent = text;
      return el;
    };
    const section = node("section", "map-season");
    section.setAttribute("aria-label", shortName(p) + " · 언제 갈까요");
    const heading = node("div", "map-season-heading");
    heading.append(node("h3", "", "When to go."), node("span", "", climate.label + " 기준"));
    const best = node("p", "season-best");
    best.append(
      node("span", "", "추천 시기"),
      node("strong", "", climate.best),
      node("em", "", climate.best_note),
    );
    const months = node("ol", "season-months");
    months.setAttribute("aria-label", climate.label + " 월별 날씨");
    climate.months.forEach((condition, i) => {
      const month = node("li", "m-" + condition, String(i + 1));
      const label = `${i + 1}월 · ${seasons.legend[condition]}`;
      month.title = label;
      month.setAttribute("aria-label", label);
      months.append(month);
    });
    const legend = node("ul", "season-legend");
    for (const [condition, label] of Object.entries(seasons.legend)) {
      const key = node("li", "m-" + condition);
      const swatch = node("i", "");
      swatch.setAttribute("aria-hidden", "true");
      key.append(swatch, document.createTextNode(label));
      legend.append(key);
    }
    const notes = node("details", "map-season-notes");
    const pack = node("p", "season-pack");
    pack.append(node("span", "", "짐 준비"), document.createTextNode(climate.pack));
    notes.append(
      node("summary", "", "날씨와 짐 준비"),
      node("p", "season-summary", climate.summary),
      pack,
      node(
        "p",
        "season-note",
        "지역의 일반적인 경향이에요. 고도와 해안에 따라 다르니 출발 전 현지 예보와 태풍 정보를 확인하세요.",
      ),
    );
    section.append(heading, best, months, legend, notes);
    return section;
  }
  function show(p, focus = false) {
    hidePreview();
    selected = p.id;
    detail.replaceChildren();
    const eyebrow = document.createElement("div");
    eyebrow.className = "section-no";
    eyebrow.textContent = regionNames[p.region] + " · " + categoryNames[p.category];
    const title = document.createElement("h2");
    const titleLink = document.createElement("a");
    titleLink.href = p.url;
    titleLink.textContent = p.title;
    title.append(titleLink);
    const desc = document.createElement("p");
    desc.textContent = p.teaser;
    const coords = document.createElement("small");
    coords.textContent = `북위 ${p.lat.toFixed(3)}° · 동경 ${p.lon.toFixed(3)}°`;
    const maps = document.createElement("a");
    maps.className = "primary-button";
    maps.textContent = "구글 지도에서 위치 보기 ↗";
    maps.href =
      "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.vi + " Vietnam");
    maps.target = "_blank";
    maps.rel = "noopener noreferrer";
    const cover = document.createElement("a");
    cover.href = p.url;
    cover.setAttribute("aria-label", p.title + " 여행 가이드 읽기");
    cover.className = "map-detail-cover " + p.region;
    if (p.photo) {
      const img = document.createElement("img");
      img.src = p.photo;
      img.alt = p.photo_alt;
      cover.append(img);
    } else {
      const word = document.createElement("span");
      word.textContent = shortName(p);
      cover.append(word);
    }
    const tag = document.createElement("span");
    tag.className = "map-cover-tag";
    tag.textContent = regionNames[p.region] + " 베트남";
    cover.append(tag);
    const body = document.createElement("div");
    body.className = "map-detail-body";
    body.append(eyebrow, title, desc);
    const experiences = document.createElement("div");
    experiences.className = "map-experiences";
    for (const text of p.experiences) {
      const tag = document.createElement("span");
      tag.textContent = text;
      experiences.append(tag);
    }
    const story = document.createElement("details");
    story.className = "map-editorial";
    const summary = document.createElement("summary");
    summary.textContent = "여행 노트 펼쳐 보기";
    story.append(summary);
    for (const text of p.paragraphs) {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      story.append(paragraph);
    }
    const tip = document.createElement("aside");
    tip.className = "map-travel-tip";
    const tipTitle = document.createElement("strong");
    tipTitle.textContent = "가기 전에, 작은 팁";
    const tipText = document.createElement("p");
    tipText.textContent = p.tip;
    tip.append(tipTitle, tipText);
    story.append(tip);
    body.append(experiences, seasonCard(p), story, coords, maps);
    detail.append(cover, body);
    document.getElementById("mapSelection").textContent = shortName(p);
    host.dataset.selectedRegion = p.region;
    if (p.url) {
      const article = document.createElement("a");
      article.className = "action-button map-read-guide";
      article.textContent = "전체 여행 가이드 읽기 ↗";
      article.href = p.url;
      detail.querySelector(".map-detail-body").append(article);
    }
    pins
      .querySelectorAll("[data-place]")
      .forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.place === p.id)));
    list
      .querySelectorAll("[data-place]")
      .forEach((el) => el.setAttribute("aria-current", String(el.dataset.place === p.id)));
    if (focus)
      detail.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "nearest",
      });
  }
  function render() {
    hidePreview();
    const visible = places.filter(matches);
    markerLayer.clearLayers();
    destinationMarkers.clear();
    list.replaceChildren();
    for (const p of visible) {
      const icon = L.divIcon({
        className: "atlas-marker",
        html: '<span class="map-pin-dot"></span><span class="map-pin-label"></span>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker([p.lat, p.lon], {
        icon,
        keyboard: true,
        title: p.title,
        riseOnHover: true,
      });
      destinationMarkers.set(p.id, marker);
      marker.on("add", () => {
        const el = marker.getElement();
        if (!el) return;
        el.setAttribute("aria-pressed", String(selected === p.id));
        if (el.dataset.previewBound) return;
        el.dataset.previewBound = "true";
        el.dataset.place = p.id;
        el.dataset.region = p.region;
        el.setAttribute("role", "button");
        el.setAttribute("aria-label", p.title);
        el.setAttribute("aria-pressed", String(selected === p.id));
        el.querySelector(".map-pin-label").textContent = shortName(p);
        bindPreview(el, p);
        el.onclick = (e) => {
          e.stopPropagation();
          show(p);
        };
        el.onkeydown = (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            show(p);
          }
        };
      });
      markerLayer.addLayer(marker);
      const button = document.createElement("a");
      button.className = "map-place-link";
      button.href = p.url;
      button.dataset.place = p.id;
      button.dataset.region = p.region;
      const name = document.createElement("strong");
      name.textContent = p.title;
      const sub = document.createElement("small");
      sub.textContent = regionNames[p.region] + " · " + categoryNames[p.category];
      const arrow = document.createElement("span");
      arrow.className = "map-place-arrow";
      arrow.textContent = "↗";
      button.append(name, sub, arrow);
      bindPreview(button, p);
      list.append(button);
    }
    document.getElementById("mapCount").textContent = visible.length + "개의 여행지";
    document.getElementById("mapEmpty").hidden = visible.length > 0;
    detail.hidden = visible.length === 0;
    resetBounds();
    if (visible.length) show(visible.find((p) => p.id === selected) || visible[0]);
  }
  document.querySelectorAll("[data-map-region]").forEach(
    (b) =>
      (b.onclick = () => {
        region = b.dataset.mapRegion;
        document
          .querySelectorAll("[data-map-region]")
          .forEach((el) => el.setAttribute("aria-pressed", String(el === b)));
        render();
      }),
  );
  document.querySelectorAll("[data-map-category]").forEach(
    (b) =>
      (b.onclick = () => {
        category = b.dataset.mapCategory;
        document
          .querySelectorAll("[data-map-category]")
          .forEach((el) => el.setAttribute("aria-pressed", String(el === b)));
        render();
      }),
  );
  document.getElementById("mapSearch").oninput = (e) => {
    query = e.target.value.trim();
    render();
  };
  render();
})();
