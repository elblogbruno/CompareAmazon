const AMAZON_HOST_RE = /(^|\.)amazon\.(es|com|co\.uk|de|fr|it|com\.mx|ca|nl|pl|se|com\.be|com\.br|co\.jp|com\.au|in)$/i;
const PRODUCT_PATH_RE = /\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i;

const tabListEl = document.getElementById("tabList");
const countLabelEl = document.getElementById("countLabel");
const compareBtn = document.getElementById("compareBtn");
const compareBtnText = document.getElementById("compareBtnText");
const selectAllBtn = document.getElementById("selectAllBtn");
const selectNoneBtn = document.getElementById("selectNoneBtn");
const allWindowsToggle = document.getElementById("allWindowsToggle");
const statusBanner = document.getElementById("statusBanner");
const openLastBtn = document.getElementById("openLastBtn");
const openTrayBtn = document.getElementById("openTrayBtn");
const popupPanelLink = document.getElementById("popupPanelLink");
const popupPanelLabel = document.getElementById("popupPanelLabel");

let detectedTabs = [];
let selectedTabIds = new Set();

function parseAmazonTab(tab) {
  if (!tab.url) return null;
  let urlObj;
  try {
    urlObj = new URL(tab.url);
  } catch {
    return null;
  }

  if (!AMAZON_HOST_RE.test(urlObj.hostname)) return null;

  const match = urlObj.pathname.match(PRODUCT_PATH_RE);
  if (!match) return null;

  const asin = match[1].toUpperCase();
  const domain = urlObj.hostname.replace(/^www\./i, "");
  const cleanTitle = (tab.title || "Producto de Amazon")
    .replace(/^Amazon\.[a-z.]+\s*:\s*/i, "")
    .replace(/\s*:\s*Amazon\.[a-z.]+.*$/i, "")
    .trim();

  return {
    id: tab.id,
    windowId: tab.windowId,
    url: tab.url,
    domain,
    asin,
    title: cleanTitle || `Producto ${asin}`,
    discarded: Boolean(tab.discarded)
  };
}

function showStatus(message, type = "warn") {
  statusBanner.textContent = message;
  statusBanner.className = `status-banner ${type}`;
}

function clearStatus() {
  statusBanner.textContent = "";
  statusBanner.className = "status-banner hidden";
}

function updateControls() {
  const count = selectedTabIds.size;
  const total = detectedTabs.length;
  countLabelEl.textContent =
    total === 1 ? "1 producto detectado" : `${total} productos detectados`;

  compareBtn.disabled = count === 0;
  compareBtnText.textContent =
    count === 0
      ? "Selecciona al menos 1 producto"
      : count === 1
        ? "Analizar 1 producto"
        : `Comparar ${count} productos`;
}

function renderTabs() {
  tabListEl.innerHTML = "";

  if (detectedTabs.length === 0) {
    tabListEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h2>No hay fichas de producto abiertas</h2>
        <p>Abre dos o más páginas de productos en Amazon (con <code>/dp/...</code>) y vuelve a abrir esta extensión para compararlos.</p>
      </div>
    `;
    updateControls();
    return;
  }

  for (const item of detectedTabs) {
    const isSelected = selectedTabIds.has(item.id);
    const label = document.createElement("label");
    label.className = `tab-item${isSelected ? " selected" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isSelected;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedTabIds.add(item.id);
        label.classList.add("selected");
      } else {
        selectedTabIds.delete(item.id);
        label.classList.remove("selected");
      }
      updateControls();
    });

    const info = document.createElement("div");
    info.className = "tab-info";

    const title = document.createElement("div");
    title.className = "tab-title";
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "tab-meta";

    const domainBadge = document.createElement("span");
    domainBadge.className = "badge badge-domain";
    domainBadge.textContent = item.domain;
    meta.appendChild(domainBadge);

    const asinBadge = document.createElement("span");
    asinBadge.className = "badge badge-asin";
    asinBadge.textContent = item.asin;
    meta.appendChild(asinBadge);

    if (item.discarded) {
      const discBadge = document.createElement("span");
      discBadge.className = "badge badge-discarded";
      discBadge.title = "Esta pestaña está suspendida por el navegador; se recargará o podría requerir abrirla.";
      discBadge.textContent = "En suspensión";
      meta.appendChild(discBadge);
    }

    info.appendChild(title);
    info.appendChild(meta);

    label.appendChild(checkbox);
    label.appendChild(info);
    tabListEl.appendChild(label);
  }

  updateControls();
}

