import React, { useState } from 'react';
import { useSalesData } from './useSalesData';
import type { ReferredMerchant } from './useSalesData';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';
import { CreateProspectModal } from '../../components/CreateProspectModal';

export const SalesProspectsPage: React.FC = () => {
  const { inactiveProspects, referralLink, identity } = useSalesData();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<ReferredMerchant | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Demo Fallback Data for visual preview if database has 0 prospects currently
  const demoProspects: ReferredMerchant[] = [
    {
      id: 'p-101',
      name: 'Restoran Ayam Penyet Ria',
      category: 'F&B Restaurant',
      created: '2026-07-25',
      status: 'pending',
      totalTransactions: 0,
      totalSales: 0.00,
      commission: 0.00,
      phone: '+60134445555',
      lastActive: '2 days ago',
    },
    {
      id: 'p-102',
      name: 'Glow Spa & Wellness',
      category: 'Beauty & Health',
      created: '2026-07-24',
      status: 'pending',
      totalTransactions: 0,
      totalSales: 0.00,
      commission: 0.00,
      phone: '+60189991111',
      lastActive: '3 days ago',
    },
  ];

  const displayList = inactiveProspects.length > 0 ? inactiveProspects : demoProspects;

  const filteredProspects = displayList.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openFollowUpDrawer = (merchant: ReferredMerchant) => {
    setSelectedMerchant(merchant);
    setDrawerVisible(true);
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-blue-400/15 text-blue-300 text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-blue-400/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            LEAD PIPELINE & ONBOARDING
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Pending Leads (Prospek Belum Aktif)
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-5 font-medium leading-relaxed">
            Registered merchant leads waiting for onboarding support. Send WhatsApp setup guides to convert leads into active stores.
          </p>

          <button
            onClick={() => setCreateModalVisible(true)}
            className="inline-flex items-center gap-2 bg-[#6bfe9c] text-[#002d1e] font-black text-xs sm:text-sm px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-lg border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Create New Prospect</span>
          </button>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1000px] mx-auto w-full px-3 sm:px-6 flex flex-col gap-6">

          {/* 3. Top 3 Conversion Summary Cards (Overlapping Hero) */}
          <div className="w-full -mt-16 relative z-30 grid grid-cols-3 gap-2.5 sm:gap-4">
            
            {/* Stat 1: Pending Leads */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">PENDING LEADS</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">person_add</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-on-surface dark:text-white tracking-tight">
                  {displayList.length}
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400 truncate mt-1">
                Awaiting Setup
              </span>
            </div>

            {/* Stat 2: Target Conversion Rate */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">TARGET RATE</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">target</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-[#006d37] dark:text-[#6bfe9c] tracking-tight truncate">
                  75.0%
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-on-surface-variant dark:text-[#85af9b] truncate mt-1">
                Conversion Goal
              </span>
            </div>

            {/* Stat 3: Avg Setup Time */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">AVG SETUP</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">schedule</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-on-surface dark:text-white tracking-tight truncate">
                  {'<'} 24h
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 truncate mt-1">
                Fast Onboarding
              </span>
            </div>

          </div>

          {/* 4. Controls & Prospects List Card */}
          <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant dark:border-white/10">
              <h3 className="text-sm sm:text-base font-black text-on-surface dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">group</span>
                Registered Lead Pipeline ({filteredProspects.length})
              </h3>

              {/* Search Bar */}
              <div className="relative w-full sm:w-[240px]">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                <input
                  type="text"
                  placeholder="Search lead or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#f6f3f2] dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs text-on-surface dark:text-white outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Prospects Cards List */}
            {filteredProspects.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant dark:text-[#85af9b]">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl font-bold">verified</span>
                </div>
                <h4 className="text-base font-bold text-on-surface dark:text-white mb-1">No inactive prospects found!</h4>
                <p className="text-xs text-on-surface-variant dark:text-[#85af9b] max-w-sm mx-auto mb-4">
                  Great onboarding speed! All registered leads have successfully launched active loyalty campaigns.
                </p>
                <button
                  onClick={() => setCreateModalVisible(true)}
                  className="bg-[#006d37] hover:bg-[#004d27] text-white font-bold text-xs px-5 py-2.5 rounded-xl border-none cursor-pointer shadow-md inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
                  <span>Add New Prospect Lead</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {filteredProspects.map((prospect) => (
                  <div 
                    key={prospect.id}
                    className="bg-[#fcf9f8] dark:bg-[#001f15] rounded-2xl p-4 border border-blue-500/20 dark:border-blue-500/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                  >
                    {/* Top Info */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm shadow-sm shrink-0 border border-blue-500/20">
                          {prospect.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-on-surface dark:text-white leading-tight mb-0.5 group-hover:text-blue-500 transition-colors">
                            {prospect.name}
                          </h4>
                          <span className="text-[10px] font-bold text-on-surface-variant dark:text-[#85af9b] uppercase tracking-wider">
                            {prospect.category}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">pending</span>
                        Pending Setup
                      </span>
                    </div>

                    {/* Meta Details */}
                    <div className="bg-white dark:bg-[#002518] rounded-xl p-3 mb-3 border border-surface-variant dark:border-[#004d30] flex items-center justify-between text-left text-xs">
                      <div>
                        <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider block">CONTACT</span>
                        <span className="font-mono font-bold text-on-surface dark:text-white">{prospect.phone || 'No phone'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider block">REGISTERED</span>
                        <span className="font-semibold text-on-surface dark:text-white">{prospect.created}</span>
                      </div>
                    </div>

                    {/* WhatsApp Setup Nudge CTA */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface-variant dark:border-white/5">
                      <span className="text-[10px] text-on-surface-variant dark:text-[#85af9b] font-medium">
                        Setup Assistance Required
                      </span>

                      <button
                        onClick={() => openFollowUpDrawer(prospect)}
                        className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-3.5 py-2 rounded-xl font-black text-xs border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span>WhatsApp Setup Nudge</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* WhatsApp Outreach Drawer */}
      <WhatsAppDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        merchant={selectedMerchant}
        referralLink={referralLink}
        agentName={identity?.name}
      />

      {/* Create Prospect Modal */}
      <CreateProspectModal
        open={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={() => window.location.reload()}
      />

    </div>
  );
};
