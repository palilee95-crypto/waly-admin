# WALY Admin Portal Implementation Plan

This implementation plan details the step-by-step phased rollout of the WALY Admin Portal using **Refine + Vite + Tailwind CSS + Ant Design** integrated with the **PocketBase v0.39.5** backend. 

The user interface (UI) and user experience (UX) will be modeled exactly after the custom premium glassmorphism theme from [code.html](file:///c:/Users/User/Documents/Work/WALY%20MOBILE/admin-portal/stitch/stitch_waly_admin_intelligence_hub/waly_admin_dashboard_desktop/code.html).

---

## UI Design & Aesthetic Specifications
To replicate the design from `code.html` exactly, the following tokens and structures will be integrated into the Vite + Tailwind + Ant Design setup:

- **Typography**: Primary font family is Google Font **Hanken Grotesk**; icons use **Material Symbols Outlined**.
- **Page Canvas Background**: Dynamic linear gradient background:
  ```css
  background: linear-gradient(135deg, #f7f9fc 0%, #eef2f7 50%, #e6eaf1 100%);
  min-height: 100vh;
  ```
- **Glassmorphic Panels (`.glass-panel`)**: Cards, bento blocks, profiles, and tables must use:
  ```css
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  ```
- **Color Palette Integration**: Configure Tailwind CSS with the exact colors from `code.html`:
  - `primary`: `#0040e0`
  - `primary-container`: `#2e5bff`
  - `on-surface`: `#191c1e`
  - `on-surface-variant`: `#434656`
  - `background`: `#f7f9fc`
  - `surface-container`: `#eceef1`
  - `outline`: `#747688`
  - `error`: `#ba1a1a`
- **Sidebar Navigation (`<aside>`)**: Fixed left panel with premium dark background (`bg-inverse-surface`), white text, and glowing active states:
  - Active button: `bg-primary-container text-on-primary-container rounded-lg shadow-[0_0_15px_rgba(46,91,255,0.4)]`
- **Top Header Bar (`<header>`)**: Sticky top header: `bg-white/60 backdrop-blur-xl border-b border-white/20`.
- **Layout Margins/Paddings**: Custom paddings: `stack-sm` (12px), `gutter` (24px), `glass-padding` (24px), `container-padding` (32px).
- **Interactive Effects**: Mousemove micro-interactions for dynamic glow reflections on all `.glass-panel` components.

---

## Phase 1: Foundation & Core Operations (Weeks 1-3)
**Goal:** Scaffold the Vite + Refine environment, implement PocketBase authentication, set up the glassmorphic layout, and establish lists and details for Merchants, Users, and Fraud Flags.

- [x] **Step 1.1: Project Scaffolding & Tailwind Integration**
  - [x] Initialize Vite + React TypeScript project.
  - [x] Install dependencies: `@refinedev/core`, `@refinedev/pocketbase`, `@refinedev/antd`, `@refinedev/react-router-v6`, `react-router-dom`, `antd`, `@ant-design/icons`, `tailwindcss`, `recharts`, `dayjs`.
  - [x] Configure Tailwind with custom colors, spacings, borders, and Hanken Grotesk typography.
  - [x] Add Material Symbols Outlined stylesheet to `index.html`.
- [x] **Step 1.2: Base Layout & Glassmorphism Theme Config**
  - [x] Create layout component mimicking left dark `<aside>` menu and sticky top `<header>` from `code.html`.
  - [x] Define Ant Design global theme in `App.tsx` (using `<ConfigProvider>` custom tokens matching the glassmorphic aesthetics).
  - [x] Implement mousemove event-listener hooks to update mouse glow coordinates (`--mouse-x`, `--mouse-y`) on `.glass-panel` components.
- [x] **Step 1.3: PocketBase Client & Auth Provider**
  - [x] Set up `src/lib/pocketbase.ts` to export the single PocketBase instance pointing to `VITE_POCKETBASE_URL`.
  - [x] Implement `src/authProvider.ts` for PocketBase admin login (`pb.admins.authWithPassword()`).
  - [x] Build custom login screen (`/login`) styled with the glassmorphic aesthetic.
- [x] **Step 1.4: Admin Dashboard Page (The Bento Grid)**
  - [x] Implement `/dashboard` page utilizing Refine hooks for PocketBase counts.
  - [x] Implement the **6-card KPI Row** matching the layout/icons/trends of `code.html` (Merchants, Customers, Active Users, Total Sales, Leads, Sales Team).
  - [x] Implement the **Merchant Follow-up & Retention Table** with stable/active/at risk status tags.
  - [x] Implement the **Top Sales Team Performance Widget** featuring user avatars, rankings, and deal amounts.
  - [x] Implement the **Weekly Retention visual card** and **Interaction History cards** matching the layout exactly.
- [x] **Step 1.5: Merchant Management Module**
  - [x] Implement Merchant List page (`/merchants`) with tabbed sub-views for "All Merchants" and "Pending Approvals".
  - [x] Implement Merchant Detail page (`/merchants/:id`) showing owner profile and business registry data.
  - [x] Implement Approve/Reject actions with verification triggers and automated notification creations.
- [x] **Step 1.6: User Management Module**
  - [x] Implement User List page (`/users`) with search, filter, and sorting.
  - [x] Implement User Detail page (`/users/:id`) with points summary, tier tracking, and transaction history.
  - [x] Implement Points Adjustment Drawer allowing Support/Ops to credit/debit points with reason logs.
- [x] **Step 1.7: Fraud Prevention Queue**
  - [x] Implement Fraud Flag List page (`/fraud`) representing open/reviewing flags sorted by severity.
  - [x] Implement Fraud Detail page (`/fraud/:id`) showing rule triggers, velocity charts, and resolving action buttons.
  - [x] Implement Transaction Ledger list (`/ledger`) and detail (`/ledger/:id`) for auditing.

---

## Phase 2: Campaigns & Analytics (Weeks 4-5)
**Goal:** Implement CRUD screens for campaigns, rewards, and vouchers, build platform/merchant analytical charts with Recharts, and enable CSV exports.

- [x] **Step 2.1: Campaign Management**
  - [x] Implement Campaign List page (`/campaigns`) and Campaign Detail (`/campaigns/:id`).
  - [x] Build Campaign Creation Form (`/campaigns/create`) with dual inputs for platform-wide or merchant-specific rules.
  - [x] Build Edit Campaign form (`/campaigns/:id/edit`).
- [x] **Step 2.2: Voucher Bulk Issuance**
  - [x] Implement Voucher List page (`/campaigns/vouchers`).
  - [x] Build Voucher Bulk Issue form (`/campaigns/vouchers/issue`) to distribute vouchers to targeted segments or tiers.
- [x] **Step 2.3: Rewards Catalog**
  - [x] Implement Rewards List page (`/rewards`), Reward Create form (`/rewards/create`), and Reward Detail/Edit pages.
  - [x] Implement Redemptions Log (`/rewards/redemptions`) and Redemption Detail view with refund/void controls.
- [x] **Step 2.4: Platform Analytics & Charts**
  - [x] Implement Platform Analytics view (`/analytics`) containing:
    - Points Flow Chart: 30-day dual Earned (green) vs. Redeemed (orange) Recharts bar chart.
    - Tier Distribution Pie: Recharts pie chart showing membership breakdown.
  - [x] Implement Merchant Rankings page (`/analytics/merchants`).
- [x] **Step 2.5: CSV Data Export & Liability Monitoring**
  - [x] Configure `useExport()` hooks on all primary tables (Merchants, Users, Ledger, Rewards) for CSV downloads.
  - [x] Implement Liability Monitor dashboard (`/ledger/liability`) displaying daily snapshots of outstanding points and MYR exposure.

---

## Phase 3: Loyalty & Gamification (Weeks 6-7)
**Goal:** Deliver controls for loyalty tier configurations, stamp cards, gamification entities (badges, challenges, leaderboards), and notification broadcasts.

- [x] **Step 3.1: Loyalty Configuration**
  - [x] Implement Tier List (`/loyalty/tiers`) and Edit Tier form (`/loyalty/tiers/:id/edit`) supporting multiplier updates.
  - [x] Implement Stamp Card List (`/loyalty/stamp-cards`), Detail view (`/loyalty/stamp-cards/:id`), and Edit Card form.
- [x] **Step 3.2: Gamification Abstractions**
  - [x] Implement Badge management pages (`/gamification/badges`, `/gamification/badges/create`).
  - [x] Implement Challenge management pages (`/gamification/challenges`, `/gamification/challenges/create`).
  - [x] Build Streak Admin page & Leaderboard configuration overview (`/gamification/leaderboard`).
- [x] **Step 3.3: Velocity Rules Config**
  - [x] Implement Velocity Rules List (`/fraud/velocity-rules`) and Edit Rules form (`/fraud/velocity-rules/:id/edit`) for Super Admins.
- [x] **Step 3.4: Notifications broadcast & Logs**
  - [x] Implement Notification Overview (`/notifications`).
  - [x] Build Broadcast Form (`/notifications/broadcast`) to draft and send push/email messages.
  - [x] Build Delivery Logs interface (`/notifications/logs`) representing status tracking of system alerts.

---

## Phase 4: Polish & Hardening (Week 8)
**Goal:** Add Role-Based Access Control (RBAC), global search, admin user configuration, dark mode toggle, and audit logging. Perform final quality verification and production deployment.

- [x] **Step 4.1: Admin User Management & RBAC**
  - [x] Implement Admin Users List (`/admin-users`), Create form, and Edit form (restricted to Super Admins).
  - [x] Set up Refine `accessControlProvider` to restrict routes based on `admin_users.role`.
- [x] **Step 4.2: Admin Audit Log**
  - [x] Build a database-driven audit log view recording write actions performed by admins.
- [x] **Step 4.3: Global Search (`Ctrl+K`)**
  - [x] Implement global search dialog overlay to lookup merchants, users, and vouchers quickly.
- [x] **Step 4.4: Theme Dark Mode & PDF Export**
  - [x] Build a theme-toggle component matching the layout of `code.html`.
  - [x] Add dark mode CSS styling rules and configure the Ant Design dark theme algorithm.
  - [x] Enable PDF generation on the Analytics page using `jspdf` or HTML canvas capture.
- [x] **Step 4.5: Deployment & CI/CD Setup**
  - [x] Set up build configurations (`npm run build`) with Vite.
  - [x] Configure CI/CD pipeline deploying the production bundle to `admin.waly.app` behind Caddy/Nginx.

---

## Verification Plan

### Automated Verification
Run following commands to verify project integrity before builds:
- `npm run lint` - Code linting checks
- `npm run build` - Validates TypeScript and bundler output correctness

### Manual Verification
- **Login Flow**: Log in using Super Admin, Operations, Analyst, and Support test accounts to confirm proper RBAC navigation items are hidden/shown.
- **Glassmorphism Design Review**: Compare each page directly to `code.html` preview to ensure font weights, background gradients, `.glass-panel` borders, active nav icons, and custom metrics cards match.
- **Data operations**: Verify database changes reflect directly on the PocketBase local instance during merchant approvals and points adjustments.
