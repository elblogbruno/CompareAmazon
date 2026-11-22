const tableWrapper = document.getElementById("tableWrapper");
const headerSubtitle = document.getElementById("headerSubtitle");
const warningBar = document.getElementById("warningBar");
const sortSelect = document.getElementById("sortSelect");
const diffOnlyToggle = document.getElementById("diffOnlyToggle");
const commonOnlyToggle = document.getElementById("commonOnlyToggle");
const specSearchInput = document.getElementById("specSearchInput");
const maxBudgetInput = document.getElementById("maxBudgetInput");
const toggleScorePanelBtn = document.getElementById("toggleScorePanelBtn");
const scorePanel = document.getElementById("scorePanel");
const weightPrice = document.getElementById("weightPrice");
const weightRating = document.getElementById("weightRating");
const weightReviews = document.getElementById("weightReviews");
const weightPriceVal = document.getElementById("weightPriceVal");
const weightRatingVal = document.getElementById("weightRatingVal");
const weightReviewsVal = document.getElementById("weightReviewsVal");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const langToggleBtn = document.getElementById("langToggleBtn");
const euPricesAllBtn = document.getElementById("euPricesAllBtn");
const openShareModalBtn = document.getElementById("openShareModalBtn");
const shareModalBackdrop = document.getElementById("shareModalBackdrop");
const closeShareModalBtn = document.getElementById("closeShareModalBtn");
const shareTitleInput = document.getElementById("shareTitleInput");
const sharePublicCheck = document.getElementById("sharePublicCheck");
const createShareLinkBtn = document.getElementById("createShareLinkBtn");
const updateShareLinkBtn = document.getElementById("updateShareLinkBtn");
const deleteShareLinkBtn = document.getElementById("deleteShareLinkBtn");
const shareResultBox = document.getElementById("shareResultBox");
const shareUrlOutput = document.getElementById("shareUrlOutput");
const copyShareUrlBtn = document.getElementById("copyShareUrlBtn");
const openShareUrlLink = document.getElementById("openShareUrlLink");
const sendWhatsappUrlLink = document.getElementById("sendWhatsappUrlLink");
const shareLinkError = document.getElementById("shareLinkError");
const printPdfBtn = document.getElementById("printPdfBtn");
const exportHtmlBtn = document.getElementById("exportHtmlBtn");
const copyWhatsappBtn = document.getElementById("copyWhatsappBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const refreshAllBtn = document.getElementById("refreshAllBtn");
const saveCompareBtn = document.getElementById("saveCompareBtn");
const openSavedBtn = document.getElementById("openSavedBtn");
const savedCountPill = document.getElementById("savedCountPill");
const openAddProductBtn = document.getElementById("openAddProductBtn");
const quickChatGptBtn = document.getElementById("quickChatGptBtn");
const quickClaudeBtn = document.getElementById("quickClaudeBtn");
const quickGeminiBtn = document.getElementById("quickGeminiBtn");
const quickPerplexityBtn = document.getElementById("quickPerplexityBtn");
const openAiModalBtn = document.getElementById("openAiModalBtn");
const aiMenuBtn = document.getElementById("aiMenuBtn");
const aiDropdown = document.getElementById("aiDropdown");
const toolsMenuBtn = document.getElementById("toolsMenuBtn");
const toolsDropdown = document.getElementById("toolsDropdown");

const addProductBackdrop = document.getElementById("addProductBackdrop");
const closeAddProductBtn = document.getElementById("closeAddProductBtn");
const cancelAddProductBtn = document.getElementById("cancelAddProductBtn");
const addProductInput = document.getElementById("addProductInput");
const addProductDomain = document.getElementById("addProductDomain");
const addProductError = document.getElementById("addProductError");
const confirmAddProductBtn = document.getElementById("confirmAddProductBtn");

const saveModalBackdrop = document.getElementById("saveModalBackdrop");
const closeSaveModalBtn = document.getElementById("closeSaveModalBtn");
const cancelSaveModalBtn = document.getElementById("cancelSaveModalBtn");
const saveNameInput = document.getElementById("saveNameInput");
const confirmSaveBtn = document.getElementById("confirmSaveBtn");

const savedListBackdrop = document.getElementById("savedListBackdrop");
const closeSavedListBtn = document.getElementById("closeSavedListBtn");
const savedListBody = document.getElementById("savedListBody");

const aiModalBackdrop = document.getElementById("aiModalBackdrop");
const closeAiModalBtn = document.getElementById("closeAiModalBtn");
const userContextInput = document.getElementById("userContextInput");
const includeBulletsCheck = document.getElementById("includeBulletsCheck");
const includeSpecsCheck = document.getElementById("includeSpecsCheck");
const includeReviewsCheck = document.getElementById("includeReviewsCheck");
const promptPreview = document.getElementById("promptPreview");
const promptCharCount = document.getElementById("promptCharCount");
const copyPromptBtn = document.getElementById("copyPromptBtn");
const modalChatGptBtn = document.getElementById("modalChatGptBtn");
const modalClaudeBtn = document.getElementById("modalClaudeBtn");
const modalGeminiBtn = document.getElementById("modalGeminiBtn");
const modalPerplexityBtn = document.getElementById("modalPerplexityBtn");
const toastEl = document.getElementById("toast");

const imageLightbox = document.getElementById("imageLightbox");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxThumbs = document.getElementById("lightboxThumbs");
const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");
const lightboxPrevBtn = document.getElementById("lightboxPrevBtn");
const lightboxNextBtn = document.getElementById("lightboxNextBtn");

let originalProducts = [];
let products = [];
let favoriteAsins = new Set();
let productNotes = {};
let savedComparisons = [];
let lastSharedLink = null;
let pinnedProductKey = null;
let currentLang = (navigator.language || "es").toLowerCase().startsWith("en") ? "en" : "es";
let activeImageIndex = new Map();

const I18N = {
  es: {
    refresh: "🔄 Actualizar",
    eu: "🇪🇺 Europa",
    save: "💾 Guardar",
    saved: "📂 Guardadas",
    share: "📤 Compartir",
    promptAi: "Prompt IA",
    diffOnly: "Solo diferencias",
    hideUnique: "Ocultar specs únicas",
    addUrl: "+ Añadir URL / ASIN",
    searchPlaceholder: "Filtrar especificaciones...",
    comparing: (n) => (n === 1 ? "Analizando 1 producto de Amazon" : `Comparando ${n} productos de Amazon`)
  },
  en: {
    refresh: "🔄 Refresh",
    eu: "🇪🇺 EU Prices",
    save: "💾 Save",
    saved: "📂 Saved",
    share: "📤 Share",
    promptAi: "AI Prompt",
    diffOnly: "Differences only",
    hideUnique: "Hide unique specs",
    addUrl: "+ Add URL / ASIN",
    searchPlaceholder: "Filter specifications...",
    comparing: (n) => (n === 1 ? "Analyzing 1 Amazon product" : `Comparing ${n} Amazon products`)
  }
};

function setBtnLabelKeepSvg(btn, text) {
  if (!btn) return;
  const svg = btn.querySelector("svg");
  if (svg) {
    btn.innerHTML = "";
    btn.appendChild(svg);
    btn.appendChild(document.createTextNode(" " + text));
  } else {
    btn.textContent = text;
  }
}

function applyLanguage(lang) {
  currentLang = lang === "en" ? "en" : "es";
  const t = I18N[currentLang];
  setBtnLabelKeepSvg(langToggleBtn, currentLang === "en" ? "Language: EN" : "Idioma: ES");
  setBtnLabelKeepSvg(refreshAllBtn, currentLang === "en" ? "Refresh data" : "Actualizar datos");
  setBtnLabelKeepSvg(euPricesAllBtn, currentLang === "en" ? "Amazon EU Prices" : "Precios Amazon Europa");
  setBtnLabelKeepSvg(saveCompareBtn, currentLang === "en" ? "Save comparison" : "Guardar comparativa");
  setBtnLabelKeepSvg(openShareModalBtn, currentLang === "en" ? "Share" : "Compartir");
  openAddProductBtn.textContent = t.addUrl;
  specSearchInput.placeholder = t.searchPlaceholder;
  const diffSpan = diffOnlyToggle.nextElementSibling;
  if (diffSpan) diffSpan.textContent = t.diffOnly;
  const commonSpan = commonOnlyToggle.nextElementSibling;
  if (commonSpan) commonSpan.textContent = t.hideUnique;
}

function analyzeSpecNumbers(label, values) {
  const parsed = values.map((v) => {
    if (!v) return null;
    const m = String(v).match(/(\d+(?:[.,]\d+)?)\s*(gb|tb|mb|mah|wh|w|hz|khz|horas?|hours?|h|min|kg|g|gr|mm|cm|m|pulgadas|inch|"|db|lm|lumenes|mp|fps)?/i);
    if (!m) return null;
    let num = parseFloat(m[1].replace(",", "."));
    if (!Number.isFinite(num)) return null;
    const unit = (m[2] || "").toLowerCase();
    // Normalize common unit pairs
    if (unit === "tb") num *= 1024;
    if (unit === "kg") num *= 1000;
    if (unit === "cm") num *= 10;
    return { num, unit };
  });

  const valid = parsed.filter(Boolean);
  if (valid.length < 2) return null;
  const nums = valid.map((x) => x.num);
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  if (max === min) return null;

  const lowerIsBetter = /(peso|weight|ruido|noise|db|latencia|latency|consumo|grosor|thickness)/i.test(label);
  return { parsed, best: lowerIsBetter ? min : max, worst: lowerIsBetter ? max : min };
}
let lightboxState = { images: [], index: 0, title: "" };
let dragFromIndex = null;
let toastTimer = null;

const KEEPA_DOMAIN_IDS = {
  "amazon.com": 1,
  "amazon.co.uk": 2,
  "amazon.de": 3,
  "amazon.fr": 4,
  "amazon.co.jp": 5,
  "amazon.ca": 6,
  "amazon.it": 8,
  "amazon.es": 9,
  "amazon.in": 10,
  "amazon.com.mx": 11,
  "amazon.com.br": 12,
  "amazon.com.au": 13,
  "amazon.nl": 14
};

const CAMEL_PREFIXES = {
  "amazon.com": "",
  "amazon.es": "es.",
  "amazon.co.uk": "uk.",
  "amazon.de": "de.",
  "amazon.fr": "fr.",
  "amazon.it": "it.",
  "amazon.ca": "ca.",
  "amazon.com.au": "au.",
  "amazon.co.jp": "jp."
};

function getEffectivePrice(p) {
  if (typeof p.netPriceNum === "number" && p.netPriceNum > 0) return p.netPriceNum;
  if (typeof p.priceNum === "number" && p.priceNum > 0) return p.priceNum;
  return null;
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

async function persistCurrentState() {
  await chrome.storage.local.set({
    compareData: {
      products: originalProducts,
      failed: [],
      createdAt: Date.now()
    },
    productNotes,
    favoriteAsins: Array.from(favoriteAsins)
  });
}

function showToast(message, durationMs = 4200) {
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add("hidden");
  }, durationMs);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeSpecKey(key) {
  return key
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
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

function computeWinners(list) {
  let minPrice = Infinity;
  let maxRating = -1;
  let maxReviews = -1;

  for (const p of list) {
    const effPrice = getEffectivePrice(p);
    if (effPrice !== null && effPrice < minPrice) {
      minPrice = effPrice;
    }
    if (typeof p.ratingNum === "number" && p.ratingNum > maxRating) {
      maxRating = p.ratingNum;
    }
    if (typeof p.reviewCount === "number" && p.reviewCount > maxReviews) {
      maxReviews = p.reviewCount;
    }
  }

  return {
    minPrice: list.length > 1 && Number.isFinite(minPrice) ? minPrice : null,
    maxRating: list.length > 1 && maxRating > 0 ? maxRating : null,
    maxReviews: list.length > 1 && maxReviews > 0 ? maxReviews : null
  };
}

function collectUnifiedSpecs(list) {
  const map = new Map();

  list.forEach((product, idx) => {
    const entries = Object.entries(product.specs || {});
    for (const [rawKey, val] of entries) {
      const norm = normalizeSpecKey(rawKey);
      if (!norm) continue;
      if (!map.has(norm)) {
        map.set(norm, {
          label: rawKey,
          values: new Array(list.length).fill("")
        });
      }
      const entry = map.get(norm);
      if (!entry.values[idx]) {
        entry.values[idx] = val;
      }
    }
  });

  // Sort specs: those shared by more products come first, then alphabetical
  return Array.from(map.values())
    .map((row) => {
      const nonEmpty = row.values.filter(Boolean);
      const uniqueNorm = new Set(nonEmpty.map((v) => normalizeSpecKey(v)));
      const hasDiff =
        list.length > 1 && (uniqueNorm.size > 1 || (nonEmpty.length > 0 && nonEmpty.length < list.length));
      return {
        ...row,
        presentCount: nonEmpty.length,
        hasDiff
      };
    })
    .sort((a, b) => {
      if (b.presentCount !== a.presentCount) return b.presentCount - a.presentCount;
      return a.label.localeCompare(b.label, "es");
    });
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
    let priceScore = 0.5;
    if (ep !== null) {
      priceScore = maxP > minP ? 1 - (ep - minP) / (maxP - minP) : 1;
    }

    const ratingScore = p.ratingNum ? Math.max(0, Math.min(1, (p.ratingNum - 1) / 4)) : 0.4;
    const revScore = logReviews[i] / maxLogRev;

    const raw = ((priceScore * wP + ratingScore * wR + revScore * wN) / totalW) * 10;
    const score = Math.round(raw * 10) / 10;
    const key = p.asin || p.url;
    scores.set(key, score);
    if (score > bestScore) bestScore = score;
  });

  return { scores, bestScore: list.length > 1 ? bestScore : null };
}

function computeRedFlags(p) {
  const flags = [];
  if (p.ratingDistribution) {
    const negPct = (p.ratingDistribution[1] || 0) + (p.ratingDistribution[2] || 0);
    if (negPct >= 15) {
      flags.push(`⚠️ ${negPct}% reseñas negativas (1–2★)`);
    }
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

function getMaxBudget() {
  const v = parseFloat(maxBudgetInput?.value);
  return Number.isFinite(v) && v > 0 ? v : null;
}

function applySort() {
  const mode = sortSelect.value;
  const copy = [...originalProducts];
  if (mode === "score-desc") {
    const { scores } = computeScores(copy);
    copy.sort((a, b) => (scores.get(b.asin || b.url) ?? -1) - (scores.get(a.asin || a.url) ?? -1));
  } else if (mode === "price-asc") {
    copy.sort((a, b) => (getEffectivePrice(a) ?? Infinity) - (getEffectivePrice(b) ?? Infinity));
  } else if (mode === "price-desc") {
    copy.sort((a, b) => (getEffectivePrice(b) ?? -1) - (getEffectivePrice(a) ?? -1));
  } else if (mode === "rating-desc") {
    copy.sort((a, b) => (b.ratingNum ?? -1) - (a.ratingNum ?? -1));
  } else if (mode === "reviews-desc") {
    copy.sort((a, b) => (b.reviewCount ?? -1) - (a.reviewCount ?? -1));
  }
  // Keep pinned reference product in column 0 so sticky left:210px works cleanly
  if (pinnedProductKey) {
    const pinIdx = copy.findIndex((p) => (p.asin || p.url) === pinnedProductKey);
    if (pinIdx > 0) {
      const [pinned] = copy.splice(pinIdx, 1);
      copy.unshift(pinned);
    }
  }
  products = copy;
}

function renderTable() {
  applySort();

  if (products.length === 0) {
    headerSubtitle.textContent = "Sin productos en la comparativa";
    tableWrapper.innerHTML = `
      <div class="empty-page">
        <div style="font-size: 40px;">🛒</div>
        <h2>No hay productos para comparar</h2>
        <p>Abre varias pestañas de productos en Amazon y haz clic en el icono de CompareAmazon para generar una nueva tabla.</p>
      </div>
    `;
    return;
  }

  headerSubtitle.textContent = I18N[currentLang].comparing(products.length);

  const winners = computeWinners(products);
  const { scores, bestScore } = computeScores(products);
  const maxBudget = getMaxBudget();
  const diffOnly = diffOnlyToggle.checked;
  const commonOnly = commonOnlyToggle.checked;
  const query = normalizeSpecKey(specSearchInput.value || "");

  const isDiffRow = (vals) => {
    if (products.length <= 1) return false;
    const norm = new Set(vals.map((v) => normalizeSpecKey(String(v || ""))));
    return norm.size > 1;
  };

  let html = `<table class="compare-table"><thead><tr class="sticky-name-row">`;
  html += `<th class="attr-col">Producto</th>`;

  products.forEach((p, idx) => {
    const pKey = p.asin || p.url;
    const isFav = favoriteAsins.has(pKey);
    const isPinned = pinnedProductKey === pKey;
    const stickyPrice = p.netPriceDisplay || p.priceDisplay;

    html += `
      <th class="product-col${isFav ? " fav-col" : ""}${isPinned ? " pinned-col" : ""}" draggable="true" data-colidx="${idx}">
        <div class="sticky-head-cell">
          <div class="product-card-top">
            <span class="domain-pill">${escapeHtml(p.domain || "Amazon")}</span>
            ${stickyPrice ? `<span class="sticky-price-pill">${escapeHtml(stickyPrice)}${p.netPriceDisplay ? " neto" : ""}</span>` : ""}
            <div class="card-icon-actions">
              <button type="button" class="icon-btn pin-btn${isPinned ? " pin-active" : ""}" data-key="${escapeHtml(pKey)}" title="Fijar como producto de referencia">📌</button>
              ${idx > 0 ? `<button type="button" class="icon-btn move-btn" data-index="${idx}" data-dir="-1" title="Mover a la izquierda">◀</button>` : ""}
              ${idx < products.length - 1 ? `<button type="button" class="icon-btn move-btn" data-index="${idx}" data-dir="1" title="Mover a la derecha">▶</button>` : ""}
              <button type="button" class="icon-btn fav-btn${isFav ? " fav-active" : ""}" data-key="${escapeHtml(pKey)}" title="Marcar como favorito">★</button>
              <button type="button" class="icon-btn remove-btn" data-index="${idx}" title="Quitar de la comparativa">&times;</button>
            </div>
          </div>
          <a class="product-title-link" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(p.title)}">
            ${escapeHtml(p.title)}
          </a>
        </div>
      </th>
    `;
  });

  html += `</tr></thead><tbody>`;

  // Photo gallery + winner badges row (scrolls naturally under the sticky product name)
  html += `<tr><th class="attr-col">Fotos</th>`;
  products.forEach((p, idx) => {
    const pKey = p.asin || p.url;
    const isFav = favoriteAsins.has(pKey);
    const imgs = p.images?.length ? p.images : p.image ? [p.image] : [];
    const curImgIdx = Math.min(activeImageIndex.get(pKey) || 0, Math.max(0, imgs.length - 1));
    const curImgUrl = imgs[curImgIdx] || "";

    const badges = [];
    const effPrice = getEffectivePrice(p);
    const score = scores.get(pKey);
    if (score !== undefined) {
      if (bestScore !== null && score === bestScore) {
        badges.push(`<span class="pill pill-score-winner">🏆 ${score.toFixed(1)}/10 · Ganador</span>`);
      } else {
        badges.push(`<span class="pill pill-score">⚖️ ${score.toFixed(1)}/10</span>`);
      }
    }
    if (maxBudget !== null && effPrice !== null && effPrice > maxBudget) {
      const diff = (effPrice - maxBudget).toFixed(0);
      badges.push(`<span class="pill pill-over-budget">💸 +${diff}€ sobre presupuesto</span>`);
    }
    if (winners.minPrice !== null && effPrice === winners.minPrice) {
      badges.push(`<span class="pill pill-best-price">🏷️ Mejor precio</span>`);
    }
    if (winners.maxRating !== null && p.ratingNum === winners.maxRating) {
      badges.push(`<span class="pill pill-best-rating">⭐ Mejor valorado</span>`);
    }
    if (winners.maxReviews !== null && p.reviewCount === winners.maxReviews) {
      badges.push(`<span class="pill pill-most-reviews">💬 Más reseñas</span>`);
    }

    const navHtml =
      imgs.length > 1
        ? `
          <button type="button" class="gallery-nav-btn prev" data-pidx="${idx}" data-dir="-1" title="Foto anterior">&#8249;</button>
          <button type="button" class="gallery-nav-btn next" data-pidx="${idx}" data-dir="1" title="Foto siguiente">&#8250;</button>
          <span class="gallery-counter">${curImgIdx + 1} / ${imgs.length}</span>
        `
        : "";

    const thumbsHtml =
      imgs.length > 1
        ? `<div class="thumb-strip">${imgs
            .map(
              (url, tIdx) => `
            <button type="button" class="thumb-btn${tIdx === curImgIdx ? " active" : ""}" data-pidx="${idx}" data-imgidx="${tIdx}" title="Ver foto ${tIdx + 1}">
              <img src="${escapeHtml(url)}" alt="" loading="lazy" />
            </button>
          `
            )
            .join("")}</div>`
        : "";

    html += `
      <td class="${isFav ? "fav-col" : ""}${pinnedProductKey === pKey ? " pinned-col" : ""}">
        <div class="product-gallery-cell">
          <div class="product-img-wrap">
            ${
              curImgUrl
                ? `<img class="product-main-img" data-pidx="${idx}" src="${escapeHtml(curImgUrl)}" alt="${escapeHtml(p.title)}" loading="lazy" title="Haz clic para ampliar" />`
                : `<span class="muted">Sin imagen</span>`
            }
            ${navHtml}
          </div>
          ${thumbsHtml}
          ${badges.length ? `<div class="winner-badges">${badges.join("")}</div>` : ""}
        </div>
      </td>
    `;
  });
  html += `</tr>`;

  const colSpan = products.length + 1;
  const addSection = (title) => {
    html += `<tr class="section-row"><th colspan="${colSpan}">${escapeHtml(title)}</th></tr>`;
  };

  const addRow = (label, cellsHtml, rawValues, forceShow = false) => {
    const diff = isDiffRow(rawValues);
    if (diffOnly && !diff && !forceShow) return;
    html += `<tr class="${diff ? "diff-row" : ""}">`;
    html += `<th class="attr-col">${escapeHtml(label)}</th>`;
    products.forEach((p, i) => {
      const pKey = p.asin || p.url;
      const isFav = favoriteAsins.has(pKey);
      const isPinned = pinnedProductKey === pKey;
      const ep = getEffectivePrice(p);
      const isOver = maxBudget !== null && ep !== null && ep > maxBudget;
      const cls = [isFav ? "fav-col" : "", isPinned ? "pinned-col" : "", isOver ? "over-budget-col" : ""].filter(Boolean).join(" ");
      html += `<td class="${cls}">${cellsHtml[i]}</td>`;
    });
    html += `</tr>`;
  };

  // --- SECTION: RESUMEN ---
  addSection("Resumen");

  addRow(
    "Precio",
    products.map((p) => {
      const history = getPriceHistoryUrls(p);
      const historyHtml = history
        ? `<div class="price-history-links">
            <a class="history-link" href="${escapeHtml(history.keepa)}" target="_blank" rel="noopener noreferrer" title="Ver historial de precios en Keepa">📈 Keepa</a>
            <a class="history-link" href="${escapeHtml(history.camel)}" target="_blank" rel="noopener noreferrer" title="Ver historial de precios en CamelCamelCamel">🐪 Camel</a>
          </div>`
        : "";

      if (!p.priceDisplay) return `<span class="muted">No disponible</span>${historyHtml}`;
      const oldHtml = p.listPriceDisplay
        ? `<span class="price-old">${escapeHtml(p.listPriceDisplay)}</span>`
        : "";
      const discHtml = p.discountPct
        ? ` <span class="pill pill-discount">-${p.discountPct}%</span>`
        : "";
      const couponHtml = p.couponText
        ? `<div class="coupon-block">
            <span class="pill pill-coupon">🎟️ ${escapeHtml(p.couponText)}</span>
            ${p.netPriceDisplay ? `<span class="net-price-line">Precio neto: ${escapeHtml(p.netPriceDisplay)}</span>` : ""}
          </div>`
        : "";
      const unitHtml = p.unitPrice
        ? `<div class="unit-price-line">${escapeHtml(p.unitPrice)}</div>`
        : "";
      let euHtml = "";
      if (p.euPrices && p.euPrices.length > 0) {
        const minEu = Math.min(...p.euPrices.filter((x) => x.priceNum > 0).map((x) => x.priceNum));
        euHtml = `<div class="eu-prices-bar">${p.euPrices
          .map(
            (x) =>
              `<a class="eu-pill${x.priceNum === minEu ? " eu-best" : ""}" href="${escapeHtml(x.url)}" target="_blank" rel="noopener noreferrer" title="Abrir en ${escapeHtml(x.domain)}">${x.flag} ${escapeHtml(x.priceDisplay)}${x.priceNum === minEu ? " 🏆" : ""}</a>`
          )
          .join("")}</div>`;
      }
      return `<div><span class="price-main">${escapeHtml(p.priceDisplay)}</span>${oldHtml}${discHtml}</div>${couponHtml}${unitHtml}${euHtml}${historyHtml}`;
    }),
    products.map((p) => getEffectivePrice(p) ?? p.priceDisplay),
    true
  );

  addRow(
    "Valoración",
    products.map((p) => {
      if (!p.ratingNum) return `<span class="muted">Sin valoraciones</span>`;
      return `
        <div class="rating-wrap">
          <span class="stars">${renderStars(p.ratingNum)}</span>
          <span>${p.ratingNum.toFixed(1)} / 5</span>
        </div>
      `;
    }),
    products.map((p) => p.ratingNum),
    true
  );

  addRow(
    "Nº de reseñas",
    products.map((p) =>
      p.reviewCount !== null && p.reviewCount !== undefined
        ? `<strong>${formatNumber(p.reviewCount)}</strong>`
        : `<span class="muted">—</span>`
    ),
    products.map((p) => p.reviewCount)
  );

  addRow(
    "Marca",
    products.map((p) => (p.brand ? escapeHtml(p.brand) : `<span class="muted">—</span>`)),
    products.map((p) => p.brand)
  );

  addRow(
    "Prime / Disponibilidad",
    products.map((p) => {
      const parts = [];
      if (p.isPrime) parts.push(`<span class="pill pill-prime">Prime ✓</span>`);
      if (p.availability) parts.push(`<div>${escapeHtml(p.availability)}</div>`);
      return parts.length ? parts.join(" ") : `<span class="muted">—</span>`;
    }),
    products.map((p) => `${p.isPrime}-${p.availability}`)
  );

  if (products.some((p) => p.delivery)) {
    addRow(
      "Envío estimado",
      products.map((p) => (p.delivery ? escapeHtml(p.delivery) : `<span class="muted">—</span>`)),
      products.map((p) => p.delivery)
    );
  }

  if (products.some((p) => p.seller)) {
    addRow(
      "Vendedor / Envío",
      products.map((p) => (p.seller ? escapeHtml(p.seller) : `<span class="muted">—</span>`)),
      products.map((p) => p.seller)
    );
  }

  if (products.some((p) => p.variant)) {
    addRow(
      "Variante seleccionada",
      products.map((p) =>
        p.variant ? `<span class="variant-pill">${escapeHtml(p.variant)}</span>` : `<span class="muted">—</span>`
      ),
      products.map((p) => p.variant)
    );
  }

  if (products.some((p) => p.returnsPolicy || p.warranty)) {
    addRow(
      "Devoluciones / Garantía",
      products.map((p) => {
        const parts = [];
        if (p.returnsPolicy) parts.push(`<div>${escapeHtml(p.returnsPolicy)}</div>`);
        if (p.warranty) parts.push(`<div class="muted">${escapeHtml(p.warranty)}</div>`);
        return parts.length ? parts.join("") : `<span class="muted">—</span>`;
      }),
      products.map((p) => `${p.returnsPolicy || ""}-${p.warranty || ""}`)
    );
  }

  addRow(
    "Alertas / Banderas rojas",
    products.map((p) => {
      const flags = computeRedFlags(p);
      if (flags.length === 0) return `<span class="flag-ok">✓ Sin alertas detectadas</span>`;
      return `<div class="flags-list">${flags.map((f) => `<span class="flag-pill">${escapeHtml(f)}</span>`).join("")}</div>`;
    }),
    products.map((p) => computeRedFlags(p).join("|")),
    true
  );

  addRow(
    "Mis notas",
    products.map((p) => {
      const pKey = p.asin || p.url;
      const val = productNotes[pKey] || "";
      return `<textarea class="note-input" data-notekey="${escapeHtml(pKey)}" placeholder="Apunta pros, dudas o por qué lo descartas...">${escapeHtml(val)}</textarea>`;
    }),
    products.map((p) => productNotes[p.asin || p.url] || ""),
    true
  );

  if (products.some((p) => p.category)) {
    addRow(
      "Categoría",
      products.map((p) =>
        p.category ? `<span class="muted">${escapeHtml(p.category)}</span>` : `<span class="muted">—</span>`
      ),
      products.map((p) => p.category)
    );
  }

  // --- SECTION: PUNTOS CLAVE ---
  if (products.some((p) => p.bullets?.length > 0)) {
    addSection("Puntos clave");
    addRow(
      "Acerca del producto",
      products.map((p) => {
        if (!p.bullets?.length) return `<span class="muted">—</span>`;
        return `<ul class="bullet-list">${p.bullets
          .map((b) => `<li>${escapeHtml(b)}</li>`)
          .join("")}</ul>`;
      }),
      products.map((p) => (p.bullets || []).join("|")),
      true
    );
  }

  // --- SECTION: OPINIONES Y RESEÑAS ---
  const hasAnyReviewsSection = products.some(
    (p) =>
      p.reviewSummary ||
      p.ratingDistribution ||
      (p.reviews && p.reviews.length > 0) ||
      (p.criticalReviews && p.criticalReviews.length > 0)
  );

  if (hasAnyReviewsSection) {
    addSection("Opiniones y reseñas de clientes");

    if (products.some((p) => p.ratingDistribution)) {
      addRow(
        "Distribución de estrellas",
        products.map((p) => {
          if (!p.ratingDistribution) return `<span class="muted">No disponible</span>`;
          const bars = [5, 4, 3, 2, 1]
            .map((star) => {
              const pct = p.ratingDistribution[star] ?? 0;
              return `
                <div class="dist-row${star <= 2 ? " star-low" : ""}">
                  <span class="dist-label">${star}★</span>
                  <div class="dist-bar-bg"><div class="dist-bar-fill" style="width: ${pct}%"></div></div>
                  <span class="dist-pct">${pct}%</span>
                </div>
              `;
            })
            .join("");
          return `<div class="dist-chart">${bars}</div>`;
        }),
        products.map((p) => JSON.stringify(p.ratingDistribution || {})),
        true
      );
    }

    if (products.some((p) => p.reviewSummary)) {
      addRow(
        "Resumen IA de Amazon",
        products.map((p) =>
          p.reviewSummary
            ? `<div class="summary-quote">${escapeHtml(p.reviewSummary)}</div>`
            : `<span class="muted">No disponible en esta ficha</span>`
        ),
        products.map((p) => p.reviewSummary),
        true
      );
    }

    const renderReviewCard = (r, pIdx, rIdx, listType = "top") => {
      const starClass =
        r.rating >= 4 ? "review-star-high" : r.rating >= 3 ? "review-star-mid" : "review-star-low";
      const bodyShort = r.body.length > 230 ? r.body.slice(0, 230).trim() + "…" : r.body;
      const metaParts = [];
      if (r.verified) metaParts.push("✓ Compra verificada");
      if (r.helpful) metaParts.push(r.helpful);
      if (r.date) metaParts.push(r.date);

      const mediaHtml =
        (r.videos && r.videos.length > 0) || (r.images && r.images.length > 0)
          ? `<div class="review-photos">${(r.videos || [])
              .map(
                (v, vIdx) => `
              <button type="button" class="review-video-btn" data-pidx="${pIdx}" data-ridx="${rIdx}" data-vididx="${vIdx}" data-rtype="${listType}" title="Reproducir vídeo de reseña">
                ${v.poster ? `<img src="${escapeHtml(v.poster)}" alt="Vídeo de reseña" loading="lazy" />` : ""}
                <span class="review-video-play">▶</span>
              </button>
            `
              )
              .join("")}${(r.images || [])
              .map(
                (url, imgIdx) => `
              <button type="button" class="review-photo-btn" data-pidx="${pIdx}" data-ridx="${rIdx}" data-imgidx="${imgIdx}" data-rtype="${listType}" title="Ampliar foto de reseña">
                <img src="${escapeHtml(url)}" alt="Foto de reseña" loading="lazy" />
              </button>
            `
              )
              .join("")}</div>`
          : "";

      return `
        <div class="review-card">
          <div class="review-card-head">
            ${r.rating ? `<span class="review-star-pill ${starClass}">${r.rating.toFixed(0)}★</span>` : ""}
            ${r.videos?.length ? `<span class="review-photo-badge">🎬 ${r.videos.length}</span>` : ""}
            ${r.images?.length ? `<span class="review-photo-badge">📷 ${r.images.length}</span>` : ""}
            ${r.title ? `<span class="review-title">${escapeHtml(r.title)}</span>` : ""}
          </div>
          ${bodyShort ? `<div class="review-body">${escapeHtml(bodyShort)}</div>` : ""}
          ${mediaHtml}
          ${metaParts.length ? `<div class="review-meta">${metaParts.map((m) => `<span>${escapeHtml(m)}</span>`).join("")}</div>` : ""}
        </div>
      `;
    };

    if (products.some((p) => p.reviews?.length > 0)) {
      addRow(
        "Reseñas destacadas",
        products.map((p, pIdx) => {
          const list = [...(p.reviews || [])].sort(
            (a, b) => (b.images?.length ? 1 : 0) - (a.images?.length ? 1 : 0)
          );
          if (list.length === 0) return `<span class="muted">Sin reseñas visibles en la ficha</span>`;
          p._sortedReviews = list;
          const visible = list.slice(0, 3).map((r, i) => renderReviewCard(r, pIdx, i, "top")).join("");
          const hidden = list.slice(3);
          const moreHtml =
            hidden.length > 0
              ? `<details class="reviews-more"><summary>Ver ${hidden.length} reseña${hidden.length > 1 ? "s" : ""} más</summary><div class="reviews-stack">${hidden.map((r, i) => renderReviewCard(r, pIdx, i + 3, "top")).join("")}</div></details>`
              : "";
          return `<div class="reviews-stack">${visible}${moreHtml}</div>`;
        }),
        products.map((p) => (p.reviews || []).length),
        true
      );
    }

    if (products.some((p) => p.criticalReviews?.length > 0)) {
      addRow(
        "Reseñas críticas (1–3★)",
        products.map((p, pIdx) => {
          const list = p.criticalReviews || [];
          if (list.length === 0) return `<span class="muted">Sin reseñas críticas extraídas</span>`;
          const visible = list.slice(0, 2).map((r, i) => renderReviewCard(r, pIdx, i, "critical")).join("");
          const hidden = list.slice(2);
          const moreHtml =
            hidden.length > 0
              ? `<details class="reviews-more"><summary>Ver ${hidden.length} crítica${hidden.length > 1 ? "s" : ""} más</summary><div class="reviews-stack">${hidden.map((r, i) => renderReviewCard(r, pIdx, i + 2, "critical")).join("")}</div></details>`
              : "";
          return `<div class="reviews-stack">${visible}${moreHtml}</div>`;
        }),
        products.map((p) => (p.criticalReviews || []).length),
        true
      );
    }
  }

  // --- SECTION: ESPECIFICACIONES TÉCNICAS ---
  const unifiedSpecs = collectUnifiedSpecs(products);
  const filteredSpecs = unifiedSpecs.filter((row) => {
    if (diffOnly && !row.hasDiff) return false;
    if (commonOnly && products.length > 1 && row.presentCount < 2) return false;
    if (query) {
      const keyMatch = normalizeSpecKey(row.label).includes(query);
      const valMatch = row.values.some((v) => normalizeSpecKey(v).includes(query));
      if (!keyMatch && !valMatch) return false;
    }
    return true;
  });

  if (filteredSpecs.length > 0) {
    addSection(`Especificaciones técnicas (${filteredSpecs.length})`);
    for (const row of filteredSpecs) {
      const numInfo = analyzeSpecNumbers(row.label, row.values);
      addRow(
        row.label,
        row.values.map((v, idx) => {
          if (!v) return `<span class="muted">—</span>`;
          let badge = "";
          if (numInfo && numInfo.parsed[idx]) {
            const val = numInfo.parsed[idx].num;
            if (val === numInfo.best) badge = `<span class="spec-num-best">▲ Mejor</span>`;
            else if (val === numInfo.worst) badge = `<span class="spec-num-low">▼</span>`;
          }
          return `${escapeHtml(v)}${badge}`;
        }),
        row.values,
        true
      );
    }
  } else if (unifiedSpecs.length > 0) {
    addSection("Especificaciones técnicas (0 visibles con los filtros actuales)");
  }

  html += `</tbody></table>`;
  tableWrapper.innerHTML = html;

  // Bind gallery controls & lightbox
  tableWrapper.querySelectorAll(".gallery-nav-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const pidx = parseInt(btn.dataset.pidx, 10);
      const dir = parseInt(btn.dataset.dir, 10);
      const p = products[pidx];
      const imgs = p?.images?.length ? p.images : p?.image ? [p.image] : [];
      if (imgs.length <= 1) return;
      const pKey = p.asin || p.url;
      const cur = activeImageIndex.get(pKey) || 0;
      const next = (cur + dir + imgs.length) % imgs.length;
      activeImageIndex.set(pKey, next);
      renderTable();
    });
  });

  tableWrapper.querySelectorAll(".thumb-strip .thumb-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pidx = parseInt(btn.dataset.pidx, 10);
      const imgIdx = parseInt(btn.dataset.imgidx, 10);
      const p = products[pidx];
      if (!p) return;
      activeImageIndex.set(p.asin || p.url, imgIdx);
      renderTable();
    });
  });

  tableWrapper.querySelectorAll(".product-main-img").forEach((img) => {
    img.addEventListener("click", () => {
      const pidx = parseInt(img.dataset.pidx, 10);
      const p = products[pidx];
      if (!p) return;
      const imgs = p.images?.length ? p.images : p.image ? [p.image] : [];
      if (imgs.length === 0) return;
      const pKey = p.asin || p.url;
      openLightbox(imgs, activeImageIndex.get(pKey) || 0, p.title);
    });
  });

  tableWrapper.querySelectorAll(".review-photo-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pidx = parseInt(btn.dataset.pidx, 10);
      const ridx = parseInt(btn.dataset.ridx, 10);
      const imgIdx = parseInt(btn.dataset.imgidx, 10);
      const rtype = btn.dataset.rtype;
      const p = products[pidx];
      const review =
        rtype === "critical"
          ? p?.criticalReviews?.[ridx]
          : p?._sortedReviews?.[ridx] || p?.reviews?.[ridx];
      if (!review?.images?.length) return;
      const caption = `Reseña (${review.rating ? review.rating + "★" : ""}) — ${review.title || p.title}`;
      openLightbox(review.images, imgIdx, caption);
    });
  });

  tableWrapper.querySelectorAll(".review-video-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pidx = parseInt(btn.dataset.pidx, 10);
      const ridx = parseInt(btn.dataset.ridx, 10);
      const vidIdx = parseInt(btn.dataset.vididx, 10);
      const rtype = btn.dataset.rtype;
      const p = products[pidx];
      const review =
        rtype === "critical"
          ? p?.criticalReviews?.[ridx]
          : p?._sortedReviews?.[ridx] || p?.reviews?.[ridx];
      const vid = review?.videos?.[vidIdx];
      if (!vid?.url) return;
      openVideoLightbox(vid.url, vid.poster, `Vídeo de reseña — ${review.title || p.title}`, p.url);
    });
  });

  // Bind personal notes auto-save
  tableWrapper.querySelectorAll(".note-input").forEach((ta) => {
    ta.addEventListener("input", () => {
      const key = ta.dataset.notekey;
      productNotes[key] = ta.value;
      chrome.storage.local.set({ productNotes });
    });
  });

  // Bind column move buttons & drag-and-drop reorder
  const reorderProducts = (fromIdx, toIdx) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || toIdx >= products.length) return;
    const reordered = [...products];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    originalProducts = reordered;
    sortSelect.value = "original";
    renderTable();
    persistCurrentState();
  };

  tableWrapper.querySelectorAll(".move-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index, 10);
      const dir = parseInt(btn.dataset.dir, 10);
      reorderProducts(idx, idx + dir);
    });
  });

  tableWrapper.querySelectorAll("thead th.product-col").forEach((th) => {
    th.addEventListener("dragstart", (e) => {
      dragFromIndex = parseInt(th.dataset.colidx, 10);
      th.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    th.addEventListener("dragend", () => {
      th.classList.remove("dragging");
      tableWrapper.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
    });
    th.addEventListener("dragover", (e) => {
      e.preventDefault();
      th.classList.add("drag-over");
    });
    th.addEventListener("dragleave", () => {
      th.classList.remove("drag-over");
    });
    th.addEventListener("drop", (e) => {
      e.preventDefault();
      th.classList.remove("drag-over");
      const toIdx = parseInt(th.dataset.colidx, 10);
      if (dragFromIndex !== null && dragFromIndex !== toIdx) {
        reorderProducts(dragFromIndex, toIdx);
      }
      dragFromIndex = null;
    });
  });

  // Bind pin reference column buttons
  tableWrapper.querySelectorAll(".pin-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      pinnedProductKey = pinnedProductKey === key ? null : key;
      renderTable();
      showToast(pinnedProductKey ? "Producto fijado como referencia a la izquierda." : "Referencia desfijada.");
    });
  });

  // Bind favorite & remove buttons
  tableWrapper.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      if (favoriteAsins.has(key)) favoriteAsins.delete(key);
      else favoriteAsins.add(key);
      renderTable();
      persistCurrentState();
    });
  });

  tableWrapper.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index, 10);
      const target = products[idx];
      originalProducts = originalProducts.filter((p) => p !== target);
      renderTable();
      persistCurrentState();
      showToast("Producto quitado de la comparativa.");
    });
  });
}

