Act as a Principal UI/UX Designer and Senior Frontend Developer. Build a clean, minimalist, high-craft Shop Owner Dashboard Web UI template for the "Stylex — Fashion Marketplace Products Module" (V1.0).

### 1. Technical & Scope Constraints

- Stack: Pure HTML5 (`index.html`), Vanilla CSS3 (`styles.css`), and Vanilla JavaScript (`script.js`). Use Lucide Icons (`https://unpkg.com/lucide@latest`) for crisp, minimalist 1.5px stroke icons.
- Scope: Shop Owner Dashboard ONLY. Do NOT include login/register screens, customer storefront views, or any "View As / Perspective Switcher" bars.
- API-Ready Architecture: Build a static UI template with realistic mock data and clean `id` / `data-*` attributes. Create modular JS placeholder functions matching the SRS (`validateRequiredFields()`, `assignTags()`, `uploadImage()`, `uploadVideo()`, `resizeMedia()`, `setSellingType()`, `enableNotifyMe()`, `generateVariantCombinations()`, `calculateSellingPrice()`, `deductStock()`, `triggerLowStockAlert()`, `updateVisibilityStatus()`, `schedulePublishDate()`, `validatePreOrderDates()`, `enforceMaxOrders()`, `assignRefundPolicy()`).

### 2. Strict Brand Design System (Colors, Fonts & Smooth Motion)

Load Google Fonts in `<head>`:

- Header & Navigation Font: `'Be Vietnam Pro', sans-serif` (weights: 500, 600, 700). Use for sidebar navigation, page headers, card titles, table headers, badges, and buttons.
- Body Font: `'Roboto Flex', sans-serif` (weights: 400, 500). Use for form inputs, descriptions, table cells, SKUs, and helper text.

Strictly use ONLY these 5 CSS Custom Properties:

- `--color-white: #ffffff;` (Cards, table rows, input fields, elevated surfaces)
- `--color-bg: #f7f6f4;` (Main dashboard background, table header fill, dropzone background)
- `--color-border: #e8e6e4;` (1px solid borders, dividers, inactive pills, input borders)
- `--color-black: #0d0d0d;` (Primary text, active states, primary buttons, focus rings)
- `--color-red: #f40000;` (Low stock badges, validation errors, required asterisks, remove icons)

UI/UX & Smooth Transition Guidelines:

- Minimalist luxury aesthetic: 1px solid `#e8e6e4` borders, subtle `6px` border-radius, generous padding, and zero visual clutter.
- Smooth Transitions: Apply `transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1)` to view switching, collapsible conditional panels (Pre-order, Scheduled Date, Notify Me), tab underlines, modal/drawer overlays, and button hover states.
- Include a sleek, non-intrusive bottom-right Toast notification system (`#0d0d0d` background, `#ffffff` text) for smooth feedback when saving drafts, publishing products, or triggering validation errors.

### 3. Dashboard Layout & View Navigation

- Left Sidebar (Fixed 250px):
  - Brand header: "Stylex" logo with subtle "SELLER CENTER" subtitle.
  - Navigation Menu: Dashboard, Orders, **Products (Active)**, Finance, Reviews, Settings.
- Main Content Workspace with seamless view transitions between two core Shop Owner screens:
  1. **View A: Inventory Dashboard** (Default View)
  2. **View B: Product Creation / Edit Screen** (Triggered by clicking "+ Add New Product" or "Edit" on any inventory row, with a smooth Back button to return to View A).

### 4. View A — Shop Owner: Inventory Dashboard

- **Top Action Header**:
  - Page Title ("Products & Inventory") and total product count badge.
  - Primary Button (`#0d0d0d` fill, `#ffffff` text): `+ Create Product` (smoothly transitions to View B).
- **Filter & Control Bar**:
  - Search input (search by Product Name or SKU).
  - Status Tabs (`All`, `Published`, `Draft`, `Scheduled`, `Low Stock`, `Pre-order`, `Coming Soon`).
  - **Low Stock Threshold Control (PR-BR-06)**: Inline numeric input labeled "Low Stock Alert Threshold:" defaulted to `10` units. Updating this number dynamically re-evaluates and highlights low-stock rows in `#f40000` (`triggerLowStockAlert()`).
- **Minimalist Inventory Table (`PR-06`)**:
  - Columns:
    1. **Product**: Thumbnail preview, Product Name, Category subtitle.
    2. **SKU & Variants**: Primary SKU (`PR-BR-03`) and variant count badge (e.g., "6 Variants").
    3. **Selling Type (`PR-03`)**: Clean pill badge (`In Stock`, `Pre-order`, `Coming Soon`).
    4. **Price (`PR-05`)**: Final Selling Price (with crossed-out Original Price if discounted).
    5. **Stock Count (`PR-06`)**: Numeric stock level + automatic `#f40000` "Low Stock" warning badge when stock <= threshold.
    6. **Restock Date (`PR-06`)**: Inline minimalist date picker (`<input type="date">`) allowing quick restock date updates directly from the dashboard.
    7. **Visibility (`PR-07`)**: Status indicator (`Published`, `Draft`, `Scheduled`, `Hidden`).
    8. **Actions**: "Edit" button (loads product into View B) and quick visibility toggle.

### 5. View B — Shop Owner: Product Creation / Edit Screen

Design a balanced, distraction-free 2-Column Editorial Form Layout (Left Main Column: 8 cols, Right Configuration Sidebar: 4 cols) with a sticky top action bar containing Product Status, `"Save as Draft"` button (`#ffffff` bg, `#0d0d0d` border), and `"Publish Product"` button (`#0d0d0d` bg, `#ffffff` text).

