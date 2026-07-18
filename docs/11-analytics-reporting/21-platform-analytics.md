# 21 — Admin Portal: Platform Analytics

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Platform Analytics gives the WALY operations team a bird's-eye view of the loyalty ecosystem. This module surfaces Daily/Monthly Active Users, transaction volumes, campaign performance, tier distribution, and revenue proxy metrics — all driven by PocketBase queries and visualized with Recharts.

---

## 2. Analytics Dashboard Page (`/analytics`)

### 2.1 KPI Summary Cards (Top Row)

| KPI Card | Data Source | Refresh |
|---|---|---|
| Total Users | `users` count | Real-time |
| Active Merchants | `merchants` status=active count | Real-time |
| DAU (Today) | `transactions` distinct users today | Daily |
| MAU (30d) | `transactions` distinct users last 30d | Daily |
| Points Issued (30d) | `transactions` type=earn SUM | Daily |
| Points Redeemed (30d) | `transactions` type=redeem SUM | Daily |
| Total Liability | `liability_snapshots` latest | Daily |
| Active Campaigns | `campaigns` status=active count | Real-time |

---

### 2.2 DAU/MAU Trend (Line Chart — 90 days)

```typescript
// Aggregate daily active users from transactions
const getDailyActiveUsers = async (days: number) => {
  // Query transactions grouped by date
  // PocketBase doesn't support GROUP BY natively
  // Use client-side aggregation on fetched records
  const txns = await pb.collection('transactions').getFullList({
    filter: `created >= '${dayjs().subtract(days, 'days').toISOString()}'`,
    fields: 'user,created',
    sort: 'created',
  });

  // Group by date → count distinct users
  const byDate = groupBy(txns, (t) => dayjs(t.created).format('YYYY-MM-DD'));
  return Object.entries(byDate).map(([date, records]) => ({
    date,
    dau: new Set(records.map((r) => r.user)).size,
  }));
};
```

---

### 2.3 Points Flow Chart (Bar Chart — 30 days)

Two-series bar chart: **Points Earned** vs **Points Redeemed** per day.

---

### 2.4 Tier Distribution (Pie Chart)

```typescript
const tierCounts = await Promise.all(
  tiers.map(async (tier) => ({
    name:  tier.name,
    value: (await pb.collection('users').getList(1, 1, {
      filter: `tier_id = '${tier.id}'`, fields: 'id'
    })).totalItems,
  }))
);
```

---

### 2.5 Top 10 Merchants (Table)

Ranked by transaction volume (points issued) in the last 30 days.

---

### 2.6 New User Registrations (Area Chart — 30 days)

Daily count of new `users` created.

---

## 3. Date Range Selector

All charts respect a global date range selector:
- Last 7 days
- Last 30 days (default)
- Last 90 days
- Custom range (date picker)

---

## 4. Export

All analytics data can be exported as CSV or PDF via the export toolbar.

---

## 5. Related Documents

| Doc | Description |
|---|---|
| [22-merchant-analytics.md](./22-merchant-analytics.md) | Per-merchant drill-down |
| [20-liability-monitoring.md](../10-points-ledger/20-liability-monitoring.md) | Liability trend detail |
| [27-admin-dashboard.md](../14-backoffice/27-admin-dashboard.md) | Dashboard KPI card layout |
