# 40 — Admin Portal: Caching Strategy

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Admin Portal uses a multi-layer caching strategy to minimize API calls to PocketBase while ensuring admins see fresh, accurate data for critical operations. Caching is managed by TanStack Query (via Refine) on the frontend and Caddy on the network layer.

---

## 2. Caching Layers

```
Browser Request
  │
  ├─► [Layer 1] TanStack Query Cache (in-memory, per session)
  │   ├── HIT → return cached data (staleTime check)
  │   └── MISS → fetch from PocketBase
  │
  ├─► [Layer 2] Browser HTTP Cache (Cache-Control headers)
  │   └── Static assets only (JS, CSS, images)
  │
  └─► [Layer 3] PocketBase (source of truth)
```

---

## 3. TanStack Query Cache Configuration

| Resource | staleTime | cacheTime | Notes |
|---|---|---|---|
| KPI counts (users, merchants) | 30s | 5min | Refresh every 30s |
| Transaction ledger | 10s | 2min | High change rate |
| Fraud flags | 5s | 1min | Critical — near real-time |
| Analytics charts (30d) | 5min | 15min | Aggregated, slow-changing |
| Tier definitions | 10min | 30min | Rarely changes |
| Reward catalog | 2min | 10min | Changes with edits |
| Merchant list | 1min | 5min | Pending queue changes |

---

## 4. Per-Resource Cache Config

```typescript
// Override stale time per resource via Refine meta
const { data } = useList({
  resource: 'fraud_flags',
  queryOptions: {
    staleTime: 5 * 1000,    // 5 seconds
    cacheTime: 60 * 1000,   // 1 minute
  },
  filters: [{ field: 'status', operator: 'in', value: ['open', 'reviewing'] }],
});
```

---

## 5. Real-Time Invalidation (SSE)

For critical resources (fraud_flags, merchants pending), SSE events trigger immediate cache invalidation:

```typescript
// When a new fraud_flag arrives via SSE
pb.collection('fraud_flags').subscribe('*', (e) => {
  if (e.action === 'create' || e.action === 'update') {
    queryClient.invalidateQueries({ queryKey: ['fraud_flags'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
  }
});
```

---

## 6. Optimistic Updates

For admin actions (approve merchant, resolve flag), optimistic updates are applied:

```typescript
// Optimistically update UI before API call completes
const { mutate } = useUpdate({
  resource: 'merchants',
  mutationOptions: {
    onMutate: async ({ id, values }) => {
      await queryClient.cancelQueries({ queryKey: ['merchants', id] });
      const prev = queryClient.getQueryData(['merchants', id]);
      queryClient.setQueryData(['merchants', id], (old) => ({ ...old, ...values }));
      return { prev };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['merchants', context.id], context.prev);
    },
  },
});
```

---

## 7. Static Asset Caching (Caddy)

```caddy
# Caddyfile
admin.waly.app {
  root * /var/www/admin-portal/dist

  # Cache JS/CSS chunks for 1 year (content-hashed filenames)
  @static {
    path /assets/*
  }
  header @static Cache-Control "public, max-age=31536000, immutable"

  # HTML — no cache (always fresh)
  header /index.html Cache-Control "no-cache, no-store"

  file_server
  try_files {path} /index.html
}
```

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [39-performance-optimization.md](./39-performance-optimization.md) | Frontend performance strategies |
| [42-deployment-process.md](../21-devops/42-deployment-process.md) | Caddy and deploy setup |
| [43-monitoring.md](../22-monitoring-logging/43-monitoring.md) | Cache hit rate monitoring |
