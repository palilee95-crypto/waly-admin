import { useList, useGetIdentity } from '@refinedev/core';

export interface ReferredMerchant {
  id: string;
  name: string;
  category: string;
  created: string;
  status: 'active' | 'pending';
  totalTransactions: number;
  totalSales: number;
  commission: number;
  phone: string;
  lastActive: string;
}

export const useSalesData = () => {
  const { data: identity } = useGetIdentity<any>();

  // 1. Query real referred merchants from PocketBase
  const { data: realMerchantsData, isLoading: isLoadingMerchants } = useList<any>({
    resource: 'merchants',
    filters: [
      {
        field: 'referred_by',
        operator: 'eq',
        value: identity?.id || '',
      },
    ],
    pagination: { pageSize: 50 },
    queryOptions: {
      enabled: !!identity?.id,
    },
  });

  // 2. Query real commissions from PocketBase for this agent
  const { data: realCommissionsData, isLoading: isLoadingCommissions } = useList<any>({
    resource: 'commissions',
    filters: [
      {
        field: 'agent',
        operator: 'eq',
        value: identity?.id || '',
      },
    ],
    pagination: { pageSize: 500 },
    queryOptions: {
      enabled: !!identity?.id,
    },
  });

  // 2b. Query prospects from PocketBase for this agent
  const { data: prospectsData, isLoading: isLoadingProspects } = useList<any>({
    resource: 'prospects',
    filters: [
      {
        field: 'agent',
        operator: 'eq',
        value: identity?.id || '',
      },
    ],
    pagination: { pageSize: 100 },
    queryOptions: {
      enabled: !!identity?.id,
    },
  });

  const referralCode = identity?.referral_code || 'RISEV_AGENT_100';
  const merchantAppUrl = import.meta.env.VITE_MERCHANT_APP_URL || 'https://waly-five.vercel.app';
  const referralLink = `${merchantAppUrl}/?ref=${referralCode}`;
  const clicksCount = identity?.clicks || 0;
  
  // QR Code URL using public generator API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(referralLink)}`;

  // 3. Map real database records of referred merchants
  const fetchedMerchants: ReferredMerchant[] = (realMerchantsData?.data || []).map((m: any) => {
    // Filter commissions for this specific merchant
    const merchantCommissions = (realCommissionsData?.data || []).filter(
      (c: any) => c.referred_merchant === m.id
    );
    const totalTransactions = merchantCommissions.length;
    const totalSales = merchantCommissions.reduce((sum: number, c: any) => sum + (c.sales_amount || 0), 0);
    const commission = merchantCommissions.reduce((sum: number, c: any) => sum + (c.commission_amount || 0), 0);

    return {
      id: m.id,
      name: m.name,
      category: m.category || 'General',
      created: String(m.created).substring(0, 10),
      status: m.status || 'pending',
      totalTransactions,
      totalSales,
      commission,
      phone: m.phone || '+60100000000',
      lastActive: String(m.updated).substring(0, 10),
    };
  });

  const merchantsList = fetchedMerchants;

  // Dormant check: Inactive in the last 7 days
  const isDormant = (dateStr: string) => {
    const lastActiveDate = new Date(dateStr);
    const today = new Date(); 
    const diffTime = Math.abs(today.getTime() - lastActiveDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  };

  const inactiveProspects = merchantsList.filter(m => m.status === 'pending' || m.totalTransactions === 0);
  const activeMerchants = merchantsList.filter(m => m.status === 'active' && m.totalTransactions > 0);
  const dormantMerchants = activeMerchants.filter(m => isDormant(m.lastActive));

  // Merge prospects collection leads into inactiveProspects
  const prospectLeads: ReferredMerchant[] = (prospectsData?.data || []).map((p: any) => ({
    id: p.id,
    name: `Prospect ${p.phone}`,
    category: 'Lead',
    created: String(p.created).substring(0, 10),
    status: 'pending',
    totalTransactions: 0,
    totalSales: 0,
    commission: 0,
    phone: p.phone || '',
    lastActive: String(p.last_contacted || p.updated).substring(0, 10),
  }));

  const allInactiveProspects = [...inactiveProspects, ...prospectLeads];

  // Compute Overall Stats from real commission history
  const totalEarned = (realCommissionsData?.data || []).reduce((acc: number, curr: any) => acc + (curr.commission_amount || 0), 0);
  
  // Calculate current billing month earnings
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyCommission = (realCommissionsData?.data || []).reduce((acc: number, curr: any) => {
    const date = new Date(curr.created);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      return acc + (curr.commission_amount || 0);
    }
    return acc;
  }, 0);

  const totalSalesRevenue = (realCommissionsData?.data || []).reduce((acc: number, curr: any) => acc + (curr.sales_amount || 0), 0);
  const acquiredCount = merchantsList.filter(m => m.status === 'active').length;
  
  // Commission Balances based on real payout status
  const pendingCommissions = (realCommissionsData?.data || [])
    .filter((c: any) => c.status === 'pending')
    .reduce((acc: number, curr: any) => acc + (curr.commission_amount || 0), 0);

  const withdrawableCommission = (realCommissionsData?.data || [])
    .filter((c: any) => c.status === 'paid')
    .reduce((acc: number, curr: any) => acc + (curr.commission_amount || 0), 0);

  // Analytics Stats
  const totalCustomers = merchantsList.reduce((acc, curr) => acc + (curr.totalTransactions * 1.8), 0); // Simulated customers
  const activeMembers = totalCustomers * 0.72;
  const conversionRate = clicksCount > 0
    ? ((merchantsList.length / clicksCount) * 100).toFixed(2)
    : '0.00';
  const averageSpend = totalSalesRevenue / ((realCommissionsData?.data || []).length || 1);

  // Leaderboard Mock
  const leaderboardMock = [
    { rank: 1, name: 'Farhan Azman', sales: 34500, customers: 48, commission: 3450, tier: 'Tier 3 (15%)', isCurrentUser: false },
    { 
      rank: 2, 
      name: identity?.name || 'Fazli', 
      sales: totalSalesRevenue, 
      customers: merchantsList.length, 
      commission: totalEarned, 
      tier: identity?.commission_tier ? String(identity.commission_tier).replace('_', ' ').replace('tier ', 'Tier ') : 'Tier 1', 
      isCurrentUser: true 
    },
    { rank: 3, name: 'Siti Sarah', sales: 8800, customers: 4, commission: 880, tier: 'Tier 1 (10%)', isCurrentUser: false },
    { rank: 4, name: 'Marcus Tan', sales: 6200, customers: 3, commission: 620, tier: 'Tier 1 (10%)', isCurrentUser: false },
  ];

  // Dynamic Activity Feed
  const activityFeed: any[] = [];
  
  // 1. Log registrations
  const sortedMerchants = [...fetchedMerchants].sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );
  sortedMerchants.slice(0, 3).forEach((m) => {
    activityFeed.push({
      id: `reg-${m.id}`,
      title: 'New Registration',
      body: `${m.name} completed signup using your referral link.`,
      time: m.created,
      icon: 'person_add',
      color: '#0040e0'
    });
  });

  // 2. Log commissions
  const sortedCommissions = [...(realCommissionsData?.data || [])].sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );
  sortedCommissions.slice(0, 3).forEach((c) => {
    const merch = fetchedMerchants.find(m => m.id === c.referred_merchant);
    const merchName = merch ? merch.name : 'referred store';
    activityFeed.push({
      id: `comm-${c.id}`,
      title: 'Commission Received',
      body: `Earned RM ${Number(c.commission_amount || 0).toFixed(2)} from ${merchName} transaction.`,
      time: String(c.created).substring(0, 10),
      icon: 'payments',
      color: '#10B981'
    });
  });

  // Sort activity feed by date/time
  activityFeed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Dynamic Sales Trend Chart Data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData: { [key: string]: { Sales: number; Commission: number } } = {};
  
  // Initialize last 6 months
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const label = months[d.getMonth()];
    monthlyData[label] = { Sales: 0, Commission: 0 };
  }

  // Populate from real commissions
  (realCommissionsData?.data || []).forEach((c: any) => {
    const date = new Date(c.created);
    const label = months[date.getMonth()];
    if (monthlyData[label] !== undefined) {
      monthlyData[label].Sales += (c.sales_amount || 0);
      monthlyData[label].Commission += (c.commission_amount || 0);
    }
  });

  const salesTrendData = Object.keys(monthlyData).map(name => ({
    name,
    Sales: monthlyData[name].Sales,
    Commission: monthlyData[name].Commission
  }));

  const clickActivityData = [
    { date: '07/06', clicks: 24 },
    { date: '07/07', clicks: 35 },
    { date: '07/08', clicks: 58 },
    { date: '07/09', clicks: 42 },
    { date: '07/10', clicks: 88 },
    { date: '07/11', clicks: 65 },
    { date: '07/12', clicks: 49 },
  ];

  const commissionsList = (realCommissionsData?.data || []).map((c: any) => {
    const merch = fetchedMerchants.find(m => m.id === c.referred_merchant);
    const merchName = merch ? merch.name : 'Referred Store';
    return {
      id: c.id,
      name: merchName,
      type: 'Stamp Campaign Commission',
      sales: c.sales_amount || 0,
      rate: c.commission_rate || 0.10,
      earning: c.commission_amount || 0,
      date: String(c.created).replace('T', ' ').substring(0, 16),
    };
  });

  return {
    identity,
    isLoading: isLoadingMerchants || isLoadingCommissions || isLoadingProspects,
    referralCode,
    referralLink,
    clicksCount,
    qrCodeUrl,
    merchantsList,
    inactiveProspects: allInactiveProspects,
    activeMerchants,
    dormantMerchants,
    totalEarned,
    monthlyCommission,
    totalSalesRevenue,
    acquiredCount,
    pendingCommissions,
    withdrawableCommission,
    totalCustomers,
    activeMembers,
    conversionRate,
    averageSpend,
    isDormant,
    leaderboardMock,
    activityFeed,
    salesTrendData,
    clickActivityData,
    commissionsList,
  };
};