function buildAiPrompt({
  userContext = "",
  includeBullets = true,
  includeSpecs = true,
  includeReviews = true
} = {}) {
  const lines = [];
  lines.push(
    `Actúa como un experto asesor de compras. Quiero comparar los siguientes ${products.length} productos de Amazon y necesito que me ayudes a elegir la mejor opción.`
  );

  if (userContext.trim()) {
    lines.push("");
    lines.push(`### Mis necesidades y prioridades`);
    lines.push(userContext.trim());
  }

  lines.push("");
  lines.push(`### Qué necesito en tu respuesta`);
  lines.push(`1. Una tabla resumen clara con las diferencias clave.`);
  lines.push(`2. Pros y contras reales de cada producto (teniendo en cuenta también lo que dicen las reseñas de compradores).`);
  lines.push(`3. Cuál ofrece mejor relación calidad-precio y cuál es la mejor opción según mis necesidades.`);
  lines.push(`4. Posibles puntos débiles, quejas repetidas o detalles a revisar antes de comprar.`);
  lines.push("");
  lines.push(`---`);
  lines.push(`## Productos a comparar`);

  products.forEach((p, i) => {
    const pKey = p.asin || p.url;
    lines.push("");
    lines.push(`### Opción ${i + 1}: ${p.title}`);
    if (p.brand) lines.push(`- **Marca:** ${p.brand}`);
    if (p.variant) lines.push(`- **Variante:** ${p.variant}`);
    lines.push(
      `- **Precio:** ${p.priceDisplay || "No disponible"}${p.listPriceDisplay ? ` (antes ${p.listPriceDisplay}${p.discountPct ? `, -${p.discountPct}%` : ""})` : ""}${p.couponText ? ` | ${p.couponText}${p.netPriceDisplay ? ` → Precio neto: ${p.netPriceDisplay}` : ""}` : ""}${p.unitPrice ? ` (${p.unitPrice})` : ""}`
    );
    if (p.ratingNum) {
      lines.push(`- **Valoración:** ${p.ratingNum}/5 (${p.reviewCount ? formatNumber(p.reviewCount) + " reseñas" : "sin recuento"})`);
    }
    if (p.isPrime) lines.push(`- **Prime:** Sí`);
    if (p.availability) lines.push(`- **Disponibilidad:** ${p.availability}`);
    if (p.seller) lines.push(`- **Vendedor / Envío:** ${p.seller}`);
    if (p.returnsPolicy) lines.push(`- **Devoluciones:** ${p.returnsPolicy}`);
    if (p.warranty) lines.push(`- **Garantía:** ${p.warranty}`);
    if (productNotes[pKey]?.trim()) {
      lines.push(`- **Mis notas personales:** ${productNotes[pKey].trim()}`);
    }
    if (p.url) lines.push(`- **Enlace:** ${p.url}`);

    if (includeBullets && p.bullets?.length) {
      lines.push(`- **Puntos clave:**`);
      p.bullets.slice(0, 6).forEach((b) => lines.push(`  - ${b}`));
    }

    if (includeSpecs && p.specs && Object.keys(p.specs).length > 0) {
      lines.push(`- **Especificaciones:**`);
      Object.entries(p.specs)
        .slice(0, 25)
        .forEach(([k, v]) => lines.push(`  - ${k}: ${v}`));
    }

    if (includeReviews) {
      if (p.ratingDistribution) {
        const distStr = [5, 4, 3, 2, 1]
          .map((s) => `${s}★: ${p.ratingDistribution[s] ?? 0}%`)
          .join(" | ");
        lines.push(`- **Distribución de valoraciones:** ${distStr}`);
      }
      if (p.reviewSummary) {
        lines.push(`- **Resumen de opiniones (Amazon):** ${p.reviewSummary}`);
      }
      if (p.reviews?.length) {
        lines.push(`- **Reseñas destacadas (${Math.min(p.reviews.length, 4)}):**`);
        p.reviews.slice(0, 4).forEach((r) => {
          const stars = r.rating ? `[${r.rating}★] ` : "";
          const title = r.title ? `"${r.title}": ` : "";
          const body = r.body.length > 240 ? r.body.slice(0, 240).trim() + "…" : r.body;
          lines.push(`  - ${stars}${title}${body}`);
        });
      }
      if (p.criticalReviews?.length) {
        lines.push(`- **Reseñas críticas (1–3★):**`);
        p.criticalReviews.slice(0, 3).forEach((r) => {
          const stars = r.rating ? `[${r.rating}★] ` : "";
          const title = r.title ? `"${r.title}": ` : "";
          const body = r.body.length > 240 ? r.body.slice(0, 240).trim() + "…" : r.body;
          lines.push(`  - ${stars}${title}${body}`);
        });
      }
    }
  });

  return lines.join("\n");
}

