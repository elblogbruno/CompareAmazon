const BOOT = window.__SHARED_COMPARE__ || { products: [], notes: {}, favorites: [], votes: {} };
const tableWrapper = document.getElementById("tableWrapper");
const cardsWrapper = document.getElementById("cardsWrapper");
const sortSelect = document.getElementById("sortSelect");
const maxBudgetInput = document.getElementById("maxBudgetInput");
const toggleScorePanelBtn = document.getElementById("toggleScorePanelBtn");
const toggleViewModeBtn = document.getElementById("toggleViewModeBtn");
const scorePanel = document.getElementById("scorePanel");
const weightPrice = document.getElementById("weightPrice");
const weightRating = document.getElementById("weightRating");
const weightReviews = document.getElementById("weightReviews");
const weightPriceVal = document.getElementById("weightPriceVal");
const weightRatingVal = document.getElementById("weightRatingVal");
const weightReviewsVal = document.getElementById("weightReviewsVal");
const diffOnlyToggle = document.getElementById("diffOnlyToggle");
const commonOnlyToggle = document.getElementById("commonOnlyToggle");
const specSearchInput = document.getElementById("specSearchInput");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const quickChatGptBtn = document.getElementById("quickChatGptBtn");
const quickClaudeBtn = document.getElementById("quickClaudeBtn");
const quickGeminiBtn = document.getElementById("quickGeminiBtn");
const quickPerplexityBtn = document.getElementById("quickPerplexityBtn");
const toastEl = document.getElementById("toast");

const voteModalBackdrop = document.getElementById("voteModalBackdrop");
const closeVoteModalBtn = document.getElementById("closeVoteModalBtn");
const cancelVoteBtn = document.getElementById("cancelVoteBtn");
const confirmVoteBtn = document.getElementById("confirmVoteBtn");
const voteProductLabel = document.getElementById("voteProductLabel");
const voterNameInput = document.getElementById("voterNameInput");
const voterCommentInput = document.getElementById("voterCommentInput");

const imageLightbox = document.getElementById("imageLightbox");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxThumbs = document.getElementById("lightboxThumbs");
const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");
const lightboxPrevBtn = document.getElementById("lightboxPrevBtn");
const lightboxNextBtn = document.getElementById("lightboxNextBtn");

const originalProducts = Array.isArray(BOOT.products) ? BOOT.products : [];
const productNotes = BOOT.notes || {};
const favoriteAsins = new Set(Array.isArray(BOOT.favorites) ? BOOT.favorites : []);
let votesByKey = BOOT.votes || {};
let products = [...originalProducts];
let cardMode = window.innerWidth < 768;
let votingProductKey = null;
const activeImageIndex = new Map();
let lightboxState = { images: [], index: 0, title: "" };
let toastTimer = null;

const KEEPA_DOMAIN_IDS = {
  "amazon.com": 1, "amazon.co.uk": 2, "amazon.de": 3, "amazon.fr": 4,
  "amazon.co.jp": 5, "amazon.ca": 6, "amazon.it": 8, "amazon.es": 9,
  "amazon.in": 10, "amazon.com.mx": 11, "amazon.com.br": 12, "amazon.com.au": 13, "amazon.nl": 14
};
const CAMEL_PREFIXES = {
  "amazon.com": "", "amazon.es": "es.", "amazon.co.uk": "uk.", "amazon.de": "de.",
  "amazon.fr": "fr.", "amazon.it": "it.", "amazon.ca": "ca.", "amazon.com.au": "au.", "amazon.co.jp": "jp."
};

function showToast(msg, ms = 4000) {
  toastEl.textContent = msg;
  toastEl.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add("hidden"), ms);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function normalizeSpecKey(key) {
  return String(key || "")
    .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

function renderStars(rating) {
  if (!rating) return "";
  const full = Math.round(rating);
  return "★".repeat(Math.min(5, full)) + "☆".repeat(Math.max(0, 5 - full));
}

function formatNumber(n) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("es-ES").format(n);
}

function getEffectivePrice(p) {
  if (typeof p.netPriceNum === "number" && p.netPriceNum > 0) return p.netPriceNum;
  if (typeof p.priceNum === "number" && p.priceNum > 0) return p.priceNum;
  return null;
}

function getMaxBudget() {
  const v = parseFloat(maxBudgetInput?.value);
  return Number.isFinite(v) && v > 0 ? v : null;
}

function getPriceHistoryUrls(p) {
  if (!p.asin) return null;
  const domain = (p.domain || "amazon.es").replace(/^www\./i, "").toLowerCase();
  const keepaId = KEEPA_DOMAIN_IDS[domain] || 9;
  const camelPrefix = domain in CAMEL_PREFIXES ? CAMEL_PREFIXES[domain] : "es.";
  return {
    keepa: `https://keepa.com/#!product/${keepaId}-${p.asin}`,
    camel: `https://${camelPrefix}camelcamelcamel.com/product/${p.asin}`
  };
}

function computeWinners(list) {
  let minPrice = Infinity, maxRating = -1, maxReviews = -1;
  for (const p of list) {
    const ep = getEffectivePrice(p);
    if (ep !== null && ep < minPrice) minPrice = ep;
    if (typeof p.ratingNum === "number" && p.ratingNum > maxRating) maxRating = p.ratingNum;
    if (typeof p.reviewCount === "number" && p.reviewCount > maxReviews) maxReviews = p.reviewCount;
  }
  return {
    minPrice: list.length > 1 && Number.isFinite(minPrice) ? minPrice : null,
    maxRating: list.length > 1 && maxRating > 0 ? maxRating : null,
    maxReviews: list.length > 1 && maxReviews > 0 ? maxReviews : null
  };
}

