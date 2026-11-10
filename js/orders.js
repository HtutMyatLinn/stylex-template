(function () {
  if (document.body.dataset.page !== "orders") return;

  const FLOW = ["New", "Confirmed", "Processing", "Shipped", "Delivered"];
  const FILTERS = ["All", "New", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled", "Return Requested"];

  const state = {
    screen: "table",
    selectedId: null,
    query: "",
    filter: "All",
    page: 1,
  };

  const orders = createOrders();
  const app = document.getElementById("orders-app");
  const search = document.getElementById("order-search");
  const filters = document.getElementById("order-status-filters");
  const cancelModal = document.getElementById("cancel-modal");

  filters.innerHTML = FILTERS.map((status) => {
    return '<button type="button" data-filter="' + escapeHtml(status) + '" aria-pressed="' + (status === "All" ? "true" : "false") + '">' + escapeHtml(status) + "</button>";
  }).join("");

  app.addEventListener("click", onAppClick);
  search.addEventListener("input", () => {
    state.query = search.value;
    state.page = 1;
    renderTable();
  });
  document.getElementById("order-pager").addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const visible = orders.filter(matchesQuery);
    const paged = window.pageRows(visible, state.page);
    state.page = window.turnPage(paged.page, paged.pages, button.dataset.page);
    renderTable();
  });
  document.getElementById("cancel-form").addEventListener("submit", onCancelSubmit);
  document.getElementById("cancel-detail").addEventListener("input", clearCancelError);
  document.getElementById("cancel-reason").addEventListener("change", clearCancelError);
  document.addEventListener("click", (event) => {
    if (event.target === cancelModal || event.target.closest("[data-close-modal]")) closeModals();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModals();
  });

  render();

  function onAppClick(event) {
    const filter = event.target.closest("[data-filter]");
    const adminView = event.target.closest("[data-view-admin]");
    const back = event.target.closest("[data-back]");
    const update = event.target.closest("[data-update-status]");
    const tracking = event.target.closest("[data-assign-tracking]");
    const note = event.target.closest("[data-add-note]");
    const cancel = event.target.closest("[data-open-cancel]");
    const approve = event.target.closest("[data-approve-return]");
    const refund = event.target.closest("[data-refund]");

    if (filter) {
      state.filter = filter.dataset.filter;
      state.page = 1;
      renderTable();
    }
    if (adminView) openAdminDetail(adminView.dataset.viewAdmin);
    if (back) openScreen("table");
    if (update) window.runWithLoading(update, () => onUpdateStatus(update.dataset.updateStatus));
    if (tracking) window.runWithLoading(tracking, () => onAssignTracking(tracking.dataset.assignTracking));
    if (note) {
      const input = document.getElementById("note-input");
      if (sanitize(input ? input.value : "")) window.runWithLoading(note, () => onAddNote(note.dataset.addNote));
    }
    if (cancel) openCancelModal(cancel.dataset.openCancel);
    if (approve) {
      window.runWithLoading(approve, () => {
        updateReturnStatus(approve.dataset.approveReturn);
        render();
        announce("Return confirmed.");
      });
    }
    if (refund) {
      const order = fetchOrderDetails(refund.dataset.refund);
      const request = order && order.returnRequest;
      if (request && request.validated && !request.refundLocked && !request.refunded) {
        window.runWithLoading(refund, () => {
          initiateRefund(refund.dataset.refund);
          processRefundTransaction(refund.dataset.refund);
          render();
          announce("Refund processed.");
        });
      }
    }
  }

  function openScreen(screen) {
    if (screen === "admin-detail" && !state.selectedId) state.selectedId = orders[0].id;
    if (screen !== "table" && screen !== "admin-detail") return;
    state.screen = screen;
    closeModals();
    render();
  }

  function openAdminDetail(orderId) {
    state.selectedId = orderId;
    state.screen = "admin-detail";
    render();
  }

  function render() {
    document.querySelectorAll("[data-screen-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.screenPanel !== state.screen;
    });
    if (state.screen === "table") renderTable();
    if (state.screen === "admin-detail") renderAdminDetail();
  }

  function renderTable() {
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === state.filter));
    });
    const visible = orders.filter(matchesQuery).sort((a, b) => new Date(b.date) - new Date(a.date));
    const paged = window.pageRows(visible, state.page);
    state.page = paged.page;
    const body = document.getElementById("order-table");
    const filtered = Boolean(state.query.trim()) || state.filter !== "All";
    if (!visible.length) {
      body.innerHTML =
        '<tr class="empty-row"><td colspan="6">' +
        window.emptyState(
          filtered ? "ri-search-line" : "ri-shopping-bag-line",
          filtered ? "No matching orders" : "No orders yet",
          filtered ? "Try another name, order ID, or status." : "Orders from your storefront will collect here."
        ) +
        "</td></tr>";
    } else {
    body.innerHTML = paged.rows.map((order) => {
      const total = calculateOrderTotal(order).total;
      return (
        "<tr data-order-id=\"" + escapeHtml(order.id) + "\" data-status=\"" + escapeHtml(order.status) + "\">" +
          "<td class=\"order-id\" data-field=\"orderId\">#" + escapeHtml(order.id) + "</td>" +
          "<td data-field=\"customerName\">" + escapeHtml(order.customerName) + "</td>" +
          "<td data-field=\"date\">" + escapeHtml(formatDate(order.date)) + "</td>" +
          "<td>" + badge(order.status) + "</td>" +
          "<td data-field=\"total\">" + escapeHtml(money(total)) + "</td>" +
          "<td><button type=\"button\" class=\"btn is-ghost\" data-view-admin=\"" + escapeHtml(order.id) + "\">View details</button></td>" +
        "</tr>"
      );
    }).join("");
    }
    const countLabel = visible.length + (visible.length === 1 ? " order" : " orders");
    window.renderPager(document.getElementById("order-pager"), state.page, paged.pages, countLabel);
  }

  function renderAdminDetail() {
    const order = fetchOrderDetails(state.selectedId);
    const root = document.getElementById("screen-admin-detail");
    if (!order) {
      root.innerHTML = window.emptyState("ri-shopping-bag-line", "Order not found", "Choose an order from the list.");
      return;
    }
    const totals = calculateOrderTotal(order);
    const next = nextStatus(order.status);
    root.innerHTML =
      "<div class=\"detail-head\">" +
        "<h2 data-field=\"orderId\">#" + escapeHtml(order.id) + "</h2>" +
        badge(order.status) +
        "<button type=\"button\" class=\"btn is-ghost\" data-back>All orders</button>" +
      "</div>" +
      "<div class=\"order-detail\">" +
        "<div>" +
          "<section class=\"panel\">" +
            "<h2>Items</h2>" +
            order.items.map(itemRow).join("") +
            totalsBlock(totals) +
          "</section>" +
          "<section class=\"panel\">" +
            "<h2>Delivery and payment</h2>" +
            "<div class=\"addr-grid\">" +
              "<div class=\"addr\"><p class=\"label\">Shipping address</p><p data-field=\"address\">" + escapeHtml(order.address.name) + "<br>" + escapeHtml(order.address.line1) + "<br>" + escapeHtml(order.address.city) + "</p></div>" +
              "<div class=\"addr\"><p class=\"label\">Contact</p><p data-field=\"contact\">" + escapeHtml(order.email) + "<br>" + escapeHtml(order.phone) + "</p></div>" +
              "<div class=\"addr\"><p class=\"label\">Payment</p><p data-field=\"payment\">" + escapeHtml(order.paymentMethod) + "</p></div>" +
            "</div>" +
          "</section>" +
        "</div>" +
        "<div>" +
          statusCard(order, next) +
          (showTracking(order) ? trackingCard(order) : "") +
          notesCard(order) +
          returnCard(order) +
          (order.status === "Cancelled" ? "" : "<section class=\"panel\"><h2>Cancel order</h2><button type=\"button\" class=\"btn is-danger\" data-open-cancel=\"" + escapeHtml(order.id) + "\" data-actor=\"admin\">Cancel order</button></section>") +
        "</div>" +
      "</div>";
    const photoList = document.getElementById("return-photo-list");
    if (photoList && order.returnRequest) fillPhotos(photoList, order.returnRequest.photos);
    const noteList = document.getElementById("note-list");
    if (noteList) fillNotes(noteList, fetchOrderNotes(order.id));
  }

  function statusCard(order, next) {
    const options = FLOW.map((status) => {
      const enabled = status === next;
      return "<option value=\"" + status + "\"" + (enabled ? " selected" : " disabled") + ">" + status + "</option>";
    }).join("");
    const cancelled = order.cancellation
      ? "<p class=\"hint\">" + escapeHtml(order.cancellation.reason) + ". " + escapeHtml(order.cancellation.detail) + "</p>"
      : "";
    return (
      "<section class=\"panel\">" +
        "<h2>Status</h2>" +
        "<p class=\"hint\">Current status: " + escapeHtml(order.status) + "</p>" +
        cancelled +
        "<label class=\"field\"><span>Update status</span><select id=\"status-next\"" + (next ? "" : " disabled") + ">" + (next ? options : "<option>" + escapeHtml(order.status) + "</option>") + "</select></label>" +
        "<button type=\"button\" class=\"btn\" data-update-status=\"" + escapeHtml(order.id) + "\"" + (next ? "" : " disabled") + ">Update status</button>" +
        "<p class=\"field-error\" id=\"status-error\" hidden></p>" +
      "</section>"
    );
  }

  function trackingCard(order) {
    const number = order.tracking ? order.tracking.number : "";
    const link = order.tracking ? order.tracking.url : "";
    return (
      "<section class=\"panel\">" +
        "<h2>Delivery tracking</h2>" +
        "<label class=\"field\"><span>Tracking number</span><input id=\"tracking-number\" data-field=\"trackingNumber\" value=\"" + escapeHtml(number) + "\"></label>" +
        "<label class=\"field\"><span>Carrier link</span><input id=\"tracking-link\" data-field=\"trackingUrl\" value=\"" + escapeHtml(link) + "\"></label>" +
        "<button type=\"button\" class=\"btn\" data-assign-tracking=\"" + escapeHtml(order.id) + "\">Assign tracking</button>" +
        "<p class=\"field-error\" id=\"tracking-error\" hidden>Add a tracking number before shipping.</p>" +
      "</section>"
    );
  }

  function notesCard(order) {
    return (
      "<section class=\"panel\" id=\"admin-notes\">" +
        "<h2>Internal Seller/Admin Notes (Hidden from Customer)</h2>" +
        "<div id=\"note-list\" data-order-id=\"" + escapeHtml(order.id) + "\"></div>" +
        "<label class=\"field\"><span>Add a note</span><textarea id=\"note-input\" rows=\"3\"></textarea></label>" +
        "<button type=\"button\" class=\"btn\" data-add-note=\"" + escapeHtml(order.id) + "\">Add note</button>" +
      "</section>"
    );
  }

  function returnCard(order) {
    const request = order.returnRequest;
    if (!request) {
      return "<section class=\"panel\"><h2>Return and refund</h2>" + window.emptyState("ri-arrow-go-back-line", "No return request", "A buyer return will show up here.", true) + "</section>";
    }
    const refundLabel = request.refunded ? "Refund processed" : request.refundLocked ? "Processing refund…" : "Process refund";
    return (
      "<section class=\"panel\">" +
        "<h2>Return and refund</h2>" +
        "<p data-field=\"returnReason\">" + escapeHtml(request.reason) + "</p>" +
        "<div class=\"previews\" id=\"return-photo-list\"></div>" +
        "<div class=\"action-bar\">" +
          "<button type=\"button\" class=\"btn is-ghost\" data-approve-return=\"" + escapeHtml(order.id) + "\"" + (request.validated ? " disabled" : "") + ">" + (request.validated ? "Return confirmed" : "Approve return") + "</button>" +
          "<button type=\"button\" class=\"btn\" data-refund=\"" + escapeHtml(order.id) + "\"" + (!request.validated || request.refunded || request.refundLocked ? " disabled" : "") + ">" + refundLabel + "</button>" +
        "</div>" +
      "</section>"
    );
  }

  function itemRow(item) {
    return (
      "<article class=\"line-item\" data-name=\"" + escapeHtml(item.name) + "\">" +
        "<div class=\"thumb\" aria-hidden=\"true\"><i class=\"ri-shirt-line\"></i></div>" +
        "<div class=\"line-copy\"><h3>" + escapeHtml(item.name) + "</h3><p>" + escapeHtml(item.color) + " · Size " + escapeHtml(item.size) + " · Qty " + item.qty + "</p></div>" +
        "<div class=\"line-price\"><p>" + escapeHtml(money(item.price)) + "</p><p>" + escapeHtml(money(item.price * item.qty)) + "</p></div>" +
      "</article>"
    );
  }

  function totalsBlock(totals) {
    return (
      "<dl class=\"totals\">" +
        "<div><dt>Subtotal</dt><dd data-field=\"subtotal\">" + escapeHtml(money(totals.subtotal)) + "</dd></div>" +
        "<div><dt>Shipping</dt><dd data-field=\"shipping\">" + escapeHtml(money(totals.shipping)) + "</dd></div>" +
        "<div class=\"is-total\"><dt>Total</dt><dd data-field=\"total\">" + escapeHtml(money(totals.total)) + "</dd></div>" +
      "</dl>"
    );
  }

  function badge(status) {
    const alert = status === "New" || status === "Cancelled" || status === "Return Requested";
    return "<span class=\"status-badge" + (alert ? " is-alert" : "") + "\" data-field=\"status\">" + escapeHtml(status) + "</span>";
  }

  function fillNotes(container, notes) {
    container.replaceChildren();
    if (!notes.length) {
      container.innerHTML = window.emptyState("ri-sticky-note-line", "No notes yet", "Notes stay hidden from the buyer.", true);
      return;
    }
    notes.forEach((note) => {
      const row = document.createElement("article");
      row.className = "note-item";
      const text = document.createElement("p");
      text.dataset.field = "note";
      text.textContent = note.text;
      const time = document.createElement("p");
      time.className = "hint";
      time.dateTime = note.at;
      time.textContent = formatDate(note.at);
      row.append(text, time);
      container.appendChild(row);
    });
  }

  function fillPhotos(container, photos) {
    container.replaceChildren();
    (photos || []).forEach((src) => {
      if (!String(src).startsWith("data:image/")) return;
      const image = document.createElement("img");
      image.src = src;
      image.alt = "Return photo";
      container.appendChild(image);
    });
  }

  function onUpdateStatus(orderId) {
    const select = document.getElementById("status-next");
    const error = document.getElementById("status-error");
    const result = updateOrderStatus(orderId, select ? select.value : "");
    if (result && result.error === "tracking") {
      const trackingError = document.getElementById("tracking-error");
      if (trackingError) trackingError.hidden = false;
      if (error) error.hidden = true;
      return;
    }
    render();
    announce("Status updated.");
  }

  function onAssignTracking(orderId) {
    const number = document.getElementById("tracking-number");
    const link = document.getElementById("tracking-link");
    const saved = assignTrackingNumber(orderId, number ? number.value : "", link ? link.value : "");
    const error = document.getElementById("tracking-error");
    if (!saved) {
      if (error) error.hidden = false;
      return;
    }
    render();
    announce("Tracking number assigned.");
  }

  function onAddNote(orderId) {
    const input = document.getElementById("note-input");
    const added = addOrderNote(orderId, input ? input.value : "");
    if (!added) return;
    render();
    announce("Internal note added.");
  }

  function openCancelModal(orderId) {
    const order = fetchOrderDetails(orderId);
    if (!order || order.status === "Cancelled") return;
    state.selectedId = orderId;
    document.getElementById("cancel-order-label").textContent = "#" + order.id + " · " + order.customerName;
    document.getElementById("cancel-form").reset();
    clearCancelError();
    cancelModal.hidden = false;
    document.getElementById("cancel-reason").focus();
  }

  function closeModals() {
    cancelModal.hidden = true;
  }

  function onCancelSubmit(event) {
    event.preventDefault();
    const reason = document.getElementById("cancel-reason").value;
    const detail = document.getElementById("cancel-detail").value;
    const reasonField = document.getElementById("cancel-reason").closest(".field");
    const detailField = document.getElementById("cancel-detail").closest(".field");
    if (!reason || !sanitize(detail)) {
      reasonField.classList.toggle("is-invalid", !reason);
      detailField.classList.toggle("is-invalid", !sanitize(detail));
      document.getElementById("cancel-error").hidden = false;
      document.getElementById("cancel-detail").setAttribute("aria-invalid", "true");
      return;
    }
    const button = event.submitter;
    window.runWithLoading(button, () => {
      logCancellationReason(state.selectedId, reason, detail);
      cancelOrder(state.selectedId);
      closeModals();
      render();
      announce("Order cancelled.");
    });
  }

  function clearCancelError() {
    document.getElementById("cancel-error").hidden = true;
    document.getElementById("cancel-reason").closest(".field").classList.remove("is-invalid");
    document.getElementById("cancel-detail").closest(".field").classList.remove("is-invalid");
    document.getElementById("cancel-detail").removeAttribute("aria-invalid");
  }

  function fetchOrderDetails(orderId) {
    return orders.find((order) => order.id === orderId) || null;
  }

  function calculateOrderTotal(order) {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    return { subtotal, shipping: order.shippingFee, total: subtotal + order.shippingFee };
  }

  function updateOrderStatus(orderId, status) {
    const order = fetchOrderDetails(orderId);
    if (!order) return { error: "missing" };
    const allowed = nextStatus(order.status);
    if (!allowed || status !== allowed) return { error: "sequence" };
    if (status === "Shipped" && !(order.tracking && sanitize(order.tracking.number))) return { error: "tracking" };
    order.status = status;
    if (status === "Delivered") order.deliveredAt = new Date().toISOString();
    return { ok: true };
  }

  function cancelOrder(orderId) {
    const order = fetchOrderDetails(orderId);
    if (!order || order.status === "Cancelled") return;
    order.status = "Cancelled";
  }

  function logCancellationReason(orderId, reason, detail) {
    const order = fetchOrderDetails(orderId);
    if (!order) return;
    order.cancellation = {
      reason: sanitize(reason),
      detail: sanitize(detail),
      at: new Date().toISOString(),
    };
  }

  function addOrderNote(orderId, text) {
    const clean = sanitize(text);
    if (!clean) return false;
    const order = fetchOrderDetails(orderId);
    if (!order) return false;
    order.notes.push({ text: clean, at: new Date().toISOString() });
    return true;
  }

  function fetchOrderNotes(orderId) {
    const order = fetchOrderDetails(orderId);
    return order ? order.notes.map((note) => ({ text: note.text, at: note.at })) : [];
  }

  function updateReturnStatus(orderId) {
    const order = fetchOrderDetails(orderId);
    if (!order || !order.returnRequest) return;
    order.returnRequest.validated = true;
  }

  function initiateRefund(orderId) {
    const order = fetchOrderDetails(orderId);
    if (!order || !order.returnRequest || !order.returnRequest.validated || order.returnRequest.refunded) return;
    order.returnRequest.refundLocked = true;
  }

  function processRefundTransaction(orderId) {
    const order = fetchOrderDetails(orderId);
    if (!order || !order.returnRequest) return;
    if (!order.returnRequest.validated || !order.returnRequest.refundLocked || order.returnRequest.refunded) return;
    order.returnRequest.refunded = true;
  }

  function assignTrackingNumber(orderId, number, link) {
    const cleanNumber = sanitize(number);
    if (!cleanNumber) return false;
    const order = fetchOrderDetails(orderId);
    if (!order) return false;
    const url = safeUrl(link) || "https://example.com/track/" + encodeURIComponent(cleanNumber);
    order.tracking = { number: cleanNumber, carrier: "Stylex Courier", url };
    return true;
  }

  function nextStatus(status) {
    const index = FLOW.indexOf(status);
    if (index < 0 || index === FLOW.length - 1) return null;
    return FLOW[index + 1];
  }

  function matchesQuery(order) {
    const query = state.query.trim().toLowerCase().replace(/^#/, "");
    const haystack = (order.id + " " + order.customerName).toLowerCase();
    const textOk = !query || haystack.includes(query);
    const statusOk = state.filter === "All" || order.status === state.filter;
    return textOk && statusOk;
  }

  function showTracking(order) {
    return ["Processing", "Shipped", "Delivered", "Return Requested"].includes(order.status);
  }

  function announce(message) {
    const node = document.getElementById("order-status-live");
    if (node) {
      node.textContent = "";
      window.setTimeout(() => {
        node.textContent = message;
      }, 20);
    }
    window.showToast(message);
  }

  function money(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function daysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  }

  function sanitize(value) {
    const holder = document.createElement("div");
    holder.textContent = String(value == null ? "" : value);
    return holder.textContent.replace(/\s+/g, " ").trim();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;");
  }

  function safeUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol === "http:" || url.protocol === "https:") return url.href;
    } catch (error) {
      return "";
    }
    return "";
  }

  function createOrders() {
    return [
      {
        id: "STX-9012",
        customerName: "Amelia Cho",
        email: "amelia.cho@email.com",
        phone: "+1 212 555 0148",
        date: daysAgo(0),
        status: "New",
        paymentMethod: "Visa ···· 4242",
        shippingFee: 18,
        address: { name: "Amelia Cho", line1: "18 Mercer Street", city: "New York, NY 10013" },
        items: [
          { name: "Ivory Silk Column Dress", color: "Ivory", size: "4", qty: 1, price: 420 },
          { name: "Gold-Hardware Mini Bag", color: "Gold", size: "One", qty: 1, price: 260 },
        ],
        tracking: null,
        notes: [],
        returnRequest: null,
        cancellation: null,
        deliveredAt: null,
      },
      {
        id: "STX-8988",
        customerName: "Jonah Ellis",
        email: "jonah.ellis@email.com",
        phone: "+33 1 42 00 18 20",
        date: daysAgo(1),
        status: "Confirmed",
        paymentMethod: "Mastercard ···· 5512",
        shippingFee: 0,
        address: { name: "Jonah Ellis", line1: "44 Rue des Archives", city: "75004 Paris" },
        items: [{ name: "Noir Tailored Wool Blazer", color: "Black", size: "40", qty: 1, price: 580 }],
        tracking: null,
        notes: [],
        returnRequest: null,
        cancellation: null,
        deliveredAt: null,
      },
      {
        id: "STX-8871",
        customerName: "Sofia Marchetti",
        email: "sofia.marchetti@email.com",
        phone: "+39 02 555 019",
        date: daysAgo(3),
        status: "Processing",
        paymentMethod: "Amex ···· 1008",
        shippingFee: 24,
        address: { name: "Sofia Marchetti", line1: "Via della Spiga 12", city: "20121 Milan" },
        items: [
          { name: "Cashmere Funnel Coat", color: "Camel", size: "S", qty: 1, price: 890 },
          { name: "Merino Fine-Knit Polo", color: "Chalk", size: "M", qty: 2, price: 140 },
        ],
        tracking: null,
        notes: [
          { text: "Waiting on supplier", at: daysAgo(2) },
          { text: "Fragile packaging needed", at: daysAgo(1) },
        ],
        returnRequest: null,
        cancellation: null,
        deliveredAt: null,
      },
      {
        id: "STX-8740",
        customerName: "Leo Park",
        email: "leo.park@email.com",
        phone: "+82 2 555 0177",
        date: daysAgo(6),
        status: "Shipped",
        paymentMethod: "Visa ···· 1881",
        shippingFee: 12,
        address: { name: "Leo Park", line1: "18 Apgujeong-ro", city: "Seoul 06010" },
        items: [{ name: "Sculpt Leather Ankle Boot", color: "Black", size: "42", qty: 1, price: 640 }],
        tracking: { number: "STX-TRK-44190", carrier: "Stylex Courier", url: "https://example.com/track/STX-TRK-44190" },
        notes: [],
        returnRequest: null,
        cancellation: null,
        deliveredAt: null,
      },
      {
        id: "STX-8602",
        customerName: "Priya Nair",
        email: "priya.nair@email.com",
        phone: "+44 20 7946 0991",
        date: daysAgo(8),
        status: "Return Requested",
        paymentMethod: "Visa ···· 9090",
        shippingFee: 16,
        address: { name: "Priya Nair", line1: "21 Floral Street", city: "London WC2E 9DP" },
        items: [
          { name: "Pleated Satin Midi Skirt", color: "Champagne", size: "6", qty: 1, price: 310 },
          { name: "Organza Evening Shirt", color: "Ivory", size: "4", qty: 1, price: 240 },
        ],
        tracking: { number: "STX-TRK-22018", carrier: "Stylex Courier", url: "https://example.com/track/STX-TRK-22018" },
        notes: [],
        returnRequest: {
          reason: "The hem stitching came loose after one wear.",
          photos: [],
          validated: false,
          refunded: false,
          refundLocked: false,
          at: daysAgo(1),
        },
        cancellation: null,
        deliveredAt: daysAgo(2),
      },
    ].concat(extraOrders());
  }

  function extraOrders() {
    const people = ["Mina Chen", "Omar Rahman", "Clara Lind", "Jules Moreau", "Hana Kato", "Soren Blake", "Ayo Nwosu", "Eva Petrov", "Noah Adler", "Isla Moretti", "Kenji Sato", "Freya Holm", "Mateo Ruiz", "Noor El-Sayed", "Camille Berger", "Hugo Stein", "Yara Costa", "Felix Nguyen", "Anika Bose", "Leila Haddad", "Owen Clarke", "Sable Okonkwo", "Theo Marin", "Ines Duarte"];
    const cities = ["New York, NY 10013", "75004 Paris", "20121 Milan", "Seoul 06010", "London WC2E 9DP", "Los Angeles, CA 90012", "Tokyo 150-0001", "Berlin 10115", "Singapore 238801", "Sydney NSW 2000"];
    const pieces = [
      ["Ivory Silk Column Dress", "Ivory", 420, ["2", "4", "6"]],
      ["Noir Tailored Wool Blazer", "Black", 580, ["38", "40", "42"]],
      ["Cashmere Funnel Coat", "Camel", 890, ["XS", "S", "M"]],
      ["Sculpt Leather Ankle Boot", "Black", 640, ["40", "41", "42"]],
      ["Pleated Satin Midi Skirt", "Champagne", 310, ["4", "6", "8"]],
      ["Organza Evening Shirt", "Ivory", 240, ["2", "4", "6"]],
      ["Gold-Hardware Mini Bag", "Gold", 260, ["One"]],
      ["Merino Fine-Knit Polo", "Chalk", 140, ["S", "M", "L"]],
    ];
    const payments = ["Visa ···· 4242", "Mastercard ···· 5512", "Amex ···· 1008", "Visa ···· 1881", "Visa ···· 9090"];
    const statuses = ["New", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled", "Return Requested"];
    const rows = [];
    for (let index = 0; index < 115; index += 1) {
      const person = people[index % people.length];
      const piece = pieces[index % pieces.length];
      const extraPiece = pieces[(index + 3) % pieces.length];
      const status = statuses[index % statuses.length];
      const when = new Date();
      when.setDate(when.getDate() - 9);
      when.setHours(when.getHours() - index * 7);
      const slug = person.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");
      const trackingNumber = "STX-TRK-" + (51000 + index);
      const needsTracking = status === "Shipped" || status === "Delivered" || status === "Return Requested";
      const items = [{ name: piece[0], color: piece[1], size: piece[3][index % piece[3].length], qty: 1, price: piece[2] }];
      if (index % 4 === 0) items.push({ name: extraPiece[0], color: extraPiece[1], size: extraPiece[3][0], qty: 1, price: extraPiece[2] });
      rows.push({
        id: "STX-" + (8300 - index),
        customerName: person,
        email: slug + index + "@email.com",
        phone: "+1 415 555 " + String(1000 + index),
        date: when.toISOString(),
        status: status,
        paymentMethod: payments[index % payments.length],
        shippingFee: [0, 12, 16, 18, 24][index % 5],
        address: { name: person, line1: (12 + (index % 80)) + " Atelier Street", city: cities[index % cities.length] },
        items: items,
        tracking: needsTracking ? { number: trackingNumber, carrier: "Stylex Courier", url: "https://example.com/track/" + trackingNumber } : null,
        notes: index % 11 === 0 ? [{ text: "Gift wrap requested.", at: when.toISOString() }] : [],
        returnRequest: status === "Return Requested" ? { reason: "The fit was not as expected.", photos: [], validated: index % 2 === 0, refunded: false, refundLocked: false, at: when.toISOString() } : null,
        cancellation: status === "Cancelled" ? { reason: "Changed mind", detail: "The buyer asked to stop this order.", at: when.toISOString() } : null,
        deliveredAt: status === "Delivered" || status === "Return Requested" ? when.toISOString() : null,
      });
    }
    return rows;
  }
})();
