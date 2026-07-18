# 39 — Admin Portal: Performance Optimization

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Admin Portal is a data-intensive SPA. Performance optimization ensures the dashboard loads fast, tables render smoothly, and chart queries don't block the UI — even with large PocketBase datasets.

---

## 2. Core Web Vitals Targets

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID / INP (Interaction to Next Paint) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| Dashboard initial load | < 2s on 4G |

---

## 3. Code Splitting & Lazy Loading

All page components are lazy-loaded using React's `lazy()` and `Suspense`:

```typescript
// Lazy-loaded pages
const DashboardPage     = lazy(() => import('./pages/dashboard'));
const MerchantList      = lazy(() => import('./pages/merchants/list'));
const FraudFlagList     = lazy(() => import('./pages/fraud/list'));
const PlatformAnalytics = lazy(() => import('./pages/analytics/platform'));

// Wrap routes in Suspense
<Suspense fallback={<PageLoader />}>
  <Routes>...</Routes>
</Suspense>
```

This ensures only the currently needed page bundle is loaded.

---

## 4. TanStack Query Caching

Refine uses TanStack Query internally. Configure stale times to reduce redundant API calls:

```typescript
// src/App.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:     60 * 1000,    // 1 minute — data fresh for 1 min
      cacheTime:     5 * 60 * 1000, // 5 minutes — keep in memory
      refetchOnWindowFocus: false,  // don't refetch on tab switch
      retry:         1,             // retry once on failure
    },
  },
});

<QueryClientProvider client={queryClient}>
  <Refine ...>
```

---

## 5. Dashboard KPI Optimization

Dashboard KPI cards use `useList` with `fields` selector to fetch only count metadata:

```typescript
// Fetch only totalItems — no record data transferred
const { data: userCount } = useList({
  resource: 'users',
  pagination: { pageSize: 1 },
  meta: { fields: 'id' },
});
// userCount?.total = totalItems
```

---

## 6. Virtual Scrolling (Large Tables)

For the transaction ledger (potentially millions of rows), use Ant Design Table with virtual scrolling:

```tsx
<Table
  {...tableProps}
  virtual
  scroll={{ y: 600 }}
  rowKey="id"
/>
```

Combined with server-side pagination (page size 50), this keeps DOM size manageable.

---

## 7. Chart Performance

Analytics charts can be expensive to render. Optimizations:

- **Memoize chart data** with `useMemo` to prevent re-renders on unrelated state changes
- **Throttle SSE updates** — don't re-render charts more than once per 30 seconds
- **Use `ResponsiveContainer`** from Recharts to avoid layout thrashing

```typescript
const chartData = useMemo(() => buildChartData(rawTransactions), [rawTransactions]);
```

---

## 8. Bundle Size

```bash
# Target bundle sizes
Main bundle:     < 300kb (gzipped)
Vendor chunk:    < 500kb (gzipped) — antd, recharts, refine
Per-page chunks: < 50kb each
```

Vite automatically code-splits by route with `import()`. Run `npm run build -- --report` to analyze bundle.

---

## 9. Related Documents

| Doc | Description |
|---|---|
| [40-caching-strategy.md](./40-caching-strategy.md) | API response caching |
| [42-deployment-process.md](../21-devops/42-deployment-process.md) | Build and CDN setup |
| [43-monitoring.md](../22-monitoring-logging/43-monitoring.md) | Performance monitoring |
