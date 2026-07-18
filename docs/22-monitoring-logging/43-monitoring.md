# 43 — Admin Portal: Monitoring

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Monitoring covers the health of both the Admin Portal SPA and the underlying PocketBase backend it depends on. This includes uptime checks, PocketBase metrics, error alerting, and dashboard health indicators.

---

## 2. Monitoring Stack

| Tool | Purpose | Where |
|---|---|---|
| **Uptime Robot** (free) | HTTP uptime checks every 5 min | External SaaS |
| **PocketBase logs** | Request + error logs | Server `/var/log/` |
| **Caddy access logs** | HTTP request logs for admin portal | `/var/log/caddy/` |
| **Admin Portal dashboard** | Real-time health KPI cards | In-app |
| **Sentry** (Phase 2) | Frontend error tracking | External SaaS |

---

## 3. Uptime Monitoring

Configure Uptime Robot to monitor:

| Monitor | URL | Alert on |
|---|---|---|
| PocketBase API | `https://api.waly.app/api/health` | > 2 failed checks |
| Admin Portal | `https://admin.waly.app` | > 2 failed checks |

Alert channels: Email to `ops@waly.app` + WhatsApp (via Evolution API).

---

## 4. PocketBase Health Endpoint

```
GET https://api.waly.app/api/health

Response:
{
  "code": 200,
  "message": "API is healthy."
}
```

This can be polled from the Admin Portal dashboard to show a live "API Status" indicator:

```typescript
const { data: health, isError } = useQuery({
  queryKey: ['api-health'],
  queryFn: () => fetch(`${PB_URL}/api/health`).then(r => r.json()),
  refetchInterval: 30_000,  // check every 30 seconds
  staleTime: 0,
});
```

---

## 5. Dashboard Health Indicators

The Admin Dashboard header shows:

```
🟢 API Connected   🟢 Database OK   ⚡ 45ms latency
```

| Indicator | Source | Status Logic |
|---|---|---|
| API Status | `/api/health` ping | 🟢 200 / 🔴 error |
| Database | PocketBase returns records | 🟢 success / 🔴 query error |
| Latency | Time to first byte (TTFB) | 🟢 <100ms / 🟡 <500ms / 🔴 >500ms |

---

## 6. PocketBase Metrics to Monitor

| Metric | How to Track |
|---|---|
| Request rate | Caddy access log `tail -f` or log aggregation |
| Error rate | PocketBase logs: `level=error` entries |
| Database file size | `du -sh pb_data/data.db` (cron alert if > 2GB) |
| Active connections | PocketBase SSE subscription count |

---

## 7. Alerting Rules

| Event | Alert Channel | Severity |
|---|---|---|
| API health check fails | Email + WhatsApp | Critical |
| Database file > 2GB | Email | Warning |
| Error rate > 5% in 5min | Email | Warning |
| New HIGH severity fraud flag | Admin portal notification | Info |
| Liability exceeds threshold | Admin portal banner | Warning |

---

## 8. Frontend Error Monitoring (Phase 2: Sentry)

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 0.1,
  integrations: [Sentry.reactRouterV6BrowserTracingIntegration()],
});
```

---

## 9. Related Documents

| Doc | Description |
|---|---|
| [44-logging.md](./44-logging.md) | Request and audit log details |
| [42-deployment-process.md](../21-devops/42-deployment-process.md) | Caddy log configuration |
| [27-admin-dashboard.md](../14-backoffice/27-admin-dashboard.md) | Dashboard health indicator placement |
