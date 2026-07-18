# 34 — Admin Portal: User Flow

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

This document maps the key admin user journeys through the WALY Admin Portal — from login to task completion. Each flow is described step-by-step with the screens and actions involved.

---

## 2. Flow 1: Login

```
/login
  │
  ├── Enter email + password
  ├── Submit → authProvider.login()
  │
  ├── [Success] → /dashboard
  └── [Failure] → Show error: "Invalid credentials"
```

---

## 3. Flow 2: Approve a Merchant

```
/dashboard (see "Pending Approvals" KPI card)
  │
  ▼
/merchants?status=pending
  │
  ├── Scan merchant list
  ├── Click [View Details] on a merchant
  │
  ▼
/merchants/{id}  (Merchant Detail)
  │
  ├── Review: business name, logo, category, owner profile
  ├── Check no active fraud flags on owner
  │
  ├── Click [Approve] → Confirmation modal
  │   "Approve 'Kopi Town'? This will notify the merchant."
  │   [Cancel] / [Confirm]
  │
  ├── [Confirm] → PATCH merchant status=active, is_verified=true
  │              → Notification sent to merchant owner
  │              → Toast: "Merchant approved successfully"
  │
  └── Redirect → /merchants?status=pending (return to queue)
```

---

## 4. Flow 3: Resolve a Fraud Flag

```
/dashboard (see "Open Fraud Flags" alert card — red badge)
  │
  ▼
/fraud (Fraud Queue, sorted by severity)
  │
  ├── Click [Review] on HIGH severity flag
  │
  ▼
/fraud/{id}  (Flag Detail)
  │
  ├── Read: rule triggered, points involved, customer history
  ├── View velocity chart (earn rate in last 24h)
  ├── Review recent transactions
  │
  ├── [Resolve — Legitimate]   → mark resolved, no action
  ├── [Resolve — Fraud]        → mark resolved + auto-suspend user
  └── [Dismiss — False Positive] → mark dismissed
      → Confirmation modal → Toast
```

---

## 5. Flow 4: Adjust User Points (Support Case)

```
Customer calls support: "I should have gotten 200 points but didn't"
  │
  ▼
/users  (search by phone number)
  │
  ▼
/users/{id}  (User Detail)
  │
  ├── Review transaction history — confirm the missing earn
  ├── Click [Adjust Points]
  │
  ▼
  Adjust Points Drawer:
  ├── Type: Credit
  ├── Points: 200
  ├── Reason: "Missing earn — verified with merchant receipt"
  ├── [Submit] → creates transaction type=adjust
  │             → updates user.total_points
  │             → notifies customer
  └── Toast: "200 points credited to Ahmad"
```

---

## 6. Flow 5: Launch a Platform Campaign

```
/campaigns  (Campaigns List)
  │
  ├── Click [Create Campaign]
  │
  ▼
/campaigns/create  (Campaign Form)
  │
  ├── Title: "Double Points Weekend"
  ├── Type: double_points
  ├── Merchant: (leave blank = platform-wide)
  ├── Multiplier: 2.0
  ├── Start: 2026-07-04
  ├── End: 2026-07-06
  ├── Status: active
  │
  ├── [Save] → creates campaign record
  │           → Toast: "Campaign created and active"
  │
  └── Return to /campaigns — new campaign visible
```

---

## 7. Flow 6: Export Analytics Report

```
/analytics  (Platform Analytics)
  │
  ├── Set date range: Last 30 days
  ├── Review charts: DAU, Points Flow, Tier Distribution
  │
  ├── Click [Export CSV]
  │   → Downloads "waly-analytics-2026-07-01.csv"
  │
  └── Click [Export PDF]
      → Generates "waly-report-2026-07-01.pdf"
```

---

## 8. Related Documents

| Doc | Description |
|---|---|
| [33-ui-guidelines.md](./33-ui-guidelines.md) | Component and style conventions |
| [35-ui-pages.md](../18-page-structure/35-ui-pages.md) | Full page inventory |
| [27-admin-dashboard.md](../14-backoffice/27-admin-dashboard.md) | Dashboard layout |