function computeScores(list) {
  const wP = parseFloat(weightPrice?.value ?? 40) || 0;
  const wR = parseFloat(weightRating?.value ?? 40) || 0;
  const wN = parseFloat(weightReviews?.value ?? 20) || 0;
  const totalW = wP + wR + wN || 1;

  const prices = list.map(getEffectivePrice).filter((v) => v !== null);
  const minP = prices.length ? Math.min(...prices) : 0;
  const maxP = prices.length ? Math.max(...prices) : 0;
  const logReviews = list.map((p) => (p.reviewCount > 0 ? Math.log10(p.reviewCount + 1) : 0));
  const maxLogRev = Math.max(...logReviews, 1);

  const scores = new Map();
  let bestScore = -1;
  list.forEach((p, i) => {
    const ep = getEffectivePrice(p);
    const priceScore = ep !== null ? (maxP > minP ? 1 - (ep - minP) / (maxP - minP) : 1) : 0.5;
    const ratingScore = p.ratingNum ? Math.max(0, Math.min(1, (p.ratingNum - 1) / 4)) : 0.4;
    const revScore = logReviews[i] / maxLogRev;
    const score = Math.round(((priceScore * wP + ratingScore * wR + revScore * wN) / totalW) * 100) / 10;
    scores.set(p.asin || p.url, score);
    if (score > bestScore) bestScore = score;
  });
  return { scores, bestScore: list.length > 1 ? bestScore : null };
}

function computeRedFlags(p) {
  const flags = [];
  if (p.ratingDistribution) {
    const negPct = (p.ratingDistribution[1] || 0) + (p.ratingDistribution[2] || 0);
    if (negPct >= 15) flags.push(`⚠️ ${negPct}% reseñas negativas (1–2★)`);
  }
  if (typeof p.reviewCount === "number" && p.reviewCount > 0 && p.reviewCount < 20) {
    flags.push(`⚠️ Pocas reseñas (${p.reviewCount})`);
  }
  if (!p.isPrime && p.seller && !/amazon/i.test(p.seller)) {
    flags.push(`⚠️ Sin Prime / vendedor externo`);
  }
  if (p.returnsPolicy && !/(gratis|free|gratuit|kostenlos)/i.test(p.returnsPolicy)) {
    flags.push(`⚠️ Revisa política de devolución`);
  }
  return flags;
}

function collectUnifiedSpecs(list) {
  const map = new Map();
  list.forEach((product, idx) => {
    for (const [rawKey, val] of Object.entries(product.specs || {})) {
      const norm = normalizeSpecKey(rawKey);
      if (!norm) continue;
      if (!map.has(norm)) map.set(norm, { label: rawKey, values: new Array(list.length).fill("") });
      const entry = map.get(norm);
      if (!entry.values[idx]) entry.values[idx] = val;
    }
  });
  return Array.from(map.values())
    .map((row) => {
      const nonEmpty = row.values.filter(Boolean);
      const uniqueNorm = new Set(nonEmpty.map((v) => normalizeSpecKey(v)));
      const hasDiff = list.length > 1 && (uniqueNorm.size > 1 || (nonEmpty.length > 0 && nonEmpty.length < list.length));
      return { ...row, presentCount: nonEmpty.length, hasDiff };
    })
    .sort((a, b) => (b.presentCount !== a.presentCount ? b.presentCount - a.presentCount : a.label.localeCompare(b.label, "es")));
}

function applySort() {
  const mode = sortSelect.value;
  const copy = [...originalProducts];
  if (mode === "score-desc") {
    const { scores } = computeScores(copy);
    copy.sort((a, b) => (scores.get(b.asin || b.url) ?? -1) - (scores.get(a.asin || a.url) ?? -1));
  } else if (mode === "price-asc") copy.sort((a, b) => (getEffectivePrice(a) ?? Infinity) - (getEffectivePrice(b) ?? Infinity));
  else if (mode === "price-desc") copy.sort((a, b) => (getEffectivePrice(b) ?? -1) - (getEffectivePrice(a) ?? -1));
  else if (mode === "rating-desc") copy.sort((a, b) => (b.ratingNum ?? -1) - (a.ratingNum ?? -1));
  else if (mode === "reviews-desc") copy.sort((a, b) => (b.reviewCount ?? -1) - (a.reviewCount ?? -1));
  products = copy;
}

function renderVoteSection(p) {
  const key = p.asin || p.url;
  const vData = votesByKey[key] || { count: 0, items: [] };
  const commentsHtml = vData.items
    .filter((i) => i.comment || i.voter)
    .slice(0, 5)
    .map((i) => `<div class="vote-comment-item"><strong>${escapeHtml(i.voter)}</strong>${i.comment ? `: ${escapeHtml(i.comment)}` : " votó esta opción 👍"}</div>`)
    .join("");
  return `
    <div class="vote-box">
      <button type="button" class="vote-btn" data-votekey="${escapeHtml(key)}" data-votetitle="${escapeHtml(p.title)}">
        👍 Votar (${vData.count})
      </button>
      ${commentsHtml ? `<div class="vote-comments">${commentsHtml}</div>` : ""}
    </div>`;
}

function renderBadges(p, winners, scores, bestScore, maxBudget) {
  const key = p.asin || p.url;
  const ep = getEffectivePrice(p);
  const badges = [];
  const score = scores.get(key);
  if (score !== undefined) {
    badges.push(bestScore !== null && score === bestScore
      ? `<span class="pill pill-score-winner">🏆 ${score.toFixed(1)}/10 · Ganador</span>`
      : `<span class="pill pill-score">⚖️ ${score.toFixed(1)}/10</span>`);
  }
  if (maxBudget !== null && ep !== null && ep > maxBudget) {
    badges.push(`<span class="pill pill-over-budget">💸 +${(ep - maxBudget).toFixed(0)}€ sobre presupuesto</span>`);
  }
  if (winners.minPrice !== null && ep === winners.minPrice) badges.push(`<span class="pill pill-best-price">🏷️ Mejor precio</span>`);
  if (winners.maxRating !== null && p.ratingNum === winners.maxRating) badges.push(`<span class="pill pill-best-rating">⭐ Mejor valorado</span>`);
  if (winners.maxReviews !== null && p.reviewCount === winners.maxReviews) badges.push(`<span class="pill pill-most-reviews">💬 Más reseñas</span>`);
  return badges.join("");
}

