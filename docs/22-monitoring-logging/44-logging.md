# 44 — Admin Portal: Logging

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Logging in the WALY Admin Portal covers three layers: PocketBase request logs, Caddy access logs, and admin action audit logs. Together they provide a complete trail for debugging, compliance, and security review.

---

## 2. Log Layers

| Layer | What is Logged | Format | Storage |
|---|---|---|---|
| **Caddy Access Log** | HTTP requests to admin.waly.app | JSON | `/var/log/caddy/admin.waly.app.log` |
| **PocketBase Logs** | API requests, auth events, hook errors | JSON | `pb_data/logs/` + PocketBase Admin UI |
| **Admin Audit Log** | Admin user actions (approve, suspend, adjust) | JSON | `admin_audit_logs` PocketBase collection |
| **Browser Console** | Dev-mode debug, Sentry errors (prod) | Text / JSON | Browser / Sentry |

---

## 3. Caddy Access Log Format

```json
{
  "level": "info",
  "ts": "2026-07-01T11:00:00.000Z",
  "logger": "http.log.access",
  "msg": "handled request",
  "request": {
    "method": "GET",
    "host": "admin.waly.app",
    "uri": "/dashboard",
    "remote_ip": "203.0.113.1",
    "user_agent": "Mozilla/5.0..."
  },
  "status": 200,
  "latency": 0.045
}
```

---

## 4. PocketBase Log Viewer

PocketBase provides a built-in log viewer in the Admin UI (`/_/logs`):

- **Request logs**: every API call with method, path, status, duration
- **Auth logs**: login/logout events with IP and user
- **Hook logs**: pb_hooks execution output and errors

Access: `https://api.waly.app/_/` → Logs section.

---

## 5. Admin Audit Log Collection

```typescript
interface AdminAuditLog {
  id:          string;
  admin_id:    string;        // → admin_users.id
  admin_name:  string;        // denormalized for readability
  action:      string;        // "merchant.approve" | "user.suspend" | "points.adjust" | etc.
  resource:    string;        // collection name
  resource_id: string;        // affected record ID
  before:      object | null; // state before change
  after:       object | null; // state after change
  ip_address:  string;
  user_agent:  string;
  created:     string;        // ISO timestamp
}
```

### 5.1 Audit Log Actions

| Action Code | Triggered By |
|---|---|
| `merchant.approve` | Admin clicks Approve |
| `merchant.reject` | Admin clicks Reject |
| `merchant.suspend` | Admin suspends merchant |
| `user.suspend` | Admin suspends user |
| `user.reinstate` | Admin reinstates user |
| `points.adjust` | Admin adjusts user points |
| `fraud.resolve` | Admin resolves fraud flag |
| `fraud.dismiss` | Admin dismisses fraud flag |
| `campaign.create` | Admin creates campaign |
| `voucher.void` | Admin voids voucher |
| `admin_user.create` | Super admin creates admin user |
| `admin_user.role_change` | Super admin changes role |

---

## 6. Audit Log Writer

```typescript
// src/lib/auditLog.ts
export const writeAuditLog = async (
  action: string,
  resource: string,
  resourceId: string,
  before: object | null,
  after: object | null,
) => {
  const admin = pb.authStore.model;
  await pb.collection('admin_audit_logs').create({
    admin_id:    admin?.id,
    admin_name:  admin?.name ?? admin?.email,
    action,
    resource,
    resource_id: resourceId,
    before:      before ?? {},
    after:       after ?? {},
    ip_address:  'client',      // IP captured server-side via PocketBase hook
    user_agent:  navigator.userAgent,
  });
};
```

---

## 7. Log Retention Policy

| Log Type | Retention |
|---|---|
| Caddy access logs | 90 days (rotate + compress) |
| PocketBase request logs | 30 days |
| Admin audit logs | 2 years (compliance) |
| Browser console / Sentry errors | 30 days |

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [43-monitoring.md](./43-monitoring.md) | Uptime and health monitoring |
| [28-admin-management.md](../14-backoffice/28-admin-management.md) | Admin audit log UI |
| [06-authentication.md](../03-security/06-authentication.md) | Auth events logged |