function refreshModalPreview() {
  const prompt = buildAiPrompt({
    userContext: userContextInput.value,
    includeBullets: includeBulletsCheck.checked,
    includeSpecs: includeSpecsCheck.checked,
    includeReviews: includeReviewsCheck.checked
  });
  promptPreview.value = prompt;
  promptCharCount.textContent = `${formatNumber(prompt.length)} caracteres`;
}

async function copyAndOpenAi(provider, customPrompt = null) {
  if (products.length === 0) return;

  const prompt = customPrompt || buildAiPrompt();
  let copied = false;
  try {
    await navigator.clipboard.writeText(prompt);
    copied = true;
  } catch {
    copied = false;
  }

  const encoded = encodeURIComponent(prompt);
  const canPassInUrl = encoded.length <= 3500;

  let targetUrl = "";
  const providerNames = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    gemini: "Gemini",
    perplexity: "Perplexity"
  };
  const providerName = providerNames[provider] || "ChatGPT";

  if (provider === "claude") {
    targetUrl = canPassInUrl ? `https://claude.ai/new?q=${encoded}` : "https://claude.ai/new";
  } else if (provider === "gemini") {
    targetUrl = "https://gemini.google.com/app";
  } else if (provider === "perplexity") {
    targetUrl = canPassInUrl ? `https://www.perplexity.ai/?q=${encoded}` : "https://www.perplexity.ai/";
  } else {
    targetUrl = canPassInUrl ? `https://chatgpt.com/?q=${encoded}` : "https://chatgpt.com/";
  }

  window.open(targetUrl, "_blank", "noopener,noreferrer");

  if (canPassInUrl && provider !== "gemini") {
    showToast(`Abriendo ${providerName} con el prompt precargado (y copiado al portapapeles).`);
  } else if (copied) {
    showToast(`Prompt completo copiado al portapapeles. Pega con Ctrl+V en ${providerName}.`, 6000);
  } else {
    showToast(`Abre el modal "Prompt IA" para copiar el texto y pegarlo en ${providerName}.`, 6000);
  }
}

