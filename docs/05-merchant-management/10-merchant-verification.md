# 10 — Admin Portal: Merchant Verification

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Merchant verification is the KYC (Know Your Customer) layer within the onboarding process. It ensures that businesses using the WALY platform are legitimate, properly categorized, and not impersonating other brands. Verification is managed by Operations Admins through the Admin Portal.

---

## 2. Verification vs. Approval

| Stage | What It Means |
|---|---|
| **Approval** | Admin reviews and approves merchant profile → `status: active` |
| **Verification** | Admin confirms business identity → `is_verified: true` |

Both happen simultaneously for most merchants. However, an admin can approve a merchant operationally while flagging verification as pending for documents (e.g., business registration).

---

## 3. Verification Status

| `is_verified` | `status` | Meaning |
|---|---|---|
| `false` | `pending` | Application submitted, not yet reviewed |
| `true` | `active` | Fully verified and operational |
| `false` | `active` | Conditionally approved, docs pending |
| `false` | `suspended` | Verification failed or revoked |

---

## 4. Verification Checklist

Admins must confirm the following before setting `is_verified: true`:

```
[ ] Business name matches owner's registration
[ ] Logo is authentic (not copyrighted/trademarked by another brand)
[ ] Business category is accurate
[ ] Phone number is reachable
[ ] No active fraud flags on owner's user account
[ ] Business registration number verified (if provided)
[ ] No duplicate merchant account for same business
```

---

## 5. Document Upload (Future)

For Phase 2, merchants will be able to upload verification documents (SSM certificate, business license):

```typescript
// Future: merchants collection extension
interface MerchantVerification {
  ssm_certificate: string;    // file reference
  business_license: string;   // file reference
  verification_notes: string; // admin notes
  verified_by: string;        // → admin_users.id
  verified_at: string;        // ISO datetime
}
```

---

## 6. Suspend & Reinstate

Suspension is used when a verified merchant violates platform terms:

```typescript
// Suspend a merchant
const suspendMerchant = (merchantId: string, reason: string) => {
  updateMerchant({
    resource: 'merchants',
    id: merchantId,
    values: {
      status: 'suspended',
      is_verified: false,
      metadata: { suspension_reason: reason, suspended_at: new Date().toISOString() },
    },
  });
};

// Reinstate a merchant
const reinstateMerchant = (merchantId: string) => {
  updateMerchant({
    resource: 'merchants',
    id: merchantId,
    values: { status: 'active', is_verified: true },
  });
};
```

---

## 7. Fraud Triggers on Verification

If a merchant is flagged by the fraud system, the verification badge is automatically revoked:

| Fraud Severity | Auto Action |
|---|---|
| `low` | Warning on merchant detail page |
| `medium` | Flag for admin re-review |
| `high` | Auto-suspend (`status: suspended`, `is_verified: false`) |

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [09-merchant-onboarding.md](./09-merchant-onboarding.md) | Onboarding workflow and approval flow |
| [23-fraud-flags.md](../12-fraud-prevention/23-fraud-flags.md) | Fraud detection triggers |
| [11-user-management.md](../06-user-management/11-user-management.md) | Owner account management |
