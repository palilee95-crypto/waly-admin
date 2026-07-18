# 07 — Admin Portal: Database Design

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Admin Portal reads from and writes to the same PocketBase SQLite database used by the mobile app. This document maps all PocketBase collections that the admin portal directly interacts with, their relationships, and admin-specific access patterns.

---

## 2. Collection Map

```
PocketBase Collections (admin-portal perspective)
│
├── Identity & Auth
│   ├── _superusers          ← PocketBase built-in admin accounts
│   ├── users                ← Customer accounts (phone-based auth)
│   └── admin_users          ← Portal staff with role field
│
├── Merchant Layer
│   ├── merchants            ← Merchant profiles (status: pending/active/suspended)
│   └── store_locations      ← Physical POS locations per merchant
│
├── Loyalty Core
│   ├── tiers                ← Tier definitions (Bronze/Silver/Gold/Platinum)
│   ├── stamp_cards          ← Stamp card templates per merchant
│   ├── customer_cards       ← Customer's collected stamp cards
│   └── rewards              ← Reward item catalog
│
├── Transactions
│   ├── transactions         ← Earn / redeem / adjust / expire events
│   ├── redemptions          ← Reward redemption records
│   └── liability_snapshots  ← Daily points liability totals
│
├── Campaigns & Vouchers
│   ├── campaigns            ← Marketing campaign definitions
│   └── vouchers             ← Issued voucher instances
│
├── Gamification
│   ├── badges               ← Badge definitions
│   ├── user_badges          ← Customer earned badges
│   ├── challenges           ← Challenge definitions
│   └── user_challenges      ← Customer challenge progress
│
├── Fraud & Safety
│   ├── fraud_flags          ← Fraud detection alerts
│   └── velocity_rules       ← Velocity check thresholds (admin-managed)
│
└── Notifications
    ├── notifications        ← Notification records per user
    └── notification_logs    ← Delivery status per notification
```

---

## 3. Entity Relationship Overview

```
users ──────────────── transactions (earn/redeem/adjust)
  │                          │
  │                    merchants (via transaction.merchant)
  │
  ├── customer_cards ───── stamp_cards ──── merchants
  ├── redemptions    ───── rewards
  ├── user_badges    ───── badges
  ├── user_challenges ──── challenges
  ├── vouchers (issued)
  └── notifications

merchants ──── campaigns
           └── store_locations
```

---

## 4. Key Collection Details

### 4.1 `users`
| Field | Type | Admin Use |
|---|---|---|
| `id` | string | Unique identifier |
| `phone` | string | Primary identity |
| `name` | string | Display name |
| `role` | string | `customer` \| `merchant` \| `both` |
| `total_points` | number | Current balance (denormalized) |
| `tier_id` | relation → tiers | Current loyalty tier |
| `status` | string | `active` \| `suspended` |
| `metadata` | json | Misc flags, deleted_at |

### 4.2 `merchants`
| Field | Type | Admin Use |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Business name |
| `owner` | relation → users | Merchant owner account |
| `status` | string | `pending` \| `active` \| `suspended` |
| `is_verified` | bool | KYC verification status |
| `category` | string | Business category |
| `logo` | file | Merchant logo |

### 4.3 `transactions`
| Field | Type | Admin Use |
|---|---|---|
| `id` | string | Unique identifier |
| `user` | relation → users | Customer who transacted |
| `merchant` | relation → merchants | Merchant involved |
| `type` | string | `earn` \| `redeem` \| `adjust` \| `expire` |
| `points` | number | Points delta (positive = credit) |
| `note` | string | Reason for adjustment |
| `created` | datetime | Transaction timestamp |

---

## 5. Admin-Specific Collections

### 5.1 `admin_users` (custom, to be created)
```json
{
  "name": "admin_users",
  "type": "auth",
  "fields": [
    { "name": "name",      "type": "text",   "required": true },
    { "name": "role",      "type": "select", "values": ["super_admin","operations","analyst","support"] },
    { "name": "is_active", "type": "bool",   "default": true }
  ]
}
```

### 5.2 `velocity_rules` (custom, to be created)
```json
{
  "name": "velocity_rules",
  "type": "base",
  "fields": [
    { "name": "rule_name",       "type": "text"   },
    { "name": "max_points",      "type": "number" },
    { "name": "time_window_min", "type": "number" },
    { "name": "is_active",       "type": "bool"   }
  ]
}
```

---

## 6. Related Documents

| Doc | Description |
|---|---|
| [08-database-schema.md](./08-database-schema.md) | Full field-level schema for all collections |
| [19-transaction-ledger.md](../10-points-ledger/19-transaction-ledger.md) | Transaction audit log |
| [31-api-design.md](../16-api-integration/31-api-design.md) | PocketBase API query patterns |
