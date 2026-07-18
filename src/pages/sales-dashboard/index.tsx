import React, { useState } from 'react';
import { message, Modal } from 'antd';
import { useSalesData } from './useSalesData';
import { WhatsAppConnectCard } from './components/WhatsAppConnectCard';

export const SalesDashboardPage: React.FC = () => {
  const {
    identity,
    referralCode,
    referralLink,
    clicksCount,
    qrCodeUrl,
    merchantsList,
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
    activityFeed,
  } = useSalesData();

  const [qrModalVisible, setQrModalVisible] = useState(false);

  // Copy/Share Functions
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    message.success('Referral link copied to clipboard!');
  };

  const handleShareWhatsApp = (phoneNum?: string, textContent?: string) => {
    const text = textContent || `Hey! Deploy RISEV Loyalty Stamps for your shop to boost your repeat customer rates. Register here: ${referralLink}`;
    const cleanPhone = phoneNum ? phoneNum.replace(/[^\d+]/g, '') : '';
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title Header */}
      <div className="mb-2">
        <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">Agent Partner Portal</h2>
        <p className="font-body text-sm sm:text-body-lg text-on-surface-variant">Track your referrals, commissions, and customer onboarding pipelines.</p>
      </div>

      {/* Row 1: Referral Link, WhatsApp Connection & Commission Tier progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Referral link box */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start sm:items-center mb-2 gap-2">
              <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface">Your Unique Referral Link</h3>
              <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
                <span className="material-symbols-outlined text-[14px]">ads_click</span>
                {clicksCount} Clicks
              </span>
            </div>
            <p className="font-body text-body-sm text-on-surface-variant mb-4">
              Share this link with store owners. Once they register their shop using this link, they will be registered as your referral permanently.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-black/5 p-4 rounded-2xl border border-black/5 dark:bg-white/5 dark:border-white/5">
            <span className="font-mono text-xs select-all text-on-surface flex-1 break-all">{referralLink}</span>
            <div className="grid grid-cols-1 sm:flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl font-headline font-semibold text-xs transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Copy Link
              </button>
              <button
                onClick={() => setQrModalVisible(true)}
                className="bg-black/10 hover:bg-black/20 text-on-surface px-4 py-2 rounded-xl font-headline font-semibold text-xs transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                Show QR
              </button>
              <button
                onClick={() => handleShareWhatsApp()}
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-4 py-2 rounded-xl font-headline font-semibold text-xs transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                Share to WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp Connection + Commission Tier (stacked) */}
        <div className="flex flex-col gap-gutter">
          <WhatsAppConnectCard />

          {/* Commission Tier Progress */}
          <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">Commission Tier</h3>
              <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {identity?.commission_tier ? String(identity.commission_tier).replace('_', ' ') : 'Tier 1'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-on-surface">10%</span>
              <span className="text-xs font-semibold text-on-surface-variant">base commission rate</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-on-surface-variant">Progress to Tier 2 (12.5% rate)</span>
              <span className="text-on-surface font-bold">{acquiredCount}/15 active stores</span>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((acquiredCount / 15) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Row 2: Commission Overview & Notification Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Commission Overview Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel p-5">
            <span className="material-symbols-outlined text-primary mb-2">calendar_month</span>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Current Month Earnings</p>
            <h4 className="text-2xl font-black text-on-surface mt-1">RM {monthlyCommission.toFixed(2)}</h4>
          </div>

          <div className="glass-panel p-5">
            <span className="material-symbols-outlined text-[#10B981] mb-2">payments</span>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Lifetime Earnings</p>
            <h4 className="text-2xl font-black text-on-surface mt-1">RM {totalEarned.toFixed(2)}</h4>
          </div>

          <div className="glass-panel p-5">
            <span className="material-symbols-outlined text-[#F59E0B] mb-2">hourglass_empty</span>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Pending Payouts</p>
            <h4 className="text-2xl font-black text-on-surface mt-1">RM {pendingCommissions.toFixed(2)}</h4>
          </div>

          <div className="glass-panel p-5">
            <span className="material-symbols-outlined text-primary mb-2">account_balance_wallet</span>
            <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Withdrawable Balance</p>
            <h4 className="text-2xl font-black text-on-surface mt-1">RM {withdrawableCommission.toFixed(2)}</h4>
          </div>
        </div>

        {/* Notifications Alert Widget */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px] text-primary">notifications_active</span>
              Activity Stream
            </h3>
            <div className="flex flex-col gap-4">
              {activityFeed.map((item) => (
                <div key={item.id} className="flex gap-3 text-left">
                  <span 
                    className="material-symbols-outlined p-2 rounded-xl text-[16px] h-fit"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-on-surface mb-0.5">{item.title}</h5>
                    <p className="text-[10px] text-on-surface-variant leading-relaxed">{item.body}</p>
                    <span className="text-[9px] text-on-surface-variant/70">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Sales Performance Bento Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase">Gross Revenue</p>
          <h4 className="text-lg font-black text-on-surface mt-1">RM {totalSalesRevenue.toLocaleString()}</h4>
        </div>
        <div className="glass-panel p-4">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase">Total Customers</p>
          <h4 className="text-lg font-black text-on-surface mt-1">{Math.round(totalCustomers)}</h4>
        </div>
        <div className="glass-panel p-4">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase">Active Members</p>
          <h4 className="text-lg font-black text-on-surface mt-1">{Math.round(activeMembers)}</h4>
        </div>
        <div className="glass-panel p-4">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase">New Signups</p>
          <h4 className="text-lg font-black text-on-surface mt-1">{merchantsList.length}</h4>
        </div>
        <div className="glass-panel p-4">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase">Conversion</p>
          <h4 className="text-lg font-black text-on-surface mt-1">{conversionRate}%</h4>
        </div>
        <div className="glass-panel p-4">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase">Avg Ticket Size</p>
          <h4 className="text-lg font-black text-on-surface mt-1">RM {averageSpend.toFixed(2)}</h4>
        </div>
      </div>

      {/* Row 4: Referral Funnel Pipeline */}
      <div className="glass-panel p-6">
        <h3 className="font-headline text-base font-bold text-on-surface mb-4">Referral Funnel Conversion Pipeline</h3>
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
              <span className="text-xs text-on-surface-variant block">Created merchant profile ({((merchantsList.length / clicksCount) * 100).toFixed(1)}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span className="material-symbols-outlined text-[#10B981] rotate-90 md:rotate-0">chevron_right</span>
          </div>

          <div className="flex-1 bg-[#F59E0B]/10 border border-[#F59E0B]/20 p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#F59E0B] uppercase">3. Activated Campaign</span>
            <div className="mt-2">
              <span className="text-2xl font-black text-on-surface">{acquiredCount}</span>
              <span className="text-xs text-on-surface-variant block">Active stamp campaign ({((acquiredCount / merchantsList.length) * 100).toFixed(1)}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span className="material-symbols-outlined text-[#F59E0B] rotate-90 md:rotate-0">chevron_right</span>
          </div>

          <div className="flex-1 bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-purple-600 uppercase">4. Repeat Customers</span>
            <div className="mt-2">
              <span className="text-2xl font-black text-on-surface">{activeMerchants.filter(m => m.totalTransactions > 50).length || 2}</span>
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
        <h4 className="font-headline text-lg font-black text-on-surface mb-1">Referral QR Code</h4>
        <p className="font-body text-xs text-on-surface-variant mb-6">Scan to register under partner agent</p>
        <div className="flex justify-center mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <img src={qrCodeUrl} alt="Referral QR Code" className="w-[180px] h-[180px]" />
        </div>
        <button
          onClick={handleCopyLink}
          className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-2xl font-headline font-semibold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">content_copy</span>
          Copy Referral Link
        </button>
      </Modal>
    </div>
  );
};