function renderMobileCards(winners, scores, bestScore, maxBudget) {
  cardsWrapper.innerHTML = products.map((p, idx) => {
    const key = p.asin || p.url;
    const ep = getEffectivePrice(p);
    const isOver = maxBudget !== null && ep !== null && ep > maxBudget;
    const imgs = p.images?.length ? p.images : p.image ? [p.image] : [];
    const curImgIdx = Math.min(activeImageIndex.get(key) || 0, Math.max(0, imgs.length - 1));
    const curImg = imgs[curImgIdx] || "";
    const flags = computeRedFlags(p);
    const history = getPriceHistoryUrls(p);

    const navHtml = imgs.length > 1
      ? `<button type="button" class="gallery-nav-btn prev" data-pidx="${idx}" data-dir="-1">&#8249;</button>
         <button type="button" class="gallery-nav-btn next" data-pidx="${idx}" data-dir="1">&#8250;</button>
         <span class="gallery-counter">${curImgIdx + 1} / ${imgs.length}</span>`
      : "";
    const thumbsHtml = imgs.length > 1
      ? `<div class="thumb-strip">${imgs.map((u, ti) => `<button type="button" class="thumb-btn${ti === curImgIdx ? " active" : ""}" data-pidx="${idx}" data-imgidx="${ti}"><img src="${escapeHtml(u)}" alt="" loading="lazy" /></button>`).join("")}</div>`
      : "";

    let euHtml = "";
    if (p.euPrices?.length) {
      const minEu = Math.min(...p.euPrices.filter((x) => x.priceNum > 0).map((x) => x.priceNum));
      euHtml = `<div class="eu-prices-bar">${p.euPrices.map((x) => `<a class="eu-pill${x.priceNum === minEu ? " eu-best" : ""}" href="${escapeHtml(x.url)}" target="_blank" rel="noopener">${x.flag} ${escapeHtml(x.priceDisplay)}${x.priceNum === minEu ? " 🏆" : ""}</a>`).join("")}</div>`;
    }

    const specsEntries = Object.entries(p.specs || {});
    const specsHtml = specsEntries.length
      ? `<details class="mobile-card-details"><summary>Especificaciones técnicas (${specsEntries.length})</summary><div class="mobile-card-details-body">${specsEntries.slice(0, 20).map(([k, v]) => `<div class="mobile-card-kv"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join("")}</div></details>`
      : "";

    const bulletsHtml = p.bullets?.length
      ? `<details class="mobile-card-details"><summary>Puntos clave (${p.bullets.length})</summary><div class="mobile-card-details-body"><ul class="bullet-list">${p.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul></div></details>`
      : "";

    const sortedReviews = [...(p.reviews || [])].sort(
      (a, b) => ((b.videos?.length ? 2 : 0) + (b.images?.length ? 1 : 0)) - ((a.videos?.length ? 2 : 0) + (a.images?.length ? 1 : 0))
    );
    p._sortedReviews = sortedReviews;
    const reviewsHtml = sortedReviews.length
      ? `<details class="mobile-card-details"><summary>Reseñas destacadas (${sortedReviews.length})</summary><div class="mobile-card-details-body">${sortedReviews.slice(0, 4).map((r, rIdx) => {
          const media = (r.videos?.length || r.images?.length)
            ? `<div class="review-photos">${(r.videos || []).map((v, vi) => `<button type="button" class="review-video-btn" data-pidx="${idx}" data-ridx="${rIdx}" data-vididx="${vi}" data-rtype="top">${v.poster ? `<img src="${escapeHtml(v.poster)}" alt="" loading="lazy" />` : ""}<span class="review-video-play">▶</span></button>`).join("")}${(r.images || []).map((u, ii) => `<button type="button" class="review-photo-btn" data-pidx="${idx}" data-ridx="${rIdx}" data-imgidx="${ii}" data-rtype="top"><img src="${escapeHtml(u)}" alt="" loading="lazy" /></button>`).join("")}</div>`
            : "";
          return `<div class="review-card"><div class="review-card-head">${r.rating ? `<span class="review-star-pill ${r.rating >= 4 ? "review-star-high" : r.rating >= 3 ? "review-star-mid" : "review-star-low"}">${r.rating.toFixed(0)}★</span>` : ""}${r.title ? `<span class="review-title">${escapeHtml(r.title)}</span>` : ""}</div><div class="review-body">${escapeHtml((r.body || "").slice(0, 220))}</div>${media}</div>`;
        }).join("")}</div></details>`
      : "";

    return `
      <article class="mobile-product-card${isOver ? " over-budget-col" : ""}">
        <div class="product-card-top">
          <span class="domain-pill">${escapeHtml(p.domain || "Amazon")}</span>
          ${favoriteAsins.has(key) ? `<span class="pill pill-best-rating">★ Favorito</span>` : ""}
        </div>
        <div class="product-img-wrap">
          ${curImg ? `<img class="product-main-img" data-pidx="${idx}" src="${escapeHtml(curImg)}" alt="${escapeHtml(p.title)}" loading="lazy" />` : `<span class="muted">Sin imagen</span>`}
          ${navHtml}
        </div>
        ${thumbsHtml}
        <a class="product-title-link" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.title)}</a>
        <div class="winner-badges">${renderBadges(p, winners, scores, bestScore, maxBudget)}</div>
        <div>
          <span class="price-main">${escapeHtml(p.priceDisplay || "N/D")}</span>
          ${p.listPriceDisplay ? `<span class="price-old">${escapeHtml(p.listPriceDisplay)}</span>` : ""}
          ${p.couponText ? `<div class="coupon-block"><span class="pill pill-coupon">🎟️ ${escapeHtml(p.couponText)}</span>${p.netPriceDisplay ? `<span class="net-price-line">Neto: ${escapeHtml(p.netPriceDisplay)}</span>` : ""}</div>` : ""}
          ${p.unitPrice ? `<div class="unit-price-line">${escapeHtml(p.unitPrice)}</div>` : ""}
          ${euHtml}
        </div>
        <div class="mobile-card-kv"><span>Valoración</span><strong>${p.ratingNum ? `${p.ratingNum.toFixed(1)}/5 ★ (${formatNumber(p.reviewCount)})` : "—"}</strong></div>
        ${p.variant ? `<div class="mobile-card-kv"><span>Variante</span><strong>${escapeHtml(p.variant)}</strong></div>` : ""}
        <div class="mobile-card-kv"><span>Prime</span><strong>${p.isPrime ? "Sí ✓" : "No"}</strong></div>
        ${p.returnsPolicy ? `<div class="mobile-card-kv"><span>Devoluciones</span><strong>${escapeHtml(p.returnsPolicy)}</strong></div>` : ""}
        ${flags.length ? `<div class="flags-list">${flags.map((f) => `<span class="flag-pill">${escapeHtml(f)}</span>`).join("")}</div>` : `<span class="flag-ok">✓ Sin alertas</span>`}
        ${(productNotes[key] || "").trim() ? `<div class="summary-quote">${escapeHtml(productNotes[key].trim())}</div>` : ""}
        ${renderVoteSection(p)}
        ${bulletsHtml}
        ${reviewsHtml}
        ${specsHtml}
        ${history ? `<div class="price-history-links"><a class="history-link" href="${escapeHtml(history.keepa)}" target="_blank" rel="noopener">📈 Keepa</a><a class="history-link" href="${escapeHtml(history.camel)}" target="_blank" rel="noopener">🐪 Camel</a></div>` : ""}
      </article>`;
  }).join("");
}

function renderAll() {
  applySort();
  const winners = computeWinners(products);
  const { scores, bestScore } = computeScores(products);
  const maxBudget = getMaxBudget();

  toggleViewModeBtn.innerHTML = cardMode
    ? `<svg class="svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg><span>Tabla</span>`
    : `<svg class="svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg><span>Tarjetas</span>`;
  tableWrapper.classList.toggle("hidden", cardMode);
  cardsWrapper.classList.toggle("hidden", !cardMode);

  if (cardMode) {
    renderMobileCards(winners, scores, bestScore, maxBudget);
    bindInteractiveHandlers(cardsWrapper);
    return;
  }

  const diffOnly = diffOnlyToggle.checked;
  const commonOnly = commonOnlyToggle.checked;
  const query = normalizeSpecKey(specSearchInput.value || "");

  const isDiffRow = (vals) => products.length > 1 && new Set(vals.map((v) => normalizeSpecKey(String(v || "")))).size > 1;

  let html = `<table class="compare-table"><thead><tr class="sticky-name-row"><th class="attr-col">Producto</th>`;
  products.forEach((p) => {
    const pKey = p.asin || p.url;
    const isFav = favoriteAsins.has(pKey);
    const stickyPrice = p.netPriceDisplay || p.priceDisplay;
    html += `
      <th class="product-col${isFav ? " fav-col" : ""}">
        <div class="sticky-head-cell">
          <div class="product-card-top">
            <span class="domain-pill">${escapeHtml(p.domain || "Amazon")}</span>
            ${stickyPrice ? `<span class="sticky-price-pill">${escapeHtml(stickyPrice)}${p.netPriceDisplay ? " neto" : ""}</span>` : ""}
            ${isFav ? `<span class="pill pill-best-rating">★ Favorito</span>` : ""}
          </div>
          <a class="product-title-link" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(p.title)}">
            ${escapeHtml(p.title)}
          </a>
        </div>
      </th>`;
  });
  html += `</tr></thead><tbody>`;

  // Photos row
  html += `<tr><th class="attr-col">Fotos</th>`;
  products.forEach((p, idx) => {
    const pKey = p.asin || p.url;
    const isFav = favoriteAsins.has(pKey);
    const imgs = p.images?.length ? p.images : p.image ? [p.image] : [];
    const curImgIdx = Math.min(activeImageIndex.get(pKey) || 0, Math.max(0, imgs.length - 1));
    const curImgUrl = imgs[curImgIdx] || "";
    const navHtml = imgs.length > 1
      ? `<button type="button" class="gallery-nav-btn prev" data-pidx="${idx}" data-dir="-1">&#8249;</button>
         <button type="button" class="gallery-nav-btn next" data-pidx="${idx}" data-dir="1">&#8250;</button>
         <span class="gallery-counter">${curImgIdx + 1} / ${imgs.length}</span>`
      : "";
    const thumbsHtml = imgs.length > 1
      ? `<div class="thumb-strip">${imgs.map((url, tIdx) => `<button type="button" class="thumb-btn${tIdx === curImgIdx ? " active" : ""}" data-pidx="${idx}" data-imgidx="${tIdx}"><img src="${escapeHtml(url)}" alt="" loading="lazy" /></button>`).join("")}</div>`
      : "";
    html += `
      <td class="${isFav ? "fav-col" : ""}">
        <div class="product-gallery-cell">
          <div class="product-img-wrap">
            ${curImgUrl ? `<img class="product-main-img" data-pidx="${idx}" src="${escapeHtml(curImgUrl)}" alt="${escapeHtml(p.title)}" loading="lazy" title="Haz clic para ampliar" />` : `<span class="muted">Sin imagen</span>`}
            ${navHtml}
          </div>
          ${thumbsHtml}
          <div class="winner-badges">${renderBadges(p, winners, scores, bestScore, maxBudget)}</div>
        </div>
      </td>`;
  });
  html += `</tr>`;

  const colSpan = products.length + 1;
  const addSection = (title) => { html += `<tr class="section-row"><th colspan="${colSpan}">${escapeHtml(title)}</th></tr>`; };
  const addRow = (label, cellsHtml, rawValues, forceShow = false) => {
    const diff = isDiffRow(rawValues);
    if (diffOnly && !diff && !forceShow) return;
    html += `<tr class="${diff ? "diff-row" : ""}"><th class="attr-col">${escapeHtml(label)}</th>`;
    products.forEach((p, i) => {
      const isFav = favoriteAsins.has(p.asin || p.url);
      const ep = getEffectivePrice(p);
      const isOver = maxBudget !== null && ep !== null && ep > maxBudget;
      const cls = [isFav ? "fav-col" : "", isOver ? "over-budget-col" : ""].filter(Boolean).join(" ");
      html += `<td class="${cls}">${cellsHtml[i]}</td>`;
    });
    html += `</tr>`;
  };

  addSection("Votación y comentarios");
  addRow("¿Cuál prefieres?", products.map(renderVoteSection), products.map((p) => (votesByKey[p.asin || p.url]?.count || 0)), true);

  addSection("Resumen");
  addRow(
    "Precio",
    products.map((p) => {
      const history = getPriceHistoryUrls(p);
      const historyHtml = history
        ? `<div class="price-history-links"><a class="history-link" href="${escapeHtml(history.keepa)}" target="_blank" rel="noopener">📈 Keepa</a><a class="history-link" href="${escapeHtml(history.camel)}" target="_blank" rel="noopener">🐪 Camel</a></div>`
        : "";
      if (!p.priceDisplay) return `<span class="muted">No disponible</span>${historyHtml}`;
      const oldHtml = p.listPriceDisplay ? `<span class="price-old">${escapeHtml(p.listPriceDisplay)}</span>` : "";
      const discHtml = p.discountPct ? ` <span class="pill pill-discount">-${p.discountPct}%</span>` : "";
      const couponHtml = p.couponText
        ? `<div class="coupon-block"><span class="pill pill-coupon">🎟️ ${escapeHtml(p.couponText)}</span>${p.netPriceDisplay ? `<span class="net-price-line">Precio neto: ${escapeHtml(p.netPriceDisplay)}</span>` : ""}</div>`
        : "";
      const unitHtml = p.unitPrice ? `<div class="unit-price-line">${escapeHtml(p.unitPrice)}</div>` : "";
      let euHtml = "";
      if (p.euPrices && p.euPrices.length > 0) {
        const minEu = Math.min(...p.euPrices.filter((x) => x.priceNum > 0).map((x) => x.priceNum));
        euHtml = `<div class="eu-prices-bar">${p.euPrices
          .map((x) => `<a class="eu-pill${x.priceNum === minEu ? " eu-best" : ""}" href="${escapeHtml(x.url)}" target="_blank" rel="noopener">${x.flag} ${escapeHtml(x.priceDisplay)}${x.priceNum === minEu ? " 🏆" : ""}</a>`)
          .join("")}</div>`;
      }
      return `<div><span class="price-main">${escapeHtml(p.priceDisplay)}</span>${oldHtml}${discHtml}</div>${couponHtml}${unitHtml}${euHtml}${historyHtml}`;
    }),
    products.map((p) => getEffectivePrice(p) ?? p.priceDisplay),
    true
  );

  addRow("Valoración", products.map((p) => p.ratingNum ? `<div class="rating-wrap"><span class="stars">${renderStars(p.ratingNum)}</span><span>${p.ratingNum.toFixed(1)} / 5</span></div>` : `<span class="muted">Sin valoraciones</span>`), products.map((p) => p.ratingNum), true);
  addRow("Nº de reseñas", products.map((p) => p.reviewCount != null ? `<strong>${formatNumber(p.reviewCount)}</strong>` : `<span class="muted">—</span>`), products.map((p) => p.reviewCount));
  addRow("Marca", products.map((p) => p.brand ? escapeHtml(p.brand) : `<span class="muted">—</span>`), products.map((p) => p.brand));
  if (products.some((p) => p.variant)) addRow("Variante seleccionada", products.map((p) => p.variant ? `<span class="variant-pill">${escapeHtml(p.variant)}</span>` : `<span class="muted">—</span>`), products.map((p) => p.variant));
  addRow("Prime / Disponibilidad", products.map((p) => { const parts = []; if (p.isPrime) parts.push(`<span class="pill pill-prime">Prime ✓</span>`); if (p.availability) parts.push(`<div>${escapeHtml(p.availability)}</div>`); return parts.length ? parts.join(" ") : `<span class="muted">—</span>`; }), products.map((p) => `${p.isPrime}-${p.availability}`));
  if (products.some((p) => p.delivery)) addRow("Envío estimado", products.map((p) => p.delivery ? escapeHtml(p.delivery) : `<span class="muted">—</span>`), products.map((p) => p.delivery));
  if (products.some((p) => p.seller)) addRow("Vendedor / Envío", products.map((p) => p.seller ? escapeHtml(p.seller) : `<span class="muted">—</span>`), products.map((p) => p.seller));
  if (products.some((p) => p.returnsPolicy || p.warranty)) addRow("Devoluciones / Garantía", products.map((p) => { const parts = []; if (p.returnsPolicy) parts.push(`<div>${escapeHtml(p.returnsPolicy)}</div>`); if (p.warranty) parts.push(`<div class="muted">${escapeHtml(p.warranty)}</div>`); return parts.length ? parts.join("") : `<span class="muted">—</span>`; }), products.map((p) => `${p.returnsPolicy || ""}-${p.warranty || ""}`));
  addRow("Alertas / Banderas rojas", products.map((p) => { const f = computeRedFlags(p); return f.length ? `<div class="flags-list">${f.map((x) => `<span class="flag-pill">${escapeHtml(x)}</span>`).join("")}</div>` : `<span class="flag-ok">✓ Sin alertas</span>`; }), products.map((p) => computeRedFlags(p).join("|")), true);
  if (products.some((p) => (productNotes[p.asin || p.url] || "").trim())) addRow("Notas del creador", products.map((p) => { const v = (productNotes[p.asin || p.url] || "").trim(); return v ? `<div class="summary-quote">${escapeHtml(v)}</div>` : `<span class="muted">—</span>`; }), products.map((p) => productNotes[p.asin || p.url] || ""), true);

  if (products.some((p) => p.bullets?.length > 0)) {
    addSection("Puntos clave");
    addRow("Acerca del producto", products.map((p) => p.bullets?.length ? `<ul class="bullet-list">${p.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>` : `<span class="muted">—</span>`), products.map((p) => (p.bullets || []).join("|")), true);
  }

  const hasReviews = products.some((p) => p.reviewSummary || p.ratingDistribution || p.reviews?.length || p.criticalReviews?.length);
  if (hasReviews) {
    addSection("Opiniones y reseñas de clientes");
    if (products.some((p) => p.ratingDistribution)) {
      addRow("Distribución de estrellas", products.map((p) => {
        if (!p.ratingDistribution) return `<span class="muted">No disponible</span>`;
        return `<div class="dist-chart">${[5, 4, 3, 2, 1].map((s) => {
          const pct = p.ratingDistribution[s] ?? 0;
          return `<div class="dist-row${s <= 2 ? " star-low" : ""}"><span class="dist-label">${s}★</span><div class="dist-bar-bg"><div class="dist-bar-fill" style="width:${pct}%"></div></div><span class="dist-pct">${pct}%</span></div>`;
        }).join("")}</div>`;
      }), products.map((p) => JSON.stringify(p.ratingDistribution || {})), true);
    }
    if (products.some((p) => p.reviewSummary)) addRow("Resumen IA de Amazon", products.map((p) => p.reviewSummary ? `<div class="summary-quote">${escapeHtml(p.reviewSummary)}</div>` : `<span class="muted">No disponible</span>`), products.map((p) => p.reviewSummary), true);

    const renderReviewCard = (r, pIdx, rIdx, rtype) => {
      const starClass = r.rating >= 4 ? "review-star-high" : r.rating >= 3 ? "review-star-mid" : "review-star-low";
      const bodyShort = r.body.length > 230 ? r.body.slice(0, 230).trim() + "…" : r.body;
      const meta = [];
      if (r.verified) meta.push("✓ Compra verificada");
      if (r.helpful) meta.push(r.helpful);
      if (r.date) meta.push(r.date);
      const mediaHtml =
        (r.videos?.length || r.images?.length)
          ? `<div class="review-photos">${(r.videos || []).map((v, i) => `<button type="button" class="review-video-btn" data-pidx="${pIdx}" data-ridx="${rIdx}" data-vididx="${i}" data-rtype="${rtype}" title="Reproducir vídeo">${v.poster ? `<img src="${escapeHtml(v.poster)}" alt="" loading="lazy" />` : ""}<span class="review-video-play">▶</span></button>`).join("")}${(r.images || []).map((u, i) => `<button type="button" class="review-photo-btn" data-pidx="${pIdx}" data-ridx="${rIdx}" data-imgidx="${i}" data-rtype="${rtype}"><img src="${escapeHtml(u)}" alt="" loading="lazy" /></button>`).join("")}</div>`
          : "";
      return `<div class="review-card"><div class="review-card-head">${r.rating ? `<span class="review-star-pill ${starClass}">${r.rating.toFixed(0)}★</span>` : ""}${r.videos?.length ? `<span class="review-photo-badge">🎬 ${r.videos.length}</span>` : ""}${r.images?.length ? `<span class="review-photo-badge">📷 ${r.images.length}</span>` : ""}${r.title ? `<span class="review-title">${escapeHtml(r.title)}</span>` : ""}</div>${bodyShort ? `<div class="review-body">${escapeHtml(bodyShort)}</div>` : ""}${mediaHtml}${meta.length ? `<div class="review-meta">${meta.map((m) => `<span>${escapeHtml(m)}</span>`).join("")}</div>` : ""}</div>`;
    };

    if (products.some((p) => p.reviews?.length > 0)) {
      addRow("Reseñas destacadas", products.map((p, pIdx) => {
        const list = [...(p.reviews || [])].sort((a, b) => (b.images?.length ? 1 : 0) - (a.images?.length ? 1 : 0));
        if (!list.length) return `<span class="muted">Sin reseñas visibles</span>`;
        p._sortedReviews = list;
        const vis = list.slice(0, 3).map((r, i) => renderReviewCard(r, pIdx, i, "top")).join("");
        const hid = list.slice(3);
        const more = hid.length ? `<details class="reviews-more"><summary>Ver ${hid.length} reseña${hid.length > 1 ? "s" : ""} más</summary><div class="reviews-stack">${hid.map((r, i) => renderReviewCard(r, pIdx, i + 3, "top")).join("")}</div></details>` : "";
        return `<div class="reviews-stack">${vis}${more}</div>`;
      }), products.map((p) => (p.reviews || []).length), true);
    }

    if (products.some((p) => p.criticalReviews?.length > 0)) {
      addRow("Reseñas críticas (1–3★)", products.map((p, pIdx) => {
        const list = p.criticalReviews || [];
        if (!list.length) return `<span class="muted">Sin reseñas críticas</span>`;
        const vis = list.slice(0, 2).map((r, i) => renderReviewCard(r, pIdx, i, "critical")).join("");
        const hid = list.slice(2);
        const more = hid.length ? `<details class="reviews-more"><summary>Ver ${hid.length} crítica${hid.length > 1 ? "s" : ""} más</summary><div class="reviews-stack">${hid.map((r, i) => renderReviewCard(r, pIdx, i + 2, "critical")).join("")}</div></details>` : "";
        return `<div class="reviews-stack">${vis}${more}</div>`;
      }), products.map((p) => (p.criticalReviews || []).length), true);
    }
  }

  const unifiedSpecs = collectUnifiedSpecs(products);
  const filteredSpecs = unifiedSpecs.filter((row) => {
    if (diffOnly && !row.hasDiff) return false;
    if (commonOnly && products.length > 1 && row.presentCount < 2) return false;
    if (query) return normalizeSpecKey(row.label).includes(query) || row.values.some((v) => normalizeSpecKey(v).includes(query));
    return true;
  });
  if (filteredSpecs.length > 0) {
    addSection(`Especificaciones técnicas (${filteredSpecs.length})`);
    for (const row of filteredSpecs) {
      addRow(row.label, row.values.map((v) => v ? escapeHtml(v) : `<span class="muted">—</span>`), row.values, true);
    }
  }

  html += `</tbody></table>`;
  tableWrapper.innerHTML = html;
  bindInteractiveHandlers(tableWrapper);
}

