(function () {
  if (document.body.dataset.page !== "customers") return;

  var customers = [
    customer("c-maya", "Maya Okada", "+95 9 700 110 201", 6, 1, 428000, "2026-11-10T14:20:00.000Z", [
      activity("a1", "2026-11-10T14:20:00.000Z", "purchase", "Purchased", "Cashmere Funnel Coat", 1, 186000, "STX-9021", null, null, "#2c3e50"),
      activity("a2", "2026-11-02T09:15:00.000Z", "purchase", "Order Placed", "Leather Crossbody", 1, 98000, "STX-8894", null, null, "#6b3a2a"),
      activity("a3", "2026-10-18T16:40:00.000Z", "refund", "Refunded", "Silk Scarf", 1, 42000, "STX-8710", "Wrong color received", "Completed", "#5a4570"),
      activity("a4", "2026-10-12T11:05:00.000Z", "purchase", "Purchased", "Silk Scarf", 1, 42000, "STX-8710", null, null, "#5a4570"),
      activity("a5", "2026-09-28T13:30:00.000Z", "other", "Reviewed product", "Cashmere Funnel Coat", null, null, null, "Left a 5-star review", null, "#2c3e50")
    ]),
    customer("c-liam", "Liam Chen", "+95 9 700 110 202", 4, 1, 256000, "2026-11-08T18:05:00.000Z", [
      activity("a1", "2026-11-08T18:05:00.000Z", "purchase", "Purchased", "Black Loafers", 1, 128000, "STX-9004", null, null, "#1f6b4f"),
      activity("a2", "2026-10-30T12:10:00.000Z", "refund", "Refunded", "Cotton Tee", 2, 36000, "STX-8833", "Size too small", "Completed", "#3d4a6b"),
      activity("a3", "2026-10-22T10:00:00.000Z", "purchase", "Order Placed", "Cotton Tee", 2, 36000, "STX-8833", null, null, "#3d4a6b"),
      activity("a4", "2026-09-14T15:45:00.000Z", "purchase", "Purchased", "Wool Beanie", 1, 28000, "STX-8501", null, null, "#6b3a2a")
    ]),
    customer("c-nina", "Nina Borges", "+95 9 700 110 203", 3, 0, 214000, "2026-11-11T08:40:00.000Z", [
      activity("a1", "2026-11-11T08:40:00.000Z", "purchase", "Purchased", "Evening Clutch", 1, 76000, "STX-9055", null, null, "#5a4570"),
      activity("a2", "2026-10-05T19:20:00.000Z", "purchase", "Purchased", "Linen Shirt", 1, 54000, "STX-8622", null, null, "#1f6b4f"),
      activity("a3", "2026-08-19T11:25:00.000Z", "other", "Followed shop", null, null, null, null, "Started following Atelier Noir", null, "#2c3e50")
    ]),
    customer("c-owen", "Owen Park", "+95 9 700 110 204", 5, 0, 312000, "2026-11-06T21:15:00.000Z", [
      activity("a1", "2026-11-06T21:15:00.000Z", "purchase", "Purchased", "Denim Jacket", 1, 118000, "STX-8988", null, null, "#2c3e50"),
      activity("a2", "2026-10-16T09:50:00.000Z", "purchase", "Order Placed", "Canvas Tote", 1, 45000, "STX-8750", null, null, "#6b3a2a"),
      activity("a3", "2026-09-03T14:05:00.000Z", "purchase", "Purchased", "Merino Crew", 2, 98000, "STX-8412", null, null, "#3d4a6b")
    ]),
    customer("c-sara", "Sara Win", "+95 9 700 110 205", 2, 0, 154000, "2026-10-27T17:30:00.000Z", [
      activity("a1", "2026-10-27T17:30:00.000Z", "purchase", "Purchased", "Pleated Skirt", 1, 86000, "STX-8802", null, null, "#5a4570"),
      activity("a2", "2026-09-09T12:55:00.000Z", "purchase", "Purchased", "Ankle Boots", 1, 68000, "STX-8444", null, null, "#1f6b4f")
    ])
  ];

  var query = "";
  var detailId = null;
  var activityFilter = "all";
  var listPage = 1;
  var activityPage = 1;

  function customer(id, name, phone, orders, refunds, spent, lastPurchase, activities) {
    return {
      id: id,
      name: name,
      phone: phone,
      totalOrders: orders,
      totalRefunds: refunds,
      totalSpent: spent,
      lastPurchase: lastPurchase,
      activities: activities
    };
  }
  function activity(id, at, type, badge, product, qty, amount, orderRef, note, status, color) {
    return {
      id: id,
      at: at,
      type: type,
      badge: badge,
      product: product,
      quantity: qty,
      amount: amount,
      orderRef: orderRef,
      note: note,
      status: status,
      color: color || "#2c3e50"
    };
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function customerById(id) { return customers.filter(function (item) { return item.id === id; })[0]; }
  function money(value) {
    return "Ks " + Number(value || 0).toLocaleString();
  }
  function whenStamp(value) {
    return value ? new Date(value).toLocaleString([], { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
  }
  function whenDate(value) {
    return value ? new Date(value).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" }) : "—";
  }
  function initials(name) {
    return String(name || "").split(/\s+/).map(function (part) { return part[0]; }).join("").slice(0, 2).toUpperCase();
  }

  window.getCustomers = function (filter) {
    filter = filter || {};
    var q = (filter.query || "").trim().toLowerCase();
    return customers.filter(function (item) {
      if (!q) return true;
      return (item.name + " " + item.phone).toLowerCase().indexOf(q) !== -1;
    }).map(clone);
  };

  window.getCustomer = function (id) {
    var found = customerById(id);
    return found ? clone(found) : null;
  };

  function renderList() {
    var rows = window.getCustomers({ query: query });
    var paged = window.pageRows(rows, listPage);
    listPage = paged.page;
    var body = document.getElementById("customer-rows");
    body.innerHTML = paged.rows.map(function (item) {
      return (
        "<tr data-customer-row=\"" + escapeHtml(item.id) + "\">" +
          "<td class=\"is-primary\"><strong>" + escapeHtml(item.name) + "</strong></td>" +
          "<td>" + escapeHtml(item.phone) + "</td>" +
          "<td>" + escapeHtml(item.totalOrders) + "</td>" +
          "<td>" + escapeHtml(money(item.totalSpent)) + "</td>" +
          "<td>" + escapeHtml(whenDate(item.lastPurchase)) + "</td>" +
          "<td class=\"is-actions\"><button class=\"btn is-ghost\" type=\"button\" data-open-customer=\"" + escapeHtml(item.id) + "\">View</button></td>" +
        "</tr>"
      );
    }).join("") || '<tr class="is-empty"><td colspan="6">No customers match your search.</td></tr>';
    window.renderPager(document.getElementById("customer-pager"), paged.page, paged.pages, rows.length + (rows.length === 1 ? " customer" : " customers"));
    if (window.enhanceDataTables) window.enhanceDataTables(document.getElementById("customers-list-view"));
  }

  function renderFilters() {
    var filters = [
      { id: "all", label: "All" },
      { id: "purchase", label: "Purchases" },
      { id: "refund", label: "Refunds" },
      { id: "other", label: "Other" }
    ];
    document.getElementById("activity-filters").innerHTML = filters.map(function (item) {
      return '<button type="button" data-activity-filter="' + item.id + '" aria-pressed="' + (activityFilter === item.id) + '">' + item.label + "</button>";
    }).join("");
  }

  function renderDetail() {
    var found = customerById(detailId);
    if (!found) {
      closeDetail(true);
      return;
    }
    document.getElementById("customer-summary").innerHTML =
      '<div class="customer-summary-identity">' +
        '<span class="customer-avatar" aria-hidden="true">' + escapeHtml(initials(found.name)) + "</span>" +
        "<div><h2>" + escapeHtml(found.name) + "</h2><p>" + escapeHtml(found.phone) + "</p></div>" +
      "</div>" +
      '<div class="customer-summary-stats">' +
        '<div><span>Total orders</span><strong>' + escapeHtml(found.totalOrders) + "</strong></div>" +
        '<div><span>Total refunds</span><strong>' + escapeHtml(found.totalRefunds) + "</strong></div>" +
        '<div><span>Total spent</span><strong>' + escapeHtml(money(found.totalSpent)) + "</strong></div>" +
      "</div>";

    var activities = found.activities.filter(function (item) {
      if (activityFilter === "all") return true;
      if (activityFilter === "other") return item.type !== "purchase" && item.type !== "refund";
      return item.type === activityFilter;
    }).slice().sort(function (a, b) { return new Date(b.at) - new Date(a.at); });

    var paged = window.pageRows(activities, activityPage);
    activityPage = paged.page;
    var root = document.getElementById("customer-activity");
    if (!activities.length) {
      root.innerHTML = '<tr class="is-empty"><td colspan="6">No activity in this filter.</td></tr>';
      window.renderPager(document.getElementById("activity-pager"), 1, 1, "0 events");
      if (window.enhanceDataTables) window.enhanceDataTables(document.querySelector(".customer-activity-table"));
      return;
    }
    root.innerHTML = paged.rows.map(function (item) {
      var badgeClass = item.type === "refund" ? " is-refund" : item.type === "purchase" ? " is-purchase" : " is-other";
      var productCell = item.product
        ? '<div class="customer-activity-product"><span class="customer-product-thumb" style="--thumb-color:' + escapeHtml(item.color) + '" aria-hidden="true"></span><strong>' + escapeHtml(item.product) + "</strong></div>"
        : "—";
      var details = [];
      if (item.quantity) details.push("Qty " + item.quantity);
      if (item.note) details.push(item.note);
      if (item.status) details.push(item.status);
      var detailsCell = details.length ? escapeHtml(details.join(" · ")) : "—";
      var amountCell = item.amount != null ? escapeHtml(money(item.amount)) : "—";
      var orderCell = item.orderRef ? escapeHtml(item.orderRef) : "—";
      return (
        "<tr>" +
          "<td class=\"is-primary\"><time datetime=\"" + escapeHtml(item.at) + "\">" + escapeHtml(whenStamp(item.at)) + "</time></td>" +
          "<td><span class=\"customer-badge" + badgeClass + "\">" + escapeHtml(item.badge) + "</span></td>" +
          "<td>" + productCell + "</td>" +
          "<td>" + detailsCell + "</td>" +
          "<td>" + amountCell + "</td>" +
          "<td>" + orderCell + "</td>" +
        "</tr>"
      );
    }).join("");
    window.renderPager(document.getElementById("activity-pager"), paged.page, paged.pages, activities.length + (activities.length === 1 ? " event" : " events"));
    if (window.enhanceDataTables) window.enhanceDataTables(document.querySelector(".customer-activity-table"));
  }

  function openDetail(id, replace) {
    if (!customerById(id)) return;
    detailId = id;
    activityFilter = "all";
    activityPage = 1;
    document.getElementById("customers-list-view").hidden = true;
    document.getElementById("customers-detail-view").hidden = false;
    document.body.classList.add("is-customer-detail");
    renderFilters();
    renderDetail();
    var url = new URL(window.location.href);
    url.searchParams.set("customer", id);
    if (replace) history.replaceState({ customer: id }, "", url.pathname + url.search);
    else history.pushState({ customer: id }, "", url.pathname + url.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeDetail(replace) {
    detailId = null;
    document.getElementById("customers-list-view").hidden = false;
    document.getElementById("customers-detail-view").hidden = true;
    document.body.classList.remove("is-customer-detail");
    renderList();
    var url = new URL(window.location.href);
    url.searchParams.delete("customer");
    if (replace) history.replaceState({}, "", url.pathname + url.search);
    else history.pushState({}, "", url.pathname + url.search);
  }

  var boot = null;
  try { boot = new URLSearchParams(window.location.search).get("customer"); } catch (error) {}
  if (boot && customerById(boot)) openDetail(boot, true);
  else renderList();

  document.getElementById("customer-search").addEventListener("input", function (event) {
    query = event.target.value;
    listPage = 1;
    window.runWithSkeleton(document.getElementById("customer-rows"), renderList, { columns: 6, rows: 5, delay: 240 });
  });

  document.getElementById("customer-pager").addEventListener("click", function (event) {
    var button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    var rows = window.getCustomers({ query: query });
    var paged = window.pageRows(rows, listPage);
    listPage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    window.runWithSkeleton(document.getElementById("customer-rows"), renderList, { columns: 6, rows: 5 });
  });

  document.getElementById("customer-rows").addEventListener("click", function (event) {
    var button = event.target.closest("[data-open-customer]");
    if (button) openDetail(button.dataset.openCustomer, false);
  });

  document.getElementById("customer-back").addEventListener("click", function () {
    closeDetail(false);
  });

  document.getElementById("activity-filters").addEventListener("click", function (event) {
    var button = event.target.closest("[data-activity-filter]");
    if (!button) return;
    activityFilter = button.dataset.activityFilter;
    activityPage = 1;
    renderFilters();
    renderDetail();
  });

  document.getElementById("activity-pager").addEventListener("click", function (event) {
    var button = event.target.closest("[data-page]");
    if (!button || button.disabled || !detailId) return;
    var found = customerById(detailId);
    if (!found) return;
    var activities = found.activities.filter(function (item) {
      if (activityFilter === "all") return true;
      if (activityFilter === "other") return item.type !== "purchase" && item.type !== "refund";
      return item.type === activityFilter;
    });
    var paged = window.pageRows(activities, activityPage);
    activityPage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    renderDetail();
  });

  window.addEventListener("popstate", function () {
    var id = null;
    try { id = new URLSearchParams(window.location.search).get("customer"); } catch (error) {}
    if (id && customerById(id)) openDetail(id, true);
    else if (detailId) closeDetail(true);
  });
})();
