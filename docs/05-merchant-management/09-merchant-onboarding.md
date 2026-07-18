# 09 — Admin Portal: Merchant Onboarding

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Merchant onboarding is the process by which a business owner submits their merchant profile in the WALY mobile app and awaits approval from the WALY operations team via the Admin Portal. This document covers the full onboarding lifecycle from submission to active status.

---

## 2. Onboarding Lifecycle

```
Merchant Owner (Mobile App)
  │
  ▼
Submits merchant profile → status: "pending"
  │
  ▼
Admin Portal — Pending Queue (05-merchant-management page)
  │
  ├─► Admin reviews profile details
  │
  ├─► [APPROVE] → status: "active", is_verified: true
  │              → Notification sent to merchant owner
  │
  └─► [REJECT]  → status: "rejected", rejection_reason saved
                 → Notification sent with reason
```

---

## 3. Merchant Status Lifecycle

| Status | Description | Transitions |
|---|---|---|
| `pending` | Submitted, awaiting admin review | → `active` or `rejected` |
| `active` | Approved and operating | → `suspended` |
| `rejected` | Application rejected | → `pending` (can reapply) |
| `suspended` | Temporarily disabled by admin | → `active` |

---

## 4. Pending Merchant Queue (Admin Portal)

The `/merchants?status=pending` page shows all merchants awaiting approval in a sortable table:

```typescript
// Refine hook for pending merchants
const { tableProps } = useTable({
  resource: 'merchants',
  filters: {
    permanent: [{ field: 'status', operator: 'eq', value: 'pending' }],
  },
  sorters: { initial: [{ field: 'created', order: 'asc' }] },
  meta: { expand: 'owner' },
});
```

**Table columns:**
- Business Name
- Owner Name + Phone
- Category
- Submitted Date
- Actions: [View Details] [Approve] [Reject]

---

## 5. Approve Merchant

```typescript
const { mutate: updateMerchant } = useUpdate();

const approveMerchant = (merchantId: string, ownerId: string) => {
  updateMerchant({
    resource: 'merchants',
    id: merchantId,
    values: { status: 'active', is_verified: true },
  });

  // Send notification to merchant owner
  pb.collection('notifications').create({
    recipient: ownerId,
    title: '🎉 Merchant Approved!',
    body: 'Your merchant has been verified. You can now start using WALY.',
    type: 'system',
  });
};
```

---

## 6. Reject Merchant

A rejection requires a reason, shown to the merchant in their notification:

```typescript
const rejectMerchant = (merchantId: string, ownerId: string, reason: string) => {
  updateMerchant({
    resource: 'merchants',
    id: merchantId,
    values: {
      status: 'rejected',
      metadata: { rejection_reason: reason },
    },
  });

  pb.collection('notifications').create({
    recipient: ownerId,
    title: '❌ Application Not Approved',
    body: `Reason: ${reason}. Please update your profile and reapply.`,
    type: 'system',
  });
};
```

---

## 7. Onboarding Checklist (What Admin Reviews)

| Check | Field |
|---|---|
| Business name is real and complete | `merchants.name` |
| Logo uploaded and appropriate | `merchants.logo` |
| Business category is correct | `merchants.category` |
| Owner account is phone-verified | `users.phone` (via expand) |
| No duplicate merchant for same owner | Query merchants by owner |
| Business registration number (optional) | `merchants.metadata.business_reg` |

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [10-merchant-verification.md](./10-merchant-verification.md) | KYC and document verification steps |
| [25-notification-management.md](../13-notification-system/25-notification-management.md) | Notification system overview |
| [27-admin-dashboard.md](../14-backoffice/27-admin-dashboard.md) | Pending approvals KPI card |
