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
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Performance Overview</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Real-time loyalty and sales analytics</p>
        </div>
        <button 
          onClick={() => navigate('/campaigns/create')}
          className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl font-headline font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all border-none"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Campaign
        </button>
      </div>

      {/* KPI Grid (6 cards style exactly from code.html) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-gutter mb-8">
        {/* Merchants */}
        <div className="glass-panel p-glass-padding rounded-3xl flex flex-col gap-2 relative overflow-hidden group cursor-pointer" onClick={() => navigate('/merchants')}>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">storefront</span>
            </div>
            <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">Active</span>
          </div>
          <div>
            <p className="font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Merchants</p>
            <h3 className="font-headline text-xl font-bold">{totalMerchants}</h3>
          </div>
        </div>

        {/* Customers */}
        <div className="glass-panel p-glass-padding rounded-3xl flex flex-col gap-2 relative overflow-hidden cursor-pointer" onClick={() => navigate('/users')}>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <span className="bg-primary-container text-white px-2 py-0.5 rounded-full text-[10px] font-bold">Users</span>
          </div>
          <div>
            <p className="font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Customers</p>
            <h3 className="font-headline text-xl font-bold">{totalCustomers}</h3>
          </div>
        </div>

        {/* Active Programs */}
        <div className="glass-panel p-glass-padding rounded-3xl flex flex-col gap-2 relative overflow-hidden cursor-pointer" onClick={() => navigate('/loyalty/stamp-cards')}>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">bolt</span>
            </div>
            <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">Active</span>
          </div>
          <div>
            <p className="font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Loyalty Programs</p>
            <h3 className="font-headline text-xl font-bold">{totalPrograms}</h3>
          </div>
        </div>

        {/* Vouchers Issued */}
        <div className="glass-panel p-glass-padding rounded-3xl flex flex-col gap-2 relative overflow-hidden bg-primary/5 cursor-pointer" onClick={() => navigate('/campaigns')}>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white">payments</span>
            </div>
            <span className="bg-white/50 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">Vouchers</span>
          </div>
          <div>
            <p className="font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Vouchers Issued</p>
            <h3 className="font-headline text-xl font-bold">{totalVouchers}</h3>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="glass-panel p-glass-padding rounded-3xl flex flex-col gap-2 relative overflow-hidden cursor-pointer" onClick={() => navigate('/ledger')}>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
            </div>
            <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">Ledger</span>
          </div>
          <div>
            <p className="font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Transactions</p>
            <h3 className="font-headline text-xl font-bold">{totalTransactions}</h3>
          </div>
        </div>

        {/* Redemptions */}
        <div className="glass-panel p-glass-padding rounded-3xl flex flex-col gap-2 relative overflow-hidden cursor-pointer" onClick={() => navigate('/rewards')}>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">local_mall</span>
            </div>
            <span className="bg-primary-container text-white px-2 py-0.5 rounded-full text-[10px] font-bold">Redeemed</span>
          </div>
          <div>
            <p className="font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Redemptions</p>
            <h3 className="font-headline text-xl font-bold">{totalRedemptions}</h3>
          </div>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter mb-12">
        {/* Merchant Follow-up & Retention Table Section (col-span-8) */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-[2rem] p-gutter overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-lg font-bold text-on-surface">Merchant Follow-up &amp; Retention</h3>
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors border-none bg-transparent flex items-center">
              <span className="material-symbols-outlined text-outline">more_horiz</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Merchant Name</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Last Activity</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Health Status</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body">
                {latestMerchants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-on-surface-variant text-sm">
                      No merchants found.
                    </td>
                  </tr>
                ) : (
                  latestMerchants.map((merchant) => (
                    <tr key={merchant.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {(merchant.name || 'M').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-headline text-sm font-semibold text-on-surface">{merchant.name}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase">{merchant.category || 'Other'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 text-sm text-on-surface-variant">
                        {new Date(merchant.updated).toLocaleDateString()}
                      </td>
                      <td className="py-5">
                        {merchant.is_verified ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Verified</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">Pending</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => navigate(`/merchants`)}
                          className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Widget: Sales Team Performance & Weekly Retention (col-span-4) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
          {/* Top Points Earners widget */}
          <div className="glass-panel rounded-[2rem] p-gutter flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-sm font-bold text-on-surface">Top Points Earners</h3>
              <span 
                onClick={() => navigate('/users')}
                className="material-symbols-outlined text-outline cursor-pointer"
              >
                open_in_new
              </span>
            </div>
            <div className="space-y-6 font-body">
              {topUsers.length === 0 ? (
                <div className="text-center text-xs text-on-surface-variant py-4">
                  No customers found.
                </div>
              ) : (
                topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm flex items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                        {(user.name || 'U').slice(0, 2).toUpperCase()}
                        <div className="absolute -right-1 bottom-0 bg-secondary-container rounded-full w-4 h-4 flex items-center justify-center border border-white">
                          <span className="text-[8px] font-bold text-on-secondary-container">{index + 1}</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-headline text-sm font-semibold text-on-surface truncate max-w-[120px]">
                          {user.name || 'Anonymous'}
                        </p>
                        <p className="text-[10px] text-on-surface-variant truncate max-w-[120px]">
                          {user.phone || 'No Phone'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-sm">{(user.total_points || 0).toLocaleString()} Pts</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => navigate('/users')}
              className="mt-8 w-full py-3 rounded-xl border border-solid border-primary/20 text-primary font-bold text-xs bg-transparent hover:bg-primary/5 transition-colors cursor-pointer"
            >
              View All Customers
            </button>
          </div>

          {/* Retention Visual Card */}
          <div className="glass-panel rounded-[2rem] p-gutter relative overflow-hidden bg-primary text-white h-48 flex flex-col justify-end">
            <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary-container/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 text-left">
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1 font-semibold">Active Customers Ratio</p>
              <h4 className="text-[42px] font-black leading-none mb-1">{activeRatio}%</h4>
              <p className="text-xs opacity-90">Customers with points balance &gt; 0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Large Detail Card Section (exactly from code.html) */}
      <div className="grid grid-cols-12 gap-gutter mb-12">
        {/* Left: Latest Activity */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-[2.5rem] p-container-padding flex flex-col gap-gutter">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold">Latest Platform Activity</h3>
            <div 
              onClick={() => navigate('/ledger')}
              className="p-2 rounded-full bg-white/50 cursor-pointer flex items-center"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">tune</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestTransactions.length === 0 ? (
              <div className="col-span-2 py-20 text-center text-on-surface-variant text-sm font-body">
                No recent transaction logs.
              </div>
            ) : (
              latestTransactions.slice(0, 4).map((tx, idx) => {
                const dateStr = new Date(tx.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                const amountStr = tx.points ? `+${tx.points} Pts` : tx.stamps ? `+${tx.stamps} Stamp` : '0 Activity';
                const customerInitials = (tx.expand?.customer?.name || 'U').slice(0, 2).toUpperCase();
                const merchantInitials = (tx.expand?.merchant?.name || 'M').slice(0, 2).toUpperCase();
                
                const bgClasses = idx === 0 
                  ? "bg-primary p-6 rounded-[2rem] text-white flex flex-col justify-between h-48 shadow-xl shadow-primary/20"
                  : idx === 1 
                  ? "bg-secondary-container p-6 rounded-[2rem] text-on-secondary-container flex flex-col justify-between h-48"
                  : idx === 2
                  ? "bg-black/90 p-6 rounded-[2rem] text-white flex flex-col justify-between h-48"
                  : "bg-white/40 border border-solid border-white p-6 rounded-[2rem] text-on-surface flex flex-col justify-between h-48";
                
                const textClasses = (idx === 0 || idx === 2) ? "text-white" : "text-on-surface";
                const metaTextClasses = (idx === 0 || idx === 2) ? "text-white/60" : "text-on-surface-variant";
                const subtitleClasses = (idx === 0 || idx === 2) ? "text-white/80" : "text-on-surface-variant";

                return (
                  <div key={tx.id} className={bgClasses}>
                    <div>
                      <div className="flex justify-between items-start">
                        <p className={`text-xs font-medium ${metaTextClasses}`}>{dateStr}</p>
                        <span className={`material-symbols-outlined opacity-60 ${textClasses}`}>more_vert</span>
                      </div>
                      <h4 className={`font-headline text-sm font-semibold mt-1 truncate ${textClasses}`}>
                        {tx.expand?.merchant?.name || 'Store Activity'}
                      </h4>
                      <p className={`text-[10px] mt-1 ${subtitleClasses} truncate`}>
                        Customer: {tx.expand?.customer?.phone || tx.expand?.customer?.name || 'Guest'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`font-headline text-2xl font-black ${textClasses}`}>{amountStr}</span>
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-200 flex items-center justify-center text-[10px] font-bold text-primary">
                          {customerInitials}
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-300 flex items-center justify-center text-[10px] font-bold text-primary">
                          {merchantInitials}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Administrator Profile */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center glass-panel rounded-[2rem] p-8">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-solid border-white shadow-xl mb-4 bg-primary/10 flex items-center justify-center">
              {identity?.avatar ? (
                <img src={identity.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[64px] text-primary">account_circle</span>
              )}
            </div>
            <h4 className="font-headline text-lg font-bold text-on-surface leading-tight">
              {identity?.name || 'Admin Account'}
            </h4>
            <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-wider font-semibold text-primary">
              {identity?.role || 'Super Admin'}
            </p>
          </div>

          <div className="glass-panel rounded-[2rem] p-6 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h5 className="font-headline text-sm font-bold text-on-surface">Detailed Information</h5>
              <span className="material-symbols-outlined text-outline cursor-pointer" onClick={() => navigate('/admin-users')}>north_east</span>
            </div>
            <div className="space-y-4 font-body">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[10px] text-outline uppercase font-semibold">User ID</p>
                  <p className="text-sm font-semibold text-on-surface truncate max-w-[180px]">{identity?.id || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[10px] text-outline uppercase font-semibold">Email Address</p>
                  <p className="text-sm font-semibold text-on-surface truncate max-w-[180px]">{identity?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[10px] text-outline uppercase font-semibold">Role Privilege</p>
                  <p className="text-sm font-semibold text-on-surface truncate uppercase">{identity?.role || 'Super Admin'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
