Act as an expert Frontend UI/UX Developer. Build a complete, responsive, high-fashion e-commerce Web UI template for the "Stylex — Fashion Marketplace Shop Dashboard" (Module V1.0).

### 1. Technical Constraints

- Stack: Pure HTML5 (`index.html`), Vanilla CSS3 (`styles.css`), and Vanilla JavaScript (`script.js`). Use Chart.js via CDN for the two charts and Lucide Icons or Remix Icon via CDN for crisp iconography.
- Scope: Web UI template ONLY. Do NOT build login/register pages, authentication flows, or backend API calls.
- Data: Populate all widgets with realistic fashion marketplace mock data in `script.js` so the template looks complete and ready for future API binding (`data-*` attributes and clean DOM IDs on all dynamic values).

### 2. Strict Brand Design System (Colors & Fonts)

Load Google Fonts in `<head>`:

- Header & Navigation Font: `'Be Vietnam Pro', sans-serif` (weights: 500, 600, 700). Apply to all headings, sidebar links, KPI numbers, tab labels, and buttons.
- Body Font: `'Roboto Flex', sans-serif` (weights: 400, 500). Apply to all body copy, table rows, timestamps, descriptions, and form inputs.

Define and strictly use ONLY these 5 CSS Custom Properties for the color palette:

- `--color-white: #ffffff;` (Cards, modals, elevated surfaces, primary text on dark backgrounds)
- `--color-bg-light: #f7f6f4;` (Main dashboard canvas background, subtle table row hover, input backgrounds)
- `--color-border: #e8e6e4;` (1px card borders, dividers, inactive pills, subtle progress bar tracks)
- `--color-black: #0d0d0d;` (Primary text, active sidebar navigation fill, primary action buttons, primary chart line)
- `--color-red: #f40000;` (Brand accent, Low Stock persistent warning highlights, unread notification badges, negative trends, critical chart slices)

Aesthetic Direction: Editorial luxury fashion admin portal (clean lines, 1px solid `#e8e6e4` borders, subtle shadows, crisp high-contrast `#0d0d0d` and `#ffffff` surfaces, and sharp `#f40000` accents).

### 3. Layout & Navigation Structure

- Left Sidebar Navigation: Fixed width (260px on desktop, collapsible drawer on tablet/mobile). Features the "Stylex" serif/editorial brand logo at the top, navigation links (Dashboard [Active], Orders, Products & Inventory, Revenue & Finance, Reviews, Followers, Notifications, Settings), and a static Shop Profile summary at the bottom.
- Top Header Bar:
  - Left: Page title ("Shop Dashboard") and a live "Auto-refresh: 60s" countdown badge with a manual Refresh icon button (Rule DS-BR-02).
  - Right:
    - UI Role Switcher Pill ("View as: Shop Owner / Staff") to visually demonstrate Rule DS-BR-01 (toggling to "Staff" hides the Revenue Summary KPI card and Revenue Line Chart).
    - Period Filter & Date-Range Picker (Segmented pills: `Today`, `Week`, `Month`, `Custom` with `fromDate` and `toDate` date inputs).
    - Notification Bell icon with an unread `#f40000` badge count and dropdown panel.
- Persistent Top Ticker / Banner (DS-07 & Notification Rule):
  - A sleek horizontal notification ticker directly below the header displaying the latest system/order alert (e.g., "NEW ORDER ALERT: Order #STX-8942 placed 2 mins ago") and a persistent `#f40000` accented Low Stock Warning strip.

### 4. Dashboard Main View — Required UI Components & IDs

Organize the main workspace into a responsive 12-column CSS Grid containing these exact SRS features:

1. D-01: Sales Overview KPI Row (4 Cards)
   - Display filtered metrics with percentage trend badges:
     - Total Orders (`#metric-total-orders`)
     - Total Items Sold (`#metric-total-items`)
     - Average Order Value (`#metric-avg-order-value`)
     - Gross Revenue (`#metric-gross-revenue` — tagged with `.owner-only` class for role toggle)

2. DS-03: Revenue Summary & Revenue Line Chart (8 Columns wide, `.owner-only`)
   - Header with Period selector and 4 summary breakdown blocks:
     - Gross Revenue (`#rev-gross`)
     - Platform Fees (`#rev-fees`)
     - Refunds (`#rev-refunds`)
     - Net Earnings (`#rev-net` highlighted in bold)
   - Interactive Canvas Line Chart (`#revenueLineChart`) styled in `#0d0d0d` and `#f40000` showing revenue trend over the selected period.

3. DS-02: Orders Summary & Status Breakdown Pie Chart (4 Columns wide)
   - Interactive Doughnut/Pie Chart (`#orderStatusPieChart`) showing distribution across the 5 statuses.
   - Status count list with pill badges for:
     - Pending (`#orders-pending`)
     - Processing (`#orders-processing`)
     - Shipped (`#orders-shipped`)
     - Completed (`#orders-completed`)
     - Cancelled (`#orders-cancelled`)

4. DS-04: Low Stock Alert Panel (6 Columns wide — Visible to ALL roles)
   - Header featuring a persistent `#f40000` warning badge and an inline "Threshold" numeric input defaulted to `10` units (Rule DS-BR-03) so changing the number dynamically filters the mock product table in JS.
   - Table/List sorted by stock ascending (`#low-stock-list`), displaying: Product ID (`productId`), Fashion Item Name (`name`), Current Stock count (`stock` highlighted in `#f40000`), Threshold (`threshold`), and a quick "Restock" UI button.

5. DS-05: Recent Customer Reviews (6 Columns wide)
   - Scrollable feed (`#recent-reviews-list`) displaying the latest shop reviews.
   - Each card shows: Reviewer Name (`reviewerName`), 5-star visual rating (`rating`), Product Name badge (`productName`), Review Comment (`comment`), and Date (`date`).

6. DS-06: New Followers Strip / Card (6 Columns wide)
   - Clean grid or horizontal avatar list (`#recent-followers-list`) showing recent users who followed the shop.
   - Each item displays: User Avatar (`avatar`), User Name (`userName`), User Handle/ID (`userId`), and Followed Date (`followedDate`).

7. DS-07: Recent Notifications Feed (6 Columns wide)
   - Structured feed (`#recent-notifications-list`) with Filter pills (`All`, `Unread`, `Orders`, `System`) and a "Mark all as read" button.
   - Each notification item displays: Type icon (`type`), Message (`message`), Timestamp (`date`), and an unread `#f40000` dot indicator (`isRead`).

### 5. Interactive UI Behaviors (Frontend Template Only)

- Clicking `Today`, `Week`, `Month`, or `Custom` in the date filter updates the active button state and swaps mock numbers/chart datasets to simulate period filtering.
- Toggling the "Shop Owner / Staff" switch smoothly hides/shows the DS-03 Revenue Summary sections while keeping DS-04 Low Stock Alerts visible.
- Changing the Low Stock Threshold input (default `10`) re-renders the Low Stock table in real time using the mock array.
- Include a visual 60-second countdown timer in the header that resets when clicked or when it reaches zero.
