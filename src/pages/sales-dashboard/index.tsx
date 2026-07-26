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
    <div className="flex flex-col gap-5 text-left w-full pb-20 overflow-x-hidden">
      {/* 1. Top Section (Gradient Hero - Dynamic Island & Safe Area Supported) */}
      <section className="bg-gradient-to-b from-[#002d1e] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-16 rounded-t-none rounded-b-[2rem] relative shadow-lg w-full px-5 sm:px-8 border-b border-white/10">
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
        <div className="flex flex-col items-center text-center mt-2">
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
        {/* Decorative pull pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full"></div>
      </section>

      {/* Main Content Sections (Off-white canvas starting under green hero section) */}
      <div className="bg-[#fcf9f8] dark:bg-[#00150e] pt-4 pb-16 -mt-8 min-h-screen">
        <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 flex flex-col gap-5">
          {/* 2. OVERLAPPING 2 STAT CARDS (Sitting Side-by-Side like Picture 2) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        {/* Card 1: Total Active Stores */}
        <div className="bg-white dark:bg-[#002d1e] rounded-[2rem] p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#e5e2e1] dark:border-white/10 flex flex-col justify-between hover:shadow-xl transition-all">
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
        <div className="bg-[#f6f3f2] dark:bg-[#1a4333]/60 rounded-[2rem] p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#e5e2e1] dark:border-white/10 flex flex-col justify-between hover:shadow-xl transition-all">
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

      {/* 4. LEADERBOARD SYSTEM SECTION (Sleek & Compact Ranked List View) */}
      <section className="bg-surface-container-lowest rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-bold text-on-surface">Top Partner Leaderboard</h2>
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

        {/* Sleek Ranked List */}
        <div className="flex flex-col gap-2.5">
          {leaderboardMock.slice(0, 3).map((agent) => {
            const isFirst = agent.rank === 1;
            const isSecond = agent.rank === 2;
            const isThird = agent.rank === 3;

            return (
              <div
                key={agent.rank}
                className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all ${
                  agent.isCurrentUser
                    ? 'bg-[#6bfe9c]/15 border-[#006d37]/40 shadow-sm'
                    : 'bg-surface-container-low border-surface-variant/60 hover:bg-surface-container-highest/50'
                }`}
              >
                {/* Left: Rank Badge + Avatar + Name */}
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${
                      isFirst
                        ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                        : isSecond
                        ? 'bg-slate-300 text-slate-900 ring-2 ring-slate-200'
                        : isThird
                        ? 'bg-amber-700 text-amber-100 ring-2 ring-amber-600'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${agent.rank}`}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-surface-variant shrink-0 bg-[#006d37]/10 flex items-center justify-center font-bold text-xs text-[#006d37]">
                    {agent.avatar ? (
                      <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                      agent.name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  {/* Name & Subtitle */}
                  <div className="flex flex-col text-left">
                    <span className="text-xs sm:text-sm font-bold text-on-surface flex items-center gap-1.5">
                      {agent.name}
                      {agent.isCurrentUser && (
                        <span className="text-[9px] font-black bg-[#006d37] text-white px-2 py-0.5 rounded-full">
                          YOU
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {agent.customers} stores active
                    </span>
                  </div>
                </div>

                {/* Right: Sales Volume Amount */}
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-extrabold text-[#006d37] dark:text-[#6bfe9c] block">
                    RM {agent.sales.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium">Sales Volume</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Commission Tier Progress Card */}
      <div className="glass-panel p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Commission Tier</h3>
            <span className="bg-[#006d37]/10 text-[#006d37] text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
              {identity?.commission_tier ? String(identity.commission_tier).replace('_', ' ') : 'Tier 1'}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-on-surface">10%</span>
            <span className="text-xs font-semibold text-on-surface-variant">base rate</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-on-surface-variant">Next tier (12.5% rate)</span>
            <span className="text-on-surface font-bold">{acquiredCount}/15 stores</span>
          </div>
          <div className="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#006d37] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((acquiredCount / 15) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
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
