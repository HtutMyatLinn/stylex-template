(function () {
  function bone(width, height, radius, extra) {
    return (
      '<span class="sk' +
      (extra ? " " + extra : "") +
      '" style="width:' +
      (width || "100%") +
      ";height:" +
      (height || "12px") +
      ";border-radius:" +
      (radius || "6px") +
      '" aria-hidden="true"></span>'
    );
  }

  function chips(count, widths) {
    let html = "";
    for (let index = 0; index < count; index += 1) {
      html += bone(widths[index % widths.length], "34px", "9999px", "sk-chip");
    }
    return html;
  }

  function tableSkeleton(headers, rows, tableClass) {
    const cols = headers.length;
    let head = "<tr>";
    headers.forEach(function (label) {
      head += "<th scope=\"col\">" + label + "</th>";
    });
    head += "</tr>";
    let body = "";
    for (let row = 0; row < rows; row += 1) {
      body += '<tr class="sk-row">';
      for (let cell = 0; cell < cols; cell += 1) {
        const width = cell === 0 ? "72%" : cell === cols - 1 ? "44%" : 52 + ((row + cell) % 4) * 10 + "%";
        body += "<td>" + bone(width, "14px") + "</td>";
      }
      body += "</tr>";
    }
    return (
      '<div class="table-scroll"><table class="' +
      (tableClass || "order-table") +
      ' sk-table"><thead>' +
      head +
      "</thead><tbody>" +
      body +
      "</tbody></table></div>"
    );
  }

  function toolbarSearch(extra) {
    return (
      '<div class="toolbar sk-toolbar">' +
      bone("min(100%, 320px)", "42px", "9999px") +
      (extra || "") +
      "</div>"
    );
  }

  function kpiCard(wideValue) {
    return (
      '<article class="card kpi-card span-3 sk-shell" style="display:grid;gap:12px">' +
      bone("46%", "11px") +
      bone(wideValue || "58%", "30px", "8px") +
      '<div style="display:flex;gap:8px;align-items:center">' +
      bone("52px", "18px", "9999px") +
      bone("38%", "11px") +
      "</div></article>"
    );
  }

  const templates = {
    dashboard: function () {
      return (
        '<div class="board page-skeleton-inner">' +
        kpiCard("52%") +
        kpiCard("60%") +
        kpiCard("44%") +
        kpiCard("68%") +
        '<article class="card span-8 sk-shell">' +
        '<header class="card-head"><span class="sk sk-title" style="width:160px;height:18px"></span><div class="segment sk-segment">' +
        chips(4, ["64px", "58px", "68px", "72px"]) +
        "</div></header>" +
        '<div class="card-body"><div class="rev-grid">' +
        '<div class="rev-stat" style="display:grid;gap:8px">' +
        bone("58%", "11px") +
        bone("72%", "22px") +
        "</div>" +
        '<div class="rev-stat" style="display:grid;gap:8px">' +
        bone("54%", "11px") +
        bone("60%", "22px") +
        "</div>" +
        '<div class="rev-stat" style="display:grid;gap:8px">' +
        bone("40%", "11px") +
        bone("50%", "22px") +
        "</div>" +
        '<div class="rev-stat" style="display:grid;gap:8px">' +
        bone("48%", "11px") +
        bone("66%", "22px") +
        "</div></div>" +
        '<div style="display:flex;gap:16px;margin:14px 0">' +
        bone("110px", "12px") +
        bone("110px", "12px") +
        "</div>" +
        bone("100%", "220px", "18px", "sk-block") +
        "</div></article>" +
        '<article class="card span-4 sk-shell">' +
        '<header class="card-head"><span class="sk sk-title" style="width:88px;height:18px"></span></header>' +
        '<div class="card-body" style="display:grid;gap:16px;justify-items:center">' +
        '<div style="position:relative;width:150px;height:150px">' +
        bone("150px", "150px", "50%") +
        "</div>" +
        '<ul style="list-style:none;margin:0;padding:0;width:100%;display:grid;gap:10px">' +
        [0, 1, 2, 3, 4]
          .map(function () {
            return (
              '<li style="display:grid;grid-template-columns:12px 1fr 36px;gap:10px;align-items:center">' +
              bone("12px", "12px", "50%") +
              bone("70%", "12px") +
              bone("100%", "12px") +
              "</li>"
            );
          })
          .join("") +
        "</ul></div></article>" +
        '<article class="card span-8 sk-shell">' +
        '<header class="card-head"><span class="sk sk-title" style="width:140px;height:18px"></span>' +
        bone("88px", "34px", "9999px") +
        "</header>" +
        tableSkeleton(["Product", "SKU", "Stock", "Threshold", "Action"], 5) +
        "</article>" +
        '<article class="card span-4 sk-shell">' +
        '<header class="card-head"><span class="sk sk-title" style="width:120px;height:18px"></span></header>' +
        '<div class="card-body"><div class="sk-feed">' +
        [0, 1, 2, 3]
          .map(function () {
            return (
              '<div class="sk-feed-item">' +
              bone("36px", "36px", "50%", "sk-avatar") +
              '<div style="display:grid;gap:8px;width:100%">' +
              bone("70%", "12px") +
              bone("48%", "10px") +
              "</div></div>"
            );
          })
          .join("") +
        "</div></div></article>" +
        "</div>"
      );
    },

    orders: function () {
      return (
        '<div class="orders-workspace page-skeleton-inner">' +
        '<div class="toolbar sk-toolbar">' +
        bone("min(100%, 320px)", "42px", "9999px") +
        '<div class="screen-switch sk-segment">' +
        chips(8, ["48px", "56px", "84px", "78px", "72px", "80px", "84px", "120px"]) +
        "</div></div>" +
        tableSkeleton(["Order ID", "Customer", "Order date", "Status", "Total", ""], 8) +
        '<nav class="pager sk-pager">' +
        bone("88px", "14px") +
        chips(5, ["40px", "40px", "40px", "64px", "64px"]) +
        "</nav></div>"
      );
    },

    products: function () {
      return (
        '<div class="products-workspace page-skeleton-inner">' +
        '<div class="toolbar sk-toolbar">' +
        bone("min(100%, 320px)", "42px", "9999px") +
        bone("120px", "42px", "14px") +
        '<div class="status-tabs sk-segment">' +
        chips(7, ["48px", "84px", "64px", "88px", "84px", "84px", "100px"]) +
        "</div>" +
        bone("140px", "42px", "9999px") +
        "</div>" +
        tableSkeleton(
          ["Product", "SKU & variants", "Selling type", "Price", "Stock", "Restock date", "Visibility", ""],
          8,
          "product-table"
        ) +
        '<nav class="pager sk-pager">' +
        bone("96px", "14px") +
        chips(4, ["40px", "40px", "64px", "64px"]) +
        "</nav></div>"
      );
    },

    promotions: function () {
      return (
        '<div class="promo page-skeleton-inner">' +
        '<div class="promo-head"><div style="display:grid;gap:10px;width:min(100%,420px)">' +
        bone("70%", "22px") +
        bone("90%", "12px") +
        '</div><div class="promo-actions sk-segment">' +
        bone("150px", "42px", "9999px") +
        bone("150px", "42px", "9999px") +
        "</div></div>" +
        '<div class="promo-kpis">' +
        [0, 1, 2, 3]
          .map(function () {
            return (
              '<article class="promo-kpi sk-shell">' +
              bone("55%", "12px") +
              bone("48%", "26px") +
              bone("40%", "12px") +
              "</article>"
            );
          })
          .join("") +
        "</div>" +
        '<section class="promo-card sk-shell"><div class="promo-head"><div style="display:grid;gap:8px;width:220px">' +
        bone("70%", "18px") +
        bone("90%", "12px") +
        '</div></div><div class="promo-analytics">' +
        bone("100%", "220px", "18px", "sk-block") +
        '<div style="display:grid;gap:12px">' +
        bone("50%", "12px") +
        bone("100%", "10px") +
        bone("100%", "10px") +
        bone("100%", "10px") +
        bone("100%", "10px") +
        "</div></div></section>" +
        '<section class="promo-card sk-shell">' +
        '<div class="promo-filters sk-toolbar">' +
        bone("min(100%, 320px)", "42px", "9999px") +
        bone("140px", "42px", "14px") +
        chips(4, ["64px", "72px", "84px", "72px"]) +
        "</div>" +
        tableSkeleton(["Campaign", "Type", "Benefit", "Schedule", "Usage", "Revenue", "Status", ""], 6) +
        "</section></div>"
      );
    },

    finance: function () {
      return (
        '<div class="finance-workspace page-skeleton-inner">' +
        '<div class="finance-tabs sk-segment">' +
        chips(5, ["150px", "170px", "150px", "120px", "150px"]) +
        "</div>" +
        '<div class="finance-head"><div style="display:grid;gap:8px;width:min(100%,360px)">' +
        bone("60%", "20px") +
        bone("90%", "12px") +
        "</div>" +
        bone("180px", "42px", "9999px") +
        "</div>" +
        '<div class="finance-stats">' +
        [0, 1, 2, 3]
          .map(function () {
            return (
              '<article class="finance-stat sk-shell">' +
              bone("55%", "12px") +
              bone("70%", "26px") +
              bone("45%", "12px") +
              bone("80%", "12px") +
              "</article>"
            );
          })
          .join("") +
        "</div>" +
        '<section class="finance-card sk-shell"><div class="finance-head"><div style="display:grid;gap:8px;width:240px">' +
        bone("80%", "18px") +
        bone("50%", "12px") +
        '</div><div class="finance-pills sk-segment">' +
        chips(2, ["88px", "72px"]) +
        "</div></div>" +
        bone("100%", "240px", "18px", "sk-block") +
        "</section></div>"
      );
    },

    studio: function () {
      return (
        '<div class="studio page-skeleton-inner">' +
        '<section class="studio-bar sk-toolbar">' +
        bone("min(100%, 280px)", "42px", "9999px") +
        '<div class="segment sk-segment">' +
        chips(2, ["110px", "110px"]) +
        "</div>" +
        bone("150px", "42px", "9999px") +
        bone("120px", "42px", "9999px") +
        bone("140px", "14px") +
        "</section>" +
        '<div class="studio-layout"><div class="studio-main"><section class="studio-grid">' +
        [0, 1, 2, 3, 4, 5]
          .map(function () {
            return (
              '<article class="studio-card sk-shell">' +
              bone("100%", "160px", "14px") +
              bone("78%", "12px") +
              bone("52%", "10px") +
              '<div class="studio-actions sk-segment">' +
              chips(3, ["90px", "56px", "64px"]) +
              "</div></article>"
            );
          })
          .join("") +
        '</section></div><aside class="studio-story sk-shell">' +
        '<div class="studio-story-head">' +
        bone("70%", "18px") +
        bone("72px", "24px", "9999px") +
        "</div>" +
        bone("100%", "180px", "14px", "sk-block") +
        bone("40%", "12px") +
        bone("85%", "12px") +
        '<div class="studio-story-actions sk-segment">' +
        bone("72px", "42px", "9999px") +
        bone("140px", "42px", "9999px") +
        "</div></aside></div></div>"
      );
    },

    team: function () {
      return (
        '<div class="team page-skeleton-inner">' +
        '<div class="screen-switch team-sections sk-segment">' +
        chips(3, ["120px", "150px", "120px"]) +
        "</div>" +
        '<div class="toolbar team-member-toolbar sk-toolbar"><div class="team-filter-row">' +
        bone("min(100%, 320px)", "42px", "9999px") +
        bone("140px", "42px", "14px") +
        '<div class="screen-switch sk-segment">' +
        chips(5, ["48px", "64px", "72px", "88px", "80px"]) +
        "</div></div>" +
        bone("160px", "42px", "9999px") +
        "</div>" +
        tableSkeleton(["Member", "Role", "Status", "Last active", "Actions"], 6) +
        "</div>"
      );
    },

    settings: function () {
      return (
        '<div class="settings page-skeleton-inner">' +
        '<aside class="settings-menu sk-shell">' +
        '<article class="settings-summary" style="display:grid;grid-template-columns:48px 1fr;gap:12px;align-items:center">' +
        bone("48px", "48px", "14px") +
        '<div style="display:grid;gap:8px">' +
        bone("70%", "14px") +
        bone("85%", "12px") +
        bone("60%", "20px", "9999px") +
        "</div></article>" +
        '<nav class="settings-nav" style="display:grid;gap:8px;margin-top:16px">' +
        [0, 1, 2, 3, 4]
          .map(function () {
            return bone("100%", "40px", "12px");
          })
          .join("") +
        "</nav>" +
        bone("100%", "42px", "9999px") +
        '</aside><div class="settings-stage"><section class="settings-panel sk-shell">' +
        '<div class="settings-link-card" style="display:flex;justify-content:space-between;gap:16px;align-items:center">' +
        '<div style="display:grid;gap:8px;width:70%">' +
        bone("30%", "12px") +
        bone("90%", "18px") +
        "</div>" +
        bone("150px", "42px", "9999px") +
        '</div><div class="settings-block" style="display:grid;gap:14px;margin-top:18px">' +
        bone("28%", "16px") +
        bone("70%", "12px") +
        '<div class="settings-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        bone("100%", "48px", "14px") +
        bone("100%", "48px", "14px") +
        "</div>" +
        '<div class="settings-row-actions sk-segment">' +
        bone("120px", "42px", "9999px") +
        bone("120px", "42px", "9999px") +
        "</div></div></section></div></div>"
      );
    },

    "shop-profile": function () {
      return (
        '<div class="profile page-skeleton-inner">' +
        '<div class="profile-bar sk-toolbar">' +
        bone("64px", "28px", "9999px") +
        bone("120px", "28px", "9999px") +
        bone("150px", "42px", "9999px") +
        bone("160px", "42px", "9999px") +
        "</div>" +
        '<section class="profile-card sk-shell"><h2 class="sk-fake-title">' +
        bone("140px", "18px") +
        '</h2><div class="profile-media" style="display:grid;grid-template-columns:140px 1fr;gap:14px">' +
        bone("140px", "140px", "18px") +
        bone("100%", "140px", "18px") +
        "</div>" +
        bone("100%", "48px", "14px") +
        bone("100%", "48px", "14px") +
        "</section>" +
        '<section class="profile-card sk-shell">' +
        bone("110px", "18px") +
        bone("100%", "140px", "14px", "sk-block") +
        "</section>" +
        '<section class="profile-card sk-shell">' +
        bone("140px", "18px") +
        '<div class="profile-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        bone("100%", "88px", "14px") +
        bone("100%", "88px", "14px") +
        bone("100%", "88px", "14px") +
        bone("100%", "88px", "14px") +
        "</div></section></div>"
      );
    },

    message: emptyState,
    notifications: emptyState,
    reviews: emptyState,
    followers: emptyState,
    shop: emptyState,
    "shop-management": emptyState,
    missing: emptyState,
  };

  function emptyState() {
    return (
      '<div class="empty-state page-skeleton-inner sk-shell" style="padding:48px 24px">' +
      bone("64px", "64px", "50%") +
      bone("180px", "22px") +
      bone("min(100%, 280px)", "14px") +
      bone("120px", "42px", "9999px") +
      "</div>"
    );
  }

  function hubSkeleton() {
    return (
      '<nav class="portal-grid page-skeleton-inner" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">' +
      [0, 1, 2]
        .map(function (index) {
          return (
            '<article class="portal-card sk-shell' +
            (index === 0 ? " is-feature" : "") +
            '" style="display:grid;gap:12px;padding:24px;min-height:180px">' +
            bone("36px", "12px") +
            bone(index === 0 ? "40%" : "50%", "22px") +
            bone("90%", "12px") +
            bone("70%", "12px") +
            bone("110px", "14px") +
            "</article>"
          );
        })
        .join("") +
      "</nav>"
    );
  }

  function soonSkeleton() {
    return (
      '<div class="page-skeleton-inner" style="display:grid;gap:14px;max-width:420px;padding-top:24px">' +
      bone("120px", "14px") +
      bone("90px", "12px") +
      bone("60%", "28px") +
      bone("90%", "14px") +
      bone("140px", "14px") +
      "</div>"
    );
  }

  function publicSkeleton() {
    return (
      '<div class="page-skeleton-inner" style="display:grid;gap:18px">' +
      bone("100%", "220px", "0", "sk-block") +
      '<div style="display:grid;grid-template-columns:72px 1fr auto;gap:14px;align-items:center">' +
      bone("72px", "72px", "18px") +
      '<div style="display:grid;gap:8px">' +
      bone("40%", "20px") +
      bone("55%", "12px") +
      bone("30%", "12px") +
      "</div>" +
      bone("110px", "42px", "9999px") +
      "</div>" +
      '<div class="sk-segment" style="display:flex;gap:8px;flex-wrap:wrap">' +
      chips(5, ["64px", "140px", "84px", "84px", "130px"]) +
      "</div>" +
      bone("100%", "180px", "18px", "sk-block") +
      "</div>"
    );
  }

  function resolveTemplate() {
    const body = document.body;
    if (!body) return emptyState;
    if (body.classList.contains("hub")) return hubSkeleton;
    if (body.classList.contains("soon")) return soonSkeleton;
    if (document.querySelector(".public-hero")) return publicSkeleton;
    const page = body.getAttribute("data-page") || "";
    return templates[page] || emptyState;
  }

  function mountTarget() {
    if (document.body && document.body.classList.contains("hub")) {
      return document.querySelector(".hub-frame");
    }
    return (
      document.getElementById("content") ||
      document.querySelector(".soon-frame") ||
      document.querySelector(".public-main")
    );
  }

  function mountBootSkeleton() {
    if (!document.documentElement.classList.contains("is-booting")) return;
    const host = mountTarget();
    if (!host || document.getElementById("stylex-boot-skeleton")) return;
    const node = document.createElement("div");
    node.id = "stylex-boot-skeleton";
    node.className = "page-skeleton";
    node.setAttribute("aria-hidden", "true");
    node.innerHTML = resolveTemplate()();
    if (document.body.classList.contains("hub")) {
      const portals = host.querySelector(".portal-grid");
      if (portals) host.insertBefore(node, portals);
      else host.appendChild(node);
      return;
    }
    host.insertBefore(node, host.firstChild);
  }

  function clearBootSkeleton() {
    const node = document.getElementById("stylex-boot-skeleton");
    if (node) node.remove();
  }

  window.StylexSkeleton = {
    mount: mountBootSkeleton,
    clear: clearBootSkeleton,
    template: function (page) {
      return (templates[page] || emptyState)();
    },
  };

  mountBootSkeleton();
})();
