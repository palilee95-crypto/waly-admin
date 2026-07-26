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
    pendingCommissions,
    withdrawableCommission,
    totalCustomers,
    activeMembers,
    conversionRate,
    averageSpend,
    activityFeed,
    leaderboardMock,
  } = useSalesData();

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createProspectVisible, setCreateProspectVisible] = useState(false);

  // Copy/Share Functions
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    message.success('Referral link copied to clipboard!');
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-[1280px] mx-auto pb-12">
      {/* 1. Top Section (Gradient Hero - Matching code.html) */}
      <section className="bg-gradient-to-b from-primary via-primary to-primary-container text-on-primary pt-6 pb-10 rounded-[2rem] relative shadow-lg w-full px-6 sm:px-8 border border-white/10">
        {/* Top AppBar */}
        <header className="flex justify-between items-center w-full mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-fixed/30 shadow-sm flex-shrink-0 bg-primary-container/40 flex items-center justify-center">
              {identity?.avatar ? (
                <img alt="Profile Picture" class="w-full h-full object-cover" src={identity.avatar} />
              ) : (
                <span className="font-bold text-on-primary text-base">
                  {identity?.name?.substring(0, 2).toUpperCase() || 'AG'}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-on-primary-container">Welcome back</span>
              <span className="text-xl sm:text-2xl font-bold text-on-primary leading-tight">
                {identity?.name || 'Agent Partner'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateProspectVisible(true)}
              className="px-3.5 py-2 rounded-full bg-secondary-container text-on-secondary-container hover:scale-105 transition-all font-bold text-xs flex items-center gap-1.5 shadow-md border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span className="hidden sm:inline">Add Prospect</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-primary-container/40 hover:bg-primary-container/60 transition-colors flex items-center justify-center backdrop-blur-sm border border-primary-fixed/10 text-on-primary border-none cursor-pointer">
              <span className="material-symbols-outlined text-on-primary">notifications</span>
            </button>
          </div>
        </header>

        {/* Main Balance / Monthly Sale Display */}
        <div className="flex flex-col items-center text-center mt-4">
          <span className="text-xs font-semibold text-on-primary-container uppercase tracking-wider mb-1 opacity-90">
            monthly sales volume
          </span>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl sm:text-5xl font-black text-on-primary tabular-nums tracking-tight">
              RM {totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
          </div>

          {/* Referral Code Pill with Copy Action */}
          <div className="flex items-center gap-2 mt-2 bg-primary-container/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
            <span className="text-xs font-mono text-on-primary-container font-semibold tracking-wider">
              {referralCode}
            </span>
            <button
              onClick={handleCopyLink}
              title="Copy referral link"
              className="text-primary-fixed hover:text-white transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
            </button>
          </div>
        </div>

        {/* Decorative pull pill */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full"></div>
      </section>

      {/* 2. Analytics Cards Grid (Income Card & Wallet Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {/* Income Card - Total Active Stores */}
        <div className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="w-11 h-11 rounded-full bg-primary-container/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-secondary text-2xl">storefront</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant mb-1">Total Active Stores</p>
            <p className="text-2xl font-bold text-on-surface">{acquiredCount} Stores</p>
          </div>
        </div>

        {/* Spent / Wallet Card - Withdrawable Balance */}
        <div className="bg-surface-container-low rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="w-11 h-11 rounded-full bg-primary-container/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-secondary text-2xl">account_balance_wallet</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant mb-1">Withdrawable Wallet</p>
            <p className="text-2xl font-bold text-on-surface">
              RM {withdrawableCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Grid (Matching code.html action layout + Create Prospect button) */}
      <section className="mt-2">
        <h2 className="text-base font-bold text-on-surface mb-3 px-1">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3 w-full">
          {/* Action 1: Add Prospect */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => setCreateProspectVisible(true)}
              className="w-14 h-14 rounded-full bg-surface-container-lowest shadow-sm border border-surface-variant flex items-center justify-center hover:bg-surface-container-low transition-all group cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
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
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
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
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
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
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                chat
              </span>
            </button>
            <span className="text-xs text-on-surface-variant font-semibold">WhatsApp</span>
          </div>
        </div>
      </section>

      {/* 4. LEADERBOARD SYSTEM SECTION (Replaces Recent Transfer from code.html) */}
      <section className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-bold text-on-surface">Top Partner Leaderboard</h2>
            <p className="text-xs text-on-surface-variant">Top performing sales agents this month</p>
          </div>
          <button
            onClick={() => navigate('/sales-dashboard/leaderboard')}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-xs font-semibold bg-transparent border-none cursor-pointer"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        {/* Horizontal & Vertical Leaderboard Avatars/Rows */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {leaderboardMock.slice(0, 5).map((agent, index) => (
            <div
              key={agent.rank || index}
              className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
                agent.isCurrentUser
                  ? 'bg-secondary-container/20 border-secondary'
                  : 'bg-surface-container-low border-surface-variant'
              }`}
            >
              <div className="relative mb-2">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-surface-variant shadow-sm bg-primary-container/20 flex items-center justify-center">
                  <span className="font-bold text-primary text-sm">
                    {agent.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-[10px] font-black text-white ${
                    agent.rank === 1
                      ? 'bg-[#F59E0B]'
                      : agent.rank === 2
                      ? 'bg-[#94A3B8]'
                      : agent.rank === 3
                      ? 'bg-[#D97706]'
                      : 'bg-primary'
                  }`}
                >
                  #{agent.rank}
                </div>
              </div>
              <span className="text-xs font-bold text-on-surface truncate w-full text-center">
                {agent.name} {agent.isCurrentUser && '(You)'}
              </span>
              <span className="text-[10px] text-on-surface-variant mt-0.5">
                {agent.customers} stores
              </span>
              <span className="text-xs font-bold text-secondary mt-1">
                RM {agent.sales.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Secondary Row: WhatsApp Connection & Commission Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start sm:items-center mb-2 gap-2">
              <h3 className="text-base sm:text-lg font-bold text-on-surface">Your Unique Referral Link</h3>
              <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                <span className="material-symbols-outlined text-[14px]">ads_click</span>
                {clicksCount} Clicks
              </span>
            </div>
            <p className="text-xs sm:text-body-sm text-on-surface-variant mb-4">
              Share this link with store owners. Once they register their shop using this link, they will be registered as your referral permanently.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-surface-container-low p-4 rounded-2xl border border-surface-variant">
            <span className="font-mono text-xs select-all text-on-surface flex-1 break-all">{referralLink}</span>
            <div className="grid grid-cols-1 sm:flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl font-semibold text-xs transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Copy Link
              </button>
              <button
                onClick={() => setQrModalVisible(true)}
                className="bg-surface-container-highest hover:bg-surface-variant text-on-surface px-4 py-2 rounded-xl font-semibold text-xs transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                Show QR
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <WhatsAppConnectCard />

          {/* Commission Tier Progress */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Commission Tier</h3>
                <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
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
                  className="bg-secondary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((acquiredCount / 15) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Referral Funnel Conversion Pipeline */}
      <div className="glass-panel p-6">
        <h3 className="text-base font-bold text-on-surface mb-4">Referral Funnel Conversion Pipeline</h3>
        <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
          <div className="flex-1 bg-primary/10 border border-primary/20 p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-primary uppercase">1. Link Clicks</span>
            <div className="mt-2">
              <span className="text-2xl font-black text-on-surface">{clicksCount}</span>
              <span className="text-xs text-on-surface-variant block">Visits from referral URL</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span className="material-symbols-outlined text-primary rotate-90 md:rotate-0">chevron_right</span>
          </div>

          <div className="flex-1 bg-[#10B981]/10 border border-[#10B981]/20 p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#10B981] uppercase">2. Registrations</span>
            <div className="mt-2">
              <span className="text-2xl font-black text-on-surface">{merchantsList.length}</span>
              <span className="text-xs text-on-surface-variant block">
                Created profile ({clicksCount > 0 ? ((merchantsList.length / clicksCount) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span className="material-symbols-outlined text-[#10B981] rotate-90 md:rotate-0">chevron_right</span>
          </div>

          <div className="flex-1 bg-[#F59E0B]/10 border border-[#F59E0B]/20 p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#F59E0B] uppercase">3. Activated Campaign</span>
            <div className="mt-2">
              <span className="text-2xl font-black text-on-surface">{acquiredCount}</span>
              <span className="text-xs text-on-surface-variant block">
                Active campaign ({merchantsList.length > 0 ? ((acquiredCount / merchantsList.length) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span className="material-symbols-outlined text-[#F59E0B] rotate-90 md:rotate-0">chevron_right</span>
          </div>

          <div className="flex-1 bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-purple-600 uppercase">4. Repeat Customers</span>
            <div className="mt-2">
              <span className="text-2xl font-black text-on-surface">
                {activeMerchants.filter((m) => m.totalTransactions > 50).length || 2}
              </span>
              <span className="text-xs text-on-surface-variant block">Merchants with &gt;50 stamps logged</span>
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