function exportCsv() {
  if (products.length === 0) return;
  const unifiedSpecs = collectUnifiedSpecs(products);

  const csvCell = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
  const rows = [];

  rows.push(["Atributo", ...products.map((p, i) => `Opción ${i + 1}: ${p.title}`)]);
  rows.push(["URL", ...products.map((p) => p.url)]);
  rows.push(["Marca", ...products.map((p) => p.brand)]);
  rows.push(["Precio", ...products.map((p) => p.priceDisplay)]);
  rows.push(["Valoración", ...products.map((p) => p.ratingNum ?? "")]);
  rows.push(["Reseñas", ...products.map((p) => p.reviewCount ?? "")]);
  rows.push(["Prime", ...products.map((p) => (p.isPrime ? "Sí" : "No"))]);
  rows.push(["Disponibilidad", ...products.map((p) => p.availability)]);

  for (const spec of unifiedSpecs) {
    rows.push([spec.label, ...spec.values]);
  }

  const csvContent = "\uFEFF" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `comparativa-amazon-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Tabla descargada como CSV.");
}

const SUN_SVG = `<svg class="svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const MOON_SVG = `<svg class="svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

// Theme handling
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggleBtn.innerHTML = theme === "dark" ? SUN_SVG : MOON_SVG;
}

