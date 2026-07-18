# 12 — Admin Portal: Points Adjustment

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Points Adjustment allows authorized admin staff to manually credit or debit points from a customer's account. This is used for customer support resolution, system error corrections, or promotional goodwill gestures. Every adjustment creates an auditable transaction record.

---

## 2. Who Can Adjust Points

| Role | Can Credit | Can Debit | Max per Operation |
|---|---|---|---|
| Super Admin | ✅ | ✅ | Unlimited |
| Operations Admin | ✅ | ✅ | 5,000 pts |
| Support Agent | ✅ | ✅ | 500 pts |
| Analyst | ❌ | ❌ | — |

---

## 3. Adjustment Form

The adjustment form is accessible from the **User Detail** page (`/users/:id`) via an "Adjust Points" button:

```typescript
interface PointsAdjustmentForm {
  user_id:   string;     // target customer
  type:      'credit' | 'debit';
  points:    number;     // absolute value (always positive)
  reason:    string;     // required — shown in audit log
  note:      string;     // internal admin note
}
```

---

## 4. Implementation

```typescript
const adjustPoints = async (form: PointsAdjustmentForm) => {
  const delta = form.type === 'credit' ? form.points : -form.points;

  // 1. Create transaction record
  await pb.collection('transactions').create({
    user:     form.user_id,
    merchant: null,              // admin adjustment has no merchant
    type:     'adjust',
    points:   delta,
    note:     `[ADMIN] ${form.reason}`,
    ref_id:   `ADJ-${Date.now()}`,
  });

  // 2. Update denormalized balance on user record
  const user = await pb.collection('users').getOne(form.user_id);
  await pb.collection('users').update(form.user_id, {
    total_points: user.total_points + delta,
  });

  // 3. Notify customer
  await pb.collection('notifications').create({
    recipient: form.user_id,
    title: delta > 0 ? '🎁 Points Added!' : '📉 Points Adjusted',
    body: `${Math.abs(delta)} points have been ${delta > 0 ? 'added to' : 'deducted from'} your account. Reason: ${form.reason}`,
    type: 'system',
  });
};
```

---

## 5. Audit Trail

Every adjustment is permanently recorded in the `transactions` collection with:
- `type: 'adjust'`
- `note: '[ADMIN] <reason>'`
- `ref_id: 'ADJ-<timestamp>'`

This ensures full accountability — every point change is traceable to a timestamp and implicitly to the admin session active at that time.

---

## 6. Validation Rules

| Rule | Constraint |
|---|---|
| Minimum adjustment | 1 point |
| Maximum debit | Cannot exceed user's current balance |
| Reason field | Required, minimum 10 characters |
| Debit guard | Confirm dialog: "This will deduct X points. Are you sure?" |

---

## 7. Adjustment History

The user detail page shows a filtered transaction history with `type = 'adjust'` to give support staff a quick view of all manual interventions on an account:

```typescript
const { tableProps } = useTable({
  resource: 'transactions',
  filters: {
    permanent: [
      { field: 'user',   operator: 'eq', value: userId },
      { field: 'type',   operator: 'eq', value: 'adjust' },
    ],
  },
  sorters: { initial: [{ field: 'created', order: 'desc' }] },
});
```

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [11-user-management.md](./11-user-management.md) | User detail page where adjustment is triggered |
| [19-transaction-ledger.md](../10-points-ledger/19-transaction-ledger.md) | Full transaction audit log |
| [05-user-role-permission.md](../03-security/05-user-role-permission.md) | Role-based adjustment limits |
