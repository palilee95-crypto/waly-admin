# 28 — Admin Portal: Admin Management

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Admin Management allows Super Admins to create, edit, and deactivate admin portal user accounts. It also provides an audit log of admin actions for accountability and compliance.

---

## 2. Admin Users Page (`/admin-users`)

> ⚠️ Only Super Admins can access this page. Other roles see a 403 screen.

```typescript
const { tableProps } = useTable<AdminUser>({
  resource: 'admin_users',
  sorters: { initial: [{ field: 'created', order: 'desc' }] },
});
```

**Table columns:** Name, Email, Role, Status, Last Login, Created, Actions

---

## 3. Admin User Roles

| Role | Code | Access Level |
|---|---|---|
| Super Admin | `super_admin` | Unrestricted |
| Operations Admin | `operations` | Merchant, User, Campaign, Fraud |
| Analyst | `analyst` | Read-only analytics and reports |
| Support Agent | `support` | User lookup, points adjust, vouchers |

---

## 4. Create Admin User

```typescript
interface CreateAdminUserForm {
  name:     string;
  email:    string;
  password: string;
  role:     'super_admin' | 'operations' | 'analyst' | 'support';
}

// Uses PocketBase auth collection admin_users
const { formProps } = useForm<AdminUser>({
  resource: 'admin_users',
  action: 'create',
});
```

On creation, an automated welcome email is sent with a temporary password and a link to set a new password.

---

## 5. Edit Admin User

Super Admins can update:
- Display name
- Role assignment
- Active status (deactivate without deleting)

Deactivated admins cannot log in but their audit trail is preserved.

---

## 6. Admin Audit Log

Every significant admin action is logged for compliance:

```typescript
interface AdminAuditLog {
  id:          string;
  admin:       string;       // → admin_users.id
  action:      string;       // "approve_merchant" | "suspend_user" | etc.
  resource:    string;       // collection name
  resource_id: string;       // record ID affected
  before:      object;       // state before change
  after:        object;       // state after change
  ip_address:  string;
  created:     string;
}
```

Audit logs are **append-only** and cannot be deleted by any admin role.

---

## 7. Password Reset

Super Admins can trigger a password reset email for any admin user:

```typescript
const resetAdminPassword = async (email: string) => {
  await pb.collection('admin_users').requestPasswordReset(email);
};
```

---

## 8. Last Login Tracking

On each successful `authProvider.login()`, update the admin's last_login field:

```typescript
// In authProvider.login()
await pb.collection('admin_users').update(model.id, {
  last_login: new Date().toISOString(),
});
```

---

## 9. Related Documents

| Doc | Description |
|---|---|
| [05-user-role-permission.md](../03-security/05-user-role-permission.md) | Full permission matrix |
| [06-authentication.md](../03-security/06-authentication.md) | Login and session management |
| [44-logging.md](../22-monitoring-logging/44-logging.md) | System audit log |
