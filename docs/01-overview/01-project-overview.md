# 01 — WALY Admin Portal: Project Overview

> **Platform:** WALY LOYALTY — Admin Portal
> **Stack:** Refine + Vite + Ant Design + PocketBase v0.39.5
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. What is the WALY Admin Portal?

The **WALY Admin Portal** is a web-based internal operations dashboard built for WALY platform staff. It provides a centralized interface to manage every aspect of the WALY loyalty ecosystem — from merchant onboarding and user oversight to fraud monitoring, campaign control, and real-time analytics.

The Admin Portal is a **separate project** from the mobile app (`web-app/`) but shares the same PocketBase backend instance. It is accessed via a web browser at `https://admin.waly.app` and is strictly restricted to authorized WALY operations team members.

---

## 2. Why a Dedicated Admin Portal?

| Problem | Admin Portal Solution |
|---|---|
| PocketBase's native `/_/` UI is developer-focused, not operations-friendly | Purpose-built UI tailored to WALY workflows |
| No custom analytics or reporting in PocketBase UI | Embedded charts, KPI cards, and exportable reports |
| Merchant approval requires direct database edits | One-click approval/rejection workflow with notifications |
| Fraud review is manual SQL-style filtering | Dedicated fraud flag queue with review actions |
| No role-based access for different admin staff | RBAC: Super Admin, Operations, Read-Only roles |

---

## 3. Target Personas

| Persona | Role | Capabilities |
|---|---|---|
| **Super Admin** | WALY CTO / Platform Owner | Full access — all CRUD, config, user management |
| **Operations Admin** | WALY Ops Team | Merchant approval, user support, campaign management |
| **Analyst** | WALY Data / Marketing | Read-only access to analytics, reports, export |
| **Support Agent** | Customer Support | User lookup, points adjustment, voucher actions |

---

## 4. Core Feature Modules

| # | Module | Description | Status |
|---|---|---|---|
| 1 | **Dashboard** | Platform health, KPI summary, recent alerts | 📋 Planned |
| 2 | **Merchant Management** | Onboarding approval, verification, suspension | 📋 Planned |
| 3 | **User Management** | Customer lookup, edit, suspend, points adjust | 📋 Planned |
| 4 | **Loyalty Programs** | Tier config, stamp card template management | 📋 Planned |
| 5 | **Rewards Catalog** | Create/edit/retire rewards, redemption log | 📋 Planned |
| 6 | **Campaigns & Promotions** | Platform campaigns, voucher bulk ops | 📋 Planned |
| 7 | **Points Ledger** | Full transaction audit, liability monitoring | 📋 Planned |
| 8 | **Analytics & Reporting** | DAU/MAU, merchant performance, exports | 📋 Planned |
| 9 | **Fraud Prevention** | Flag queue, velocity rule config | 📋 Planned |
| 10 | **Notifications** | Broadcast push/SMS/email, delivery logs | 📋 Planned |
| 11 | **Gamification** | Badge/challenge admin, leaderboard config | 📋 Planned |
| 12 | **Admin Management** | Admin user CRUD, role assignment, audit log | 📋 Planned |

---

## 5. Project Repository Layout

```
admin-portal/
├── src/
│   ├── App.tsx                    ← Refine root component
│   ├── authProvider.ts            ← PocketBase superuser auth
│   ├── dataProvider.ts            ← @refinedev/pocketbase adapter
│   ├── pages/
│   │   ├── dashboard/             ← Main dashboard page
│   │   ├── merchants/             ← Merchant list, detail, approve
│   │   ├── users/                 ← User list, detail, edit
│   │   ├── loyalty/               ← Tiers, stamp cards
│   │   ├── rewards/               ← Rewards catalog, redemptions
│   │   ├── campaigns/             ← Campaigns, vouchers
│   │   ├── ledger/                ← Transaction log, liability
│   │   ├── analytics/             ← Charts and KPIs
│   │   ├── fraud/                 ← Fraud flags, velocity rules
│   │   ├── notifications/         ← Broadcast, logs
│   │   ├── gamification/          ← Badges, challenges, leaderboard
│   │   └── admin-users/           ← Admin CRUD
│   ├── components/                ← Shared UI components
│   ├── hooks/                     ← Custom Refine hooks
│   └── lib/
│       └── pocketbase.ts          ← PocketBase client singleton
├── docs/                          ← This documentation tree
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. Relationship to web-app

```
┌─────────────────────┐      ┌─────────────────────────┐
│   web-app (Mobile)  │      │  admin-portal (Web)      │
│   Expo React Native │      │  Refine + Vite + AntD    │
│   Customer Portal   │      │  Operations Dashboard    │
│   Merchant Portal   │      │                         │
└────────┬────────────┘      └────────────┬────────────┘
         │                               │
         │    Both connect to same       │
         └──────────┬────────────────────┘
                    ▼
         ┌─────────────────────┐
         │  PocketBase v0.39.5 │
         │  api.waly.app       │
         │  REST + SSE + Auth  │
         └─────────────────────┘
```

---

## 7. Related Documents

| Doc | Description |
|---|---|
| [02-business-goals.md](./02-business-goals.md) | Admin portal KPIs and success metrics |
| [03-system-architecture.md](../02-system-architecture/03-system-architecture.md) | Architecture diagram and data flow |
| [04-technology-stack.md](../02-system-architecture/04-technology-stack.md) | Full dependency list and Refine setup |
| [27-admin-dashboard.md](../14-backoffice/27-admin-dashboard.md) | Main dashboard specification |
| [35-ui-pages.md](../18-page-structure/35-ui-pages.md) | Complete page inventory |
