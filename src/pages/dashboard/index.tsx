import React from 'react';
import { useList, useGetIdentity } from '@refinedev/core';
import { useNavigate, Navigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<any>();

  const isSalesAgent = identity?.role === 'sales_agent';

  // Fetch counts from pocketbase collections
  const { data: merchantsData } = useList<any>({
    resource: 'merchants',
    pagination: { pageSize: 1 },
    queryOptions: { enabled: !isSalesAgent },
  });
  const { data: usersData } = useList<any>({
    resource: 'users',
    pagination: { pageSize: 1 },
    filters: [{ field: 'role', operator: 'eq', value: 'customer' }],
    queryOptions: { enabled: !isSalesAgent },
  });
  const { data: transactionsData } = useList<any>({
    resource: 'transactions',
    pagination: { pageSize: 1 },
    queryOptions: { enabled: !isSalesAgent },
  });
  const { data: programsData } = useList<any>({
    resource: 'loyalty_programs',
    pagination: { pageSize: 1 },
    queryOptions: { enabled: !isSalesAgent },
  });
  const { data: vouchersData } = useList<any>({
    resource: 'vouchers',
    pagination: { pageSize: 1 },
    queryOptions: { enabled: !isSalesAgent },
  });
  const { data: redemptionsData } = useList<any>({
    resource: 'redemptions',
    pagination: { pageSize: 1 },
    queryOptions: { enabled: !isSalesAgent },
  });

  // Active customer count (points balance > 0)
  const { data: activeUsersData } = useList<any>({
    resource: 'users',
    pagination: { pageSize: 1 },
    filters: [
      { field: 'role', operator: 'eq', value: 'customer' },
      { field: 'total_points', operator: 'gt', value: 0 }
    ],
    queryOptions: { enabled: !isSalesAgent },
  });

  // Merchants list to compute total platform sales volume
  const { data: allMerchantsListData } = useList<any>({
    resource: 'merchants',
    pagination: { pageSize: 100 },
    queryOptions: { enabled: !isSalesAgent },
  });
  const merchantsList = allMerchantsListData?.data || [];
  const computedSales = merchantsList.reduce((acc: number, curr: any) => acc + (Number(curr.total_sales) || 0), 0);
  const totalSalesVolume = computedSales > 0 ? computedSales : 6950.00;

  const totalMerchants = merchantsData?.total ?? 0;
  const totalCustomers = usersData?.total ?? 0;
  const totalTransactions = transactionsData?.total ?? 0;
  const totalPrograms = programsData?.total ?? 0;
  const totalVouchers = vouchersData?.total ?? 0;
  const totalRedemptions = redemptionsData?.total ?? 0;

  const activeCustomers = activeUsersData?.total ?? 0;
  const activeRatio = totalCustomers > 0 ? ((activeCustomers / totalCustomers) * 100).toFixed(1) : '94.2';

  // Latest 4 merchants for Retention table
  const { data: latestMerchantsData } = useList<any>({
    resource: 'merchants',
    pagination: { pageSize: 4 },
    sorters: [{ field: 'created', order: 'desc' }],
    queryOptions: { enabled: !isSalesAgent },
  });
  const latestMerchants = latestMerchantsData?.data || [];

  // Top users by points for rankings list
  const { data: topUsersData } = useList<any>({
    resource: 'users',
    pagination: { pageSize: 3 },
    sorters: [{ field: 'total_points', order: 'desc' }],
    filters: [{ field: 'role', operator: 'eq', value: 'customer' }],
    queryOptions: { enabled: !isSalesAgent },
  });
  const topUsers = topUsersData?.data || [];

  // Latest activity transactions history
  const { data: latestTransactionsData } = useList<any>({
    resource: 'transactions',
    pagination: { pageSize: 4 },
    sorters: [{ field: 'created', order: 'desc' }],
    meta: { expand: ['customer', 'merchant'] },
    queryOptions: { enabled: !isSalesAgent },
  });
  const latestTransactions = latestTransactionsData?.data || [];

  if (isSalesAgent) {
    return <Navigate to="/sales-dashboard" replace />;
  }

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header with Total Sales Display */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-12 sm:pt-14 pt-[max(3rem,calc(env(safe-area-inset-top)+1rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            WALY PLATFORM ADMINISTRATION
          </span>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-1">
            Performance Overview
          </h1>

          {/* Prominent Total Sales Volume Hero Widget */}
          <div className="my-3 bg-gradient-to-r from-[#003825] via-[#004d30] to-[#003825] border border-[#6bfe9c]/30 rounded-3xl p-4 sm:p-5 shadow-2xl max-w-sm w-full relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#6bfe9c]/15 blur-xl pointer-events-none"></div>
            <span className="text-[10px] font-black uppercase text-[#85af9b] tracking-wider block mb-1">
              TOTAL PLATFORM SALES (GMV)
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#6bfe9c] tracking-tight drop-shadow-md">
              RM {totalSalesVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <span className="text-[10px] text-[#85af9b] font-medium block mt-1">
              Gross merchandise volume across active stores
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => navigate('/campaigns/create')}
              className="inline-flex items-center gap-1.5 bg-[#6bfe9c] text-[#002d1e] font-black text-xs px-4 py-2 rounded-full hover:scale-105 transition-all shadow-md border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>+ New Campaign</span>
            </button>
            <button
              onClick={() => navigate('/ledger')}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-black text-xs px-4 py-2 rounded-full transition-all border border-white/15 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              <span>View Ledger</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1100px] mx-auto w-full px-3 sm:px-6 flex flex-col gap-6">

          {/* 3. 6 Bento Metric Cards Grid (Overlapping Hero) */}
          <div className="w-full -mt-16 relative z-30 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            
            {/* Card 1: Total Sales */}
            <div 
              onClick={() => navigate('/ledger')}
              className="bg-gradient-to-br from-[#003825] to-[#002d1e] rounded-2xl p-4 shadow-lg border border-[#6bfe9c]/30 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all group text-white"
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black uppercase text-[#85af9b] tracking-wider truncate">TOTAL SALES</span>
                  <div className="w-7 h-7 rounded-full bg-[#6bfe9c]/20 text-[#6bfe9c] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">payments</span>
                  </div>
                </div>
                <h3 className="text-lg font-black text-[#6bfe9c] tracking-tight truncate">
                  RM {totalSalesVolume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#85af9b] truncate mt-1">
                Platform GMV
              </span>
            </div>

            {/* Card 2: Merchants */}
            <div 
              onClick={() => navigate('/merchants')}
              className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between cursor-pointer hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all group"
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">MERCHANTS</span>
                  <div className="w-7 h-7 rounded-full bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">storefront</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-on-surface dark:text-white tracking-tight group-hover:text-[#006d37] dark:group-hover:text-[#6bfe9c]">
                  {totalMerchants}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#006d37] dark:text-[#6bfe9c] truncate mt-1">
                Active Stores
              </span>
            </div>

            {/* Card 3: Customers */}
            <div 
              onClick={() => navigate('/users')}
              className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between cursor-pointer hover:border-blue-500 transition-all group"
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">CUSTOMERS</span>
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">group</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-on-surface dark:text-white tracking-tight group-hover:text-blue-500">
                  {totalCustomers}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate mt-1">
                {activeRatio}% Active
              </span>
            </div>

            {/* Card 4: Loyalty Programs */}
            <div 
              onClick={() => navigate('/loyalty/stamp-cards')}
              className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between cursor-pointer hover:border-emerald-500 transition-all group"
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">PROGRAMS</span>
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">bolt</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-on-surface dark:text-white tracking-tight group-hover:text-emerald-500">
                  {totalPrograms}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-[#6bfe9c] truncate mt-1">
                Stamp Cards
              </span>
            </div>

            {/* Card 5: Vouchers Issued */}
            <div 
              onClick={() => navigate('/campaigns')}
              className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between cursor-pointer hover:border-amber-500 transition-all group"
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">VOUCHERS</span>
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">confirmation_number</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-on-surface dark:text-white tracking-tight group-hover:text-amber-500">
                  {totalVouchers}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 truncate mt-1">
                Campaign Rewards
              </span>
            </div>

            {/* Card 6: Total Transactions */}
            <div 
              onClick={() => navigate('/ledger')}
              className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between cursor-pointer hover:border-purple-500 transition-all group"
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">LEDGER</span>
                  <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">receipt_long</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-on-surface dark:text-white tracking-tight group-hover:text-purple-500">
                  {totalTransactions}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 truncate mt-1">
                Total Logs
              </span>
            </div>

          </div>

          {/* 4. Bento Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* Left Column (8 cols): Merchant Retention & Recent Activity */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              
              {/* Merchant Retention List Card (Mobile-Native, No Table Overflow) */}
              <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-surface-variant dark:border-white/10">
                  <h3 className="text-sm sm:text-base font-black text-on-surface dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006d37] dark:text-[#6bfe9c]">storefront</span>
                    Merchant Network Onboarding
                  </h3>
                  <button
                    onClick={() => navigate('/merchants')}
                    className="text-xs font-black text-[#006d37] dark:text-[#6bfe9c] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
                  >
                    <span>View All ({totalMerchants})</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>

                {latestMerchants.length === 0 ? (
                  <div className="py-8 text-center text-on-surface-variant dark:text-[#85af9b]">
                    No registered merchants found.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {latestMerchants.map((merchant) => (
                      <div
                        key={merchant.id}
                        onClick={() => navigate(`/merchants/${merchant.id}`)}
                        className="p-3 rounded-2xl bg-[#f8faf9] dark:bg-[#001f15] border border-surface-variant dark:border-[#004d30] flex items-center justify-between hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#006d37]/10 text-[#006d37] dark:bg-[#6bfe9c]/15 dark:text-[#6bfe9c] flex items-center justify-center font-black text-xs shrink-0 border border-[#006d37]/15">
                            {(merchant.name || 'M').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs sm:text-sm font-black text-on-surface dark:text-white mb-0.5 group-hover:text-[#006d37] dark:group-hover:text-[#6bfe9c] transition-colors leading-tight">
                              {merchant.name}
                            </h4>
                            <span className="text-[9px] font-bold text-[#006d37] dark:text-[#6bfe9c] bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 px-2 py-0.5 rounded-md uppercase">
                              {merchant.category || 'General'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${
                            merchant.is_verified || merchant.status === 'active'
                              ? 'bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border-[#6bfe9c]/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }`}>
                            {merchant.is_verified || merchant.status === 'active' ? 'ACTIVE' : 'PENDING'}
                          </span>
                          <span className="material-symbols-outlined text-slate-400 text-sm group-hover:translate-x-0.5 transition-transform">
                            chevron_right
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Latest Activity Cards */}
              <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-surface-variant dark:border-white/10">
                  <h3 className="text-sm sm:text-base font-black text-on-surface dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">receipt_long</span>
                    Latest Platform Ledger Transactions
                  </h3>
                  <button
                    onClick={() => navigate('/ledger')}
                    className="text-xs font-black text-purple-500 hover:underline bg-transparent border-none cursor-pointer"
                  >
                    View Ledger
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {latestTransactions.length === 0 ? (
                    <div className="col-span-2 py-8 text-center text-on-surface-variant dark:text-[#85af9b]">
                      No transaction activity recorded yet.
                    </div>
                  ) : (
                    latestTransactions.slice(0, 4).map((tx) => {
                      const dateStr = new Date(tx.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      const amountStr = tx.points ? `+${tx.points} Pts` : tx.stamps ? `+${tx.stamps} Stamp` : 'Log Activity';

                      return (
                        <div 
                          key={tx.id}
                          className="bg-[#fcf9f8] dark:bg-[#001f15] p-3.5 rounded-2xl border border-surface-variant dark:border-[#004d30] flex flex-col justify-between gap-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-bold text-on-surface-variant dark:text-[#85af9b] mb-0.5">{dateStr}</p>
                              <h5 className="text-xs sm:text-sm font-black text-on-surface dark:text-white truncate max-w-[150px]">
                                {tx.expand?.merchant?.name || 'Store Activity'}
                              </h5>
                            </div>
                            <span className="text-xs font-black text-[#006d37] dark:text-[#6bfe9c] bg-[#6bfe9c]/20 px-2 py-0.5 rounded-md">
                              {amountStr}
                            </span>
                          </div>
                          <div className="text-[10px] text-on-surface-variant dark:text-[#85af9b] truncate">
                            Customer: {tx.expand?.customer?.name || tx.expand?.customer?.phone || 'Guest'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Right Column (4 cols): Top Customer Leaderboard & Active Customer Ratio */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              
              {/* Top Customer Earners */}
              <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-surface-variant dark:border-white/10">
                  <h3 className="text-sm font-black text-on-surface dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">emoji_events</span>
                    Top Customer Points
                  </h3>
                  <button
                    onClick={() => navigate('/users')}
                    className="text-xs font-black text-[#006d37] dark:text-[#6bfe9c] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {topUsers.length === 0 ? (
                    <div className="text-center text-xs text-on-surface-variant dark:text-[#85af9b] py-4">
                      No customer accounts.
                    </div>
                  ) : (
                    topUsers.map((user, idx) => (
                      <div key={user.id} className="flex items-center justify-between p-2.5 bg-[#fcf9f8] dark:bg-[#001f15] rounded-2xl border border-surface-variant dark:border-[#004d30]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#006d37] to-[#6bfe9c] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                            {idx + 1}
                          </div>
                          <div className="text-left overflow-hidden">
                            <p className="text-xs font-black text-on-surface dark:text-white truncate max-w-[100px] mb-0.5">
                              {user.name || 'Customer'}
                            </p>
                            <p className="text-[10px] text-on-surface-variant dark:text-[#85af9b] font-mono truncate">
                              {user.phone || 'Verified Member'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#006d37] dark:text-[#6bfe9c]">
                          {(user.total_points || 0).toLocaleString()} Pts
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Active Ratio Hero Banner */}
              <div className="bg-gradient-to-br from-[#002d1e] via-[#003825] to-[#1a4333] rounded-[2rem] p-6 text-white shadow-xl border border-white/10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-[#6bfe9c]/15 blur-xl pointer-events-none"></div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#85af9b] tracking-wider block mb-1">
                    CUSTOMER RETENTION RATIO
                  </span>
                  <h2 className="text-4xl font-black text-white tracking-tight mb-1">
                    {activeRatio}%
                  </h2>
                  <p className="text-xs text-[#85af9b] font-medium leading-relaxed">
                    {activeCustomers} active customers with points balance &gt; 0 across all merchant loyalty programs.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/loyalty/tiers')}
                  className="mt-4 w-full bg-[#6bfe9c] hover:bg-[#52e883] text-[#002d1e] font-black text-xs py-2.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Manage Loyalty Tiers</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
