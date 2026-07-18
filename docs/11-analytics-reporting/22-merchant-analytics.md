# 22 — Admin Portal: Merchant Analytics

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Merchant Analytics provides per-merchant performance data, enabling the WALY operations team to identify top performers, flag underperforming merchants, and make data-driven decisions about campaign targeting and merchant support.

---

## 2. Merchant Analytics Page (`/analytics/merchants`)

### 2.1 Merchant Leaderboard Table

Sortable by: Total Points Issued, Total Customers, Redemption Rate, Active Campaigns

```typescript
// Build merchant performance summary
const getMerchantPerformance = async (dateRange: DateRange) => {
  const merchants = await pb.collection('merchants').getFullList({
    filter: `status = 'active'`,
    fields: 'id,name,category,logo',
  });

  return Promise.all(
    merchants.map(async (merchant) => {
      const [issued, redeemed, customers] = await Promise.all([
        pb.collection('transactions').getList(1, 1, {
          filter: `merchant = '${merchant.id}' && type = 'earn' && created >= '${dateRange.from}'`,
          fields: 'id',
        }),
        pb.collection('transactions').getList(1, 1, {
          filter: `merchant = '${merchant.id}' && type = 'redeem' && created >= '${dateRange.from}'`,
          fields: 'id',
        }),
        pb.collection('transactions').getList(1, 1, {
          filter: `merchant = '${merchant.id}' && created >= '${dateRange.from}'`,
          fields: 'user',
        }),
      ]);

      return {
        merchant,
        pointsIssued:    issued.totalItems,
        pointsRedeemed:  redeemed.totalItems,
        uniqueCustomers: customers.totalItems,
        redemptionRate:  issued.totalItems > 0
          ? (redeemed.totalItems / issued.totalItems * 100).toFixed(1) + '%'
          : '0%',
      };
    })
  );
};
```

---

## 3. Merchant Detail Analytics (`/merchants/:id/analytics`)

Per-merchant breakdown accessible from the merchant detail page:

| Chart / Metric | Description |
|---|---|
| **Daily Transactions** | Bar chart — earn vs redeem per day |
| **Unique Customers** | Line chart — daily unique customer visits |
| **Top Customers** | Table — top 10 customers by points earned here |
| **Stamp Card Completion Rate** | % of customers who completed stamp cards |
| **Active Campaigns** | List of running promotions |
| **Points Issued Total** | Cumulative lifetime total |
| **Churn Indicator** | Customers not seen in 30+ days |

---

## 4. Category Benchmarking

Compare merchant performance against category average:

```
Merchant: "Kopi Town"    (F&B category)
  Points Issued/Month:   1,200   ← above category avg of 850 ✅
  Unique Customers:      87      ← above category avg of 60  ✅
  Redemption Rate:       8%      ← below category avg of 12% ⚠️
```

---

## 5. Merchant Health Score

An automated score (0–100) surfaced on the merchant card:

| Dimension | Weight | Metric |
|---|---|---|
| Activity | 30% | Transactions in last 30d |
| Retention | 30% | Returning customers % |
| Redemption | 20% | Redemption rate |
| Engagement | 20% | Active campaigns |

---

## 6. Export

Merchant analytics can be exported per-merchant or as a bulk CSV of all merchant performance for the selected date range.

---

## 7. Related Documents

| Doc | Description |
|---|---|
| [21-platform-analytics.md](./21-platform-analytics.md) | Platform-level analytics |
| [09-merchant-onboarding.md](../05-merchant-management/09-merchant-onboarding.md) | Merchant management |
| [17-campaign-management.md](../09-campaigns-promotions/17-campaign-management.md) | Campaign performance per merchant |
