# 35 — Admin Portal: UI Pages

> **Platform:** WALY LOYALTY — Admin Portal
> **Document Version:** 1.0.0
> **Last Updated:** 2026-07-01

---

## 1. Overview

Complete inventory of all pages in the WALY Admin Portal. Each entry includes the route path, page component, required role, and primary Refine resource.

---

## 2. Full Page Inventory

### Auth Pages (Unauthenticated)

| # | Route | Page | Component | Notes |
|---|---|---|---|---|
| 1 | `/login` | Login | `<AuthPage type="login">` | PocketBase admin_users auth |

---

### Dashboard

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 2 | `/dashboard` | Main Dashboard | `<DashboardPage>` | All |

---

### Merchant Management

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 3 | `/merchants` | Merchant List | `<MerchantList>` | Ops, Analyst, Super |
| 4 | `/merchants/pending` | Pending Approvals | `<MerchantPendingList>` | Ops, Super |
| 5 | `/merchants/:id` | Merchant Detail | `<MerchantShow>` | Ops, Analyst, Super |
| 6 | `/merchants/:id/edit` | Edit Merchant | `<MerchantEdit>` | Ops, Super |
| 7 | `/merchants/:id/analytics` | Merchant Analytics | `<MerchantAnalytics>` | Ops, Analyst, Super |

---

### User Management

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 8 | `/users` | User List | `<UserList>` | All |
| 9 | `/users/:id` | User Detail | `<UserShow>` | All |
| 10 | `/users/:id/edit` | Edit User | `<UserEdit>` | Ops, Support, Super |

---

### Loyalty Programs

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 11 | `/loyalty/tiers` | Tier Management | `<TierList>` | Ops, Super |
| 12 | `/loyalty/tiers/:id/edit` | Edit Tier | `<TierEdit>` | Ops, Super |
| 13 | `/loyalty/stamp-cards` | Stamp Cards | `<StampCardList>` | Ops, Super |
| 14 | `/loyalty/stamp-cards/:id` | Stamp Card Detail | `<StampCardShow>` | All |
| 15 | `/loyalty/stamp-cards/:id/edit` | Edit Stamp Card | `<StampCardEdit>` | Ops, Super |

---

### Rewards Catalog

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 16 | `/rewards` | Rewards List | `<RewardList>` | All |
| 17 | `/rewards/create` | Create Reward | `<RewardCreate>` | Ops, Super |
| 18 | `/rewards/:id` | Reward Detail | `<RewardShow>` | All |
| 19 | `/rewards/:id/edit` | Edit Reward | `<RewardEdit>` | Ops, Super |
| 20 | `/rewards/redemptions` | Redemptions Log | `<RedemptionList>` | All |
| 21 | `/rewards/redemptions/:id` | Redemption Detail | `<RedemptionShow>` | All |

---

### Campaigns & Promotions

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 22 | `/campaigns` | Campaign List | `<CampaignList>` | All |
| 23 | `/campaigns/create` | Create Campaign | `<CampaignCreate>` | Ops, Super |
| 24 | `/campaigns/:id` | Campaign Detail | `<CampaignShow>` | All |
| 25 | `/campaigns/:id/edit` | Edit Campaign | `<CampaignEdit>` | Ops, Super |
| 26 | `/campaigns/vouchers` | Voucher List | `<VoucherList>` | All |
| 27 | `/campaigns/vouchers/issue` | Bulk Issue Vouchers | `<VoucherBulkIssue>` | Ops, Support, Super |

---

### Points Ledger

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 28 | `/ledger` | Transaction Ledger | `<TransactionList>` | All |
| 29 | `/ledger/:id` | Transaction Detail | `<TransactionShow>` | All |
| 30 | `/ledger/liability` | Liability Monitor | `<LiabilityDashboard>` | All |

---

### Analytics

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 31 | `/analytics` | Platform Analytics | `<PlatformAnalytics>` | All |
| 32 | `/analytics/merchants` | Merchant Rankings | `<MerchantAnalytics>` | All |

---

### Fraud Prevention

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 33 | `/fraud` | Fraud Flag Queue | `<FraudFlagList>` | Ops, Super |
| 34 | `/fraud/:id` | Flag Detail + Review | `<FraudFlagShow>` | Ops, Super |
| 35 | `/fraud/velocity-rules` | Velocity Rules | `<VelocityRuleList>` | Super only |
| 36 | `/fraud/velocity-rules/:id/edit` | Edit Rule | `<VelocityRuleEdit>` | Super only |

---

### Notifications

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 37 | `/notifications` | Notification Overview | `<NotificationOverview>` | All |
| 38 | `/notifications/broadcast` | Broadcast | `<BroadcastForm>` | Ops, Super |
| 39 | `/notifications/logs` | Delivery Logs | `<NotificationLogs>` | All |

---

### Gamification

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 40 | `/gamification/badges` | Badges | `<BadgeList>` | Ops, Super |
| 41 | `/gamification/badges/create` | Create Badge | `<BadgeCreate>` | Ops, Super |
| 42 | `/gamification/challenges` | Challenges | `<ChallengeList>` | Ops, Super |
| 43 | `/gamification/challenges/create` | Create Challenge | `<ChallengeCreate>` | Ops, Super |
| 44 | `/gamification/leaderboard` | Leaderboard | `<LeaderboardPage>` | All |

---

### Admin Management

| # | Route | Page | Component | Role |
|---|---|---|---|---|
| 45 | `/admin-users` | Admin Users List | `<AdminUserList>` | Super only |
| 46 | `/admin-users/create` | Create Admin User | `<AdminUserCreate>` | Super only |
| 47 | `/admin-users/:id/edit` | Edit Admin User | `<AdminUserEdit>` | Super only |

---

**Total Pages: 47**

---

## 3. Related Documents

| Doc | Description |
|---|---|
| [36-navigation-structure.md](./36-navigation-structure.md) | Sidebar nav and routing |
| [34-user-flow.md](../17-ui-ux/34-user-flow.md) | Key admin user journeys |
| [05-user-role-permission.md](../03-security/05-user-role-permission.md) | Role access per page |
