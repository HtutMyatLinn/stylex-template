(function () {
  if (document.body.dataset.page !== "promotions") return;

  const MMK_PER_USD = 2100;
  const SAMPLE_CART = 45000;
  const TYPES = [
    { id: "discount", label: "Direct Discount", badge: "Discount" },
    { id: "coupon", label: "Coupon Code", badge: "Coupon" },
    { id: "bundle", label: "Bundle Deal", badge: "Bundle" },
    { id: "bogo", label: "Buy X Get Y", badge: "Buy X Get Y" },
    { id: "shipping", label: "Free Shipping", badge: "Free Shipping" },
    { id: "flash", label: "Flash Sale", badge: "Flash Sale" },
  ];

  const catalog = [
    { id: "STX-0984", name: "Cigarette Trouser, Black", sku: "STX-0984", category: "Knitwear", stock: 14, price: 185000 },
    { id: "STX-1048", name: "Ivory Silk Column Dress", sku: "STX-1048", category: "Dresses", stock: 6, price: 420000 },
    { id: "STX-1102", name: "Noir Tailored Wool Blazer", sku: "STX-1102", category: "Outerwear", stock: 9, price: 390000 },
    { id: "STX-1188", name: "Sculpt Leather Ankle Boot", sku: "STX-1188", category: "Footwear", stock: 11, price: 265000 },
    { id: "STX-1204", name: "Camel Wool Overcoat", sku: "STX-1204", category: "Outerwear", stock: 4, price: 510000 },
    { id: "STX-1240", name: "Pleated Midi Skirt, Ink", sku: "STX-1240", category: "Dresses", stock: 16, price: 155000 },
    { id: "STX-1302", name: "City Leather Shoulder Bag", sku: "STX-1302", category: "Accessories", stock: 8, price: 220000 },
    { id: "STX-1366", name: "Fine Gauge Cashmere Crew", sku: "STX-1366", category: "Knitwear", stock: 18, price: 240000 },
    { id: "STX-1410", name: "Column Heel, Bone", sku: "STX-1410", category: "Footwear", stock: 7, price: 195000 },
    { id: "STX-1477", name: "Silk Scarf, Noir Grid", sku: "STX-1477", category: "Accessories", stock: 22, price: 85000 },
    { id: "STX-1520", name: "Double Breasted Trench", sku: "STX-1520", category: "Outerwear", stock: 5, price: 460000 },
    { id: "STX-1588", name: "Slip Dress, Champagne", sku: "STX-1588", category: "Dresses", stock: 10, price: 280000 },
    { id: "STX-1633", name: "Merino Polo, Ivory", sku: "STX-1633", category: "Knitwear", stock: 13, price: 165000 },
    { id: "STX-1701", name: "Suede Loafer, Chocolate", sku: "STX-1701", category: "Footwear", stock: 9, price: 210000 },
    { id: "STX-1760", name: "Gold Collar Necklace", sku: "STX-1760", category: "Accessories", stock: 15, price: 120000 },
    { id: "STX-1814", name: "Wide Wool Trouser, Stone", sku: "STX-1814", category: "Knitwear", stock: 12, price: 175000 },
  ];

  function localInput(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes());
}

const flashEnd = localInput(new Date(Date.now() + ((5 * 60 + 42) * 60 * 1000)));

  let campaigns = [
    { id: "PRM-1108", name: "Midnight Column", code: "", type: "flash", benefit: "30% OFF", mode: "percent", value: 30, start: "2026-11-11T08:00", end: flashEnd, used: 36, limit: 80, revenue: 12600000, discountGiven: 4200000, status: "Active", products: ["STX-1048", "STX-1588"], minSpend: 0, perCustomer: 1, stacking: false, cap: 20 },
    { id: "PRM-1102", name: "Atelier Private Code", code: "STYLX-A9F2K8", type: "coupon", benefit: "15,000 MMK OFF", mode: "fixed", value: 15000, start: "2026-11-01T00:00", end: "2026-11-30T23:59", used: 84, limit: 100, revenue: 18400000, discountGiven: 1260000, status: "Active", products: [], minSpend: 80000, perCustomer: 1, stacking: false },
    { id: "PRM-1094", name: "Column & Boot Bundle", code: "", type: "bundle", benefit: "Bundle 620,000 MMK", mode: "fixed", value: 620000, start: "2026-11-05T00:00", end: "2026-11-25T23:59", used: 18, limit: 40, revenue: 11160000, discountGiven: 1170000, status: "Active", products: ["STX-1048", "STX-1188"], minSpend: 0, perCustomer: 2, stacking: false },
    { id: "PRM-1088", name: "Trouser Set Offer", code: "", type: "bogo", benefit: "Buy 2 Get 1 Free", mode: "free", value: 100, start: "2026-11-01T00:00", end: "2026-12-01T23:59", used: 27, limit: 60, revenue: 7400000, discountGiven: 1850000, status: "Active", products: ["STX-0984"], rewardProducts: ["STX-1814"], buyQty: 2, getQty: 1, minSpend: 0, perCustomer: 1, stacking: false },
    { id: "PRM-1081", name: "City Delivery", code: "", type: "shipping", benefit: "Free delivery over 50,000 MMK", mode: "fixed", value: 50000, start: "2026-10-15T00:00", end: "2026-12-15T23:59", used: 140, limit: 0, revenue: 22000000, discountGiven: 980000, status: "Active", products: [], minSpend: 50000, perCustomer: 3, stacking: true, zone: "Nationwide" },
    { id: "PRM-1072", name: "Ivory Dress Week", code: "", type: "discount", benefit: "20% OFF", mode: "percent", value: 20, start: "2026-11-08T00:00", end: "2026-11-18T23:59", used: 22, limit: 50, revenue: 6720000, discountGiven: 1680000, status: "Active", products: ["STX-1048", "STX-1588"], minSpend: 0, perCustomer: 2, stacking: false, scope: "products" },
    { id: "PRM-1066", name: "Noir Outerwear", code: "NOIR-WEEK", type: "coupon", benefit: "10% OFF", mode: "percent", value: 10, start: "2026-11-20T00:00", end: "2026-11-27T23:59", used: 0, limit: 200, revenue: 0, discountGiven: 0, status: "Scheduled", products: [], minSpend: 150000, perCustomer: 1, stacking: false },
    { id: "PRM-1058", name: "October Knit Edit", code: "", type: "discount", benefit: "25,000 MMK OFF", mode: "fixed", value: 25000, start: "2026-10-01T00:00", end: "2026-10-31T23:59", used: 61, limit: 80, revenue: 9800000, discountGiven: 1525000, status: "Expired", products: ["STX-1366"], minSpend: 100000, perCustomer: 1, stacking: false },
    { id: "PRM-1051", name: "Heel Pair Code", code: "STYLX-HEEL10", type: "coupon", benefit: "10% OFF", mode: "percent", value: 10, start: "2026-11-02T00:00", end: "2026-11-22T23:59", used: 19, limit: 40, revenue: 3705000, discountGiven: 370500, status: "Active", products: ["STX-1410"], minSpend: 150000, perCustomer: 1, stacking: false },
    { id: "PRM-1044", name: "Trench & Scarf", code: "", type: "bundle", benefit: "Bundle 490,000 MMK", mode: "fixed", value: 490000, start: "2026-11-12T09:00", end: "2026-11-30T23:59", used: 4, limit: 25, revenue: 1960000, discountGiven: 220000, status: "Active", products: ["STX-1520", "STX-1477"], minSpend: 0, perCustomer: 1, stacking: false },
    { id: "PRM-1036", name: "Cashmere Guest", code: "", type: "bogo", benefit: "Buy 1 Get 1 50% Off", mode: "percent", value: 50, start: "2026-12-01T00:00", end: "2026-12-20T23:59", used: 0, limit: 30, revenue: 0, discountGiven: 0, status: "Scheduled", products: ["STX-1366"], rewardProducts: ["STX-1633"], buyQty: 1, getQty: 1, minSpend: 0, perCustomer: 1, stacking: false },
    { id: "PRM-1028", name: "Yangon Free Ship", code: "", type: "shipping", benefit: "Free delivery over 80,000 MMK", mode: "fixed", value: 80000, start: "2026-09-01T00:00", end: "2026-10-15T23:59", used: 90, limit: 120, revenue: 9600000, discountGiven: 720000, status: "Expired", products: [], minSpend: 80000, perCustomer: 2, stacking: true, zone: "Yangon" },
    { id: "PRM-1020", name: "Accessories 15", code: "STYLX-ACC15", type: "coupon", benefit: "15% OFF", mode: "percent", value: 15, start: "2026-11-06T00:00", end: "2026-11-16T23:59", used: 33, limit: 75, revenue: 4125000, discountGiven: 618750, status: "Active", products: [], minSpend: 50000, perCustomer: 1, stacking: false },
    { id: "PRM-1014", name: "Blazer Hours", code: "", type: "flash", benefit: "25% OFF", mode: "percent", value: 25, start: "2026-11-22T10:00", end: "2026-11-22T22:00", used: 0, limit: 30, revenue: 0, discountGiven: 0, status: "Scheduled", products: ["STX-1102"], minSpend: 0, perCustomer: 1, stacking: false, cap: 10 },
    { id: "PRM-1008", name: "Loafer Drop", code: "", type: "discount", benefit: "12% OFF", mode: "percent", value: 12, start: "2026-11-01T00:00", end: "2026-11-14T23:59", used: 11, limit: 40, revenue: 2310000, discountGiven: 277200, status: "Active", products: ["STX-1701"], minSpend: 0, perCustomer: 1, stacking: false },
    { id: "PRM-1001", name: "Early Coat Code", code: "STYLX-COAT", type: "coupon", benefit: "40,000 MMK OFF", mode: "fixed", value: 40000, start: "2026-10-01T00:00", end: "2026-10-20T23:59", used: 48, limit: 50, revenue: 19680000, discountGiven: 1920000, status: "Expired", products: [], minSpend: 300000, perCustomer: 1, stacking: false },
    { id: "PRM-0994", name: "Slip Dress Pair", code: "", type: "bundle", benefit: "Bundle 500,000 MMK", mode: "fixed", value: 500000, start: "2026-11-18T00:00", end: "2026-12-02T23:59", used: 0, limit: 20, revenue: 0, discountGiven: 0, status: "Scheduled", products: ["STX-1588", "STX-1477"], minSpend: 0, perCustomer: 1, stacking: false },
    { id: "PRM-0988", name: "Weekend Ship", code: "", type: "shipping", benefit: "Free delivery over 40,000 MMK", mode: "fixed", value: 40000, start: "2026-11-07T00:00", end: "2026-11-17T23:59", used: 56, limit: 200, revenue: 6400000, discountGiven: 448000, status: "Active", products: [], minSpend: 40000, perCustomer: 4, stacking: true, zone: "Yangon" },
  ];

  let statusFilter = "all";
  let typeFilter = "all";
  let query = "";
  let page = 1;
  let pageSize = 5;
  let pickerPage = 1;
  let pickerSize = 5;
  let pickerQuery = "";
  let pickerCategory = "all";
  let pickerMode = "products";
  let pickerSet = new Set();
  let editingId = null;
  let chart = null;
  const draft = blankDraft();

  function blankDraft() {
    return {
      name: "",
      type: "discount",
      mode: "percent",
      value: 20,
      scope: "products",
      category: "Dresses",
      code: "",
      minSpend: 0,
      bundlePrice: 0,
      buyQty: 2,
      getQty: 1,
      reward: "free",
      rewardPercent: 50,
      zone: "Yangon",
      cap: 20,
      start: "",
      end: "",
      limit: 100,
      unlimited: false,
      perCustomer: 1,
      stacking: false,
      products: [],
      rewardProducts: [],
    };
  }

  function sanitizeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function debounce(fn, wait) {
    let timer = 0;
    return function () {
      const args = arguments;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn.apply(null, args), wait);
    };
  }

  function withButtonLoading(button, task, delay) {
    if (!button || button.disabled || button.classList.contains("is-loading")) return;
    const width = Math.ceil(button.getBoundingClientRect().width);
    button.style.minWidth = width + "px";
    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    window.setTimeout(() => {
      try {
        task();
      } finally {
        if (button.isConnected) {
          button.classList.remove("is-loading");
          button.disabled = false;
          button.removeAttribute("aria-busy");
          button.style.minWidth = "";
        }
      }
    }, delay || 550);
  }

  function formatMmk(amount) {
    return Math.round(amount).toLocaleString("en-US") + " MMK";
  }

  function formatUsd(amount) {
    return "$" + (amount / MMK_PER_USD).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatWhen(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function typeMeta(id) {
    return TYPES.find((item) => item.id === id) || TYPES[0];
  }

  function productById(id) {
    return catalog.find((item) => item.id === id);
  }

  function syncCountdownTimer(endValue) {
    const end = new Date(endValue).getTime();
    if (!endValue || Number.isNaN(end)) return "00:00:00";
    const left = Math.max(0, end - Date.now());
    const total = Math.floor(left / 1000);
    const hours = String(Math.floor(total / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");
    return hours + ":" + minutes + ":" + seconds;
  }

  function trackPromoUsage() {
    return campaigns.filter((item) => item.type === "coupon").reduce((sum, item) => sum + item.used, 0);
  }

  function filteredCampaigns() {
    const text = query.trim().toLowerCase();
    return campaigns.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (!text) return true;
      return item.name.toLowerCase().includes(text) || (item.code && item.code.toLowerCase().includes(text));
    });
  }

  function pageSlice(items, current, size) {
    const pages = Math.max(1, Math.ceil(items.length / size));
    const safe = Math.min(Math.max(1, current), pages);
    const start = (safe - 1) * size;
    return { page: safe, pages: pages, rows: items.slice(start, start + size), total: items.length, start: start };
  }

  function showLoader(done) {
    const bar = document.getElementById("top-loader");
    bar.hidden = false;
    bar.classList.remove("is-done");
    window.requestAnimationFrame(() => bar.classList.add("is-run"));
    window.setTimeout(() => {
      done();
      bar.classList.add("is-done");
      window.setTimeout(() => {
        bar.classList.remove("is-run", "is-done");
        bar.hidden = true;
      }, 220);
    }, 350);
  }

  function skeletonRows(columns, rows) {
    if (window.skeletonRows) return window.skeletonRows(columns, rows || 4);
    let html = "";
    for (let index = 0; index < (rows || 4); index += 1) {
      html += "<tr class=\"sk-row\">";
      for (let cell = 0; cell < columns; cell += 1) html += "<td><span class=\"sk skeleton\"></span></td>";
      html += "</tr>";
    }
    return html;
  }

  function renderPager(container, current, pages, total, size, start, noun, onChange) {
    const from = total === 0 ? 0 : start + 1;
    const to = Math.min(start + size, total);
    const numbers = [];
    for (let index = 1; index <= pages; index += 1) {
      if (pages > 6 && index !== 1 && index !== pages && Math.abs(index - current) > 1) continue;
      numbers.push(index);
    }
    container.innerHTML =
      '<label class="promo-field pager-size"><span>Show</span><select data-size>' +
      [5, 10, 25].map((value) => '<option value="' + value + '"' + (value === size ? " selected" : "") + ">" + value + " rows</option>").join("") +
      "</select></label>" +
      '<p class="promo-note">Showing ' + from + "–" + to + " of " + total + " " + noun + "</p>" +
      '<div class="pager-buttons">' +
      '<button type="button" data-page="prev"' + (current <= 1 ? " disabled" : "") + ">Prev</button>" +
      numbers.map((value) => '<button type="button" data-page="' + value + '"' + (value === current ? ' aria-current="page"' : "") + ">" + value + "</button>").join("") +
      '<button type="button" data-page="next"' + (current >= pages ? " disabled" : "") + ">Next</button></div>";
    container.onchange = (event) => {
      if (!event.target.matches("[data-size]")) return;
      onChange("size", Number(event.target.value));
    };
    container.onclick = (event) => {
      const button = event.target.closest("[data-page]");
      if (!button || button.disabled) return;
      onChange("page", button.dataset.page);
    };
  }

  function renderKpis() {
    const active = campaigns.filter((item) => item.status === "Active").length;
    const scheduled = campaigns.filter((item) => item.status === "Scheduled").length;
    const discount = campaigns.reduce((sum, item) => sum + item.discountGiven, 0);
    const revenue = campaigns.reduce((sum, item) => sum + item.revenue, 0);
    document.getElementById("kpi-active-promos").textContent = String(active);
    document.getElementById("kpi-scheduled").textContent = scheduled + " scheduled";
    document.getElementById("kpi-total-discount").textContent = formatMmk(discount);
    document.getElementById("kpi-total-discount-usd").textContent = formatUsd(discount);
    document.getElementById("kpi-promo-revenue").textContent = formatMmk(revenue);
    document.getElementById("kpi-promo-revenue-usd").textContent = formatUsd(revenue);
    document.getElementById("kpi-coupon-uses").textContent = trackPromoUsage().toLocaleString("en-US");
  }

  function renderFlash() {
    const live = campaigns.find((item) => item.type === "flash" && item.status === "Active");
    const banner = document.getElementById("flash-banner");
    banner.hidden = !live;
    if (!live) return;
    document.getElementById("flash-banner-title").textContent = live.name + " · " + live.benefit;
    document.getElementById("flash-banner-clock").textContent = syncCountdownTimer(live.end);
    document.getElementById("manage-flash").dataset.id = live.id;
    document.getElementById("end-flash").dataset.id = live.id;
  }

  function renderCoupons() {
    const rows = campaigns.filter((item) => item.type === "coupon").sort((a, b) => b.used - a.used).slice(0, 4);
    document.getElementById("coupon-bars").innerHTML = rows.map((item) => {
      const cap = item.limit || Math.max(item.used, 1);
      const width = Math.min(100, Math.round((item.used / cap) * 100));
      return "<li><span>" + sanitizeHTML(item.code) + "</span><span class=\"meter\"><span style=\"width:" + width + "%\"></span></span><span class=\"num\">Used " + item.used + " / " + (item.limit || "∞") + "</span></li>";
    }).join("");
  }

  function renderChart() {
    const canvas = document.getElementById("promoAnalyticsChart");
    if (typeof Chart === "undefined") return;
    if (document.documentElement.classList.contains("is-booting")) {
      if (window.whenPageReady) window.whenPageReady(renderChart);
      else document.addEventListener("stylex-ready", renderChart, { once: true });
      return;
    }
    const top = campaigns.slice().sort((a, b) => b.revenue - a.revenue).slice(0, 6);
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--color-black").trim();
    const red = getComputedStyle(document.documentElement).getPropertyValue("--color-red").trim();
    const line = getComputedStyle(document.documentElement).getPropertyValue("--color-border").trim();
    const data = {
      labels: top.map((item) => item.name),
      datasets: [
        { label: "Revenue", data: top.map((item) => item.revenue), backgroundColor: ink, borderRadius: 4 },
        { label: "Discount", data: top.map((item) => item.discountGiven), backgroundColor: red, borderRadius: 4 },
      ],
    };
    const firstPaint = !chart;
    const options = {
      animation: firstPaint ? { duration: 900, easing: "easeOutQuart" } : false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: ink, boxWidth: 12, font: { family: "Be Vietnam Pro", size: 12 } } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: ink, font: { family: "Roboto Flex", size: 11 } } },
        y: { grid: { color: line }, ticks: { color: ink, callback: (value) => Math.round(value / 1000000) + "M" } },
      },
    };
    if (chart) {
      chart.data = data;
      chart.options = options;
      chart.update(firstPaint ? undefined : "none");
      return;
    }
    chart = new Chart(canvas, { type: "bar", data: data, options: options });
  }

  function usageCell(item) {
    if (!item.limit) return "<span class=\"num\">" + item.used + " used</span><span class=\"meter\"><span style=\"width:100%\"></span></span>";
    const width = Math.min(100, Math.round((item.used / item.limit) * 100));
    return "<span class=\"num\">" + item.used + " / " + item.limit + " used</span><span class=\"meter\"><span style=\"width:" + width + "%\"></span></span>";
  }

  function renderTable() {
    const view = pageSlice(filteredCampaigns(), page, pageSize);
    page = view.page;
    const body = document.getElementById("promo-table");
    if (!view.rows.length) {
      body.innerHTML = '<tr><td colspan="8"><div class="empty-state is-compact"><h2>No campaigns</h2><p>Nothing matches these filters.</p><button class="btn is-ghost" type="button" id="empty-reset">Reset Filters</button></div></td></tr>';
    } else {
      body.innerHTML = view.rows.map((item) => {
        const code = item.code
          ? '<button class="code-pill" type="button" data-copy="' + sanitizeHTML(item.code) + '"><span>' + sanitizeHTML(item.code) + '</span><i data-lucide="copy"></i></button>'
          : "";
        const clock = item.type === "flash" && item.status === "Active"
          ? '<span class="flash-inline" data-countdown="' + sanitizeHTML(item.end) + '">' + syncCountdownTimer(item.end) + "</span>"
          : "";
        const statusClass = item.status === "Active" ? "is-active" : item.status === "Expired" ? "is-expired" : "is-scheduled";
        return "<tr data-id=\"" + item.id + "\">" +
          "<td><strong>" + sanitizeHTML(item.name) + "</strong>" + code + "</td>" +
          "<td><span class=\"promo-badge\">" + sanitizeHTML(typeMeta(item.type).badge) + "</span></td>" +
          "<td>" + sanitizeHTML(item.benefit) + "</td>" +
          "<td>" + formatWhen(item.start) + " — " + formatWhen(item.end) + clock + "</td>" +
          "<td>" + usageCell(item) + "</td>" +
          "<td class=\"num\">" + formatMmk(item.revenue) + "</td>" +
          "<td><span class=\"promo-badge " + statusClass + "\">" + item.status + "</span></td>" +
          "<td><div class=\"row-actions\">" +
          "<button class=\"btn is-ghost\" type=\"button\" data-edit=\"" + item.id + "\">Edit</button>" +
          "<button class=\"btn is-ghost\" type=\"button\" data-copy-row=\"" + item.id + "\">Duplicate</button>" +
          (item.status === "Expired" ? "" : "<button class=\"btn is-danger\" type=\"button\" data-stop=\"" + item.id + "\">Deactivate</button>") +
          "</div></td></tr>";
      }).join("");
    }
    renderPager(document.getElementById("promo-pager"), view.page, view.pages, view.total, pageSize, view.start, "campaigns", (kind, value) => {
      if (kind === "size") {
        pageSize = value;
        page = 1;
      } else if (value === "prev") page -= 1;
      else if (value === "next") page += 1;
      else page = Number(value);
      document.getElementById("promo-table").innerHTML = skeletonRows(8);
      showLoader(renderTable);
    });
    if (window.lucide) window.lucide.createIcons();
  }

  function refreshDashboard(withSkeleton) {
    renderKpis();
    renderFlash();
    renderCoupons();
    renderChart();
    if (withSkeleton) {
      document.getElementById("promo-table").innerHTML = skeletonRows(8);
      showLoader(renderTable);
      return;
    }
    renderTable();
  }

  function showView(name) {
    document.querySelectorAll(".promo-view").forEach((view) => {
      const on = view.dataset.view === name;
      view.hidden = !on;
      view.classList.toggle("is-shown", on);
    });
    if (name === "dashboard" && chart) chart.resize();
  }

  function readDraftFromForm() {
    draft.name = document.getElementById("promo-name").value;
    draft.mode = draft.type === "coupon" ? document.getElementById("coupon-mode").value : document.getElementById("discount-mode").value;
    draft.value = Number(draft.type === "coupon" ? document.getElementById("coupon-value").value : draft.type === "flash" ? document.getElementById("flash-percent").value : document.getElementById("discount-value").value) || 0;
    draft.scope = document.getElementById("discount-scope").value;
    draft.category = document.getElementById("discount-category").value;
    draft.code = document.getElementById("coupon-code").value.trim().toUpperCase();
    draft.bundlePrice = Number(document.getElementById("bundle-price").value) || 0;
    draft.buyQty = Number(document.getElementById("buy-qty").value) || 1;
    draft.getQty = Number(document.getElementById("get-qty").value) || 1;
    draft.reward = document.getElementById("reward-benefit").value;
    draft.rewardPercent = Number(document.getElementById("reward-percent").value) || 50;
    draft.zone = document.getElementById("ship-zone").value;
    draft.cap = Number(document.getElementById("flash-cap").value) || 1;
    draft.start = document.getElementById("promo-start-date").value;
    draft.end = document.getElementById("promo-end-date").value;
    draft.unlimited = document.getElementById("usage-unlimited").checked;
    draft.limit = Number(document.getElementById("usage-limit").value) || 0;
    draft.perCustomer = Number(document.getElementById("usage-customer").value) || 1;
    draft.minSpend = Number(document.getElementById("usage-min").value) || 0;
    if (draft.type === "coupon") draft.minSpend = Number(document.getElementById("coupon-min").value) || 0;
    if (draft.type === "shipping") draft.minSpend = Number(document.getElementById("ship-min").value) || 0;
    draft.stacking = document.getElementById("stacking").checked;
    if (draft.type === "flash" && document.getElementById("flash-title").value.trim()) {
      draft.name = document.getElementById("flash-title").value.trim() || draft.name;
    }
  }

  function benefitText() {
    if (draft.type === "shipping") return "Free delivery over " + formatMmk(Number(document.getElementById("ship-min").value) || 0);
    if (draft.type === "bogo") {
      const reward = draft.reward === "free" ? "Free" : (draft.rewardPercent || 50) + "% Off";
      return "Buy " + draft.buyQty + " Get " + draft.getQty + " " + reward;
    }
    if (draft.type === "bundle") return "Bundle " + formatMmk(draft.bundlePrice || 0);
    if (draft.type === "flash") return (Number(document.getElementById("flash-percent").value) || 0) + "% OFF";
    const mode = draft.type === "coupon" ? document.getElementById("coupon-mode").value : document.getElementById("discount-mode").value;
    const value = draft.type === "coupon" ? document.getElementById("coupon-value").value : document.getElementById("discount-value").value;
    return mode === "percent" ? value + "% OFF" : formatMmk(Number(value) || 0) + " OFF";
  }

  function renderSummary() {
    readDraftFromForm();
    const count = draft.type === "bogo" ? draft.products.length + draft.rewardProducts.length : draft.products.length;
    document.getElementById("promo-summary").innerHTML =
      "<h2>Live summary</h2>" +
      "<dl class=\"summary-list\">" +
      "<div><dt>Title</dt><dd>" + sanitizeHTML(draft.name || "Untitled campaign") + "</dd></div>" +
      "<div><dt>Type</dt><dd>" + sanitizeHTML(typeMeta(draft.type).label) + "</dd></div>" +
      "<div><dt>Offer</dt><dd>" + sanitizeHTML(benefitText()) + "</dd></div>" +
      "<div><dt>Products</dt><dd>" + count + "</dd></div>" +
      "<div><dt>Validity</dt><dd>" + sanitizeHTML(formatWhen(draft.start) + " — " + formatWhen(draft.end)) + "</dd></div>" +
      "<div><dt>Stacking</dt><dd>" + (draft.stacking ? "Allowed" : "One coupon per cart") + "</dd></div>" +
      "</dl>";
  }

  function showConfig(type) {
    document.querySelectorAll("[data-config]").forEach((panel) => {
      panel.hidden = panel.dataset.config !== type;
    });
    document.getElementById("discount-category-field").hidden = document.getElementById("discount-scope").value !== "category";
    document.getElementById("reward-percent-field").hidden = document.getElementById("reward-benefit").value !== "percent";
    document.getElementById("usage-limit").disabled = document.getElementById("usage-unlimited").checked;
  }

  function renderTypes() {
    document.getElementById("type-grid").innerHTML = TYPES.map((item) => {
      return '<label class="type-card"><input type="radio" name="promo-type" value="' + item.id + '"' + (draft.type === item.id ? " checked" : "") + " /><span>" + item.label + "</span></label>";
    }).join("");
  }

  function fillForm() {
    document.getElementById("form-kicker").textContent = editingId ? "Edit " + editingId : "New campaign";
    document.getElementById("promo-name").value = draft.name;
    document.getElementById("discount-mode").value = draft.mode === "fixed" ? "fixed" : "percent";
    document.getElementById("discount-value").value = draft.type === "discount" ? draft.value : 20;
    document.getElementById("discount-scope").value = draft.scope || "products";
    document.getElementById("discount-category").value = draft.category || "Dresses";
    document.getElementById("coupon-code").value = draft.code || "";
    document.getElementById("coupon-mode").value = draft.type === "coupon" && draft.mode === "fixed" ? "fixed" : "percent";
    document.getElementById("coupon-value").value = draft.type === "coupon" ? draft.value : 15;
    document.getElementById("coupon-min").value = draft.type === "coupon" ? draft.minSpend : 80000;
    document.getElementById("bundle-price").value = draft.bundlePrice || "";
    document.getElementById("buy-qty").value = draft.buyQty || 2;
    document.getElementById("get-qty").value = draft.getQty || 1;
    document.getElementById("reward-benefit").value = draft.reward || "free";
    document.getElementById("reward-percent").value = draft.rewardPercent || 50;
    document.getElementById("ship-min").value = draft.type === "shipping" ? draft.value : 50000;
    document.getElementById("ship-zone").value = draft.zone || "Yangon";
    document.getElementById("flash-title").value = draft.type === "flash" ? draft.name : "";
    document.getElementById("flash-percent").value = draft.type === "flash" ? draft.value : 30;
    document.getElementById("flash-cap").value = draft.cap || 20;
    document.getElementById("promo-start-date").value = draft.start || "";
    document.getElementById("promo-end-date").value = draft.end || "";
    document.getElementById("usage-unlimited").checked = !!draft.unlimited || !draft.limit;
    document.getElementById("usage-limit").value = draft.limit || 100;
    document.getElementById("usage-customer").value = draft.perCustomer || 1;
    document.getElementById("usage-min").value = draft.minSpend || 0;
    document.getElementById("stacking").checked = !!draft.stacking;
    renderTypes();
    showConfig(draft.type);
    refreshDerived();
  }

  function refreshDerived() {
    document.getElementById("discount-picked").textContent = draft.products.length + " products selected";
    document.getElementById("flash-picked").textContent = draft.products.length + " products selected";
    document.getElementById("bogo-picked").textContent = "Buy items " + draft.products.length + " · Reward items " + draft.rewardProducts.length;
    const original = draft.products.reduce((sum, id) => sum + (productById(id) ? productById(id).price : 0), 0);
    document.getElementById("bundle-original").textContent = formatMmk(original);
    const savings = Math.max(0, original - (Number(document.getElementById("bundle-price").value) || 0));
    document.getElementById("bundle-savings").textContent = formatMmk(original ? savings : 0);
    document.getElementById("bundle-list").innerHTML = draft.products.map((id) => {
      const item = productById(id);
      return item ? "<li><span>" + sanitizeHTML(item.name) + "</span><span class=\"num\">" + formatMmk(item.price) + "</span></li>" : "";
    }).join("");
    const ship = checkFreeShippingEligibility(SAMPLE_CART, Number(document.getElementById("ship-min").value) || 0);
    document.getElementById("ship-preview").textContent = ship.message;
    const end = document.getElementById("promo-end-date").value;
    document.getElementById("flash-preview-clock").textContent = end ? syncCountdownTimer(end) : "00:00:00";
    scheduleDiscount();
    renderSummary();
  }

  function scheduleDiscount(force) {
    const start = document.getElementById("promo-start-date").value;
    const end = document.getElementById("promo-end-date").value;
    const missing = !start || !end;
    const orderBad = !!start && !!end && new Date(end) <= new Date(start);
    const show = orderBad || (force && missing);
    document.getElementById("start-field").classList.toggle("is-invalid", show && !start);
    document.getElementById("end-field").classList.toggle("is-invalid", show && (!end || orderBad));
    document.getElementById("date-error").hidden = !show;
    document.getElementById("date-error").textContent = orderBad ? "End date must be later than the start date." : "Start and end dates are required.";
    return { ok: !missing && !orderBad, start: start, end: end };
  }

  function generateCouponCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(6);
    window.crypto.getRandomValues(bytes);
    let code = "STYLX-";
    bytes.forEach((value) => {
      code += alphabet[value % alphabet.length];
    });
    return code;
  }

  function validateCoupon(code, spend) {
    if (!/^[A-Z0-9-]{6,24}$/.test(code)) return { ok: false, error: "Use 6–24 letters, numbers, or hyphens." };
    if (!(spend >= 0)) return { ok: false, error: "Enter a minimum spend of 0 or more." };
    return { ok: true };
  }

  function calculateBundlePrice(ids, special) {
    const original = ids.reduce((sum, id) => sum + (productById(id) ? productById(id).price : 0), 0);
    const price = Number(special) || 0;
    return { original: original, special: price, savings: Math.max(0, original - price) };
  }

  function createBundle() {
    return calculateBundlePrice(draft.products, draft.bundlePrice);
  }

  function validateBuyXGetYLogic(buy, get, triggers, rewards) {
    if (!(buy >= 1) || !(get >= 1)) return { ok: false, error: "Buy and get quantities must be at least 1." };
    if (!triggers.length || !rewards.length) return { ok: false, error: "Select both a trigger item and a reward item." };
    return { ok: true };
  }

  function checkFreeShippingEligibility(cart, threshold) {
    const remaining = Math.max(0, threshold - cart);
    if (remaining === 0) return { eligible: true, remaining: 0, message: "This cart qualifies for free shipping." };
    return { eligible: false, remaining: remaining, message: "Add " + formatMmk(remaining) + " more to get free shipping." };
  }

  function applyProductDiscount(ids) {
    draft.products = ids.slice();
    return draft.products.length;
  }

  function startFlashSale() {
    draft.type = "flash";
    return { title: draft.name, percent: draft.value, products: draft.products.slice() };
  }

  function openForm(campaign) {
    Object.keys(draft).forEach((key) => delete draft[key]);
    Object.assign(draft, blankDraft(), campaign || {});
    if (campaign) {
      draft.products = (campaign.products || []).slice();
      draft.rewardProducts = (campaign.rewardProducts || []).slice();
    }
    editingId = campaign ? campaign.id : null;
    fillForm();
    showView("form");
  }

  function collectCampaign(status) {
    readDraftFromForm();
    const dates = scheduleDiscount(true);
    if (!dates.ok) return null;
    if (!draft.name.trim()) {
      window.showToast("Add a campaign title.");
      return null;
    }
    if (draft.type === "coupon") {
      const check = validateCoupon(draft.code, draft.minSpend);
      const error = document.getElementById("coupon-error");
      error.hidden = check.ok;
      error.textContent = check.error || "";
      if (!check.ok) return null;
    }
    if (draft.type === "bogo") {
      const check = validateBuyXGetYLogic(draft.buyQty, draft.getQty, draft.products, draft.rewardProducts);
      const error = document.getElementById("bogo-error");
      error.hidden = check.ok;
      error.textContent = check.error || "";
      if (!check.ok) return null;
    }
    if (draft.type === "bundle" && draft.products.length < 2) {
      window.showToast("Select at least two bundle products.");
      return null;
    }
    const now = Date.now();
    const startTime = new Date(draft.start).getTime();
    const endTime = new Date(draft.end).getTime();
    const computed = status === "Scheduled" && startTime > now ? "Scheduled" : endTime < now ? "Expired" : startTime > now ? "Scheduled" : "Active";
    return {
      id: editingId || "PRM-" + String(1100 + campaigns.length),
      name: draft.name.trim(),
      code: draft.type === "coupon" ? draft.code : "",
      type: draft.type,
      benefit: benefitText(),
      mode: draft.type === "bogo" ? draft.reward : draft.mode,
      value: draft.type === "bundle" ? draft.bundlePrice : draft.type === "shipping" ? draft.minSpend : draft.value,
      start: draft.start,
      end: draft.end,
      used: editingId ? (campaigns.find((item) => item.id === editingId) || {}).used || 0 : 0,
      limit: draft.unlimited ? 0 : draft.limit,
      revenue: editingId ? (campaigns.find((item) => item.id === editingId) || {}).revenue || 0 : 0,
      discountGiven: editingId ? (campaigns.find((item) => item.id === editingId) || {}).discountGiven || 0 : 0,
      status: status === "Scheduled" ? "Scheduled" : computed,
      products: draft.products.slice(),
      rewardProducts: draft.rewardProducts.slice(),
      minSpend: draft.minSpend,
      perCustomer: draft.perCustomer,
      stacking: draft.stacking,
      zone: draft.zone,
      cap: draft.cap,
      buyQty: draft.buyQty,
      getQty: draft.getQty,
      scope: draft.scope,
      category: draft.category,
    };
  }

  function saveCampaign(status) {
    const next = collectCampaign(status);
    if (!next) return;
    const index = campaigns.findIndex((item) => item.id === next.id);
    if (index >= 0) campaigns[index] = next;
    else campaigns.unshift(next);
    if (next.type === "flash") startFlashSale();
    editingId = null;
    showView("dashboard");
    refreshDashboard(true);
    window.showToast(status === "Scheduled" ? "Draft saved." : "Campaign published.");
  }

  function filteredProducts() {
    const text = pickerQuery.trim().toLowerCase();
    return catalog.filter((item) => {
      if (pickerCategory !== "all" && item.category !== pickerCategory) return false;
      if (!text) return true;
      return item.name.toLowerCase().includes(text) || item.sku.toLowerCase().includes(text);
    });
  }

  function renderPicker() {
    const view = pageSlice(filteredProducts(), pickerPage, pickerSize);
    pickerPage = view.page;
    document.getElementById("picker-table").innerHTML = view.rows.map((item) => {
      return "<tr><td><input type=\"checkbox\" data-product=\"" + item.id + "\"" + (pickerSet.has(item.id) ? " checked" : "") + " aria-label=\"Select " + sanitizeHTML(item.name) + "\" /></td>" +
        "<td><span class=\"mini-thumb\" aria-hidden=\"true\"></span><strong>" + sanitizeHTML(item.name) + "</strong></td>" +
        "<td class=\"num\">" + item.sku + "</td><td class=\"num\">" + item.stock + "</td><td class=\"num\">" + formatMmk(item.price) + "</td></tr>";
    }).join("") || '<tr><td colspan="5"><div class="empty-state is-compact"><h2>No products</h2><p>Try another name or category.</p></div></td></tr>';
    document.getElementById("picker-count").textContent = pickerSet.size + " products selected";
    renderPager(document.getElementById("picker-pager"), view.page, view.pages, view.total, pickerSize, view.start, "products", (kind, value) => {
      if (kind === "size") {
        pickerSize = value;
        pickerPage = 1;
      } else if (value === "prev") pickerPage -= 1;
      else if (value === "next") pickerPage += 1;
      else pickerPage = Number(value);
      document.getElementById("picker-table").innerHTML = skeletonRows(5);
      showLoader(renderPicker);
    });
  }

  function openPicker(mode) {
    pickerMode = mode;
    const source = mode === "reward" ? draft.rewardProducts : draft.products;
    pickerSet = new Set(source);
    pickerPage = 1;
    document.getElementById("picker-title").textContent = mode === "reward" ? "Select reward item" : mode === "trigger" ? "Select trigger items" : "Select products";
    document.getElementById("product-modal").hidden = false;
    renderPicker();
    if (window.lucide) window.lucide.createIcons();
  }

  function closePicker() {
    document.getElementById("product-modal").hidden = true;
  }

  function generatePromoReport() {
    const header = ["id", "name", "type", "benefit", "status", "used", "revenue", "discountGiven"];
    const lines = [header.join(",")];
    campaigns.forEach((item) => {
      lines.push(header.map((key) => '"' + String(item[key] == null ? "" : item[key]).replace(/"/g, '""') + '"').join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stylex-promotions.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    window.showToast("Promo report downloaded.");
  }

  document.getElementById("type-grid").addEventListener("change", (event) => {
    if (!event.target.matches("[name=promo-type]")) return;
    draft.type = event.target.value;
    showConfig(draft.type);
    renderSummary();
  });

  const onFormEdit = debounce(() => {
    if (document.getElementById("view-promo-form").hidden) return;
    showConfig(draft.type);
    refreshDerived();
  }, 300);
  document.getElementById("view-promo-form").addEventListener("input", onFormEdit);
  document.getElementById("view-promo-form").addEventListener("change", onFormEdit);

  document.getElementById("promo-search").addEventListener("input", debounce((event) => {
    query = event.target.value;
    page = 1;
    refreshDashboard(true);
  }, 300));

  document.getElementById("promo-type-filter").addEventListener("change", (event) => {
    typeFilter = event.target.value;
    page = 1;
    refreshDashboard(true);
  });

  document.getElementById("promo-status-tabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-status]");
    if (!button) return;
    statusFilter = button.dataset.status;
    page = 1;
    document.querySelectorAll("#promo-status-tabs button").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    refreshDashboard(true);
  });

  function resetFilters() {
    query = "";
    typeFilter = "all";
    statusFilter = "all";
    page = 1;
    document.getElementById("promo-search").value = "";
    document.getElementById("promo-type-filter").value = "all";
    document.querySelectorAll("#promo-status-tabs button").forEach((item) => {
      item.setAttribute("aria-pressed", String(item.dataset.status === "all"));
    });
    refreshDashboard(true);
  }

  document.getElementById("reset-filters").addEventListener("click", resetFilters);
  document.getElementById("promo-table").addEventListener("click", (event) => {
    if (event.target.id === "empty-reset") resetFilters();
  });

  document.getElementById("create-promo").addEventListener("click", () => openForm(null));
  document.getElementById("back-promos").addEventListener("click", () => {
    showView("dashboard");
    refreshDashboard(false);
  });
  document.getElementById("save-draft").addEventListener("click", () => withButtonLoading(document.getElementById("save-draft"), () => saveCampaign("Scheduled")));
  document.getElementById("publish-campaign").addEventListener("click", () => withButtonLoading(document.getElementById("publish-campaign"), () => saveCampaign("Active")));
  document.getElementById("export-promo").addEventListener("click", () => withButtonLoading(document.getElementById("export-promo"), generatePromoReport));
  document.getElementById("generate-code").addEventListener("click", () => {
    withButtonLoading(document.getElementById("generate-code"), () => {
      document.getElementById("coupon-code").value = generateCouponCode();
      renderSummary();
      window.showToast("Secure code generated.");
    });
  });

  document.body.addEventListener("click", (event) => {
    const copy = event.target.closest("[data-copy]");
    if (copy) {
      const code = copy.dataset.copy;
      if (navigator.clipboard) navigator.clipboard.writeText(code);
      window.showToast(code + " copied.");
      return;
    }
    const edit = event.target.closest("[data-edit]");
    if (edit) {
      openForm(campaigns.find((item) => item.id === edit.dataset.edit));
      return;
    }
    const duplicate = event.target.closest("[data-copy-row]");
    if (duplicate) {
      withButtonLoading(duplicate, () => {
        const source = campaigns.find((item) => item.id === duplicate.dataset.copyRow);
        const copyItem = Object.assign({}, source, {
          id: "PRM-" + String(1200 + campaigns.length),
          name: source.name + " Copy",
          code: source.code ? generateCouponCode() : "",
          status: "Scheduled",
          used: 0,
          revenue: 0,
          discountGiven: 0,
          products: (source.products || []).slice(),
        });
        campaigns.unshift(copyItem);
        refreshDashboard(true);
        window.showToast("Campaign duplicated.");
      });
      return;
    }
    const stop = event.target.closest("[data-stop]");
    if (stop) {
      withButtonLoading(stop, () => {
        const item = campaigns.find((entry) => entry.id === stop.dataset.stop);
        if (item) item.status = "Expired";
        refreshDashboard(true);
        window.showToast("Campaign deactivated.");
      });
      return;
    }
    const pick = event.target.closest("[data-pick]");
    if (pick) openPicker(pick.dataset.pick);
  });

  document.getElementById("manage-flash").addEventListener("click", () => {
    const item = campaigns.find((entry) => entry.id === document.getElementById("manage-flash").dataset.id);
    if (item) openForm(item);
  });
  document.getElementById("end-flash").addEventListener("click", () => {
    withButtonLoading(document.getElementById("end-flash"), () => {
      const item = campaigns.find((entry) => entry.id === document.getElementById("end-flash").dataset.id);
      if (item) item.status = "Expired";
      refreshDashboard(true);
      window.showToast("Flash sale ended.");
    });
  });

  document.getElementById("picker-search").addEventListener("input", debounce((event) => {
    pickerQuery = event.target.value;
    pickerPage = 1;
    renderPicker();
  }, 300));
  document.getElementById("picker-category").addEventListener("change", (event) => {
    pickerCategory = event.target.value;
    pickerPage = 1;
    renderPicker();
  });
  document.getElementById("picker-table").addEventListener("change", (event) => {
    const box = event.target.closest("[data-product]");
    if (!box) return;
    if (box.checked) pickerSet.add(box.dataset.product);
    else pickerSet.delete(box.dataset.product);
    document.getElementById("picker-count").textContent = pickerSet.size + " products selected";
  });
  document.getElementById("confirm-products").addEventListener("click", () => {
    withButtonLoading(document.getElementById("confirm-products"), () => {
      const ids = Array.from(pickerSet);
      if (pickerMode === "reward") draft.rewardProducts = ids;
      else applyProductDiscount(ids);
      if (draft.type === "bundle") createBundle();
      closePicker();
      refreshDerived();
      window.showToast(ids.length + " products selected.");
    });
  });
  document.querySelectorAll("[data-close-picker]").forEach((button) => button.addEventListener("click", closePicker));
  document.getElementById("product-modal").addEventListener("click", (event) => {
    if (event.target.id === "product-modal") closePicker();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.getElementById("product-modal").hidden) closePicker();
  });

  document.addEventListener("stylex-theme", () => {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    renderChart();
  });

  window.applyProductDiscount = applyProductDiscount;
  window.scheduleDiscount = scheduleDiscount;
  window.generateCouponCode = generateCouponCode;
  window.validateCoupon = validateCoupon;
  window.createBundle = createBundle;
  window.calculateBundlePrice = calculateBundlePrice;
  window.validateBuyXGetYLogic = validateBuyXGetYLogic;
  window.checkFreeShippingEligibility = checkFreeShippingEligibility;
  window.startFlashSale = startFlashSale;
  window.syncCountdownTimer = syncCountdownTimer;
  window.trackPromoUsage = trackPromoUsage;
  window.generatePromoReport = generatePromoReport;
  window.withButtonLoading = withButtonLoading;
  window.debounce = debounce;
  window.sanitizeHTML = sanitizeHTML;

  renderTypes();
  refreshDashboard(false);
  window.setInterval(() => {
    renderFlash();
    document.querySelectorAll("[data-countdown]").forEach((node) => {
      node.textContent = syncCountdownTimer(node.dataset.countdown);
    });
    if (!document.getElementById("view-promo-form").hidden && draft.type === "flash") {
      document.getElementById("flash-preview-clock").textContent = syncCountdownTimer(document.getElementById("promo-end-date").value);
    }
  }, 1000);
  if (window.lucide) window.lucide.createIcons();
})();
