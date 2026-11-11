(function () {
  if (document.body.dataset.page !== "studio") return;

  const SHOP_ID = "atelier-noir";
  const MAX_PHOTOS = 20;
  const MAX_BYTES = 10 * 1024 * 1024;
  const ALLOWED = ["jpg", "jpeg", "png", "webp"];
  const PRESETS = [
    { url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80", caption: "Midnight column, silk", name: "column.jpg" },
    { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80", caption: "City coat, camel wool", name: "coat.jpg" },
    { url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80", caption: "Atelier rail, ivory edit", name: "rail.jpg" },
  ];

  const savedCopy = "Atelier Noir cuts quiet tailoring for the city. Each look is made in small runs in Yangon, in wool, silk, and leather chosen for how they fall in warm light. The studio gallery is the public record of those collections.";

  let photos = [
    photo("STU-01", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", "Ivory silk, walking the colonnade", 1, true, "jpg", 1840000),
    photo("STU-02", "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80", "Noir wool blazer, studio light", 2, false, "jpg", 1620000),
    photo("STU-03", "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80", "Pleated skirt, late afternoon", 3, false, "jpg", 1410000),
    photo("STU-04", "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80", "Leather boot, sculpted last", 4, false, "webp", 980000),
    photo("STU-05", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80", "Cashmere coat, doorway", 5, false, "png", 2100000),
    photo("STU-06", "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=900&q=80", "Tailoring table, black thread", 6, false, "jpg", 1330000),
  ];
  let description = savedCopy;
  let published = savedCopy;
  let query = "";
  let view = "grid";
  let editingId = null;
  let pendingImage = null;
  let deleteId = null;
  let dragId = null;

  function photo(id, url, caption, order, cover, format, size) {
    return { id: id, shopId: SHOP_ID, url: url, caption: caption, displayOrder: order, isCover: cover, format: format, size: size };
  }

  function sorted() {
    return photos.slice().sort(function (a, b) { return a.displayOrder - b.displayOrder; });
  }

  function visible() {
    const text = query.trim().toLowerCase();
    return sorted().filter(function (item) {
      return !text || item.caption.toLowerCase().indexOf(text) !== -1;
    });
  }

  function reindex() {
    sorted().forEach(function (item, index) { item.displayOrder = index + 1; });
    if (!photos.some(function (item) { return item.isCover; }) && photos[0]) photos[0].isCover = true;
  }

  function owns(shopId, photoId) {
    return photos.find(function (item) { return item.shopId === shopId && item.id === photoId; }) || null;
  }

  function formatSize(bytes) {
    if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + " MB";
    return Math.max(1, Math.round(bytes / 1000)) + " KB";
  }

  function sanitize(value) {
    return String(value || "")
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<\/?[^>]+>/g, "")
      .replace(/javascript:/gi, "")
      .trim();
  }

  function notify(kind, message) {
    window.showToast(message);
    const node = document.getElementById("toast");
    if (node) node.classList.toggle("is-error", kind === "error");
  }

  function validateFile(imageFile) {
    if (!imageFile) return { ok: false, error: "Choose an image before saving." };
    const name = imageFile.name || "";
    const ext = (name.split(".").pop() || "").toLowerCase();
    const type = (imageFile.type || "").toLowerCase();
    const allowedType = type === "image/jpeg" || type === "image/png" || type === "image/webp" || ALLOWED.indexOf(ext) !== -1;
    if (!allowedType) return { ok: false, error: "Photo Upload Failed. Use JPG, JPEG, PNG, or WEBP." };
    if (imageFile.size > MAX_BYTES) return { ok: false, error: "Photo Upload Failed. Each image must be 10 MB or smaller." };
    return { ok: true };
  }

  function getShopPhotos(shopId) {
    if (shopId !== SHOP_ID) return [];
    return sorted().map(function (item) { return Object.assign({}, item); });
  }

  function uploadShopPhoto(shopId, imageFile, caption) {
    if (shopId !== SHOP_ID) return { ok: false, error: "Photo Upload Failed. This gallery belongs to another shop." };
    if (photos.length >= MAX_PHOTOS) return { ok: false, error: "Photo Upload Failed. The gallery already holds 20 active photos." };
    const check = validateFile(imageFile);
    if (!check.ok) return check;
    const next = photo(
      "STU-" + String(Date.now()).slice(-6),
      imageFile.url || "",
      sanitize(caption).slice(0, 150),
      photos.length + 1,
      false,
      ((imageFile.name || "jpg").split(".").pop() || "jpg").toLowerCase(),
      imageFile.size || 0
    );
    photos.push(next);
    return { ok: true, photo: next };
  }

  function updateShopPhoto(shopId, photoId, imageFile, caption) {
    const item = owns(shopId, photoId);
    if (!item) return { ok: false, error: "Photo Upload Failed. This photo is not in your gallery." };
    if (imageFile) {
      const check = validateFile(imageFile);
      if (!check.ok) return check;
      if (imageFile.url) item.url = imageFile.url;
      item.format = ((imageFile.name || item.format).split(".").pop() || item.format).toLowerCase();
      item.size = imageFile.size || item.size;
    }
    item.caption = sanitize(caption).slice(0, 150);
    return { ok: true, photo: item };
  }

  function deleteShopPhoto(shopId, photoId) {
    const item = owns(shopId, photoId);
    if (!item) return { ok: false, error: "This photo is not in your gallery." };
    photos = photos.filter(function (entry) { return entry.id !== photoId; });
    reindex();
    return { ok: true };
  }

  function setPhotoDisplay(shopId, photoId, isCover, displayOrder) {
    const item = owns(shopId, photoId);
    if (!item) return { ok: false };
    if (isCover) {
      photos.forEach(function (entry) { entry.isCover = entry.id === photoId; });
    }
    if (displayOrder) {
      const list = sorted().filter(function (entry) { return entry.id !== photoId; });
      list.splice(Math.max(0, displayOrder - 1), 0, item);
      list.forEach(function (entry, index) { entry.displayOrder = index + 1; });
    }
    return { ok: true, photo: item };
  }

  function saveShopDescription(shopId, text) {
    if (shopId !== SHOP_ID) return { ok: false, error: "Description cannot be saved for this shop." };
    const clean = sanitize(text);
    if (!clean) return { ok: false, error: "Description cannot be empty." };
    if (clean.length > 2000) return { ok: false, error: "Description must be 2,000 characters or fewer." };
    description = clean;
    published = clean;
    return { ok: true, description: clean };
  }

  function previewShopProfile(shopId) {
    const list = getShopPhotos(shopId);
    return {
      shopId: shopId,
      name: "Atelier Noir",
      location: "Yangon",
      rating: "4.9",
      cover: list.find(function (item) { return item.isCover; }) || list[0] || null,
      photos: list,
      description: sanitize(document.getElementById("studio-description").value),
    };
  }

  function renderCapacity() {
    const node = document.getElementById("studio-capacity");
    node.textContent = photos.length + " / 20 Active Photos";
    node.classList.toggle("is-full", photos.length >= MAX_PHOTOS);
  }

  function renderDescription() {
    const field = document.getElementById("studio-description");
    const count = field.value.length;
    const counter = document.getElementById("studio-desc-count");
    counter.textContent = count.toLocaleString("en-US") + " / 2,000 characters";
    counter.classList.toggle("is-full", count >= 2000);
    const dirty = field.value !== published;
    const status = document.getElementById("studio-desc-status");
    status.textContent = dirty ? "Unsaved Changes" : "Published";
    status.classList.toggle("is-dirty", dirty);
  }

  function cardActions(item) {
    return '<button type="button" data-up="' + item.id + '"' + (item.displayOrder === 1 ? " disabled" : "") + '>Up</button>' +
      '<button type="button" data-down="' + item.id + '"' + (item.displayOrder === photos.length ? " disabled" : "") + '>Down</button>' +
      '<button type="button" data-cover="' + item.id + '"' + (item.isCover ? " disabled" : "") + '>' + (item.isCover ? "Primary cover" : "Set as Cover") + '</button>' +
      '<button type="button" data-edit="' + item.id + '">Edit</button>' +
      '<button type="button" class="is-delete" data-delete="' + item.id + '">Delete</button>';
  }

  function renderGrid() {
    const rows = visible();
    const grid = document.getElementById("studio-grid");
    if (!rows.length) {
      grid.innerHTML = '<div class="empty-state is-compact"><h2>No photos</h2><p>No captions match this search.</p></div>';
      return;
    }
    grid.innerHTML = rows.map(function (item) {
      return '<article class="studio-card" draggable="true" data-id="' + item.id + '">' +
        '<div class="studio-frame"><img draggable="false" src="' + item.url + '" alt="' + item.caption.replace(/"/g, "&quot;") + '" />' +
        '<span class="studio-order">#' + item.displayOrder + '</span>' +
        (item.isCover ? '<span class="studio-cover">Primary cover</span>' : "") +
        '<span class="studio-grip" aria-hidden="true">::: </span></div>' +
        '<p>' + item.caption + '</p>' +
        '<p class="studio-meta">' + item.format.toUpperCase() + " · " + formatSize(item.size) + '</p>' +
        '<div class="studio-actions">' + cardActions(item) + '</div></article>';
    }).join("");
  }

  function renderTable() {
    document.getElementById("studio-table").innerHTML = visible().map(function (item) {
      return '<tr draggable="true" data-id="' + item.id + '">' +
        '<td>#' + item.displayOrder + '</td>' +
        '<td><img class="studio-thumb" src="' + item.url + '" alt="" /></td>' +
        '<td>' + item.caption + '</td>' +
        '<td>' + (item.isCover ? "Primary cover" : "—") + '</td>' +
        '<td>' + item.format.toUpperCase() + " · " + formatSize(item.size) + '</td>' +
        '<td><div class="studio-actions">' + cardActions(item) + '</div></td></tr>';
    }).join("");
  }

  function render() {
    renderCapacity();
    renderGrid();
    renderTable();
    document.getElementById("studio-grid").hidden = view !== "grid";
    document.getElementById("studio-table-view").hidden = view !== "table";
  }

  function move(id, direction) {
    const list = sorted();
    const index = list.findIndex(function (item) { return item.id === id; });
    const next = index + direction;
    if (index < 0 || next < 0 || next >= list.length) return;
    const order = list[index].displayOrder;
    list[index].displayOrder = list[next].displayOrder;
    list[next].displayOrder = order;
    render();
    notify("ok", "Shop Profile Updated");
  }

  function openModal(id) {
    document.querySelectorAll(".studio-modal").forEach(function (modal) { modal.hidden = modal.id !== id; });
  }

  function closeModals() {
    document.querySelectorAll(".studio-modal").forEach(function (modal) { modal.hidden = true; });
  }

  function showPhotoError(message) {
    const node = document.getElementById("studio-photo-error");
    node.hidden = !message;
    node.textContent = message || "";
    if (message) notify("error", message);
  }

  function openPhotoModal(item) {
    editingId = item ? item.id : null;
    pendingImage = item ? { url: item.url, name: "current." + item.format, type: "image/" + (item.format === "jpg" ? "jpeg" : item.format), size: item.size } : null;
    document.getElementById("studio-photo-title").textContent = item ? "Edit Photo" : "Upload Photo";
    document.getElementById("studio-caption").value = item ? item.caption : "";
    document.getElementById("studio-cover-flag").checked = item ? item.isCover : false;
    document.getElementById("studio-file").value = "";
    const preview = document.getElementById("studio-file-preview");
    preview.hidden = !item;
    preview.src = item ? item.url : "";
    showPhotoError("");
    document.getElementById("studio-photo-error").hidden = true;
    openModal("studio-photo-modal");
  }

  function applyPending(fileLike, url) {
    pendingImage = {
      url: url || fileLike.url,
      name: fileLike.name,
      type: fileLike.type || "image/jpeg",
      size: fileLike.size || 240000,
    };
    const preview = document.getElementById("studio-file-preview");
    preview.hidden = false;
    preview.src = pendingImage.url;
    document.getElementById("studio-photo-error").hidden = true;
  }

  async function savePhoto() {
    const caption = document.getElementById("studio-caption").value;
    const makeCover = document.getElementById("studio-cover-flag").checked;
    let result;
    if (editingId) result = updateShopPhoto(SHOP_ID, editingId, pendingImage, caption);
    else result = uploadShopPhoto(SHOP_ID, pendingImage, caption);
    if (result && typeof result.then === "function") result = await result;
    if (!result.ok) {
      showPhotoError(result.error);
      return;
    }
    if (pendingImage && pendingImage.file instanceof File && !result.photo.url) {
      result.photo.url = await readFile(pendingImage.file);
    }
    if (makeCover) setPhotoDisplay(SHOP_ID, result.photo.id, true);
    closeModals();
    render();
    notify("ok", "Shop Profile Updated");
  }

  function readFile(file) {
    return new Promise(function (resolve) {
      const reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.readAsDataURL(file);
    });
  }

  document.getElementById("studio-presets").innerHTML = PRESETS.map(function (item, index) {
    return '<button type="button" data-preset="' + index + '">' + item.caption + '</button>';
  }).join("");

  document.getElementById("studio-search").addEventListener("input", function (event) {
    query = event.target.value;
    render();
  });

  document.getElementById("studio-views").addEventListener("click", function (event) {
    const button = event.target.closest("[data-view]");
    if (!button) return;
    window.runWithLoading(button, function () {
      view = button.dataset.view;
      document.querySelectorAll("#studio-views button").forEach(function (item) {
        item.setAttribute("aria-pressed", String(item === button));
      });
      render();
    });
  });

  document.getElementById("studio-upload").addEventListener("click", function (event) {
    window.runWithLoading(event.currentTarget, function () { openPhotoModal(null); });
  });
  document.getElementById("studio-save-photo").addEventListener("click", function (event) {
    window.runWithLoading(event.currentTarget, savePhoto);
  });

  document.getElementById("studio-file").addEventListener("change", async function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const check = validateFile(file);
    if (!check.ok) {
      showPhotoError(check.error);
      return;
    }
    applyPending({ name: file.name, type: file.type, size: file.size, file: file }, await readFile(file));
    pendingImage.file = file;
  });

  document.getElementById("studio-drop").addEventListener("dragover", function (event) { event.preventDefault(); });
  document.getElementById("studio-drop").addEventListener("drop", async function (event) {
    event.preventDefault();
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) return;
    const check = validateFile(file);
    if (!check.ok) {
      showPhotoError(check.error);
      return;
    }
    applyPending({ name: file.name, type: file.type, size: file.size, file: file }, await readFile(file));
    pendingImage.file = file;
  });

  document.getElementById("studio-presets").addEventListener("click", function (event) {
    const button = event.target.closest("[data-preset]");
    if (!button) return;
    const preset = PRESETS[Number(button.dataset.preset)];
    applyPending({ name: preset.name, type: "image/jpeg", size: 860000, url: preset.url }, preset.url);
    if (!document.getElementById("studio-caption").value) document.getElementById("studio-caption").value = preset.caption;
  });

  document.getElementById("studio-app").addEventListener("click", function (event) {
    const up = event.target.closest("[data-up]");
    const down = event.target.closest("[data-down]");
    const cover = event.target.closest("[data-cover]");
    const edit = event.target.closest("[data-edit]");
    const remove = event.target.closest("[data-delete]");
    const button = up || down || cover || edit || remove;
    if (!button) return;
    window.runWithLoading(button, function () {
      if (up) move(up.dataset.up, -1);
      if (down) move(down.dataset.down, 1);
      if (cover) {
        setPhotoDisplay(SHOP_ID, cover.dataset.cover, true);
        render();
        notify("ok", "Shop Profile Updated");
      }
      if (edit) openPhotoModal(photos.find(function (item) { return item.id === edit.dataset.edit; }));
      if (remove) {
        deleteId = remove.dataset.delete;
        const item = photos.find(function (entry) { return entry.id === deleteId; });
        document.getElementById("studio-delete-thumb").src = item ? item.url : "";
        openModal("studio-delete-modal");
      }
    });
  });

  document.getElementById("studio-app").addEventListener("dragstart", function (event) {
    const card = event.target.closest("[data-id]");
    if (!card) return;
    dragId = card.dataset.id;
  });
  document.getElementById("studio-app").addEventListener("dragover", function (event) {
    if (event.target.closest("[data-id]")) event.preventDefault();
  });
  document.getElementById("studio-app").addEventListener("drop", function (event) {
    const card = event.target.closest("[data-id]");
    if (!card || !dragId || card.dataset.id === dragId) return;
    event.preventDefault();
    const target = photos.find(function (item) { return item.id === card.dataset.id; });
    if (target) setPhotoDisplay(SHOP_ID, dragId, false, target.displayOrder);
    dragId = null;
    render();
    notify("ok", "Shop Profile Updated");
  });

  const desc = document.getElementById("studio-description");
  desc.value = description;
  desc.addEventListener("input", function () {
    document.getElementById("studio-desc-error").hidden = true;
    renderDescription();
  });
  document.getElementById("studio-desc-reset").addEventListener("click", function (event) {
    window.runWithLoading(event.currentTarget, function () {
      desc.value = published;
      document.getElementById("studio-desc-error").hidden = true;
      renderDescription();
    });
  });
  function commitDescription() {
    const result = saveShopDescription(SHOP_ID, desc.value);
    const error = document.getElementById("studio-desc-error");
    error.hidden = result.ok;
    error.textContent = result.error || "";
    if (!result.ok) return false;
    desc.value = result.description;
    renderDescription();
    notify("ok", "Shop Profile Updated");
    return true;
  }
  document.getElementById("studio-desc-save").addEventListener("click", function (event) {
    window.runWithLoading(event.currentTarget, commitDescription);
  });

  function openPreview() {
    const profile = previewShopProfile(SHOP_ID);
    document.getElementById("studio-hero").src = profile.cover ? profile.cover.url : "";
    document.getElementById("studio-preview-copy").textContent = profile.description;
    document.getElementById("studio-lookbook").innerHTML = profile.photos.map(function (item) {
      return '<figure><img src="' + item.url + '" alt="" /><figcaption>' + item.caption + '</figcaption></figure>';
    }).join("");
    openModal("studio-preview-modal");
  }

  document.getElementById("studio-preview").addEventListener("click", function (event) {
    window.runWithLoading(event.currentTarget, openPreview);
  });
  document.getElementById("studio-publish").addEventListener("click", function (event) {
    window.runWithLoading(event.currentTarget, function () {
      if (commitDescription()) closeModals();
    });
  });
  document.getElementById("studio-confirm-delete").addEventListener("click", function (event) {
    window.runWithLoading(event.currentTarget, function () {
      const result = deleteShopPhoto(SHOP_ID, deleteId);
      if (!result.ok) return;
      deleteId = null;
      closeModals();
      render();
      notify("ok", "Shop Profile Updated");
    });
  });
  document.querySelectorAll("[data-close-studio]").forEach(function (button) {
    button.addEventListener("click", closeModals);
  });
  document.querySelectorAll(".studio-modal").forEach(function (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModals();
    });
  });

  window.ShopStudioAPI = {
    getShopPhotos: getShopPhotos,
    uploadShopPhoto: uploadShopPhoto,
    updateShopPhoto: updateShopPhoto,
    deleteShopPhoto: deleteShopPhoto,
    setPhotoDisplay: setPhotoDisplay,
    saveShopDescription: saveShopDescription,
    previewShopProfile: previewShopProfile,
  };
  window.getShopPhotos = getShopPhotos;
  window.uploadShopPhoto = uploadShopPhoto;
  window.updateShopPhoto = updateShopPhoto;
  window.deleteShopPhoto = deleteShopPhoto;
  window.setPhotoDisplay = setPhotoDisplay;
  window.saveShopDescription = saveShopDescription;
  window.previewShopProfile = previewShopProfile;

  renderDescription();
  render();
})();