themeToggleBtn.addEventListener("click", async () => {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  await chrome.storage.local.set({ theme: next });
});

function buildWhatsappSummary() {
  const winners = computeWinners(products);
  const lines = [`🛒 *Comparativa de Amazon (${products.length} productos)*`, ""];

  products.forEach((p, i) => {
    const pKey = p.asin || p.url;
    const eff = getEffectivePrice(p);
    const tags = [];
    if (winners.minPrice !== null && eff === winners.minPrice) tags.push("🏷️ Mejor precio");
    if (winners.maxRating !== null && p.ratingNum === winners.maxRating) tags.push("⭐ Mejor valorado");
    if (favoriteAsins.has(pKey)) tags.push("💛 Favorito");

    lines.push(`*${i + 1}. ${p.title}*${tags.length ? ` (${tags.join(" · ")})` : ""}`);
    if (p.variant) lines.push(`   • Variante: ${p.variant}`);
    const priceStr = p.priceDisplay || "No disponible";
    const couponStr = p.couponText
      ? ` + ${p.couponText}${p.netPriceDisplay ? ` → *${p.netPriceDisplay}*` : ""}`
      : "";
    lines.push(`   • Precio: *${priceStr}*${couponStr}${p.unitPrice ? ` (${p.unitPrice})` : ""}`);
    if (p.ratingNum) {
      lines.push(
        `   • Valoración: ${p.ratingNum.toFixed(1)}/5 ⭐${p.reviewCount ? ` (${formatNumber(p.reviewCount)} reseñas)` : ""}`
      );
    }
    if (p.isPrime) lines.push(`   • Envío Prime ✓`);
    if (productNotes[pKey]?.trim()) {
      lines.push(`   • Nota: _${productNotes[pKey].trim()}_`);
    }
    if (p.url) lines.push(`   • ${p.url}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}

async function exportStandaloneHtml() {
  if (products.length === 0) return;

  // Read our own compare.css so the exported HTML looks 100% identical
  let cssText = "";
  try {
    const res = await fetch(chrome.runtime.getURL("compare.css"));
    cssText = await res.text();
  } catch {
    cssText = "";
  }

  // Clone the rendered table and replace editable textareas with static note blocks & strip edit-only controls
  const cloneWrap = tableWrapper.cloneNode(true);
  cloneWrap.querySelectorAll(".move-btn, .remove-btn, .fav-btn").forEach((el) => el.remove());
  cloneWrap.querySelectorAll("thead th.product-col").forEach((th) => th.removeAttribute("draggable"));
  cloneWrap.querySelectorAll(".note-input").forEach((ta) => {
    const key = ta.dataset.notekey;
    const val = (productNotes[key] || "").trim();
    const div = document.createElement("div");
    div.className = val ? "summary-quote" : "muted";
    div.textContent = val || "—";
    ta.replaceWith(div);
  });

  const theme = document.documentElement.getAttribute("data-theme") || "light";
  const dateStr = new Date().toLocaleDateString("es-ES", { dateStyle: "long" });
  const exportPayload = JSON.stringify(
    products.map((p) => ({
      title: p.title,
      images: p.images?.length ? p.images : p.image ? [p.image] : [],
      reviews: (p._sortedReviews || p.reviews || []).map((r) => ({
        title: r.title,
        rating: r.rating,
        images: r.images || []
      })),
      criticalReviews: (p.criticalReviews || []).map((r) => ({
        title: r.title,
        rating: r.rating,
        images: r.images || []
      }))
    }))
  ).replace(/</g, "\\u003c");

  const standaloneHtml = `<!DOCTYPE html>
<html lang="es" data-theme="${theme}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Comparativa Amazon (${products.length} productos)</title>
  <style>${cssText}</style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-left">
      <div class="brand-badge">🛒</div>
      <div>
        <h1>Comparativa de Amazon</h1>
        <p class="subtitle">${products.length} productos · Generada el ${escapeHtml(dateStr)}</p>
      </div>
    </div>
    <div class="topbar-actions">
      <label class="toggle-chip">
        <input type="checkbox" id="diffToggle" />
        <span>Solo diferencias</span>
      </label>
      <button type="button" class="btn btn-ghost icon-only" id="themeBtn" title="Cambiar tema">${theme === "dark" ? "☀️" : "🌙"}</button>
    </div>
  </header>
  <main class="main-content">
    <div class="table-wrapper" id="tableWrapper">${cloneWrap.innerHTML}</div>
  </main>
  <div class="lightbox-backdrop hidden" id="lb">
    <div class="lightbox-content">
      <div class="lightbox-header">
        <div class="lightbox-title" id="lbTitle"></div>
        <div class="lightbox-header-right">
          <span class="lightbox-counter" id="lbCounter"></span>
          <button type="button" class="lightbox-close" id="lbClose">&times;</button>
        </div>
      </div>
      <div class="lightbox-stage">
        <button type="button" class="lightbox-nav prev" id="lbPrev">&#8249;</button>
        <img id="lbImg" src="" alt="" />
        <button type="button" class="lightbox-nav next" id="lbNext">&#8250;</button>
      </div>
    </div>
  </div>
  <script>
    const DATA = ${exportPayload};
    const activeIdx = DATA.map(() => 0);
    const lb = document.getElementById("lb");
    const lbImg = document.getElementById("lbImg");
    const lbTitle = document.getElementById("lbTitle");
    const lbCounter = document.getElementById("lbCounter");
    let lbState = { imgs: [], idx: 0, title: "" };

    function renderLb() {
      lbTitle.textContent = lbState.title;
      lbCounter.textContent = (lbState.idx + 1) + " / " + lbState.imgs.length;
      lbImg.src = lbState.imgs[lbState.idx];
    }
    function openLb(imgs, idx, title) {
      if (!imgs || !imgs.length) return;
      lbState = { imgs, idx, title };
      renderLb();
      lb.classList.remove("hidden");
    }
    document.getElementById("lbClose").onclick = () => lb.classList.add("hidden");
    lb.onclick = (e) => { if (e.target === lb) lb.classList.add("hidden"); };
    document.getElementById("lbPrev").onclick = () => { lbState.idx = (lbState.idx - 1 + lbState.imgs.length) % lbState.imgs.length; renderLb(); };
    document.getElementById("lbNext").onclick = () => { lbState.idx = (lbState.idx + 1) % lbState.imgs.length; renderLb(); };
    document.addEventListener("keydown", (e) => {
      if (lb.classList.contains("hidden")) return;
      if (e.key === "Escape") lb.classList.add("hidden");
      if (e.key === "ArrowLeft") document.getElementById("lbPrev").click();
      if (e.key === "ArrowRight") document.getElementById("lbNext").click();
    });

    function updateGallery(pidx, newIdx) {
      const imgs = DATA[pidx]?.images || [];
      if (!imgs.length) return;
      activeIdx[pidx] = (newIdx + imgs.length) % imgs.length;
      const mainImg = document.querySelector('.product-main-img[data-pidx="' + pidx + '"]');
      if (mainImg) mainImg.src = imgs[activeIdx[pidx]];
      const wrap = mainImg?.closest(".product-gallery-cell");
      const counter = wrap?.querySelector(".gallery-counter");
      if (counter) counter.textContent = (activeIdx[pidx] + 1) + " / " + imgs.length;
      wrap?.querySelectorAll(".thumb-strip .thumb-btn").forEach((b, i) => b.classList.toggle("active", i === activeIdx[pidx]));
    }

    document.querySelectorAll(".gallery-nav-btn").forEach((btn) => {
      btn.onclick = () => updateGallery(+btn.dataset.pidx, activeIdx[+btn.dataset.pidx] + (+btn.dataset.dir));
    });
    document.querySelectorAll(".thumb-strip .thumb-btn").forEach((btn) => {
      btn.onclick = () => updateGallery(+btn.dataset.pidx, +btn.dataset.imgidx);
    });
    document.querySelectorAll(".product-main-img").forEach((img) => {
      img.onclick = () => { const p = +img.dataset.pidx; openLb(DATA[p].images, activeIdx[p], DATA[p].title); };
    });
    document.querySelectorAll(".review-photo-btn").forEach((btn) => {
      btn.onclick = () => {
        const p = DATA[+btn.dataset.pidx];
        const r = btn.dataset.rtype === "critical" ? p.criticalReviews[+btn.dataset.ridx] : p.reviews[+btn.dataset.ridx];
        if (r) openLb(r.images, +btn.dataset.imgidx, r.title || p.title);
      };
    });

    document.getElementById("diffToggle").onchange = (e) => {
      document.querySelectorAll("tbody tr:not(.section-row)").forEach((tr) => {
        if (!tr.classList.contains("diff-row") && tr.querySelector("th")?.textContent !== "Fotos") {
          tr.style.display = e.target.checked ? "none" : "";
        }
      });
    };
    document.getElementById("themeBtn").onclick = () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      document.getElementById("themeBtn").textContent = next === "dark" ? "☀️" : "🌙";
    };
  </script>
</body>
</html>`;

  const blob = new Blob([standaloneHtml], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `comparativa-amazon-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
  shareModalBackdrop.classList.add("hidden");
  showToast("Página HTML interactiva descargada. ¡Ya puedes enviársela por WhatsApp o correo!");
}

const SHARE_API_URL = "https://www.compareamazon.es/api/share.php";
const ME_API_URL = "https://www.compareamazon.es/api/me.php";
const accountMenuLink = document.getElementById("accountMenuLink");
const accountMenuLabel = document.getElementById("accountMenuLabel");
const authCtaBackdrop = document.getElementById("authCtaBackdrop");
const closeAuthCtaBtn = document.getElementById("closeAuthCtaBtn");
const authCtaSubtitle = document.getElementById("authCtaSubtitle");
const recheckAuthBtn = document.getElementById("recheckAuthBtn");
let currentWebUser = null;
let pendingAfterAuthAction = null;

function openAuthCtaModal(reasonText, onSuccessCallback = null) {
  pendingAfterAuthAction = onSuccessCallback;
  if (authCtaSubtitle && reasonText) {
    authCtaSubtitle.textContent = reasonText;
  }
  authCtaBackdrop.classList.remove("hidden");
}

function closeAuthCtaModal() {
  authCtaBackdrop.classList.add("hidden");
}

closeAuthCtaBtn?.addEventListener("click", closeAuthCtaModal);
authCtaBackdrop?.addEventListener("click", (e) => {
  if (e.target === authCtaBackdrop) closeAuthCtaModal();
});

async function syncWebAccountStatus() {
  try {
    const res = await fetch(ME_API_URL, { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    currentWebUser = data?.user?.username ? data.user : null;
    if (currentWebUser) {
      accountMenuLink.href = "https://www.compareamazon.es/panel";
      accountMenuLabel.textContent = `@${currentWebUser.username} · Mi panel`;
    } else {
      accountMenuLink.href = "https://www.compareamazon.es/cuenta";
      accountMenuLabel.textContent = "Iniciar sesión en la web";
    }
    return currentWebUser;
  } catch {
    currentWebUser = null;
    return null;
  }
}

recheckAuthBtn?.addEventListener("click", async () => {
  recheckAuthBtn.disabled = true;
  recheckAuthBtn.textContent = "Comprobando sesión...";
  const u = await syncWebAccountStatus();
  recheckAuthBtn.disabled = false;
  recheckAuthBtn.textContent = "↻ Ya inicié sesión, continuar";
  if (u) {
    closeAuthCtaModal();
    showToast(`¡Sesión conectada como @${u.username}!`);
    const cb = pendingAfterAuthAction;
    pendingAfterAuthAction = null;
    if (typeof cb === "function") cb();
  } else {
    showToast("Todavía no se detecta sesión activa en compareamazon.es.");
  }
});

openShareModalBtn.addEventListener("click", async () => {
  if (products.length === 0) {
    showToast("No hay productos para compartir.");
    return;
  }
  shareResultBox.classList.add("hidden");
  shareLinkError.classList.add("hidden");
  shareTitleInput.value = `Comparativa de ${products.length} producto${products.length !== 1 ? "s" : ""} de Amazon`;
  if (lastSharedLink?.id && lastSharedLink?.editToken) {
    updateShareLinkBtn.classList.remove("hidden");
    deleteShareLinkBtn.classList.remove("hidden");
    updateShareLinkBtn.textContent = `🔄 Actualizar enlace (${lastSharedLink.id})`;
  } else {
    updateShareLinkBtn.classList.add("hidden");
    deleteShareLinkBtn.classList.add("hidden");
  }
  shareModalBackdrop.classList.remove("hidden");
  await syncWebAccountStatus();
});
closeShareModalBtn.addEventListener("click", () => shareModalBackdrop.classList.add("hidden"));
shareModalBackdrop.addEventListener("click", (e) => {
  if (e.target === shareModalBackdrop) shareModalBackdrop.classList.add("hidden");
});

async function submitShareLink(isUpdate = false) {
  if (products.length === 0) return;
  shareLinkError.classList.add("hidden");

  const user = await syncWebAccountStatus();
  if (!user) {
    openAuthCtaModal(
      "Crea tu cuenta gratuita o inicia sesión en compareamazon.es para generar y gestionar enlaces compartibles.",
      () => submitShareLink(isUpdate)
    );
    return;
  }

  const activeBtn = isUpdate ? updateShareLinkBtn : createShareLinkBtn;
  const prevLabel = activeBtn.textContent;
  createShareLinkBtn.disabled = true;
  updateShareLinkBtn.disabled = true;
  activeBtn.textContent = isUpdate ? "Actualizando enlace..." : "Creando enlace...";

  try {
    const cleanProducts = products.map((p) => {
      const { _sortedReviews, tabId, ...rest } = p;
      return rest;
    });
    const title = shareTitleInput.value.trim();
    const theme = document.documentElement.getAttribute("data-theme") || "light";

    const payload = {
      title,
      theme,
      isPublic: sharePublicCheck?.checked ? 1 : 0,
      products: cleanProducts,
      notes: productNotes,
      favorites: Array.from(favoriteAsins)
    };
    if (isUpdate && lastSharedLink?.id && lastSharedLink?.editToken) {
      payload.id = lastSharedLink.id;
      payload.editToken = lastSharedLink.editToken;
    }

    const res = await fetch(SHARE_API_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok || !data.url) {
      throw new Error(data?.error || `Error HTTP ${res.status}`);
    }

    if (data.editToken) {
      lastSharedLink = { id: data.id, url: data.url, editToken: data.editToken };
      await chrome.storage.local.set({ lastSharedLink });
      updateShareLinkBtn.classList.remove("hidden");
      updateShareLinkBtn.textContent = `🔄 Actualizar enlace (${data.id})`;
    }

    shareUrlOutput.value = data.url;
    openShareUrlLink.href = data.url;
    const waText = encodeURIComponent(`Mira esta comparativa de Amazon: ${title ? title + " — " : ""}${data.url}`);
    sendWhatsappUrlLink.href = `https://wa.me/?text=${waText}`;
    shareResultBox.classList.remove("hidden");

    try {
      await navigator.clipboard.writeText(data.url);
      showToast(isUpdate ? "¡Enlace actualizado y copiado!" : "¡Enlace creado y copiado al portapapeles!");
    } catch {
      showToast(isUpdate ? "¡Enlace actualizado!" : "¡Enlace creado!");
    }
  } catch (err) {
    shareLinkError.textContent = `No se pudo ${isUpdate ? "actualizar" : "crear"} el enlace: ${err?.message || err}`;
    shareLinkError.classList.remove("hidden");
  } finally {
    createShareLinkBtn.disabled = false;
    updateShareLinkBtn.disabled = false;
    activeBtn.textContent = prevLabel;
  }
}

createShareLinkBtn.addEventListener("click", () => submitShareLink(false));
updateShareLinkBtn.addEventListener("click", () => submitShareLink(true));

deleteShareLinkBtn.addEventListener("click", async () => {
  if (!lastSharedLink?.id || !lastSharedLink?.editToken) return;
  deleteShareLinkBtn.disabled = true;
  try {
    const res = await fetch(SHARE_API_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete",
        id: lastSharedLink.id,
        editToken: lastSharedLink.editToken
      })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) throw new Error(data?.error || "Error");
    lastSharedLink = null;
    await chrome.storage.local.remove("lastSharedLink");
    updateShareLinkBtn.classList.add("hidden");
    deleteShareLinkBtn.classList.add("hidden");
    shareResultBox.classList.add("hidden");
    showToast("Enlace compartido eliminado de compareamazon.es.");
  } catch (err) {
    shareLinkError.textContent = `No se pudo borrar: ${err?.message || err}`;
    shareLinkError.classList.remove("hidden");
  } finally {
    deleteShareLinkBtn.disabled = false;
  }
});

printPdfBtn.addEventListener("click", () => {
  shareModalBackdrop.classList.add("hidden");
  setTimeout(() => window.print(), 120);
});

langToggleBtn.addEventListener("click", async () => {
  const next = currentLang === "es" ? "en" : "es";
  applyLanguage(next);
  renderTable();
  await chrome.storage.local.set({ lang: next });
});

// Compare prices across Amazon EU (ES, DE, FR, IT)
const EU_MARKETS = [
  { domain: "amazon.es", flag: "🇪🇸" },
  { domain: "amazon.de", flag: "🇩🇪" },
  { domain: "amazon.fr", flag: "🇫🇷" },
  { domain: "amazon.it", flag: "🇮🇹" }
];

async function fetchEuPricesForProduct(p) {
  if (!p.asin) return [];
  const results = await Promise.all(
    EU_MARKETS.map(async (m) => {
      const url = `https://www.${m.domain}/dp/${p.asin}`;
      if ((p.domain || "").replace(/^www\./i, "").toLowerCase() === m.domain && p.priceNum) {
        return { ...m, url, priceNum: getEffectivePrice(p), priceDisplay: p.netPriceDisplay || p.priceDisplay };
      }
      try {
        const res = await withTimeout(fetch(url, { credentials: "omit" }), 7000, m.domain);
        if (!res.ok) return null;
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const parsed = globalThis.extractAmazonProduct(doc, url);
        if (parsed && parsed.priceNum > 0) {
          return {
            ...m,
            url,
            priceNum: parsed.netPriceNum || parsed.priceNum,
            priceDisplay: parsed.netPriceDisplay || parsed.priceDisplay
          };
        }
      } catch {
        // skip unavailable country
      }
      return null;
    })
  );
  return results.filter(Boolean);
}

euPricesAllBtn.addEventListener("click", async () => {
  if (originalProducts.length === 0) return;
  euPricesAllBtn.disabled = true;
  const prev = euPricesAllBtn.textContent;
  euPricesAllBtn.textContent = "🇪🇺 Buscando...";
  showToast("Consultando precios en Amazon ES, DE, FR e IT...", 4000);
  try {
    await Promise.all(
      originalProducts.map(async (p) => {
        p.euPrices = await fetchEuPricesForProduct(p);
      })
    );
    renderTable();
    await persistCurrentState();
    showToast("Precios de Amazon Europa actualizados.");
  } finally {
    euPricesAllBtn.disabled = false;
    euPricesAllBtn.textContent = prev;
  }
});

copyShareUrlBtn.addEventListener("click", async () => {
  if (!shareUrlOutput.value) return;
  await navigator.clipboard.writeText(shareUrlOutput.value);
  showToast("Enlace copiado al portapapeles.");
});

exportHtmlBtn.addEventListener("click", exportStandaloneHtml);
copyWhatsappBtn.addEventListener("click", async () => {
  const txt = buildWhatsappSummary();
  await navigator.clipboard.writeText(txt);
  shareModalBackdrop.classList.add("hidden");
  showToast("Resumen copiado al portapapeles. ¡Pégalo en WhatsApp o Telegram!");
});

// Controls events
sortSelect.addEventListener("change", renderTable);
diffOnlyToggle.addEventListener("change", renderTable);
commonOnlyToggle.addEventListener("change", renderTable);
specSearchInput.addEventListener("input", renderTable);
maxBudgetInput.addEventListener("input", renderTable);
toggleScorePanelBtn.addEventListener("click", () => scorePanel.classList.toggle("hidden"));
[weightPrice, weightRating, weightReviews].forEach((slider) => {
  slider.addEventListener("input", () => {
    weightPriceVal.textContent = weightPrice.value;
    weightRatingVal.textContent = weightRating.value;
    weightReviewsVal.textContent = weightReviews.value;
    renderTable();
  });
});
exportCsvBtn.addEventListener("click", () => {
  shareModalBackdrop.classList.add("hidden");
  exportCsv();
});

// Header dropdown menus
const closeAllDropdowns = () => {
  aiDropdown?.classList.add("hidden");
  toolsDropdown?.classList.add("hidden");
};

aiMenuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  const isHidden = aiDropdown.classList.contains("hidden");
  closeAllDropdowns();
  if (isHidden) aiDropdown.classList.remove("hidden");
});

toolsMenuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  const isHidden = toolsDropdown.classList.contains("hidden");
  closeAllDropdowns();
  if (isHidden) toolsDropdown.classList.remove("hidden");
});

toolsDropdown?.addEventListener("click", () => closeAllDropdowns());

document.addEventListener("click", (e) => {
  if (!e.target.closest(".menu-wrap")) closeAllDropdowns();
});

// Quick AI buttons
quickChatGptBtn.addEventListener("click", () => { closeAllDropdowns(); copyAndOpenAi("chatgpt"); });
quickClaudeBtn.addEventListener("click", () => { closeAllDropdowns(); copyAndOpenAi("claude"); });
quickGeminiBtn?.addEventListener("click", () => { closeAllDropdowns(); copyAndOpenAi("gemini"); });
quickPerplexityBtn?.addEventListener("click", () => { closeAllDropdowns(); copyAndOpenAi("perplexity"); });

// Lightbox functions
function renderLightbox() {
  const { images, index, title } = lightboxState;
  if (!images.length) return;
  lightboxTitle.textContent = title;
  lightboxCounter.textContent = `${index + 1} / ${images.length}`;
  lightboxImg.src = images[index];
  lightboxImg.alt = title;
  lightboxPrevBtn.classList.toggle("hidden", images.length <= 1);
  lightboxNextBtn.classList.toggle("hidden", images.length <= 1);

  lightboxThumbs.innerHTML = images
    .map(
      (url, i) => `
      <button type="button" class="thumb-btn${i === index ? " active" : ""}" data-lbidx="${i}">
        <img src="${escapeHtml(url)}" alt="" />
      </button>
    `
    )
    .join("");

  lightboxThumbs.querySelectorAll(".thumb-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      lightboxState.index = parseInt(btn.dataset.lbidx, 10);
      renderLightbox();
    });
  });
}

