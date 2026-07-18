# 08 — Admin Portal: Database Schema

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

This document provides the field-level schema for every PocketBase collection that the Admin Portal reads from or writes to. Refer to `pb_schema.json` in the `web-app/` root for the authoritative source of truth.

---

## 2. Core Collection Schemas

### `users`
```typescript
interface User {
  id:           string;        // PocketBase auto-ID
  collectionId: string;
  phone:        string;        // "+60123456789" — unique, primary key
  name:         string;
  avatar:       string;        // file reference
  role:         'customer' | 'merchant' | 'both';
  status:       'active' | 'suspended';
  total_points: number;        // denormalized balance
  tier_id:      string;        // → tiers.id
  metadata:     {
    deleted_at?: string;       // ISO date if soft-deleted
    referral_code?: string;
  };
  created:      string;        // ISO datetime
  updated:      string;
}
```

### `merchants`
```typescript
interface Merchant {
  id:          string;
  name:        string;
  owner:       string;         // → users.id
  status:      'pending' | 'active' | 'suspended';
  is_verified: boolean;
  category:    string;         // "F&B" | "Retail" | "Beauty" | etc.
  logo:        string;         // file reference
  description: string;
  metadata:    {
    business_reg?: string;
    rejection_reason?: string;
  };
  created:     string;
  updated:     string;
}
```

### `transactions`
```typescript
interface Transaction {
  id:       string;
  user:     string;            // → users.id
  merchant: string;            // → merchants.id
  type:     'earn' | 'redeem' | 'adjust' | 'expire';
  points:   number;            // positive = credit, negative = debit
  note:     string;            // reason (admin adjustments)
  ref_id:   string;            // external reference (POS, voucher ID)
  created:  string;
}
```

### `fraud_flags`
```typescript
interface FraudFlag {
  id:          string;
  user:        string;         // → users.id (flagged user)
  transaction: string;         // → transactions.id (trigger transaction)
  rule:        string;         // rule name that triggered
  status:      'open' | 'reviewing' | 'resolved' | 'dismissed';
  severity:    'low' | 'medium' | 'high';
  notes:       string;         // admin review notes
  resolved_by: string;         // → admin_users.id
  created:     string;
  updated:     string;
}
```

### `campaigns`
```typescript
interface Campaign {
  id:          string;
  merchant:    string | null;  // null = platform-wide
  title:       string;
  description: string;
  type:        'double_points' | 'bonus_stamp' | 'free_item' | 'discount';
  multiplier:  number;         // e.g. 2.0 for double points
  start_date:  string;         // ISO date
  end_date:    string;         // ISO date
  status:      'draft' | 'active' | 'paused' | 'ended';
  created:     string;
  updated:     string;
}
```

### `rewards`
```typescript
interface Reward {
  id:           string;
  merchant:     string;        // → merchants.id
  title:        string;
  description:  string;
  points_cost:  number;
  stock:        number | null; // null = unlimited
  image:        string;        // file reference
  status:       'active' | 'retired';
  valid_until:  string | null; // ISO date
  created:      string;
  updated:      string;
}
```

### `tiers`
```typescript
interface Tier {
  id:              string;
  name:            'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  min_points:      number;     // threshold to qualify
  multiplier:      number;     // points earn multiplier
  benefits:        string[];   // list of benefit descriptions
  badge_icon:      string;     // file reference
  sort_order:      number;     // display order
}
```

### `liability_snapshots`
```typescript
interface LiabilitySnapshot {
  id:              string;
  snapshot_date:   string;     // ISO date (daily)
  total_points:    number;     // total unredeemed points
  monetary_value:  number;     // points × redemption rate (in MYR)
  active_users:    number;
}
```

---

## 3. Admin-Specific Schemas

### `admin_users`
```typescript
interface AdminUser {
  id:        string;
  email:     string;
  name:      string;
  role:      'super_admin' | 'operations' | 'analyst' | 'support';
  is_active: boolean;
  last_login: string;
  created:   string;
  updated:   string;
}
```

### `velocity_rules`
```typescript
interface VelocityRule {
  id:              string;
  rule_name:       string;
  description:     string;
  max_points:      number;     // max points in window
  max_transactions: number;    // max tx count in window
  time_window_min: number;     // rolling window in minutes
  is_active:       boolean;
  created:         string;
  updated:         string;
}
```

---

## 4. Related Documents

| Doc | Description |
|---|---|
| [07-database-design.md](./07-database-design.md) | Collection map and entity relationships |
| [19-transaction-ledger.md](../10-points-ledger/19-transaction-ledger.md) | Transaction audit patterns |
| [23-fraud-flags.md](../12-fraud-prevention/23-fraud-flags.md) | Fraud flag workflow |
