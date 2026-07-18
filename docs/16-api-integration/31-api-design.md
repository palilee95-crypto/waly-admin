# 31 — Admin Portal: API Design

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Admin Portal communicates exclusively with PocketBase's REST API using the `@refinedev/pocketbase` data provider. This document describes the key API patterns, query conventions, and PocketBase-specific idioms used throughout the portal.

---

## 2. Base URL

```
Production:  https://api.waly.app
Development: http://localhost:8090
```

Configured via `VITE_POCKETBASE_URL` environment variable.

---

## 3. REST API Structure

| Operation | Method | Endpoint |
|---|---|---|
| List records | `GET` | `/api/collections/{name}/records` |
| Get one record | `GET` | `/api/collections/{name}/records/{id}` |
| Create record | `POST` | `/api/collections/{name}/records` |
| Update record | `PATCH` | `/api/collections/{name}/records/{id}` |
| Delete record | `DELETE` | `/api/collections/{name}/records/{id}` |

---

## 4. Query Parameters

### 4.1 Filtering
```
GET /api/collections/merchants/records?filter=(status='pending')
GET /api/collections/transactions/records?filter=(type='earn'&&created>='2026-06-01 00:00:00')
```

### 4.2 Sorting
```
GET /api/collections/merchants/records?sort=-created,name
// - prefix = descending
```

### 4.3 Pagination
```
GET /api/collections/users/records?page=1&perPage=30
```

### 4.4 Relation Expansion
```
GET /api/collections/merchants/records?expand=owner
GET /api/collections/fraud_flags/records?expand=user,transaction,transaction.merchant
```

### 4.5 Field Selection (Performance)
```
GET /api/collections/users/records?fields=id,name,phone,total_points
```

---

## 5. Refine Data Provider Mapping

| Refine Operation | PocketBase Call |
|---|---|
| `useList({ resource, filters, sorters, pagination })` | `GET /api/collections/{resource}/records?filter=...&sort=...&page=...` |
| `useOne({ resource, id })` | `GET /api/collections/{resource}/records/{id}` |
| `useCreate({ resource, values })` | `POST /api/collections/{resource}/records` |
| `useUpdate({ resource, id, values })` | `PATCH /api/collections/{resource}/records/{id}` |
| `useDelete({ resource, id })` | `DELETE /api/collections/{resource}/records/{id}` |

---

## 6. Common Admin API Queries

### 6.1 Platform Summary
```typescript
const [users, merchants, openFlags, pendingMerchants] = await Promise.all([
  pb.collection('users').getList(1, 1, { fields: 'id' }),
  pb.collection('merchants').getList(1, 1, { filter: `status='active'`, fields: 'id' }),
  pb.collection('fraud_flags').getList(1, 1, { filter: `status='open'`, fields: 'id' }),
  pb.collection('merchants').getList(1, 1, { filter: `status='pending'`, fields: 'id' }),
]);
```

### 6.2 Points Flow (30 days)
```typescript
const earnTxns = await pb.collection('transactions').getFullList({
  filter: `type='earn' && created >= '${thirtyDaysAgo}'`,
  fields: 'points,created',
  sort:   'created',
});
```

### 6.3 Real-time Subscription (SSE)
```typescript
// Subscribe to new fraud flags
pb.collection('fraud_flags').subscribe('*', (e) => {
  if (e.action === 'create') {
    showNotification({ type: 'warning', message: 'New fraud flag' });
    refetch(); // Refine query invalidation
  }
});
```

---

## 7. Related Documents

| Doc | Description |
|---|---|
| [32-api-authentication.md](./32-api-authentication.md) | Auth token strategy |
| [04-technology-stack.md](../02-system-architecture/04-technology-stack.md) | Refine data provider setup |
| [08-database-schema.md](../04-database/08-database-schema.md) | Collection schemas |
