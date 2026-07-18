# 13 — Admin Portal: Membership Tiers

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

WALY's loyalty programme uses a 4-tier membership system (Bronze → Silver → Gold → Platinum). Admin staff can view and edit tier definitions — thresholds, multipliers, and benefits — through the Admin Portal. Changes to tier definitions affect all customers globally.

---

## 2. Tier Structure

| Tier | Min Points | Earn Multiplier | Benefits |
|---|---|---|---|
| **Bronze** | 0 | 1.0× | Base earn rate |
| **Silver** | 1,000 | 1.2× | Priority support, birthday bonus |
| **Gold** | 5,000 | 1.5× | Early campaign access, free monthly reward |
| **Platinum** | 15,000 | 2.0× | Dedicated account manager, VIP events |

---

## 3. Tier Qualification Rules

- Tier is calculated based on **lifetime accumulated points** (not current balance)
- Tier upgrades are instant when threshold is crossed
- Tier downgrades happen at the end of each **anniversary year** if lifetime points fall below threshold
- Admin can **manually override** a customer's tier via the User Detail page

---

## 4. Tier Management Page (`/loyalty/tiers`)

```typescript
// List all tiers — sorted by min_points ascending
const { tableProps } = useTable({
  resource: 'tiers',
  sorters: { initial: [{ field: 'sort_order', order: 'asc' }] },
});
```

**Tier Edit Form fields:**
- Tier Name (read-only — system value)
- Minimum Points Threshold
- Earn Multiplier (e.g. 1.5)
- Benefits (tag list)
- Badge Icon (file upload)

---

## 5. Tier Distribution Analytics

The tier management page shows a pie chart of current user distribution across tiers:

```typescript
// Count users per tier
const tierDistribution = await Promise.all(
  tiers.map(async (tier) => {
    const result = await pb.collection('users').getList(1, 1, {
      filter: `tier_id = '${tier.id}'`,
      fields: 'id',
    });
    return { tier: tier.name, count: result.totalItems };
  })
);
```

---

## 6. Manual Tier Override

Support Admins can override a customer's tier from the User Detail page:

```typescript
const overrideTier = (userId: string, tierId: string, reason: string) => {
  updateUser({
    resource: 'users',
    id: userId,
    values: {
      tier_id: tierId,
      metadata: { tier_override: true, tier_override_reason: reason },
    },
  });
};
```

---

## 7. Related Documents

| Doc | Description |
|---|---|
| [14-stamp-card-management.md](./14-stamp-card-management.md) | Stamp card templates |
| [11-user-management.md](../06-user-management/11-user-management.md) | User tier override |
| [21-platform-analytics.md](../11-analytics-reporting/21-platform-analytics.md) | Tier distribution report |
