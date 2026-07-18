# 36 — Admin Portal: Navigation Structure

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Admin Portal uses Refine's `ThemedLayoutV2` with a fixed left sidebar for primary navigation. The sidebar auto-generates menu items from the `resources` array in `<Refine>` and respects role-based visibility via `accessControlProvider`.

---

## 2. Sidebar Navigation Tree

```
WALY Admin
├── 📊 Dashboard                /dashboard
│
├── 🏪 Merchants               /merchants
│   ├── All Merchants          /merchants
│   └── Pending Approvals      /merchants/pending
│
├── 👥 Users                   /users
│
├── 🎯 Loyalty                 (group)
│   ├── Tier Management        /loyalty/tiers
│   └── Stamp Cards            /loyalty/stamp-cards
│
├── 🎁 Rewards                 (group)
│   ├── Rewards Catalog        /rewards
│   └── Redemptions            /rewards/redemptions
│
├── 📢 Campaigns               (group)
│   ├── All Campaigns          /campaigns
│   └── Vouchers               /campaigns/vouchers
│
├── 📒 Points Ledger           (group)
│   ├── Transactions           /ledger
│   └── Liability Monitor      /ledger/liability
│
├── 📈 Analytics               (group)
│   ├── Platform Analytics     /analytics
│   └── Merchant Rankings      /analytics/merchants
│
├── 🚨 Fraud Prevention        (group)    ← Hidden for Analyst / Support
│   ├── Fraud Flags            /fraud     ← Red badge if open flags > 0
│   └── Velocity Rules         /fraud/velocity-rules  ← Super Admin only
│
├── 🔔 Notifications           (group)
│   ├── Overview               /notifications
│   ├── Broadcast              /notifications/broadcast
│   └── Delivery Logs          /notifications/logs
│
├── 🏆 Gamification            (group)
│   ├── Badges                 /gamification/badges
│   ├── Challenges             /gamification/challenges
│   └── Leaderboard            /gamification/leaderboard
│
└── ⚙️ Admin Users             /admin-users  ← Super Admin only
```

---

## 3. Sidebar Header

```
┌────────────────────────┐
│  🟣 WALY ADMIN         │
│  admin.waly.app        │
└────────────────────────┘
```

---

## 4. Sidebar Footer

```
┌────────────────────────┐
│  👤 Ahmad (Operations) │
│  [Logout]              │
└────────────────────────┘
```

---

## 5. Breadcrumbs

All pages show breadcrumbs using Refine's `<Breadcrumb>` component:

```
Dashboard > Merchants > Kopi Town
Dashboard > Fraud Prevention > Flag #abc123
Dashboard > Analytics > Merchant Rankings
```

---

## 6. Page Header Pattern

Every page follows this header pattern:

```
┌──────────────────────────────────────────────────┐
│  [Page Title]                    [Action Button] │
│  Breadcrumb > Path > Here                        │
└──────────────────────────────────────────────────┘
```

Example:
```
Merchants                            [+ Add Merchant]
Dashboard > Merchants
```

---

## 7. Tab Navigation (Detail Pages)

Merchant and User detail pages use Ant Design `Tabs` for sub-sections:

```
Merchant: Kopi Town
[Overview] [Analytics] [Customers] [Campaigns] [Transactions]
```

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [35-ui-pages.md](./35-ui-pages.md) | Full page inventory |
| [33-ui-guidelines.md](../17-ui-ux/33-ui-guidelines.md) | UI design tokens |
| [05-user-role-permission.md](../03-security/05-user-role-permission.md) | Nav visibility by role |
