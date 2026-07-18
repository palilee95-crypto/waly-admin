# 14 — Admin Portal: Stamp Card Management

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Stamp cards are the core loyalty mechanic for merchants on WALY. Each merchant can have one or more stamp card templates. This document covers how admins can view, configure, and override stamp card templates from the Admin Portal.

---

## 2. Stamp Card Template Structure

```typescript
interface StampCard {
  id:           string;
  merchant:     string;       // → merchants.id
  name:         string;       // "Buy 10 Get 1 Free"
  total_stamps: number;       // required stamps for reward
  reward:       string;       // → rewards.id (what customer gets)
  valid_days:   number | null; // days before card expires (null = no expiry)
  is_active:    boolean;
  created:      string;
  updated:      string;
}
```

---

## 3. Admin Capabilities

| Action | Who | Notes |
|---|---|---|
| View all stamp cards | All admins | Filterable by merchant |
| Edit stamp card rules | Ops Admin, Super Admin | Affects future issuance only |
| Deactivate a stamp card | Ops Admin, Super Admin | Existing cards continue until completion |
| Override a customer's card progress | Support Agent, Ops Admin | Used for error correction |
| Delete a stamp card template | Super Admin only | Only if no active customer_cards reference it |

---

## 4. Stamp Cards List Page (`/loyalty/stamp-cards`)

```typescript
const { tableProps } = useTable({
  resource: 'stamp_cards',
  meta: { expand: 'merchant,reward' },
  filters: { initial: [{ field: 'is_active', operator: 'eq', value: true }] },
});
```

**Table columns:** Merchant, Card Name, Total Stamps, Reward, Valid Days, Status, Actions

---

## 5. Edit Stamp Card

> ⚠️ Editing `total_stamps` only affects **new** cards issued after the change. Existing in-progress customer cards retain their original stamp count.

```typescript
const { formProps } = useForm({
  resource: 'stamp_cards',
  action: 'edit',
  id: cardId,
});
```

---

## 6. Customer Card Override

When a customer reports incorrect stamp count (e.g., merchant forgot to stamp), an admin can manually adjust:

```typescript
// Increment stamp count on a customer_card
const adjustStamps = async (customerCardId: string, newStampCount: number) => {
  await pb.collection('customer_cards').update(customerCardId, {
    current_stamps: newStampCount,
    metadata: { admin_adjusted: true, adjusted_at: new Date().toISOString() },
  });
};
```

---

## 7. Related Documents

| Doc | Description |
|---|---|
| [13-membership-tiers.md](./13-membership-tiers.md) | Loyalty tier system |
| [15-rewards-management.md](../08-rewards-catalog/15-rewards-management.md) | Reward catalog for stamp card completion |
| [09-merchant-onboarding.md](../05-merchant-management/09-merchant-onboarding.md) | Merchant context |
