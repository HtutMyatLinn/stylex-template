(function () {
  if (document.body.dataset.page !== "team") return;

  var SHOP = "atelier-noir";
  var GROUPS = [
    { name: "Products", sensitive: false, items: [
      { id: "products.view", label: "View Products" },
      { id: "products.edit", label: "Edit Products", requires: "products.view" }
    ]},
    { name: "Orders", sensitive: false, items: [
      { id: "orders.view", label: "View Orders" },
      { id: "orders.edit", label: "Edit Orders", requires: "orders.view" }
    ]},
    { name: "Promotions", sensitive: false, items: [
      { id: "promotions.view", label: "View Promotions" },
      { id: "promotions.edit", label: "Edit Promotions", requires: "promotions.view" }
    ]},
    { name: "Team Management", sensitive: false, items: [
      { id: "team.view", label: "View Team" },
      { id: "team.invite", label: "Invite Members", requires: "team.view" },
      { id: "team.manage", label: "Manage Access", requires: "team.view" }
    ]},
    { name: "Sensitive & Financial Actions", sensitive: true, items: [
      { id: "sensitive.payout", label: "Payout Settings" },
      { id: "sensitive.refunds", label: "Refunds" },
      { id: "sensitive.bank", label: "Bank Account Changes" },
      { id: "sensitive.logs", label: "Security Logs" }
    ]}
  ];

  var roles = [
    role("owner", "Shop Owner", "standard", allPermissions()),
    role("manager", "Shop Manager", "standard", ["products.view", "products.edit", "orders.view", "orders.edit", "promotions.view", "promotions.edit", "team.view", "team.invite"]),
    role("processor", "Order Processor", "standard", ["orders.view", "orders.edit"]),
    role("catalog", "Catalog Editor", "standard", ["products.view", "products.edit"]),
    role("inventory", "Inventory Staff", "standard", ["products.view", "orders.view"]),
    role("cashier", "Cashier", "standard", ["orders.view"]),
    role("floor", "Floor Lead", "custom", ["products.view", "orders.view", "team.view"])
  ];
  var members = [
    member("m-owner", "Amelia Noir", "amelia@ateliernoir.com", "owner", "Active", true, hoursAgo(1)),
    member("m-jonah", "Jonah Ellis", "jonah@ateliernoir.com", "manager", "Active", false, hoursAgo(5)),
    member("m-mina", "Mina Chen", "mina@ateliernoir.com", "catalog", "Active", false, hoursAgo(20)),
    member("m-clara", "Clara Lind", "clara@ateliernoir.com", "inventory", "Invited", false, null),
    member("m-leo", "Leo Park", "leo@ateliernoir.com", "cashier", "Suspended", false, daysAgo(4)),
    member("m-sofia", "Sofia Marchetti", "sofia@ateliernoir.com", "floor", "Removed", false, daysAgo(12))
  ];
  var logs = [
    log("evt-1008", "Amelia Noir", "Shop Owner", "Invite member", "Clara Lind", "Security Event", "Success", true, hoursAgo(3), { status: "none" }, { status: "Invited", role: "Inventory Staff" }),
    log("evt-1007", "Jonah Ellis", "Shop Manager", "Edit product", "Cashmere Funnel Coat", "Standard Activity", "Success", false, hoursAgo(6), { stock: 28 }, { stock: 30 }),
    log("evt-1006", "Leo Park", "Cashier", "Issue refund", "Order #STX-8922", "Security Event", "Blocked", true, daysAgo(1), { amount: 0 }, { amount: 42000 }),
    log("evt-1005", "Amelia Noir", "Shop Owner", "Suspend access", "Leo Park", "Security Event", "Warning", true, daysAgo(2), { status: "Active" }, { status: "Suspended" })
  ];
  var section = "members";
  var memberFilter = { query: "", roleId: "all", status: "All" };
  var logFilter = { actor: "", role: "all", action: "all", outcome: "All", security: false, from: "", to: "" };
  var selectedRoleId = "manager";
  var accessMemberId = null;
  var seq = 1009;

  function role(id, name, kind, permissions) {
    return { id: id, name: name, kind: kind, permissions: permissions.slice() };
  }
  function member(id, name, email, roleId, status, owner, lastActive) {
    return { id: id, name: name, email: email, roleId: roleId, status: status, owner: owner, lastActive: lastActive };
  }
  function log(id, actor, actorRole, action, target, category, outcome, security, at, before, after) {
    return {
      id: id, shopId: SHOP, actor: actor, actorRole: actorRole, action: action, target: target,
      category: category, outcome: outcome, security: security, at: at, before: before, after: after,
      ip: "103.122.18.44", device: "Chrome on macOS", ownerNotified: security
    };
  }
  function allPermissions() {
    return GROUPS.reduce(function (list, group) {
      group.items.forEach(function (item) { list.push(item.id); });
      return list;
    }, []);
  }
  function hoursAgo(hours) { return new Date(Date.now() - hours * 3600000).toISOString(); }
  function daysAgo(days) { return new Date(Date.now() - days * 86400000).toISOString(); }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }
  function roleById(id) { return roles.filter(function (item) { return item.id === id; })[0]; }
  function memberById(id) { return members.filter(function (item) { return item.id === id; })[0]; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  window.getTeamMembers = function (shopId, filter) {
    filter = filter || {};
    return members.filter(function (item) {
      if (item.shopId && item.shopId !== shopId) return false;
      var query = (filter.query || "").trim().toLowerCase();
      if (query && (item.name + " " + item.email).toLowerCase().indexOf(query) === -1) return false;
      if (filter.roleId && filter.roleId !== "all" && item.roleId !== filter.roleId) return false;
      if (filter.status && filter.status !== "All" && item.status !== filter.status) return false;
      return true;
    }).map(clone);
  };

  window.inviteTeamMember = function (shopId, email, roleId) {
    if (shopId !== SHOP) return { ok: false, message: "Unknown shop." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Enter a valid email address." };
    if (!roleById(roleId)) return { ok: false, message: "Choose a role." };
    var existing = members.filter(function (item) { return item.email.toLowerCase() === email.toLowerCase() && item.status !== "Removed"; })[0];
    if (existing) return { ok: false, message: "That email already has access." };
    var created = member("m-" + Date.now(), email.split("@")[0], email, roleId, "Invited", false, null);
    created.name = created.name.replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
    members.unshift(created);
    window.recordSecurityEvent(shopId, {
      actor: "Amelia Noir", actorRole: "Shop Owner", action: "Invite member", target: email,
      category: "Security Event", outcome: "Success", security: true,
      before: { status: "none" }, after: { status: "Invited", roleId: roleId }
    });
    return { ok: true, member: clone(created) };
  };

  window.getRoles = function () { return roles.map(clone); };

  window.updateRolePermissions = function (shopId, roleId, permissions) {
    var found = roleById(roleId);
    if (!found) return { ok: false, message: "Role not found." };
    if (found.id === "owner") return { ok: false, message: "The Shop Owner role cannot be reduced." };
    found.permissions = permissions.slice();
    window.recordSecurityEvent(shopId, {
      actor: "Amelia Noir", actorRole: "Shop Owner", action: "Update permissions", target: found.name,
      category: "Security Event", outcome: "Success", security: true,
      before: { roleId: roleId }, after: { permissions: permissions.slice() }
    });
    return { ok: true, role: clone(found) };
  };

  window.updateTeamMemberAccess = function (shopId, memberId, roleId, status) {
    var found = memberById(memberId);
    if (!found) return { ok: false, message: "Member not found." };
    if (found.owner && (roleId !== found.roleId || (status && status !== "Active"))) {
      return { ok: false, message: "Every shop must retain at least one active owner. Owner access cannot be removed or downgraded without a verified ownership transfer." };
    }
    var before = { roleId: found.roleId, status: found.status };
    if (roleId) found.roleId = roleId;
    if (status) found.status = status;
    var actionName = "Update access";
    if (status === "Removed" && before.status === "Invited") actionName = "Revoke invitation";
    else if (roleId && roleId !== before.roleId && !status) actionName = "Change role";
    window.recordSecurityEvent(shopId, {
      actor: "Amelia Noir", actorRole: "Shop Owner", action: actionName,
      target: found.email, category: "Security Event", outcome: "Success", security: true,
      before: before, after: { roleId: found.roleId, status: found.status }
    });
    return { ok: true, member: clone(found) };
  };

  window.getActivityLogs = function (shopId, filter) {
    filter = filter || {};
    return logs.filter(function (item) {
      if (item.shopId !== shopId) return false;
      if (filter.actor && item.actor.toLowerCase().indexOf(filter.actor.trim().toLowerCase()) === -1) return false;
      if (filter.role && filter.role !== "all" && item.actorRole !== filter.role) return false;
      if (filter.action && filter.action !== "all") {
        var aliases = { invite: "invit", access: "access", role: "role", permissions: "permission", security: "security" };
        var blob = (item.action + " " + item.category).toLowerCase();
        if (blob.indexOf(aliases[filter.action] || filter.action) === -1) return false;
      }
      if (filter.outcome && filter.outcome !== "All" && item.outcome !== filter.outcome) return false;
      if (filter.security && !item.security) return false;
      if (filter.from && item.at.slice(0, 10) < filter.from) return false;
      if (filter.to && item.at.slice(0, 10) > filter.to) return false;
      return true;
    }).map(clone);
  };

  window.recordSecurityEvent = function (shopId, event) {
    var entry = log("evt-" + (seq++), event.actor, event.actorRole, event.action, event.target, event.category || "Security Event", event.outcome || "Success", event.security !== false, new Date().toISOString(), event.before || {}, event.after || {});
    entry.shopId = shopId;
    logs.unshift(entry);
    return clone(entry);
  };

  function toast(message) { if (window.showToast) window.showToast(message); }
  function whenStamp(value) { return value ? new Date(value).toLocaleString() : "Not yet"; }

  function renderSections() {
    ["members", "roles", "logs"].forEach(function (name) {
      document.getElementById("team-panel-" + name).hidden = name !== section;
    });
    document.querySelectorAll("#team-sections button").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.section === section));
    });
  }

  function renderRoleOptions(select, includeAll, skipOwner) {
    var html = includeAll ? '<option value="all">All roles</option>' : "";
    roles.forEach(function (item) {
      if (skipOwner && item.id === "owner") return;
      html += '<option value="' + escapeHtml(includeAll ? item.name : item.id) + '">' + escapeHtml(item.name) + "</option>";
    });
    select.innerHTML = html;
  }

  function renderMembers() {
    var rows = window.getTeamMembers(SHOP, memberFilter);
    var body = document.getElementById("team-member-rows");
    body.innerHTML = rows.map(function (item) {
      var found = roleById(item.roleId);
      var lock = item.owner ? ' title="Every shop must retain at least one active owner. Owner access cannot be removed or downgraded without a verified ownership transfer." disabled' : "";
      return "<tr><td><strong>" + escapeHtml(item.name) + "</strong><br>" + escapeHtml(item.email) + "</td><td>" + escapeHtml(found ? found.name : item.roleId) + "</td><td><span class=\"status-badge\">" + escapeHtml(item.status) + "</span></td><td>" + escapeHtml(whenStamp(item.lastActive)) + "</td><td><button class=\"btn is-ghost\" type=\"button\" data-manage=\"" + escapeHtml(item.id) + "\"" + lock + ">Manage</button></td></tr>";
    }).join("") || '<tr><td colspan="5">No team members match these filters.</td></tr>';
  }

  function renderRoles() {
    document.getElementById("team-role-cards").innerHTML = roles.map(function (item) {
      return '<button class="team-role-card' + (item.id === selectedRoleId ? " is-selected" : "") + '" type="button" data-role="' + escapeHtml(item.id) + '"><strong>' + escapeHtml(item.name) + "</strong><small>" + escapeHtml(item.kind === "custom" ? "Custom role" : "Standard role") + "</small></button>";
    }).join("");
    var selected = roleById(selectedRoleId);
    document.getElementById("team-role-title").textContent = selected ? selected.name : "Permissions";
    document.getElementById("team-role-note").textContent = selected && selected.id === "owner" ? "Owner permissions stay complete so the shop always has a full-access owner." : "Enabling an edit permission also enables its view permission.";
    document.getElementById("team-permission-groups").innerHTML = GROUPS.map(function (group) {
      return '<section class="team-group' + (group.sensitive ? " is-sensitive" : "") + '"><h3>' + escapeHtml(group.name) + "</h3>" + group.items.map(function (item) {
        var checked = selected && selected.permissions.indexOf(item.id) !== -1;
        var badge = group.sensitive && checked ? '<span class="team-explicit">Explicit</span>' : "";
        return '<label class="team-perm"><input type="checkbox" data-permission="' + escapeHtml(item.id) + '"' + (checked ? " checked" : "") + (selected && selected.id === "owner" ? " disabled" : "") + "> <span>" + escapeHtml(item.label) + "</span>" + badge + "</label>";
      }).join("") + "</section>";
    }).join("");
    document.getElementById("team-permissions-save").disabled = !selected || selected.id === "owner";
  }

  function renderLogs() {
    var rows = window.getActivityLogs(SHOP, logFilter);
    document.getElementById("team-log-rows").innerHTML = rows.map(function (item) {
      return '<tr data-log="' + escapeHtml(item.id) + '" tabindex="0"><td>' + escapeHtml(whenStamp(item.at)) + "</td><td><strong>" + escapeHtml(item.actor) + "</strong><br>" + escapeHtml(item.actorRole) + "</td><td>" + escapeHtml(item.action) + "</td><td>" + escapeHtml(item.target) + '</td><td><span class="status-badge">' + escapeHtml(item.category) + '</span></td><td><span class="status-badge">' + escapeHtml(item.outcome) + "</span></td></tr>";
    }).join("") || '<tr><td colspan="6">No activity matches these filters.</td></tr>';
  }

  function renderStatusTabs() {
    var statuses = ["All", "Active", "Invited", "Suspended", "Removed"];
    document.getElementById("team-status-tabs").innerHTML = statuses.map(function (status) {
      return '<button type="button" data-status="' + status + '" aria-pressed="' + (memberFilter.status === status) + '">' + status + "</button>";
    }).join("");
  }

  function renderOutcomes() {
    document.getElementById("log-outcomes").innerHTML = ["All", "Success", "Blocked", "Warning"].map(function (outcome) {
      return '<button type="button" data-outcome="' + outcome + '" aria-pressed="' + (logFilter.outcome === outcome) + '">' + outcome + "</button>";
    }).join("");
  }

  function openModal(id) { document.getElementById(id).hidden = false; }
  function closeModal(id) { document.getElementById(id).hidden = true; }

  function openAccess(id) {
    var found = memberById(id);
    if (!found || found.owner) return;
    accessMemberId = id;
    document.getElementById("team-access-who").textContent = found.name + " · " + found.email;
    document.getElementById("team-access-lock").hidden = true;
    renderRoleOptions(document.getElementById("team-access-role"), false, true);
    document.getElementById("team-access-role").value = found.roleId;
    document.getElementById("team-access-revoke").hidden = found.status !== "Invited";
    document.getElementById("team-access-remove").hidden = found.status === "Invited" || found.status === "Removed";
    document.getElementById("team-access-suspend").hidden = found.status !== "Active";
    document.getElementById("team-access-reactivate").hidden = found.status === "Active" || found.status === "Invited";
    openModal("team-access-modal");
  }

  function openLog(id) {
    var found = logs.filter(function (item) { return item.id === id; })[0];
    if (!found) return;
    document.getElementById("team-log-meta").innerHTML = [
      ["Event ID", found.id], ["Shop ID", found.shopId], ["Actor", found.actor + " · " + found.actorRole],
      ["IP / device", found.ip + " · " + found.device], ["Owner notified", found.ownerNotified ? "Yes" : "No"]
    ].map(function (pair) {
      return "<div><dt>" + escapeHtml(pair[0]) + "</dt><dd>" + escapeHtml(pair[1]) + "</dd></div>";
    }).join("");
    document.getElementById("team-log-before").textContent = JSON.stringify(found.before, null, 2);
    document.getElementById("team-log-after").textContent = JSON.stringify(found.after, null, 2);
    var drawer = document.getElementById("team-log-drawer");
    drawer.hidden = false;
    drawer.classList.add("is-on");
  }

  function applyAccess(roleId, status, message) {
    var result = window.updateTeamMemberAccess(SHOP, accessMemberId, roleId, status);
    if (!result.ok) {
      document.getElementById("team-access-lock").hidden = false;
      document.getElementById("team-access-lock").textContent = result.message;
      return;
    }
    closeModal("team-access-modal");
    toast(message);
    renderMembers();
    renderLogs();
  }

  renderRoleOptions(document.getElementById("team-role-filter"), false);
  document.getElementById("team-role-filter").insertAdjacentHTML("afterbegin", '<option value="all" selected>All roles</option>');
  renderRoleOptions(document.getElementById("log-role"), true);
  renderRoleOptions(document.getElementById("team-invite-role"), false, true);
  renderStatusTabs();
  renderOutcomes();
  renderSections();
  renderMembers();
  renderRoles();
  renderLogs();

  document.getElementById("team-sections").addEventListener("click", function (event) {
    var button = event.target.closest("[data-section]");
    if (!button) return;
    section = button.dataset.section;
    renderSections();
  });
  document.getElementById("team-search").addEventListener("input", function (event) {
    memberFilter.query = event.target.value;
    renderMembers();
  });
  document.getElementById("team-role-filter").addEventListener("change", function (event) {
    memberFilter.roleId = event.target.value;
    renderMembers();
  });
  document.getElementById("team-status-tabs").addEventListener("click", function (event) {
    var button = event.target.closest("[data-status]");
    if (!button) return;
    memberFilter.status = button.dataset.status;
    renderStatusTabs();
    renderMembers();
  });
  document.getElementById("team-invite-open").addEventListener("click", function () {
    document.getElementById("team-invite-error").hidden = true;
    document.getElementById("team-invite-form").reset();
    renderRoleOptions(document.getElementById("team-invite-role"), false, true);
    openModal("team-invite-modal");
  });
  document.getElementById("team-invite-cancel").addEventListener("click", function () { closeModal("team-invite-modal"); });
  document.getElementById("team-invite-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var result = window.inviteTeamMember(SHOP, document.getElementById("team-invite-email").value.trim(), document.getElementById("team-invite-role").value);
    var error = document.getElementById("team-invite-error");
    if (!result.ok) {
      error.hidden = false;
      error.textContent = result.message;
      return;
    }
    closeModal("team-invite-modal");
    toast("Team invitation sent to " + result.member.email + ".");
    renderMembers();
    renderLogs();
  });
  document.getElementById("team-member-rows").addEventListener("click", function (event) {
    var button = event.target.closest("[data-manage]");
    if (!button || button.disabled) return;
    openAccess(button.dataset.manage);
  });
  document.getElementById("team-access-close").addEventListener("click", function () { closeModal("team-access-modal"); });
  document.getElementById("team-access-role-save").addEventListener("click", function () {
    applyAccess(document.getElementById("team-access-role").value, null, "Role updated.");
  });
  document.getElementById("team-access-suspend").addEventListener("click", function () { applyAccess(null, "Suspended", "Access suspended."); });
  document.getElementById("team-access-reactivate").addEventListener("click", function () { applyAccess(null, "Active", "Access reactivated."); });
  document.getElementById("team-access-remove").addEventListener("click", function () { applyAccess(null, "Removed", "Member removed."); });
  document.getElementById("team-access-revoke").addEventListener("click", function () { applyAccess(null, "Removed", "Invitation revoked."); });

  document.getElementById("team-role-cards").addEventListener("click", function (event) {
    var button = event.target.closest("[data-role]");
    if (!button) return;
    selectedRoleId = button.dataset.role;
    renderRoles();
  });
  document.getElementById("team-permission-groups").addEventListener("change", function (event) {
    var input = event.target.closest("[data-permission]");
    if (!input) return;
    GROUPS.forEach(function (group) {
      group.items.forEach(function (item) {
        if (item.id === input.dataset.permission && item.requires && input.checked) {
          var required = document.querySelector('[data-permission="' + item.requires + '"]');
          if (required) required.checked = true;
        }
        if (item.requires === input.dataset.permission && !input.checked) {
          var dependent = document.querySelector('[data-permission="' + item.id + '"]');
          if (dependent) dependent.checked = false;
        }
      });
    });
    renderRolesBadge();
  });
  function renderRolesBadge() {
    document.querySelectorAll(".team-group.is-sensitive .team-perm").forEach(function (row) {
      var input = row.querySelector("input");
      var badge = row.querySelector(".team-explicit");
      if (input.checked && !badge) {
        var span = document.createElement("span");
        span.className = "team-explicit";
        span.textContent = "Explicit";
        row.appendChild(span);
      }
      if (!input.checked && badge) badge.remove();
    });
  }
  document.getElementById("team-permissions-save").addEventListener("click", function () {
    var permissions = [];
    document.querySelectorAll("[data-permission]:checked").forEach(function (input) { permissions.push(input.dataset.permission); });
    var result = window.updateRolePermissions(SHOP, selectedRoleId, permissions);
    if (!result.ok) { toast(result.message); return; }
    toast("Permissions saved for " + result.role.name + ".");
    renderLogs();
  });
  document.getElementById("team-role-create").addEventListener("click", function () {
    document.getElementById("team-role-error").hidden = true;
    document.getElementById("team-role-form").reset();
    openModal("team-role-modal");
  });
  document.getElementById("team-role-cancel").addEventListener("click", function () { closeModal("team-role-modal"); });
  document.getElementById("team-role-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var name = document.getElementById("team-role-name").value.trim();
    var error = document.getElementById("team-role-error");
    if (!name) { error.hidden = false; error.textContent = "Name the role."; return; }
    var id = "custom-" + Date.now();
    roles.push(role(id, name, "custom", ["products.view", "orders.view"]));
    selectedRoleId = id;
    closeModal("team-role-modal");
    toast("Custom role created.");
    renderRoleOptions(document.getElementById("team-role-filter"), false);
    document.getElementById("team-role-filter").insertAdjacentHTML("afterbegin", '<option value="all">All roles</option>');
    renderRoleOptions(document.getElementById("log-role"), true);
    renderRoleOptions(document.getElementById("team-invite-role"), false, true);
    renderRoles();
  });

  ["log-actor", "log-role", "log-action", "log-from", "log-to", "log-security"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", readLogFilters);
    document.getElementById(id).addEventListener("change", readLogFilters);
  });
  document.getElementById("log-outcomes").addEventListener("click", function (event) {
    var button = event.target.closest("[data-outcome]");
    if (!button) return;
    logFilter.outcome = button.dataset.outcome;
    renderOutcomes();
    renderLogs();
  });
  function readLogFilters() {
    logFilter.actor = document.getElementById("log-actor").value;
    logFilter.role = document.getElementById("log-role").value;
    logFilter.action = document.getElementById("log-action").value;
    logFilter.from = document.getElementById("log-from").value;
    logFilter.to = document.getElementById("log-to").value;
    logFilter.security = document.getElementById("log-security").checked;
    renderLogs();
  }
  document.getElementById("team-log-rows").addEventListener("click", function (event) {
    var row = event.target.closest("[data-log]");
    if (row) openLog(row.dataset.log);
  });
  document.getElementById("team-log-rows").addEventListener("keydown", function (event) {
    if (event.key !== "Enter") return;
    var row = event.target.closest("[data-log]");
    if (row) openLog(row.dataset.log);
  });
  document.getElementById("team-log-scrim").addEventListener("click", function () {
    var drawer = document.getElementById("team-log-drawer");
    drawer.classList.remove("is-on");
    drawer.hidden = true;
  });
})();