function bindInteractiveHandlers(root) {
  root.querySelectorAll(".gallery-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = products[+btn.dataset.pidx];
      const imgs = p?.images?.length ? p.images : p?.image ? [p.image] : [];
      const key = p.asin || p.url;
      activeImageIndex.set(key, ((activeImageIndex.get(key) || 0) + (+btn.dataset.dir) + imgs.length) % imgs.length);
      renderAll();
    });
  });
  root.querySelectorAll(".thumb-strip .thumb-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = products[+btn.dataset.pidx];
      activeImageIndex.set(p.asin || p.url, +btn.dataset.imgidx);
      renderAll();
    });
  });
  root.querySelectorAll(".product-main-img").forEach((img) => {
    img.addEventListener("click", () => {
      const p = products[+img.dataset.pidx];
      const imgs = p.images?.length ? p.images : p.image ? [p.image] : [];
      openLightbox(imgs, activeImageIndex.get(p.asin || p.url) || 0, p.title);
    });
  });
  root.querySelectorAll(".review-photo-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = products[+btn.dataset.pidx];
      const r = btn.dataset.rtype === "critical" ? p.criticalReviews[+btn.dataset.ridx] : (p._sortedReviews || p.reviews)[+btn.dataset.ridx];
      if (r?.images?.length) openLightbox(r.images, +btn.dataset.imgidx, r.title || p.title);
    });
  });
  root.querySelectorAll(".review-video-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = products[+btn.dataset.pidx];
      const r = btn.dataset.rtype === "critical" ? p.criticalReviews[+btn.dataset.ridx] : (p._sortedReviews || p.reviews)[+btn.dataset.ridx];
      const vid = r?.videos?.[+btn.dataset.vididx];
      if (!vid?.url) return;
      openVideoLightbox(vid.url, vid.poster, `Vídeo — ${r.title || p.title}`, p.url);
    });
  });
  root.querySelectorAll(".vote-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      votingProductKey = btn.dataset.votekey;
      voteProductLabel.textContent = btn.dataset.votetitle || "";
      voterNameInput.value = localStorage.getItem("ca_voter_name") || "";
      voterCommentInput.value = "";
      voteModalBackdrop.classList.remove("hidden");
      voterNameInput.focus();
    });
  });
}

