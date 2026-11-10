Act as a Senior Frontend UI/UX Developer. Build a simple, ultra-minimalist, responsive Web UI template for the "Stylex — Fashion Marketplace Order Module" (Module V1.0).

### 1. Technical & Scope Constraints

- Stack: Pure HTML5 (`index.html`), Vanilla CSS3 (`styles.css`), and Vanilla JavaScript (`script.js`). Use Lucide Icons or Remix Icon via CDN for minimal 1.5px stroke icons.
- Scope: Static Web UI template ONLY. Do NOT include login/register flows or live backend API calls.
- API-Ready Structure: Structure all dynamic containers with clean `id` and `data-*` attributes and organize mock state in `script.js` with placeholder functions matching the SRS (`fetchOrderDetails()`, `calculateOrderTotal()`, `updateOrderStatus()`, `cancelOrder()`, `logCancellationReason()`, `addOrderNote()`, `fetchOrderNotes()`, `submitReturnRequest()`, `updateReturnStatus()`, `initiateRefund()`, `processRefundTransaction()`, `generateInvoicePDF()`, `assignTrackingNumber()`).

### 2. Strict Minimalist Brand System (Colors & Typography)

Load Google Fonts in `<head>`:

- Header & Navigation Font: `'Be Vietnam Pro', sans-serif` (weights: 500, 600). Use for page titles, navigation tabs, table headers, status badges, and buttons.
- Body Font: `'Roboto Flex', sans-serif` (weights: 400, 500). Use for table cells, order item lists, addresses, timestamps, notes, and form inputs.

Strictly use ONLY these 5 CSS Custom Properties:

- `--color-white: #ffffff;` (Main cards, table background, modal surfaces)
- `--color-bg: #f7f6f4;` (Page background, subtle section fills, table header background)
- `--color-border: #e8e6e4;` (1px solid hairline borders, dividers, disabled button fills)
- `--color-black: #0d0d0d;` (Primary text, active tabs, primary buttons, active timeline nodes)
- `--color-red: #f40000;` (Cancelled/Return badges, destructive action text/borders, mandatory field validation errors, unread/new order alerts)

Minimalist Design Rules:

- Zero heavy drop shadows, zero gradients, and zero extra colors outside the 5 hex codes above.
- Rely on generous whitespace, crisp `1px solid #e8e6e4` borders, sharp or subtly rounded (`4px`) corners, and high-contrast `#0d0d0d` typography on `#ffffff` and `#f7f6f4` surfaces.

### 3. Top Role & Screen Switcher Bar (For UI Template Preview)

Include a clean, minimal top bar featuring the "Stylex" logo and a segmented perspective toggle so we can test all 5 SRS screens in one workspace:

- **Admin / Seller View**:
  1. Screen 1: Order Management Dashboard (Table View)
  2. Screen 2: Admin Order Details Screen (Detail & Action View)
- **Customer View**: 3. Screen 3: Customer Order History (Minimalist Card List) 4. Screen 4: Customer Active Order Details (Timeline & Self-Service View) 5. Screen 5: Customer Return/Refund Modal & Mandatory Cancellation Modal

### 4. Required Screens & Features (OR-01 to PR-08)

#### Screen 1 — Admin: Order Management Dashboard

