# 05 — Admin Portal: User Roles & Permissions

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The WALY Admin Portal implements **Role-Based Access Control (RBAC)** to ensure admin staff only access features and data relevant to their function. Refine's `accessControlProvider` enforces permissions at both the UI level (hiding/disabling elements) and the route level (blocking unauthorized navigation).

---

## 2. Admin Roles

| Role | Who | Description |
|---|---|---|
| **Super Admin** | Platform Owner / CTO | Unrestricted access — all CRUD, settings, admin user management |
| **Operations Admin** | Ops Team Member | Merchant approval, user support, campaign management, fraud review |
| **Analyst** | Data / Marketing Team | Read-only analytics, report export — no write operations |
| **Support Agent** | Customer Support Staff | User lookup, points adjustment, voucher actions — no system config |

---

## 3. Permission Matrix

| Resource / Action | Super Admin | Operations Admin | Analyst | Support Agent |
|---|---|---|---|---|
| **Dashboard** (view) | ✅ | ✅ | ✅ | ✅ |
| **Merchants** — list/view | ✅ | ✅ | ✅ | ❌ |
| **Merchants** — approve/suspend | ✅ | ✅ | ❌ | ❌ |
| **Merchants** — delete | ✅ | ❌ | ❌ | ❌ |
| **Users** — list/view | ✅ | ✅ | ✅ | ✅ |
| **Users** — edit/suspend | ✅ | ✅ | ❌ | ✅ |
| **Users** — delete | ✅ | ❌ | ❌ | ❌ |
| **Points Adjustment** | ✅ | ✅ | ❌ | ✅ |
| **Campaigns** — list/view | ✅ | ✅ | ✅ | ❌ |
| **Campaigns** — create/edit | ✅ | ✅ | ❌ | ❌ |
| **Vouchers** — bulk issue/void | ✅ | ✅ | ❌ | ✅ |
| **Rewards** — create/edit/delete | ✅ | ✅ | ❌ | ❌ |
| **Fraud Flags** — view | ✅ | ✅ | ✅ | ❌ |
| **Fraud Flags** — resolve/dismiss | ✅ | ✅ | ❌ | ❌ |
| **Velocity Rules** — edit | ✅ | ❌ | ❌ | ❌ |
| **Analytics** — view | ✅ | ✅ | ✅ | ❌ |
| **Analytics** — export | ✅ | ✅ | ✅ | ❌ |
| **Notifications** — broadcast | ✅ | ✅ | ❌ | ❌ |
| **Tiers / Stamp Cards** — edit | ✅ | ✅ | ❌ | ❌ |
| **Badges / Challenges** — edit | ✅ | ✅ | ❌ | ❌ |
| **Admin Users** — CRUD | ✅ | ❌ | ❌ | ❌ |
| **System Settings** | ✅ | ❌ | ❌ | ❌ |

---

## 4. Role Storage

Admin roles are stored in the PocketBase `admins` (superuser) collection extended with a custom `role` field, OR in a separate `admin_users` collection for non-superuser staff accounts.

```typescript
// admin_users collection schema
{
  id: string,
  email: string,
  name: string,
  role: 'super_admin' | 'operations' | 'analyst' | 'support',
  is_active: boolean,
  created: string,
  updated: string,
}
```

---

## 5. Refine Access Control Provider

```typescript
// src/accessControlProvider.ts
import { AccessControlProvider } from '@refinedev/core';
import { pb } from './lib/pocketbase';

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    const adminUser = pb.authStore.model;
    const role = adminUser?.role ?? 'support';

    const permissions: Record<string, Record<string, string[]>> = {
      merchants: {
        list:   ['super_admin', 'operations', 'analyst'],
        show:   ['super_admin', 'operations', 'analyst'],
        create: ['super_admin', 'operations'],
        edit:   ['super_admin', 'operations'],
        delete: ['super_admin'],
      },
      users: {
        list:   ['super_admin', 'operations', 'analyst', 'support'],
        edit:   ['super_admin', 'operations', 'support'],
        delete: ['super_admin'],
      },
      // ...extend for all resources
    };

    const allowed = permissions[resource ?? '']?.[action]?.includes(role) ?? false;
    return { can: allowed };
  },
};
```

---

## 6. UI Enforcement

```tsx
// Hide delete button from non-super-admin
import { useCan } from '@refinedev/core';

const { data: canDelete } = useCan({ resource: 'merchants', action: 'delete' });

{canDelete?.can && (
  <Button danger onClick={handleDelete}>Delete Merchant</Button>
)}
```

---

## 7. Related Documents

| Doc | Description |
|---|---|
| [06-authentication.md](./06-authentication.md) | Login, session, token management |
| [28-admin-management.md](../14-backoffice/28-admin-management.md) | Admin user CRUD |
| [04-technology-stack.md](../02-system-architecture/04-technology-stack.md) | Refine accessControlProvider setup |
