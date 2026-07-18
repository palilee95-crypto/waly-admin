# 37 — Admin Portal: Search Functionality

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Admin Portal provides both local table search (per-page) and a global search bar (across all resources). Search is powered by PocketBase's filter syntax and Refine's `useTable` hook.

---

## 2. Global Search (`/search`)

A global search bar in the top navigation searches across:
- **Users** — by name or phone
- **Merchants** — by name
- **Transactions** — by reference ID or note
- **Fraud Flags** — by user name

```typescript
const globalSearch = async (query: string) => {
  const [users, merchants, transactions] = await Promise.all([
    pb.collection('users').getList(1, 5, {
      filter: `name ~ '${query}' || phone ~ '${query}'`,
      fields: 'id,name,phone',
    }),
    pb.collection('merchants').getList(1, 5, {
      filter: `name ~ '${query}'`,
      fields: 'id,name,status',
    }),
    pb.collection('transactions').getList(1, 5, {
      filter: `ref_id ~ '${query}' || note ~ '${query}'`,
      fields: 'id,type,points,created',
    }),
  ]);

  return { users, merchants, transactions };
};
```

Results shown in a dropdown with grouped sections — click to navigate to the full detail page.

---

## 3. Per-Page Table Search

Each list page has its own search input that filters the current resource:

### Users Search
```typescript
const { tableProps, searchFormProps } = useTable<User>({
  resource: 'users',
  onSearch: (values) => [
    { field: 'name',  operator: 'contains', value: values.query },
    { field: 'phone', operator: 'contains', value: values.query },
  ],
});
```

### Merchants Search
```typescript
onSearch: (values) => [
  { field: 'name',     operator: 'contains', value: values.query },
  { field: 'category', operator: 'contains', value: values.query },
]
```

### Transactions Search
```typescript
onSearch: (values) => [
  { field: 'ref_id', operator: 'contains', value: values.query },
  { field: 'note',   operator: 'contains', value: values.query },
]
```

---

## 4. PocketBase Search Syntax

PocketBase uses a custom filter syntax for search:

| Operator | Meaning | Example |
|---|---|---|
| `~` | Contains (case-insensitive) | `name ~ 'ahmad'` |
| `=` | Exact match | `status = 'active'` |
| `!=` | Not equal | `type != 'expire'` |
| `>=` | Greater than or equal | `points >= 100` |
| `&&` | AND | `type='earn' && points >= 100` |
| `\|\|` | OR | `name~'ali' \|\| phone~'0123'` |

---

## 5. Keyboard Shortcut

Global search is triggered with `Ctrl+K` / `Cmd+K`:

```typescript
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openGlobalSearch();
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, []);
```

---

## 6. Related Documents

| Doc | Description |
|---|---|
| [38-filtering-sorting.md](./38-filtering-sorting.md) | Advanced filter and sort options |
| [31-api-design.md](../16-api-integration/31-api-design.md) | PocketBase filter syntax |
| [35-ui-pages.md](../18-page-structure/35-ui-pages.md) | Page-level search context |
