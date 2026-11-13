(function () {
  if (document.body.dataset.page !== "message") return;

  var threads = [
    thread("t-maya", "Maya Okada", "MO", "#1f6b4f", hoursAgo(0.4), 2, [
      msg("m1", "customer", "Hi! Is the cashmere coat still available in M?", hoursAgo(5), null),
      msg("m2", "shop", "Yes — we have two left in medium.", hoursAgo(4.5), null),
      msg("m3", "customer", "Could you share a close-up of the lining?", hoursAgo(1), null),
      msg("m4", "customer", null, hoursAgo(0.4), "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80")
    ]),
    thread("t-liam", "Liam Chen", "LC", "#2c3e50", hoursAgo(3), 0, [
      msg("m1", "customer", "Order #STX-8841 arrived damaged. Can I get a replacement?", hoursAgo(26), null),
      msg("m2", "shop", "I'm sorry about that. Please send a photo of the damage and we'll arrange a replacement.", hoursAgo(25), null),
      msg("m3", "customer", "Here is the photo.", hoursAgo(24), "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"),
      msg("m4", "shop", "Received — replacement ships tomorrow.", hoursAgo(3), null)
    ]),
    thread("t-nina", "Nina Borges", "NB", "#6b3a2a", daysAgo(1), 1, [
      msg("m1", "customer", "Do you ship to Yangon next-day?", daysAgo(1.2), null),
      msg("m2", "shop", "Yes, next-day is available for Yangon orders placed before 2pm.", daysAgo(1.1), null),
      msg("m3", "customer", "Perfect, thank you!", daysAgo(1), null)
    ]),
    thread("t-owen", "Owen Park", "OP", "#3d4a6b", daysAgo(2), 0, [
      msg("m1", "customer", "Looking for the black loafers in 42.", daysAgo(2.5), null),
      msg("m2", "shop", "Size 42 is in stock. Want me to hold a pair for 24 hours?", daysAgo(2.2), null),
      msg("m3", "customer", "Yes please.", daysAgo(2), null)
    ]),
    thread("t-sara", "Sara Win", "SW", "#5a4570", daysAgo(4), 0, [
      msg("m1", "customer", null, daysAgo(4.2), "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80"),
      msg("m2", "customer", "Is this scarf still on promotion?", daysAgo(4), null),
      msg("m3", "shop", "That promo ended yesterday, but we can offer 10% if you order today.", daysAgo(3.8), null)
    ])
  ];

  var selectedId = null;
  var query = "";
  var pendingImage = null;

  function hoursAgo(hours) { return new Date(Date.now() - hours * 3600000).toISOString(); }
  function daysAgo(days) { return new Date(Date.now() - days * 86400000).toISOString(); }
  function msg(id, sender, text, at, image) {
    return { id: id, sender: sender, text: text || "", image: image || null, at: at };
  }
  function thread(id, name, initials, color, updatedAt, unread, messages) {
    return { id: id, customerName: name, initials: initials, color: color, updatedAt: updatedAt, unread: unread, messages: messages };
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function threadById(id) { return threads.filter(function (item) { return item.id === id; })[0]; }
  function lastMessage(item) { return item.messages[item.messages.length - 1]; }
  function snippet(item) {
    var last = lastMessage(item);
    if (!last) return "";
    if (last.image && !last.text) return "[Sent an image]";
    if (last.image && last.text) return last.text;
    return last.text;
  }
  function whenLabel(iso) {
    var date = new Date(iso);
    var now = new Date();
    var sameDay = date.toDateString() === now.toDateString();
    if (sameDay) return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    var yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  function bubbleTime(iso) {
    return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  window.getInboxThreads = function (filter) {
    filter = filter || {};
    var q = (filter.query || "").trim().toLowerCase();
    return threads.filter(function (item) {
      if (!q) return true;
      return (item.customerName + " " + snippet(item)).toLowerCase().indexOf(q) !== -1;
    }).slice().sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }).map(clone);
  };

  window.getInboxThread = function (id) {
    var found = threadById(id);
    return found ? clone(found) : null;
  };

  window.replyToInboxThread = function (id, payload) {
    payload = payload || {};
    var found = threadById(id);
    if (!found) return { ok: false, message: "Conversation not found." };
    var text = String(payload.text || "").trim();
    var image = payload.image || null;
    if (!text && !image) return { ok: false, message: "Write a message or attach an image." };
    var created = msg("m-" + Date.now(), "shop", text, new Date().toISOString(), image);
    found.messages.push(created);
    found.updatedAt = created.at;
    found.unread = 0;
    return { ok: true, message: clone(created), thread: clone(found) };
  };

  window.markInboxThreadRead = function (id) {
    var found = threadById(id);
    if (!found) return { ok: false };
    found.unread = 0;
    return { ok: true, thread: clone(found) };
  };

  function renderThreadList() {
    var list = window.getInboxThreads({ query: query });
    var root = document.getElementById("inbox-thread-list");
    if (!list.length) {
      root.innerHTML = '<p class="inbox-list-empty">No conversations match your search.</p>';
      return;
    }
    root.innerHTML = list.map(function (item) {
      var active = item.id === selectedId ? " is-active" : "";
      var unread = item.unread ? '<span class="inbox-unread">' + item.unread + "</span>" : "";
      return (
        '<button type="button" class="inbox-thread' + active + '" role="listitem" data-thread="' + escapeHtml(item.id) + '">' +
          '<span class="inbox-avatar" style="--avatar-color:' + escapeHtml(item.color) + '" aria-hidden="true">' + escapeHtml(item.initials) + "</span>" +
          '<span class="inbox-thread-copy">' +
            '<span class="inbox-thread-top"><strong>' + escapeHtml(item.customerName) + "</strong><time>" + escapeHtml(whenLabel(item.updatedAt)) + "</time></span>" +
            '<span class="inbox-thread-snip">' + escapeHtml(snippet(item)) + "</span>" +
          "</span>" + unread +
        "</button>"
      );
    }).join("");
  }

  function renderMessages(item) {
    var root = document.getElementById("inbox-messages");
    root.innerHTML = item.messages.map(function (entry) {
      var mine = entry.sender === "shop";
      var image = entry.image
        ? '<a class="inbox-image" href="' + escapeHtml(entry.image) + '" target="_blank" rel="noopener"><img src="' + escapeHtml(entry.image) + '" alt="Shared image" loading="lazy" /></a>'
        : "";
      var text = entry.text ? '<p>' + escapeHtml(entry.text) + "</p>" : "";
      return (
        '<article class="inbox-bubble' + (mine ? " is-shop" : " is-customer") + '">' +
          image + text +
          '<time>' + escapeHtml(bubbleTime(entry.at)) + "</time>" +
        "</article>"
      );
    }).join("");
    root.scrollTop = root.scrollHeight;
  }

  function clearAttachment() {
    pendingImage = null;
    document.getElementById("attach-input").value = "";
    document.getElementById("attach-preview").hidden = true;
    document.getElementById("attach-preview-img").removeAttribute("src");
  }

  function showChat(id, push) {
    var found = threadById(id);
    if (!found) return;
    selectedId = id;
    window.markInboxThreadRead(id);
    var empty = document.getElementById("inbox-empty");
    var chat = document.getElementById("inbox-chat");
    empty.hidden = true;
    empty.setAttribute("aria-hidden", "true");
    chat.hidden = false;
    chat.removeAttribute("aria-hidden");
    document.getElementById("inbox-chat-pane").dataset.empty = "false";
    document.getElementById("message-app").classList.add("is-chat-open");
    document.body.classList.add("is-message-chat");
    document.getElementById("chat-name").textContent = found.customerName;
    document.getElementById("chat-meta").textContent = "Customer conversation";
    var avatar = document.getElementById("chat-avatar");
    avatar.textContent = found.initials;
    avatar.style.setProperty("--avatar-color", found.color);
    clearAttachment();
    document.getElementById("composer-text").value = "";
    renderMessages(found);
    renderThreadList();
    var url = new URL(window.location.href);
    url.searchParams.set("thread", id);
    if (push) history.pushState({ thread: id }, "", url.pathname + url.search);
    else history.replaceState({ thread: id }, "", url.pathname + url.search);
  }

  function showList(push) {
    selectedId = null;
    var empty = document.getElementById("inbox-empty");
    var chat = document.getElementById("inbox-chat");
    empty.hidden = false;
    empty.removeAttribute("aria-hidden");
    chat.hidden = true;
    chat.setAttribute("aria-hidden", "true");
    document.getElementById("inbox-chat-pane").dataset.empty = "true";
    document.getElementById("message-app").classList.remove("is-chat-open");
    document.body.classList.remove("is-message-chat");
    clearAttachment();
    renderThreadList();
    var url = new URL(window.location.href);
    url.searchParams.delete("thread");
    if (push) history.pushState({}, "", url.pathname + url.search);
    else history.replaceState({}, "", url.pathname + url.search);
  }

  renderThreadList();
  var bootThread = null;
  try { bootThread = new URLSearchParams(window.location.search).get("thread"); } catch (error) {}
  if (bootThread && threadById(bootThread)) showChat(bootThread, false);

  document.getElementById("inbox-search").addEventListener("input", function (event) {
    query = event.target.value;
    renderThreadList();
  });

  document.getElementById("inbox-thread-list").addEventListener("click", function (event) {
    var button = event.target.closest("[data-thread]");
    if (!button) return;
    showChat(button.dataset.thread, true);
  });

  document.getElementById("inbox-back").addEventListener("click", function () {
    showList(true);
  });

  document.getElementById("attach-input").addEventListener("change", function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      if (window.showToast) window.showToast("Only image files can be attached.");
      event.target.value = "";
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      pendingImage = reader.result;
      document.getElementById("attach-preview-img").src = pendingImage;
      document.getElementById("attach-preview").hidden = false;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("attach-clear").addEventListener("click", clearAttachment);

  document.getElementById("inbox-composer").addEventListener("submit", function (event) {
    event.preventDefault();
    if (!selectedId) return;
    var text = document.getElementById("composer-text").value;
    var image = pendingImage;
    var sendBtn = document.getElementById("composer-send");
    var run = function () {
      var result = window.replyToInboxThread(selectedId, { text: text, image: image });
      if (!result.ok) {
        if (window.showToast) window.showToast(result.message);
        return;
      }
      document.getElementById("composer-text").value = "";
      clearAttachment();
      renderMessages(threadById(selectedId));
      renderThreadList();
    };
    if (window.runWithLoading) window.runWithLoading(sendBtn, run);
    else run();
  });

  window.addEventListener("popstate", function () {
    var id = null;
    try { id = new URLSearchParams(window.location.search).get("thread"); } catch (error) {}
    if (id && threadById(id)) showChat(id, false);
    else showList(false);
  });
})();
