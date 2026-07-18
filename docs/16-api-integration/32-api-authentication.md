# 32 — Admin Portal: API Authentication

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

All Admin Portal API requests are authenticated using PocketBase superuser tokens. This document covers token acquisition, storage, refresh strategy, and how Refine's auth provider integrates with PocketBase's auth system.

---

## 2. Authentication Methods

| Method | Collection | Use Case |
|---|---|---|
| Superuser auth | `_superusers` | Full-access Super Admins (CTO, platform owner) |
| Admin user auth | `admin_users` | Scoped-role staff (operations, analyst, support) |

For simplicity in Phase 1, all portal staff authenticate via the `admin_users` collection with role-based access control applied in the frontend.

---

## 3. Token Flow

```
POST /api/collections/admin_users/auth-with-password
Body: { identity: "admin@waly.app", password: "..." }

Response:
{
  "token": "eyJhbGci...",
  "record": {
    "id": "abc123",
    "email": "admin@waly.app",
    "name": "Ahmad",
    "role": "operations"
  }
}
```

---

## 4. Token Storage

PocketBase JS SDK automatically stores the token in `localStorage` under the key `pocketbase_auth`.

```typescript
// After successful login:
pb.authStore.isValid  // true
pb.authStore.token    // "eyJhbGci..."
pb.authStore.model    // { id, email, name, role }
```

The token is automatically included in all subsequent API requests as a `Authorization: Bearer <token>` header by the PocketBase SDK.

---

## 5. Token Expiry & Refresh

| Setting | Value |
|---|---|
| Default expiry | 1 year (PocketBase admin_users default) |
| Auto-refresh | PocketBase SDK refreshes automatically 30s before expiry |
| Manual refresh | `pb.collection('admin_users').authRefresh()` |

```typescript
// Force refresh (e.g., after role change)
await pb.collection('admin_users').authRefresh();
```

---

## 6. Request Authentication

Every API request from the admin portal automatically includes the auth header:

```http
GET /api/collections/merchants/records
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

PocketBase collection rules validate the token:
```
// merchants collection — list rule
@request.auth.collectionName = 'admin_users' && @request.auth.is_active = true
```

---

## 7. Logout

```typescript
// authProvider.logout()
pb.authStore.clear();
// Removes token from localStorage
// All subsequent requests will be unauthenticated → 401 → redirect to /login
```

---

## 8. Session Security

| Concern | Mitigation |
|---|---|
| Token in localStorage | Acceptable for admin portals; protect with strict CSP |
| XSS attack | Sanitize all user inputs; no `dangerouslySetInnerHTML` |
| Expired token | Refine's `onError` handler detects 401 → triggers logout |
| Concurrent sessions | PocketBase allows multiple; no single-session enforcement in Phase 1 |

---

## 9. Related Documents

| Doc | Description |
|---|---|
| [06-authentication.md](../03-security/06-authentication.md) | Full auth flow and authProvider code |
| [05-user-role-permission.md](../03-security/05-user-role-permission.md) | Role-based access |
| [31-api-design.md](./31-api-design.md) | API query patterns |
