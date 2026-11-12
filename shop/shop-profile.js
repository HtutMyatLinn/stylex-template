(function () {
  var KEY = "stylex-shop-profile";
  var SHOP = "atelier-noir";
  var RESERVED = ["stylex", "novahub", "admin"];
  var BANNED = ["fuck", "shit", "bitch", "asshole"];
  var SOCIAL = {
    facebook: ["facebook.com", "fb.com"],
    instagram: ["instagram.com"],
    tiktok: ["tiktok.com"]
  };
  var state = load();
  var crop = null;

  function defaults() {
    return {
      shopId: SHOP,
      name: "Atelier Noir",
      slug: "ateliernoir",
      logo: "",
      cover: "",
      logoName: "",
      coverName: "",
      story: "Atelier Noir cuts quiet tailoring in small runs in Yangon.",
      philosophy: {
        vision: "Clothes that stay in a wardrobe for years.",
        mission: "Make precise garments with local workshops.",
        ideas: "Restraint, proportion, and cloth that ages well.",
        concepts: "City uniform, small batch, repairable pieces."
      },
      founders: [
        { id: "f-amelia", name: "Amelia Noir", role: "Founder", bio: "Cuts the collection and runs the workroom.", photo: "", photoName: "" }
      ],
      phone: "09123456789",
      address: "No. 18, Pansodan Street, Yangon",
      socials: {
        facebook: "https://facebook.com/ateliernoir",
        instagram: "https://instagram.com/ateliernoir",
        tiktok: "https://tiktok.com/@ateliernoir"
      },
      policy: { window: "14", conditions: ["unworn", "tagged"], terms: "Returns are accepted in the original condition with proof of purchase." },
      vacation: false,
      vacationMessage: "We are briefly away from the workroom.",
      checkoutDisabled: false
    };
  }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && saved.shopId === SHOP) return saved;
    } catch (error) {}
    return defaults();
  }

  function persist() {
    localStorage.setItem(KEY, JSON.stringify(state));
    return state;
  }

  function escapeText(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function sanitize(raw) {
    var box = document.createElement("div");
    box.innerHTML = String(raw || "");
    box.querySelectorAll("script, style, iframe, object").forEach(function (node) { node.remove(); });
    box.querySelectorAll("*").forEach(function (node) {
      var allowed = ["P", "BR", "B", "STRONG", "I", "EM", "UL", "OL", "LI", "H2", "H3"];
      if (allowed.indexOf(node.tagName) === -1) {
        node.replaceWith(document.createTextNode(node.textContent));
        return;
      }
      Array.from(node.attributes).forEach(function (attr) { node.removeAttribute(attr.name); });
    });
    return box.innerHTML;
  }

  function hasProfanity(text) {
    var value = String(text || "").toLowerCase();
    return BANNED.filter(function (word) { return value.indexOf(word) !== -1; });
  }

  function uuidName(file) {
    var id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : "img-" + Date.now();
    var ext = /png$/i.test(file.type) || /\.png$/i.test(file.name) ? "png" : "jpg";
    return id + "." + ext;
  }

  function readImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/image\/(jpeg|png)/.test(file.type)) {
        reject(new Error("Only .jpg and .png files are accepted."));
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var image = new Image();
        image.onload = function () {
          var scale = Math.min(1, 1200 / Math.max(image.width, image.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve({ url: canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.72), name: uuidName(file) });
        };
        image.onerror = function () { reject(new Error("That image could not be read.")); };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  window.uploadShopMedia = function (file, type) {
    return readImage(file).then(function (media) {
      media.type = type;
      return media;
    });
  };

  window.cropImage = function (imageId, cropData) {
    var image = document.getElementById("crop-preview");
    var canvas = document.createElement("canvas");
    var size = 640;
    canvas.width = size;
    canvas.height = imageId === "logo" ? size : 360;
    var ctx = canvas.getContext("2d");
    var scale = cropData && cropData.scale ? cropData.scale : 1;
    var dw = image.naturalWidth * scale;
    var dh = image.naturalHeight * scale;
    ctx.drawImage(image, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
    var url = canvas.toDataURL("image/jpeg", 0.72);
    if (imageId === "logo") state.logo = url;
    if (imageId === "cover") state.cover = url;
    return { id: imageId, url: url };
  };

  function plainText(value) {
    var box = document.createElement("div");
    box.innerHTML = String(value || "");
    return box.textContent.replace(/\s+/g, " ").trim();
  }

  window.saveShopStory = function (rawText) {
    var box = document.createElement("div");
    box.innerHTML = String(rawText || "");
    state.story = box.textContent.replace(/\s+/g, " ").trim();
    return state.story;
  };

  window.savePhilosophy = function (data) {
    state.philosophy = {
      vision: sanitize(data.vision),
      mission: sanitize(data.mission),
      ideas: sanitize(data.ideas),
      concepts: sanitize(data.concepts)
    };
    return state.philosophy;
  };

  window.addFounderProfile = function (founderData) {
    var founder = {
      id: "f-" + Date.now(),
      name: sanitize(founderData.name || "New founder"),
      role: sanitize(founderData.role || "Founder"),
      bio: sanitize(founderData.bio || ""),
      photo: founderData.photo || "",
      photoName: founderData.photoName || ""
    };
    state.founders.push(founder);
    return founder;
  };

  window.uploadFounderPic = function (file) { return readImage(file); };

  window.validateSocialLinks = function (urls) {
    var errors = [];
    Object.keys(SOCIAL).forEach(function (key) {
      var url = (urls[key] || "").trim();
      if (!url) return;
      var parsed;
      try { parsed = new URL(url); } catch (error) { parsed = null; }
      var host = parsed ? parsed.hostname.replace(/^www\./, "") : "";
      if (!parsed || parsed.protocol !== "https:" || SOCIAL[key].indexOf(host) === -1) {
        errors.push(key + " must be an https link on " + SOCIAL[key][0] + ".");
      }
    });
    return { ok: errors.length === 0, errors: errors };
  };

  window.validateContactInfo = function (phone, address) {
    var okPhone = /^09\d{7,9}$/.test(String(phone || "").trim());
    return { ok: okPhone && String(address || "").trim().length > 3, phone: okPhone, address: String(address || "").trim() };
  };

  window.saveShopPolicies = function (policyData) {
    state.policy = {
      window: policyData.window,
      conditions: policyData.conditions.slice(),
      terms: sanitize(policyData.terms)
    };
    return state.policy;
  };

  window.checkSlugAvailability = function (slug) {
    var value = String(slug || "").trim();
    if (!/^[a-z0-9]+$/.test(value)) return { ok: false, available: false, reason: "Use only lowercase letters and numbers." };
    if (RESERVED.indexOf(value) !== -1) return { ok: true, available: false, reason: "That shop URL is taken." };
    return { ok: true, available: true, reason: "Available" };
  };

  window.generateCustomURL = function (slug) {
    var check = window.checkSlugAvailability(slug);
    return check.available ? "marketplace.com/shop/" + slug : "";
  };

  window.disableCheckoutForShop = function (shopId) {
    if (shopId !== SHOP) return false;
    state.checkoutDisabled = true;
    return true;
  };

  window.toggleVacationMode = function (isEnabled) {
    state.vacation = !!isEnabled;
    state.checkoutDisabled = !!isEnabled;
    if (isEnabled) window.disableCheckoutForShop(SHOP);
    return state.vacation;
  };

  if (document.body.dataset.page !== "shop-profile") return;

  var story = document.getElementById("shop-story");
  var nameInput = document.getElementById("shop-name");
  var slugInput = document.getElementById("shop-slug");

  function paintMedia(id, url, label) {
    var drop = document.getElementById(id + "-drop");
    var meta = document.getElementById(id + "-meta");
    if (url) {
      drop.style.backgroundImage = "url(" + url + ")";
      drop.classList.add("has-image");
    }
    meta.hidden = !label;
    meta.textContent = label || "";
  }

  function renderFounders() {
    document.getElementById("founder-list").innerHTML = state.founders.map(function (founder, index) {
      return '<article class="founder-card" data-founder="' + index + '">' +
        '<label class="profile-drop">Founder photo<input type="file" data-founder-photo="' + index + '" accept=".jpg,.jpeg,.png,image/jpeg,image/png" hidden /></label>' +
        '<p class="profile-file">' + (founder.photoName || "") + '</p>' +
        '<label class="field"><span>Name</span><input data-founder-name="' + index + '" type="text" value="' + escapeAttr(founder.name) + '" /></label>' +
        '<label class="field"><span>Role</span><input data-founder-role="' + index + '" type="text" value="' + escapeAttr(founder.role) + '" /></label>' +
        '<label class="field"><span>Bio</span><textarea data-founder-bio="' + index + '" rows="3">' + escapeText(founder.bio) + '</textarea></label>' +
        '<button class="btn is-ghost" type="button" data-remove-founder="' + index + '">Remove</button></article>';
    }).join("");
    state.founders.forEach(function (founder, index) {
      if (!founder.photo) return;
      var drop = document.querySelector('[data-founder="' + index + '"] .profile-drop');
      if (drop) {
        drop.style.backgroundImage = "url(" + founder.photo + ")";
        drop.classList.add("has-image");
      }
    });
  }

  function escapeAttr(value) { return escapeText(value).replace(/"/g, "&quot;"); }

  function fillForm() {
    nameInput.value = state.name;
    slugInput.value = state.slug;
    story.value = plainText(state.story);
    document.getElementById("phil-vision").value = state.philosophy.vision;
    document.getElementById("phil-mission").value = state.philosophy.mission;
    document.getElementById("phil-ideas").value = state.philosophy.ideas;
    document.getElementById("phil-concepts").value = state.philosophy.concepts;
    document.getElementById("shop-phone").value = state.phone;
    document.getElementById("shop-address").value = state.address;
    document.getElementById("social-facebook").value = state.socials.facebook;
    document.getElementById("social-instagram").value = state.socials.instagram;
    document.getElementById("social-tiktok").value = state.socials.tiktok;
    document.getElementById("policy-window").value = state.policy.window;
    document.getElementById("policy-terms").value = state.policy.terms.replace(/<[^>]+>/g, "");
    document.querySelectorAll("[data-condition]").forEach(function (input) {
      input.checked = state.policy.conditions.indexOf(input.dataset.condition) !== -1;
    });
    document.getElementById("vacation-toggle").checked = state.vacation;
    document.getElementById("vacation-message").value = state.vacationMessage;
    paintMedia("logo", state.logo, state.logoName);
    paintMedia("cover", state.cover, state.coverName);
    renderFounders();
    refreshMeta();
  }

  function refreshMeta() {
    document.getElementById("shop-name-count").textContent = nameInput.value.trim().length + " / 40";
    var check = window.checkSlugAvailability(slugInput.value.trim());
    var badge = document.getElementById("slug-badge");
    badge.textContent = check.available ? "Available · " + window.generateCustomURL(slugInput.value.trim()) : check.reason;
    badge.className = "profile-badge " + (check.available ? "is-ok" : "is-bad");
    var status = document.getElementById("shop-status");
    status.textContent = state.vacation ? "On vacation" : "Live";
    status.classList.toggle("is-vacation", state.vacation);
    document.getElementById("vacation-preview").hidden = !state.vacation;
    document.getElementById("shop-publish").disabled = !(state.logo && state.cover && nameInput.value.trim() && check.available);
  }

  function openCrop(kind, media) {
    crop = { id: kind, name: media.name, url: media.url };
    var preview = document.getElementById("crop-preview");
    preview.src = media.url;
    document.getElementById("crop-scale").value = "1";
    preview.style.transform = "scale(1)";
    document.getElementById("crop-modal").hidden = false;
  }

  function bindFile(inputId, kind) {
    document.getElementById(inputId).addEventListener("change", function (event) {
      var file = event.target.files[0];
      window.uploadShopMedia(file, kind).then(function (media) { openCrop(kind, media); }).catch(function (error) {
        showError(error.message);
      });
    });
  }

  function showError(message) {
    var node = document.getElementById("shop-form-error");
    node.hidden = !message;
    node.textContent = message || "";
  }

  fillForm();
  bindFile("logo-file", "logo");
  bindFile("cover-file", "cover");

  document.getElementById("crop-scale").addEventListener("input", function (event) {
    document.getElementById("crop-preview").style.transform = "scale(" + event.target.value + ")";
  });
  document.getElementById("crop-cancel").addEventListener("click", function () {
    document.getElementById("crop-modal").hidden = true;
    crop = null;
  });
  document.getElementById("crop-apply").addEventListener("click", function () {
    var result = window.cropImage(crop.id, { scale: Number(document.getElementById("crop-scale").value) });
    if (crop.id === "logo") state.logoName = crop.name;
    if (crop.id === "cover") state.coverName = crop.name;
    paintMedia(crop.id, result.url, crop.name);
    document.getElementById("crop-modal").hidden = true;
    refreshMeta();
  });

  nameInput.addEventListener("input", refreshMeta);
  slugInput.addEventListener("input", function () {
    slugInput.value = slugInput.value.toLowerCase().replace(/[^a-z0-9]/g, "");
    refreshMeta();
  });
  document.getElementById("vacation-toggle").addEventListener("change", function (event) {
    window.toggleVacationMode(event.target.checked);
    refreshMeta();
  });
  document.getElementById("add-founder").addEventListener("click", function () {
    readFounders();
    window.addFounderProfile({ name: "New founder", role: "Founder", bio: "" });
    renderFounders();
  });
  document.getElementById("founder-list").addEventListener("click", function (event) {
    var button = event.target.closest("[data-remove-founder]");
    if (!button) return;
    readFounders();
    state.founders.splice(Number(button.dataset.removeFounder), 1);
    renderFounders();
  });
  document.getElementById("founder-list").addEventListener("change", function (event) {
    var input = event.target.closest("[data-founder-photo]");
    if (!input || !input.files[0]) return;
    var index = Number(input.dataset.founderPhoto);
    window.uploadFounderPic(input.files[0]).then(function (media) {
      state.founders[index].photo = media.url;
      state.founders[index].photoName = media.name;
      renderFounders();
    }).catch(function (error) { showError(error.message); });
  });

  function readFounders() {
    state.founders.forEach(function (founder, index) {
      var name = document.querySelector('[data-founder-name="' + index + '"]');
      var role = document.querySelector('[data-founder-role="' + index + '"]');
      var bio = document.querySelector('[data-founder-bio="' + index + '"]');
      if (name) founder.name = name.value;
      if (role) founder.role = role.value;
      if (bio) founder.bio = bio.value;
    });
  }

  document.getElementById("shop-preview").addEventListener("click", function () {
    var frame = document.getElementById("shop-preview-frame");
    if (!frame.getAttribute("src")) frame.setAttribute("src", "../customer/shop-public.html");
    document.getElementById("shop-preview-modal").hidden = false;
  });
  document.getElementById("shop-preview-close").addEventListener("click", function () {
    document.getElementById("shop-preview-modal").hidden = true;
  });

  document.getElementById("shop-profile-form").addEventListener("submit", function (event) {
    event.preventDefault();
    readFounders();
    var name = nameInput.value.trim();
    var slug = slugInput.value.trim();
    var phone = document.getElementById("shop-phone").value.trim();
    var address = document.getElementById("shop-address").value.trim();
    var socials = {
      facebook: document.getElementById("social-facebook").value.trim(),
      instagram: document.getElementById("social-instagram").value.trim(),
      tiktok: document.getElementById("social-tiktok").value.trim()
    };
    var contact = window.validateContactInfo(phone, address);
    var social = window.validateSocialLinks(socials);
    var slugCheck = window.checkSlugAvailability(slug);
    var scanned = [name, story.value, document.getElementById("phil-vision").value, document.getElementById("phil-mission").value, document.getElementById("phil-ideas").value, document.getElementById("phil-concepts").value].concat(state.founders.map(function (founder) { return founder.name + " " + founder.bio; })).join(" ");
    var flagged = hasProfanity(scanned);
    document.getElementById("phone-error").hidden = contact.phone;
    document.getElementById("social-error").hidden = social.ok;
    document.getElementById("social-error").textContent = social.errors.join(" ");
    if (!state.logo || !state.cover) return showError("Add both a shop logo and a cover photo before publishing.");
    if (name.length < 1 || name.length > 40) return showError("Shop name must be 1 to 40 characters.");
    if (!slugCheck.available) return showError(slugCheck.reason);
    if (!contact.ok) return showError("Check the phone number and shop address.");
    if (!social.ok) return showError(social.errors[0]);
    if (flagged.length) return showError("Remove language that cannot be published: " + flagged.join(", ") + ".");
    state.name = name;
    state.slug = slug;
    state.phone = phone;
    state.address = address;
    state.socials = socials;
    state.vacationMessage = document.getElementById("vacation-message").value.trim();
    window.saveShopStory(story.value);
    window.savePhilosophy({
      vision: document.getElementById("phil-vision").value,
      mission: document.getElementById("phil-mission").value,
      ideas: document.getElementById("phil-ideas").value,
      concepts: document.getElementById("phil-concepts").value
    });
    state.founders = state.founders.map(function (founder) {
      founder.name = sanitize(founder.name);
      founder.role = sanitize(founder.role);
      founder.bio = sanitize(founder.bio);
      return founder;
    });
    window.saveShopPolicies({
      window: document.getElementById("policy-window").value,
      conditions: Array.from(document.querySelectorAll("[data-condition]:checked")).map(function (input) { return input.dataset.condition; }),
      terms: document.getElementById("policy-terms").value
    });
    window.toggleVacationMode(document.getElementById("vacation-toggle").checked);
    persist();
    showError("");
    if (window.showToast) window.showToast("Shop profile submitted for approval.");
    refreshMeta();
  });
})();