- Minimalist Search & Filter Bar: Search input by Order ID or Customer Name, plus status filter pills (`All`, `New`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`, `Return Requested`).
- Clean Data Table displaying:
  - Order ID (e.g., `#STX-9012`)
  - Customer Name
  - Order Date
  - Status Badge (styled purely with `#0d0d0d`, `#f7f6f4`, `#e8e6e4`, and `#f40000` for Cancelled/Return)
  - Total Amount
  - Action column ("View Details" button that opens Screen 2 for that order)

#### Screen 2 — Admin: Order Details Screen

- Left Column (Order Info - OR-01):
  - Purchased fashion items list (minimal thumbnail, item name, size/color variant, quantity, unit price, subtotal) and price summary (`calculateOrderTotal()`).
  - Customer Shipping Address, Contact Info, and Payment Method.
- Right Column (Lifecycle & Operations):
  - **Status Management Card (OR-02 & Rule OR-BR-01)**:
    - Displays current status and an "Update Status" selector.
    - **Strict Rule OR-BR-01**: Enforce sequential progression (`New -> Confirmed -> Processing -> Shipped -> Delivered`). Only allow selecting the immediate next step in the sequence (disable skipping steps).
  - **Delivery Tracking Input (PR-08)**:
    - When updating status to `Shipped` (or viewing a `Shipped` order), display a clean input field for Tracking Number / Carrier Link and an "Assign Tracking" button (`assignTrackingNumber()`).
  - **Internal Order Notes Card (OR-04 & Rule OR-BR-05)**:
    - Label clearly as "Internal Seller/Admin Notes (Hidden from Customer)".
    - List of timestamped notes (e.g., "Waiting on supplier", "Fragile packaging needed") + sanitized textarea and "Add Note" button (`addOrderNote()`).
  - **Return & Refund Management Card (OR-05, OR-06, Rule OR-BR-04, Rule OR-SEC-02)**:
    - Displays customer return reason and uploaded damage photo thumbnails.
    - Step 1: "Approve / Confirm Return Received & Inspected" button (`updateReturnStatus()`).
    - Step 2 (Rule OR-BR-04 & OR-SEC-03): "Process Refund" button (`processRefundTransaction()`). Must remain disabled until Step 1 (Return Validated) is checked/confirmed. Include single-click lock state (idempotency UI feedback) when clicked.
  - **Admin Cancel Order Action (OR-03)**:
    - Button to open the Mandatory Cancellation Reason Modal.

#### Screen 3 — Customer: Order History

- Minimalist vertical list of previous and active orders.
- Each row/card displays: Product thumbnail preview, Order ID, Placement Date, Item count, Total Amount, bold Status indicator (`New`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), and a "View Order" button leading to Screen 4.

#### Screen 4 — Customer: Active Order Details

- **Live Status Progress Bar (OR-02)**:
  - Horizontal 5-step minimalist timeline (`New` -> `Confirmed` -> `Processing` -> `Shipped` -> `Delivered`). Active/completed steps in `#0d0d0d`, upcoming steps in `#e8e6e4`.
- **Order Summary & Breakdown (OR-01)**:
  - Itemized list with thumbnails, shipping address, payment method, subtotal, shipping fee, and total price.
  - **Strict Rule OR-BR-05**: Internal Order Notes (`OR-04`) must be completely absent from the Customer DOM/view.
- **Conditional Customer Action Bar**:
  - **Download Invoice Button (PR-07)**: Visible/enabled once order status is `Confirmed` or later (`generateInvoicePDF()`).
  - **Tracking Number Link (PR-08)**: Displayed with a clickable tracking link when status is `Shipped` or `Delivered`.
  - **Cancel Order Button (OR-03 & Rule OR-BR-02)**:
    - ONLY visible/enabled when status is `New` or `Confirmed`.
    - Automatically hidden/disabled with a subtle helper note once status reaches `Processing`, `Shipped`, or `Delivered`.
  - **Request Return / Refund Button (OR-05 & Rule OR-BR-06)**:
    - ONLY visible when status is `Delivered` AND within the 7-day return eligibility window (display a subtle badge e.g., "Eligible for return — 5 days remaining").

#### Screen 5 — Minimalist Modals (Customer & Admin)

1. **Cancellation Modal (OR-03 & Rule OR-BR-03)**:
   - Predefined reason dropdown (e.g., "Changed mind", "Out of stock", "Wrong shipping address", "Other") + mandatory reason textarea.
   - **Strict Rule OR-BR-03**: Block form submission and show a `#f40000` validation border/message if the reason is empty.
2. **Customer Return / Refund Request Modal (OR-05)**:
   - Textarea for describing the return/damage reason.
   - Minimalist drag-and-drop / file upload input (`accept="image/*"`) for attaching photos of damaged items with instant image preview thumbnails.
   - "Submit Return Request" button (`submitReturnRequest()`).

### 5. Security & Interaction Polish (Frontend Level)

- Sanitize all text inputs rendered to the DOM from the Cancellation Reason and Order Notes fields using `textContent` or an HTML-escaping helper (`OR-SEC-04`).
- Pre-populate 5 realistic mock orders in different lifecycle stages (`New`, `Confirmed`, `Processing`, `Shipped`, `Delivered`) so every button state and business rule can be tested immediately in the browser.
