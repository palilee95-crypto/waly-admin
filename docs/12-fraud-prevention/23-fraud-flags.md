# 23 — Admin Portal: Fraud Flags

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Fraud Flags module is the admin's primary interface for reviewing, investigating, and resolving suspicious activity detected by WALY's automated fraud detection system. Every flag represents a triggered rule that requires human review.

---

## 2. Fraud Flag Structure

```typescript
interface FraudFlag {
  id:          string;
  user:        string;        // → users.id (flagged user)
  transaction: string;        // → transactions.id (trigger)
  rule:        string;        // rule name: "velocity_breach" | "anomaly" | etc.
  severity:    'low' | 'medium' | 'high';
  status:      'open' | 'reviewing' | 'resolved' | 'dismissed';
  notes:       string;        // admin review notes
  resolved_by: string | null; // → admin_users.id
  resolved_at: string | null;
  created:     string;
}
```

---

## 3. Fraud Queue Page (`/fraud`)

The fraud queue shows all open flags, sorted by severity then date:

```typescript
const { tableProps } = useTable<FraudFlag>({
  resource: 'fraud_flags',
  meta: { expand: 'user,transaction,transaction.merchant' },
  filters: {
    permanent: [{ field: 'status', operator: 'in', value: ['open', 'reviewing'] }],
  },
  sorters: {
    initial: [
      { field: 'severity', order: 'desc' },
      { field: 'created',  order: 'asc'  },
    ],
  },
});
```

**Table columns:**

| Column | Description |
|---|---|
| Severity | 🔴 High / 🟡 Medium / 🟢 Low badge |
| Customer | Name + masked phone |
| Rule Triggered | Velocity breach / Anomaly / etc. |
| Points Involved | From trigger transaction |
| Merchant | Merchant involved |
| Flagged At | Timestamp |
| Status | Open / Reviewing |
| Actions | [Review] [Dismiss] |

---

## 4. Flag Detail & Review Page (`/fraud/:id`)

```
Flag Detail
├── Flag Summary (rule, severity, created)
├── Trigger Transaction (points, type, timestamp)
├── Customer Profile (name, tier, total points, history)
├── Recent Transactions (last 10 for this user)
├── Velocity Chart (points earned per hour in last 24h)
├── Similar Flags (other flags for same user)
└── Review Actions
    ├── [Mark as Reviewing]
    ├── [Resolve — Legitimate]
    ├── [Resolve — Fraud Confirmed] → triggers suspension
    └── [Dismiss — False Positive]
```

---

## 5. Flag Resolution Actions

```typescript
const resolveFlag = async (
  flagId: string,
  resolution: 'legitimate' | 'confirmed_fraud' | 'false_positive',
  notes: string
) => {
  await pb.collection('fraud_flags').update(flagId, {
    status:      resolution === 'false_positive' ? 'dismissed' : 'resolved',
    notes,
    resolved_by: currentAdmin.id,
    resolved_at: new Date().toISOString(),
  });

  if (resolution === 'confirmed_fraud') {
    const flag = await pb.collection('fraud_flags').getOne(flagId);
    // Auto-suspend the user
    await pb.collection('users').update(flag.user, {
      status: 'suspended',
      metadata: { suspension_reason: `Fraud confirmed: ${notes}` },
    });
  }
};
```

---

## 6. Real-Time Flag Alerts

The fraud queue subscribes to SSE for real-time new flag notifications:

```typescript
// Refine liveProvider auto-subscribes when on the fraud page
// New flags appear instantly without page refresh
```

A red badge on the sidebar nav shows the count of open high-severity flags.

---

## 7. Related Documents

| Doc | Description |
|---|---|
| [24-velocity-rules.md](./24-velocity-rules.md) | Velocity rule configuration |
| [11-user-management.md](../06-user-management/11-user-management.md) | User suspension |
| [19-transaction-ledger.md](../10-points-ledger/19-transaction-ledger.md) | Transaction context |
