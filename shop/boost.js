(function () {
  const DAILY_RATE = 10000;
  const PAY_ACCOUNTS = {
    wave: { label: "Wave Pay", phone: "0932145678", name: "Mg Mg", short: "WAV" },
    kbz: { label: "KBZ Pay", phone: "0932145678", name: "Mg Mg", short: "KBZ" },
    aya: { label: "AYA Pay", phone: "0932145678", name: "Mg Mg", short: "AYA" },
    uab: { label: "UAB Pay", phone: "0932145678", name: "Mg Mg", short: "UAB" },
  };

  let root = null;
  let state = defaultState();

  function defaultState(item) {
    return {
      item: item || null,
      scheduleTitle: item?.title || "Boost",
      step: 1,
      startDate: todayISO(),
      endDate: todayISO(),
      startTime: "09:00",
      app: "kbz",
      txn: "",
      note: "",
      screenshotDataUrl: "",
      screenshotName: "",
    };
  }

  function money(n) {
    return `${Number(n || 0).toLocaleString("en-US")} MMK`;
  }

  function typeLabel(type) {
    if (type === "studio") return "Studio content";
    if (type === "banner") return "Banner ad";
    if (type === "featured") return "Featured shop";
    return "Product";
  }

  function successToast(type) {
    if (type === "banner") return "Banner ad submitted. We'll verify your payment shortly.";
    if (type === "featured") return "Featured shop ad submitted. We'll verify your payment shortly.";
    return "Boost order submitted. We'll verify your payment shortly.";
  }

  function daysBetween(start, end) {
    if (!start || !end) return 0;
    const a = new Date(`${start}T00:00:00`);
    const b = new Date(`${end}T00:00:00`);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return 0;
    return Math.floor((b - a) / 86400000) + 1;
  }

  function todayISO() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function costFrom(start, end) {
    const days = daysBetween(start, end);
    return { days, total: days * DAILY_RATE };
  }

  function scheduleReady() {
    return Boolean(state.startDate && state.endDate && state.startTime && daysBetween(state.startDate, state.endDate) >= 1);
  }

  function paymentReady() {
    return /^\d{6}$/.test(state.txn) && Boolean(state.screenshotDataUrl);
  }

  function ensureRoot() {
    if (root) return root;
    root = document.createElement("div");
    root.id = "boostOverlay";
    root.className = "boost-overlay";
    root.hidden = true;
    root.innerHTML = `
      <div class="boost-shell" role="dialog" aria-modal="true" aria-labelledby="boostTitle">
        <div class="boost-head">
          <h2 id="boostTitle">Boost</h2>
          <div class="boost-steps" aria-hidden="true">
            <div class="boost-step is-active" data-step-indicator="1"><div>Schedule</div><span></span></div>
            <div class="boost-step" data-step-indicator="2"><div>Payment</div><span></span></div>
          </div>
          <button type="button" class="btn is-ghost" data-boost-close aria-label="Close">Close</button>
        </div>
        <div class="boost-body" data-boost-body></div>
        <div class="boost-foot" data-boost-foot hidden></div>
      </div>
    `;
    document.body.appendChild(root);

    root.addEventListener("click", (e) => {
      if (e.target === root || e.target.closest("[data-boost-close]")) closeBoost();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root && !root.hidden) closeBoost();
    });

    return root;
  }

  function setStep(step) {
    state.step = step;
    root.querySelectorAll("[data-step-indicator]").forEach((el) => {
      const n = Number(el.getAttribute("data-step-indicator"));
      el.classList.toggle("is-active", n === step);
      el.classList.toggle("is-done", n < step);
    });
    render();
  }

  function renderSchedule() {
    const item = state.item || {};
    const { days, total } = costFrom(state.startDate, state.endDate);
    const ready = scheduleReady();

    return `
      <div class="boost-schedule">
        <div class="boost-item">
          <div class="boost-thumb" style="--thumb-color:${item.color || "#2c3e50"}">
            ${item.image ? `<img src="${item.image}" alt="">` : ""}
          </div>
          <div>
            <strong>${escapeHtml(item.name || "Item")}</strong>
            <p>${typeLabel(item.type)} · ${escapeHtml(item.id || item.type || "")}</p>
          </div>
        </div>

        <div class="boost-fields">
          <label class="field">
            <span>Start date</span>
            <input type="date" data-boost-start value="${state.startDate}" min="${todayISO()}" required>
          </label>
          <label class="field">
            <span>End date</span>
            <input type="date" data-boost-end value="${state.endDate}" min="${state.startDate || todayISO()}" required>
          </label>
          <label class="field">
            <span>Start time</span>
            <input type="time" data-boost-time value="${state.startTime}" required>
          </label>
        </div>

        <p class="boost-note">Boosts automatically end at 11:59 PM on the selected End Date (handled automatically by the system).</p>

        <div class="boost-cost">
          <span class="muted">Estimated cost</span>
          <strong>${money(total)}</strong>
          <p class="boost-note">${days || 0} day${days === 1 ? "" : "s"} · ${money(DAILY_RATE)} / day · charged once before your boost goes live</p>
        </div>
      </div>
    `;
  }

  function renderScheduleFoot() {
    const ready = scheduleReady();
    return `<button type="button" class="btn" data-boost-to-pay ${ready ? "" : "disabled"}>Continue to payment</button>`;
  }

  function renderPayment() {
    const { days, total } = costFrom(state.startDate, state.endDate);
    const account = PAY_ACCOUNTS[state.app] || PAY_ACCOUNTS.kbz;
    const durationLabel = `${days} day${days === 1 ? "" : "s"}`;

    return `
      <div class="boost-pay">
        <div class="boost-pay-main">
          <section class="boost-pay-block">
            <h3>1. Choose a payment app</h3>
            <div class="boost-apps" role="listbox" aria-label="Payment apps">
              ${Object.entries(PAY_ACCOUNTS)
                .map(
                  ([key, app]) => `
                <button type="button" class="boost-app ${state.app === key ? "is-active" : ""}" data-boost-app="${key}" role="option" aria-selected="${state.app === key}">
                  <div class="boost-app-icon">${app.short}</div>
                  <span>${app.label}</span>
                </button>`
                )
                .join("")}
            </div>
          </section>

          <section class="boost-pay-block">
            <h3>2. Send the payment</h3>
            <div class="boost-send-box">
              <p>Send exactly <strong>${money(total)}</strong> with ${account.label} to:</p>
              <div class="boost-account">
                <div>
                  <strong>${account.phone}</strong>
                  <small>${account.name}</small>
                </div>
                <button type="button" class="boost-copy" data-boost-copy>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy
                </button>
              </div>
            </div>
          </section>

          <section class="boost-pay-block">
            <h3>3. Confirm your transfer</h3>
            <div class="boost-confirm-stack">
              <label class="field">
                <span>Transaction ID (last 6 digits)</span>
                <input class="boost-txn" type="text" inputmode="numeric" maxlength="6" placeholder="1 2 3 4 5 6" data-boost-txn value="${escapeHtml(state.txn)}" autocomplete="off">
              </label>
              <div>
                <span class="field" style="display:block;margin-bottom:6px;"><span>Payment screenshot</span></span>
                <label class="boost-upload">
                  ${
                    state.screenshotDataUrl
                      ? `<img src="${state.screenshotDataUrl}" alt="Payment screenshot preview">
                         <div class="boost-upload-actions">
                           <span>${escapeHtml(state.screenshotName || "Screenshot attached")}</span>
                           <button type="button" class="btn is-ghost" data-boost-clear-shot>Remove</button>
                         </div>`
                      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 16V6"/><path d="m8 9 4-4 4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
                         <span>Upload screenshot</span>`
                  }
                  <input type="file" accept="image/*" hidden data-boost-file>
                </label>
              </div>
              <label class="field">
                <span>Note (optional)</span>
                <textarea rows="2" placeholder="Anything we should know about your order?" data-boost-note>${escapeHtml(state.note)}</textarea>
              </label>
            </div>
          </section>
        </div>

        <aside class="boost-summary">
          <h3>Order summary</h3>
          <div class="boost-summary-row">
            <span>${escapeHtml(state.item?.name || "Boost")} · ${durationLabel}</span>
            <span>${money(total)}</span>
          </div>
          <hr>
          <div class="boost-summary-row">
            <span>Subtotal</span>
            <span>${money(total)}</span>
          </div>
          <hr>
          <div class="boost-summary-total">
            <strong>Total</strong>
            <strong>${money(total)}</strong>
          </div>
        </aside>
      </div>
    `;
  }

  function renderPaymentFoot() {
    const { total } = costFrom(state.startDate, state.endDate);
    const ready = paymentReady();
    return `
      <button type="button" class="btn is-ghost" data-boost-back>← Back to details</button>
      <button type="button" class="btn" data-boost-confirm ${ready ? "" : "disabled"}>
        Confirm order · ${money(total)}
      </button>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    const body = root.querySelector("[data-boost-body]");
    const foot = root.querySelector("[data-boost-foot]");
    const title = root.querySelector("#boostTitle");
    title.textContent = state.step === 1 ? state.scheduleTitle || "Boost" : "Checkout";
    body.innerHTML = state.step === 1 ? renderSchedule() : renderPayment();
    foot.hidden = false;
    foot.classList.toggle("is-end", state.step === 1);
    foot.innerHTML = state.step === 1 ? renderScheduleFoot() : renderPaymentFoot();
    bindStep();
  }

  function bindStep() {
    if (state.step === 1) {
      root.querySelector("[data-boost-start]")?.addEventListener("change", (e) => {
        state.startDate = e.target.value;
        if (state.endDate < state.startDate) state.endDate = state.startDate;
        render();
      });
      root.querySelector("[data-boost-end]")?.addEventListener("change", (e) => {
        state.endDate = e.target.value;
        render();
      });
      root.querySelector("[data-boost-time]")?.addEventListener("change", (e) => {
        state.startTime = e.target.value;
        render();
      });
      root.querySelector("[data-boost-to-pay]")?.addEventListener("click", () => {
        if (!scheduleReady()) return;
        setStep(2);
      });
      return;
    }

    root.querySelectorAll("[data-boost-app]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.app = btn.getAttribute("data-boost-app");
        render();
      });
    });

    root.querySelector("[data-boost-copy]")?.addEventListener("click", async () => {
      const phone = PAY_ACCOUNTS[state.app]?.phone || "";
      const btn = root.querySelector("[data-boost-copy]");
      try {
        await navigator.clipboard.writeText(phone);
        if (btn) {
          btn.classList.add("is-copied");
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Copied!`;
          setTimeout(() => {
            btn.classList.remove("is-copied");
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
          }, 1400);
        }
      } catch {
        /* ignore */
      }
    });

    const txn = root.querySelector("[data-boost-txn]");
    txn?.addEventListener("input", () => {
      state.txn = txn.value.replace(/\D/g, "").slice(0, 6);
      txn.value = state.txn;
      const btn = root.querySelector("[data-boost-confirm]");
      if (btn) btn.disabled = !paymentReady();
    });

    root.querySelector("[data-boost-note]")?.addEventListener("input", (e) => {
      state.note = e.target.value;
    });

    const file = root.querySelector("[data-boost-file]");
    file?.addEventListener("change", () => {
      const f = file.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.screenshotDataUrl = String(reader.result || "");
        state.screenshotName = f.name;
        render();
      };
      reader.readAsDataURL(f);
    });

    root.querySelector("[data-boost-clear-shot]")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.screenshotDataUrl = "";
      state.screenshotName = "";
      render();
    });

    root.querySelector("[data-boost-back]")?.addEventListener("click", () => setStep(1));

    root.querySelector("[data-boost-confirm]")?.addEventListener("click", () => {
      if (!paymentReady()) return;
      const run = typeof window.runWithLoading === "function" ? window.runWithLoading : (el, fn) => fn();
      const btn = root.querySelector("[data-boost-confirm]");
      run(btn, async () => {
        await new Promise((r) => setTimeout(r, 700));
        closeBoost();
        if (typeof window.showToast === "function") {
          window.showToast(successToast(state.item?.type));
        }
      });
    });
  }

  function openBoost(item) {
    ensureRoot();
    state = defaultState({
      id: item?.id || "",
      name: item?.name || "Item",
      type: item?.type || "product",
      image: item?.image || "",
      color: item?.color || "#2c3e50",
    });
    root.hidden = false;
    document.body.classList.add("is-boost-open");
    setStep(1);
  }

  function closeBoost() {
    if (!root) return;
    root.hidden = true;
    document.body.classList.remove("is-boost-open");
  }

  window.openBoost = openBoost;
  window.closeBoost = closeBoost;
})();
