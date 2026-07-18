# 17 — Admin Portal: Campaign Management

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Campaigns are time-limited promotional events that modify how customers earn points or access rewards. The Admin Portal allows ops staff to create, monitor, pause, and end both platform-wide and merchant-specific campaigns.

---

## 2. Campaign Types

| Type | Description | Effect |
|---|---|---|
| `double_points` | 2× points for all earn transactions | `multiplier: 2.0` applied at earn time |
| `bonus_stamp` | Extra stamp per visit | Customer gets 2 stamps per visit |
| `free_item` | Complimentary item on next visit | Triggers reward issuance |
| `discount` | Percentage off purchase via platform | Discount applied at checkout |

---

## 3. Platform vs. Merchant Campaigns

| Type | `merchant` field | Who creates | Scope |
|---|---|---|---|
| Platform Campaign | `null` | Ops Admin, Super Admin | All merchants |
| Merchant Campaign | `<merchant_id>` | Merchant (via mobile app) or admin | Single merchant |

Platform campaigns override merchant multipliers when active simultaneously.

---

## 4. Campaign Lifecycle

```
Draft → Active → Paused → Ended
  │        │
  │        └─► auto-ends when end_date passes
  │
  └─► Can be deleted if never activated
```

---

## 5. Campaigns List Page (`/campaigns`)

```typescript
const { tableProps } = useTable<Campaign>({
  resource: 'campaigns',
  meta: { expand: 'merchant' },
  sorters: { initial: [{ field: 'start_date', order: 'desc' }] },
});
```

**Table columns:** Title, Merchant (or "Platform-wide"), Type, Multiplier, Start, End, Status, Actions

---

## 6. Create Campaign Form

```typescript
interface CreateCampaignForm {
  title:       string;
  description: string;
  merchant:    string | null;    // null = platform-wide
  type:        'double_points' | 'bonus_stamp' | 'free_item' | 'discount';
  multiplier:  number;           // default 2.0 for double_points
  start_date:  string;           // ISO date
  end_date:    string;           // ISO date
  status:      'draft' | 'active';
}
```

---

## 7. Campaign Analytics

Each campaign detail page shows performance metrics:

| Metric | Query |
|---|---|
| Total participants | Count distinct `users` in `transactions` during campaign window |
| Points issued during campaign | Sum of `transactions.points` where `type = earn` in window |
| Redemption rate | Redemptions created / total participants |

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [18-voucher-coupon-admin.md](./18-voucher-coupon-admin.md) | Voucher bulk operations |
| [17-marketing-campaigns.md](../../web-app/docs/09-campaigns-promotions/17-marketing-campaigns.md) | Mobile app campaign reference |
| [21-platform-analytics.md](../11-analytics-reporting/21-platform-analytics.md) | Campaign performance analytics |
