# 49 — Admin Portal: Analytics (Portal Observability)

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

This document covers **portal-level analytics** — tracking how admin staff use the Admin Portal itself (page views, feature usage, session lengths). This is distinct from [21-platform-analytics.md](../11-analytics-reporting/21-platform-analytics.md) which covers business/product analytics.

Portal analytics help the WALY team understand which features are most used, where admins spend time, and which workflows can be improved.

---

## 2. What is Tracked

| Event Category | Events |
|---|---|
| **Navigation** | Page views, time-on-page, navigation path |
| **Actions** | Approve merchant, adjust points, resolve flag, create campaign |
| **Search** | Global search queries, per-page filter usage |
| **Export** | CSV downloads (which resource, row count) |
| **Errors** | API errors encountered, form validation failures |
| **Performance** | Page load time, API response time |

---

## 3. Event Tracking Implementation (Phase 2: PostHog)

```typescript
// src/lib/analytics.ts
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
  autocapture: false,  // manual event tracking only
});

export const track = (event: string, properties?: Record<string, unknown>) => {
  if (import.meta.env.VITE_APP_ENV === 'production') {
    posthog.capture(event, properties);
  }
};
```

---

## 4. Key Events to Track

```typescript
// Merchant approval
track('merchant_approved', { merchant_id, merchant_name, admin_role });

// Fraud flag resolved
track('fraud_flag_resolved', { flag_id, resolution, severity });

// Points adjustment
track('points_adjusted', { user_id, amount, direction: 'credit' | 'debit' });

// Campaign created
track('campaign_created', { campaign_id, type, is_platform_wide });

// CSV export
track('csv_exported', { resource, row_count, filters_applied: !!activeFilters.length });

// Page view
track('page_viewed', { path: location.pathname, role: currentAdmin.role });
```

---

## 5. Session Analytics

Track admin session metrics:

```typescript
// On login
track('admin_session_started', { admin_id, role, hour_of_day: new Date().getHours() });

// On logout / session end
track('admin_session_ended', {
  admin_id,
  session_duration_minutes: Math.round((Date.now() - sessionStart) / 60000),
  pages_visited: pageCount,
  actions_taken: actionCount,
});
```

---

## 6. Dashboard for Portal Analytics (Phase 3)

A super-admin-only analytics page (`/analytics/portal`) showing:

| Chart | Metric |
|---|---|
| Daily Active Admins | Admin login count per day |
| Feature Usage Heatmap | Most-clicked pages/features |
| Top Admin Actions | Rank of admin action types |
| Average Session Duration | By admin role |
| Error Rate | API errors per session |

---

## 7. Privacy Considerations

Portal analytics only tracks admin staff behavior — not customer data. No customer PII is included in any analytics event payload.

---

## 8. Phase Plan

| Phase | Analytics Feature |
|---|---|
| Phase 1 | No analytics (dev only) |
| Phase 2 | PostHog event tracking for key admin actions |
| Phase 3 | Portal analytics dashboard for Super Admin |

---

## 9. Related Documents

| Doc | Description |
|---|---|
| [50-reporting.md](./50-reporting.md) | Scheduled reports and export specs |
| [21-platform-analytics.md](../11-analytics-reporting/21-platform-analytics.md) | Business/product analytics |
| [43-monitoring.md](../22-monitoring-logging/43-monitoring.md) | System health monitoring |
