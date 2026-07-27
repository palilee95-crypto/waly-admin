import React, { useState } from 'react';
import { useSalesData } from './useSalesData';
import type { ReferredMerchant } from './useSalesData';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';

export const SalesDormantPage: React.FC = () => {
  const { dormantMerchants, referralLink, identity } = useSalesData();
  const [searchQuery, setSearchQuery] = useState('');
  const [inactivityFilter, setInactivityFilter] = useState<'all' | '7days' | '14days'>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<ReferredMerchant | null>(null);

  // Demo Fallback Data for visual preview if database has 0 dormant stores currently
  const demoDormantMerchants: ReferredMerchant[] = [
    {
      id: 'd-101',
      name: 'Kopi & Toast Corner',
      category: 'F&B Cafe',
      created: '2026-06-15',
      status: 'active',
      totalTransactions: 64,
      totalSales: 3200.00,
      commission: 320.00,
      phone: '+60128889999',
      lastActive: '10 days ago',
    },
    {
      id: 'd-102',
      name: 'Urban Cuts Barber Shop',
      category: 'Hair & Beauty',
      created: '2026-06-18',
      status: 'active',
      totalTransactions: 28,
      totalSales: 1950.00,
      commission: 195.00,
      phone: '+60172223333',
      lastActive: '14 days ago',
    },
  ];

  const displayList = dormantMerchants.length > 0 ? dormantMerchants : demoDormantMerchants;

  const filteredDormant = displayList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const atRiskCommissionTotal = displayList.reduce((sum, m) => sum + (m.commission || 0), 0);

  const openFollowUpDrawer = (merchant: ReferredMerchant) => {
    setSelectedMerchant(merchant);
    setDrawerVisible(true);
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-300 text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-amber-400/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            RETENTION & CHURN PREVENTION
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Dormant Merchant Hub
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-2 font-medium leading-relaxed">
            Re-engage store partners inactive for 7+ days to protect your monthly partner commission payouts.
          </p>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1000px] mx-auto w-full px-3 sm:px-6 flex flex-col gap-6">

          {/* 3. Top 3 At-Risk Summary Cards (Overlapping Hero) */}
          <div className="w-full -mt-16 relative z-30 grid grid-cols-3 gap-2.5 sm:gap-4">
            
            {/* Stat 1: Dormant Stores */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">DORMANT STORES</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">hourglass_empty</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-on-surface dark:text-white tracking-tight">
                  {displayList.length}
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 truncate mt-1">
                Inactive {'>'}7 Days
              </span>
            </div>

            {/* Stat 2: At-Risk Commission */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">AT-RISK EARNINGS</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">warning</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-red-500 dark:text-red-400 tracking-tight truncate">
                  RM {atRiskCommissionTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-on-surface-variant dark:text-[#85af9b] truncate mt-1">
                Monthly potential
              </span>
            </div>

            {/* Stat 3: Re-engagement Goal */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">RE-ENGAGEMENT</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">published_with_changes</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-[#006d37] dark:text-[#6bfe9c] tracking-tight truncate">
                  85.4%
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#006d37] dark:text-[#6bfe9c] truncate mt-1">
                Target Reactivation
              </span>
            </div>

          </div>

          {/* 4. Filter Toolbar & Search Card */}
          <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant dark:border-white/10">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input
                  type="text"
                  placeholder="Search dormant store..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f6f3f2] dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-on-surface dark:text-white outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Inactivity Filter Pills */}
              <div className="flex items-center gap-1.5 bg-[#f6f3f2] dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 shrink-0">
                <button
                  onClick={() => setInactivityFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                    inactivityFilter === 'all'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#85af9b] bg-transparent hover:text-slate-900'
                  }`}
                >
                  All Inactive ({displayList.length})
                </button>
                <button
                  onClick={() => setInactivityFilter('7days')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                    inactivityFilter === '7days'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#85af9b] bg-transparent hover:text-slate-900'
                  }`}
                >
                  {'>'}7 Days
                </button>
              </div>

            </div>

            {/* Dormant Merchants Cards */}
            {filteredDormant.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant dark:text-[#85af9b]">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl font-bold">verified</span>
                </div>
                <h4 className="text-base font-bold text-on-surface dark:text-white mb-1">No dormant stores found!</h4>
                <p className="text-xs text-on-surface-variant dark:text-[#85af9b] max-w-sm mx-auto">
                  All your referred store partners are actively issuing customer loyalty stamps!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {filteredDormant.map((merchant) => (
                  <div 
                    key={merchant.id}
                    className="bg-[#fcf9f8] dark:bg-[#001f15] rounded-2xl p-4 border border-amber-500/20 dark:border-amber-500/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                  >
                    {/* Top Info */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm shadow-sm shrink-0 border border-amber-500/20">
                          {merchant.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-on-surface dark:text-white leading-tight mb-0.5 group-hover:text-amber-500 transition-colors">
                            {merchant.name}
                          </h4>
                          <span className="text-[10px] font-bold text-on-surface-variant dark:text-[#85af9b] uppercase tracking-wider">
                            {merchant.category}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {merchant.lastActive || 'Inactive'}
                      </span>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-white dark:bg-[#002518] rounded-xl p-3 mb-3 border border-surface-variant dark:border-[#004d30] grid grid-cols-2 gap-2 text-left">
                      <div>
                        <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider block">PAST SALES</span>
                        <span className="text-xs font-black text-on-surface dark:text-white">
                          RM {merchant.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider block">COMMISSION AT RISK</span>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                          RM {merchant.commission.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Re-engagement Action CTA */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface-variant dark:border-white/5">
                      <span className="text-[10px] text-on-surface-variant dark:text-[#85af9b] font-medium">
                        {merchant.totalTransactions} total stamps
                      </span>

                      <button
                        onClick={() => openFollowUpDrawer(merchant)}
                        className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-3.5 py-2 rounded-xl font-black text-xs border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">campaign</span>
                        <span>Send Promo Campaign</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* WhatsApp Re-engagement Drawer */}
      <WhatsAppDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        merchant={selectedMerchant}
        referralLink={referralLink}
        agentName={identity?.name}
      />

    </div>
  );
};