// Vote modal handlers
const closeVoteModal = () => voteModalBackdrop.classList.add("hidden");
closeVoteModalBtn.addEventListener("click", closeVoteModal);
cancelVoteBtn.addEventListener("click", closeVoteModal);
voteModalBackdrop.addEventListener("click", (e) => { if (e.target === voteModalBackdrop) closeVoteModal(); });
confirmVoteBtn.addEventListener("click", async () => {
  if (!votingProductKey) return;
  const voterName = voterNameInput.value.trim() || "Anónimo";
  const comment = voterCommentInput.value.trim();
  localStorage.setItem("ca_voter_name", voterName);
  confirmVoteBtn.disabled = true;
  confirmVoteBtn.textContent = "Enviando...";
  try {
    const res = await fetch("/api/vote.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comparisonId: BOOT.id, productKey: votingProductKey, voterName, comment })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Error");
    votesByKey = data.votes || votesByKey;
    closeVoteModal();
    renderAll();
    showToast("¡Voto guardado!");
  } catch (err) {
    showToast(`Error al votar: ${err.message}`);
  } finally {
    confirmVoteBtn.disabled = false;
    confirmVoteBtn.textContent = "👍 Enviar voto";
  }
});

// Lightbox
function renderLightbox() {
  const { images, index, title } = lightboxState;
  lightboxTitle.textContent = title;
  lightboxCounter.textContent = `${index + 1} / ${images.length}`;
  lightboxImg.src = images[index];
  lightboxPrevBtn.classList.toggle("hidden", images.length <= 1);
  lightboxNextBtn.classList.toggle("hidden", images.length <= 1);
  lightboxThumbs.innerHTML = images.map((u, i) => `<button type="button" class="thumb-btn${i === index ? " active" : ""}" data-lbidx="${i}"><img src="${escapeHtml(u)}" alt="" /></button>`).join("");
  lightboxThumbs.querySelectorAll(".thumb-btn").forEach((b) => b.addEventListener("click", () => { lightboxState.index = +b.dataset.lbidx; renderLightbox(); }));
}
function clearLbVideo() {
  const v = document.getElementById("lbVideoEl");
  if (v) { v.pause?.(); v.remove(); }
  const fb = document.getElementById("lbVideoFb");
  if (fb) fb.remove();
  lightboxImg.classList.remove("hidden");
}
function openVideoLightbox(videoUrl, posterUrl, title, productUrl) {
  clearLbVideo();
  lightboxTitle.textContent = title;
  lightboxCounter.textContent = "Vídeo";
  lightboxPrevBtn.classList.add("hidden");
  lightboxNextBtn.classList.add("hidden");
  lightboxThumbs.innerHTML = "";
  lightboxImg.classList.add("hidden");
  const stage = lightboxImg.parentElement;
  const isM3u8 = /\.m3u8(\?|$)/i.test(videoUrl);
  const canPlay = !isM3u8 || Boolean(document.createElement("video").canPlayType("application/vnd.apple.mpegurl"));
  if (canPlay) {
    const vid = document.createElement("video");
    vid.id = "lbVideoEl";
    vid.className = "lightbox-video";
    vid.controls = true;
    vid.autoplay = true;
    vid.playsInline = true;
    if (posterUrl) vid.poster = posterUrl;
    vid.src = videoUrl;
    stage.appendChild(vid);
  } else {
    const fb = document.createElement("div");
    fb.id = "lbVideoFb";
    fb.style.cssText = "text-align:center;padding:24px;color:#0f172a;";
    fb.innerHTML = `${posterUrl ? `<img src="${escapeHtml(posterUrl)}" style="max-height:260px;border-radius:10px;margin-bottom:12px;" /><br/>` : ""}<p style="margin-bottom:12px;">Formato HLS (.m3u8) de Amazon.</p><a href="${escapeHtml(productUrl || videoUrl)}" target="_blank" rel="noopener" class="btn btn-ai-custom" style="text-decoration:none;">Ver vídeo en Amazon ↗</a>`;
    stage.appendChild(fb);
  }
  imageLightbox.classList.remove("hidden");
}
function openLightbox(images, startIndex, title) {
  clearLbVideo();
  lightboxState = { images, index: startIndex, title };
  renderLightbox();
  imageLightbox.classList.remove("hidden");
}
lightboxCloseBtn.addEventListener("click", () => { clearLbVideo(); imageLightbox.classList.add("hidden"); });
imageLightbox.addEventListener("click", (e) => { if (e.target === imageLightbox) { clearLbVideo(); imageLightbox.classList.add("hidden"); } });
lightboxPrevBtn.addEventListener("click", () => { lightboxState.index = (lightboxState.index - 1 + lightboxState.images.length) % lightboxState.images.length; renderLightbox(); });
lightboxNextBtn.addEventListener("click", () => { lightboxState.index = (lightboxState.index + 1) % lightboxState.images.length; renderLightbox(); });
document.addEventListener("keydown", (e) => {
  if (!imageLightbox.classList.contains("hidden")) {
    if (e.key === "Escape") imageLightbox.classList.add("hidden");
    if (e.key === "ArrowLeft") lightboxPrevBtn.click();
    if (e.key === "ArrowRight") lightboxNextBtn.click();
  }
});

