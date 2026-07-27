import React, { useState } from 'react';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSalesData } from './useSalesData';
import { WhatsAppConnectCard } from './components/WhatsAppConnectCard';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';
import { CreateProspectModal } from '../../components/CreateProspectModal';

export const SalesDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    identity,
    referralCode,
    referralLink,
    clicksCount,
    qrCodeUrl,
    merchantsList,
    activeMerchants,
    totalEarned,
    monthlyCommission,
    totalSalesRevenue,
    acquiredCount,
    withdrawableCommission,
    activityFeed,
    leaderboardMock,
  } = useSalesData();

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createProspectVisible, setCreateProspectVisible] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // Copy/Share Functions
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    message.success('Referral link copied to clipboard!');
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-4 overflow-x-hidden">
      {/* 1. Top Section (Gradient Hero - Dynamic Island & Safe Area Supported) */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-14 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
        {/* Top AppBar */}
        <header className="flex justify-between items-center w-full mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-sm shrink-0 bg-[#1a4333] flex items-center justify-center">
              {identity?.avatar ? (
                <img alt="Profile Picture" className="w-full h-full object-cover" src={identity.avatar} />
              ) : (
                <span className="font-bold text-white text-base">
                  {identity?.name?.substring(0, 2).toUpperCase() || 'AG'}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[#85af9b]">Welcome back</span>
              <span className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {identity?.name || 'Agent Partner'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateProspectVisible(true)}
              className="w-10 h-10 rounded-full bg-[#6bfe9c] text-[#002d1e] hover:scale-105 transition-all flex items-center justify-center shadow-md border-none cursor-pointer"
              title="Add Prospect"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">person_add</span>
            </button>
            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center backdrop-blur-sm border border-white/10 text-white cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-white text-[20px]">notifications</span>
            </button>
          </div>
        </header>

        {/* Main Balance / Monthly Sale Display (Exact Picture 2 layout) */}
        <div className="flex flex-col items-center text-center mt-2 pb-2">
          <span className="text-[11px] font-bold text-[#85af9b] uppercase tracking-widest mb-1">
            MONTHLY SALE
          </span>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-3xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
              {showBalance
                ? `RM ${totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '••••••••'}
            </h1>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-[#a4d0ba] hover:text-white transition-colors p-1 bg-transparent border-none cursor-pointer flex items-center"
              title="Toggle Visibility"
            >
              <span className="material-symbols-outlined text-xl">
                {showBalance ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>

          {/* Referral Code Pill with Copy Action */}
          <div className="flex items-center gap-2.5 mt-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
            <span className="text-xs font-mono text-[#c0ecd6] font-semibold tracking-widest">
              {referralCode}
            </span>
            <button
              onClick={handleCopyLink}
              title="Copy referral code"
              className="text-[#6bfe9c] hover:text-white transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center p-0.5"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
            </button>
          </div>
        </div>
        </div>
      </section>

      {/* Main Content Sections (Off-white canvas starting right under green hero section) */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-4">
        <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 flex flex-col gap-5">
          {/* 2. OVERLAPPING 2 STAT CARDS (Full width boundary at half of cards) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full -mt-14 relative z-30">
            {/* Card 1: Total Active Stores */}
            <div className="bg-white dark:bg-[#002d1e] rounded-[2rem] p-4 sm:p-5 shadow-[0_12px_35px_rgba(0,0,0,0.08)] border border-[#e5e2e1] dark:border-white/10 flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="w-10 h-10 rounded-full bg-[#006d37]/10 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[#006d37] text-xl">moving</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#717974] dark:text-[#85af9b] mb-1">Total active client</p>
                <p className="text-base sm:text-xl font-extrabold text-[#1c1b1b] dark:text-white">
                  {acquiredCount} Stores
                </p>
              </div>
            </div>

            {/* Card 2: My Wallet / Withdrawable Wallet */}
            <div className="bg-white dark:bg-[#1a4333]/90 rounded-[2rem] p-4 sm:p-5 shadow-[0_12px_35px_rgba(0,0,0,0.08)] border border-[#e5e2e1] dark:border-white/10 flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="w-10 h-10 rounded-full bg-[#006d37]/10 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[#006d37] text-xl">sync_alt</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#717974] dark:text-[#85af9b] mb-1">My wallet</p>
                <p className="text-base sm:text-xl font-extrabold text-[#1c1b1b] dark:text-white">
                  RM {withdrawableCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

      {/* 3. Quick Actions Grid (Matching Picture 2 & code.html) */}
      <section className="mt-1 px-1">
        <h2 className="text-base font-bold text-on-surface mb-3 px-1">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full">
          {/* Action 1: Add Prospect */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setCreateProspectVisible(true)}
              className="w-14 h-14 rounded-full bg-surface-container-lowest shadow-sm border border-surface-variant flex items-center justify-center hover:bg-surface-container-low transition-all group cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform font-bold">
                person_add
              </span>
            </button>
            <span className="text-xs text-on-surface-variant font-semibold">+ Prospect</span>
          </div>

          {/* Action 2: Copy Referral Link */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              className="w-14 h-14 rounded-full bg-surface-container-lowest shadow-sm border border-surface-variant flex items-center justify-center hover:bg-surface-container-low transition-all group cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform font-bold">
                content_copy
              </span>
            </button>
            <span className="text-xs text-on-surface-variant font-semibold">Copy Link</span>
          </div>

          {/* Action 3: Show QR */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setQrModalVisible(true)}
              className="w-14 h-14 rounded-full bg-surface-container-lowest shadow-sm border border-surface-variant flex items-center justify-center hover:bg-surface-container-low transition-all group cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform font-bold">
                qr_code_2
              </span>
            </button>
            <span className="text-xs text-on-surface-variant font-semibold">Show QR</span>
          </div>

          {/* Action 4: Pitch Templates */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setDrawerVisible(true)}
              className="w-14 h-14 rounded-full bg-surface-container-lowest shadow-sm border border-surface-variant flex items-center justify-center hover:bg-surface-container-low transition-all group cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform font-bold">
                chat
              </span>
            </button>
            <span className="text-xs text-on-surface-variant font-semibold">WhatsApp</span>
          </div>
        </div>
      </section>

      {/* 4. COMMISSION TIER PROGRESS CARD (Simplified Forest Green Design) */}
      <div className="bg-gradient-to-br from-[#002d1e] via-[#003825] to-[#1a4333] text-white rounded-[2rem] p-5 sm:p-6 shadow-lg border border-white/10 w-full flex flex-col gap-4">
        {/* Header Row: Title, Tier Badge & Current Rate */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#85af9b] uppercase tracking-wider">Commission Tier</span>
            <span className="bg-[#6bfe9c] text-[#002d1e] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow-sm">
              {identity?.commission_tier ? String(identity.commission_tier).replace('_', ' ') : 'Tier 1'}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">10%</span>
            <span className="text-[10px] font-bold text-[#85af9b] uppercase">base rate</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-[#a4d0ba]">Next tier (12.5% rate)</span>
            <span className="text-white font-bold">{acquiredCount}/15 stores</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="bg-gradient-to-r from-[#6bfe9c] to-[#00ff88] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(107,254,156,0.8)]"
              style={{ width: `${Math.max(Math.min((acquiredCount / 15) * 100, 100), 5)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. LEADERBOARD SYSTEM SECTION (3-Column Hero Podium Cards) */}
      <section className="bg-surface-container-lowest rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🏆</span>
              <h2 className="text-base sm:text-lg font-black text-on-surface tracking-tight">Top Partner Leaderboard</h2>
            </div>
            <p className="text-xs text-on-surface-variant">Top performing sales agents this month</p>
          </div>
          <button
            onClick={() => navigate('/sales-dashboard/leaderboard')}
            className="text-[#006d37] hover:text-[#002d1e] dark:text-[#6bfe9c] transition-colors flex items-center gap-1 text-xs font-bold bg-transparent border-none cursor-pointer"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
          </button>
        </div>

        {/* 3-Column Hero Podium Cards */}
        {(() => {
          const top1 = leaderboardMock.find(a => a.rank === 1) || leaderboardMock[0] || { rank: 1, name: 'Agent Partner', sales: 0, customers: 0, isCurrentUser: true };
          const top2 = leaderboardMock.find(a => a.rank === 2) || { rank: 2, name: 'Fazli', sales: 0, customers: 0, isCurrentUser: false };
          const top3 = leaderboardMock.find(a => a.rank === 3) || { rank: 3, name: 'Partner 3', sales: 0, customers: 0, isCurrentUser: false };

          return (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 items-end pt-3 pb-1">
              {/* Rank #2 (Silver - Left) */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-100/70 via-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/60 border border-slate-200 dark:border-slate-700/60 shadow-sm relative group hover:shadow-md transition-all">
                <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-black text-xs shadow-sm ring-2 ring-white dark:ring-slate-900">
                  🥈
                </div>
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-2 mb-2 shadow-sm shrink-0">
                  {top2.avatar ? (
                    <img src={top2.avatar} alt={top2.name} className="w-full h-full object-cover" />
                  ) : (
                    top2.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-on-surface truncate w-full px-1">
                  {top2.name}
                </span>
                {top2.isCurrentUser ? (
                  <span className="text-[9px] font-black bg-[#006d37] text-white px-2 py-0.5 rounded-full my-1">
                    YOU
                  </span>
                ) : (
                  <span className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    {top2.customers} stores
                  </span>
                )}
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 w-full">
                  <span className="text-xs sm:text-sm font-extrabold text-[#006d37] dark:text-[#6bfe9c] block">
                    RM {top2.sales.toLocaleString()}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Sales</span>
                </div>
              </div>

              {/* Rank #1 (Gold - Center Hero Podium) */}
              <div className="flex flex-col items-center text-center p-3.5 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-500/15 via-emerald-500/5 to-white dark:from-amber-500/20 dark:to-emerald-950/40 border-2 border-amber-400/80 dark:border-amber-400/50 shadow-lg shadow-amber-500/10 relative group hover:shadow-xl transition-all -mt-4 scale-[1.04] z-10">
                {/* Floating Crown Badge */}
                <div className="absolute -top-4 flex items-center justify-center gap-1 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-amber-950 px-2.5 py-0.5 rounded-full font-black text-[11px] shadow-md ring-2 ring-white dark:ring-slate-900">
                  <span>👑</span>
                  <span>#1</span>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-400 ring-4 ring-amber-400/30 bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center font-black text-sm sm:text-base text-amber-900 dark:text-amber-200 mt-2 mb-2 shadow-md shrink-0">
                  {top1.avatar ? (
                    <img src={top1.avatar} alt={top1.name} className="w-full h-full object-cover" />
                  ) : (
                    top1.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <span className="text-xs sm:text-sm font-black text-on-surface truncate w-full px-1">
                  {top1.name}
                </span>
                {top1.isCurrentUser ? (
                  <span className="text-[9px] font-black bg-[#006d37] text-white px-2 py-0.5 rounded-full my-1 shadow-sm">
                    YOU
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold mt-0.5">
                    {top1.customers} stores
                  </span>
                )}
                <div className="mt-2 pt-2 border-t border-amber-200/80 dark:border-amber-500/30 w-full">
                  <span className="text-xs sm:text-base font-black text-[#006d37] dark:text-[#6bfe9c] block">
                    RM {top1.sales.toLocaleString()}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Top Sales</span>
                </div>
              </div>

              {/* Rank #3 (Bronze - Right) */}
              <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-900/10 via-slate-50 to-white dark:from-amber-950/30 dark:to-slate-900/60 border border-amber-700/30 dark:border-amber-800/40 shadow-sm relative group hover:shadow-md transition-all">
                <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-black text-xs shadow-sm ring-2 ring-white dark:ring-slate-900">
                  🥉
                </div>
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-amber-700/60 bg-amber-100 dark:bg-amber-950 flex items-center justify-center font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200 mt-2 mb-2 shadow-sm shrink-0">
                  {top3.avatar ? (
                    <img src={top3.avatar} alt={top3.name} className="w-full h-full object-cover" />
                  ) : (
                    top3.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-on-surface truncate w-full px-1">
                  {top3.name}
                </span>
                {top3.isCurrentUser ? (
                  <span className="text-[9px] font-black bg-[#006d37] text-white px-2 py-0.5 rounded-full my-1">
                    YOU
                  </span>
                ) : (
                  <span className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    {top3.customers} stores
                  </span>
                )}
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 w-full">
                  <span className="text-xs sm:text-sm font-extrabold text-[#006d37] dark:text-[#6bfe9c] block">
                    RM {top3.sales.toLocaleString()}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Sales</span>
                </div>
              </div>
            </div>
          );
        })()}
      </section>
      </div>
      </div>

      {/* QR Code Modal Overlay */}
      <Modal
        title={null}
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        width={340}
        centered
        styles={{ body: { padding: '24px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px' } }}
      >
        <h4 className="text-lg font-black text-on-surface mb-1">Referral QR Code</h4>
        <p className="text-xs text-on-surface-variant mb-6">Scan to register under partner agent</p>
        <div className="flex justify-center mb-6 p-4 bg-surface-container-low rounded-2xl border border-surface-variant">
          <img src={qrCodeUrl} alt="Referral QR Code" className="w-[180px] h-[180px]" />
        </div>
        <button
          onClick={handleCopyLink}
          className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-2xl font-semibold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">content_copy</span>
          Copy Referral Link
        </button>
      </Modal>

      <WhatsAppDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        merchant={null}
        referralLink={referralLink}
        agentName={identity?.name}
      />

      <CreateProspectModal
        open={createProspectVisible}
        onClose={() => setCreateProspectVisible(false)}
      />
    </div>
  );
};
