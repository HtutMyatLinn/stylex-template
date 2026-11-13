(function () {
  if (document.body.dataset.page !== "products") return;

  const TABS = ["All", "Published", "Draft", "Scheduled", "Low Stock", "Pre-order", "Coming Soon"];
  const SIZES = ["S", "M", "L", "XL"];
  const POLICIES = {
    standard: "Returns accepted within 7 days if the piece is unworn and tagged.",
    exchange: "Size or color exchanges within 14 days. No refunds.",
    final: "Final sale. This piece cannot be returned or exchanged.",
  };

  let editor = null;
  let threshold = 10;
  const products = createProducts();
  let productPage = 1;
  let variantPage = 1;
  let tab = "All";
  let query = "";

  const listView = document.getElementById("inventory-view");
  const editView = document.getElementById("editor-view");
  const tabs = document.getElementById("status-tabs");
  const table = document.getElementById("product-table");
  const search = document.getElementById("product-search");
  const thresholdInput = document.getElementById("low-stock-threshold");

  tabs.innerHTML = TABS.map((name) => {
    return '<button type="button" data-tab="' + escapeHtml(name) + '" aria-pressed="' + (name === "All" ? "true" : "false") + '">' + escapeHtml(name) + "</button>";
  }).join("");

  document.getElementById("products-app").addEventListener("click", onClick);
  table.addEventListener("change", onTableChange);
  search.addEventListener("input", () => {
    query = search.value;
    productPage = 1;
    window.runWithSkeleton(table, renderTable, { columns: 8, rows: 6, delay: 280 });
  });
  thresholdInput.addEventListener("input", () => {
    const value = Number(thresholdInput.value);
    if (!Number.isFinite(value) || value < 0) return;
    threshold = value;
    productPage = 1;
    triggerLowStockAlert();
    window.runWithSkeleton(table, renderTable, { columns: 8, rows: 6, delay: 280 });
  });
  document.getElementById("product-pager").addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const paged = window.pageRows(products.filter(matches), productPage);
    productPage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    window.runWithSkeleton(table, renderTable, { columns: 8, rows: 6 });
  });
  document.getElementById("variant-pager").addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled || !editor) return;
    readVariants();
    const paged = window.pageRows(editor.variants, variantPage);
    variantPage = window.turnPage(paged.page, paged.pages, button.dataset.page);
    renderVariants();
  });
  document.getElementById("tag-input").addEventListener("keydown", onTagKey);
  ["color", "size", "material"].forEach((key) => {
    document.getElementById("opt-" + key).addEventListener("keydown", (event) => onOptionKey(event, key));
  });
  document.getElementById("size-toggle").addEventListener("change", (event) => {
    if (editor) editor.sizeChart = event.target.checked;
    togglePanel("size-chart", event.target.checked);
  });
  document.getElementById("media-input").addEventListener("change", (event) => addMedia(event.target.files));
  document.getElementById("media-drop").addEventListener("dragover", (event) => event.preventDefault());
  document.getElementById("media-drop").addEventListener("drop", (event) => {
    event.preventDefault();
    addMedia(event.dataTransfer.files);
  });
  document.getElementById("price-original").addEventListener("input", updatePrice);
  document.getElementById("discount-value").addEventListener("input", updatePrice);
  document.getElementById("selling-types").addEventListener("change", (event) => {
    if (event.target.name === "selling-type") setSellingType(event.target.value);
  });
  ["preorder-start", "preorder-end", "preorder-ship", "preorder-max"].forEach((id) => {
    document.getElementById(id).addEventListener("change", () => {
      readPreorder();
      validatePreOrderDates();
      enforceMaxOrders();
    });
  });
  document.getElementById("notify-me").addEventListener("change", (event) => enableNotifyMe(event.target.checked));
  document.getElementById("visibility-types").addEventListener("change", (event) => {
    if (event.target.name === "visibility") updateVisibilityStatus(event.target.value);
  });
  document.getElementById("schedule-at").addEventListener("change", (event) => schedulePublishDate(event.target.value));
  document.getElementById("refund-policy").addEventListener("change", (event) => assignRefundPolicy(event.target.value));
  document.getElementById("product-description").addEventListener("input", updateCount);
  document.getElementById("master-sku").addEventListener("input", () => {
    if (editor) editor.sku = sanitize(document.getElementById("master-sku").value);
    markSkuErrors();
  });
  document.getElementById("variant-wrap").addEventListener("input", (event) => {
    if (event.target.classList.contains("variant-sku")) markSkuErrors();
  });

  renderTable();
  icons();

  function onClick(event) {
    const tabButton = event.target.closest("[data-tab]");
    const edit = event.target.closest("[data-edit]");
    const boost = event.target.closest("[data-boost]");
    const discount = event.target.closest("[data-discount]");
    const removeTag = event.target.closest("[data-remove-tag]");
    const removeMedia = event.target.closest("[data-remove-media]");
    const cover = event.target.closest("[data-cover]");
    if (tabButton) {
      tab = tabButton.dataset.tab;
      productPage = 1;
      window.runWithSkeleton(table, renderTable, { columns: 8, rows: 6 });
    }
    const create = event.target.closest("#create-product");
    if (create) window.runWithLoading(create, () => openEditor(blankProduct()));
    if (boost) {
      const product = products.find((item) => item.id === boost.dataset.boost);
      if (product && typeof window.openBoost === "function") {
        window.runWithLoading(boost, () => {
          const coverMedia = (product.media || []).find((file) => file.cover) || (product.media || [])[0];
          const firstColor = (product.options && product.options.color && product.options.color[0]) || null;
          const colorHex =
            firstColor && typeof firstColor === "object" && firstColor.hex
              ? firstColor.hex
              : "#2c3e50";
          window.openBoost({
            id: product.id,
            name: product.name,
            type: "product",
            image: coverMedia?.src || "",
            color: colorHex,
          });
        });
      }
    }
    if (edit) window.runWithLoading(edit, () => openEditor(products.find((item) => item.id === edit.dataset.edit)));
    if (event.target.closest("#editor-back")) showView("list");
    const publish = event.target.closest("#publish-product");
    if (publish) window.runWithLoading(publish, () => saveProduct());
    const addVariant = event.target.closest("#add-variant");
    if (addVariant) window.runWithLoading(addVariant, () => addVariantFromInputs());
    const removeVariant = event.target.closest("[data-remove-variant]");
    if (removeVariant && editor) {
      editor.variants.splice(Number(removeVariant.dataset.removeVariant), 1);
      renderVariants();
    }
    if (discount) {
      editor.discountType = discount.dataset.discount;
      document.querySelectorAll("[data-discount]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.discount === editor.discountType));
      });
      updatePrice();
    }
    if (removeTag && editor) {
      editor.tags.splice(Number(removeTag.dataset.removeTag), 1);
      assignTags(editor.tags);
    }
    if (removeMedia && editor) {
      window.runWithLoading(removeMedia, () => {
        editor.media.splice(Number(removeMedia.dataset.removeMedia), 1);
        if (editor.media[0]) editor.media[0].cover = true;
        renderMedia();
      });
    }
    if (cover && editor) {
      editor.media.forEach((file, index) => {
        file.cover = String(index) === cover.dataset.cover;
      });
      renderMedia();
    }
  }

  function onTableChange(event) {
    const date = event.target.closest("[data-restock]");
    const visibility = event.target.closest("[data-visibility]");
    if (date) {
      const product = products.find((item) => item.id === date.dataset.restock);
      if (product) product.restockDate = date.value;
    }
    if (visibility) updateVisibilityStatus(visibility.value, visibility.dataset.visibility);
  }

  function onTagKey(event) {
    if (event.key !== "Enter" && event.key !== ",") return;
    event.preventDefault();
    const value = sanitize(event.target.value).replace(/,$/, "");
    if (!value || !editor) return;
    editor.tags.push(value);
    event.target.value = "";
    assignTags(editor.tags);
  }

  function onOptionKey(event, key) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addVariantFromInputs();
  }

  function addVariantFromInputs() {
    if (!editor) return;
    const colorName = sanitize(document.getElementById("opt-color").value);
    const size = sanitize(document.getElementById("opt-size").value);
    const material = sanitize(document.getElementById("opt-material").value);
    const hex = document.getElementById("opt-color-picker").value || "#1a1a1a";
    if (!colorName && !size && !material) {
      toast("Add a color name, size, or material first.");
      return;
    }
    const color = colorName ? { name: colorName, hex: hex } : "";
    if (colorName) editor.options.color.push({ name: colorName, hex: hex });
    if (size) editor.options.size.push(size);
    if (material) editor.options.material.push(material);
    editor.variants.push({
      color: color,
      size: size,
      material: material,
      sku: variantSku(color, size, material),
      price: "",
      stock: "",
      barcode: "",
    });
    document.getElementById("opt-color").value = "";
    document.getElementById("opt-size").value = "";
    document.getElementById("opt-material").value = "";
    variantPage = Math.max(1, Math.ceil(editor.variants.length / 10));
    renderVariants();
    toast("Variant added.");
  }

  function showView(name) {
    [listView, editView].forEach((view) => {
      const active = view.dataset.view === name;
      if (active) {
        view.hidden = false;
        window.requestAnimationFrame(() => view.classList.add("is-shown"));
      } else {
        view.classList.remove("is-shown");
        window.setTimeout(() => {
          if (!view.classList.contains("is-shown")) view.hidden = true;
        }, 250);
      }
    });
    window.scrollTo(0, 0);
  }

  function openEditor(product) {
    editor = JSON.parse(JSON.stringify(product));
    variantPage = 1;
    fillForm();
    showView("edit");
    document.getElementById("product-name").focus();
  }

  function fillForm() {
    document.getElementById("editor-kicker").textContent = editor.isNew ? "New product" : "Editing " + editor.name;
    document.getElementById("product-name").value = editor.name;
    document.getElementById("product-category").value = editor.category;
    document.getElementById("product-description").value = editor.description;
    updateCount();
    assignTags(editor.tags);
    document.getElementById("size-toggle").checked = editor.sizeChart;
    togglePanel("size-chart", editor.sizeChart);
    SIZES.forEach((size) => {
      const measure = editor.measurements[size] || {};
      document.getElementById("m-" + size + "-chest").value = measure.chest || "";
      document.getElementById("m-" + size + "-waist").value = measure.waist || "";
      document.getElementById("m-" + size + "-length").value = measure.length || "";
    });
    renderMedia();
    renderVariants();
    document.getElementById("price-original").value = editor.originalPrice;
    document.getElementById("discount-value").value = editor.discountValue;
    document.querySelectorAll("[data-discount]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.discount === editor.discountType));
    });
    updatePrice();
    setSellingType(editor.sellingType);
    document.getElementById("preorder-start").value = editor.preorderStart;
    document.getElementById("preorder-end").value = editor.preorderEnd;
    document.getElementById("preorder-ship").value = editor.preorderShip;
    document.getElementById("preorder-max").value = editor.maxOrders;
    document.getElementById("preorder-deposit").value = editor.deposit;
    document.getElementById("notify-me").checked = editor.notifyMe;
    document.getElementById("master-sku").value = editor.sku;
    document.getElementById("master-barcode").value = editor.barcode;
    document.getElementById("stock-qty").value = editor.stock;
    document.getElementById("restock-date").value = editor.restockDate;
    document.getElementById("product-threshold").value = editor.lowStockThreshold;
    updateVisibilityStatus(editor.visibility);
    document.getElementById("schedule-at").value = editor.scheduleAt;
    assignRefundPolicy(editor.policy);
    clearFieldErrors();
  }

  function readForm() {
    editor.name = sanitize(document.getElementById("product-name").value);
    editor.category = document.getElementById("product-category").value;
    editor.description = sanitize(document.getElementById("product-description").value);
    editor.sizeChart = document.getElementById("size-toggle").checked;
    editor.measurements = {};
    SIZES.forEach((size) => {
      editor.measurements[size] = {
        chest: sanitize(document.getElementById("m-" + size + "-chest").value),
        waist: sanitize(document.getElementById("m-" + size + "-waist").value),
        length: sanitize(document.getElementById("m-" + size + "-length").value),
      };
    });
    editor.originalPrice = numberValue("price-original");
    editor.discountValue = numberValue("discount-value");
    editor.sellingPrice = calculateSellingPrice(editor.originalPrice, editor.discountType, editor.discountValue);
    readPreorder();
    editor.notifyMe = document.getElementById("notify-me").checked;
    editor.sku = sanitize(document.getElementById("master-sku").value);
    editor.barcode = sanitize(document.getElementById("master-barcode").value);
    editor.stock = numberValue("stock-qty");
    editor.restockDate = document.getElementById("restock-date").value;
    editor.lowStockThreshold = numberValue("product-threshold");
    editor.scheduleAt = document.getElementById("schedule-at").value;
    const visibility = document.querySelector('input[name="visibility"]:checked');
    editor.visibility = visibility ? visibility.value : editor.visibility;
    const selling = document.querySelector('input[name="selling-type"]:checked');
    editor.sellingType = selling ? selling.value : editor.sellingType;
    editor.policy = document.getElementById("refund-policy").value;
    readVariants();
  }

  function readPreorder() {
    editor.preorderStart = document.getElementById("preorder-start").value;
    editor.preorderEnd = document.getElementById("preorder-end").value;
    editor.preorderShip = document.getElementById("preorder-ship").value;
    editor.maxOrders = numberValue("preorder-max");
    editor.deposit = numberValue("preorder-deposit");
  }

  function readVariants() {
    document.querySelectorAll("[data-variant-row]").forEach((row) => {
      const current = editor.variants[Number(row.dataset.index)];
      if (!current) return;
      current.sku = sanitize(row.querySelector(".variant-sku").value);
      current.price = row.querySelector(".variant-price").value;
      current.stock = row.querySelector(".variant-stock").value;
      current.barcode = sanitize(row.querySelector(".variant-barcode").value);
    });
  }

  function saveProduct() {
    readForm();
    if (editor.visibility === "scheduled") {
      schedulePublishDate(editor.scheduleAt);
      if (!editor.scheduleAt) {
        toast("Choose a publish date.");
        return false;
      }
    } else if (editor.visibility !== "hidden") {
      editor.visibility = "published";
    }
    const errors = collectErrors();
    if (errors.length) {
      toast(errors[0]);
      return false;
    }
    editor.isNew = false;
    const index = products.findIndex((item) => item.id === editor.id);
    const copy = JSON.parse(JSON.stringify(editor));
    if (index >= 0) products[index] = copy;
    else products.unshift(copy);
    triggerLowStockAlert();
    toast(editor.visibility === "hidden" ? "Product hidden" : editor.visibility === "scheduled" ? "Product scheduled" : "Product published");
    showView("list");
    renderTable();
    return true;
  }

  function collectErrors() {
    clearFieldErrors();
    const errors = [];
    if (!validateRequiredFields(editor.name, editor.category)) {
      if (!editor.name) markField("product-name");
      if (!editor.category) markField("product-category");
      errors.push("Name and category are required.");
    }
    if (!editor.sku) {
      document.getElementById("master-sku").classList.add("is-invalid");
      errors.push("A master SKU is required.");
    }
    if (editor.sellingType === "preorder") {
      if (!validatePreOrderDates()) errors.push("Check the pre-order dates.");
      if (!enforceMaxOrders()) errors.push("Set a maximum number of pre-orders.");
    }
    if (duplicateSkus().size) errors.push("Each SKU must be unique.");
    markSkuErrors();
    return errors;
  }

  function renderTable() {
    document.querySelectorAll("[data-tab]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.tab === tab));
    });
    const visible = products.filter(matches).sort((a, b) => a.name.localeCompare(b.name));
    const paged = window.pageRows(visible, productPage);
    productPage = paged.page;
    const filtered = Boolean(query.trim()) || tab !== "All";
    if (!visible.length) {
      table.innerHTML =
        '<tr class="empty-row"><td colspan="8">' +
        window.emptyState(
          filtered ? "ri-search-line" : "ri-shirt-line",
          filtered ? "No matching products" : "No products yet",
          filtered ? "Try another name, SKU, or status." : "Create a product to start the catalog."
        ) +
        "</td></tr>";
    } else {
    table.innerHTML = paged.rows.map((product) => {
      const low = product.stock <= threshold;
      const variants = product.variants.length;
      const price = calculateSellingPrice(product.originalPrice, product.discountType, product.discountValue);
      return (
        '<tr data-product-id="' + escapeHtml(product.id) + '"' + (low ? ' class="is-low"' : "") + ">" +
          '<td><div class="product-cell"><span class="mini-thumb" aria-hidden="true"><i data-lucide="shirt"></i></span><span><strong data-field="name">' + escapeHtml(product.name) + "</strong><span>" + escapeHtml(product.category || "Uncategorized") + "</span></span></div></td>" +
          '<td><div class="sku-cell"><span><strong class="sku-code" data-field="sku">' + escapeHtml(product.sku || "—") + '</strong><span class="variant-count">' + variants + (variants === 1 ? " variant" : " variants") + "</span></span></div></td>" +
          "<td>" + pill(sellingLabel(product.sellingType)) + "</td>" +
          "<td><strong>" + money(price) + "</strong>" + (price < product.originalPrice ? '<span class="was">' + money(product.originalPrice) + "</span>" : "") + "</td>" +
          '<td><span class="stock-num" data-field="stock">' + product.stock + "</span>" + (low ? ' <span class="low-badge">Low stock</span>' : "") + "</td>" +
          '<td><input class="inline-date" type="date" data-restock="' + escapeHtml(product.id) + '" value="' + escapeHtml(product.restockDate) + '" aria-label="Restock date for ' + escapeHtml(product.name) + '"></td>' +
          '<td><select class="vis-select" data-visibility="' + escapeHtml(product.id) + '" aria-label="Visibility for ' + escapeHtml(product.name) + '">' + visibilityOptions(product.visibility) + "</select></td>" +
          '<td><div class="row-actions">' +
            '<button type="button" class="btn is-ghost" data-boost="' + escapeHtml(product.id) + '">Boost</button>' +
            '<button type="button" class="btn is-ghost" data-edit="' + escapeHtml(product.id) + '">Edit</button>' +
          "</div></td>" +
        "</tr>"
      );
    }).join("");
    }
    const countLabel = visible.length + (visible.length === 1 ? " product" : " products");
    window.renderPager(document.getElementById("product-pager"), productPage, paged.pages, countLabel);
    icons();
  }

  function matches(product) {
    const needle = query.trim().toLowerCase();
    const skus = [product.sku].concat(product.variants.map((item) => item.sku)).join(" ").toLowerCase();
    const textOk = !needle || product.name.toLowerCase().includes(needle) || skus.includes(needle);
    const low = product.stock <= threshold;
    const tabOk =
      tab === "All" ||
      (tab === "Published" && product.visibility === "published") ||
      (tab === "Draft" && product.visibility === "draft") ||
      (tab === "Scheduled" && product.visibility === "scheduled") ||
      (tab === "Low Stock" && low) ||
      (tab === "Pre-order" && product.sellingType === "preorder") ||
      (tab === "Coming Soon" && product.sellingType === "coming");
    return textOk && tabOk;
  }

  function renderTags() {
    const box = document.getElementById("tag-chips");
    box.replaceChildren();
    editor.tags.forEach((tag, index) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      const label = document.createElement("span");
      label.textContent = tag;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "icon-x";
      button.dataset.removeTag = String(index);
      button.setAttribute("aria-label", "Remove " + tag);
      button.textContent = "×";
      chip.append(label, button);
      box.appendChild(chip);
    });
  }

  function renderMedia() {
    const grid = document.getElementById("media-grid");
    grid.replaceChildren();
    editor.media.forEach((file, index) => {
      const card = document.createElement("article");
      card.className = "media-card";
      if (file.src) {
        const image = document.createElement("img");
        image.src = file.src;
        image.alt = "";
        card.appendChild(image);
      } else {
        const fallback = document.createElement("div");
        fallback.className = "media-fallback";
        fallback.textContent = file.kind === "video" ? "MP4" : "IMG";
        card.appendChild(fallback);
      }
      const name = document.createElement("span");
      name.className = "file-name";
      name.textContent = file.name;
      const size = document.createElement("span");
      size.className = "file-size";
      size.textContent = fileSize(file.size);
      card.append(name, size);
      if (file.cover) {
        const badge = document.createElement("span");
        badge.className = "cover-badge";
        badge.textContent = "Cover";
        card.appendChild(badge);
      } else {
        const make = document.createElement("button");
        make.type = "button";
        make.className = "btn is-ghost";
        make.dataset.cover = String(index);
        make.textContent = "Make cover";
        card.appendChild(make);
      }
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "icon-x";
      remove.dataset.removeMedia = String(index);
      remove.textContent = "Remove";
      card.appendChild(remove);
      grid.appendChild(card);
    });
  }

  function renderVariants() {
    const wrap = document.getElementById("variant-wrap");
    const pager = document.getElementById("variant-pager");
    if (!editor.variants.length) {
      wrap.innerHTML = window.emptyState("ri-layout-grid-line", "No variants yet", "Variants already saved for this product will show here.", true);
      pager.hidden = true;
      pager.innerHTML = "";
      return;
    }
    const indexed = editor.variants.map((variant, index) => ({ variant, index }));
    const paged = window.pageRows(indexed, variantPage);
    variantPage = paged.page;
    wrap.innerHTML =
      '<ul class="variant-list">' +
      paged.rows.map(({ variant, index }) => {
        const hex = variant.color && typeof variant.color === "object" ? variant.color.hex : "";
        return (
          '<li class="variant-list-item" data-variant-row data-index="' + index + '">' +
            '<div class="variant-list-head">' +
              (hex ? '<span class="variant-list-swatch" style="background:' + escapeHtml(hex) + '" aria-hidden="true"></span>' : "") +
              "<strong>" + escapeHtml(variantLabel(variant)) + "</strong>" +
              '<button class="btn is-ghost" type="button" data-remove-variant="' + index + '">Remove</button>' +
            "</div>" +
            '<div class="variant-list-fields">' +
              '<label><span>SKU</span><input class="variant-sku" value="' + escapeHtml(variant.sku) + '" aria-label="SKU"></label>' +
              '<label><span>Price</span><input class="variant-price" type="number" min="0" step="1" value="' + escapeHtml(variant.price) + '" aria-label="Price"></label>' +
              '<label><span>Stock</span><input class="variant-stock" type="number" min="0" step="1" value="' + escapeHtml(variant.stock) + '" aria-label="Stock"></label>' +
              '<label><span>Barcode</span><input class="variant-barcode" value="' + escapeHtml(variant.barcode) + '" aria-label="Barcode"></label>' +
            "</div>" +
          "</li>"
        );
      }).join("") +
      "</ul>";
    pager.hidden = false;
    window.renderPager(pager, variantPage, paged.pages, editor.variants.length + (editor.variants.length === 1 ? " variant" : " variants"));
    markSkuErrors();
  }

  function addMedia(fileList) {
    Array.from(fileList || []).forEach((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!["jpg", "jpeg", "png", "mp4"].includes(ext)) {
        toast("Only jpg, png, and mp4 files can be uploaded.");
        return;
      }
      const stored = ext === "mp4" ? uploadVideo(file) : uploadImage(file);
      const resized = resizeMedia(stored);
      if (!editor.media.length) resized.cover = true;
      editor.media.push(resized);
      if (resized.src === undefined && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          resized.src = reader.result;
          renderMedia();
        };
        reader.readAsDataURL(file);
      }
    });
    document.getElementById("media-input").value = "";
    renderMedia();
  }

  function updatePrice() {
    const original = numberValue("price-original");
    const discount = numberValue("discount-value");
    const type = editor ? editor.discountType : "percent";
    const selling = calculateSellingPrice(original, type, discount);
    document.getElementById("price-selling").textContent = money(selling);
    const saved = Math.max(0, original - selling);
    document.getElementById("price-savings").textContent = saved ? "Saves " + money(saved) : "No discount applied";
  }

  function updateCount() {
    const value = document.getElementById("product-description").value;
    document.getElementById("desc-count").textContent = value.length + " / 500";
  }

  function setSellingType(type) {
    if (editor) editor.sellingType = type;
    document.querySelectorAll('input[name="selling-type"]').forEach((input) => {
      input.checked = input.value === type;
    });
    togglePanel("preorder-panel", type === "preorder");
    togglePanel("coming-panel", type === "coming");
    if (type === "preorder") validatePreOrderDates();
  }

  function updateVisibilityStatus(status, productId) {
    if (productId) {
      const product = products.find((item) => item.id === productId);
      if (product) product.visibility = status;
      renderTable();
      return;
    }
    if (editor) editor.visibility = status;
    document.querySelectorAll('input[name="visibility"]').forEach((input) => {
      input.checked = input.value === status;
    });
    togglePanel("schedule-panel", status === "scheduled");
  }

  function schedulePublishDate(value) {
    if (editor) editor.scheduleAt = value;
    return value;
  }

  function enableNotifyMe(on) {
    if (editor) editor.notifyMe = on;
    return on;
  }

  function assignTags(tags) {
    if (editor) editor.tags = tags.map(sanitize).filter(Boolean);
    renderTags();
    return editor ? editor.tags : [];
  }

  function assignRefundPolicy(policy) {
    if (editor) editor.policy = policy;
    document.getElementById("refund-policy").value = policy;
    document.getElementById("policy-summary").textContent = POLICIES[policy] || "";
    return policy;
  }

  function validateRequiredFields(name, category) {
    return Boolean(sanitize(name) && category);
  }

  function validatePreOrderDates() {
    const start = document.getElementById("preorder-start").value;
    const end = document.getElementById("preorder-end").value;
    const ship = document.getElementById("preorder-ship").value;
    const error = document.getElementById("preorder-error");
    const ok = start && end && ship && start < end && ship > end;
    error.hidden = ok;
    error.textContent = ok ? "" : "Start must be before end, and shipping must be after the pre-order ends.";
    ["preorder-start", "preorder-end", "preorder-ship"].forEach((id) => {
      document.getElementById(id).closest(".field").classList.toggle("is-invalid", !ok && document.getElementById("preorder-panel").classList.contains("is-open"));
    });
    return ok;
  }

  function enforceMaxOrders() {
    const max = numberValue("preorder-max");
    const field = document.getElementById("preorder-max").closest(".field");
    const ok = max >= 1;
    field.classList.toggle("is-invalid", !ok && document.getElementById("preorder-panel").classList.contains("is-open"));
    return ok;
  }

  function calculateSellingPrice(original, type, discount) {
    const base = Number(original) || 0;
    const off = Number(discount) || 0;
    if (type === "fixed") return Math.max(0, Math.round(base - off));
    return Math.max(0, Math.round(base * (1 - Math.min(off, 100) / 100)));
  }

  function generateVariantCombinations() {
    const colors = editor.options.color.length ? editor.options.color : [""];
    const sizes = editor.options.size.length ? editor.options.size : [""];
    const materials = editor.options.material.length ? editor.options.material : [""];
    if (!editor.options.color.length && !editor.options.size.length && !editor.options.material.length) return [];
    const rows = [];
    colors.forEach((color) => {
      sizes.forEach((size) => {
        materials.forEach((material) => {
          rows.push({
            color,
            size,
            material,
            sku: variantSku(color, size, material),
            price: "",
            stock: "",
            barcode: "",
          });
        });
      });
    });
    return rows;
  }

  function uploadImage(file) {
    return { file, kind: "image", size: file.size, ext: "jpg" };
  }

  function uploadVideo(file) {
    return { file, kind: "video", size: file.size, ext: "mp4" };
  }

  function resizeMedia(stored) {
    const ext = stored.kind === "video" ? "mp4" : stored.file.name.toLowerCase().endsWith(".png") ? "png" : "jpg";
    return {
      name: uid() + "." + ext,
      kind: stored.kind,
      size: Math.max(1, Math.round(stored.size * 0.62)),
      cover: false,
    };
  }

  function deductStock(productId, qty) {
    const product = products.find((item) => item.id === productId);
    if (!product) return false;
    product.stock = Math.max(0, product.stock - qty);
    triggerLowStockAlert(product);
    return true;
  }

  function triggerLowStockAlert(product) {
    const list = product ? [product] : products;
    return list.filter((item) => item.stock <= threshold);
  }

  function optionName(value) {
    if (value && typeof value === "object") return value.name || "";
    return value || "";
  }

  function variantSku(color, size, material) {
    return ["STX", skuPart(editor.category || "item"), skuPart(optionName(color)), skuPart(size), skuPart(material)].filter((part) => part !== "X").join("-");
  }

  function skuPart(value) {
    const clean = sanitize(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
    return clean.slice(0, 3) || "X";
  }

  function duplicateSkus() {
    const seen = new Map();
    const dupes = new Set();
    const consider = (sku, token) => {
      const key = sanitize(sku).toLowerCase();
      if (!key) return;
      if (seen.has(key)) dupes.add(key);
      seen.set(key, token);
    };
    products.forEach((product) => {
      if (editor && product.id === editor.id) return;
      consider(product.sku, product.id);
      product.variants.forEach((variant) => consider(variant.sku, product.id));
    });
    if (editor) {
      consider(document.getElementById("master-sku").value, "master");
      editor.variants.forEach((variant) => consider(variant.sku, variant));
    }
    return dupes;
  }

  function markSkuErrors() {
    if (editor && document.querySelector("[data-variant-row]")) readVariants();
    const dupes = duplicateSkus();
    const master = document.getElementById("master-sku");
    master.classList.toggle("is-invalid", dupes.has(sanitize(master.value).toLowerCase()));
    document.querySelectorAll(".variant-sku").forEach((input) => {
      input.classList.toggle("is-invalid", dupes.has(sanitize(input.value).toLowerCase()));
    });
  }

  function markField(id) {
    document.getElementById(id).closest(".field").classList.add("is-invalid");
  }

  function clearFieldErrors() {
    document.querySelectorAll(".products-workspace .is-invalid").forEach((node) => node.classList.remove("is-invalid"));
    document.getElementById("preorder-error").hidden = true;
  }

  function togglePanel(id, open) {
    document.getElementById(id).classList.toggle("is-open", open);
  }

  function readOptionsFromChips() {
    return editor.options;
  }

  function visibilityOptions(current) {
    return [
      ["published", "Published"],
      ["draft", "Draft"],
      ["scheduled", "Scheduled"],
      ["hidden", "Hide"],
    ].map(([value, label]) => {
      return '<option value="' + value + '"' + (value === current ? " selected" : "") + ">" + label + "</option>";
    }).join("");
  }

  function sellingLabel(type) {
    if (type === "preorder") return "Pre-order";
    if (type === "coming") return "Coming soon";
    return "In stock";
  }

  function pill(label) {
    return '<span class="pill">' + escapeHtml(label) + "</span>";
  }

  function variantLabel(variant) {
    return [optionName(variant.color), variant.size, variant.material].filter(Boolean).join(" / ");
  }

  function numberValue(id) {
    const value = Number(document.getElementById(id).value);
    return Number.isFinite(value) ? value : 0;
  }

  function fileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function money(value) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
  }

  function toast(message) {
    window.showToast(message);
  }

  function uid() {
    if (window.crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return "f47ac10b-58cc-4372-a567-" + Math.random().toString(16).slice(2, 14);
  }

  function icons() {
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  function sanitize(value) {
    const holder = document.createElement("div");
    holder.textContent = value == null ? "" : String(value);
    return holder.textContent.replace(/\s+/g, " ").trim();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;");
  }

  function shiftDate(days, withTime) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setSeconds(0, 0);
    const pad = (value) => String(value).padStart(2, "0");
    const day = date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    if (!withTime) return day;
    return day + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes());
  }

  function blankProduct() {
    return {
      id: "STX-P-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      isNew: true,
      name: "",
      category: "",
      description: "",
      tags: [],
      sizeChart: false,
      measurements: {},
      media: [],
      options: { color: [], size: [], material: [] },
      variants: [],
      originalPrice: 0,
      discountType: "percent",
      discountValue: 0,
      sellingType: "instock",
      preorderStart: "",
      preorderEnd: "",
      preorderShip: "",
      maxOrders: 0,
      deposit: 0,
      notifyMe: false,
      sku: "",
      barcode: "",
      stock: 0,
      restockDate: "",
      lowStockThreshold: threshold,
      visibility: "draft",
      scheduleAt: "",
      policy: "standard",
    };
  }

  function createProducts() {
    return [
      product("STX-DR-1008", "Ivory Silk Column Dress", "Dresses", "published", "instock", 680, "percent", 0, 28, ["Ivory", "Black"], ["S", "M", "L"], ["Silk"]),
      product("STX-OW-2041", "Noir Tailored Wool Blazer", "Outerwear", "published", "instock", 740, "percent", 15, 4, ["Black"], ["38", "40", "42"], ["Wool"]),
      product("STX-OW-3302", "Cashmere Funnel Coat", "Outerwear", "published", "preorder", 1280, "percent", 0, 30, ["Camel"], ["S", "M"], ["Cashmere"]),
      product("STX-FW-1188", "Sculpt Leather Ankle Boot", "Footwear", "published", "coming", 640, "percent", 0, 0, ["Black"], ["41", "42"], ["Leather"]),
      product("STX-DR-1410", "Pleated Satin Midi Skirt", "Dresses", "scheduled", "instock", 480, "fixed", 40, 20, ["Champagne"], ["4", "6", "8"], ["Satin"]),
      product("STX-AC-0904", "Gold-Hardware Mini Bag", "Accessories", "draft", "instock", 390, "percent", 0, 22, ["Gold"], ["One"], ["Leather"]),
    ];
  }

  function product(sku, name, category, visibility, sellingType, price, discountType, discountValue, stock, colors, sizes, materials) {
    const item = blankProduct();
    item.id = sku;
    item.isNew = false;
    item.name = name;
    item.category = category;
    item.description = name + " from the Atelier Noir collection. Cut for a clean line and a quiet finish.";
    item.tags = [category.toLowerCase(), "atelier"];
    item.visibility = visibility;
    item.sellingType = sellingType;
    item.originalPrice = price;
    item.discountType = discountType;
    item.discountValue = discountValue;
    item.stock = stock;
    item.sku = sku;
    item.barcode = "200" + sku.replace(/\D/g, "").padEnd(8, "0").slice(0, 8);
    item.restockDate = shiftDate(stock <= 10 ? 12 : 30, false);
    item.lowStockThreshold = 5;
    item.options = { color: colors, size: sizes, material: materials };
    item.variants = colors.flatMap((color) => sizes.flatMap((size) => materials.map((material) => ({
      color,
      size,
      material,
      sku: ["STX", skuPart(category), skuPart(color), skuPart(size)].join("-"),
      price: "",
      stock: "",
      barcode: "",
    }))));
    item.media = [{ name: uid() + ".jpg", kind: "image", size: 240000, cover: true }];
    if (sellingType === "preorder") {
      item.preorderStart = shiftDate(-1, true);
      item.preorderEnd = shiftDate(10, true);
      item.preorderShip = shiftDate(24, true);
      item.maxOrders = 40;
      item.deposit = 30;
    }
    if (sellingType === "coming") item.notifyMe = true;
    if (visibility === "scheduled") item.scheduleAt = shiftDate(7, true);
    if (category === "Accessories") item.policy = "final";
    return item;
  }
})();
