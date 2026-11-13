(function () {
  if (!document.body || document.body.dataset.page !== "settings") return;

  var KEY = "stylex-shop-settings";
  var state = load();

  function defaults() {
    return {
      name: "Amelia Noir",
      password: "Seller@123",
      devices: [
        { id: "dev-mac", name: "MacBook Pro", place: "Yangon, Myanmar", current: true, unusual: false },
        { id: "dev-phone", name: "iPhone 16 Pro", place: "Yangon", current: false, unusual: false },
        { id: "dev-win", name: "Windows PC", place: "Bangkok, Thailand", current: false, unusual: true }
      ]
    };
  }

  function load() {
    var base = defaults();
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!saved) return base;
      if (saved.name) base.name = saved.name;
      if (saved.password) base.password = saved.password;
      if (Array.isArray(saved.devices) && saved.devices.length) base.devices = saved.devices;
    } catch (error) {}
    return base;
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify({
      name: state.name,
      password: state.password,
      devices: state.devices
    }));
  }

  function toast(message) {
    if (window.showToast) window.showToast(message);
  }

  function showError(id, message) {
    var node = document.getElementById(id);
    if (!node) return;
    node.hidden = !message;
    node.textContent = message || "";
  }

  function openModal(id) {
    document.getElementById(id).hidden = false;
  }

  function closeModal(id) {
    document.getElementById(id).hidden = true;
  }

  function pill(text) {
    var node = document.createElement("span");
    node.className = "pill";
    node.textContent = text;
    return node;
  }

  function syncOwnerBindings() {
    document.querySelectorAll("[data-bind='shop-owner-name']").forEach(function (node) {
      node.textContent = state.name;
    });
    var initials = state.name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (part) {
      return part.charAt(0).toUpperCase();
    }).join("") || "AN";
    document.querySelectorAll("[data-bind='shop-owner-initials']").forEach(function (node) {
      node.textContent = initials;
    });
  }

  function renderName() {
    document.getElementById("settings-name").value = state.name;
  }

  function renderDevices() {
    var devices = document.getElementById("device-list");
    devices.replaceChildren();
    state.devices.forEach(function (item) {
      var row = document.createElement("article");
      row.className = "settings-device";
      var copy = document.createElement("div");
      var name = document.createElement("strong");
      name.textContent = item.name;
      var place = document.createElement("small");
      place.textContent = item.place;
      copy.append(name, place);
      var flags = document.createElement("div");
      flags.className = "settings-row-actions";
      if (item.current) flags.appendChild(pill("Current"));
      if (item.unusual) flags.appendChild(pill("Unrecognized"));
      row.append(copy, flags);
      devices.appendChild(row);
    });
  }

  function changePassword(currentPass, newPass, confirmPass) {
    if (currentPass !== state.password) return { ok: false, error: "Current password does not match." };
    if (!newPass || newPass.length < 8) return { ok: false, error: "Use at least 8 characters for the new password." };
    if (newPass !== confirmPass) return { ok: false, error: "New password and confirmation do not match." };
    state.password = newPass;
    save();
    toast("Password updated.");
    return { ok: true };
  }

  function clearTokenStores() {
    ["localStorage", "sessionStorage"].forEach(function (name) {
      var store = window[name];
      var keys = [];
      for (var i = 0; i < store.length; i += 1) keys.push(store.key(i));
      keys.forEach(function (key) {
        if (key && /session|accessToken|refreshToken/i.test(key)) store.removeItem(key);
      });
    });
  }

  function terminateCurrentSession() {
    clearTokenStores();
    openModal("session-modal");
  }

  function terminateAllSessions() {
    state.devices = state.devices.filter(function (item) { return item.current; });
    save();
    renderDevices();
    toast("Other devices were signed out.");
  }

  function seedSession() {
    try {
      if (!localStorage.getItem("accessToken")) localStorage.setItem("accessToken", "demo-access-token");
      if (!localStorage.getItem("refreshToken")) localStorage.setItem("refreshToken", "demo-refresh-token");
      if (!sessionStorage.getItem("stylex-session")) sessionStorage.setItem("stylex-session", "demo-session");
    } catch (error) {}
  }

  document.getElementById("name-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var value = document.getElementById("settings-name").value.trim();
    if (value.length < 2) {
      showError("name-error", "Enter a name with at least 2 characters.");
      return;
    }
    showError("name-error", "");
    state.name = value;
    save();
    syncOwnerBindings();
    toast("Name updated.");
  });

  document.getElementById("password-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var result = changePassword(
      document.getElementById("pass-current").value,
      document.getElementById("pass-next").value,
      document.getElementById("pass-confirm").value
    );
    showError("pass-error", result.ok ? "" : result.error);
    if (result.ok) event.target.reset();
  });

  document.getElementById("open-all-sessions").addEventListener("click", function () {
    openModal("all-modal");
  });
  document.getElementById("confirm-all-sessions").addEventListener("click", function () {
    terminateAllSessions();
    closeModal("all-modal");
  });

  document.getElementById("settings-logout").addEventListener("click", terminateCurrentSession);
  var headerLogout = document.getElementById("logout-button");
  if (headerLogout) {
    headerLogout.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      terminateCurrentSession();
    }, true);
  }

  document.getElementById("sign-back-in").addEventListener("click", function () {
    seedSession();
    closeModal("session-modal");
    toast("Signed back in (demo).");
  });

  document.querySelectorAll("[data-close-modal]").forEach(function (button) {
    button.addEventListener("click", function () {
      closeModal(button.dataset.closeModal);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (!document.getElementById("session-modal").hidden) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.changePassword = changePassword;
  window.terminateCurrentSession = terminateCurrentSession;
  window.terminateAllSessions = terminateAllSessions;

  seedSession();
  renderName();
  renderDevices();
  syncOwnerBindings();
})();