// AI export
function buildAiPrompt() {
  const lines = [`Actúa como un experto asesor de compras. Ayúdame a comparar estos ${products.length} productos de Amazon y elegir la mejor opción:\n`];
  products.forEach((p, i) => {
    lines.push(`### Opción ${i + 1}: ${p.title}`);
    if (p.brand) lines.push(`- Marca: ${p.brand}`);
    if (p.variant) lines.push(`- Variante: ${p.variant}`);
    lines.push(`- Precio: ${p.priceDisplay || "N/D"}${p.couponText ? ` (${p.couponText}${p.netPriceDisplay ? " -> " + p.netPriceDisplay : ""})` : ""}`);
    if (p.ratingNum) lines.push(`- Valoración: ${p.ratingNum}/5 (${p.reviewCount || "?"} reseñas)`);
    if (p.bullets?.length) {
      lines.push(`- Puntos clave:`);
      p.bullets.slice(0, 5).forEach((b) => lines.push(`  - ${b}`));
    }
    if (p.url) lines.push(`- Enlace: ${p.url}`);
    lines.push("");
  });
  return lines.join("\n");
}

async function openAi(provider) {
  const prompt = buildAiPrompt();
  try { await navigator.clipboard.writeText(prompt); } catch {}
  const encoded = encodeURIComponent(prompt);
  const names = { chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini", perplexity: "Perplexity" };
  let url = "https://chatgpt.com/";
  if (provider === "claude") url = encoded.length <= 3500 ? `https://claude.ai/new?q=${encoded}` : "https://claude.ai/new";
  else if (provider === "gemini") url = "https://gemini.google.com/app";
  else if (provider === "perplexity") url = encoded.length <= 3500 ? `https://www.perplexity.ai/?q=${encoded}` : "https://www.perplexity.ai/";
  else url = encoded.length <= 3500 ? `https://chatgpt.com/?q=${encoded}` : "https://chatgpt.com/";
  window.open(url, "_blank", "noopener,noreferrer");
  showToast(`Prompt copiado al portapapeles. Pega con Ctrl+V en ${names[provider]}.`, 5000);
}

const aiMenuBtn = document.getElementById("aiMenuBtn");
const aiDropdown = document.getElementById("aiDropdown");
aiMenuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  aiDropdown.classList.toggle("hidden");
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".menu-wrap")) aiDropdown?.classList.add("hidden");
});

copyLinkBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(BOOT.shareUrl || location.href);
  showToast("Enlace copiado al portapapeles.");
});
quickChatGptBtn.addEventListener("click", () => { aiDropdown?.classList.add("hidden"); openAi("chatgpt"); });
quickClaudeBtn.addEventListener("click", () => { aiDropdown?.classList.add("hidden"); openAi("claude"); });
quickGeminiBtn.addEventListener("click", () => { aiDropdown?.classList.add("hidden"); openAi("gemini"); });
quickPerplexityBtn.addEventListener("click", () => { aiDropdown?.classList.add("hidden"); openAi("perplexity"); });
const SUN_SVG = `<svg class="svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const MOON_SVG = `<svg class="svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
themeToggleBtn.innerHTML = document.documentElement.getAttribute("data-theme") === "dark" ? SUN_SVG : MOON_SVG;

themeToggleBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  themeToggleBtn.innerHTML = next === "dark" ? SUN_SVG : MOON_SVG;
});
toggleViewModeBtn.addEventListener("click", () => { cardMode = !cardMode; renderAll(); });
toggleScorePanelBtn.addEventListener("click", () => scorePanel.classList.toggle("hidden"));
[weightPrice, weightRating, weightReviews].forEach((s) => {
  s.addEventListener("input", () => {
    weightPriceVal.textContent = weightPrice.value;
    weightRatingVal.textContent = weightRating.value;
    weightReviewsVal.textContent = weightReviews.value;
    renderAll();
  });
});
sortSelect.addEventListener("change", renderAll);
maxBudgetInput.addEventListener("input", renderAll);
diffOnlyToggle.addEventListener("change", renderAll);
commonOnlyToggle.addEventListener("change", renderAll);
specSearchInput.addEventListener("input", renderAll);

renderAll();
