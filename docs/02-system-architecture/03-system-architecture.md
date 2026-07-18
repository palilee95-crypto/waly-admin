# 03 — Admin Portal: System Architecture

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The WALY Admin Portal is a **client-side Single Page Application (SPA)** built with Refine + Vite. It communicates exclusively with the existing PocketBase backend instance that also powers the mobile `web-app`. There is no separate backend for the admin portal — all data access goes through PocketBase's REST and SSE APIs.

---

## 2. High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                   WALY Admin Portal                      │
│           https://admin.waly.app (Browser SPA)           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Refine Framework Layer                            │  │
│  │  - useList / useOne / useCreate / useUpdate hooks  │  │
│  │  - authProvider (superuser login/logout)           │  │
│  │  - accessControlProvider (RBAC)                   │  │
│  │  - notificationProvider (Ant Design toasts)        │  │
│  └───────────────────┬────────────────────────────────┘  │
│                      │                                   │
│  ┌───────────────────▼────────────────────────────────┐  │
│  │  @refinedev/pocketbase (Data Provider)             │  │
│  │  - Maps Refine CRUD ops → PocketBase REST calls    │  │
│  │  - Handles pagination, filtering, sorting          │  │
│  │  - Subscribes to SSE for real-time updates         │  │
│  └───────────────────┬────────────────────────────────┘  │
│                      │ HTTPS + SSE                       │
└──────────────────────┼───────────────────────────────────┘
                       │
         ┌─────────────▼──────────────┐
         │   PocketBase v0.39.5       │
         │   https://api.waly.app     │
         │                            │
         │  ┌──────────────────────┐  │
         │  │  REST API (/api/)    │  │
         │  │  SSE (/api/realtime) │  │
         │  │  Superuser (/admins) │  │
         │  └──────────────────────┘  │
         │                            │
         │  ┌──────────────────────┐  │
         │  │  SQLite Database     │  │
         │  │  (pb_data/)          │  │
         │  └──────────────────────┘  │
         └────────────────────────────┘
                       │
         Also used by: Expo web-app (mobile)
```

---

## 3. Request Flow

### 3.1 Standard CRUD Request
```
Admin User Action
  → Refine hook (e.g. useList("merchants"))
  → @refinedev/pocketbase buildUrl()
  → PocketBase REST GET /api/collections/merchants/records
  → PocketBase validates superuser token
  → Returns JSON records
  → Refine TanStack Query caches response
  → Ant Design Table renders data
```

### 3.2 Real-Time Update (SSE)
```
Admin views fraud flags page
  → Refine liveProvider subscribes to SSE
  → PocketBase /api/realtime channel: fraud_flags
  → New fraud_flag record created (by web-app)
  → SSE event pushed to admin portal
  → Refine invalidates query cache
  → Table auto-refreshes with new flag
```

### 3.3 Authentication Flow
```
Admin navigates to admin.waly.app
  → Refine authProvider.check() runs
  → No valid token → redirect to /login
  → Admin enters email + password
  → authProvider.login() calls pb.admins.authWithPassword()
  → PocketBase returns superuser token
  → Token stored in localStorage (pb_auth)
  → Redirect to /dashboard
```

---

## 4. Deployment Architecture

```
Internet
  │
  ▼
Caddy (Reverse Proxy) — https://admin.waly.app
  │
  ├─► Serve admin-portal/dist/ (static SPA)
  │
  └─► Proxy /api/* → PocketBase (localhost:8090)
```

Both the admin portal (static files) and PocketBase can run on the same server behind Caddy.

---

## 5. Data Isolation & Security

| Concern | Approach |
|---|---|
| Admin-only collections | PocketBase API rules: `@request.auth.collectionName = '_superusers'` |
| User data access | Superuser token bypasses all collection-level rules |
| HTTPS enforcement | Caddy auto-provisions TLS via Let's Encrypt |
| Token expiry | PocketBase superuser tokens expire; authProvider handles refresh |
| CORS | PocketBase configured to only allow `admin.waly.app` origin |

---

## 6. Related Documents

| Doc | Description |
|---|---|
| [04-technology-stack.md](./04-technology-stack.md) | Full dependency list and versions |
| [06-authentication.md](../03-security/06-authentication.md) | Auth flow detail |
| [42-deployment-process.md](../21-devops/42-deployment-process.md) | Caddy config and deploy steps |
| [31-api-design.md](../16-api-integration/31-api-design.md) | PocketBase API patterns |
