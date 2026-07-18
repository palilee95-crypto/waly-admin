# 27 — Admin Portal: Admin Dashboard

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Admin Dashboard is the first page an admin sees after login. It is a command center that aggregates the most critical platform metrics, active alerts, and recent activity into a single, scannable view. Built with Ant Design cards and Recharts.

---

## 2. Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  WALY Admin Portal                          👤 Admin Name ▼    │
├───────────┬─────────────────────────────────────────────────────┤
│           │  📊 DASHBOARD                                        │
│  Sidebar  ├─────────────────────────────────────────────────────┤
│  Nav      │  [KPI Row — 4 cards]                                 │
│           │  [KPI Row — 4 cards]                                 │
│  • Dashboard     ├──────────────────────┬──────────────────────────┤
│  • Merchants     │  Points Flow Chart   │  Tier Distribution Pie  │
│  • Users    │  (30-day Bar Chart)  │  (Doughnut)             │
│  • Loyalty  ├──────────────────────┴──────────────────────────┤
│  • Rewards  │  Recent Alerts                                   │
│  • Campaigns│  [Fraud Flags 🔴] [Pending Merchants 🟡]        │
│  • Ledger   ├──────────────────────────────────────────────────┤
│  • Analytics│  Recent Activity Feed                            │
│  • Fraud    │  (Latest transactions, approvals, flags)         │
│  • Notifs   └──────────────────────────────────────────────────┘
│  • Gamif.
│  • Admins
└───────────
```

---

## 3. KPI Cards (Row 1 — Platform Health)

| Card | Data | Icon |
|---|---|---|
| Total Users | `users` count | 👥 |
| Active Merchants | `merchants` status=active | 🏪 |
| Points Issued (30d) | SUM earn transactions | ⭐ |
| Points Redeemed (30d) | SUM redeem transactions | 🎁 |

## 4. KPI Cards (Row 2 — Operations Alerts)

| Card | Data | Color |
|---|---|---|
| Pending Approvals | `merchants` status=pending count | 🟡 Orange |
| Open Fraud Flags | `fraud_flags` status=open count | 🔴 Red |
| Total Liability | Latest `liability_snapshots` monetary_value | 🟠 |
| Active Campaigns | `campaigns` status=active count | 🟢 Green |

---

## 5. Points Flow Chart

30-day bar chart with two series:
- **Earned** (green bars): daily SUM of earn transactions
- **Redeemed** (orange bars): daily SUM of redeem transactions

```typescript
<BarChart data={dailyFlow} width={600} height={300}>
  <Bar dataKey="earned"   fill="#52c41a" name="Earned" />
  <Bar dataKey="redeemed" fill="#fa8c16" name="Redeemed" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
</BarChart>
```

---

## 6. Recent Alerts Feed

Real-time list (SSE subscription) of the latest:
- 🔴 New HIGH severity fraud flags
- 🟡 Pending merchant approval > 4 hours
- 🟠 Liability threshold breached

Each alert links to the relevant detail page.

---

## 7. Recent Activity Feed

Latest 10 events across the platform:
- New user registrations
- Merchant approvals/rejections
- Fraud flag resolutions
- Large transactions (> 500 pts)

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [28-admin-management.md](./28-admin-management.md) | Admin user management |
| [21-platform-analytics.md](../11-analytics-reporting/21-platform-analytics.md) | Full analytics page |
| [23-fraud-flags.md](../12-fraud-prevention/23-fraud-flags.md) | Fraud flag queue |
| [36-navigation-structure.md](../18-page-structure/36-navigation-structure.md) | Sidebar navigation spec |
