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
    pagination: { pageSize: 100 },
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

  // 2c. Query real sales agents from PocketBase for the Leaderboard
  const { data: salesAgentsData, isLoading: isLoadingAgents } = useList<any>({
    resource: 'sales_agents',
    pagination: { pageSize: 50 },
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
      phone: m.phone || '',
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
    name: p.name || `Prospect (${p.phone})`,
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

  // Analytics Stats calculated from real merchant records
  const totalCustomers = merchantsList.reduce((acc, curr) => acc + curr.totalTransactions, 0);
  const activeMembers = merchantsList.filter(m => m.totalTransactions > 0).length;
  const conversionRate = clicksCount > 0
    ? ((merchantsList.length / clicksCount) * 100).toFixed(2)
    : '0.00';
  const averageSpend = totalSalesRevenue / ((realCommissionsData?.data || []).length || 1);

  // Real Leaderboard computed from PocketBase sales_agents collection
  const realLeaderboard = (salesAgentsData?.data || []).map((agent: any, idx: number) => {
    const isCurrent = agent.id === identity?.id;
    return {
      rank: idx + 1,
      name: agent.name || agent.email || 'Partner Agent',
      sales: agent.total_sales || (isCurrent ? totalSalesRevenue : 0),
      customers: agent.merchants_count || (isCurrent ? merchantsList.length : 0),
      commission: agent.lifetime_earnings || (isCurrent ? totalEarned : 0),
      tier: agent.commission_tier ? String(agent.commission_tier).replace('_', ' ').replace('tier ', 'Tier ') : 'Tier 1 (10%)',
      isCurrentUser: isCurrent,
    };
  });

  const leaderboardMock = realLeaderboard.length > 0 ? realLeaderboard : [
    {
      rank: 1,
      name: identity?.name || 'Agent Partner',
      sales: totalSalesRevenue,
      customers: merchantsList.length,
      commission: totalEarned,
      tier: identity?.commission_tier ? String(identity.commission_tier).replace('_', ' ').replace('tier ', 'Tier ') : 'Tier 1 (10%)',
      isCurrentUser: true,
    }
  ];

  // Dynamic Activity Feed built from real database events
  const activityFeed: any[] = [];
  
  // 1. Log registrations
  const sortedMerchants = [...fetchedMerchants].sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );
  sortedMerchants.slice(0, 5).forEach((m) => {
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
  sortedCommissions.slice(0, 5).forEach((c) => {
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

  // Dynamic Sales Trend Chart Data (Last 6 Months up to current month)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData: { [key: string]: { Sales: number; Commission: number } } = {};
  
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

  // Dynamic Click Activity Data (Last 7 Days dynamically ending today)
  const clickActivityData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateLabel = `${month}/${day}`;

    // Compute or project daily click breakdown from real total clicks & merchant signups
    const baseDaily = clicksCount > 0 ? Math.round(clicksCount / 7) : 0;
    const clickVariance = clicksCount > 0 ? Math.round(baseDaily * (0.5 + (i % 3) * 0.3)) : 0;
    
    clickActivityData.push({
      date: dateLabel,
      clicks: Math.max(0, clickVariance),
    });
  }

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
    isLoading: isLoadingMerchants || isLoadingCommissions || isLoadingProspects || isLoadingAgents,
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
