# 15 — Admin Portal: Rewards Management

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Rewards Catalog is the inventory of items customers can redeem their points for. Rewards can be merchant-specific (e.g., a free coffee at Merchant X) or platform-wide. Admins manage the full lifecycle: create, edit, pause, and retire rewards.

---

## 2. Reward Types

| Type | Description | Example |
|---|---|---|
| `free_item` | A free product at the merchant | Free coffee (100 pts) |
| `discount` | Percentage or fixed amount off | 10% off (200 pts) |
| `voucher` | Digital voucher code | RM5 voucher (500 pts) |
| `experience` | Exclusive event or experience | VIP dinner (5,000 pts) |

---

## 3. Rewards List Page (`/rewards`)

```typescript
const { tableProps } = useTable<Reward>({
  resource: 'rewards',
  meta: { expand: 'merchant' },
  sorters: { initial: [{ field: 'created', order: 'desc' }] },
});
```

**Table columns:** Reward Name, Merchant, Type, Points Cost, Stock, Status, Valid Until, Actions

---

## 4. Create Reward

```typescript
const { formProps, saveButtonProps } = useForm<Reward>({
  resource: 'rewards',
  action: 'create',
});

// Form fields:
// - title (text, required)
// - merchant (select → merchants, required)
// - type (select: free_item | discount | voucher | experience)
// - points_cost (number, min: 1)
// - stock (number | null — null = unlimited)
// - image (file upload)
// - valid_until (date picker | null)
// - description (textarea)
```

---

## 5. Edit Reward

Editing a reward affects **future redemptions only** — existing issued redemptions are unaffected.

Admins can change: title, description, points cost, stock, valid_until, status.

> ⚠️ Reducing `points_cost` on an active reward triggers a confirmation: "This may impact the platform liability. Confirm?"

---

## 6. Retire a Reward

Retiring a reward prevents new redemptions but does not invalidate existing redeemed vouchers:

```typescript
const retireReward = (rewardId: string) => {
  updateReward({
    resource: 'rewards',
    id: rewardId,
    values: { status: 'retired' },
  });
};
```

---

## 7. Stock Management

For limited-stock rewards, the admin can update stock count manually. The PocketBase hook will decrement stock on each redemption:

```typescript
// Decrement on redemption (in pb_hooks)
// onRecordAfterCreate -> redemptions collection
// Decrement rewards.stock by 1 if stock != null
```

Stock = 0 automatically sets reward availability to "out of stock" in the mobile app.

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [16-redemption-management.md](./16-redemption-management.md) | Redemption log and manual override |
| [13-membership-tiers.md](../07-loyalty-programs/13-membership-tiers.md) | Tier-based reward access |
| [17-campaign-management.md](../09-campaigns-promotions/17-campaign-management.md) | Linking rewards to campaigns |
