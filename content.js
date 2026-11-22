(() => {
  const DOMAIN = location.hostname.replace(/^www\./i, "");
  let trayItems = [];

  const getCurrentAsin = () => {
    const m = location.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i);
    if (m) return m[1].toUpperCase();
    const input = document.querySelector("#ASIN, input[name='ASIN']");
    return input?.value ? input.value.trim().toUpperCase() : "";
  };

  async function loadTray() {
    try {
      const stored = await chrome.storage.local.get("trayItems");
      trayItems = Array.isArray(stored.trayItems) ? stored.trayItems : [];
    } catch {
      trayItems = [];
    }
    syncAllButtons();
    renderFloatingTray();
  }

  async function saveTray() {
    try {
      await chrome.storage.local.set({ trayItems });
    } catch {
      // ignore if extension context invalidated
    }
    syncAllButtons();
    renderFloatingTray();
  }

  function isInTray(asin) {
    return trayItems.some((item) => item.asin === asin);
  }

  async function toggleItem(item) {
    if (!item.asin) return;
    if (isInTray(item.asin)) {
      trayItems = trayItems.filter((x) => x.asin !== item.asin);
    } else {
      trayItems = [...trayItems, item].slice(-12);
    }
    await saveTray();
  }

  function syncAllButtons() {
    document.querySelectorAll(".ca-add-btn[data-ca-asin]").forEach((btn) => {
      const asin = btn.dataset.caAsin;
      const active = isInTray(asin);
      btn.classList.toggle("in-tray", active);
      btn.textContent = active
        ? "✓ En bandeja"
        : btn.classList.contains("ca-dp-btn")
          ? "+ Añadir variante a bandeja"
          : "+ Comparar";
    });
  }

  function renderFloatingTray() {
    let bar = document.getElementById("ca-floating-tray");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "ca-floating-tray";
      bar.className = "ca-hidden";
      document.body.appendChild(bar);
    }

    if (trayItems.length === 0) {
      bar.classList.add("ca-hidden");
      return;
    }

    bar.classList.remove("ca-hidden");
    const thumbs = trayItems
      .slice(0, 4)
      .filter((i) => i.image)
      .map((i) => `<img class="ca-tray-thumb" src="${i.image}" alt="" />`)
      .join("");

    bar.innerHTML = `
      <div class="ca-tray-thumbs">${thumbs}</div>
      <span class="ca-tray-count">Bandeja (${trayItems.length})</span>
      <button type="button" class="ca-tray-go" id="caTrayGoBtn">Comparar</button>
      <button type="button" class="ca-tray-clear" id="caTrayClearBtn" title="Vaciar bandeja">✕</button>
    `;

    bar.querySelector("#caTrayGoBtn").addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "openCompareFromTray" });
    });

    bar.querySelector("#caTrayClearBtn").addEventListener("click", async () => {
      trayItems = [];
      await saveTray();
    });
  }

  function injectSearchButtons() {
    const cards = document.querySelectorAll('div[data-component-type="s-search-result"][data-asin]');
    cards.forEach((card) => {
      const asin = (card.getAttribute("data-asin") || "").trim().toUpperCase();
      if (!asin || asin.length !== 10) return;
      if (card.querySelector(".ca-add-btn")) return;

      const titleEl = card.querySelector("h2 a span, h2 span");
      const imgEl = card.querySelector("img.s-image");
      const targetSlot =
        card.querySelector(".puis-price-instructions-style") ||
        card.querySelector(".a-row.a-size-base.a-color-base") ||
        card.querySelector("h2")?.parentElement;

      if (!targetSlot) return;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ca-add-btn";
      btn.dataset.caAsin = asin;
      btn.textContent = isInTray(asin) ? "✓ En bandeja" : "+ Comparar";
      if (isInTray(asin)) btn.classList.add("in-tray");

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem({
          asin,
          url: `${location.origin}/dp/${asin}`,
          domain: DOMAIN,
          title: (titleEl?.textContent || asin).trim().slice(0, 140),
          image: imgEl?.src || ""
        });
      });

      targetSlot.appendChild(btn);
    });
  }

  function injectProductVariantButton() {
    const asin = getCurrentAsin();
    if (!asin) return;

    const existing = document.querySelector(".ca-dp-btn");
    if (existing) {
      // Update ASIN if user switched variant dynamically on the same page
      if (existing.dataset.caAsin !== asin) {
        existing.dataset.caAsin = asin;
        syncAllButtons();
      }
      return;
    }

    const anchor =
      document.querySelector("#titleSection") ||
      document.querySelector("#productTitle")?.parentElement;
    if (!anchor) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ca-add-btn ca-dp-btn";
    btn.dataset.caAsin = asin;
    btn.textContent = isInTray(asin) ? "✓ En bandeja" : "+ Añadir variante a bandeja";
    if (isInTray(asin)) btn.classList.add("in-tray");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const curAsin = getCurrentAsin() || asin;
      btn.dataset.caAsin = curAsin;
      const title = (document.querySelector("#productTitle")?.textContent || curAsin).trim();
      const img =
        document.querySelector("#landingImage")?.src ||
        document.querySelector("#imgBlkFront")?.src ||
        "";
      toggleItem({
        asin: curAsin,
        url: `${location.origin}/dp/${curAsin}`,
        domain: DOMAIN,
        title: title.slice(0, 140),
        image: img
      });
    });

    anchor.appendChild(btn);
  }

  function scanPage() {
    injectSearchButtons();
    injectProductVariantButton();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.trayItems) {
      trayItems = Array.isArray(changes.trayItems.newValue) ? changes.trayItems.newValue : [];
      syncAllButtons();
      renderFloatingTray();
    }
  });

  loadTray().then(() => {
    scanPage();
    let timer = null;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(scanPage, 400);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