function clearLightboxVideo() {
  const existing = document.getElementById("lightboxVideoEl");
  if (existing) {
    existing.pause?.();
    existing.remove();
  }
  const fallback = document.getElementById("lightboxVideoFallback");
  if (fallback) fallback.remove();
  lightboxImg.classList.remove("hidden");
}

function openVideoLightbox(videoUrl, posterUrl, title, productUrl) {
  clearLightboxVideo();
  lightboxTitle.textContent = title;
  lightboxCounter.textContent = "Vídeo";
  lightboxPrevBtn.classList.add("hidden");
  lightboxNextBtn.classList.add("hidden");
  lightboxThumbs.innerHTML = "";
  lightboxImg.classList.add("hidden");

  const stage = lightboxImg.parentElement;
  const isM3u8 = /\.m3u8(\?|$)/i.test(videoUrl);
  const testVid = document.createElement("video");
  const canPlay = !isM3u8 || Boolean(testVid.canPlayType("application/vnd.apple.mpegurl"));

  if (canPlay) {
    const vid = document.createElement("video");
    vid.id = "lightboxVideoEl";
    vid.className = "lightbox-video";
    vid.controls = true;
    vid.autoplay = true;
    vid.playsInline = true;
    if (posterUrl) vid.poster = posterUrl;
    vid.src = videoUrl;
    stage.appendChild(vid);
  } else {
    const box = document.createElement("div");
    box.id = "lightboxVideoFallback";
    box.style.cssText = "text-align:center;padding:24px;color:#0f172a;";
    box.innerHTML = `
      ${posterUrl ? `<img src="${escapeHtml(posterUrl)}" style="max-height:280px;border-radius:10px;margin-bottom:14px;" /><br/>` : ""}
      <p style="margin-bottom:12px;font-size:13.5px;">Este vídeo usa formato HLS (.m3u8) de Amazon.</p>
      <a href="${escapeHtml(productUrl || videoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-ai-custom" style="text-decoration:none;">Ver vídeo en Amazon ↗</a>
    `;
    stage.appendChild(box);
  }

  imageLightbox.classList.remove("hidden");
}

function openLightbox(images, startIndex, title) {
  clearLightboxVideo();
  lightboxState = { images, index: startIndex, title };
  renderLightbox();
  imageLightbox.classList.remove("hidden");
}

function closeLightbox() {
  clearLightboxVideo();
  imageLightbox.classList.add("hidden");
}

lightboxCloseBtn.addEventListener("click", closeLightbox);
imageLightbox.addEventListener("click", (e) => {
  if (e.target === imageLightbox) closeLightbox();
});
lightboxPrevBtn.addEventListener("click", () => {
  const n = lightboxState.images.length;
  if (n <= 1) return;
  lightboxState.index = (lightboxState.index - 1 + n) % n;
  renderLightbox();
});
lightboxNextBtn.addEventListener("click", () => {
  const n = lightboxState.images.length;
  if (n <= 1) return;
  lightboxState.index = (lightboxState.index + 1) % n;
  renderLightbox();
});

// Modal events
openAiModalBtn.addEventListener("click", () => {
  closeAllDropdowns();
  refreshModalPreview();
  aiModalBackdrop.classList.remove("hidden");
  userContextInput.focus();
});

const closeModal = () => aiModalBackdrop.classList.add("hidden");
closeAiModalBtn.addEventListener("click", closeModal);
aiModalBackdrop.addEventListener("click", (e) => {
  if (e.target === aiModalBackdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (!imageLightbox.classList.contains("hidden")) {
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") lightboxPrevBtn.click();
    else if (e.key === "ArrowRight") lightboxNextBtn.click();
    return;
  }
  if (e.key === "Escape" && !aiModalBackdrop.classList.contains("hidden")) {
    closeModal();
  }
});

[userContextInput, includeBulletsCheck, includeSpecsCheck, includeReviewsCheck].forEach((el) => {
  el.addEventListener("input", refreshModalPreview);
  el.addEventListener("change", refreshModalPreview);
});

copyPromptBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(promptPreview.value);
  showToast("Prompt copiado al portapapeles.");
});

modalChatGptBtn.addEventListener("click", () => {
  copyAndOpenAi("chatgpt", promptPreview.value);
  closeModal();
});

modalClaudeBtn.addEventListener("click", () => {
  copyAndOpenAi("claude", promptPreview.value);
  closeModal();
});

modalGeminiBtn.addEventListener("click", () => {
  copyAndOpenAi("gemini", promptPreview.value);
  closeModal();
});

modalPerplexityBtn.addEventListener("click", () => {
  copyAndOpenAi("perplexity", promptPreview.value);
  closeModal();
});

// Scraping helpers (run inside compare.html so popup never gets stuck)
function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Tiempo agotado (${Math.round(ms / 1000)}s) en ${label}`));
    }, ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function waitForTabLoad(tabId, timeoutMs = 10000) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      chrome.tabs.onUpdated.removeListener(listener);
      clearTimeout(timer);
      resolve();
    };
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        finish();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
    const timer = setTimeout(finish, timeoutMs);
  });
}

async function fetchAndParseAmazonPage(tabItem) {
  const res = await withTimeout(
    fetch(tabItem.url, { credentials: "include" }),
    10000,
    "fetch"
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  if (!doc.querySelector("#productTitle") && !doc.querySelector("#title")) {
    throw new Error("Pestaña congelada y Amazon pidió verificación en segundo plano. Ábrela un segundo y reintenta.");
  }

  const data = globalThis.extractAmazonProduct(doc, tabItem.url);
  if (!data || data.__error) {
    throw new Error(data?.__error || "Error al analizar el HTML.");
  }
  return data;
}

async function fetchProductReviewsFallback(product) {
  if (!product.asin || !product.url) return { reviews: [], ratingDistribution: null };
  try {
    const origin = new URL(product.url).origin;
    const reviewsUrl = `${origin}/product-reviews/${product.asin}/?ie=UTF8&reviewerType=all_reviews&sortBy=helpful`;
    const res = await withTimeout(
      fetch(reviewsUrl, { credentials: "include" }),
      8000,
      "fetch-reviews"
    );
    if (!res.ok) return { reviews: [], ratingDistribution: null };
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return {
      reviews: globalThis.extractAmazonReviews(doc) || [],
      ratingDistribution: globalThis.extractAmazonRatingDistribution(doc) || null
    };
  } catch {
    return { reviews: [], ratingDistribution: null };
  }
}

async function fetchHistogramPopoverFallback(product) {
  if (!product.asin || !product.url) return null;
  try {
    const origin = new URL(product.url).origin;
    const popUrl = `${origin}/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin=${product.asin}`;
    const res = await withTimeout(
      fetch(popUrl, { credentials: "include" }),
      6000,
      "fetch-histogram"
    );
    if (!res.ok) return null;
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return globalThis.extractAmazonRatingDistribution(doc) || null;
  } catch {
    return null;
  }
}

async function fetchCriticalReviewsFallback(product) {
  if (!product.asin || !product.url) return [];
  try {
    const origin = new URL(product.url).origin;
    const url = `${origin}/product-reviews/${product.asin}/?ie=UTF8&reviewerType=all_reviews&filterByStar=critical&sortBy=helpful`;
    const res = await withTimeout(fetch(url, { credentials: "include" }), 7000, "fetch-critical");
    if (!res.ok) return [];
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const list = globalThis.extractAmazonReviews(doc) || [];
    return list.filter((r) => !r.rating || r.rating <= 3).slice(0, 4);
  } catch {
    return [];
  }
}

async function enrichReviewsIfMissing(product, onStatus) {
  const missingReviews = !product.reviews || product.reviews.length === 0;
  const missingDist = !product.ratingDistribution;
  const existingCritical = (product.reviews || []).filter((r) => r.rating && r.rating <= 3);
  const missingCritical = existingCritical.length < 2 && product.reviewCount !== 0;

  if (!missingReviews && !missingDist && !missingCritical) {
    return { ...product, criticalReviews: existingCritical.slice(0, 4) };
  }
  if (product.reviewCount === 0) {
    return { ...product, criticalReviews: [] };
  }

  onStatus("Leyendo reseñas...", "pending");

  const [extra, popoverDist, fetchedCritical] = await Promise.all([
    missingReviews || missingDist
      ? fetchProductReviewsFallback(product)
      : Promise.resolve({ reviews: [], ratingDistribution: null }),
    missingDist ? fetchHistogramPopoverFallback(product) : Promise.resolve(null),
    missingCritical ? fetchCriticalReviewsFallback(product) : Promise.resolve([])
  ]);

  const finalReviews =
    missingReviews && extra.reviews.length > 0 ? extra.reviews : product.reviews || [];
  const combinedCritical =
    fetchedCritical.length > 0
      ? fetchedCritical
      : finalReviews.filter((r) => r.rating && r.rating <= 3).slice(0, 4);

  return {
    ...product,
    reviews: finalReviews,
    criticalReviews: combinedCritical,
    ratingDistribution: missingDist
      ? extra.ratingDistribution || popoverDist || product.ratingDistribution
      : product.ratingDistribution
  };
}

async function scrapeTab(tabItem, onStatus) {
  let tabError = null;
  let product = null;

  // 1) Fast path: read directly from the live tab DOM if not discarded/frozen
  if (tabItem.id && tabItem.id > 0) {
    try {
      onStatus("Leyendo pestaña...", "pending");
      const freshTab = await withTimeout(chrome.tabs.get(tabItem.id), 3000, "tabs.get");

      if (!freshTab.discarded && !freshTab.frozen && freshTab.status === "complete") {
        const results = await withTimeout(
          chrome.scripting.executeScript({
            target: { tabId: tabItem.id },
            files: ["scraper.js"]
          }),
          3500,
          "executeScript"
        );

        const data = results?.[0]?.result;
        if (data && !data.__error) {
          product = {
            ...data,
            tabId: tabItem.id,
            domain: tabItem.domain,
            scrapedAt: Date.now()
          };
        } else {
          tabError = data?.__error || "Respuesta vacía del extractor.";
        }
      } else {
        tabError = "Pestaña en suspensión/congelada";
      }
    } catch (err) {
      tabError = err?.message || String(err);
    }
  }

  // 2) Fallback: fetch HTML directly with user session cookies (works even for frozen/sleeping tabs!)
  if (!product) {
    try {
      onStatus("Leyendo en segundo plano...", "pending");
      const data = await fetchAndParseAmazonPage(tabItem);
      product = {
        ...data,
        tabId: tabItem.id,
        domain: tabItem.domain,
        scrapedAt: Date.now()
      };
    } catch (fetchErr) {
      const msg = fetchErr?.message || tabError || "No se pudo leer la pestaña";
      onStatus("Error", "err");
      return {
        ok: false,
        tabItem,
        error: msg
      };
    }
  }

  // 3) If product page didn't have reviews rendered yet, fetch /product-reviews/ASIN
  product = await enrichReviewsIfMissing(product, onStatus);
  onStatus("Listo ✓", "ok");
  return { ok: true, product };
}

async function runPendingScrape(pendingTabs) {
  headerSubtitle.textContent = `Extrayendo ${pendingTabs.length} producto${pendingTabs.length > 1 ? "s" : ""} de Amazon...`;
  warningBar.classList.add("hidden");

  tableWrapper.innerHTML = `
    <div class="loading-panel">
      <div class="loading-spinner"></div>
      <h2>Extrayendo datos de Amazon...</h2>
      <p>Leyendo precios, valoraciones y especificaciones de ${pendingTabs.length} pestaña${pendingTabs.length > 1 ? "s" : ""}.</p>
      <ul class="progress-list" id="progressList">
        ${pendingTabs
          .map(
            (t, i) => `
          <li class="progress-item">
            <span class="progress-item-title">${escapeHtml(t.title)}</span>
            <span class="progress-status pending" id="prog-${i}">En cola...</span>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `;

  const results = await Promise.all(
    pendingTabs.map((tabItem, idx) =>
      scrapeTab(tabItem, (text, state) => {
        const el = document.getElementById(`prog-${idx}`);
        if (el) {
          el.textContent = text;
          el.className = `progress-status ${state}`;
        }
      })
    )
  );

  const scrapedProducts = results.filter((r) => r.ok).map((r) => r.product);
  const failed = results
    .filter((r) => !r.ok)
    .map((f) => ({
      title: f.tabItem.title,
      asin: f.tabItem.asin,
      error: f.error
    }));

  await chrome.storage.local.remove("pendingCompare");

  if (scrapedProducts.length > 0) {
    await chrome.storage.local.set({
      compareData: {
        products: scrapedProducts,
        failed,
        createdAt: Date.now()
      }
    });
  }

  return { products: scrapedProducts, failed };
}

// Saved comparisons UI
function updateSavedCountBadge() {
  const n = savedComparisons.length;
  savedCountPill.textContent = String(n);
  savedCountPill.classList.toggle("hidden", n === 0);
}

function renderSavedList() {
  if (savedComparisons.length === 0) {
    savedListBody.innerHTML = `<p class="muted" style="text-align:center; padding: 20px 0;">Todavía no has guardado ninguna comparativa. Usa el botón <strong>💾 Guardar</strong> para conservar esta tabla.</p>`;
    return;
  }

  savedListBody.innerHTML = `
    <div class="saved-list">
      ${savedComparisons
        .map((item) => {
          const dateStr = new Date(item.savedAt).toLocaleString("es-ES", {
            dateStyle: "medium",
            timeStyle: "short"
          });
          return `
            <div class="saved-item">
              <div class="saved-item-info">
                <div class="saved-item-name">${escapeHtml(item.name)}</div>
                <div class="saved-item-meta">${item.products.length} producto${item.products.length !== 1 ? "s" : ""} · ${escapeHtml(dateStr)}</div>
              </div>
              <div class="saved-item-actions">
                <button type="button" class="btn btn-ai-custom btn-sm load-saved-btn" data-id="${escapeHtml(item.id)}">Cargar</button>
                <button type="button" class="btn btn-ghost btn-sm delete-saved-btn" data-id="${escapeHtml(item.id)}" title="Eliminar">🗑️</button>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;

  savedListBody.querySelectorAll(".load-saved-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const found = savedComparisons.find((s) => s.id === btn.dataset.id);
      if (!found) return;
      originalProducts = found.products || [];
      productNotes = { ...productNotes, ...(found.notes || {}) };
      favoriteAsins = new Set(found.favorites || []);
      sortSelect.value = "original";
      savedListBackdrop.classList.add("hidden");
      renderTable();
      await persistCurrentState();
      showToast(`Comparativa "${found.name}" cargada.`);
    });
  });

  savedListBody.querySelectorAll(".delete-saved-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      savedComparisons = savedComparisons.filter((s) => s.id !== btn.dataset.id);
      await chrome.storage.local.set({ savedComparisons });
      updateSavedCountBadge();
      renderSavedList();
      showToast("Comparativa eliminada del historial.");
    });
  });
}

