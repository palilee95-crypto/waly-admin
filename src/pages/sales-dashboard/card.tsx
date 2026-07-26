import React, { useState } from 'react';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSalesData } from './useSalesData';
import { WhatsAppConnectCard } from './components/WhatsAppConnectCard';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';
import { CreateProspectModal } from '../../components/CreateProspectModal';

export const SalesCardPage: React.FC = () => {
  const navigate = useNavigate();
  const { identity, referralCode, referralLink, clicksCount, qrCodeUrl } = useSalesData();

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createProspectVisible, setCreateProspectVisible] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    message.success('Referral link copied to clipboard!');
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-[1000px] mx-auto pb-20">
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between px-1 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales-dashboard')}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#002d1e] shadow-sm border border-[#e5e2e1] dark:border-white/10 flex items-center justify-center text-on-surface hover:bg-black/5 transition-all cursor-pointer"
            title="Back to Sales Dashboard"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-on-surface leading-tight">My Referral Card</h1>
            <p className="text-xs text-on-surface-variant">Your official partner card and WhatsApp pitch center</p>
          </div>
        </div>

        <button
          onClick={() => setCreateProspectVisible(true)}
          className="px-4 py-2.5 rounded-full bg-[#6bfe9c] text-[#002d1e] font-black text-xs hover:scale-105 transition-all flex items-center gap-1.5 shadow-md border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Add Prospect</span>
        </button>
      </div>

      {/* 2. Official Sales Card Banner */}
      <section className="bg-gradient-to-r from-[#002d1e] via-[#004d27] to-[#006d37] p-6 sm:p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white/20 bg-[#1a4333] shadow-md flex items-center justify-center font-bold text-white text-xl shrink-0">
              {identity?.avatar ? (
                <img src={identity.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                identity?.name?.substring(0, 2).toUpperCase() || 'AG'
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#85af9b] uppercase tracking-widest">OFFICIAL SALES PARTNER</span>
              <span className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {identity?.name || 'Agent Partner'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-[#6bfe9c] font-semibold bg-white/10 px-3 py-0.5 rounded-full border border-white/10">
                  ID: {referralCode}
                </span>
                <span className="text-xs text-[#a4d0ba] font-medium">• WALY Mobile Network</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
            <span className="text-[10px] uppercase font-bold text-[#85af9b] tracking-wider mb-1">Commission Level</span>
            <span className="bg-[#6bfe9c] text-[#002d1e] text-xs font-black px-3.5 py-1.5 rounded-full uppercase shadow-md">
              {identity?.commission_tier ? String(identity.commission_tier).replace('_', ' ') : 'Tier 1 (10%)'}
            </span>
          </div>
        </div>

        {/* Background Decorative Element */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none"></div>
      </section>

      {/* 3. Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Unique Referral Link & QR Code */}
        <div className="bg-white dark:bg-[#002d1e] rounded-[2rem] p-6 shadow-md border border-[#e5e2e1] dark:border-white/10 flex flex-col justify-between gap-5">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006d37] dark:text-[#6bfe9c] text-xl">link</span>
                Unique Referral Link
              </h2>
              <span className="bg-[#006d37]/10 text-[#006d37] dark:text-[#6bfe9c] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">ads_click</span>
                {clicksCount} Clicks
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Share this link with store owners. Merchant accounts created via this URL automatically bind to your partner commission account.
            </p>

            {/* URL Box */}
            <div className="bg-[#f6f3f2] dark:bg-white/5 p-3.5 rounded-2xl border border-[#e5e2e1] dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="font-mono text-xs select-all text-on-surface flex-1 break-all font-semibold">
                {referralLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="bg-[#006d37] text-white hover:bg-[#002d1e] px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Copy Link
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setQrModalVisible(true)}
              className="py-3 bg-[#f6f3f2] dark:bg-white/10 hover:bg-[#e5e2e1] text-on-surface rounded-2xl text-xs font-bold border border-[#e5e2e1] dark:border-white/10 cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-lg text-[#006d37] dark:text-[#6bfe9c]">qr_code_2</span>
              <span>Show QR Code</span>
            </button>

            <button
              onClick={() => setCreateProspectVisible(true)}
              className="py-3 bg-[#6bfe9c] hover:bg-[#52e883] text-[#002d1e] rounded-2xl text-xs font-black border-none cursor-pointer flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg font-bold">person_add</span>
              <span>Add Prospect</span>
            </button>
          </div>
        </div>

        {/* Right Column: WhatsApp Connection & Pitch Center */}
        <div className="bg-white dark:bg-[#002d1e] rounded-[2rem] p-6 shadow-md border border-[#e5e2e1] dark:border-white/10 flex flex-col justify-between gap-5">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[#25D366] text-xl">chat</span>
                WhatsApp Marketing
              </h2>
              <button
                onClick={() => setDrawerVisible(true)}
                className="text-[#006d37] dark:text-[#6bfe9c] hover:underline text-xs font-bold bg-transparent border-none cursor-pointer flex items-center gap-1"
              >
                <span>Pitch Templates</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Connect your WhatsApp number to auto-send referral links and structured pitch messages to store prospects.
            </p>

            <WhatsAppConnectCard />
          </div>
        </div>
      </div>

      {/* QR Code Modal Overlay */}
      <Modal
        title={null}
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        width={360}
        centered
        styles={{ body: { padding: '24px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px' } }}
      >
        <h4 className="text-lg font-black text-on-surface mb-1">Referral QR Code</h4>
        <p className="text-xs text-on-surface-variant mb-6">Scan to register under partner agent</p>
        <div className="flex justify-center mb-6 p-4 bg-[#f6f3f2] rounded-2xl border border-[#e5e2e1]">
          <img src={qrCodeUrl} alt="Referral QR Code" className="w-[200px] h-[200px]" />
        </div>
        <button
          onClick={handleCopyLink}
          className="w-full bg-[#006d37] text-white py-3 rounded-2xl font-bold text-xs border-none cursor-pointer flex items-center justify-center gap-1.5"
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
