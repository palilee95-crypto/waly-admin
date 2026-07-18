# 38 — Admin Portal: Filtering & Sorting

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Advanced filtering and sorting allow admins to drill down into large datasets efficiently. Refine's `useTable` hook manages filter state, syncs with URL query parameters, and passes filters to PocketBase automatically.

---

## 2. Filter Types

| Filter Type | Ant Design Component | Use Case |
|---|---|---|
| Text search | `<Input>` | Name, phone, note |
| Select (single) | `<Select>` | Status, role, type |
| Multi-select | `<Select mode="multiple">` | Transaction types, categories |
| Date range | `<DatePicker.RangePicker>` | Created, updated, expires |
| Number range | `<InputNumber>` min/max | Points, value |
| Toggle / Switch | `<Switch>` | is_active, admin-only |
| Tag filter | `<Tag>` clickable | Quick filter presets |

---

## 3. Filter Persistence (URL Sync)

Refine syncs filter state to URL query params with `syncWithLocation: true`:

```
/transactions?filter[type]=earn&filter[created][gte]=2026-06-01&sort=-created
```

This allows admins to bookmark or share filtered views.

---

## 4. Default Filters Per Page

| Page | Default Filter |
|---|---|
| Merchants | `status != 'rejected'` |
| Users | `metadata.deleted_at = null` |
| Transactions | Last 30 days |
| Fraud Flags | `status = 'open' OR status = 'reviewing'` |
| Vouchers | `status = 'active'` |

---

## 5. Quick Filter Presets

Pre-built filter buttons for common views:

**Transactions page:**
- [All] [Earn] [Redeem] [Adjust] [Expire]
- [Today] [Last 7 Days] [Last 30 Days]
- [Admin Adjustments Only]

**Merchants page:**
- [All] [Pending] [Active] [Suspended]

**Users page:**
- [All] [Active] [Suspended]
- [Bronze] [Silver] [Gold] [Platinum]

---

## 6. Sorting

All tables support single-column sort by clicking column headers:

| Resource | Default Sort | Available Sort Columns |
|---|---|---|
| Users | `created DESC` | name, total_points, created |
| Merchants | `created DESC` | name, status, created |
| Transactions | `created DESC` | points, type, created |
| Fraud Flags | severity DESC, created ASC | severity, created |
| Rewards | `created DESC` | points_cost, stock, created |

---

## 7. CSV Export with Active Filters

Exports always respect the current active filters:

```typescript
const { triggerExport } = useExport({
  resource:    'transactions',
  filters:     tableProps.filters, // passes active filters to export
  sorters:     tableProps.sorters,
  mapData:     exportMapper,
  filename:    `waly-export-${dayjs().format('YYYY-MM-DD')}`,
});
```

---

## 8. Refine Filter Operators Reference

| Refine Operator | PocketBase Filter |
|---|---|
| `eq` | `field = 'value'` |
| `ne` | `field != 'value'` |
| `contains` | `field ~ 'value'` |
| `gte` | `field >= 'value'` |
| `lte` | `field <= 'value'` |
| `in` | `field = 'a' \|\| field = 'b'` |
| `null` | `field = null` |

---

## 9. Related Documents

| Doc | Description |
|---|---|
| [37-search-functionality.md](./37-search-functionality.md) | Global and per-page search |
| [31-api-design.md](../16-api-integration/31-api-design.md) | PocketBase filter syntax |
| [49-analytics.md](../25-analytics-reporting/49-analytics.md) | Analytics event tracking |
