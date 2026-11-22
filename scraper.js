(() => {
  const cleanTextGlobal = (str) => {
    if (!str) return "";
    return str
      .replace(/[\u200E\u200F\u202A-\u202E\u00A0]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const textOfGlobal = (selectors, root) => {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) {
        const txt = cleanTextGlobal(el.textContent);
        if (txt) return txt;
      }
    }
    return "";
  };

  function extractAmazonRatingDistribution(doc) {
    const starWordMap = {
      five: 5,
      four: 4,
      three: 3,
      two: 2,
      one: 1
    };

    const parseRows = (rows) => {
      const dist = {};
      rows.forEach((row) => {
        const text = cleanTextGlobal(row.textContent);
        const link = row.querySelector("a") || (row.tagName === "A" ? row : null);
        const aria = cleanTextGlobal(
          link?.getAttribute("aria-label") ||
            row.getAttribute("aria-label") ||
            row.querySelector("[aria-label]")?.getAttribute("aria-label") ||
            ""
        );
        const href = link?.getAttribute("href") || "";

        // 1. Identify star (1..5)
        let star = null;
        const hrefMatch = href.match(/filterByStar=(five|four|three|two|one)_star/i);
        if (hrefMatch) {
          star = starWordMap[hrefMatch[1].toLowerCase()];
        }
        if (!star) {
          const starMatch =
            text.match(/([1-5])\s*(?:estrellas?|stars?|sterne|étoiles?|stelle|★)/i) ||
            aria.match(/([1-5])\s*(?:estrellas?|stars?|sterne|étoiles?|stelle)/i);
          if (starMatch) star = parseInt(starMatch[1], 10);
        }
        if (!star || star < 1 || star > 5) return;

        // 2. Identify percentage (0..100)
        let pct = null;
        const meter = row.querySelector(".a-meter[aria-valuenow], [role='progressbar'][aria-valuenow]");
        if (meter) {
          const v = parseInt(meter.getAttribute("aria-valuenow"), 10);
          if (Number.isFinite(v) && v >= 0 && v <= 100) pct = v;
        }
        if (pct === null) {
          const bar = row.querySelector(".a-meter-bar");
          const styleAttr = bar?.getAttribute("style") || "";
          const wMatch = styleAttr.match(/width\s*:\s*(\d{1,3})\s*%/i);
          if (wMatch) pct = parseInt(wMatch[1], 10);
        }
        if (pct === null) {
          const pctMatch =
            text.match(/(\d{1,3})\s*%/) ||
            aria.match(/(\d{1,3})\s*(?:%|por ciento|percent|prozent|pour cent|per cento)/i);
          if (pctMatch) pct = parseInt(pctMatch[1], 10);
        }

        if (pct !== null && pct >= 0 && pct <= 100 && !(star in dist)) {
          dist[star] = pct;
        }
      });

      const keys = Object.keys(dist);
      const sum = Object.values(dist).reduce((a, b) => a + b, 0);
      if (keys.length >= 3 && sum > 0) {
        return dist;
      }
      return null;
    };

    const parseByMeterOrder = (container) => {
      const meters = container.querySelectorAll(".a-meter, [role='progressbar']");
      if (meters.length !== 5) return null;
      const dist = {};
      const stars = [5, 4, 3, 2, 1];
      let sum = 0;
      meters.forEach((m, i) => {
        let pct = parseInt(m.getAttribute("aria-valuenow"), 10);
        if (!Number.isFinite(pct)) {
          const bar = m.querySelector(".a-meter-bar") || m;
          const wm = (bar.getAttribute("style") || "").match(/width\s*:\s*(\d{1,3})\s*%/i);
          if (wm) pct = parseInt(wm[1], 10);
        }
        if (Number.isFinite(pct) && pct >= 0 && pct <= 100) {
          dist[stars[i]] = pct;
          sum += pct;
        }
      });
      return Object.keys(dist).length === 5 && sum > 0 ? dist : null;
    };

    // Try specific histogram containers first (avoids empty hidden popover templates)
    const containers = doc.querySelectorAll(
      "#cm_cr_dp_d_rating_histogram, #histogramTable, [data-hook='cr-rating-histogram'], #reviewsMedley"
    );
    for (const container of containers) {
      const rows = container.querySelectorAll("li, tr, .a-histogram-row, [data-hook='histogram-row']");
      const parsed = parseRows(rows) || parseByMeterOrder(container);
      if (parsed) return parsed;
    }

    // Fallback across whole document
    const fallbackRows = doc.querySelectorAll(".a-histogram-row, #histogramTable li, #histogramTable tr");
    return parseRows(fallbackRows) || parseByMeterOrder(doc);
  }

  function extractAmazonReviews(doc) {
    const nodes = doc.querySelectorAll(
      '[data-hook="review"], [id^="customer_review-"], [id^="customer_review_foreign-"], .a-section.review'
    );
    const reviews = [];
    const seen = new Set();

    for (const node of nodes) {
      const starRaw = textOfGlobal(
        [
          '[data-hook="review-star-rating"] .a-icon-alt',
          '[data-hook="cmps-review-star-rating"] .a-icon-alt',
          '.review-rating .a-icon-alt',
          'i.a-icon-star .a-icon-alt'
        ],
        node
      );
      let rating = null;
      if (starRaw) {
        const m = starRaw.match(/(\d+[.,]\d+|\d+)/);
        if (m) {
          const parsed = parseFloat(m[1].replace(",", "."));
          if (Number.isFinite(parsed) && parsed <= 5) rating = parsed;
        }
      }

      let title = "";
      const titleEl = node.querySelector(
        '[data-hook="review-title"], .review-title, .review-title-content'
      );
      if (titleEl) {
        const spans = Array.from(titleEl.querySelectorAll("span")).filter(
          (s) =>
            !s.classList.contains("a-icon-alt") &&
            !s.classList.contains("a-letter-space") &&
            !s.querySelector(".a-icon-alt")
        );
        if (spans.length > 0) {
          title = cleanTextGlobal(spans[spans.length - 1].textContent);
        }
        if (!title) {
          title = cleanTextGlobal(titleEl.textContent)
            .replace(/^\d+[.,]\d+\s+(?:de|out of|von|sur|su)\s+5\s+(?:estrellas|stars|sternen|étoiles|stelle)\s*/i, "")
            .trim();
        }
      }

      const body = textOfGlobal(
        [
          '[data-hook="review-collapsed"] span',
          '[data-hook="review-collapsed"]',
          '[data-hook="review-body"] span',
          '[data-hook="review-body"]',
          ".review-text-content span",
          ".review-text-content",
          ".review-text"
        ],
        node
      );

      if (!body && !title) continue;

      const dedupeKey = `${title}|${body.slice(0, 60)}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const date = textOfGlobal(['[data-hook="review-date"]', ".review-date"], node);
      const helpful = textOfGlobal(
        ['[data-hook="helpful-vote-statement"]', ".cr-vote-text"],
        node
      );
      const verified = Boolean(
        node.querySelector('[data-hook="avp-badge"], [data-hook="avp-badge-linkless"]')
      );

      // Customer review photos
      const reviewImages = [];
      const seenReviewImg = new Set();
      node
        .querySelectorAll(
          'img[data-hook="review-image-tile"], .review-image-tile-section img, img.review-image-tile, .cr-lightbox-image-thumbnails img'
        )
        .forEach((img) => {
          let src = img.getAttribute("data-src") || img.getAttribute("src") || "";
          if (!src || src.startsWith("data:") || !/^https?:\/\//i.test(src)) return;
          // Upgrade small thumbnail (e.g. ._SY88.jpg or ._AC_US88_.jpg) to high-res
          src = src
            .replace(/\._[^./]+_\.(jpg|jpeg|png|webp)$/i, "._SL1200_.$1")
            .replace(/\._[A-Z]{2}\d+\.(jpg|jpeg|png|webp)$/i, "._SL1200_.$1");
          const idMatch = src.match(/\/images\/I\/([^./?]+)/i);
          const key = idMatch ? idMatch[1] : src;
          if (!seenReviewImg.has(key)) {
            seenReviewImg.add(key);
            reviewImages.push(src);
          }
        });

      // Customer review videos
      const reviewVideos = [];
      const seenReviewVid = new Set();
      const addVideo = (url, poster = "") => {
        if (!url || !/^https?:\/\//i.test(url)) return;
        if (seenReviewVid.has(url)) return;
        seenReviewVid.add(url);
        reviewVideos.push({ url, poster: /^https?:\/\//i.test(poster) ? poster : "" });
      };

      // Pattern 1: hidden inputs inside review video block
      const vidUrlInputs = node.querySelectorAll("input.video-url, input[name='videoUrl']");
      const vidPosterInputs = node.querySelectorAll("input.video-slate-img-url, input[name='videoSlateImgUrl']");
      vidUrlInputs.forEach((inp, idx) => {
        addVideo(inp.value || inp.getAttribute("value") || "", vidPosterInputs[idx]?.value || vidPosterInputs[idx]?.getAttribute("value") || "");
      });

      // Pattern 2: data-video-url attributes (desktop video widgets)
      node.querySelectorAll("[data-video-url]").forEach((el) => {
        const vUrl = el.getAttribute("data-video-url") || "";
        const poster =
          el.getAttribute("data-thumbnail-url") ||
          el.getAttribute("data-slate-url") ||
          el.querySelector("img")?.getAttribute("src") ||
          "";
        addVideo(vUrl, poster);
      });

      // Pattern 3: rendered <video> elements
      node.querySelectorAll("video").forEach((vid) => {
        const vUrl = vid.getAttribute("src") || vid.querySelector("source")?.getAttribute("src") || "";
        addVideo(vUrl, vid.getAttribute("poster") || "");
      });

      reviews.push({
        rating,
        title: title.slice(0, 140),
        body: body.slice(0, 600),
        date: date.slice(0, 80),
        helpful: helpful.slice(0, 60),
        verified,
        images: reviewImages.slice(0, 6),
        videos: reviewVideos.slice(0, 3)
      });

      if (reviews.length >= 20) break;
    }

    // Prioritize reviews with videos or photos first (preserving relative order)
    reviews.sort((a, b) => {
      const aMedia = (a.videos?.length ? 2 : 0) + (a.images?.length ? 1 : 0);
      const bMedia = (b.videos?.length ? 2 : 0) + (b.images?.length ? 1 : 0);
      return bMedia - aMedia;
    });

    return reviews.slice(0, 12);
  }

  function extractAmazonProduct(doc, pageUrl) {
    try {
      const urlObj = new URL(pageUrl);

      const cleanText = (str) => {
        if (!str) return "";
        return str
          .replace(/[\u200E\u200F\u202A-\u202E\u00A0]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      };

      const textOf = (selectors, root = doc) => {
        for (const sel of selectors) {
          const el = root.querySelector(sel);
          if (el) {
            const txt = cleanText(el.textContent);
            if (txt) return txt;
          }
        }
        return "";
      };

      const parsePriceNumber = (raw) => {
        if (!raw) return null;
        const cleaned = cleanText(raw);
        const match = cleaned.match(/[\d.,]+/);
        if (!match) return null;
        let numStr = match[0];

        const lastComma = numStr.lastIndexOf(",");
        const lastDot = numStr.lastIndexOf(".");

        if (lastComma !== -1 && lastDot !== -1) {
          if (lastComma > lastDot) {
            numStr = numStr.replace(/\./g, "").replace(",", ".");
          } else {
            numStr = numStr.replace(/,/g, "");
          }
        } else if (lastComma !== -1) {
          const afterComma = numStr.slice(lastComma + 1);
          if (afterComma.length <= 2) {
            numStr = numStr.replace(",", ".");
          } else {
            numStr = numStr.replace(/,/g, "");
          }
        } else if (lastDot !== -1) {
          const afterDot = numStr.slice(lastDot + 1);
          if (afterDot.length === 3 && numStr.length > 4) {
            numStr = numStr.replace(/\./g, "");
          }
        }

        const val = parseFloat(numStr);
        return Number.isFinite(val) ? val : null;
      };

      const extractCurrency = (raw) => {
        if (!raw) return "";
        const m = cleanText(raw).match(/(€|\$|£|¥|₹|CHF|MX\$|US\$|CA\$|R\$|zł|kr)/i);
        return m ? m[1] : "";
      };

      const extractAsin = () => {
        const urlMatch = urlObj.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i);
        if (urlMatch) return urlMatch[1].toUpperCase();
        const input = doc.querySelector("#ASIN, input[name='ASIN']");
        if (input?.value) return input.value.trim().toUpperCase();
        return "";
      };

      const extractTitle = () => {
        return (
          textOf(["#productTitle", "#title span", "h1.a-size-large"]) ||
          cleanText(doc.title)
        );
      };

      const extractBrand = () => {
        const overviewBrand = textOf([
          "tr.po-brand td.a-span9 span",
          "tr.po-brand .po-break-word"
        ]);
        if (overviewBrand) return overviewBrand;

        let byline = textOf(["#bylineInfo", "#brand"]);
        if (byline) {
          byline = byline
            .replace(/^(Visita la tienda de|Visit the|Marca:|Brand:)\s*/i, "")
            .replace(/\s*(Store|Tienda)$/i, "")
            .trim();
          return byline;
        }
        return "";
      };

      const extractImages = () => {
        const images = [];
        const seenIds = new Set();

        const getImageKey = (url) => {
          const m = url.match(/\/images\/I\/([^./?]+)/i);
          return m ? m[1] : url;
        };

        const upgradeAmazonThumb = (url) => {
          if (!url || url.startsWith("data:") || /play-button|sprite|transparent-pixel|360_icon/i.test(url)) {
            return "";
          }
          // Replace small thumbnail sizing suffix like ._AC_US40_.jpg with ._AC_SL1200_.jpg
          return url.replace(/\._[^./]+_\.(jpg|jpeg|png|webp)$/i, "._AC_SL1200_.$1");
        };

        const addImage = (rawUrl) => {
          const url = upgradeAmazonThumb(rawUrl);
          if (!url || !/^https?:\/\//i.test(url)) return;
          const key = getImageKey(url);
          if (seenIds.has(key)) return;
          seenIds.add(key);
          images.push(url);
        };

        // 1. Main hero image first
        const mainImg =
          doc.querySelector("#landingImage") ||
          doc.querySelector("#imgBlkFront") ||
          doc.querySelector("#main-image") ||
          doc.querySelector("#imgTagWrapperId img");

        if (mainImg) {
          const dyn = mainImg.getAttribute("data-a-dynamic-image");
          if (dyn) {
            try {
              const parsed = JSON.parse(dyn);
              const urls = Object.keys(parsed);
              if (urls.length > 0) {
                urls.sort((a, b) => (parsed[b]?.[0] || 0) - (parsed[a]?.[0] || 0));
                addImage(urls[0]);
              }
            } catch {
              // ignore
            }
          }
          addImage(mainImg.getAttribute("data-old-hires") || mainImg.getAttribute("src") || "");
        }

        // 2. Parse colorImages JSON embedded in page scripts (highest quality gallery)
        const scripts = doc.querySelectorAll("script");
        for (const script of scripts) {
          const text = script.textContent || "";
          if (!text.includes("colorImages") && !text.includes("imageGalleryData")) continue;

          const initialBlockMatch =
            text.match(/'colorImages'\s*:\s*\{\s*'initial'\s*:\s*(\[[\s\S]*?\])\s*\}/) ||
            text.match(/"colorImages"\s*:\s*\{\s*"initial"\s*:\s*(\[[\s\S]*?\])\s*\}/);

          const searchScope = initialBlockMatch ? initialBlockMatch[1] : text.slice(0, 30000);
          const urlRe = /"(?:hiRes|large)"\s*:\s*"(https:\/\/[^"]+amazon\.com\/images\/I\/[^"]+)"/g;
          let m;
          while ((m = urlRe.exec(searchScope)) !== null) {
            addImage(m[1].replace(/\\u002F/g, "/"));
            if (images.length >= 15) break;
          }
          if (images.length > 1) break;
        }

        // 3. Fallback: thumbnail strip in DOM (#altImages)
        doc
          .querySelectorAll(
            "#altImages li.imageThumbnail img, #altImages li.item img, #imageBlockThumbs img"
          )
          .forEach((img) => {
            if (img.closest(".videoThumbnail, .a-declarative[data-action='video-thumbnail']")) return;
            addImage(img.getAttribute("src") || img.getAttribute("data-src") || "");
          });

        return images.slice(0, 15);
      };

      const extractPrices = () => {
        const priceDisplay = textOf([
          "#corePriceDisplay_desktop_feature_div .priceToPay .a-offscreen",
          "#corePrice_feature_div .priceToPay .a-offscreen",
          "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
          "#corePrice_feature_div .a-price .a-offscreen",
          "#apex_desktop .priceToPay .a-offscreen",
          ".apexPriceToPay .a-offscreen",
          "#priceblock_dealprice",
          "#priceblock_ourprice",
          "#price_inside_buybox",
          "#newBuyBoxPrice",
          ".a-price .a-offscreen"
        ]);

        let finalDisplay = priceDisplay;
        if (!finalDisplay) {
          const whole = textOf([
            "#corePriceDisplay_desktop_feature_div .a-price-whole",
            "#corePrice_feature_div .a-price-whole",
            ".priceToPay .a-price-whole"
          ]);
          const fraction = textOf([
            "#corePriceDisplay_desktop_feature_div .a-price-fraction",
            "#corePrice_feature_div .a-price-fraction",
            ".priceToPay .a-price-fraction"
          ]);
          const symbol = textOf([
            "#corePriceDisplay_desktop_feature_div .a-price-symbol",
            "#corePrice_feature_div .a-price-symbol",
            ".priceToPay .a-price-symbol"
          ]);
          if (whole) {
            finalDisplay = `${whole.replace(/[.,]$/, "")}${fraction ? "," + fraction : ""} ${symbol}`.trim();
          }
        }

        const listPriceDisplay = textOf([
          "#corePriceDisplay_desktop_feature_div .basisPrice .a-offscreen",
          "#corePrice_feature_div .basisPrice .a-offscreen",
          "#corePriceDisplay_desktop_feature_div .a-text-price .a-offscreen",
          ".priceBlockStrikePriceString"
        ]);

        const discountText = textOf([
          "#corePriceDisplay_desktop_feature_div .savingsPercentage",
          "#corePrice_feature_div .savingsPercentage",
          ".reinventPriceSavingsPercentageMargin"
        ]);

        const priceNum = parsePriceNumber(finalDisplay);
        const listPriceNum = parsePriceNumber(listPriceDisplay);
        const currency = extractCurrency(finalDisplay) || extractCurrency(listPriceDisplay);

        let discountPct = null;
        if (discountText) {
          const dm = discountText.match(/(\d+)\s*%/);
          if (dm) discountPct = parseInt(dm[1], 10);
        } else if (priceNum && listPriceNum && listPriceNum > priceNum) {
          discountPct = Math.round(((listPriceNum - priceNum) / listPriceNum) * 100);
        }

        const unitPrice = textOf([
          "#corePriceDisplay_desktop_feature_div .pricePerUnit",
          "#corePrice_feature_div .pricePerUnit",
          ".pricePerUnit",
          "#corePriceDisplay_desktop_feature_div .a-size-mini .a-color-secondary"
        ]);
        const cleanUnitPrice = unitPrice && /\//.test(unitPrice) ? unitPrice.replace(/^\(|\)$/g, "").trim() : "";

        // Coupon extraction
        const couponRaw = textOf([
          "#couponText",
          'label[id^="couponText"]',
          '[id^="couponBadge"]',
          ".promoPriceBlockMessage",
          "#vpcButton",
          '[data-csa-c-slot-id="promoPriceBlockMessage"]'
        ]);

        let couponText = "";
        let netPriceNum = null;
        let netPriceDisplay = "";

        if (couponRaw && /(cup[oó]n|coupon|ahorra|save|descuento|rabatt|remise|sconto|voucher)/i.test(couponRaw)) {
          const pctMatch = couponRaw.match(/(\d{1,2})\s*%/);
          const amtMatch = couponRaw.match(/(\d+(?:[.,]\d{1,2})?)\s*(€|\$|£|¥|₹|CHF)|([€$£¥₹])\s*(\d+(?:[.,]\d{1,2})?)/);

          if (pctMatch && priceNum) {
            const pct = parseInt(pctMatch[1], 10);
            if (pct > 0 && pct < 90) {
              couponText = `Cupón -${pct}%`;
              netPriceNum = Math.round(priceNum * (1 - pct / 100) * 100) / 100;
            }
          } else if (amtMatch && priceNum) {
            const rawVal = amtMatch[1] || amtMatch[4];
            const sym = amtMatch[2] || amtMatch[3] || currency;
            const amt = parsePriceNumber(rawVal);
            if (amt && amt > 0 && amt < priceNum) {
              couponText = `Cupón -${rawVal}${sym ? " " + sym : ""}`;
              netPriceNum = Math.round((priceNum - amt) * 100) / 100;
            }
          } else {
            couponText = couponRaw.slice(0, 80);
          }

          if (netPriceNum !== null) {
            const formatted = netPriceNum.toFixed(2).replace(".", ",");
            netPriceDisplay = currency ? `${formatted} ${currency}` : formatted;
          }
        }

        return {
          priceDisplay: finalDisplay,
          priceNum,
          listPriceDisplay: listPriceNum && priceNum && listPriceNum > priceNum ? listPriceDisplay : "",
          listPriceNum: listPriceNum && priceNum && listPriceNum > priceNum ? listPriceNum : null,
          discountPct,
          currency,
          unitPrice: cleanUnitPrice,
          couponText,
          netPriceNum,
          netPriceDisplay
        };
      };

      const extractRating = () => {
        let ratingRaw = "";
        const popover = doc.querySelector("#acrPopover");
        if (popover) {
          ratingRaw =
            popover.getAttribute("title") ||
            popover.getAttribute("aria-label") ||
            cleanText(popover.textContent);
        }
        if (!ratingRaw) {
          ratingRaw = textOf([
            'span[data-hook="rating-out-of-text"]',
            "#averageCustomerReviews .a-icon-alt",
            "#cm_cr_dp_d_rating_histogram .a-icon-alt"
          ]);
        }

        let ratingNum = null;
        if (ratingRaw) {
          const m = ratingRaw.match(/(\d+[.,]\d+|\d+)/);
          if (m) {
            const parsed = parseFloat(m[1].replace(",", "."));
            if (Number.isFinite(parsed) && parsed <= 5) {
              ratingNum = parsed;
            }
          }
        }

        const reviewsRaw = textOf([
          "#acrCustomerReviewText",
          'span[data-hook="total-review-count"]'
        ]);
        let reviewCount = null;
        if (reviewsRaw) {
          const digits = reviewsRaw.replace(/[^\d]/g, "");
          if (digits) reviewCount = parseInt(digits, 10);
        }

        return { ratingNum, reviewCount, reviewsRaw };
      };

      const extractAvailabilityAndShipping = () => {
        const availability = textOf([
          "#availability span",
          "#availability",
          "#outOfStock .a-color-price"
        ]);

        const isPrime = Boolean(
          doc.querySelector(
            "#prime_feature_div i.a-icon-prime, #mir-layout-DELIVERY_BLOCK i.a-icon-prime, #bbop-sbbop-container, #priceBadging_feature_div i.a-icon-prime"
          )
        );

        const delivery = textOf([
          "#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE",
          "#mir-layout-DELIVERY_BLOCK",
          "#deliveryBlockMessage"
        ]);

        let seller = "";
        const sellerRows = doc.querySelectorAll("#tabular-buybox .tabular-buybox-text");
        if (sellerRows.length > 0) {
          const parts = Array.from(sellerRows)
            .map((el) => cleanText(el.textContent))
            .filter(Boolean);
          if (parts.length > 0) {
            seller = parts.slice(0, 2).join(" / ");
          }
        }
        if (!seller) {
          seller = textOf(["#sellerProfileTriggerId", "#merchant-info"]);
        }

        const returnsPolicy = textOf([
          "#productSupportAndReturnPolicy-return-policy-anchor-text",
          "#creturns-policy-anchor-text",
          "#returnsInfoFeature_feature_div a",
          "#returnsInfoFeature_feature_div",
          "#FREE_RETURNS",
          "#returnPolicy_feature_div"
        ]);

        const warranty = textOf([
          "#warranty_feature_div",
          "#warranties_feature_div"
        ]);

        return {
          availability,
          isPrime,
          delivery: delivery.slice(0, 160),
          seller: seller.slice(0, 120),
          returnsPolicy: returnsPolicy.slice(0, 140),
          warranty: warranty.slice(0, 140)
        };
      };

      const extractSelectedVariant = () => {
        const parts = [];
        const seen = new Set();

        const addVariant = (label, val) => {
          const k = cleanText(label).replace(/[:：]+$/, "").trim();
          const v = cleanText(val);
          if (!v || v.length > 80) return;
          const entry = k ? `${k}: ${v}` : v;
          if (!seen.has(entry.toLowerCase())) {
            seen.add(entry.toLowerCase());
            parts.push(entry);
          }
        };

        // Classic twister (#variation_color_name, #variation_size_name, etc.)
        doc.querySelectorAll('[id^="variation_"]').forEach((block) => {
          const valEl = block.querySelector(".selection");
          if (!valEl) return;
          const labelEl = block.querySelector(".a-form-label, label");
          addVariant(labelEl?.textContent || "", valEl.textContent);
        });

        // Inline twister (newer Amazon layout)
        doc.querySelectorAll('[id^="inline-twister-expander-header-"]').forEach((hdr) => {
          const labelEl = hdr.querySelector(".dimension-text, .inline-twister-dim-title");
          const valEl = hdr.querySelector(".inline-twister-dim-title-value, .dimension-value-list-item-selected");
          if (valEl) {
            addVariant(labelEl?.textContent || "", valEl.textContent);
          }
        });

        return parts.slice(0, 4).join(" · ");
      };

      const extractBullets = () => {
        const items = doc.querySelectorAll(
          "#feature-bullets ul li:not(.aok-hidden) span.a-list-item, #featurebullets_feature_div ul li span.a-list-item"
        );
        const bullets = [];
        const seen = new Set();

        for (const el of items) {
          if (el.closest(".aok-hidden, #replacementPartsFitmentBullet")) continue;
          const txt = cleanText(el.textContent);
          if (!txt || txt.length < 4) continue;
          if (/^(ver más detalles|see more product details)/i.test(txt)) continue;
          if (!seen.has(txt)) {
            seen.add(txt);
            bullets.push(txt);
          }
        }
        return bullets.slice(0, 10);
      };

      const extractSpecs = () => {
        const specs = {};

        const addSpec = (rawKey, rawVal) => {
          const key = cleanText(rawKey).replace(/[:：]+$/, "").trim();
          const val = cleanText(rawVal);
          if (!key || !val) return;
          if (key.length > 80 || val.length > 300) return;
          if (
            /^(valoración media|opiniones de clientes|customer reviews|clasificación en los más vendidos|best sellers rank|asin)$/i.test(
              key
            )
          ) {
            return;
          }
          if (!specs[key]) {
            specs[key] = val;
          }
        };

        doc.querySelectorAll("#productOverview_feature_div table tr").forEach((tr) => {
          const cells = tr.querySelectorAll("td");
          if (cells.length >= 2) {
            addSpec(cells[0].textContent, cells[1].textContent);
          }
        });

        const tableSelectors = [
          "#productDetails_techSpec_section_1 tr",
          "#productDetails_techSpec_section_2 tr",
          "#productDetails_detailBullets_sections1 tr",
          "#technicalSpecifications_section_1 tr",
          ".prodDetTable tr"
        ];
        for (const sel of tableSelectors) {
          doc.querySelectorAll(sel).forEach((tr) => {
            const th = tr.querySelector("th");
            const td = tr.querySelector("td");
            if (th && td) {
              addSpec(th.textContent, td.textContent);
            }
          });
        }

        doc.querySelectorAll("#detailBullets_feature_div li span.a-list-item").forEach((li) => {
          const bold = li.querySelector("span.a-text-bold");
          if (bold) {
            const key = cleanText(bold.textContent).replace(/[:：]+$/, "");
            const full = cleanText(li.textContent);
            const val = cleanText(full.slice(cleanText(bold.textContent).length));
            addSpec(key, val);
          }
        });

        return specs;
      };

      const extractReviewSummary = () => {
        return textOf([
          '#product-summary p[data-hook="cr-insights-widget-summary"]',
          "#product-summary .a-spacing-small span",
          '[data-hook="cr-insights-widget-summary"]'
        ]);
      };

      const extractRatingDistribution = () => extractAmazonRatingDistribution(doc);

      const extractReviews = () => extractAmazonReviews(doc);

      const extractCategory = () => {
        const crumbs = Array.from(
          doc.querySelectorAll("#wayfinding-breadcrumbs_feature_div ul li a")
        )
          .map((a) => cleanText(a.textContent))
          .filter(Boolean);
        return crumbs.join(" › ");
      };

      const asin = extractAsin();
      const canonicalUrl = asin ? `${urlObj.origin}/dp/${asin}` : pageUrl;
      const prices = extractPrices();
      const rating = extractRating();
      const shipping = extractAvailabilityAndShipping();
      const images = extractImages();

      return {
        asin,
        url: canonicalUrl,
        title: extractTitle(),
        brand: extractBrand(),
        image: images[0] || "",
        images,
        ...prices,
        ...rating,
        ...shipping,
        category: extractCategory(),
        variant: extractSelectedVariant(),
        bullets: extractBullets(),
        specs: extractSpecs(),
        reviewSummary: extractReviewSummary(),
        ratingDistribution: extractRatingDistribution(),
        reviews: extractReviews()
      };
    } catch (err) {
      return {
        __error: err?.message || String(err)
      };
    }
  }

  globalThis.extractAmazonProduct = extractAmazonProduct;
  globalThis.extractAmazonReviews = extractAmazonReviews;
  globalThis.extractAmazonRatingDistribution = extractAmazonRatingDistribution;

  if (typeof location !== "undefined" && location.protocol !== "chrome-extension:") {
    return extractAmazonProduct(document, location.href);
  }
})();
