# 04 — Admin Portal: Technology Stack

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Stack Overview

The Admin Portal is built on **Refine** — an open-source React meta-framework purpose-built for admin panels and internal tools. It eliminates boilerplate for CRUD operations, authentication, access control, and data fetching by providing a set of headless hooks that connect directly to any backend via a data provider.

```
┌────────────────────────────────────────┐
│           Ant Design (UI Layer)        │  antd + @refinedev/antd
├────────────────────────────────────────┤
│           Refine (Logic Layer)         │  @refinedev/core
├────────────────────────────────────────┤
│     @refinedev/pocketbase (Adapter)    │  Data + Auth Providers
├────────────────────────────────────────┤
│         PocketBase v0.39.5             │  Backend
└────────────────────────────────────────┘
```

---

## 2. Full Dependency Table

| Layer | Package | Version | Purpose |
|---|---|---|---|
| **Framework** | `@refinedev/core` | ^4.x | Headless hooks: useList, useOne, useCreate, useUpdate, useDelete, useForm, useTable |
| **Data Provider** | `@refinedev/pocketbase` | ^5.x | Connects Refine CRUD ops to PocketBase REST + SSE |
| **UI Integration** | `@refinedev/antd` | ^5.x | Ant Design wrappers: ThemedLayoutV2, useTable, useForm, etc. |
| **UI Library** | `antd` | ^5.x | Tables, Forms, Modals, Charts, Notifications |
| **Icons** | `@ant-design/icons` | ^5.x | Icon set for sidebar, actions, status badges |
| **Router** | `react-router-dom` | ^6.x | Client-side routing; Refine's default for Vite |
| **Router Adapter** | `@refinedev/react-router-v6` | ^4.x | Bridges Refine navigation to React Router |
| **State & Cache** | `@tanstack/react-query` | ^5.x | Data fetching cache (used internally by Refine) |
| **Charts** | `recharts` | ^2.x | Analytics charts: LineChart, BarChart, PieChart |
| **Backend** | `pocketbase` (JS SDK) | ^0.21.x | PocketBase client singleton |
| **Language** | `typescript` | ^5.x | Type safety across all files |
| **Bundler** | `vite` | ^5.x | Fast development server and production build |
| **React** | `react` + `react-dom` | ^18.x | UI runtime |
| **Date Handling** | `dayjs` | ^1.x | Date formatting in tables and filters |

---

## 3. Refine Setup

### 3.1 PocketBase Client Singleton

```typescript
// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
// VITE_POCKETBASE_URL=https://api.waly.app
```

### 3.2 Data Provider

```typescript
// src/dataProvider.ts
import { dataProvider } from '@refinedev/pocketbase';
import { pb } from './lib/pocketbase';

export const walyDataProvider = dataProvider(pb);
```

### 3.3 Auth Provider

```typescript
// src/authProvider.ts
import { authProvider } from '@refinedev/pocketbase';
import { pb } from './lib/pocketbase';

export const walyAuthProvider = authProvider(pb);
// Uses pb.admins.authWithPassword() for superuser login
```

### 3.4 Root App Component

```typescript
// src/App.tsx
import { Refine } from '@refinedev/core';
import { ThemedLayoutV2, useNotificationProvider } from '@refinedev/antd';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { NavigateToResource } from '@refinedev/react-router-v6';
import { App as AntdApp } from 'antd';

import { walyDataProvider } from './dataProvider';
import { walyAuthProvider } from './authProvider';

export const App = () => (
  <BrowserRouter>
    <AntdApp>
      <Refine
        dataProvider={walyDataProvider}
        authProvider={walyAuthProvider}
        notificationProvider={useNotificationProvider}
        resources={[
          { name: 'merchants',     list: '/merchants',    show: '/merchants/:id', meta: { label: 'Merchants' } },
          { name: 'users',         list: '/users',        show: '/users/:id',     meta: { label: 'Users' } },
          { name: 'transactions',  list: '/ledger',                               meta: { label: 'Ledger' } },
          { name: 'fraud_flags',   list: '/fraud',                                meta: { label: 'Fraud' } },
          { name: 'campaigns',     list: '/campaigns',                            meta: { label: 'Campaigns' } },
          { name: 'rewards',       list: '/rewards',                              meta: { label: 'Rewards' } },
          { name: 'notifications', list: '/notifications',                        meta: { label: 'Notifications' } },
        ]}
        options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
      >
        <Routes>
          <Route element={<ThemedLayoutV2><Outlet /></ThemedLayoutV2>}>
            {/* page routes */}
          </Route>
        </Routes>
      </Refine>
    </AntdApp>
  </BrowserRouter>
);
```

---

## 4. Key Refine Hooks Used

| Hook | Used For |
|---|---|
| `useTable()` | Every list page — handles pagination, filters, sorting automatically |
| `useList()` | KPI cards on dashboard — fetching aggregate counts |
| `useOne()` | Detail/show pages — single record fetch |
| `useCreate()` | Create forms — new campaigns, rewards, notifications |
| `useUpdate()` | Edit forms + action buttons (approve, suspend, resolve) |
| `useDelete()` | Delete confirmation dialogs |
| `useForm()` | All create/edit form pages |
| `useShow()` | Detail page data access |
| `useSelect()` | Dropdown selects with async PocketBase data |
| `useExport()` | CSV export for tables |
| `useCan()` | RBAC permission checks in UI |

---

## 5. Environment Variables

```env
# .env
VITE_POCKETBASE_URL=https://api.waly.app
VITE_APP_NAME=WALY Admin Portal
VITE_APP_ENV=production
```

---

## 6. Project Scripts

```json
// package.json scripts
{
  "dev":     "vite",
  "build":   "tsc && vite build",
  "preview": "vite preview",
  "lint":    "eslint src --ext ts,tsx"
}
```

---

## 7. Related Documents

| Doc | Description |
|---|---|
| [03-system-architecture.md](./03-system-architecture.md) | How the portal connects to PocketBase |
| [06-authentication.md](../03-security/06-authentication.md) | Superuser auth flow detail |
| [32-api-authentication.md](../16-api-integration/32-api-authentication.md) | Token management strategy |
| [42-deployment-process.md](../21-devops/42-deployment-process.md) | Build and deploy steps |
