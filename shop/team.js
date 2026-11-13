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
      { id: "team.create", label: "Create Members", requires: "team.view" },
      { id: "team.manage", label: "Manage Access", requires: "team.view" }
    ]},
    { name: "Sensitive & Financial Actions", sensitive: true, items: [
      { id: "sensitive.payout", label: "Payout Settings" },
      { id: "sensitive.refunds", label: "Refunds" },
      { id: "sensitive.bank", label: "Bank Account Changes" },
      { id: "sensitive.logs", label: "Security Logs" }
    ]}
  ];

  /* Mock permission options — shaped for future API: [{ id, label, kind }] */
  var permissions = [
    { id: "owner", label: "Shop Owner", kind: "standard" },
    { id: "manager", label: "Shop Manager", kind: "standard" },
    { id: "processor", label: "Order Processor", kind: "standard" },
    { id: "catalog", label: "Catalog Editor", kind: "standard" },
    { id: "inventory", label: "Inventory Staff", kind: "standard" },
    { id: "cashier", label: "Cashier", kind: "standard" },
    { id: "floor", label: "Floor Lead", kind: "custom" }
  ];

  var roles = [
    role("owner", "Shop Owner", "standard", allPermissions()),
    role("manager", "Shop Manager", "standard", ["products.view", "products.edit", "orders.view", "orders.edit", "promotions.view", "promotions.edit", "team.view", "team.create"]),
    role("processor", "Order Processor", "standard", ["orders.view", "orders.edit"]),
    role("catalog", "Catalog Editor", "standard", ["products.view", "products.edit"]),
    role("inventory", "Inventory Staff", "standard", ["products.view", "orders.view"]),
    role("cashier", "Cashier", "standard", ["orders.view"]),
    role("floor", "Floor Lead", "custom", ["products.view", "orders.view", "team.view"])
  ];

  var members = [
    member("m-owner", "Amelia Noir", "Shop Owner", "+95 9 770 111 001", "owner", "Active", true, hoursAgo(1)),
    member("m-jonah", "Jonah Ellis", "Shop Manager", "+95 9 770 111 002", "manager", "Active", false, hoursAgo(5)),
    member("m-mina", "Mina Chen", "Catalog Editor", "+95 9 770 111 003", "catalog", "Active", false, hoursAgo(20)),
    member("m-clara", "Clara Lind", "Inventory Staff", "+95 9 770 111 004", "inventory", "Active", false, hoursAgo(30)),
    member("m-leo", "Leo Park", "Cashier", "+95 9 770 111 005", "cashier", "Suspended", false, daysAgo(4)),
    member("m-sofia", "Sofia Marchetti", "Floor Lead", "+95 9 770 111 006", "floor", "Removed", false, daysAgo(12))
  ];

  var logs = [
    log("evt-1008", "Amelia Noir", "Shop Owner", "Create member", "Clara Lind", "Security Event", "Success", true, hoursAgo(3), { status: "none" }, { status: "Active", permissionId: "inventory" }),
    log("evt-1007", "Jonah Ellis", "Shop Manager", "Edit product", "Cashmere Funnel Coat", "Standard Activity", "Success", false, hoursAgo(6), { stock: 28 }, { stock: 30 }),
    log("evt-1006", "Leo Park", "Cashier", "Issue refund", "Order #STX-8922", "Security Event", "Blocked", true, daysAgo(1), { amount: 0 }, { amount: 42000 }),
    log("evt-1005", "Amelia Noir", "Shop Owner", "Suspend access", "Leo Park", "Security Event", "Warning", true, daysAgo(2), { status: "Active" }, { status: "Suspended" })
  ];

  var section = "members";
  var detailMemberId = null;
  var memberFilter = { query: "", roleId: "all", status: "All" };
  var logFilter = { actor: "", role: "all", action: "all", outcome: "All", security: false, from: "", to: "" };
  var memberPage = 1;
  var logPage = 1;
  var selectedRoleId = "manager";
  var seq = 1009;

  function role(id, name, kind, rolePermissions) {
    return { id: id, name: name, kind: kind, permissions: rolePermissions.slice() };
  }
  function member(id, name, position, phone, permissionId, status, owner, lastActive) {
    return {
      id: id,
      name: name,
      position: position || "",
      phone: phone || "",
      permissionId: permissionId,
      roleId: permissionId,
      status: status,
      owner: !!owner,
      lastActive: lastActive || null,
      passwordHash: null
    };
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
  function permissionById(id) { return permissions.filter(function (item) { return item.id === id; })[0]; }
  function memberById(id) { return members.filter(function (item) { return item.id === id; })[0]; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function permissionLabel(id) {
    var found = permissionById(id) || roleById(id);
    return found ? (found.label || found.name) : id;
  }
  function toast(message) { if (window.showToast) window.showToast(message); }

  window.getPermissions = function () {
    return permissions.map(clone);
  };

  window.getTeamMembers = function (shopId, filter) {
    filter = filter || {};
    return members.filter(function (item) {
      if (item.shopId && item.shopId !== shopId) return false;
      var query = (filter.query || "").trim().toLowerCase();
      if (query) {
        var haystack = (item.name + " " + item.phone + " " + item.position).toLowerCase();
        if (haystack.indexOf(query) === -1) return false;
      }
      var permissionId = filter.roleId || filter.permissionId;
      if (permissionId && permissionId !== "all" && item.permissionId !== permissionId) return false;
      if (filter.status && filter.status !== "All" && item.status !== filter.status) return false;
      return true;
    }).map(clone);
  };

  window.getTeamMember = function (shopId, memberId) {
    var found = memberById(memberId);
    if (!found || (found.shopId && found.shopId !== shopId)) return null;
    return clone(found);
  };

  window.createTeamMember = function (shopId, payload) {
    payload = payload || {};
    if (shopId !== SHOP) return { ok: false, message: "Unknown shop." };
    var name = String(payload.name || "").trim();
    var position = String(payload.position || "").trim();
    var phone = String(payload.phone || "").trim();
    var password = String(payload.password || "");
    var confirmPassword = String(payload.confirmPassword || "");
    var permissionId = payload.permissionId || payload.roleId;
    if (!name) return { ok: false, message: "Enter a name." };
    if (!position) return { ok: false, message: "Enter a position." };
    if (!phone) return { ok: false, message: "Enter a phone number." };
    if (!password || password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };
    if (password !== confirmPassword) return { ok: false, message: "Passwords do not match." };
    if (!permissionById(permissionId) || permissionId === "owner") return { ok: false, message: "Choose a permission." };
    var duplicate = members.filter(function (item) {
      return item.phone.replace(/\s+/g, "") === phone.replace(/\s+/g, "") && item.status !== "Removed";
    })[0];
    if (duplicate) return { ok: false, message: "That phone number already has access." };
    var created = member("m-" + Date.now(), name, position, phone, permissionId, "Active", false, new Date().toISOString());
    created.passwordHash = "mock:" + password.length;
    members.unshift(created);
    window.recordSecurityEvent(shopId, {
      actor: "Amelia Noir", actorRole: "Shop Owner", action: "Create member", target: name,
      category: "Security Event", outcome: "Success", security: true,
      before: { status: "none" }, after: { status: "Active", permissionId: permissionId, position: position, phone: phone }
    });
    return { ok: true, member: clone(created) };
  };

  window.updateTeamMemberAccount = function (shopId, memberId, payload) {
    payload = payload || {};
    var found = memberById(memberId);
    if (!found) return { ok: false, message: "Member not found." };
    var name = String(payload.name || "").trim();
    var position = String(payload.position || "").trim();
    var phone = String(payload.phone || "").trim();
    var permissionId = payload.permissionId || payload.roleId || found.permissionId;
    if (!name || !position || !phone) return { ok: false, message: "Name, position, and phone are required." };
    if (!permissionById(permissionId)) return { ok: false, message: "Choose a permission." };
    if (found.owner && permissionId !== found.permissionId) {
      return { ok: false, message: "Every shop must retain at least one active owner. Owner access cannot be downgraded without a verified ownership transfer." };
    }
    var before = { name: found.name, position: found.position, phone: found.phone, permissionId: found.permissionId };
    found.name = name;
    found.position = position;
    found.phone = phone;
    found.permissionId = permissionId;
    found.roleId = permissionId;
    window.recordSecurityEvent(shopId, {
      actor: "Amelia Noir", actorRole: "Shop Owner", action: "Update account", target: found.name,
      category: "Security Event", outcome: "Success", security: true,
      before: before, after: { name: name, position: position, phone: phone, permissionId: permissionId }
    });
    return { ok: true, member: clone(found) };
  };

  window.updateTeamMemberPermission = function (shopId, memberId, permissionId) {
    var found = memberById(memberId);
    if (!found) return { ok: false, message: "Member not found." };
    if (found.owner && permissionId !== found.permissionId) {
      return { ok: false, message: "Every shop must retain at least one active owner. Owner access cannot be downgraded without a verified ownership transfer." };
    }
    if (!permissionById(permissionId)) return { ok: false, message: "Choose a permission." };
    var before = { permissionId: found.permissionId };
    found.permissionId = permissionId;
    found.roleId = permissionId;
    window.recordSecurityEvent(shopId, {
      actor: "Amelia Noir", actorRole: "Shop Owner", action: "Change permission", target: found.name,
      category: "Security Event", outcome: "Success", security: true,
      before: before, after: { permissionId: permissionId }
    });
    return { ok: true, member: clone(found) };
  };

  window.resetTeamMemberPassword = function (shopId, memberId, password, confirmPassword) {
    var found = memberById(memberId);
    if (!found) return { ok: false, message: "Member not found." };
    if (!password || password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };
    if (password !== confirmPassword) return { ok: false, message: "Passwords do not match." };
    found.passwordHash = "mock:" + password.length;
    window.recordSecurityEvent(shopId, {
      actor: "Amelia Noir", actorRole: "Shop Owner", action: "Reset password", target: found.name,
      category: "Security Event", outcome: "Success", security: true,
      before: { password: "set" }, after: { password: "updated" }
    });
    return { ok: true, member: clone(found) };
  };

  window.deleteTeamMember = function (shopId, memberId) {
    var found = memberById(memberId);
    if (!found) return { ok: false, message: "Member not found." };
    if (found.owner) {
      return { ok: false, message: "Every shop must retain at least one active owner. Owner access cannot be removed without a verified ownership transfer." };
    }
    var before = { status: found.status };
    found.status = "Removed";
    window.recordSecurityEvent(shopId, {
      actor: "Amelia Noir", actorRole: "Shop Owner", action: "Delete member", target: found.name,
      category: "Security Event", outcome: "Success", security: true,
      before: before, after: { status: "Removed" }
    });
    return { ok: true, member: clone(found) };
  };

  window.getRoles = function () { return roles.map(clone); };

  window.updateRolePermissions = function (shopId, roleId, rolePermissions) {
    var found = roleById(roleId);
    if (!found) return { ok: false, message: "Role not found." };
    if (found.id === "owner") return { ok: false, message: "The Shop Owner role cannot be reduced." };
    found.permissions = rolePermissions.slice();
    window.recordSecurityEvent(shopId, {
      actor: "Amelia Noir", actorRole: "Shop Owner", action: "Update permissions", target: found.name,
      category: "Security Event", outcome: "Success", security: true,
      before: { roleId: roleId }, after: { permissions: rolePermissions.slice() }
    });
    return { ok: true, role: clone(found) };
  };

  window.getActivityLogs = function (shopId, filter) {
    filter = filter || {};
    return logs.filter(function (item) {
      if (item.shopId !== shopId) return false;
      if (filter.actor && item.actor.toLowerCase().indexOf(filter.actor.trim().toLowerCase()) === -1) return false;
      if (filter.role && filter.role !== "all" && item.actorRole !== filter.role) return false;
      if (filter.action && filter.action !== "all") {
        var aliases = { create: "creat", access: "access", role: "role", permissions: "permission", security: "security" };
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

  function whenStamp(value) { return value ? new Date(value).toLocaleString() : "Not yet"; }

  function memberUrl(id) {
    var url = new URL(window.location.href);
    if (id) url.searchParams.set("member", id);
    else url.searchParams.delete("member");
    return url.pathname + url.search + url.hash;
  }

  function readMemberFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get("member");
    } catch (error) {
      return null;
    }
  }

  function renderSections() {
    var showingDetail = !!detailMemberId;
    document.getElementById("team-sections").hidden = showingDetail;
    document.getElementById("team-panel-detail").hidden = !showingDetail;
    ["members", "roles", "logs"].forEach(function (name) {
      document.getElementById("team-panel-" + name).hidden = showingDetail || name !== section;
    });
    document.querySelectorAll("#team-sections button").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.section === section));
    });
    document.body.classList.toggle("is-team-detail", showingDetail);
  }

  function renderPermissionOptions(select, options) {
    options = options || {};
    var html = options.includeAll ? '<option value="all">All permissions</option>' : "";
    permissions.forEach(function (item) {
      if (options.skipOwner && item.id === "owner") return;
      if (options.includeOwnerOnly === false && item.id === "owner") return;
      html += '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.label) + "</option>";
    });
    select.innerHTML = html;
  }

  function renderRoleOptions(select, includeAll, skipOwner) {
    var html = includeAll ? '<option value="all">All roles</option>' : "";
    roles.forEach(function (item) {
      if (skipOwner && item.id === "owner") return;
      html += '<option value="' + escapeHtml(includeAll ? item.name : item.id) + '">' + escapeHtml(item.name) + "</option>";
    });
    select.innerHTML = html;
  }

  function permissionSelectHtml(item) {
    var locked = item.owner;
    var options = permissions.filter(function (permission) {
      return locked ? permission.id === item.permissionId : permission.id !== "owner";
    }).map(function (permission) {
      var selected = permission.id === item.permissionId ? " selected" : "";
      return '<option value="' + escapeHtml(permission.id) + '"' + selected + ">" + escapeHtml(permission.label) + "</option>";
    }).join("");
    return (
      '<select class="vis-select team-perm-select" data-member-permission="' + escapeHtml(item.id) + '" aria-label="Permission for ' + escapeHtml(item.name) + '"' +
        (locked ? " disabled title=\"Owner permission is locked\"" : "") + ">" +
        options +
      "</select>"
    );
  }

  function renderMembers() {
    var rows = window.getTeamMembers(SHOP, memberFilter);
    var paged = window.pageRows(rows, memberPage);
    memberPage = paged.page;
    var body = document.getElementById("team-member-rows");
    body.innerHTML = paged.rows.map(function (item) {
      return (
        "<tr data-member-row=\"" + escapeHtml(item.id) + "\">" +
          "<td class=\"is-primary\"><strong>" + escapeHtml(item.name) + "</strong></td>" +
          "<td>" + escapeHtml(item.position) + "</td>" +
          "<td>" + escapeHtml(item.phone) + "</td>" +
          "<td class=\"team-perm-cell\">" + permissionSelectHtml(item) + "</td>" +
          "<td class=\"is-actions\"><div class=\"row-actions team-row-actions\">" +
            "<button class=\"btn is-ghost\" type=\"button\" data-edit=\"" + escapeHtml(item.id) + "\">Edit</button>" +
          "</div></td>" +
        "</tr>"
      );
    }).join("") || '<tr class="is-empty"><td colspan="5">No team members match these filters.</td></tr>';
    window.renderPager(document.getElementById("team-member-pager"), paged.page, paged.pages, rows.length + (rows.length === 1 ? " member" : " members"));
    if (window.enhanceDataTables) window.enhanceDataTables(document.getElementById("team-panel-members"));
  }

  function renderDetail() {
    var found = memberById(detailMemberId);
    if (!found) {
      closeDetail(true);
      return;
    }
    document.getElementById("team-detail-title").textContent = found.name;
    document.getElementById("team-detail-subtitle").textContent = found.position + " · " + found.phone;
    document.getElementById("detail-name").value = found.name;
    document.getElementById("detail-position").value = found.position;
    document.getElementById("detail-phone").value = found.phone;
    renderPermissionOptions(document.getElementById("detail-permission"), { skipOwner: !found.owner });
    document.getElementById("detail-permission").disabled = !!found.owner;
    document.getElementById("detail-permission").value = found.permissionId;
    document.getElementById("team-account-error").hidden = true;
    document.getElementById("team-password-error").hidden = true;
    document.getElementById("team-password-form").reset();
    document.getElementById("team-delete-lock").hidden = !found.owner;
    document.getElementById("team-delete-open").disabled = !!found.owner;
    document.getElementById("team-delete-copy").textContent =
      "This permanently removes " + found.name + " and revokes their access. This cannot be undone.";
  }

  function openDetail(memberId, replace) {
    if (!memberById(memberId)) {
      toast("Member not found.");
      return;
    }
    detailMemberId = memberId;
    closeModal("team-create-modal");
    closeModal("team-delete-modal");
    renderSections();
    renderDetail();
    var url = memberUrl(memberId);
    if (replace) history.replaceState({ member: memberId }, "", url);
    else history.pushState({ member: memberId }, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeDetail(replace) {
    detailMemberId = null;
    section = "members";
    renderSections();
    renderMembers();
    var url = memberUrl(null);
    if (replace) history.replaceState({}, "", url);
    else history.pushState({}, "", url);
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
    var paged = window.pageRows(rows, logPage);
    logPage = paged.page;
    document.getElementById("team-log-rows").innerHTML = paged.rows.map(function (item) {
      return '<tr data-log="' + escapeHtml(item.id) + '" tabindex="0"><td>' + escapeHtml(whenStamp(item.at)) + "</td><td><strong>" + escapeHtml(item.actor) + "</strong><br>" + escapeHtml(item.actorRole) + "</td><td>" + escapeHtml(item.action) + "</td><td>" + escapeHtml(item.target) + '</td><td><span class="status-badge">' + escapeHtml(item.category) + '</span></td><td><span class="status-badge">' + escapeHtml(item.outcome) + "</span></td></tr>";
    }).join("") || '<tr class="is-empty"><td colspan="6">No activity matches these filters.</td></tr>';
    window.renderPager(document.getElementById("team-log-pager"), paged.page, paged.pages, rows.length + (rows.length === 1 ? " event" : " events"));
    if (window.enhanceDataTables) window.enhanceDataTables(document.getElementById("team-panel-logs"));
  }

  function renderStatusTabs() {
    var statuses = ["All", "Active", "Suspended", "Removed"];
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

  renderPermissionOptions(document.getElementById("team-role-filter"), { includeAll: true });
  renderRoleOptions(document.getElementById("log-role"), true);
  renderPermissionOptions(document.getElementById("create-permission"), { skipOwner: true });
  renderStatusTabs();
  renderOutcomes();

  var bootMember = readMemberFromUrl();
  if (bootMember && memberById(bootMember)) {
    detailMemberId = bootMember;
    renderSections();
    renderDetail();
  } else {
    renderSections();
    renderMembers();
  }
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
    memberPage = 1;
    window.runWithSkeleton(document.getElementById("team-member-rows"), renderMembers, { columns: 5, rows: 5, delay: 280 });
  });
  document.getElementById("team-role-filter").addEventListener("change", function (event) {
    memberFilter.roleId = event.target.value;
    memberPage = 1;
    window.runWithSkeleton(document.getElementById("team-member-rows"), renderMembers, { columns: 5, rows: 5 });
  });
  document.getElementById("team-status-tabs").addEventListener("click", function (event) {
    var button = event.target.closest("[data-status]");
    if (!button) return;
    memberFilter.status = button.dataset.status;
    memberPage = 1;
    renderStatusTabs();
    window.runWithSkeleton(document.getElementById("team-member-rows"), renderMembers, { columns: 5, rows: 5 });
  });
  document.getElementById("team-member-pager").addEventListener("click", function (event) {
    var button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    var rows = window.getTeamMembers(SHOP, memberFilter);
    var paged = window.pageRows(rows, memberPage);
    memberPage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    window.runWithSkeleton(document.getElementById("team-member-rows"), renderMembers, { columns: 5, rows: 5 });
  });

  document.getElementById("team-create-open").addEventListener("click", function () {
    document.getElementById("team-create-error").hidden = true;
    document.getElementById("team-create-form").reset();
    renderPermissionOptions(document.getElementById("create-permission"), { skipOwner: true });
    openModal("team-create-modal");
  });
  document.getElementById("team-create-cancel").addEventListener("click", function () { closeModal("team-create-modal"); });
  document.getElementById("team-create-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var result = window.createTeamMember(SHOP, {
      name: document.getElementById("create-name").value,
      position: document.getElementById("create-position").value,
      phone: document.getElementById("create-phone").value,
      password: document.getElementById("create-password").value,
      confirmPassword: document.getElementById("create-password-confirm").value,
      permissionId: document.getElementById("create-permission").value
    });
    var error = document.getElementById("team-create-error");
    if (!result.ok) {
      error.hidden = false;
      error.textContent = result.message;
      return;
    }
    closeModal("team-create-modal");
    toast(result.member.name + " created.");
    renderLogs();
    openDetail(result.member.id, true);
  });

  document.getElementById("team-member-rows").addEventListener("click", function (event) {
    var edit = event.target.closest("[data-edit]");
    if (edit) openDetail(edit.dataset.edit);
  });

  document.getElementById("team-member-rows").addEventListener("change", function (event) {
    var select = event.target.closest("[data-member-permission]");
    if (!select) return;
    var memberId = select.dataset.memberPermission;
    var nextPermission = select.value;
    var found = memberById(memberId);
    if (found && found.permissionId === nextPermission) return;
    var result = window.updateTeamMemberPermission(SHOP, memberId, nextPermission);
    if (!result.ok) {
      if (found) select.value = found.permissionId;
      toast(result.message);
      return;
    }
    toast("Permission updated to " + permissionLabel(result.member.permissionId) + ".");
    renderMembers();
    renderLogs();
  });

  document.getElementById("team-detail-back").addEventListener("click", function () {
    closeDetail(false);
  });

  document.getElementById("team-account-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var error = document.getElementById("team-account-error");
    var result = window.updateTeamMemberAccount(SHOP, detailMemberId, {
      name: document.getElementById("detail-name").value,
      position: document.getElementById("detail-position").value,
      phone: document.getElementById("detail-phone").value,
      permissionId: document.getElementById("detail-permission").value
    });
    if (!result.ok) {
      error.hidden = false;
      error.textContent = result.message;
      return;
    }
    error.hidden = true;
    toast("Account information updated.");
    renderDetail();
    renderMembers();
    renderLogs();
  });

  document.getElementById("team-password-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var error = document.getElementById("team-password-error");
    var password = document.getElementById("detail-password").value;
    var confirmPassword = document.getElementById("detail-password-confirm").value;
    if (!password || password.length < 6) {
      error.hidden = false;
      error.textContent = "Password must be at least 6 characters.";
      return;
    }
    if (password !== confirmPassword) {
      error.hidden = false;
      error.textContent = "Passwords do not match.";
      return;
    }
    error.hidden = true;
    var found = memberById(detailMemberId);
    document.getElementById("team-password-copy").textContent = found
      ? "This updates the sign-in password for " + found.name + ". They will need the new password next time they log in."
      : "This updates the sign-in password for this team member. They will need the new password next time they log in.";
    openModal("team-password-modal");
  });
  document.getElementById("team-password-cancel").addEventListener("click", function () { closeModal("team-password-modal"); });
  document.getElementById("team-password-confirm").addEventListener("click", function () {
    var error = document.getElementById("team-password-error");
    var result = window.resetTeamMemberPassword(
      SHOP,
      detailMemberId,
      document.getElementById("detail-password").value,
      document.getElementById("detail-password-confirm").value
    );
    if (!result.ok) {
      closeModal("team-password-modal");
      error.hidden = false;
      error.textContent = result.message;
      return;
    }
    closeModal("team-password-modal");
    error.hidden = true;
    document.getElementById("team-password-form").reset();
    toast("Password updated.");
    renderLogs();
  });

  document.getElementById("team-delete-open").addEventListener("click", function () {
    var found = memberById(detailMemberId);
    if (!found || found.owner) {
      document.getElementById("team-delete-lock").hidden = false;
      return;
    }
    document.getElementById("team-delete-copy").textContent =
      "This permanently removes " + found.name + " and revokes their access. This cannot be undone.";
    openModal("team-delete-modal");
  });
  document.getElementById("team-delete-cancel").addEventListener("click", function () { closeModal("team-delete-modal"); });
  document.getElementById("team-delete-confirm").addEventListener("click", function () {
    var result = window.deleteTeamMember(SHOP, detailMemberId);
    if (!result.ok) {
      closeModal("team-delete-modal");
      document.getElementById("team-delete-lock").hidden = false;
      document.getElementById("team-delete-lock").textContent = result.message;
      return;
    }
    closeModal("team-delete-modal");
    toast(result.member.name + " deleted.");
    closeDetail(true);
    renderLogs();
  });

  window.addEventListener("popstate", function () {
    var id = readMemberFromUrl();
    if (id && memberById(id)) {
      detailMemberId = id;
      renderSections();
      renderDetail();
    } else if (detailMemberId) {
      detailMemberId = null;
      section = "members";
      renderSections();
      renderMembers();
    }
  });

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
    var rolePermissions = [];
    document.querySelectorAll("[data-permission]:checked").forEach(function (input) { rolePermissions.push(input.dataset.permission); });
    var result = window.updateRolePermissions(SHOP, selectedRoleId, rolePermissions);
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
    permissions.push({ id: id, label: name, kind: "custom" });
    selectedRoleId = id;
    closeModal("team-role-modal");
    toast("Custom role created.");
    renderPermissionOptions(document.getElementById("team-role-filter"), { includeAll: true });
    renderRoleOptions(document.getElementById("log-role"), true);
    renderPermissionOptions(document.getElementById("create-permission"), { skipOwner: true });
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
    logPage = 1;
    renderOutcomes();
    window.runWithSkeleton(document.getElementById("team-log-rows"), renderLogs, { columns: 6, rows: 5 });
  });
  function readLogFilters() {
    logFilter.actor = document.getElementById("log-actor").value;
    logFilter.role = document.getElementById("log-role").value;
    logFilter.action = document.getElementById("log-action").value;
    logFilter.from = document.getElementById("log-from").value;
    logFilter.to = document.getElementById("log-to").value;
    logFilter.security = document.getElementById("log-security").checked;
    logPage = 1;
    window.runWithSkeleton(document.getElementById("team-log-rows"), renderLogs, { columns: 6, rows: 5, delay: 280 });
  }
  document.getElementById("team-log-pager").addEventListener("click", function (event) {
    var button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    var rows = window.getActivityLogs(SHOP, logFilter);
    var paged = window.pageRows(rows, logPage);
    logPage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    window.runWithSkeleton(document.getElementById("team-log-rows"), renderLogs, { columns: 6, rows: 5 });
  });
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
