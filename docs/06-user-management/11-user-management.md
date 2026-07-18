# 11 — Admin Portal: User Management

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The User Management module provides admin staff with tools to search, view, edit, and manage WALY customer accounts. It is accessible by Operations Admins and Support Agents, with write permissions varying by role.

---

## 2. User List Page (`/users`)

The user list uses Refine's `useTable` with server-side pagination and filtering:

```typescript
const { tableProps, searchFormProps } = useTable<User>({
  resource: 'users',
  onSearch: (values) => [
    { field: 'name',  operator: 'contains', value: values.name },
    { field: 'phone', operator: 'contains', value: values.phone },
  ],
  sorters: { initial: [{ field: 'created', order: 'desc' }] },
  meta: { expand: 'tier_id' },
});
```

**Table columns:**
| Column | Description |
|---|---|
| Name | Customer display name |
| Phone | Masked: `+601****6789` |
| Role | `customer` / `merchant` / `both` |
| Tier | Bronze / Silver / Gold / Platinum badge |
| Total Points | Current balance |
| Status | Active / Suspended badge |
| Joined | Registration date |
| Actions | [View] [Edit] [Suspend] |

---

## 3. User Detail Page (`/users/:id`)

Shows full profile with expandable sections:

```
User Detail
├── Profile Info (name, phone, role, tier, avatar)
├── Points Balance (current + 30-day chart)
├── Transaction History (last 20)
├── Active Stamp Cards
├── Redeemed Vouchers
├── Fraud Flags (if any)
└── Admin Notes
```

---

## 4. Edit User

Operations Admins and Support Agents can edit:
- Display name
- Status (active / suspended)
- Role assignment
- Admin notes (internal only)

```typescript
const { formProps, saveButtonProps } = useForm<User>({
  resource: 'users',
  action: 'edit',
  id: userId,
});
```

---

## 5. Suspend / Reinstate User

```typescript
const suspendUser = (userId: string, reason: string) => {
  updateUser({
    resource: 'users',
    id: userId,
    values: {
      status: 'suspended',
      metadata: { suspension_reason: reason, suspended_at: new Date().toISOString() },
    },
  });
};

const reinstateUser = (userId: string) => {
  updateUser({
    resource: 'users',
    id: userId,
    values: { status: 'active' },
  });
};
```

---

## 6. Soft Delete User

Soft delete preserves transaction history integrity while hiding the user:

```typescript
const softDeleteUser = (userId: string) => {
  updateUser({
    resource: 'users',
    id: userId,
    values: { metadata: { deleted_at: new Date().toISOString() } },
  });
};
```

> ⚠️ Hard deletes are restricted to Super Admin only and require confirmation.

---

## 7. User Search Filters

| Filter | Type | Options |
|---|---|---|
| Name | Text search | Contains match |
| Phone | Text search | Contains match |
| Role | Select | customer, merchant, both |
| Status | Select | active, suspended |
| Tier | Select | Bronze, Silver, Gold, Platinum |
| Joined Date | Date range | From / To |
| Points Balance | Number range | Min / Max |

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [12-points-adjustment.md](./12-points-adjustment.md) | Manual point credit/debit operations |
| [05-user-role-permission.md](../03-security/05-user-role-permission.md) | Who can edit users |
| [23-fraud-flags.md](../12-fraud-prevention/23-fraud-flags.md) | User fraud flag checks |