async function loadTabs() {
  clearStatus();
  const query = allWindowsToggle.checked ? {} : { currentWindow: true };
  const tabs = await chrome.tabs.query(query);

  detectedTabs = tabs.map(parseAmazonTab).filter(Boolean);
  selectedTabIds = new Set(detectedTabs.map((t) => t.id));
  renderTabs();
}

async function openComparePage() {
  const compareUrl = chrome.runtime.getURL("compare.html");
  const existing = await chrome.tabs.query({ url: compareUrl });
  if (existing.length > 0) {
    await chrome.tabs.update(existing[0].id, { active: true });
    await chrome.tabs.reload(existing[0].id);
    await chrome.windows.update(existing[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: compareUrl });
  }
  window.close();
}

compareBtn.addEventListener("click", async () => {
  const chosen = detectedTabs.filter((t) => selectedTabIds.has(t.id));
  if (chosen.length === 0) return;

  clearStatus();
  compareBtn.disabled = true;
  compareBtnText.textContent = "Abriendo comparador...";

  try {
    await chrome.storage.local.set({
      pendingCompare: {
        tabs: chosen,
        requestedAt: Date.now()
      }
    });
    await openComparePage();
  } catch (err) {
    showStatus(`Error al iniciar la comparativa: ${err?.message || err}`, "error");
    compareBtn.disabled = false;
    updateControls();
  }
});

selectAllBtn.addEventListener("click", () => {
  selectedTabIds = new Set(detectedTabs.map((t) => t.id));
  renderTabs();
});

selectNoneBtn.addEventListener("click", () => {
  selectedTabIds.clear();
  renderTabs();
});

allWindowsToggle.addEventListener("change", () => {
  loadTabs();
});

openLastBtn.addEventListener("click", () => {
  openComparePage();
});

openTrayBtn.addEventListener("click", async () => {
  const stored = await chrome.storage.local.get("trayItems");
  const items = Array.isArray(stored.trayItems) ? stored.trayItems : [];
  if (items.length === 0) return;
  await chrome.storage.local.set({
    pendingCompare: {
      tabs: items.map((i) => ({
        id: -1,
        url: i.url,
        domain: i.domain,
        asin: i.asin,
        title: i.title || i.asin
      })),
      requestedAt: Date.now()
    }
  });
  await openComparePage();
});

async function syncPopupAccount() {
  try {
    const res = await fetch("https://www.compareamazon.es/api/me.php", { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    if (data?.user?.username) {
      popupPanelLink.href = "https://www.compareamazon.es/panel";
      popupPanelLabel.textContent = `Mis links (@${data.user.username})`;
    } else {
      popupPanelLink.href = "https://www.compareamazon.es/cuenta";
      popupPanelLabel.textContent = "Mis links / Cuenta";
    }
  } catch {
    // keep default label
  }
}

(async function init() {
  const stored = await chrome.storage.local.get(["compareData", "trayItems"]);
  if (stored?.compareData?.products?.length > 0) {
    openLastBtn.classList.remove("hidden");
  }
  if (Array.isArray(stored?.trayItems) && stored.trayItems.length > 0) {
    openTrayBtn.textContent = `Bandeja (${stored.trayItems.length})`;
    openTrayBtn.classList.remove("hidden");
  }
  syncPopupAccount();
  await loadTabs();
})();
