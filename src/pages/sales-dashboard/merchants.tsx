import React, { useState } from 'react';
import { Input, Modal, message } from 'antd';
import { useSalesData } from './useSalesData';
import type { ReferredMerchant } from './useSalesData';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';

export const SalesMerchantsPage: React.FC = () => {
  const { merchantsList, referralLink, identity, qrCodeUrl } = useSalesData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'pending'>('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<ReferredMerchant | null>(null);

  // Demo Fallback Data for visual preview if database has 0 records yet
  const demoMerchants: ReferredMerchant[] = [
    {
      id: 'm-101',
      name: 'Nasi Kandar Pelita (Bangsar)',
      category: 'F&B Restaurant',
      created: '2026-07-20',
      status: 'active',
      totalTransactions: 42,
      totalSales: 4850.00,
      commission: 485.00,
      phone: '+60123456789',
      lastActive: '2026-07-26',
    },
    {
      id: 'm-102',
      name: 'Brew & Bread Cafe',
      category: 'Cafe & Bakery',
      created: '2026-07-22',
      status: 'active',
      totalTransactions: 18,
      totalSales: 2100.00,
      commission: 210.00,
      phone: '+60198765432',
      lastActive: '2026-07-25',
    },
    {
      id: 'm-103',
      name: 'Barberia Classic Hair Salon',
      category: 'Beauty & Wellness',
      created: '2026-07-24',
      status: 'pending',
      totalTransactions: 0,
      totalSales: 0.00,
      commission: 0.00,
      phone: '+60173334444',
      lastActive: '2026-07-24',
    },
  ];

  const displayList = merchantsList.length > 0 ? merchantsList : demoMerchants;

  const filteredList = displayList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalNetworkRevenue = displayList.reduce((acc, m) => acc + m.totalSales, 0);
  const totalCommissionEarned = displayList.reduce((acc, m) => acc + m.commission, 0);
  const activeCount = displayList.filter(m => m.status === 'active').length;

  const openOutreachDrawer = (merchant: ReferredMerchant) => {
    setSelectedMerchant(merchant);
    setDrawerVisible(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    message.success('Referral link copied to clipboard!');
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            MY REFERRED NETWORK
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            My Merchants (Kedai Saya)
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-5 font-medium leading-relaxed">
            Manage all merchant stores registered under your referral account, track sales performance, and launch 1-tap WhatsApp outreach.
          </p>

          <button
            onClick={() => setShareModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#6bfe9c] text-[#002d1e] font-black text-xs sm:text-sm px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-lg border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Invite New Merchant</span>
          </button>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1000px] mx-auto w-full px-3 sm:px-6 flex flex-col gap-6">

          {/* 3. Top 3 Summary Cards (Overlapping Hero) */}
          <div className="w-full -mt-16 relative z-30 grid grid-cols-3 gap-2.5 sm:gap-4">
            
            {/* Stat 1: Total Referred Stores */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">REFERRED STORES</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">storefront</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-on-surface dark:text-white tracking-tight">
                  {displayList.length}
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#006d37] dark:text-[#6bfe9c] truncate mt-1">
                {activeCount} Active Stores
              </span>
            </div>

            {/* Stat 2: Total Network Sales */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">NETWORK SALES</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">payments</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-on-surface dark:text-white tracking-tight truncate">
                  RM {totalNetworkRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-on-surface-variant dark:text-[#85af9b] truncate mt-1">
                Total merchant GMV
              </span>
            </div>

            {/* Stat 3: Total Commission Earned */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">COMMISSIONS</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">savings</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-[#006d37] dark:text-[#6bfe9c] tracking-tight truncate">
                  RM {totalCommissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#006d37] dark:text-[#6bfe9c] truncate mt-1">
                10% Partner Rate
              </span>
            </div>

          </div>

          {/* 4. Controls & Filters Card */}
          <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant dark:border-white/10">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input
                  type="text"
                  placeholder="Search store name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f6f3f2] dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-on-surface dark:text-white outline-none focus:border-[#006d37] dark:focus:border-[#6bfe9c] transition-all"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 bg-[#f6f3f2] dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 shrink-0">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                    selectedStatus === 'all'
                      ? 'bg-[#006d37] text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#85af9b] bg-transparent hover:text-slate-900'
                  }`}
                >
                  All ({displayList.length})
                </button>
                <button
                  onClick={() => setSelectedStatus('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                    selectedStatus === 'active'
                      ? 'bg-[#006d37] text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#85af9b] bg-transparent hover:text-slate-900'
                  }`}
                >
                  Active ({displayList.filter(m => m.status === 'active').length})
                </button>
                <button
                  onClick={() => setSelectedStatus('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                    selectedStatus === 'pending'
                      ? 'bg-[#006d37] text-white shadow-sm'
                      : 'text-slate-600 dark:text-[#85af9b] bg-transparent hover:text-slate-900'
                  }`}
                >
                  Pending ({displayList.filter(m => m.status === 'pending').length})
                </button>
              </div>

            </div>

            {/* Merchant Cards List */}
            {filteredList.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant dark:text-[#85af9b]">
                <div className="w-14 h-14 rounded-2xl bg-[#006d37]/10 text-[#006d37] dark:text-[#6bfe9c] mx-auto flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl font-bold">storefront</span>
                </div>
                <h4 className="text-base font-bold text-on-surface dark:text-white mb-1">No referred merchants found</h4>
                <p className="text-xs text-on-surface-variant dark:text-[#85af9b] max-w-sm mx-auto mb-4">
                  Share your referral link with local businesses to onboard them onto the risev Merchant Loyalty network.
                </p>
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="bg-[#006d37] hover:bg-[#004d27] text-white font-bold text-xs px-5 py-2.5 rounded-xl border-none cursor-pointer shadow-md inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">share</span>
                  <span>Share Referral Link</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {filteredList.map((merchant) => (
                  <div 
                    key={merchant.id}
                    className="bg-[#fcf9f8] dark:bg-[#001f15] rounded-2xl p-4 border border-surface-variant dark:border-[#004d30] flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                  >
                    {/* Card Top: Avatar, Title & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#006d37] to-[#1a4333] text-[#6bfe9c] flex items-center justify-center font-black text-sm shadow-md shrink-0">
                          {merchant.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-on-surface dark:text-white leading-tight mb-0.5 group-hover:text-[#006d37] dark:group-hover:text-[#6bfe9c] transition-colors">
                            {merchant.name}
                          </h4>
                          <span className="text-[10px] font-bold text-on-surface-variant dark:text-[#85af9b] uppercase tracking-wider">
                            {merchant.category}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        merchant.status === 'active' 
                          ? 'bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border-[#6bfe9c]/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}>
                        {merchant.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Card Middle: Key Financial Metrics */}
                    <div className="bg-white dark:bg-[#002518] rounded-xl p-3 mb-3 border border-surface-variant dark:border-[#004d30] grid grid-cols-2 gap-2 text-left">
                      <div>
                        <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider block">SALES VOLUME</span>
                        <span className="text-xs font-black text-on-surface dark:text-white">
                          RM {merchant.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider block">EARNED COMMISSION</span>
                        <span className="text-xs font-black text-[#006d37] dark:text-[#6bfe9c]">
                          +RM {merchant.commission.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Card Bottom: Outreach Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface-variant dark:border-white/5">
                      <span className="text-[10px] text-on-surface-variant dark:text-[#85af9b] font-medium">
                        Joined {merchant.created}
                      </span>

                      <button
                        onClick={() => openOutreachDrawer(merchant)}
                        className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-3 py-1.5 rounded-xl font-bold text-xs border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span>WhatsApp</span>
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

      {/* Invite New Merchant / Referral Link Modal */}
      <Modal
        title={null}
        open={shareModalOpen}
        onCancel={() => setShareModalOpen(false)}
        footer={null}
        width={400}
        centered
        styles={{ body: { padding: '24px', borderRadius: '24px' } }}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#6bfe9c]/20 text-[#006d37] mx-auto flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-2xl font-bold">person_add</span>
          </div>
          <h3 className="text-lg font-black text-on-surface mb-1">Invite New Store</h3>
          <p className="text-xs text-on-surface-variant mb-4">
            Share your unique referral link or QR code with local merchant store owners.
          </p>

          {/* QR Code Display */}
          <div className="bg-[#f6f3f2] p-4 rounded-2xl mb-4 border border-slate-200 flex flex-col items-center">
            <img src={qrCodeUrl} alt="Referral QR Code" className="w-36 h-36 rounded-xl shadow-md mb-2 bg-white p-2" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scan to Register</span>
          </div>

          {/* Copyable Link */}
          <div className="flex items-center gap-2 bg-[#f6f3f2] p-2 pl-3 rounded-xl border border-slate-200 mb-4">
            <span className="text-xs font-mono text-slate-700 truncate flex-1 text-left">{referralLink}</span>
            <button
              onClick={handleCopyLink}
              className="bg-[#006d37] hover:bg-[#004d27] text-white px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer shrink-0"
            >
              Copy
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const text = encodeURIComponent(`Hi! Register your store on risev app using my partner referral link: ${referralLink}`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-3 rounded-xl font-bold text-xs border-none cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