saveCompareBtn.addEventListener("click", async () => {
  if (originalProducts.length === 0) {
    showToast("No hay productos en la comparativa para guardar.");
    return;
  }
  const openSaveDialog = () => {
    const today = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
    saveNameInput.value = `Comparativa (${originalProducts.length} productos) - ${today}`;
    saveModalBackdrop.classList.remove("hidden");
    saveNameInput.focus();
    saveNameInput.select();
  };
  const u = await syncWebAccountStatus();
  if (!u) {
    openAuthCtaModal(
      "Crea tu cuenta gratuita o inicia sesión para guardar tus comparativas y tenerlas siempre disponibles.",
      openSaveDialog
    );
    return;
  }
  openSaveDialog();
});

const closeSaveModal = () => saveModalBackdrop.classList.add("hidden");
closeSaveModalBtn.addEventListener("click", closeSaveModal);
cancelSaveModalBtn.addEventListener("click", closeSaveModal);
saveModalBackdrop.addEventListener("click", (e) => {
  if (e.target === saveModalBackdrop) closeSaveModal();
});

confirmSaveBtn.addEventListener("click", async () => {
  const name = saveNameInput.value.trim() || "Comparativa sin nombre";
  const entry = {
    id: `cmp_${Date.now()}`,
    name,
    savedAt: Date.now(),
    products: originalProducts.map((p) => {
      const { _sortedReviews, ...clean } = p;
      return clean;
    }),
    notes: { ...productNotes },
    favorites: Array.from(favoriteAsins)
  };
  savedComparisons = [entry, ...savedComparisons].slice(0, 30);
  await chrome.storage.local.set({ savedComparisons });
  updateSavedCountBadge();
  closeSaveModal();
  showToast(`Comparativa "${name}" guardada.`);
});

openSavedBtn.addEventListener("click", () => {
  renderSavedList();
  savedListBackdrop.classList.remove("hidden");
});
closeSavedListBtn.addEventListener("click", () => savedListBackdrop.classList.add("hidden"));
savedListBackdrop.addEventListener("click", (e) => {
  if (e.target === savedListBackdrop) savedListBackdrop.classList.add("hidden");
});

// Add product by URL / ASIN
const closeAddModal = () => {
  addProductBackdrop.classList.add("hidden");
  addProductError.classList.add("hidden");
};
openAddProductBtn.addEventListener("click", () => {
  addProductInput.value = "";
  addProductError.classList.add("hidden");
  addProductBackdrop.classList.remove("hidden");
  addProductInput.focus();
});
closeAddProductBtn.addEventListener("click", closeAddModal);
cancelAddProductBtn.addEventListener("click", closeAddModal);
addProductBackdrop.addEventListener("click", (e) => {
  if (e.target === addProductBackdrop) closeAddModal();
});

confirmAddProductBtn.addEventListener("click", async () => {
  const raw = addProductInput.value.trim();
  addProductError.classList.add("hidden");
  if (!raw) return;

  let targetUrl = "";
  let domain = addProductDomain.value.replace(/^www\./, "");
  let asin = "";

  if (/^[A-Z0-9]{10}$/i.test(raw)) {
    asin = raw.toUpperCase();
    targetUrl = `https://${addProductDomain.value}/dp/${asin}`;
  } else {
    try {
      const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      const m = u.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i);
      if (!m) throw new Error("No se encontró un ASIN válido (/dp/...) en la URL.");
      asin = m[1].toUpperCase();
      domain = u.hostname.replace(/^www\./i, "");
      targetUrl = `${u.origin}/dp/${asin}`;
    } catch (err) {
      addProductError.textContent = err.message || "URL o ASIN no válido.";
      addProductError.classList.remove("hidden");
      return;
    }
  }

  confirmAddProductBtn.disabled = true;
  confirmAddProductBtn.textContent = "Extrayendo...";

  try {
    const tabItem = { url: targetUrl, domain, asin, title: asin };
    let data = await fetchAndParseAmazonPage(tabItem);
    data = { ...data, domain, scrapedAt: Date.now() };
    data = await enrichReviewsIfMissing(data, () => {});
    originalProducts.push(data);
    renderTable();
    await persistCurrentState();
    closeAddModal();
    showToast(`Producto "${data.title.slice(0, 45)}..." añadido.`);
  } catch (err) {
    addProductError.textContent = `No se pudo leer el producto: ${err?.message || err}`;
    addProductError.classList.remove("hidden");
  } finally {
    confirmAddProductBtn.disabled = false;
    confirmAddProductBtn.textContent = "Añadir producto";
  }
});

// Refresh all current products
refreshAllBtn.addEventListener("click", async () => {
  if (originalProducts.length === 0) return;
  const tabsToRefresh = originalProducts.map((p) => ({
    id: p.tabId || -1,
    url: p.url,
    domain: p.domain || "amazon.es",
    asin: p.asin,
    title: p.title
  }));

  refreshAllBtn.disabled = true;
  try {
    const refreshed = await runPendingScrape(tabsToRefresh);
    if (refreshed.products.length > 0) {
      originalProducts = refreshed.products;
      renderTable();
      showToast(`Datos actualizados (${refreshed.products.length} productos).`);
    }
  } finally {
    refreshAllBtn.disabled = false;
  }
});

// Init
(async function init() {
  const stored = await chrome.storage.local.get([
    "compareData",
    "pendingCompare",
    "theme",
    "lang",
    "productNotes",
    "favoriteAsins",
    "savedComparisons",
    "lastSharedLink"
  ]);
  applyTheme(stored.theme || "light");
  applyLanguage(stored.lang || currentLang);
  syncWebAccountStatus();
  productNotes = stored.productNotes || {};
  favoriteAsins = new Set(stored.favoriteAsins || []);
  savedComparisons = Array.isArray(stored.savedComparisons) ? stored.savedComparisons : [];
  lastSharedLink = stored.lastSharedLink || null;
  updateSavedCountBadge();

  let data = stored.compareData;

  if (stored.pendingCompare?.tabs?.length > 0) {
    data = await runPendingScrape(stored.pendingCompare.tabs);
  }

  if (!data || !Array.isArray(data.products) || data.products.length === 0) {
    if (data?.failed?.length > 0) {
      warningBar.textContent = `No se pudo leer ninguna pestaña: ${data.failed
        .map((f) => `${f.asin || f.title} (${f.error})`)
        .join(" | ")}`;
      warningBar.classList.remove("hidden");
    }
    renderTable();
    return;
  }

  originalProducts = data.products;

  if (data.failed && data.failed.length > 0) {
    warningBar.textContent = `Aviso: No se pudieron leer ${data.failed.length} pestaña(s): ${data.failed
      .map((f) => `${f.asin || f.title} (${f.error})`)
      .join(" | ")}`;
    warningBar.classList.remove("hidden");
  }

  renderTable();
})();
