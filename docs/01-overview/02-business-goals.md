# 02 — Admin Portal: Business Goals

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

This document defines the business objectives, success metrics, and operational KPIs that the WALY Admin Portal must support. Every feature built into the admin portal should trace back to at least one goal listed here.

---

## 2. Primary Business Goals

### 2.1 Accelerate Merchant Onboarding
**Goal:** Reduce time-to-active for new merchants from days to hours.

| Metric | Target |
|---|---|
| Merchant approval turnaround | < 4 hours from submission |
| Pending approvals older than 24h | 0 |
| Onboarding completion rate | > 90% of submitted applications |

### 2.2 Protect Platform Revenue via Fraud Control
**Goal:** Catch and resolve fraudulent point transactions before they impact the liability ledger.

| Metric | Target |
|---|---|
| Fraud flag review time | < 2 hours from flag creation |
| False-positive fraud flag rate | < 5% |
| Points liability loss from fraud | < 0.1% of total issued points |

### 2.3 Maintain Platform Health & Uptime
**Goal:** Give operations staff real-time visibility into platform stability.

| Metric | Target |
|---|---|
| Admin dashboard load time | < 2 seconds |
| PocketBase API uptime visibility | 99.9% observable |
| Critical alert acknowledgement time | < 15 minutes |

### 2.4 Drive Engagement via Campaign Management
**Goal:** Enable the marketing team to launch, monitor, and iterate campaigns without engineering support.

| Metric | Target |
|---|---|
| Time to launch a new campaign | < 30 minutes end-to-end |
| Campaigns launched per month | ≥ 4 platform-wide |
| Campaign redemption rate (avg) | > 15% |

### 2.5 Empower Data-Driven Decisions
**Goal:** Replace ad-hoc PocketBase queries with self-serve analytics.

| Metric | Target |
|---|---|
| Weekly active analytics users (admin staff) | 100% of ops team |
| Report generation time | < 10 seconds |
| Data export availability | CSV + PDF for all key reports |

---

## 3. Operational KPIs Dashboard

The admin portal home dashboard must surface these KPIs at a glance:

| KPI | Collection Source | Refresh |
|---|---|---|
| Total registered users | `users` | Real-time |
| Active merchants | `merchants` (status=active) | Real-time |
| Points issued (rolling 30d) | `transactions` (type=earn) | Daily |
| Points redeemed (rolling 30d) | `transactions` (type=redeem) | Daily |
| Pending merchant approvals | `merchants` (status=pending) | Real-time |
| Open fraud flags | `fraud_flags` (status=open) | Real-time |
| Total points liability | `liability_snapshots` (latest) | Daily |
| Platform DAU | `transactions` grouped by date | Daily |

---

## 4. Admin Portal ROI Justification

| Before Admin Portal | After Admin Portal |
|---|---|
| Merchant approval via raw PocketBase UI — error-prone | One-click approve with auto-notification |
| Fraud review via SQL filter queries | Dedicated queue with review actions |
| Analytics = manual spreadsheet exports | Live charts, instant CSV/PDF export |
| No role separation — all admins see everything | RBAC with granular per-role permissions |
| Broadcast notifications via API scripts | GUI-based broadcast with template support |

---

## 5. Success Criteria for v1.0 Launch

- [ ] All 12 feature modules are accessible and functional
- [ ] Merchant onboarding approval workflow is end-to-end automated (including notification)
- [ ] Fraud flag queue is live with review/resolve actions
- [ ] Analytics dashboard shows real-time KPI cards and 30-day trend charts
- [ ] Role-based access control enforced for all 4 admin personas
- [ ] Admin portal is deployed to `https://admin.waly.app` with HTTPS

---

## 6. Related Documents

| Doc | Description |
|---|---|
| [01-project-overview.md](./01-project-overview.md) | What the admin portal is and who uses it |
| [21-platform-analytics.md](../11-analytics-reporting/21-platform-analytics.md) | Analytics KPI detail |
| [27-admin-dashboard.md](../14-backoffice/27-admin-dashboard.md) | Dashboard widget specifications |
| [23-fraud-flags.md](../12-fraud-prevention/23-fraud-flags.md) | Fraud monitoring workflow |
