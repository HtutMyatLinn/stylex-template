(function () {
  const PAGE_SIZE = 10;

  window.pageRows = function (items, page) {
    const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const current = Math.min(Math.max(1, page || 1), pages);
    const start = (current - 1) * PAGE_SIZE;
    return { page: current, pages: pages, rows: items.slice(start, start + PAGE_SIZE) };
  };

  function pagerItems(page, pages) {
    const list = [];
    if (pages <= 6) {
      for (let index = 1; index <= pages; index += 1) list.push(index);
      return list;
    }
    if (page <= 4) {
      for (let index = 1; index <= 4; index += 1) list.push(index);
      list.push("gap", pages);
      return list;
    }
    if (page >= pages - 3) {
      list.push(1, "gap");
      for (let index = pages - 3; index <= pages; index += 1) list.push(index);
      return list;
    }
    list.push(1, "gap", page - 1, page, page + 1, "gap", pages);
    return list;
  }

  window.renderPager = function (container, page, pages, label) {
    if (!container) return;
    const atStart = page <= 1;
    const atEnd = page >= pages;
    let markup = label ? '<span class="pager-count">' + label + "</span>" : "";
    markup += '<button type="button" data-page="first"' + (atStart ? " disabled" : "") + ">« First</button>";
    markup += '<button type="button" data-page="prev"' + (atStart ? " disabled" : "") + ">&lt; Back</button>";
    pagerItems(page, pages).forEach((item) => {
      if (item === "gap") {
        markup += '<span class="pager-gap" aria-hidden="true">…</span>';
        return;
      }
      markup += '<button type="button" data-page="' + item + '"' + (item === page ? ' aria-current="page"' : "") + ">" + item + "</button>";
    });
    markup += '<button type="button" data-page="next"' + (atEnd ? " disabled" : "") + ">Next &gt;</button>";
    markup += '<button type="button" data-page="last"' + (atEnd ? " disabled" : "") + ">Last »</button>";
    container.innerHTML = markup;
  };

  window.turnPage = function (page, pages, action) {
    if (action === "first") return 1;
    if (action === "prev") return Math.max(1, page - 1);
    if (action === "next") return Math.min(pages, page + 1);
    if (action === "last") return pages;
    const next = Number(action);
    if (!Number.isFinite(next)) return page;
    return Math.min(Math.max(1, next), pages);
  };

  window.emptyState = function (icon, title, text, compact) {
    return (
      '<div class="empty-state' + (compact ? " is-compact" : "") + '">' +
        '<span class="empty-orb" aria-hidden="true"><i class="' + escapeHtml(icon) + '"></i></span>' +
        "<h2>" + escapeHtml(title) + "</h2>" +
        "<p>" + escapeHtml(text) + "</p>" +
      "</div>"
    );
  };

  let toastTimer = 0;
  let toastHideTimer = 0;

  window.showToast = function (message) {
    let node = document.getElementById("toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "toast";
      node.className = "toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      node.hidden = true;
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.hidden = false;
    window.requestAnimationFrame(() => node.classList.add("is-on"));
    window.clearTimeout(toastTimer);
    window.clearTimeout(toastHideTimer);
    toastTimer = window.setTimeout(() => {
      node.classList.remove("is-on");
      toastHideTimer = window.setTimeout(() => {
        node.hidden = true;
      }, 200);
    }, 2000);
  };

  window.runWithLoading = function (button, task) {
    if (!button || button.classList.contains("is-loading") || button.disabled) return;
    button.classList.add("is-loading");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    window.setTimeout(() => {
      try {
        task();
      } finally {
        if (button.isConnected) {
          button.classList.remove("is-loading");
          button.disabled = false;
          button.removeAttribute("aria-busy");
        }
      }
    }, 700);
  };

  window.skeletonBone = function (options) {
    const opts = options || {};
    const width = opts.width || "100%";
    const height = opts.height || "12px";
    const radius = opts.radius || "6px";
    const extra = opts.className ? " " + opts.className : "";
    return (
      '<span class="sk' +
      extra +
      '" style="width:' +
      width +
      ";height:" +
      height +
      ";border-radius:" +
      radius +
      '" aria-hidden="true"></span>'
    );
  };

  window.skeletonRows = function (columns, rows) {
    const cols = Math.max(1, columns || 5);
    const count = Math.max(1, rows || 6);
    let html = "";
    for (let row = 0; row < count; row += 1) {
      html += '<tr class="sk-row">';
      for (let cell = 0; cell < cols; cell += 1) {
        const width =
          cell === 0 ? "74%" : cell === cols - 1 ? "46%" : 54 + ((row + cell) % 4) * 10 + "%";
        html += "<td>" + window.skeletonBone({ width: width, height: "14px" }) + "</td>";
      }
      html += "</tr>";
    }
    return html;
  };

  window.skeletonCards = function (count, variant) {
    const total = Math.max(1, count || 6);
    const kind = variant || "media";
    let html = '<div class="sk-cards" aria-hidden="true">';
    for (let index = 0; index < total; index += 1) {
      html += '<article class="sk-card">';
      if (kind === "media") {
        html += window.skeletonBone({ height: "140px", radius: "14px" });
        html += window.skeletonBone({ width: "78%", height: "12px" });
        html += window.skeletonBone({ width: "52%", height: "10px" });
      } else {
        html += window.skeletonBone({ width: "64%", height: "14px", className: "sk-title" });
        html += window.skeletonBone({ width: "88%", height: "10px" });
        html += window.skeletonBone({ width: "40%", height: "10px" });
      }
      html += "</article>";
    }
    html += "</div>";
    return html;
  };

  window.skeletonFeed = function (count) {
    const total = Math.max(1, count || 4);
    let html = '<div class="sk-feed" aria-hidden="true">';
    for (let index = 0; index < total; index += 1) {
      html +=
        '<div class="sk-feed-item">' +
        window.skeletonBone({ width: "36px", height: "36px", radius: "50%", className: "sk-avatar" }) +
        '<div style="display:grid;gap:8px;width:100%">' +
        window.skeletonBone({ width: 70 - (index % 3) * 10 + "%", height: "12px" }) +
        window.skeletonBone({ width: 48 + (index % 2) * 12 + "%", height: "10px" }) +
        "</div></div>";
    }
    html += "</div>";
    return html;
  };

  window.runWithSkeleton = function (target, render, options) {
    const opts = options || {};
    if (typeof render !== "function") return;
    if (!target) {
      render();
      return;
    }
    const delay = opts.delay != null ? opts.delay : 420;
    const mode = opts.mode || "table";
    const columns = opts.columns || Number(target.getAttribute("data-sk-columns")) || 5;
    const rows = opts.rows || Number(target.getAttribute("data-sk-rows")) || 6;
    target.setAttribute("aria-busy", "true");
    if (mode === "table") target.innerHTML = window.skeletonRows(columns, rows);
    else if (mode === "cards") target.innerHTML = window.skeletonCards(rows, opts.variant);
    else if (mode === "feed") target.innerHTML = window.skeletonFeed(rows);
    else if (typeof opts.html === "string") target.innerHTML = opts.html;
    window.setTimeout(() => {
      try {
        render();
      } finally {
        if (target.isConnected) target.removeAttribute("aria-busy");
      }
    }, delay);
  };

  const readyQueue = [];
  let pageReady = !document.documentElement.classList.contains("is-booting");

  window.whenPageReady = function (task) {
    if (typeof task !== "function") return;
    if (pageReady) {
      window.requestAnimationFrame(() => task());
      return;
    }
    readyQueue.push(task);
  };

  function flushPageReady() {
    pageReady = true;
    const tasks = readyQueue.splice(0, readyQueue.length);
    window.requestAnimationFrame(() => {
      tasks.forEach((task) => {
        try {
          task();
        } catch (error) {}
      });
      document.dispatchEvent(new CustomEvent("stylex-ready"));
    });
  }

  window.revealPage = function () {
    const root = document.documentElement;
    if (!root.classList.contains("is-booting")) {
      if (window.StylexSkeleton) window.StylexSkeleton.clear();
      if (!pageReady) flushPageReady();
      return;
    }
    const started = Number(root.dataset.bootAt || Date.now());
    const wait = Math.max(0, 520 - (Date.now() - started));
    window.setTimeout(() => {
      root.classList.add("is-ready");
      root.classList.remove("is-booting");
      if (window.StylexSkeleton) window.StylexSkeleton.clear();
      flushPageReady();
      window.setTimeout(() => root.classList.remove("is-ready"), 400);
    }, wait);
  };

  if (window.StylexSkeleton) window.StylexSkeleton.mount();

  window.setTimeout(() => {
    if (window.revealPage) window.revealPage();
  }, 0);

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  const COLORS = {
    get white() { return cssVar("--color-white"); },
    get paper() { return cssVar("--color-bg-light"); },
    get line() { return cssVar("--color-border"); },
    get ink() { return cssVar("--color-black"); },
    get red() { return cssVar("--color-red"); },
  };

  const THEME_KEY = "stylex-theme";

  function storedTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || "light";
    } catch (error) {
      return "light";
    }
  }

  function resolveTheme(theme) {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    const choice = theme === "dark" || theme === "system" || theme === "light" ? theme : "light";
    const dark = resolveTheme(choice) === "dark";
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    document.documentElement.dataset.themeChoice = choice;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0d0d0d" : "#f7f6f4");
    const themeSwitch = document.getElementById("theme-switch");
    const themeLabel = document.getElementById("theme-switch-label");
    if (themeSwitch) {
      themeSwitch.setAttribute("aria-checked", String(dark));
      themeSwitch.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
    if (themeLabel) themeLabel.textContent = dark ? "Dark theme" : "Light theme";
    document.dispatchEvent(new CustomEvent("stylex-theme"));
  }

  window.applyStylexTheme = applyTheme;

  function closeAccountMenu() {
    const toggle = document.getElementById("account-toggle");
    const menu = document.getElementById("account-dropdown");
    if (!toggle || !menu) return;
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  const accountToggle = document.getElementById("account-toggle");
  const accountMenu = document.getElementById("account-dropdown");
  const themeSwitch = document.getElementById("theme-switch");
  const logoutButton = document.getElementById("logout-button");
  const languageGroup = document.querySelector(".lang-pills");
  applyTheme(storedTheme());
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (storedTheme() === "system") applyTheme("system");
  });
  if (accountToggle && accountMenu) {
    accountToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = accountMenu.hidden;
      accountMenu.hidden = !open;
      accountToggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (event) => {
      if (accountToggle.contains(event.target) || accountMenu.contains(event.target)) return;
      closeAccountMenu();
    });
  }
  if (themeSwitch) {
    themeSwitch.addEventListener("click", (event) => {
      event.stopPropagation();
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (error) {}
      applyTheme(next);
    });
  }
  if (languageGroup) {
    const LANG_KEY = "stylex-lang";
    let storedLang = "en";
    try {
      storedLang = localStorage.getItem(LANG_KEY) || "en";
    } catch (error) {}
    languageGroup.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === storedLang));
    });
    languageGroup.addEventListener("click", (event) => {
      const button = event.target.closest("[data-lang]");
      if (!button) return;
      event.stopPropagation();
      languageGroup.querySelectorAll("[data-lang]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      try {
        localStorage.setItem(LANG_KEY, button.dataset.lang);
      } catch (error) {}
      document.dispatchEvent(new CustomEvent("stylex-lang", { detail: button.dataset.lang }));
    });
  }
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      closeAccountMenu();
      window.showToast("Signed out.");
    });
  }

  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");
  const scrim = document.getElementById("scrim");
  const SIDEBAR_KEY = "stylex-sidebar";
  const sidebarCollapse = document.getElementById("sidebar-collapse");
  const sidebarMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let sidebarMotionTimer = 0;

  function beginSidebarMotion() {
    if (!sidebar || sidebarMotion.matches) return;
    sidebar.classList.add("is-animating");
    window.clearTimeout(sidebarMotionTimer);
    sidebarMotionTimer = window.setTimeout(() => {
      sidebar.classList.remove("is-animating");
    }, 450);
  }

  if (sidebar) {
    sidebar.addEventListener("transitionend", (event) => {
      if (event.target !== sidebar || event.propertyName !== "width") return;
      sidebar.classList.remove("is-animating");
      window.clearTimeout(sidebarMotionTimer);
    });
  }

  function setSidebarCollapsed(collapsed, animate) {
    if (!sidebar) return;
    if (animate) beginSidebarMotion();
    sidebar.classList.toggle("is-collapsed", collapsed);
    if (collapsed) document.documentElement.setAttribute("data-sidebar", "collapsed");
    else document.documentElement.removeAttribute("data-sidebar");
    if (sidebarCollapse) {
      sidebarCollapse.setAttribute("aria-expanded", String(!collapsed));
      sidebarCollapse.setAttribute("aria-label", collapsed ? "Open sidebar" : "Close sidebar");
    }
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? "collapsed" : "open");
    } catch (error) {}
  }

  if (sidebarCollapse) {
    sidebarCollapse.addEventListener("click", () => {
      const collapsed = sidebar.classList.contains("is-collapsed") || document.documentElement.getAttribute("data-sidebar") === "collapsed";
      setSidebarCollapsed(!collapsed, true);
    });
  }

  const brandRow = sidebar && sidebar.querySelector(".brand-row");
  if (brandRow) {
    brandRow.addEventListener("mouseleave", () => {
      const collapsed = sidebar.classList.contains("is-collapsed") || document.documentElement.getAttribute("data-sidebar") === "collapsed";
      if (!collapsed) return;
      const active = document.activeElement;
      if (active && brandRow.contains(active)) active.blur();
    });
  }
  if (document.documentElement.getAttribute("data-sidebar") === "collapsed") {
    setSidebarCollapsed(true);
  }

  function setSidebar(open) {
    if (!sidebar || !menuToggle || !scrim) return;
    sidebar.classList.toggle("is-open", open);
    scrim.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
  }

  (function initMobileNavScroll() {
  const mobileNav = document.getElementById("mobile-floating-nav");
  if (!mobileNav) return;
  let lastScrollY = window.scrollY;
  const scrollThreshold = 8;
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY <= 20) {
      mobileNav.classList.remove("nav-hidden");
      lastScrollY = currentScrollY;
      return;
    }
    if (Math.abs(currentScrollY - lastScrollY) < scrollThreshold) return;
    if (currentScrollY > lastScrollY) mobileNav.classList.add("nav-hidden");
    else mobileNav.classList.remove("nav-hidden");
    lastScrollY = currentScrollY;
  }, { passive: true });
})();

