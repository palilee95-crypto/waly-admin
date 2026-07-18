# 18 — Admin Portal: Voucher & Coupon Admin

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Vouchers are single-use digital codes issued to customers as rewards, campaign prizes, or support goodwill gestures. Admins can bulk-issue vouchers, extend expiry dates, void individual vouchers, and view the full voucher ledger.

---

## 2. Voucher Structure

```typescript
interface Voucher {
  id:          string;
  user:        string;        // → users.id (issued to)
  merchant:    string | null; // null = platform-wide
  campaign:    string | null; // → campaigns.id (if campaign-issued)
  code:        string;        // unique alphanumeric code
  type:        'discount' | 'free_item' | 'cash';
  value:       number;        // discount % or cash amount (MYR)
  status:      'active' | 'used' | 'expired' | 'voided';
  issued_at:   string;        // ISO datetime
  expires_at:  string;        // ISO datetime
  used_at:     string | null;
}
```

---

## 3. Vouchers List Page (`/campaigns/vouchers`)

```typescript
const { tableProps } = useTable<Voucher>({
  resource: 'vouchers',
  meta: { expand: 'user,merchant,campaign' },
  sorters: { initial: [{ field: 'issued_at', order: 'desc' }] },
});
```

**Table columns:** Code, Customer, Merchant, Type, Value, Status, Issued, Expires, Actions

---

## 4. Bulk Issue Vouchers

Admins can issue vouchers to a segment of customers (e.g., all Silver+ tier users):

```typescript
interface BulkVoucherIssuance {
  user_filter: {
    tier?:       string;
    status?:     'active';
    min_points?: number;
  };
  voucher: {
    merchant:   string | null;
    type:       'discount' | 'free_item' | 'cash';
    value:      number;
    expires_at: string;
  };
}

const bulkIssueVouchers = async (form: BulkVoucherIssuance) => {
  // 1. Fetch matching users
  const users = await pb.collection('users').getFullList({
    filter: buildFilter(form.user_filter),
    fields: 'id',
  });

  // 2. Create voucher for each user
  await Promise.all(
    users.map((user) =>
      pb.collection('vouchers').create({
        user:       user.id,
        merchant:   form.voucher.merchant,
        code:       generateCode(),    // random 8-char alphanumeric
        type:       form.voucher.type,
        value:      form.voucher.value,
        status:     'active',
        issued_at:  new Date().toISOString(),
        expires_at: form.voucher.expires_at,
      })
    )
  );
};
```

---

## 5. Void Voucher

```typescript
const voidVoucher = (voucherId: string, reason: string) => {
  updateVoucher({
    resource: 'vouchers',
    id: voucherId,
    values: { status: 'voided', notes: `[ADMIN VOID] ${reason}` },
  });
};
```

---

## 6. Extend Expiry

Admins can extend voucher expiry for support cases:

```typescript
const extendVoucher = (voucherId: string, newExpiry: string) => {
  updateVoucher({
    resource: 'vouchers',
    id: voucherId,
    values: { expires_at: newExpiry },
  });
};
```

---

## 7. Voucher Filters

| Filter | Options |
|---|---|
| Status | active, used, expired, voided |
| Type | discount, free_item, cash |
| Expiry Date | Date range |
| Merchant | Select |
| Campaign | Select |

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [17-campaign-management.md](./17-campaign-management.md) | Campaign context for vouchers |
| [16-redemption-management.md](../08-rewards-catalog/16-redemption-management.md) | Redemption refund flow |
| [11-user-management.md](../06-user-management/11-user-management.md) | User-level voucher history |