#### Left Column (Core Product Details):

1. **PR-01: Basic Product Information Card**:
   - **Product Name** (Required `*`) and **Category Dropdown** (Required `*` — e.g., Outerwear, Dresses, Footwear, Accessories, Knitwear). Validated by `validateRequiredFields(Name, Category)`.
   - **Description**: Clean multi-line textarea with character counter.
   - **Tags Input (`assignTags()`)**: Interactive tag input where pressing `Enter` or `,` turns text into removable minimalist `#f7f6f4` pill badges.
   - **Size Chart (`PR-01`)**: Toggle switch to attach a standard Size Guide or upload/configure size measurements (S, M, L, XL chest/waist/length table).

2. **PR-02: Media Management Card (Security Rules PR-SEC-01 to PR-SEC-04)**:
   - Minimalist drag-and-drop upload zone (`#f7f6f4` background, dashed `#e8e6e4` border) for Product Images and Videos.
   - **Strict Validation (`PR-SEC-01`)**: Only allow `.jpg`, `.png`, and `.mp4` files (`accept=".jpg,.jpeg,.png,.mp4"`). Show a `#f40000` error toast if an unsupported file extension is selected.
   - **Media Preview Grid**: Show uploaded thumbnails with simulated UUID filename badge (`PR-SEC-03`, e.g., `f47ac10b-58cc.jpg`), compressed size indicator (`PR-SEC-02`), primary cover badge, and remove button.

3. **PR-04: Variant Management & Combination Matrix Card**:
   - Option builders for **Color** (e.g., Onyx Black, Ivory, Crimson), **Size** (e.g., XS, S, M, L), and **Material** (e.g., 100% Silk, Organic Cotton).
   - `"Generate Variant Combinations"` button (`generateVariantCombinations()`) that smoothly populates a clean Variant Matrix Table below.
   - **Variant Matrix Table**: Each generated row (e.g., `Onyx Black / M / Silk`) includes inputs for:
     - **Unique Variant SKU (`PR-BR-03`)**: Auto-generated default SKU (e.g., `STX-DR-BLK-M`) with real-time duplicate SKU check (highlights border in `#f40000` if two rows share the same SKU).
     - **Variant Price Override**
     - **Variant Stock Count**
     - **Barcode (`PR-06`)**

#### Right Column (Pricing, Selling Type, Visibility & Policies):

4. **PR-05 & PR-BR-01: Pricing Setup Card**:
   - Inputs for **Original Price ($)** and **Discount** (toggleable between Percentage `%` or Fixed Amount `$`).
   - **Auto-Calculated Selling Price (`calculateSellingPrice()`, `PR-BR-01`)**: Read-only prominent display box showing the live calculated `Selling Price` in bold `'Be Vietnam Pro'`, alongside the savings breakdown.

5. **PR-03 & PR-08: Selling Type & Pre-Order Configuration Card**:
   - Segmented radio cards for **Selling Type (`setSellingType()`)**:
     - `In Stock` (Standard inventory)
     - `Pre-order` (Smoothly expands the **Pre-order Settings Panel `PR-08`**)
     - `Coming Soon` (Smoothly expands the **Coming Soon Rule Panel `PR-BR-02`**)
   - **Conditional Panel A — Pre-order Settings (`PR-08` & Rule `PR-BR-04`)**:
     - Inputs for **Pre-order Start Date & Time**, **Pre-order End Date & Time**, **Estimated Shipping Date**, **Max Orders Limit** (`enforceMaxOrders()`), and **Deposit Requirement (%)**.
     - **Live Date Validation (`validatePreOrderDates()`, `PR-BR-04`)**: Enforce that `Start Date < End Date` AND `Estimated Shipping Date > End Date`. Display an inline `#f40000` validation message and disable publishing if violated.
   - **Conditional Panel B — Coming Soon State (`PR-BR-02`)**:
     - Displays status lock notice ("Purchasing disabled on storefront") and an active toggle for **"Enable 'Notify Me' Subscriptions"** (`enableNotifyMe()`).

6. **PR-06: Inventory Tracking Card**:
   - Master **SKU** input (with uniqueness validation `PR-BR-03`), **Barcode (ISBN/UPC)** input, **Total Stock Quantity**, **Restock Date** picker, and **Per-Product Low Stock Threshold** input (`PR-BR-06`).
   - Helper note indicating Rule `PR-BR-05` (Stock deducts automatically only upon confirmed order or paid pre-order deposit).

7. **PR-07: Visibility Settings Card**:
   - Dropdown / Radio selector (`updateVisibilityStatus()`): `Published`, `Draft`, `Scheduled`, `Hide`.
   - When `Scheduled` is selected, smoothly reveal the **Scheduled Publish Date & Time** picker (`schedulePublishDate()`).

8. **PR-09: Return & Refund Policy Card**:
   - Dropdown selector (`assignRefundPolicy()`) to attach a policy template (e.g., "Standard 7-Day Return", "Exchange Only", "Non-Returnable / Final Sale") with a clean summary preview of the policy rules.

### 6. Security & UX Polish (`PR-SEC-06`)

- Sanitize all text inputs (Product Name, Description, Tags, SKUs) before rendering into DOM tables or previews to prevent XSS (`PR-SEC-06`).
- Pre-populate the Inventory Dashboard with 6 realistic luxury fashion products covering all states (`Published`, `Low Stock` highlighted in `#f40000`, `Pre-order`, `Coming Soon`, `Scheduled`, and `Draft`) so the table, filters, and Edit flow work out of the box.
