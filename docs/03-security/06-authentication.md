# 06 — Admin Portal: Authentication

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Admin Portal authenticates users against PocketBase using either the **superuser (`_superusers`) collection** for full-access admins, or a custom **`admin_users` collection** for scoped-role staff. Authentication is managed via Refine's `authProvider`, which wraps the PocketBase JS SDK's auth methods.

---

## 2. Auth Flow

```
1. User navigates to https://admin.waly.app
2. Refine's <Authenticated> wrapper calls authProvider.check()
3. authProvider.check() reads pb.authStore.isValid
4. If invalid → redirect to /login
5. User enters email + password on /login page
6. authProvider.login() calls pb.admins.authWithPassword(email, password)
7. PocketBase validates credentials → returns token + model
8. pb.authStore.save(token, model) persists to localStorage
9. Refine marks user as authenticated → redirect to /dashboard
10. On every page load, pb.authStore.onChange fires if token expires
11. authProvider.check() returns false → redirect to /login
```

---

## 3. Auth Provider Implementation

```typescript
// src/authProvider.ts
import { AuthProvider } from '@refinedev/core';
import { pb } from './lib/pocketbase';

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      await pb.admins.authWithPassword(email, password);
      return { success: true, redirectTo: '/dashboard' };
    } catch {
      return {
        success: false,
        error: { name: 'Login Failed', message: 'Invalid email or password' },
      };
    }
  },

  logout: async () => {
    pb.authStore.clear();
    return { success: true, redirectTo: '/login' };
  },

  check: async () => {
    return pb.authStore.isValid
      ? { authenticated: true }
      : { authenticated: false, redirectTo: '/login' };
  },

  getIdentity: async () => {
    const model = pb.authStore.model;
    if (!model) return null;
    return {
      id:     model.id,
      name:   model.name ?? model.email,
      email:  model.email,
      role:   model.role ?? 'super_admin',
      avatar: model.avatar
        ? pb.files.getUrl(model, model.avatar, { thumb: '40x40' })
        : undefined,
    };
  },

  onError: async (error) => {
    if (error?.status === 401 || error?.status === 403) {
      return { logout: true };
    }
    return { error };
  },
};
```

---

## 4. Session Management

| Concern | Behaviour |
|---|---|
| **Token storage** | `localStorage` key `pocketbase_auth` (PocketBase default) |
| **Token expiry** | PocketBase admin tokens expire after 1 year by default |
| **Auto-refresh** | PocketBase JS SDK auto-refreshes token 30s before expiry |
| **Tab persistence** | Token persists across browser tabs and page refreshes |
| **Logout** | `pb.authStore.clear()` removes token from localStorage immediately |

---

## 5. Login Page

The login page is rendered when Refine detects an unauthenticated state. It uses the `AuthPage` component from `@refinedev/antd`:

```tsx
// src/pages/auth/login.tsx
import { AuthPage } from '@refinedev/antd';

export const LoginPage = () => (
  <AuthPage
    type="login"
    title="WALY Admin Portal"
    forgotPasswordLink={false}
    registerLink={false}
  />
);
```

---

## 6. Protected Routes

All admin routes are wrapped with Refine's `<Authenticated>` component:

```tsx
<Route
  element={
    <Authenticated fallback={<Navigate to="/login" />}>
      <ThemedLayoutV2>
        <Outlet />
      </ThemedLayoutV2>
    </Authenticated>
  }
>
  {/* protected routes */}
</Route>
```

---

## 7. Security Considerations

| Risk | Mitigation |
|---|---|
| Token leaked via XSS | Use `HttpOnly` cookie storage in future; currently localStorage with CSP headers |
| Brute-force login | PocketBase rate-limiting on auth endpoints |
| Unauthorized API access | All write endpoints require `@request.auth.collectionName = '_superusers'` rule |
| CORS | PocketBase configured to allow only `https://admin.waly.app` |

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [05-user-role-permission.md](./05-user-role-permission.md) | RBAC roles and permission matrix |
| [04-technology-stack.md](../02-system-architecture/04-technology-stack.md) | Refine authProvider setup |
| [32-api-authentication.md](../16-api-integration/32-api-authentication.md) | Token strategy and API auth headers |
