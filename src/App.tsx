import React from 'react';
import { Refine, Authenticated } from '@refinedev/core';
import { useNotificationProvider } from '@refinedev/antd';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import routerProvider, { NavigateToResource } from '@refinedev/react-router-v6';
import { App as AntdApp, ConfigProvider } from 'antd';

import { walyDataProvider } from './dataProvider';
import { walyAuthProvider } from './authProvider';
import { accessControlProvider } from './accessControlProvider';
import { AppLayout } from './components/layout';
import { LoginPage } from './pages/auth/login';
import { DashboardPage } from './pages/dashboard';
import { MerchantList } from './pages/merchants/list';
import { MerchantShow } from './pages/merchants/show';
import { UserList } from './pages/users/list';
import { UserShow } from './pages/users/show';
import { FraudFlagList, VelocityRuleList, VelocityRuleEdit } from './pages/fraud/list';
import { CampaignList, CampaignCreate, CampaignEdit, CampaignShow, VoucherList, VoucherBulkIssue } from './pages/campaigns/list';
import { RewardList, RewardCreate, RewardEdit, RewardShow } from './pages/rewards/list';
import { TransactionList, LiabilityDashboard } from './pages/ledger/list';
import { PlatformAnalytics } from './pages/analytics/list';
import { NotificationOverview, NotificationBroadcast } from './pages/notifications/list';
import { AdminUserList, AdminUserCreate, AdminUserEdit, AdminAuditLogList } from './pages/admin-users/list';
import { TierList, TierEdit, StampCardList, StampCardShow, StampCardEdit } from './pages/loyalty/list';
import { SalesDashboardPage } from './pages/sales-dashboard';
import { SalesProspectsPage } from './pages/sales-dashboard/prospects';
import { SalesMerchantsPage } from './pages/sales-dashboard/merchants';
import { SalesDormantPage } from './pages/sales-dashboard/dormant';
import { SalesEarningsPage } from './pages/sales-dashboard/earnings';
import { SalesAnalyticsPage } from './pages/sales-dashboard/analytics';
import { SalesLeaderboardPage } from './pages/sales-dashboard/leaderboard';
import { SubscriptionList } from './pages/subscriptions/list';


// Theme Configuration matching code.html tokens
const customTheme = {
  token: {
    colorPrimary: '#0040e0',
    colorBgContainer: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 14,
  },
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider theme={customTheme}>
        <AntdApp>
          <Refine
            dataProvider={walyDataProvider}
            authProvider={walyAuthProvider}
            accessControlProvider={accessControlProvider}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              {
                name: 'dashboard',
                list: '/dashboard',
                meta: { label: 'Dashboard' },
              },
              {
                name: 'merchants',
                list: '/merchants',
                meta: { label: 'Merchants' },
              },
              {
                name: 'users',
                list: '/users',
                meta: { label: 'Users' },
              },
              {
                name: 'fraud_flags',
                list: '/fraud',
                meta: { label: 'Fraud' },
              },
              {
                name: 'campaigns',
                list: '/campaigns',
                meta: { label: 'Campaigns' },
              },
              {
                name: 'rewards',
                list: '/rewards',
                meta: { label: 'Rewards' },
              },
              {
                name: 'transactions',
                list: '/ledger',
                meta: { label: 'Ledger' },
              },
              {
                name: 'sales_dashboard',
                list: '/sales-dashboard',
                meta: { label: 'Sales Dashboard' },
              },
              {
                name: 'subscriptions',
                list: '/subscriptions',
                meta: { label: 'Billing' },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              {/* Unauthenticated Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes wrapped in custom layout */}
              <Route
                element={
                  <Authenticated key="authenticated-routes" fallback={<Navigate to="/login" />}>
                    <AppLayout>
                      <Outlet />
                    </AppLayout>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="dashboard" />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/sales-dashboard" element={<SalesDashboardPage />} />
                <Route path="/sales-dashboard/prospects" element={<SalesProspectsPage />} />
                <Route path="/sales-dashboard/merchants" element={<SalesMerchantsPage />} />
                <Route path="/sales-dashboard/dormant" element={<SalesDormantPage />} />
                <Route path="/sales-dashboard/earnings" element={<SalesEarningsPage />} />
                <Route path="/sales-dashboard/analytics" element={<SalesAnalyticsPage />} />
                <Route path="/sales-dashboard/leaderboard" element={<SalesLeaderboardPage />} />
                
                {/* Merchants */}
                <Route path="/merchants" element={<MerchantList />} />
                <Route path="/merchants/:id" element={<MerchantShow />} />
                
                {/* Users */}
                <Route path="/users" element={<UserList />} />
                <Route path="/users/:id" element={<UserShow />} />
                
                {/* Fraud */}
                <Route path="/fraud" element={<FraudFlagList />} />
                <Route path="/fraud/:id" element={<div>Show Fraud Flag Detail (Planned Phase 1)</div>} />
                <Route path="/fraud/velocity-rules" element={<VelocityRuleList />} />
                <Route path="/fraud/velocity-rules/edit/:id" element={<VelocityRuleEdit />} />
                
                {/* Other resources */}
                <Route path="/campaigns" element={<CampaignList />} />
                <Route path="/campaigns/create" element={<CampaignCreate />} />
                <Route path="/campaigns/edit/:id" element={<CampaignEdit />} />
                <Route path="/campaigns/show/:id" element={<CampaignShow />} />
                <Route path="/campaigns/vouchers" element={<VoucherList />} />
                <Route path="/campaigns/vouchers/issue" element={<VoucherBulkIssue />} />
                <Route path="/rewards" element={<RewardList />} />
                <Route path="/rewards/create" element={<RewardCreate />} />
                <Route path="/rewards/edit/:id" element={<RewardEdit />} />
                <Route path="/rewards/show/:id" element={<RewardShow />} />
                <Route path="/ledger" element={<TransactionList />} />
                <Route path="/ledger/liability" element={<LiabilityDashboard />} />
                <Route path="/subscriptions" element={<SubscriptionList />} />
                
                <Route path="/loyalty/tiers" element={<TierList />} />
                <Route path="/loyalty/tiers/edit/:id" element={<TierEdit />} />
                <Route path="/loyalty/stamp-cards" element={<StampCardList />} />
                <Route path="/loyalty/stamp-cards/show/:id" element={<StampCardShow />} />
                <Route path="/loyalty/stamp-cards/edit/:id" element={<StampCardEdit />} />
                <Route path="/analytics" element={<PlatformAnalytics />} />
                <Route path="/notifications" element={<NotificationOverview />} />
                <Route path="/notifications/broadcast" element={<NotificationBroadcast />} />
                <Route path="/admin-users" element={<AdminUserList />} />
                <Route path="/admin-users/create" element={<AdminUserCreate />} />
                <Route path="/admin-users/edit/:id" element={<AdminUserEdit />} />
                <Route path="/admin-users/audit-logs" element={<AdminAuditLogList />} />
              </Route>

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};

export default App;
