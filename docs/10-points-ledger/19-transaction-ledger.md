# 19 — Admin Portal: Transaction Ledger

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Transaction Ledger is the authoritative, immutable record of every points event on the WALY platform. Admins use it to audit point flows, investigate disputes, and verify system integrity. All transactions are append-only — no deletion is permitted.

---

## 2. Transaction Types

| Type | Direction | Description |
|---|---|---|
| `earn` | Credit (+) | Customer earned points at a merchant |
| `redeem` | Debit (−) | Customer redeemed points for a reward |
| `adjust` | Credit or Debit | Manual admin adjustment |
| `expire` | Debit (−) | Points expired due to inactivity |
| `bonus` | Credit (+) | Bonus points from campaign/gamification |

---

## 3. Transaction Ledger Page (`/ledger`)

```typescript
const { tableProps, searchFormProps } = useTable<Transaction>({
  resource: 'transactions',
  meta: { expand: 'user,merchant' },
  sorters: { initial: [{ field: 'created', order: 'desc' }] },
  pagination: { pageSize: 50 },
});
```

**Table columns:**

| Column | Description |
|---|---|
| ID | Short transaction ID (copyable) |
| Customer | Name + masked phone |
| Merchant | Merchant name (or "Admin" for adjustments) |
| Type | Badge: earn (green), redeem (orange), adjust (blue), expire (red) |
| Points | Signed delta: +100 / −50 |
| Balance After | Running balance (if available) |
| Note | Reference or admin note |
| Date | Timestamp with timezone |

---

## 4. Ledger Filters

| Filter | Type |
|---|---|
| Transaction Type | Multi-select: earn, redeem, adjust, expire, bonus |
| Date Range | From / To datetime picker |
| Customer | Search by name or phone |
| Merchant | Select from merchant list |
| Points Range | Min / Max (absolute value) |
| Admin Adjustments Only | Toggle — filters `type = 'adjust'` |

---

## 5. Transaction Detail

Clicking a transaction row expands a detail panel:

```
Transaction Detail
├── Transaction ID
├── Customer (link to User Detail)
├── Merchant (link to Merchant Detail)
├── Type + Points Delta
├── Running Balance at Time of Transaction
├── Note / Reference ID
├── Created At (precise timestamp)
└── Admin Notes (if adjustment)
```

---

## 6. CSV Export

```typescript
const { triggerExport, isLoading } = useExport<Transaction>({
  resource: 'transactions',
  filters: activeFilters,
  mapData: (item) => ({
    ID:        item.id,
    Customer:  item.expand?.user?.name,
    Phone:     item.expand?.user?.phone,
    Merchant:  item.expand?.merchant?.name ?? 'Admin',
    Type:      item.type,
    Points:    item.points,
    Note:      item.note,
    Date:      item.created,
  }),
  filename: `waly-ledger-${dayjs().format('YYYY-MM-DD')}`,
});
```

---

## 7. Immutability Policy

> ⛔ Transactions are **never modified or deleted** once created. Corrections are made via a new `adjust` transaction that offsets the error. This preserves the complete audit trail.

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [20-liability-monitoring.md](./20-liability-monitoring.md) | Points liability snapshot analysis |
| [12-points-adjustment.md](../06-user-management/12-points-adjustment.md) | How admin adjustments are created |
| [23-fraud-flags.md](../12-fraud-prevention/23-fraud-flags.md) | Fraud detection from transaction patterns |
