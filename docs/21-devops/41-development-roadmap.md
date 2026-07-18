# 41 — Admin Portal: Development Roadmap

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

The Admin Portal is built in phased milestones. Each phase delivers a usable product increment. This document tracks the planned phases, features per phase, and estimated timelines.

---

## 2. Development Phases

### Phase 1 — Foundation & Core Operations (Weeks 1–3)
**Goal:** A working admin portal that ops team can use for daily merchant approvals and user support.

| Feature | Priority | Status |
|---|---|---|
| Project scaffolding (Refine + Vite + Ant Design) | P0 | 📋 Planned |
| Auth (PocketBase admin_users login) | P0 | 📋 Planned |
| Admin dashboard (KPI cards) | P0 | 📋 Planned |
| Merchant list + detail + approve/reject | P0 | 📋 Planned |
| User list + detail + suspend/reinstate | P0 | 📋 Planned |
| Points adjustment | P0 | 📋 Planned |
| Fraud flag queue + review | P0 | 📋 Planned |
| Transaction ledger | P1 | 📋 Planned |

---

### Phase 2 — Campaigns & Analytics (Weeks 4–5)
**Goal:** Ops team can manage campaigns, view analytics, and export reports.

| Feature | Priority | Status |
|---|---|---|
| Campaign create/edit/manage | P1 | 📋 Planned |
| Voucher bulk issuance | P1 | 📋 Planned |
| Rewards catalog CRUD | P1 | 📋 Planned |
| Redemption log + void/refund | P1 | 📋 Planned |
| Platform analytics (DAU, Points Flow, Tier chart) | P1 | 📋 Planned |
| Merchant analytics + leaderboard | P1 | 📋 Planned |
| CSV export for all tables | P1 | 📋 Planned |
| Liability monitoring dashboard | P1 | 📋 Planned |

---

### Phase 3 — Loyalty & Gamification (Weeks 6–7)
**Goal:** Full control over loyalty configuration and gamification engine.

| Feature | Priority | Status |
|---|---|---|
| Tier management | P2 | 📋 Planned |
| Stamp card management | P2 | 📋 Planned |
| Badge + challenge CRUD | P2 | 📋 Planned |
| Leaderboard + streak admin | P2 | 📋 Planned |
| Velocity rule configuration | P2 | 📋 Planned |
| Notification broadcast + logs | P2 | 📋 Planned |

---

### Phase 4 — Polish & Hardening (Week 8)
**Goal:** Production-ready admin portal with RBAC, audit log, and monitoring.

| Feature | Priority | Status |
|---|---|---|
| Admin user CRUD + role management | P2 | 📋 Planned |
| Admin audit log | P2 | 📋 Planned |
| Dark mode | P3 | 📋 Planned |
| Global search (`Ctrl+K`) | P2 | 📋 Planned |
| PDF report export | P3 | 📋 Planned |
| Performance audit + optimization | P2 | 📋 Planned |
| Deployment to `admin.waly.app` | P0 | 📋 Planned |

---

## 3. Milestone Summary

| Milestone | Completion Target | Deliverable |
|---|---|---|
| M1 — Foundation | End of Week 3 | Ops team can approve merchants and support users |
| M2 — Campaigns & Analytics | End of Week 5 | Marketing team can run campaigns and view reports |
| M3 — Loyalty & Gamification | End of Week 7 | Full loyalty config access |
| M4 — Production Launch | End of Week 8 | `admin.waly.app` live with all 47 pages |

---

## 4. Related Documents

| Doc | Description |
|---|---|
| [42-deployment-process.md](./42-deployment-process.md) | CI/CD and deploy steps |
| [01-project-overview.md](../01-overview/01-project-overview.md) | Feature module overview |
| [35-ui-pages.md](../18-page-structure/35-ui-pages.md) | Full page inventory (47 pages) |
