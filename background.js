chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.action === "openCompareFromTray") {
    (async () => {
      const stored = await chrome.storage.local.get("trayItems");
      const items = Array.isArray(stored.trayItems) ? stored.trayItems : [];
      if (items.length === 0) {
        sendResponse({ ok: false });
        return;
      }

      const pendingTabs = items.map((item) => ({
        id: -1,
        url: item.url,
        domain: item.domain,
        asin: item.asin,
        title: item.title || item.asin
      }));

      await chrome.storage.local.set({
        pendingCompare: {
          tabs: pendingTabs,
          requestedAt: Date.now()
        }
      });

      const compareUrl = chrome.runtime.getURL("compare.html");
      const existing = await chrome.tabs.query({ url: compareUrl });
      if (existing.length > 0) {
        await chrome.tabs.update(existing[0].id, { active: true });
        await chrome.tabs.reload(existing[0].id);
        await chrome.windows.update(existing[0].windowId, { focused: true });
      } else {
        await chrome.tabs.create({ url: compareUrl });
      }
      sendResponse({ ok: true });
    })();
    return true;
  }
});