const moreToggle = document.getElementById("mobile-more-toggle");
const moreSheet = document.getElementById("mobile-more");
if (moreToggle && moreSheet) {
  moreToggle.addEventListener("click", () => {
    const open = moreSheet.hidden;
    moreSheet.hidden = !open;
    moreToggle.setAttribute("aria-expanded", String(open));
  });
}

const statusDate = document.getElementById("status-date");
if (statusDate) {
  statusDate.textContent = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

if (menuToggle && scrim && sidebar) {
    menuToggle.addEventListener("click", () => {
      setSidebar(!sidebar.classList.contains("is-open"));
    });
    scrim.addEventListener("click", () => setSidebar(false));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) setSidebar(false);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setSidebar(false);
    closeAccountMenu();
    if (document.body.dataset.page === "dashboard") closeNotifications();
  });

  const selectValue = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
  const selectIndex = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "selectedIndex");
  let openSelect = null;
  bootThemeSelects();
  bootMobileTables();

  if (document.body.dataset.page !== "dashboard") return;

  const STATUS_KEYS = ["pending", "processing", "shipped", "completed", "cancelled"];

  const PERIODS = {
    today: {
      orders: 46,
      items: 71,
      aov: 214,
      gross: 9844,
      fees: 591,
      refunds: 0,
      net: 9253,
      trends: { orders: 18.4, items: 9.2, aov: -3.1, gross: 14.6 },
      statuses: { pending: 8, processing: 11, shipped: 9, completed: 16, cancelled: 2 },
      shape: [0.08, 0.12, 0.18, 0.22, 0.24, 0.16],
      span: 1,
    },
    week: {
      orders: 312,
      items: 804,
      aov: 198,
      gross: 61776,
      fees: 3707,
      refunds: 1280,
      net: 56789,
      trends: { orders: 6.4, items: 4.8, aov: 1.2, gross: 7.7 },
      statuses: { pending: 24, processing: 48, shipped: 70, completed: 158, cancelled: 12 },
      shape: [0.1, 0.12, 0.14, 0.16, 0.18, 0.17, 0.13],
      span: 7,
    },
    month: {
      orders: 1284,
      items: 3460,
      aov: 186,
      gross: 238824,
      fees: 14329,
      refunds: 6420,
      net: 218075,
      trends: { orders: 12.4, items: 8.1, aov: -2.4, gross: 6.2 },
      statuses: { pending: 64, processing: 140, shipped: 286, completed: 742, cancelled: 52 },
      shape: [0.11, 0.13, 0.12, 0.15, 0.14, 0.2, 0.15],
      span: 30,
    },
  };

  const products = [
    { productId: "STX-0984", name: "Cigarette Trouser, Black", stock: 0 },
    { productId: "STX-1048", name: "Ivory Silk Column Dress", stock: 2 },
    { productId: "STX-1102", name: "Noir Tailored Wool Blazer", stock: 3 },
    { productId: "STX-1188", name: "Sculpt Leather Ankle Boot", stock: 4 },
    { productId: "STX-1214", name: "Cashmere Funnel Coat", stock: 6 },
    { productId: "STX-1306", name: "Pleated Satin Midi Skirt", stock: 8 },
    { productId: "STX-1410", name: "Gold-Hardware Mini Bag", stock: 9 },
    { productId: "STX-1522", name: "Merino Fine-Knit Polo", stock: 11 },
    { productId: "STX-1601", name: "Organza Evening Shirt", stock: 14 },
    { productId: "STX-1719", name: "Wide-Leg Trouser, Chalk", stock: 18 },
    { productId: "STX-1804", name: "Suede Loafer, Espresso", stock: 24 },
  ];

  const reviews = [
    { reviewerName: "Amelia Cho", rating: 5, productName: "Ivory Silk Column Dress", comment: "The drape is exacting. It arrived pressed and photographed exactly as it hangs.", date: daysAgo(1) },
    { reviewerName: "Jonah Ellis", rating: 4, productName: "Noir Tailored Wool Blazer", comment: "Shoulder line is sharp. Sleeves ran a touch long for me.", date: daysAgo(2) },
    { reviewerName: "Sofia Marchetti", rating: 5, productName: "Cashmere Funnel Coat", comment: "Weight is perfect for the city. The camel tone reads richer in person.", date: daysAgo(2) },
    { reviewerName: "Leo Park", rating: 3, productName: "Sculpt Leather Ankle Boot", comment: "Beautiful last, but the leather needed a longer break-in than expected.", date: daysAgo(4) },
    { reviewerName: "Priya Nair", rating: 5, productName: "Pleated Satin Midi Skirt", comment: "The pleats hold their shape. Easily the piece I reach for first.", date: daysAgo(5) },
    { reviewerName: "Elena Voss", rating: 4, productName: "Gold-Hardware Mini Bag", comment: "Hardware is substantial and the strap sits cleanly on the shoulder.", date: daysAgo(6) },
  ];

  const followers = [
    { avatar: "MC", userName: "Mina Chen", userId: "@mina.chen", followedDate: daysAgo(0) },
    { avatar: "OR", userName: "Omar Rahman", userId: "@omar.rahman", followedDate: daysAgo(0) },
    { avatar: "CL", userName: "Clara Lind", userId: "@clara.lind", followedDate: daysAgo(1) },
    { avatar: "JM", userName: "Jules Moreau", userId: "@jules.moreau", followedDate: daysAgo(1) },
    { avatar: "HK", userName: "Hana Kato", userId: "@hana.kato", followedDate: daysAgo(2) },
    { avatar: "SB", userName: "Soren Blake", userId: "@soren.blake", followedDate: daysAgo(3) },
    { avatar: "AN", userName: "Ayo Nwosu", userId: "@ayo.nwosu", followedDate: daysAgo(4) },
    { avatar: "EP", userName: "Eva Petrov", userId: "@eva.petrov", followedDate: daysAgo(5) },
  ];

  const notifications = [
    { id: "ntf-8942", type: "order", orderId: "STX-8942", message: "Order #STX-8942 was placed for the Ivory Silk Column Dress.", date: minutesAgo(2), isRead: false },
    { id: "ntf-8940", type: "order", orderId: "STX-8940", message: "Order #STX-8940 moved to Processing.", date: minutesAgo(26), isRead: false },
    { id: "ntf-stock", type: "system", message: "Cigarette Trouser, Black is now out of stock.", date: minutesAgo(48), isRead: false },
    { id: "ntf-review", type: "system", message: "Amelia Cho left a 5-star review on Ivory Silk Column Dress.", date: minutesAgo(180), isRead: false },
    { id: "ntf-8931", type: "order", orderId: "STX-8931", message: "Order #STX-8931 was shipped.", date: minutesAgo(300), isRead: true },
    { id: "ntf-fee", type: "system", message: "November platform fee statement is ready to view.", date: minutesAgo(1200), isRead: true },
    { id: "ntf-8922", type: "order", orderId: "STX-8922", message: "Order #STX-8922 was cancelled by the buyer.", date: minutesAgo(1560), isRead: true },
    { id: "ntf-follow", type: "system", message: "4 new followers joined Atelier Noir today.", date: minutesAgo(1800), isRead: true },
  ];

  const state = {
    period: "month",
    threshold: 10,
    fromDate: "",
    toDate: "",
    filter: "all",
    stockPage: 1,
    countdown: 60,
    products,
    notifications,
  };

  const fromInput = document.getElementById("fromDate");
  const toInput = document.getElementById("toDate");
  const thresholdInput = document.getElementById("stock-threshold");
  const dropdown = document.getElementById("notification-dropdown");
  const bellButton = document.getElementById("bell-button");
  const bellWrap = document.querySelector(".bell-wrap");
  let revenueChart = null;
  let ordersChart = null;

  document.querySelectorAll("[data-period]").forEach((button) => {
    button.addEventListener("click", () => setPeriod(button.dataset.period));
  });

  document.getElementById("refresh-button").addEventListener("click", (event) => {
    window.runWithLoading(event.currentTarget, () => {
      refreshDashboard();
      announce("Dashboard refreshed.");
    });
  });

  fromInput.addEventListener("change", onCustomDate);
  toInput.addEventListener("change", onCustomDate);

  thresholdInput.addEventListener("input", () => {
    const value = Number(thresholdInput.value);
    if (!Number.isFinite(value) || value < 0) return;
    state.threshold = value;
    state.stockPage = 1;
    window.runWithSkeleton(document.getElementById("low-stock-list"), () => {
      renderLowStock();
      renderTicker();
    }, { columns: 5, rows: 5, delay: 280 });
  });

  document.getElementById("stock-pager").addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const paged = window.pageRows(lowStockItems(), state.stockPage);
    state.stockPage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    window.runWithSkeleton(document.getElementById("low-stock-list"), renderLowStock, { columns: 5, rows: 5 });
  });

  document.getElementById("low-stock-list").addEventListener("click", (event) => {
    const button = event.target.closest(".restock-btn");
    if (!button) return;
    window.runWithLoading(button, () => restock(button.dataset.productId));
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  document.getElementById("mark-all-read").addEventListener("click", (event) => {
    window.runWithLoading(event.currentTarget, markAllRead);
  });
  document.getElementById("dropdown-mark-read").addEventListener("click", (event) => {
    window.runWithLoading(event.currentTarget, markAllRead);
  });

  document.getElementById("recent-notifications-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-notification-id]");
    if (!button) return;
    markRead(button.dataset.notificationId);
  });

  document.getElementById("bell-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-notification-id]");
    if (!button) return;
    markRead(button.dataset.notificationId);
  });

  bellButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = dropdown.hidden;
    dropdown.hidden = !willOpen;
    bellButton.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("click", (event) => {
    if (!bellWrap.contains(event.target)) closeNotifications();
  });

  document.addEventListener("stylex-theme", () => {
    if (revenueChart) {
      revenueChart.destroy();
      revenueChart = null;
    }
    if (ordersChart) {
      ordersChart.destroy();
      ordersChart = null;
    }
    renderPeriodData();
  });

  setPeriod("month", { silent: true });
  renderLowStock();
  renderReviews();
  renderFollowers();
  renderNotifications();
  renderTicker();
  renderCountdown();
  window.setInterval(tick, 1000);

  function setPeriod(period, options) {
    state.period = period;
    document.querySelectorAll("[data-period]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.period === period));
    });
    syncDateInputs();
    if (options && options.silent) {
      renderPeriodData();
      return;
    }
    const metrics = document.querySelectorAll(".kpi-value, .rev-value, .status-count, #orders-total");
    metrics.forEach((node) => {
      node.innerHTML = window.skeletonBone({ width: "64%", height: "22px" });
    });
    window.setTimeout(() => {
      renderPeriodData();
      announce("Showing " + periodName(period) + ".");
    }, 360);
  }

  function setFilter(filter) {
    state.filter = filter;
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    });
    window.runWithSkeleton(document.getElementById("recent-notifications-list"), renderNotifications, {
      mode: "feed",
      rows: 4,
    });
  }

  function onCustomDate() {
    state.fromDate = fromInput.value;
    state.toDate = toInput.value;
    if (state.period !== "custom") setPeriod("custom");
    else renderPeriodData();
  }

  function syncDateInputs() {
    if (state.period === "custom") {
      if (!state.fromDate || !state.toDate) {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 13);
        state.fromDate = iso(from);
        state.toDate = iso(to);
      }
      fromInput.value = state.fromDate;
      toInput.value = state.toDate;
      fromInput.disabled = false;
      toInput.disabled = false;
      return;
    }

    const span = PERIODS[state.period].span;
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (span - 1));
    fromInput.value = iso(from);
    toInput.value = iso(to);
    fromInput.disabled = true;
    toInput.disabled = true;
  }

  function renderPeriodData() {
    const metrics = currentMetrics();
    setText("metric-total-orders", formatNumber(metrics.orders));
    setText("metric-total-items", formatNumber(metrics.items));
    setText("metric-avg-order-value", formatMoney(metrics.aov));
    setText("metric-gross-revenue", formatMoney(metrics.gross));
    setTrend("metric-total-orders-trend", metrics.trends.orders);
    setTrend("metric-total-items-trend", metrics.trends.items);
    setTrend("metric-avg-order-value-trend", metrics.trends.aov);
    setTrend("metric-gross-revenue-trend", metrics.trends.gross);

    setText("rev-gross", formatMoney(metrics.gross));
    setText("rev-fees", formatMoney(metrics.fees));
    setText("rev-refunds", formatMoney(metrics.refunds));
    setText("rev-net", formatMoney(metrics.net));
    setText("revenue-range", periodName(state.period) + " · " + formatShort(fromInput.value) + " – " + formatShort(toInput.value));

    STATUS_KEYS.forEach((key) => setText("orders-" + key, formatNumber(metrics.statuses[key])));
    setText("orders-total", formatNumber(metrics.orders));
    renderCharts(metrics);
  }

  function renderCharts(metrics) {
    if (typeof Chart === "undefined") return;
    if (document.documentElement.classList.contains("is-booting")) {
      window.whenPageReady(() => renderCharts(metrics));
      return;
    }
    const labels = chartLabels(metrics);
    const gross = allocate(metrics.gross, metrics.shape);
    const net = allocate(metrics.net, metrics.shape);
    const line = document.getElementById("revenueLineChart");
    const pie = document.getElementById("orderStatusPieChart");
    const firstPaint = !revenueChart || !ordersChart;
    const motion = firstPaint
      ? { duration: 900, easing: "easeOutQuart" }
      : false;

    if (revenueChart) {
      revenueChart.data.labels = labels;
      revenueChart.data.datasets[0].data = gross;
      revenueChart.data.datasets[1].data = net;
      revenueChart.update(firstPaint ? undefined : "none");
    } else {
      revenueChart = new Chart(line, {
        type: "line",
        data: {
          labels,
          datasets: [
            lineDataset("Gross revenue", gross, COLORS.ink),
            lineDataset("Net earnings", net, COLORS.red),
          ],
        },
        options: {
          animation: motion,
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: COLORS.ink,
              titleColor: COLORS.white,
              bodyColor: COLORS.white,
              borderColor: COLORS.line,
              borderWidth: 1,
              callbacks: {
                label(context) {
                  return context.dataset.label + ": " + formatMoney(context.parsed.y);
                },
              },
            },
          },
          scales: {
            x: axisOptions(),
            y: Object.assign(axisOptions(), {
              beginAtZero: true,
              ticks: Object.assign(axisOptions().ticks, {
                callback: (value) => axisMoney(value),
              }),
            }),
          },
        },
      });
    }

    const statusData = STATUS_KEYS.map((key) => metrics.statuses[key]);
    const statusColors = [
      COLORS.red,
      COLORS.ink,
      COLORS.line,
      stripePattern(COLORS.white, COLORS.ink),
      stripePattern(COLORS.paper, COLORS.red),
    ];

    if (ordersChart) {
      ordersChart.data.datasets[0].data = statusData;
      ordersChart.update(firstPaint ? undefined : "none");
    } else {
      ordersChart = new Chart(pie, {
        type: "doughnut",
        data: {
          labels: ["Pending", "Processing", "Shipped", "Completed", "Cancelled"],
          datasets: [
            {
              data: statusData,
              backgroundColor: statusColors,
              borderColor: COLORS.white,
              borderWidth: 2,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          animation: motion,
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: COLORS.ink,
              titleColor: COLORS.white,
              bodyColor: COLORS.white,
              callbacks: {
                label(context) {
                  return context.label + ": " + formatNumber(context.parsed);
                },
              },
            },
          },
        },
      });
    }
  }

  function renderLowStock() {
    const items = lowStockItems();
    const paged = window.pageRows(items, state.stockPage);
    state.stockPage = paged.page;
    const list = document.getElementById("low-stock-list");
    if (!items.length) {
      list.innerHTML = '<tr class="empty-row"><td colspan="5">' + window.emptyState("ri-archive-line", "Stock looks healthy", "Nothing is at or below this threshold.") + "</td></tr>";
    } else {
      list.innerHTML = paged.rows
      .map((product) => {
        return (
          "<tr data-product-id=\"" + escapeHtml(product.productId) + "\" data-stock=\"" + product.stock + "\" data-threshold=\"" + state.threshold + "\">" +
            "<td class=\"product-id\" data-field=\"productId\">" + escapeHtml(product.productId) + "</td>" +
            "<td data-field=\"name\">" + escapeHtml(product.name) + "</td>" +
            "<td class=\"stock-count\" data-field=\"stock\">" + formatNumber(product.stock) + "</td>" +
            "<td data-field=\"threshold\">" + formatNumber(state.threshold) + "</td>" +
            "<td><button type=\"button\" class=\"restock-btn\" data-product-id=\"" + escapeHtml(product.productId) + "\">Restock</button></td>" +
          "</tr>"
        );
      })
      .join("");
    }
    window.renderPager(document.getElementById("stock-pager"), state.stockPage, paged.pages);
  }

  function renderReviews() {
    const list = document.getElementById("recent-reviews-list");
    if (!reviews.length) {
      list.innerHTML = window.emptyState("ri-star-line", "No reviews yet", "Buyer notes about your pieces will gather here.");
      return;
    }
    list.innerHTML = reviews
      .map((review) => {
        return (
          "<article class=\"review\" data-reviewer-name=\"" + escapeHtml(review.reviewerName) + "\" data-rating=\"" + review.rating + "\" data-product-name=\"" + escapeHtml(review.productName) + "\" data-date=\"" + escapeHtml(review.date) + "\">" +
            "<div class=\"review-top\">" +
              "<h3 data-field=\"reviewerName\">" + escapeHtml(review.reviewerName) + "</h3>" +
              "<time datetime=\"" + escapeHtml(review.date) + "\" data-field=\"date\">" + formatShort(review.date.slice(0, 10)) + "</time>" +
            "</div>" +
            "<div class=\"stars\" role=\"img\" aria-label=\"Rated " + review.rating + " out of 5\" data-field=\"rating\">" + stars(review.rating) + "</div>" +
            "<span class=\"product-badge\" data-field=\"productName\">" + escapeHtml(review.productName) + "</span>" +
            "<p class=\"comment\" data-field=\"comment\">" + escapeHtml(review.comment) + "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderFollowers() {
    const list = document.getElementById("recent-followers-list");
    if (!followers.length) {
      list.innerHTML = window.emptyState("ri-group-line", "No followers yet", "People who follow Atelier Noir will show up here.");
      return;
    }
    list.innerHTML = followers
      .map((follower) => {
        return (
          "<article class=\"follower\" data-user-id=\"" + escapeHtml(follower.userId) + "\" data-avatar=\"" + escapeHtml(follower.avatar) + "\" data-followed-date=\"" + escapeHtml(follower.followedDate) + "\">" +
            "<span class=\"avatar\" aria-hidden=\"true\">" + escapeHtml(follower.avatar) + "</span>" +
            "<div>" +
              "<h3 data-field=\"userName\">" + escapeHtml(follower.userName) + "</h3>" +
              "<p data-field=\"userId\">" + escapeHtml(follower.userId) + "</p>" +
            "</div>" +
            "<time datetime=\"" + escapeHtml(follower.followedDate) + "\" data-field=\"followedDate\">" + formatShort(follower.followedDate.slice(0, 10)) + "</time>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderNotifications() {
    const visible = filteredNotifications();
    const list = document.getElementById("recent-notifications-list");
    list.innerHTML = visible.length
      ? visible.map(notificationMarkup).join("")
      : window.emptyState("ri-notification-3-line", "No notifications", "Nothing in this view right now.", true);
    renderBell();
  }

  function renderBell() {
    const unread = state.notifications.filter((item) => !item.isRead);
    const badge = document.getElementById("notification-count");
    badge.textContent = String(unread.length);
    badge.hidden = unread.length === 0;
    bellButton.setAttribute("aria-label", "Notifications, " + unread.length + " unread");
    const bellList = document.getElementById("bell-list");
    bellList.innerHTML = unread.length
      ? unread.map(notificationMarkup).join("")
      : window.emptyState("ri-check-line", "You are caught up", "Unread alerts will show up here.", true);
  }

  function renderTicker() {
    const latest = state.notifications.find((item) => item.type === "order" && item.orderId);
    const detail = latest
      ? "Order #" + latest.orderId + " placed " + relativeTime(latest.date)
      : "No new order alerts.";
    setText("ticker-detail", detail);
    const items = lowStockItems();
    const noun = items.length === 1 ? "item" : "items";
    setText("low-stock-banner-text", items.length + " " + noun + " at or below " + state.threshold + " units");
  }

  function renderCountdown() {
    setText("refresh-countdown", String(state.countdown));
  }

  function refreshDashboard() {
    state.countdown = 60;
    renderCountdown();
    renderPeriodData();
    renderTicker();
    const icon = document.querySelector("#refresh-button i");
    if (icon) {
      icon.classList.remove("is-spinning");
      void icon.offsetWidth;
      icon.classList.add("is-spinning");
    }
  }

  function tick() {
    state.countdown -= 1;
    if (state.countdown <= 0) {
      refreshDashboard();
      return;
    }
    renderCountdown();
    renderTicker();
  }

  function restock(productId) {
    const product = state.products.find((item) => item.productId === productId);
    if (!product) return;
    product.stock += 10;
    renderLowStock();
    renderTicker();
    announce("Restocked " + product.name + ". Stock is now " + product.stock + ".");
  }

  function markAllRead() {
    state.notifications.forEach((item) => {
      item.isRead = true;
    });
    renderNotifications();
    renderTicker();
    announce("All notifications marked as read.");
  }

  function markRead(id) {
    const item = state.notifications.find((entry) => entry.id === id);
    if (!item || item.isRead) return;
    item.isRead = true;
    renderNotifications();
  }

  function closeNotifications() {
    if (!dropdown || !bellButton) return;
    dropdown.hidden = true;
    bellButton.setAttribute("aria-expanded", "false");
  }

  function currentMetrics() {
    if (state.period !== "custom") return PERIODS[state.period];
    return customMetrics();
  }

  function customMetrics() {
    const from = parseDate(state.fromDate);
    const to = parseDate(state.toDate);
    let days = 14;
    if (from !== null && to !== null) {
      days = Math.round((Math.max(from, to) - Math.min(from, to)) / 86400000) + 1;
    }
    days = Math.max(1, Math.min(days, 90));
    const gross = Math.round(9844 * days * 0.72);
    const fees = Math.round(gross * 0.06);
    const refunds = Math.round(gross * 0.025);
    const net = gross - fees - refunds;
    const orders = Math.max(1, Math.round(46 * days * 0.68));
    const items = Math.round(orders * 2.4);
    const buckets = Math.min(8, days);
    return {
      orders,
      items,
      aov: gross / orders,
      gross,
      fees,
      refunds,
      net,
      trends: { orders: 3.2, items: 2.1, aov: -1.4, gross: 4.4 },
      statuses: statusSplit(orders),
      shape: Array.from({ length: buckets }, () => 1),
      span: days,
    };
  }

  function chartLabels(metrics) {
    if (state.period === "today") return ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];
    if (state.period === "custom") {
      const count = metrics.shape.length;
      const end = parseDate(state.toDate) || Date.now();
      const start = parseDate(state.fromDate) || end;
      const from = Math.min(start, end);
      const to = Math.max(start, end);
      return Array.from({ length: count }, (_, index) => {
        const time = count === 1 ? to : from + ((to - from) * index) / (count - 1);
        return formatShort(iso(new Date(time)));
      });
    }

    const dates = [];
    for (let index = metrics.span - 1; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      dates.push(date);
    }
    if (state.period === "week") {
      return dates.map((date) => date.toLocaleDateString("en-US", { weekday: "short" }));
    }
    const step = (dates.length - 1) / (metrics.shape.length - 1);
    return metrics.shape.map((_, index) => formatShort(iso(dates[Math.round(index * step)])));
  }

  function lowStockItems() {
    return state.products
      .filter((product) => product.stock <= state.threshold)
      .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));
  }

  function filteredNotifications() {
    return state.notifications
      .filter((item) => {
        if (state.filter === "unread") return !item.isRead;
        if (state.filter === "orders") return item.type === "order";
        if (state.filter === "system") return item.type === "system";
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function notificationMarkup(item) {
    const icon = item.type === "order" ? "ri-shopping-bag-line" : "ri-error-warning-line";
    const label = item.type === "order" ? "Order" : "System";
    return (
      "<button type=\"button\" class=\"note" + (item.isRead ? "" : " is-unread") + "\" data-notification-id=\"" + escapeHtml(item.id) + "\" data-type=\"" + item.type + "\" data-read=\"" + item.isRead + "\" data-date=\"" + escapeHtml(item.date) + "\">" +
        "<span class=\"note-icon\"><i class=\"" + icon + "\" aria-hidden=\"true\"></i></span>" +
        "<span class=\"note-copy\">" +
          "<span class=\"note-type\" data-field=\"type\">" + label + "</span>" +
          "<span class=\"note-message\" data-field=\"message\">" + escapeHtml(item.message) + "</span>" +
          "<time class=\"note-time\" datetime=\"" + escapeHtml(item.date) + "\" data-field=\"date\">" + relativeTime(item.date) + "</time>" +
        "</span>" +
        "<span class=\"unread-dot\" data-read=\"" + item.isRead + "\" data-field=\"isRead\"></span>" +
      "</button>"
    );
  }

  function stars(rating) {
    let markup = "";
    for (let index = 1; index <= 5; index += 1) {
      markup += "<i class=\"" + (index <= rating ? "ri-star-fill" : "ri-star-line is-empty") + "\" aria-hidden=\"true\"></i>";
    }
    return markup;
  }

  function lineDataset(label, data, color) {
    return {
      label,
      data,
      borderColor: color,
      backgroundColor: color,
      pointBackgroundColor: color,
      pointBorderColor: COLORS.white,
      pointBorderWidth: 2,
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 5,
    };
  }

  function axisOptions() {
    return {
      grid: { color: COLORS.line },
      border: { color: COLORS.line },
      ticks: {
        color: COLORS.ink,
        font: { family: "'Roboto Flex', sans-serif" },
      },
    };
  }

  function stripePattern(base, stripe) {
    const canvas = document.createElement("canvas");
    canvas.width = 6;
    canvas.height = 6;
    const context = canvas.getContext("2d");
    context.fillStyle = base;
    context.fillRect(0, 0, 6, 6);
    context.strokeStyle = stripe;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, 6);
    context.lineTo(6, 0);
    context.stroke();
    return context.createPattern(canvas, "repeat");
  }

  function statusSplit(total) {
    const counts = allocate(total, [64, 140, 286, 742, 52]);
    return {
      pending: counts[0],
      processing: counts[1],
      shipped: counts[2],
      completed: counts[3],
      cancelled: counts[4],
    };
  }

  function allocate(total, weights) {
    const sum = weights.reduce((totalWeight, weight) => totalWeight + weight, 0);
    const values = weights.map((weight) => Math.floor((total * weight) / sum));
    let leftover = Math.round(total) - values.reduce((totalValue, value) => totalValue + value, 0);
    let index = 0;
    while (leftover > 0) {
      values[index % values.length] += 1;
      leftover -= 1;
      index += 1;
    }
    return values;
  }

  function setTrend(id, value) {
    const node = document.getElementById(id);
    if (!node) return;
    const negative = value < 0;
    node.className = "trend" + (negative ? " is-down" : "");
    node.dataset.trend = String(value);
    node.innerHTML = (negative ? "−" : "+") + Math.abs(value).toFixed(1) + "% <span>vs prior period</span>";
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function announce(message) {
    const node = document.getElementById("status-live");
    if (node) {
      node.textContent = "";
      window.setTimeout(() => {
        node.textContent = message;
      }, 20);
    }
    window.showToast(message);
  }

  function periodName(period) {
    if (period === "today") return "Today";
    if (period === "week") return "Week";
    if (period === "month") return "Month";
    return "Custom";
  }

  function formatMoney(value) {
    const cents = Math.round(value * 100) % 100 !== 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    }).format(value);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(value);
  }

  function axisMoney(value) {
    if (Math.abs(value) >= 1000) {
      const compact = value / 1000;
      return "$" + compact.toFixed(compact >= 10 ? 0 : 1) + "k";
    }
    return formatMoney(value);
  }

  function formatShort(isoDate) {
    const time = parseDate(isoDate);
    if (time === null) return "";
    return new Date(time).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function relativeTime(isoDate) {
    const delta = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.max(0, Math.round(delta / 60000));
    if (minutes < 1) return "just now";
    if (minutes < 60) return minutes + (minutes === 1 ? " min ago" : " mins ago");
    const hours = Math.round(minutes / 60);
    if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago");
    const days = Math.round(hours / 24);
    return days + (days === 1 ? " day ago" : " days ago");
  }

  function parseDate(value) {
    if (!value) return null;
    const parts = value.split("-").map(Number);
    if (parts.length < 3 || parts.some((part) => !part)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
  }

  function iso(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;");
  }

  function minutesAgo(minutes) {
    return new Date(Date.now() - minutes * 60000).toISOString();
  }

  function daysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return iso(date);
  }

    function closeThemeSelect(wrap) {
    if (!wrap) return;
    wrap.classList.remove("is-open");
    const menu = wrap.themeMenu;
    const trigger = wrap.querySelector(".theme-select-button");
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (openSelect === wrap) openSelect = null;
  }

  function placeThemeSelect(wrap) {
    if (!wrap) return;
    const trigger = wrap.querySelector(".theme-select-button");
    const menu = wrap.querySelector(".theme-select-menu") || wrap.themeMenu;
    if (!trigger || !menu || menu.hidden) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.max(rect.width, 168);
    menu.style.width = width + "px";
    const menuHeight = Math.min(menu.scrollHeight, 240);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 12 && rect.top > spaceBelow;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    menu.style.left = left + "px";
    menu.style.top = (openUp ? Math.max(8, rect.top - menuHeight - 6) : rect.bottom + 6) + "px";
  }

  function upgradeSelect(select) {
    if (!select || select.dataset.themeSelect === "on" || select.closest(".theme-select") || !select.parentNode) return;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "theme-select-button";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    const menu = document.createElement("div");
    menu.className = "theme-select-menu";
    menu.hidden = true;
    menu.setAttribute("role", "listbox");
    const wrap = document.createElement("div");
    wrap.className = "theme-select";
    if (select.classList.contains("vis-select")) wrap.classList.add("is-table");
    select.dataset.themeSelect = "on";
    select.classList.add("theme-select-native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    select.parentNode.insertBefore(wrap, select);
    wrap.append(select, trigger);
    document.body.appendChild(menu);
    wrap.themeMenu = menu;
    select.themeMenu = menu;

    let painting = false;
    function paint() {
      if (painting || !select.isConnected) return;
      painting = true;
      const current = select.options[select.selectedIndex];
      trigger.replaceChildren();
      const label = document.createElement("span");
      label.textContent = current ? current.textContent : "";
      trigger.appendChild(label);
      trigger.disabled = select.disabled;
      const named = select.getAttribute("aria-label");
      if (named) trigger.setAttribute("aria-label", named);
      menu.replaceChildren();
      Array.from(select.options).forEach((option, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "theme-select-option";
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(index === select.selectedIndex));
        item.disabled = option.disabled;
        item.textContent = option.textContent;
        item.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          selectIndex.set.call(select, index);
          select.dispatchEvent(new Event("change", { bubbles: true }));
          if (!wrap.isConnected) return;
          paint();
          closeThemeSelect(wrap);
          trigger.focus();
        });
        menu.appendChild(item);
      });
      painting = false;
    }

    Object.defineProperty(select, "value", {
      configurable: true,
      get() { return selectValue.get.call(select); },
      set(next) {
        selectValue.set.call(select, next);
        paint();
      }
    });
    Object.defineProperty(select, "selectedIndex", {
      configurable: true,
      get() { return selectIndex.get.call(select); },
      set(next) {
        selectIndex.set.call(select, next);
        paint();
      }
    });
    new MutationObserver(paint).observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });
    select.addEventListener("change", paint);
    select.addEventListener("mousedown", (event) => event.preventDefault());
    select.addEventListener("focus", () => trigger.focus());
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (trigger.disabled) return;
      if (openSelect === wrap) {
        closeThemeSelect(wrap);
        return;
      }
      closeThemeSelect(openSelect);
      menu.hidden = false;
      wrap.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      openSelect = wrap;
      placeThemeSelect(wrap);
      const selected = menu.querySelector('[aria-selected="true"]') || menu.querySelector("button");
      if (selected) selected.focus();
    });
    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      trigger.click();
    });
    menu.addEventListener("keydown", (event) => {
      const items = Array.from(menu.querySelectorAll("button:not(:disabled)"));
      const index = items.indexOf(document.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        closeThemeSelect(wrap);
        trigger.focus();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const next = event.key === "ArrowDown" ? Math.min(items.length - 1, index + 1) : Math.max(0, index - 1);
        if (items[next]) items[next].focus();
      }
    });
    paint();
  }

  function bootThemeSelects() {
    const outlet = document.querySelector(".outlet");
    if (!outlet) return;
    const scan = (node) => {
      if (!node || node.nodeType !== 1) return;
      if (node.matches("select")) upgradeSelect(node);
      node.querySelectorAll("select").forEach(upgradeSelect);
    };
    scan(document.body);
    const retireSelect = (node) => {
      if (!node || node.nodeType !== 1) return;
      const selects = node.matches("select") ? [node] : Array.from(node.querySelectorAll("select"));
      selects.forEach((select) => {
        if (select.isConnected || !select.themeMenu) return;
        if (openSelect && openSelect.themeMenu === select.themeMenu) openSelect = null;
        select.themeMenu.remove();
      });
    };
    new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach(scan);
        record.removedNodes.forEach(retireSelect);
      });
    }).observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", (event) => {
      if (!openSelect) return;
      if (openSelect.contains(event.target) || (openSelect.themeMenu && openSelect.themeMenu.contains(event.target))) return;
      closeThemeSelect(openSelect);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeThemeSelect(openSelect);
    });
    window.addEventListener("resize", () => placeThemeSelect(openSelect));
    document.addEventListener("scroll", () => placeThemeSelect(openSelect), true);
  }

  function tableLabels(table) {
    if (!table || !table.tHead) return [];
    const headerRow = table.tHead.rows[0];
    if (!headerRow) return [];
    return Array.from(headerRow.cells).map((cell) => {
      return (cell.textContent || "").replace(/\s+/g, " ").trim();
    });
  }

  function cellLooksLikeActions(cell, label) {
    if (!cell) return false;
    const text = String(label || "").toLowerCase().trim();
    if (text === "actions" || text === "action" || text === "manage") return true;
    if (cell.querySelector(".row-actions, .studio-actions")) return true;
    if (cell.querySelector("input, select, textarea, .product-cell, .sku-cell")) return false;
    const buttons = cell.querySelectorAll("button, .btn, .restock-btn");
    if (!buttons.length) return false;
    const meaningful = cell.querySelector("strong, .finance-id, .order-id, .status-badge, .promo-badge, .finance-badge, img, .finance-meta");
    return !meaningful;
  }

  function enhanceTableRow(row, labels) {
    if (!row || row.nodeType !== 1) return;
    const cells = Array.from(row.cells || []);
    if (!cells.length) return;

    const isEmpty = cells.some((cell) => cell.hasAttribute("colspan")) || row.classList.contains("empty-row");
    row.classList.toggle("is-empty", isEmpty);
    if (isEmpty) {
      cells.forEach((cell) => {
        cell.removeAttribute("data-label");
        cell.classList.remove("is-primary", "is-actions");
      });
      return;
    }

    let actionIndex = -1;
    cells.forEach((cell, index) => {
      const label = labels[index] || "";
      if (label) cell.setAttribute("data-label", label);
      else cell.removeAttribute("data-label");
      cell.classList.toggle("is-primary", index === 0);
      cell.classList.remove("is-actions");
      if (cellLooksLikeActions(cell, label)) actionIndex = index;
    });

    if (actionIndex < 0) {
      const last = cells[cells.length - 1];
      if (last && last.querySelector("button, .row-actions, .studio-actions, .restock-btn")) {
        actionIndex = cells.length - 1;
      }
    }
    if (actionIndex >= 0) cells[actionIndex].classList.add("is-actions");
  }

  function enhanceDataTables(root) {
    const scope = root && root.querySelectorAll ? root : document;
    const selector =
      "table.order-table, table.product-table, table.finance-table, table.promo-table, table.studio-table, table.data-table, table.team-table, table.variant-table, table.measure-table";
    const tables = scope.querySelectorAll ? scope.querySelectorAll(selector) : [];
    const list = root && root.matches && root.matches("table") ? [root] : Array.from(tables);
    list.forEach((table) => {
      if (!table || !table.tBodies || !table.tBodies.length) return;
      const labels = tableLabels(table);
      Array.from(table.tBodies[0].rows).forEach((row) => enhanceTableRow(row, labels));
    });
  }

  function bootMobileTables() {
    window.enhanceDataTables = enhanceDataTables;
    enhanceDataTables(document);
    let queued = false;
    const queue = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        enhanceDataTables(document);
      });
    };
    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
  }
})();
