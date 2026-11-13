(function () {
  if (document.body.dataset.page !== "ads") return;

  const IMG = {
    a: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80",
    b: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80",
    c: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80",
    d: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
    e: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80",
    f: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80",
    g: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80",
    h: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    i: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=400&q=80",
  };

  const PRODUCTS = [
    { id: "STX-DR-1008", name: "Ivory Silk Column Dress", image: IMG.d, color: "#d8cfc4" },
    { id: "STX-OW-2041", name: "Noir Tailored Wool Blazer", image: IMG.e, color: "#1f1f1f" },
    { id: "STX-OW-3302", name: "Cashmere Funnel Coat", image: IMG.b, color: "#c4a574" },
    { id: "STX-FW-1188", name: "Sculpt Leather Ankle Boot", image: IMG.g, color: "#2c3e50" },
    { id: "STX-DR-1410", name: "Pleated Satin Midi Skirt", image: IMG.f, color: "#e8d5b7" },
    { id: "STX-AC-0904", name: "Gold-Hardware Mini Bag", image: IMG.i, color: "#c9a227" },
  ];

  const STUDIO = [
    { id: "STU-01", name: "Ivory silk, walking the colonnade", image: IMG.d },
    { id: "STU-02", name: "Noir wool blazer, studio light", image: IMG.e },
    { id: "STU-03", name: "Pleated skirt, late afternoon", image: IMG.f },
    { id: "STU-04", name: "Leather boot, sculpted last", image: IMG.g },
    { id: "STU-05", name: "Cashmere coat, doorway", image: IMG.h },
    { id: "STU-06", name: "Tailoring table, black thread", image: IMG.i },
  ];

  const FEATURED_FEED = [
    {
      name: "Atelier Noir",
      handle: "@ateliernoir",
      avatar: IMG.h,
      collage: [IMG.a, IMG.b, IMG.c],
      isMine: true,
    },
    {
      name: "Bianca DesJardins",
      handle: "@biancadjardins",
      avatar: IMG.d,
      collage: [IMG.d, IMG.e, IMG.f],
    },
    {
      name: "Marty",
      handle: "@marty",
      avatar: IMG.h,
      collage: [IMG.c, IMG.b, IMG.i],
    },
    {
      name: "Mary Royall Wilgis",
      handle: "@maryroyalstudio",
      avatar: IMG.f,
      collage: [IMG.g, IMG.a, IMG.e],
    },
  ];

  let overlay = null;
  let bannerImage = "";
  let bannerName = "";
  let pickerKind = "product";
  let pickerQuery = "";

  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="ads-workspace" id="ads-app">
      <section class="ads-panel">
        <div class="ads-panel-head">
          <h2>Choose ad type</h2>
          <p>Pick how you want to promote your shop. Each path uses schedule + manual payment.</p>
        </div>
        <div class="ads-type-grid" role="list">
          <button type="button" class="ads-type-card" data-ad-type="banner" role="listitem">
            <span class="ads-type-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>
            </span>
            <strong>Banner Ad</strong>
            <p>Upload a promotional banner image to display across the platform.</p>
            <span class="ads-type-chevron" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>
            </span>
          </button>
          <button type="button" class="ads-type-card" data-ad-type="featured" role="listitem">
            <span class="ads-type-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.2 4.5L19 8.2l-3.5 3.4.8 4.9L12 14.8 7.7 16.5l.8-4.9L5 8.2l4.8-.7L12 3z"/></svg>
            </span>
            <strong>Featured Shop</strong>
            <p>Highlight your shop profile in the discovery feed carousel.</p>
            <span class="ads-type-chevron" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>
            </span>
          </button>
          <button type="button" class="ads-type-card" data-ad-type="boost" role="listitem">
            <span class="ads-type-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a2 2 0 0 0 2 2h2l5 3V5L8 8H6a2 2 0 0 0-2 2z"/><path d="M16.5 8.5a4.5 4.5 0 0 1 0 7"/></svg>
            </span>
            <strong>Boost Content</strong>
            <p>Boost an existing Product or Studio item to reach more customers.</p>
            <span class="ads-type-chevron" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>
            </span>
          </button>
        </div>
      </section>
    </div>
  `;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "ads-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `<div class="ads-sheet" data-ads-sheet role="dialog" aria-modal="true" aria-labelledby="adsSheetTitle"></div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.closest("[data-ads-close]")) closeSheet();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay && !overlay.hidden) closeSheet();
    });
    return overlay;
  }

  function openSheet(html, wide) {
    ensureOverlay();
    const sheet = overlay.querySelector("[data-ads-sheet]");
    sheet.classList.toggle("is-wide", Boolean(wide));
    sheet.innerHTML = html;
    overlay.hidden = false;
    document.body.classList.add("is-ads-open");
  }

  function closeSheet() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove("is-ads-open");
  }

  function goToSchedule(item) {
    closeSheet();
    if (typeof window.openBoost === "function") {
      window.openBoost(item);
    }
  }

  function featuredCard(shop, hero) {
    const collage = (shop.collage || []).map((src) => `<span style="background-image:url('${src}')"></span>`).join("");
    return `
      <article class="featured-shop-card${hero ? " is-hero" : ""}">
        <div class="featured-collage">${collage}</div>
        <div class="featured-shop-body">
          <div class="featured-avatar" style="background-image:url('${shop.avatar}')" aria-hidden="true"></div>
          <strong>${escapeHtml(shop.name)}</strong>
          <small>${escapeHtml(shop.handle)}</small>
          <button type="button" class="featured-follow">Follow</button>
        </div>
      </article>
    `;
  }

  /* ---------- Banner ---------- */
  function openBannerFlow() {
    bannerImage = "";
    bannerName = "";
    renderBannerSheet();
  }

  function renderBannerSheet() {
    openSheet(`
      <div class="ads-sheet-head">
        <h2 id="adsSheetTitle">Banner Ad</h2>
        <button type="button" class="btn is-ghost" data-ads-close>Close</button>
      </div>
      <div class="ads-sheet-body">
        <p class="ads-preview-copy">Upload 1 banner image. You’ll set schedule and pay on the next screens.</p>
        <label class="ads-upload">
          ${
            bannerImage
              ? `<img src="${bannerImage}" alt="Banner preview">
                 <div class="ads-upload-actions">
                   <span>${escapeHtml(bannerName || "Banner attached")}</span>
                   <button type="button" class="btn is-ghost" data-banner-clear>Remove</button>
                 </div>`
              : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V6"/><path d="m8 9 4-4 4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
                 <span>Upload banner image</span>
                 <span style="font-weight:500;color:var(--text-secondary);font-size:13px;">PNG or JPG · recommended 1200×400</span>`
          }
          <input type="file" accept="image/*" hidden data-banner-file>
        </label>
      </div>
      <div class="ads-sheet-foot">
        <button type="button" class="btn" data-banner-continue ${bannerImage ? "" : "disabled"}>Continue to schedule</button>
      </div>
    `);

    overlay.querySelector("[data-banner-file]")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        bannerImage = String(reader.result || "");
        bannerName = file.name;
        renderBannerSheet();
      };
      reader.readAsDataURL(file);
    });

    overlay.querySelector("[data-banner-clear]")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      bannerImage = "";
      bannerName = "";
      renderBannerSheet();
    });

    overlay.querySelector("[data-banner-continue]")?.addEventListener("click", () => {
      if (!bannerImage) return;
      goToSchedule({
        id: "BANNER",
        name: "Banner Ad",
        type: "banner",
        title: "Banner schedule",
        image: bannerImage,
        color: "#2c3e50",
      });
    });
  }

  /* ---------- Featured ---------- */
  function openFeaturedFlow() {
    openSheet(`
      <div class="ads-sheet-head">
        <h2 id="adsSheetTitle">Featured Shop</h2>
        <button type="button" class="btn is-ghost" data-ads-close>Close</button>
      </div>
      <div class="ads-sheet-body">
        <div class="ads-featured-setup">
          <p class="ads-featured-note">No image upload needed. We’ll use your shop avatar and recent items automatically for the discovery feed card.</p>
          <div class="ads-featured-actions">
            <button type="button" class="btn is-ghost" data-featured-preview>Preview</button>
          </div>
        </div>
      </div>
      <div class="ads-sheet-foot is-split">
        <button type="button" class="btn is-ghost" data-ads-close>Cancel</button>
        <button type="button" class="btn" data-featured-continue>Continue to schedule</button>
      </div>
    `);

    overlay.querySelector("[data-featured-preview]")?.addEventListener("click", openFeaturedPreview);
    overlay.querySelector("[data-featured-continue]")?.addEventListener("click", () => {
      const mine = FEATURED_FEED.find((s) => s.isMine) || FEATURED_FEED[0];
      goToSchedule({
        id: "FEATURED",
        name: mine.name,
        type: "featured",
        title: "Featured schedule",
        image: mine.avatar,
        color: "#2c3e50",
      });
    });
  }

  function openFeaturedPreview() {
    const mine = FEATURED_FEED.find((s) => s.isMine) || FEATURED_FEED[0];
    openSheet(
      `
      <div class="ads-sheet-head">
        <h2 id="adsSheetTitle">Feed preview</h2>
        <button type="button" class="btn is-ghost" data-preview-back>Back</button>
      </div>
      <div class="ads-sheet-body">
        <p class="ads-preview-copy">This is how your shop will appear in the customer feed.</p>
        <div class="ads-preview-hero">${featuredCard(mine, true)}</div>
        <div class="ads-feed" aria-label="Featured shops feed">
          ${FEATURED_FEED.map((shop) => featuredCard(shop, false)).join("")}
        </div>
      </div>
      <div class="ads-sheet-foot is-split">
        <button type="button" class="btn is-ghost" data-preview-back>Back</button>
        <button type="button" class="btn" data-featured-continue>Continue to schedule</button>
      </div>
    `,
      true
    );

    overlay.querySelectorAll("[data-preview-back]").forEach((btn) => {
      btn.addEventListener("click", openFeaturedFlow);
    });
    overlay.querySelector("[data-featured-continue]")?.addEventListener("click", () => {
      goToSchedule({
        id: "FEATURED",
        name: mine.name,
        type: "featured",
        title: "Featured schedule",
        image: mine.avatar,
        color: "#2c3e50",
      });
    });
  }

  /* ---------- Boost picker ---------- */
  function openBoostFlow() {
    pickerKind = "product";
    pickerQuery = "";
    openSheet(`
      <div class="ads-sheet-head">
        <h2 id="adsSheetTitle">Boost Content</h2>
        <button type="button" class="btn is-ghost" data-ads-close>Close</button>
      </div>
      <div class="ads-sheet-body">
        <p class="ads-preview-copy">Choose what you want to boost.</p>
        <div class="ads-boost-type">
          <button type="button" class="ads-boost-choice is-active" data-boost-kind="product">
            <strong>Product</strong>
            <span>Boost a catalog item</span>
          </button>
          <button type="button" class="ads-boost-choice" data-boost-kind="studio">
            <strong>Studio</strong>
            <span>Boost a studio photo</span>
          </button>
        </div>
      </div>
      <div class="ads-sheet-foot">
        <button type="button" class="btn" data-boost-pick>Continue</button>
      </div>
    `);

    overlay.querySelectorAll("[data-boost-kind]").forEach((btn) => {
      btn.addEventListener("click", () => {
        pickerKind = btn.getAttribute("data-boost-kind");
        overlay.querySelectorAll("[data-boost-kind]").forEach((el) => {
          el.classList.toggle("is-active", el === btn);
        });
      });
    });

    overlay.querySelector("[data-boost-pick]")?.addEventListener("click", () => {
      openPicker(pickerKind);
    });
  }

  function openPicker(kind) {
    pickerKind = kind;
    pickerQuery = "";
    renderPicker();
  }

  function renderPicker() {
    const source = pickerKind === "studio" ? STUDIO : PRODUCTS;
    const needle = pickerQuery.trim().toLowerCase();
    const rows = source.filter((item) => !needle || item.name.toLowerCase().includes(needle));

    openSheet(`
      <div class="ads-sheet-head">
        <h2 id="adsSheetTitle">Select ${pickerKind === "studio" ? "Studio" : "Product"}</h2>
        <button type="button" class="btn is-ghost" data-picker-back>Back</button>
      </div>
      <div class="ads-sheet-body">
        <input class="ads-picker-search" type="search" placeholder="Search by name" value="${escapeHtml(pickerQuery)}" data-picker-search>
        <div class="ads-picker-list">
          ${
            rows.length
              ? rows
                  .map(
                    (item) => `
            <div class="ads-picker-row">
              <div class="ads-picker-thumb">${item.image ? `<img src="${item.image}" alt="">` : ""}</div>
              <strong>${escapeHtml(item.name)}</strong>
              <button type="button" class="btn" data-pick-boost="${escapeHtml(item.id)}">Boost</button>
            </div>`
                  )
                  .join("")
              : `<p class="ads-picker-empty">No matches.</p>`
          }
        </div>
      </div>
    `);

    const search = overlay.querySelector("[data-picker-search]");
    search?.addEventListener("input", () => {
      pickerQuery = search.value;
      renderPicker();
      const again = overlay.querySelector("[data-picker-search]");
      if (again) {
        again.focus();
        const len = again.value.length;
        again.setSelectionRange(len, len);
      }
    });

    overlay.querySelector("[data-picker-back]")?.addEventListener("click", openBoostFlow);

    overlay.querySelectorAll("[data-pick-boost]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-pick-boost");
        const item = source.find((row) => row.id === id);
        if (!item) return;
        goToSchedule({
          id: item.id,
          name: item.name,
          type: pickerKind === "studio" ? "studio" : "product",
          title: "Boost",
          image: item.image || "",
          color: item.color || "#2c3e50",
        });
      });
    });
  }

  document.getElementById("ads-app").addEventListener("click", (e) => {
    const card = e.target.closest("[data-ad-type]");
    if (!card) return;
    const type = card.getAttribute("data-ad-type");
    const run = typeof window.runWithLoading === "function" ? window.runWithLoading : (_el, fn) => fn();
    run(card, () => {
      if (type === "banner") openBannerFlow();
      else if (type === "featured") openFeaturedFlow();
      else if (type === "boost") openBoostFlow();
    });
  });
})();
