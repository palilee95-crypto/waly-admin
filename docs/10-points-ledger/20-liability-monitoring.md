# 20 — Admin Portal: Liability Monitoring

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Points liability is the monetary value of all unredeemed points held by customers — the financial obligation WALY has to its users. The Liability Monitoring module gives admins real-time visibility into the total outstanding liability, daily trends, and alerts when liability exceeds configured thresholds.

---

## 2. Liability Calculation

```
Total Liability (MYR) = Total Unredeemed Points × Redemption Rate

Where:
  Total Unredeemed Points = SUM(users.total_points)
  Redemption Rate = RM0.01 per point (1 point = 1 sen)
```

---

## 3. Liability Snapshot Collection

A daily cron job (PocketBase hook) creates a snapshot record:

```typescript
interface LiabilitySnapshot {
  id:             string;
  snapshot_date:  string;   // ISO date (daily at 00:00 UTC)
  total_points:   number;   // sum of all users.total_points
  monetary_value: number;   // in MYR (total_points × 0.01)
  active_users:   number;   // users with total_points > 0
  delta_points:   number;   // change from previous snapshot
}
```

---

## 4. Liability Dashboard Page (`/ledger/liability`)

**KPI Cards:**
- Total Outstanding Points (current)
- Monetary Liability (MYR, current)
- 30-day Change (% up/down)
- Active Points Holders (user count)

**30-Day Trend Chart** (Recharts LineChart):
```typescript
const { data: snapshots } = useList<LiabilitySnapshot>({
  resource: 'liability_snapshots',
  sorters: [{ field: 'snapshot_date', order: 'asc' }],
  filters: [{ field: 'snapshot_date', operator: 'gte', value: thirtyDaysAgo }],
  pagination: { pageSize: 31 },
});

// Renders as LineChart with:
// X-axis: snapshot_date
// Y-axis: monetary_value (MYR)
```

---

## 5. Liability Alerts

Configurable thresholds trigger alerts in the admin dashboard:

| Alert Level | Trigger | Action |
|---|---|---|
| `info` | Liability > RM10,000 | Yellow badge on dashboard |
| `warning` | Liability > RM50,000 | Orange alert card |
| `critical` | Liability > RM100,000 | Red banner + email to Super Admin |

---

## 6. Liability Reduction Strategies

When liability grows unsustainably, admins can:
1. **Launch a redemption campaign** — double rewards value for 7 days
2. **Expire stale points** — batch expire points inactive for 12+ months
3. **Increase earn requirements** — raise tier thresholds
4. **Issue more rewards at higher point cost** — adjust reward catalog

---

## 7. Points Expiry Batch

```typescript
// Expire points for users inactive > 12 months
const expireStalePoints = async () => {
  const cutoff = dayjs().subtract(12, 'months').toISOString();

  const staleUsers = await pb.collection('users').getFullList({
    filter: `updated < '${cutoff}' && total_points > 0`,
    fields: 'id,total_points',
  });

  for (const user of staleUsers) {
    await pb.collection('transactions').create({
      user:    user.id,
      type:    'expire',
      points:  -user.total_points,
      note:    '[SYSTEM] Points expired due to 12-month inactivity',
    });
    await pb.collection('users').update(user.id, { total_points: 0 });
  }
};
```

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [19-transaction-ledger.md](./19-transaction-ledger.md) | Full transaction audit log |
| [21-platform-analytics.md](../11-analytics-reporting/21-platform-analytics.md) | DAU/MAU and engagement trends |
| [27-admin-dashboard.md](../14-backoffice/27-admin-dashboard.md) | Dashboard liability KPI card |
