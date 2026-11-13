(function () {
  if (document.body.dataset.page !== "finance") return;

  const COMMISSION_RATE = 0.1;
  const MIN_WITHDRAWAL = 10000;
  const MMK_PER_USD = 2100;
  const CENTRAL_BALANCE = 12600000;
  const ADMIN = { id: "ADM-014", name: "Stylex Admin" };

  const TREND = [
    { label: "Dec", gross: 82000000 },
    { label: "Jan", gross: 76000000 },
    { label: "Feb", gross: 91000000 },
    { label: "Mar", gross: 88000000 },
    { label: "Apr", gross: 104000000 },
    { label: "May", gross: 97000000 },
    { label: "Jun", gross: 112000000 },
    { label: "Jul", gross: 121000000 },
    { label: "Aug", gross: 109000000 },
    { label: "Sep", gross: 128000000 },
    { label: "Oct", gross: 118000000 },
    { label: "Nov", gross: 134000000 },
  ].map((row) => ({ ...row, commission: Math.round(row.gross * COMMISSION_RATE) }));

  const transactions = [
    { id: "TXN-99201", at: "2026-11-08T09:14:00", ref: "STX-9012", seller: "Atelier Noir", type: "credit", gross: 84000000, commission: 8400000, state: "Cleared", status: "Completed" },
    { id: "TXN-99214", at: "2026-11-09T16:40:00", ref: "STX-9018", seller: "Silk Room", type: "credit", gross: 21000000, commission: 2100000, state: "Pending Clearing", status: "Clearing" },
    { id: "TXN-99228", at: "2026-11-06T11:05:00", ref: "STX-9004", seller: "Linen House", type: "credit", gross: 42000000, commission: 4200000, state: "Cleared", status: "Completed" },
    { id: "TXN-99233", at: "2026-11-10T07:55:00", ref: "STX-9024", seller: "Studio Kite", type: "credit", gross: 12600000, commission: 1260000, state: "Pending Clearing", status: "Clearing" },
    { id: "TXN-99188", at: "2026-11-04T13:22:00", ref: "STX-8988", seller: "Atelier Noir", type: "debit", gross: 6300000, commission: 630000, state: "Cleared", status: "Refunded" },
    { id: "TXN-99170", at: "2026-11-02T08:10:00", ref: "PAY-7710", seller: "Atelier Noir", type: "debit", gross: 42000000, commission: 0, state: "Cleared", status: "Paid" },
    { id: "TXN-99090", at: "2026-11-01T18:00:00", ref: "FEE-NOV", seller: "Stylex", type: "commission", gross: 12600000, commission: 12600000, state: "Cleared", status: "Posted" },
  ];

  const withdrawals = [
    { id: "WDR-4021", seller: "Atelier Noir", amount: 15750000, bank: "KBZ Bank", account: "001234567890", holder: "Atelier Noir Co.", at: "2026-11-10T08:20:00", status: "Pending", reason: "" },
    { id: "WDR-4018", seller: "Linen House", amount: 10500000, bank: "AYA Bank", account: "009988776655", holder: "Linen House Ltd", at: "2026-11-09T14:02:00", status: "Pending", reason: "" },
    { id: "WDR-4012", seller: "Silk Room", amount: 8400000, bank: "CB Bank", account: "445566778899", holder: "Silk Room", at: "2026-11-07T10:11:00", status: "Approved", reason: "" },
    { id: "WDR-4004", seller: "Studio Kite", amount: 8000, bank: "YOMA Bank", account: "112233445566", holder: "Studio Kite", at: "2026-11-05T09:40:00", status: "Rejected", reason: "Below the 10,000 MMK minimum." },
  ];

  const payouts = [
    { id: "PAY-7710", at: "2026-11-02T08:10:00", bank: "KBZ Bank", account: "001234567890", amount: 42000000, receipt: "KBZ-REF-20261102-881", admin: ADMIN.name, seller: "Atelier Noir" },
    { id: "PAY-7688", at: "2026-10-18T11:30:00", bank: "AYA Bank", account: "009988776655", amount: 21000000, receipt: "AYA-REF-20261018-214", admin: ADMIN.name, seller: "Linen House" },
  ];

  const invoices = [
    { number: "INV-2026-0891", order: "STX-9012", customer: "Amelia Cho", at: "2026-11-08T09:14:00", total: 84000000, seller: "Atelier Noir" },
    { number: "INV-2026-0884", order: "STX-9004", customer: "Jonah Ellis", at: "2026-11-06T11:05:00", total: 42000000, seller: "Linen House" },
    { number: "INV-2026-0896", order: "STX-9018", customer: "Sofia Marchetti", at: "2026-11-09T16:40:00", total: 21000000, seller: "Silk Room" },
    { number: "INV-2026-0902", order: "STX-9024", customer: "Leo Park", at: "2026-11-10T07:55:00", total: 12600000, seller: "Studio Kite" },
  ];

  const audit = [
    { at: "2026-11-10T07:55:00", admin: ADMIN.id + " · " + ADMIN.name, action: "INVOICE_GENERATED", target: "INV-2026-0902", key: "—" },
    { at: "2026-11-09T16:40:00", admin: ADMIN.id + " · " + ADMIN.name, action: "INVOICE_GENERATED", target: "INV-2026-0896", key: "—" },
    { at: "2026-11-08T09:14:00", admin: ADMIN.id + " · " + ADMIN.name, action: "INVOICE_GENERATED", target: "INV-2026-0891", key: "—" },
    { at: "2026-11-07T10:12:00", admin: ADMIN.id + " · " + ADMIN.name, action: "WITHDRAWAL_APPROVED", target: "WDR-4012", key: "idem_seed4012" },
    { at: "2026-11-05T09:41:00", admin: ADMIN.id + " · " + ADMIN.name, action: "WITHDRAWAL_REJECTED", target: "WDR-4004", key: "idem_seed4004" },
    { at: "2026-11-02T08:11:00", admin: ADMIN.id + " · " + ADMIN.name, action: "PAYOUT_COMPLETED", target: "PAY-7710", key: "KBZ-REF-20261102-881" },
  ];

  let trendSpan = 6;
  let withdrawalFilter = "all";
  let withdrawalPage = 1;
  let ledgerPage = 1;
  let payoutPage = 1;
  let invoicePage = 1;
  let auditPage = 1;
  let chart = null;
  let activeModal = null;
  let pendingDecision = null;
  let bannerDismissed = false;

  function lineNet(row) {
    if (row.type === "credit") return row.gross - row.commission;
    if (row.type === "debit") return -(row.gross - row.commission);
    return -row.commission;
  }

  function formatMmk(amount) {
    const sign = amount < 0 ? "−" : "";
    return sign + Math.abs(Math.round(amount)).toLocaleString("en-US") + " MMK";
  }

  function formatUsd(amount) {
    const usd = amount / MMK_PER_USD;
    const sign = usd < 0 ? "−" : "";
    return sign + "$" + Math.abs(usd).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatWhen(iso) {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function maskAccount(account) {
    const digits = String(account).replace(/\s/g, "");
    return "•••• " + digits.slice(-4);
  }

  function moneyCell(amount, signed) {
    const value = signed ? amount : Math.abs(amount);
    const klass = value < 0 ? "is-debit" : "is-credit";
    return '<span class="' + klass + '">' + formatMmk(value) + "</span>" + '<span class="finance-meta">' + formatUsd(value) + "</span>";
  }

  function badge(status) {
    const kind = status === "Approved" || status === "Credit" || status === "Completed" || status === "Cleared" || status === "Paid" || status === "Posted"
      ? "is-approved"
      : status === "Rejected" || status === "Debit" || status === "Refunded"
        ? "is-rejected"
        : status === "Commission"
          ? "is-commission"
          : "is-pending";
    return '<span class="finance-badge ' + kind + '">' + escapeHtml(status) + "</span>";
  }

  function emptyRow(columns, title, text) {
    return '<tr><td colspan="' + columns + '">' + window.emptyState("ri-wallet-line", title, text, true) + "</td></tr>";
  }

  window.calculatePendingBalance = function () {
    return transactions
      .filter((row) => row.type === "credit" && row.state === "Pending Clearing")
      .reduce((sum, row) => sum + lineNet(row), 0);
  };

  window.calculateAvailableBalance = function () {
    return transactions
      .filter((row) => row.state === "Cleared" && row.type !== "commission")
      .reduce((sum, row) => sum + lineNet(row), 0);
  };

  window.calculatePlatformCommission = function () {
    return Math.round(TREND.reduce((sum, row) => sum + row.gross, 0) * COMMISSION_RATE);
  };

  window.fetchTransactions = function (filters) {
    const query = (filters && filters.query ? filters.query : "").trim().toLowerCase();
    const type = filters && filters.type ? filters.type : "all";
    const from = filters && filters.from ? filters.from : "";
    const to = filters && filters.to ? filters.to : "";
    return transactions.filter((row) => {
      const day = row.at.slice(0, 10);
      if (query && !row.id.toLowerCase().includes(query) && !row.ref.toLowerCase().includes(query)) return false;
      if (type !== "all" && row.type !== type) return false;
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
  };

  window.fetchPayoutLogs = function (query) {
    const text = (query || "").trim().toLowerCase();
    if (!text) return payouts.slice();
    return payouts.filter((row) => {
      return row.id.toLowerCase().includes(text) || row.bank.toLowerCase().includes(text) || row.receipt.toLowerCase().includes(text);
    });
  };

  function nextNumericId(list, key, prefix) {
    const max = list.reduce((highest, row) => {
      const value = Number(String(row[key]).replace(/\D/g, ""));
      return Math.max(highest, value);
    }, 0);
    return prefix + (max + 1);
  }

  function logAudit(action, target, key) {
    audit.unshift({
      at: new Date().toISOString(),
      admin: ADMIN.id + " · " + ADMIN.name,
      action: action,
      target: target,
      key: key || "—",
    });
  }

  window.processWithdrawalRequest = function (input) {
    const amount = Number(input.amount);
    const seller = String(input.seller || "").trim();
    const bank = String(input.bank || "").trim();
    const account = String(input.account || "").trim();
    const holder = String(input.holder || "").trim();
    if (!seller || !bank || !account || !holder) {
      return { ok: false, error: "Seller, bank, account number, and account holder are required." };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, error: "Enter a withdrawal amount." };
    }
    if (amount < MIN_WITHDRAWAL) {
      return { ok: false, error: "Minimum withdrawal is 10,000 MMK." };
    }
    if (amount > window.calculateAvailableBalance()) {
      return { ok: false, error: "Amount exceeds the available balance of " + formatMmk(window.calculateAvailableBalance()) + "." };
    }
    const request = {
      id: nextNumericId(withdrawals, "id", "WDR-"),
      seller: seller,
      amount: Math.round(amount),
      bank: bank,
      account: account,
      holder: holder,
      at: new Date().toISOString(),
      status: "Pending",
      reason: "",
    };
    withdrawals.unshift(request);
    logAudit("WITHDRAWAL_REQUESTED", request.id, "—");
    bannerDismissed = false;
    return { ok: true, request: request };
  };

  window.updatePayoutStatus = function (id, status, meta) {
    const request = withdrawals.find((row) => row.id === id);
    if (!request) return { ok: false, error: "Request not found." };
    if (request.status !== "Pending") return { ok: false, error: "This request was already processed." };
    request.status = status;
    request.reason = meta && meta.reason ? meta.reason : "";
    const key = meta && meta.idempotencyKey ? meta.idempotencyKey : "—";
    logAudit(status === "Approved" ? "WITHDRAWAL_APPROVED" : "WITHDRAWAL_REJECTED", id, key);
    return { ok: true, request: request };
  };

  window.generateInvoicePDF = function (invoice) {
    const payload = JSON.stringify({ inv: invoice.number, exp: Date.now() + 300000 });
    const token = btoa(payload).replace(/=+$/g, "");
    return {
      invoice: invoice,
      token: token,
      expiresIn: "300s",
      url: "invoices/" + invoice.number + ".pdf?token=" + token + "&expires=300s",
    };
  };

  window.downloadInvoice = function (invoiceNumber) {
    const invoice = invoices.find((row) => row.number === invoiceNumber);
    if (!invoice) return { ok: false };
    const file = window.generateInvoicePDF(invoice);
    logAudit("INVOICE_DOWNLOADED", invoice.number, file.token.slice(0, 16) + "…");
    renderAudit();
    openInvoice(file);
    window.showToast("Invoice ready. Signed link expires in 300s.");
    return file;
  };

  function rowsToCsv(rows) {
    if (!rows.length) return "";
    const keys = Object.keys(rows[0]);
    const lines = [keys.join(",")];
    rows.forEach((row) => {
      lines.push(keys.map((key) => '"' + String(row[key]).replace(/"/g, '""') + '"').join(","));
    });
    return lines.join("\n");
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function datasetFor(scope) {
    if (scope === "ledger") {
      return window.fetchTransactions(ledgerFilters()).map((row) => ({
        date: formatWhen(row.at),
        transactionId: row.id,
        reference: row.ref,
        type: row.type,
        grossMmk: row.gross,
        commissionMmk: row.commission,
        netMmk: lineNet(row),
        state: row.state,
        status: row.status,
      }));
    }
    if (scope === "payouts") {
      return window.fetchPayoutLogs(document.getElementById("payout-search").value).map((row) => ({
        date: formatWhen(row.at),
        payoutId: row.id,
        bank: row.bank,
        account: maskAccount(row.account),
        amountMmk: row.amount,
        receipt: row.receipt,
        admin: row.admin,
      }));
    }
    return [
      { metric: "Total Marketplace Revenue", mmk: yearRevenue(), usd: formatUsd(yearRevenue()) },
      { metric: "Pending Balance", mmk: window.calculatePendingBalance(), usd: formatUsd(window.calculatePendingBalance()) },
      { metric: "Available Balance", mmk: window.calculateAvailableBalance(), usd: formatUsd(window.calculateAvailableBalance()) },
      { metric: "Platform Commission", mmk: window.calculatePlatformCommission(), usd: formatUsd(window.calculatePlatformCommission()) },
    ];
  }

  window.exportToCSV = function (filename, rows) {
    if (!rows.length) {
      window.showToast("Nothing to export.");
      return;
    }
    downloadFile(rowsToCsv(rows), filename + ".csv", "text/csv;charset=utf-8");
    window.showToast("CSV file downloaded.");
  };

  window.exportToExcel = function (filename, rows) {
    if (!rows.length) {
      window.showToast("Nothing to export.");
      return;
    }
    const keys = Object.keys(rows[0]);
    const head = keys.map((key) => "<th>" + escapeHtml(key) + "</th>").join("");
    const body = rows.map((row) => "<tr>" + keys.map((key) => "<td>" + escapeHtml(row[key]) + "</td>").join("") + "</tr>").join("");
    downloadFile("<table><tr>" + head + "</tr>" + body + "</table>", filename + ".xls", "application/vnd.ms-excel");
    window.showToast("Excel file downloaded.");
  };

  function yearRevenue() {
    return TREND.reduce((sum, row) => sum + row.gross, 0);
  }

  function setMoney(id, amount) {
    document.getElementById(id).textContent = formatMmk(amount);
    document.getElementById(id + "-usd").textContent = formatUsd(amount);
  }

  function renderStats() {
    setMoney("stat-total-revenue", yearRevenue());
    setMoney("stat-pending-balance", window.calculatePendingBalance());
    setMoney("stat-available-balance", window.calculateAvailableBalance());
    setMoney("stat-platform-commission", window.calculatePlatformCommission());
    document.getElementById("commission-rate").textContent = Math.round(COMMISSION_RATE * 100) + "%";
  }

  function pendingCount() {
    return withdrawals.filter((row) => row.status === "Pending").length;
  }

  function renderAlerts() {
    const count = pendingCount();
    const pendingAmount = withdrawals.filter((row) => row.status === "Pending").reduce((sum, row) => sum + row.amount, 0);
    const tabCount = document.getElementById("withdrawal-tab-count");
    const alertCount = document.getElementById("withdrawal-alert-count");
    tabCount.textContent = String(count);
    tabCount.hidden = count === 0;
    alertCount.textContent = count + " new";
    const banner = document.getElementById("low-balance-banner");
    const show = !bannerDismissed && pendingAmount > CENTRAL_BALANCE;
    banner.hidden = !show;
  }

  function renderWithdrawals() {
    const rows = withdrawals.filter((row) => withdrawalFilter === "all" || row.status === withdrawalFilter);
    const paged = window.pageRows(rows, withdrawalPage);
    withdrawalPage = paged.page;
    const body = document.getElementById("withdrawal-table");
    if (!rows.length) {
      body.innerHTML = emptyRow(7, "No requests", "Nothing matches this status.");
      window.renderPager(document.getElementById("withdrawal-pager"), 1, 1, "0 requests");
      return;
    }
    body.innerHTML = paged.rows.map((row) => {
      const actions = row.status === "Pending"
        ? '<div class="row-actions"><button class="btn" type="button" data-approve="' + row.id + '">Approve</button><button class="btn is-danger" type="button" data-reject="' + row.id + '">Reject</button></div>'
        : '<span class="finance-meta">' + (row.reason ? escapeHtml(row.reason) : "Recorded") + "</span>";
      return "<tr data-request-id=\"" + row.id + "\">" +
        "<td class=\"finance-id\">#" + escapeHtml(row.id) + "</td>" +
        "<td>" + escapeHtml(row.seller) + "</td>" +
        "<td>" + moneyCell(row.amount) + "</td>" +
        "<td>" + escapeHtml(row.bank) + "<span class=\"finance-meta\">" + escapeHtml(row.account) + " · " + escapeHtml(row.holder) + "</span></td>" +
        "<td>" + escapeHtml(formatWhen(row.at)) + "</td>" +
        "<td>" + badge(row.status) + "</td>" +
        "<td>" + actions + "</td>" +
        "</tr>";
    }).join("");
    window.renderPager(document.getElementById("withdrawal-pager"), paged.page, paged.pages, rows.length + (rows.length === 1 ? " request" : " requests"));
  }

  function ledgerFilters() {
    return {
      query: document.getElementById("ledger-search").value,
      from: document.getElementById("ledger-from").value,
      to: document.getElementById("ledger-to").value,
      type: document.getElementById("ledger-type").value,
    };
  }

  function renderLedger() {
    const rows = window.fetchTransactions(ledgerFilters());
    const paged = window.pageRows(rows, ledgerPage);
    ledgerPage = paged.page;
    const body = document.getElementById("ledger-table");
    if (!rows.length) {
      body.innerHTML = emptyRow(9, "No transactions", "Try another search, date range, or type.");
      window.renderPager(document.getElementById("ledger-pager"), 1, 1, "0 transactions");
      return;
    }
    body.innerHTML = paged.rows.map((row) => {
      const typeLabel = row.type === "credit" ? "Credit" : row.type === "debit" ? "Debit" : "Commission";
      return "<tr>" +
        "<td>" + escapeHtml(formatWhen(row.at)) + "</td>" +
        "<td class=\"finance-id\">#" + escapeHtml(row.id) + "</td>" +
        "<td>#" + escapeHtml(row.ref) + "<span class=\"finance-meta\">" + escapeHtml(row.seller) + "</span></td>" +
        "<td>" + badge(typeLabel) + "</td>" +
        "<td>" + moneyCell(row.gross) + "</td>" +
        "<td>" + moneyCell(row.commission) + "</td>" +
        "<td>" + moneyCell(lineNet(row), true) + "</td>" +
        "<td>" + escapeHtml(row.state) + "</td>" +
        "<td>" + escapeHtml(row.status) + "</td>" +
        "</tr>";
    }).join("");
    window.renderPager(document.getElementById("ledger-pager"), paged.page, paged.pages, rows.length + (rows.length === 1 ? " transaction" : " transactions"));
  }

  function renderPayouts() {
    const rows = window.fetchPayoutLogs(document.getElementById("payout-search").value);
    const paged = window.pageRows(rows, payoutPage);
    payoutPage = paged.page;
    const body = document.getElementById("payout-table");
    if (!rows.length) {
      body.innerHTML = emptyRow(7, "No payouts", "No completed payout matches that search.");
      window.renderPager(document.getElementById("payout-pager"), 1, 1, "0 payouts");
      return;
    }
    body.innerHTML = paged.rows.map((row) => {
      return "<tr>" +
        "<td>" + escapeHtml(formatWhen(row.at)) + "</td>" +
        "<td class=\"finance-id\">#" + escapeHtml(row.id) + "</td>" +
        "<td>" + escapeHtml(row.bank) + "<span class=\"finance-meta\">" + escapeHtml(maskAccount(row.account)) + " · " + escapeHtml(row.seller) + "</span></td>" +
        "<td>" + moneyCell(row.amount) + "</td>" +
        "<td class=\"finance-id\">" + escapeHtml(row.receipt) + "</td>" +
        "<td>" + escapeHtml(row.admin) + "</td>" +
        "<td><button class=\"btn is-ghost\" type=\"button\" data-receipt=\"" + row.id + "\">View Receipt</button></td>" +
        "</tr>";
    }).join("");
    window.renderPager(document.getElementById("payout-pager"), paged.page, paged.pages, rows.length + (rows.length === 1 ? " payout" : " payouts"));
  }

  function renderInvoices() {
    const paged = window.pageRows(invoices, invoicePage);
    invoicePage = paged.page;
    document.getElementById("invoice-table").innerHTML = paged.rows.map((row) => {
      return "<tr>" +
        "<td class=\"finance-id\">#" + escapeHtml(row.number) + "</td>" +
        "<td>#" + escapeHtml(row.order) + "</td>" +
        "<td>" + escapeHtml(row.customer) + "</td>" +
        "<td>" + escapeHtml(formatWhen(row.at)) + "</td>" +
        "<td>" + moneyCell(row.total) + "</td>" +
        "<td><button class=\"btn is-ghost\" type=\"button\" data-invoice=\"" + row.number + "\">Download PDF</button></td>" +
        "</tr>";
    }).join("") || emptyRow(6, "No invoices", "Delivered orders will appear here.");
    window.renderPager(document.getElementById("invoice-pager"), paged.page, paged.pages, invoices.length + (invoices.length === 1 ? " invoice" : " invoices"));
  }

  function renderAudit() {
    const paged = window.pageRows(audit, auditPage);
    auditPage = paged.page;
    document.getElementById("audit-table").innerHTML = paged.rows.map((row) => {
      return "<tr>" +
        "<td>" + escapeHtml(formatWhen(row.at)) + "</td>" +
        "<td>" + escapeHtml(row.admin) + "</td>" +
        "<td class=\"finance-id\">" + escapeHtml(row.action) + "</td>" +
        "<td>" + escapeHtml(row.target) + "</td>" +
        "<td class=\"finance-id\">" + escapeHtml(row.key) + "</td>" +
        "</tr>";
    }).join("") || emptyRow(5, "No audit events", "Sensitive actions will be logged here.");
    window.renderPager(document.getElementById("audit-pager"), paged.page, paged.pages, audit.length + (audit.length === 1 ? " event" : " events"));
  }

  function cssColor(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function renderChart() {
    if (document.documentElement.classList.contains("is-booting")) {
      if (window.whenPageReady) window.whenPageReady(renderChart);
      else document.addEventListener("stylex-ready", renderChart, { once: true });
      return;
    }
    const slice = TREND.slice(TREND.length - trendSpan);
    const canvas = document.getElementById("financeTrendChart");
    const ink = cssColor("--color-black");
    const line = cssColor("--color-border");
    const red = cssColor("--color-red");
    document.getElementById("trend-range").textContent = trendSpan === 6 ? "Jun – Nov 2026" : "Dec 2025 – Nov 2026";
    if (typeof Chart === "undefined") {
      canvas.insertAdjacentHTML("afterend", "<p class=\"field-error\">Chart could not be loaded.</p>");
      return;
    }
    const payload = {
      labels: slice.map((row) => row.label),
      datasets: [
        {
          label: "Gross revenue",
          data: slice.map((row) => row.gross),
          borderColor: ink,
          backgroundColor: ink,
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 1.5,
        },
        {
          label: "Commission",
          data: slice.map((row) => row.commission),
          borderColor: red,
          backgroundColor: red,
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 1.5,
        },
      ],
    };
    const firstPaint = !chart;
    const options = {
      animation: firstPaint ? { duration: 900, easing: "easeOutQuart" } : false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: ink, boxWidth: 12, font: { family: "Be Vietnam Pro", size: 12 } },
        },
      },
      scales: {
        x: { grid: { color: line }, ticks: { color: ink, font: { family: "Roboto Flex" } } },
        y: {
          grid: { color: line },
          ticks: {
            color: ink,
            font: { family: "Roboto Flex" },
            callback: (value) => Math.round(value / 1000000) + "M",
          },
        },
      },
    };
    if (chart) {
      chart.data = payload;
      chart.options = options;
      chart.update(firstPaint ? undefined : "none");
      return;
    }
    chart = new Chart(canvas, { type: "line", data: payload, options: options });
  }

  function showPanel(name) {
    document.querySelectorAll("[data-tab]").forEach((button) => {
      const on = button.dataset.tab === name;
      button.setAttribute("aria-selected", String(on));
      button.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll("[data-panel]").forEach((panel) => {
      const on = panel.dataset.panel === name;
      panel.hidden = !on;
      panel.classList.toggle("is-shown", on);
    });
    if (name === "overview" && chart) chart.resize();
    closeExportMenu();
  }

  function openModal(id) {
    activeModal = document.getElementById(id);
    activeModal.hidden = false;
    const focusable = activeModal.querySelector("input, textarea, button");
    if (focusable) focusable.focus();
  }

  function closeModal() {
    if (!activeModal) return;
    if (activeModal.id === "approve-modal" && pendingDecision && pendingDecision.mode === "approve") {
      pendingDecision = null;
    }
    activeModal.hidden = true;
    activeModal = null;
  }

  function openWithdrawalForm() {
    document.getElementById("withdraw-error").hidden = true;
    document.getElementById("withdraw-amount-field").classList.remove("is-invalid");
    document.getElementById("withdraw-amount").value = "";
    openModal("withdrawal-modal");
  }

  function openInvoice(file) {
    const invoice = file.invoice;
    document.getElementById("invoice-title").textContent = invoice.number;
    document.getElementById("invoice-preview").innerHTML =
      "<dl class=\"finance-sheet-list\">" +
      "<div><dt>Order</dt><dd>#" + escapeHtml(invoice.order) + "</dd></div>" +
      "<div><dt>Customer</dt><dd>" + escapeHtml(invoice.customer) + "</dd></div>" +
      "<div><dt>Seller</dt><dd>" + escapeHtml(invoice.seller) + "</dd></div>" +
      "<div><dt>Issued</dt><dd>" + escapeHtml(formatWhen(invoice.at)) + "</dd></div>" +
      "<div><dt>Total</dt><dd>" + formatMmk(invoice.total) + " · " + formatUsd(invoice.total) + "</dd></div>" +
      "</dl>";
    document.getElementById("invoice-token").textContent = file.url;
    openModal("invoice-modal");
  }

  function openReceipt(id) {
    const row = payouts.find((item) => item.id === id);
    if (!row) return;
    document.getElementById("receipt-body").innerHTML =
      "<dl class=\"finance-sheet-list\">" +
      "<div><dt>Payout</dt><dd>#" + escapeHtml(row.id) + "</dd></div>" +
      "<div><dt>Seller</dt><dd>" + escapeHtml(row.seller) + "</dd></div>" +
      "<div><dt>Bank</dt><dd>" + escapeHtml(row.bank) + " · " + escapeHtml(maskAccount(row.account)) + "</dd></div>" +
      "<div><dt>Amount</dt><dd>" + formatMmk(row.amount) + " · " + formatUsd(row.amount) + "</dd></div>" +
      "<div><dt>Receipt</dt><dd>" + escapeHtml(row.receipt) + "</dd></div>" +
      "<div><dt>Processed by</dt><dd>" + escapeHtml(row.admin) + "</dd></div>" +
      "<div><dt>Completed</dt><dd>" + escapeHtml(formatWhen(row.at)) + "</dd></div>" +
      "</dl>";
    const drawer = document.getElementById("receipt-drawer");
    drawer.hidden = false;
    window.requestAnimationFrame(() => drawer.classList.add("is-on"));
    if (window.lucide) window.lucide.createIcons();
  }

  function closeDrawer() {
    const drawer = document.getElementById("receipt-drawer");
    drawer.classList.remove("is-on");
    window.setTimeout(() => {
      drawer.hidden = true;
    }, 250);
  }

  function closeExportMenu() {
    const menu = document.getElementById("export-report-list");
    const button = document.getElementById("export-report");
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
  }

  function makeIdempotencyKey() {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return "idem_" + Array.from(bytes).map((value) => value.toString(16).padStart(2, "0")).join("");
  }

  function refresh() {
    renderStats();
    renderAlerts();
    renderWithdrawals();
    renderLedger();
    renderPayouts();
    renderInvoices();
    renderAudit();
  }

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => showPanel(button.dataset.tab));
  });

  document.querySelectorAll("[data-span]").forEach((button) => {
    button.addEventListener("click", () => {
      trendSpan = Number(button.dataset.span);
      document.querySelectorAll("[data-span]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      renderChart();
    });
  });

  document.getElementById("withdrawal-filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-status]");
    if (!button) return;
    withdrawalFilter = button.dataset.status;
    withdrawalPage = 1;
    document.querySelectorAll("#withdrawal-filters [data-status]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    window.runWithSkeleton(document.getElementById("withdrawal-table"), renderWithdrawals, { columns: 7, rows: 5 });
  });

  ["ledger-search", "ledger-from", "ledger-to", "ledger-type"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => {
      ledgerPage = 1;
      window.runWithSkeleton(document.getElementById("ledger-table"), renderLedger, { columns: 9, rows: 6, delay: 280 });
    });
  });
  document.getElementById("payout-search").addEventListener("input", () => {
    payoutPage = 1;
    window.runWithSkeleton(document.getElementById("payout-table"), renderPayouts, { columns: 7, rows: 5, delay: 280 });
  });

  document.getElementById("withdrawal-pager").addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const rows = withdrawals.filter((row) => withdrawalFilter === "all" || row.status === withdrawalFilter);
    const paged = window.pageRows(rows, withdrawalPage);
    withdrawalPage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    window.runWithSkeleton(document.getElementById("withdrawal-table"), renderWithdrawals, { columns: 7, rows: 5 });
  });
  document.getElementById("ledger-pager").addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const rows = window.fetchTransactions(ledgerFilters());
    const paged = window.pageRows(rows, ledgerPage);
    ledgerPage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    window.runWithSkeleton(document.getElementById("ledger-table"), renderLedger, { columns: 9, rows: 6 });
  });
  document.getElementById("payout-pager").addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const rows = window.fetchPayoutLogs(document.getElementById("payout-search").value);
    const paged = window.pageRows(rows, payoutPage);
    payoutPage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    window.runWithSkeleton(document.getElementById("payout-table"), renderPayouts, { columns: 7, rows: 5 });
  });
  document.getElementById("invoice-pager").addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const paged = window.pageRows(invoices, invoicePage);
    invoicePage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    renderInvoices();
  });
  document.getElementById("audit-pager").addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const paged = window.pageRows(audit, auditPage);
    auditPage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    renderAudit();
  });

  document.getElementById("export-report").addEventListener("click", () => {
    const menu = document.getElementById("export-report-list");
    const open = menu.hidden;
    menu.hidden = !open;
    document.getElementById("export-report").setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".finance-menu")) closeExportMenu();
  });

  document.body.addEventListener("click", (event) => {
    const exportButton = event.target.closest("[data-export]");
    if (exportButton) {
      const rows = datasetFor(exportButton.dataset.scope);
      const name = "stylex-" + exportButton.dataset.scope;
      if (exportButton.dataset.export === "csv") window.exportToCSV(name, rows);
      else window.exportToExcel(name, rows);
      closeExportMenu();
      return;
    }
    const approve = event.target.closest("[data-approve]");
    if (approve) {
      if (approve.disabled) return;
      approve.disabled = true;
      const request = withdrawals.find((row) => row.id === approve.dataset.approve);
      pendingDecision = { mode: "approve", id: request.id, key: makeIdempotencyKey(), button: approve };
      document.getElementById("approve-copy").textContent = request.id + " · " + request.seller + " · " + formatMmk(request.amount);
      document.getElementById("idempotency-key").textContent = pendingDecision.key;
      openModal("approve-modal");
      return;
    }
    const reject = event.target.closest("[data-reject]");
    if (reject) {
      const request = withdrawals.find((row) => row.id === reject.dataset.reject);
      pendingDecision = { mode: "reject", id: request.id };
      document.getElementById("reject-copy").textContent = request.id + " · " + request.seller + " · " + formatMmk(request.amount);
      document.getElementById("reject-reason").value = "";
      document.getElementById("reject-error").hidden = true;
      document.getElementById("reject-reason-field").classList.remove("is-invalid");
      openModal("reject-modal");
      return;
    }
    const invoice = event.target.closest("[data-invoice]");
    if (invoice) {
      window.downloadInvoice(invoice.dataset.invoice);
      return;
    }
    const receipt = event.target.closest("[data-receipt]");
    if (receipt) openReceipt(receipt.dataset.receipt);
  });

  document.getElementById("confirm-approve").addEventListener("click", () => {
    if (!pendingDecision || pendingDecision.mode !== "approve") return;
    const button = document.getElementById("confirm-approve");
    button.disabled = true;
    const result = window.updatePayoutStatus(pendingDecision.id, "Approved", { idempotencyKey: pendingDecision.key });
    button.disabled = false;
    pendingDecision = null;
    closeModal();
    refresh();
    window.showToast(result.ok ? "Withdrawal approved." : result.error);
  });

  document.getElementById("confirm-reject").addEventListener("click", () => {
    if (!pendingDecision || pendingDecision.mode !== "reject") return;
    const reason = document.getElementById("reject-reason").value.trim();
    const field = document.getElementById("reject-reason-field");
    if (!reason) {
      field.classList.add("is-invalid");
      document.getElementById("reject-error").hidden = false;
      return;
    }
    const result = window.updatePayoutStatus(pendingDecision.id, "Rejected", {
      reason: reason,
      idempotencyKey: makeIdempotencyKey(),
    });
    pendingDecision = null;
    closeModal();
    refresh();
    window.showToast(result.ok ? "Withdrawal rejected." : result.error);
  });

  document.getElementById("withdrawal-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const result = window.processWithdrawalRequest({
      seller: document.getElementById("withdraw-seller").value,
      amount: document.getElementById("withdraw-amount").value,
      bank: document.getElementById("withdraw-bank").value,
      account: document.getElementById("withdraw-account").value,
      holder: document.getElementById("withdraw-holder").value,
    });
    const error = document.getElementById("withdraw-error");
    const field = document.getElementById("withdraw-amount-field");
    if (!result.ok) {
      field.classList.add("is-invalid");
      error.hidden = false;
      error.textContent = result.error;
      return;
    }
    field.classList.remove("is-invalid");
    error.hidden = true;
    closeModal();
    refresh();
    showPanel("withdrawals");
    window.showToast(result.request.id + " submitted.");
  });

  document.getElementById("withdraw-amount").addEventListener("input", () => {
    document.getElementById("withdraw-error").hidden = true;
    document.getElementById("withdraw-amount-field").classList.remove("is-invalid");
  });

  document.getElementById("new-withdrawal").addEventListener("click", openWithdrawalForm);
  document.getElementById("simulate-withdrawal").addEventListener("click", openWithdrawalForm);
  document.getElementById("dismiss-banner").addEventListener("click", () => {
    bannerDismissed = true;
    renderAlerts();
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      if (pendingDecision && pendingDecision.button) pendingDecision.button.disabled = false;
      pendingDecision = null;
      closeModal();
    });
  });

  document.querySelectorAll(".order-modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target !== modal) return;
      if (pendingDecision && pendingDecision.button) pendingDecision.button.disabled = false;
      pendingDecision = null;
      closeModal();
    });
  });

  document.querySelectorAll("[data-close-drawer]").forEach((button) => {
    button.addEventListener("click", closeDrawer);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeExportMenu();
    closeDrawer();
    if (activeModal) {
      if (pendingDecision && pendingDecision.button) pendingDecision.button.disabled = false;
      pendingDecision = null;
      closeModal();
    }
  });

  renderStats();
  renderAlerts();
  renderWithdrawals();
  renderLedger();
  renderPayouts();
  renderInvoices();
  renderAudit();
  renderChart();
  if (window.lucide) window.lucide.createIcons();

  document.addEventListener("stylex-theme", () => {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    renderChart();
  });
})();
