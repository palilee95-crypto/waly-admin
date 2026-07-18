# 16 — Admin Portal: Redemption Management

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Redemption Management module provides admins with a full audit log of all reward redemptions, tools to review disputed redemptions, and the ability to manually void or refund redemptions when necessary.

---

## 2. Redemption Record Structure

```typescript
interface Redemption {
  id:         string;
  user:       string;        // → users.id
  reward:     string;        // → rewards.id
  merchant:   string;        // → merchants.id
  points_used: number;       // points deducted
  status:     'pending' | 'fulfilled' | 'voided' | 'refunded';
  redeemed_at: string;       // ISO datetime
  fulfilled_at: string | null;
  voucher_code: string | null; // for voucher-type rewards
  notes:      string;        // admin notes
}
```

---

## 3. Redemptions List Page (`/rewards/redemptions`)

```typescript
const { tableProps } = useTable<Redemption>({
  resource: 'redemptions',
  meta: { expand: 'user,reward,merchant' },
  sorters: { initial: [{ field: 'redeemed_at', order: 'desc' }] },
});
```

**Table columns:** Customer, Reward, Merchant, Points Used, Status, Redeemed At, Actions

---

## 4. Redemption Status Workflow

```
Customer redeems → status: "pending"
  │
  ├─► Merchant fulfils → status: "fulfilled"
  │
  ├─► Admin voids      → status: "voided" + points refunded
  │
  └─► Admin refunds    → status: "refunded" + points restored
```

---

## 5. Void Redemption

Used when a redemption was made in error (e.g., wrong reward, duplicate redemption):

```typescript
const voidRedemption = async (redemptionId: string, reason: string) => {
  const redemption = await pb.collection('redemptions').getOne(redemptionId, {
    expand: 'user',
  });

  // 1. Update redemption status
  await pb.collection('redemptions').update(redemptionId, {
    status: 'voided',
    notes: `[ADMIN VOID] ${reason}`,
  });

  // 2. Restore points to user
  const user = redemption.expand?.user;
  await pb.collection('users').update(user.id, {
    total_points: user.total_points + redemption.points_used,
  });

  // 3. Create reversal transaction
  await pb.collection('transactions').create({
    user: user.id,
    merchant: redemption.merchant,
    type: 'adjust',
    points: redemption.points_used,
    note: `[ADMIN VOID] Redemption ${redemptionId} reversed. ${reason}`,
  });
};
```

---

## 6. Refund Redemption

Used when a customer was given the reward but had an issue (double-charged, wrong item):

```typescript
const refundRedemption = async (redemptionId: string, reason: string) => {
  // Same as void but status = 'refunded'
  // Points are restored identically
};
```

---

## 7. Filters

| Filter | Options |
|---|---|
| Status | pending, fulfilled, voided, refunded |
| Date Range | From / To |
| Merchant | Select from merchant list |
| Points Range | Min / Max |

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [15-rewards-management.md](./15-rewards-management.md) | Reward catalog setup |
| [19-transaction-ledger.md](../10-points-ledger/19-transaction-ledger.md) | Transaction audit log |
| [12-points-adjustment.md](../06-user-management/12-points-adjustment.md) | Manual points operations |
