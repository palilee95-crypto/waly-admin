import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Modal } from 'antd';
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

  const handleDirectWhatsAppShare = () => {
    const text = encodeURIComponent(`Hi! Register your store on risev Mobile Network using my partner referral link to start accepting orders: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-6 overflow-x-hidden">
      {/* 1. Top Section (Forest Green Gradient Hero Header - Safe Area Supported) */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center relative">
          {/* Top Category Badge */}
          <span className="text-[11px] font-bold text-[#85af9b] uppercase tracking-widest mb-2">
            Partner Card & Referral Hub
          </span>

          {/* Header Title & Subtitle */}
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-3xl sm:text-4xl">🎴</span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">My Referral Card</h1>
          </div>
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-4 font-medium leading-relaxed">
            Your official sales partner credential and WhatsApp prospect pitch center.
          </p>

          {/* Action Badge */}
          <button
            onClick={() => setCreateProspectVisible(true)}
            className="inline-flex items-center gap-2 bg-[#6bfe9c] text-[#002d1e] font-black text-xs px-4 py-2 rounded-full hover:scale-105 transition-all shadow-md border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Add Prospect Store</span>
          </button>
        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1000px] mx-auto w-full px-3 sm:px-6 flex flex-col gap-6">

          {/* 3. 1:1 Realistic Physical Credit Card (Standard 1.58:1 aspect ratio with Silver Metallic Trim) */}
          <div className="w-full -mt-16 relative z-30 flex justify-center">
            <div className="w-full max-w-[500px] aspect-[1.58/1] rounded-[1.75rem] sm:rounded-[2.25rem] bg-gradient-to-br from-[#0c0d10] via-[#161822] to-[#060709] p-5 sm:p-7 text-white shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(255,255,255,0.12)] relative overflow-hidden border-2 border-slate-300/80 hover:border-white transition-all duration-300 flex flex-col justify-between group">
              
              {/* Metallic Light Sheen & Holographic Reflection Overlays */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-200/15 to-transparent pointer-events-none rounded-[1.75rem] sm:rounded-[2.25rem]"></div>
              <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
              <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full bg-slate-400/10 blur-3xl pointer-events-none"></div>

              {/* Large Background Watermark Logo */}
              <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none select-none z-0">
                <img src="/logo.png" alt="" className="w-[220px] sm:w-[300px] object-contain brightness-0 invert" />
              </div>

              {/* CARD TOP ROW: Brand Logo & Contactless NFC + Hologram Badge */}
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Risev Logo" className="h-9 sm:h-12 object-contain brightness-0 invert" />
                  <span className="text-[10px] sm:text-xs font-black uppercase text-slate-300 tracking-widest border-l-2 border-slate-400/40 pl-3 py-0.5">
                    PARTNER
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-300 text-lg sm:text-xl">contactless</span>
                  <span className="text-[9px] sm:text-[10px] font-black bg-slate-200/15 text-slate-100 px-2.5 py-1 rounded-full border border-slate-300/40 uppercase tracking-widest shadow-sm">
                    BLACK PASS
                  </span>
                </div>
              </div>

              {/* CARD MIDDLE ROW: EMV Smart Chip & Embossed Card Number */}
              <div className="relative z-10 my-auto flex flex-col gap-2 sm:gap-3">
                {/* EMV Metallic Gold Smart Chip */}
                <div className="w-11 sm:w-13 h-8 sm:h-9 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-300 shadow-md flex flex-col justify-between p-1 shrink-0">
                  <div className="h-0.5 w-full bg-amber-900/50 rounded-full"></div>
                  <div className="h-0.5 w-full bg-amber-900/50 rounded-full"></div>
                  <div className="h-0.5 w-full bg-amber-900/50 rounded-full"></div>
                </div>

                {/* Embossed Card Number Format: risev - AXYW - S4I0 - 2026 */}
                <div className="flex items-center justify-between font-mono text-base sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 tracking-[0.2em] sm:tracking-[0.25em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] select-all">
                  <span>{referralCode ? referralCode.substring(0, 4) : 'risev'}</span>
                  <span>{referralCode ? referralCode.substring(4, 8) || 'PART' : 'PART'}</span>
                  <span>{referralCode ? referralCode.substring(8) || 'NER' : 'NER'}</span>
                  <span>2026</span>
                </div>
              </div>

              {/* CARD BOTTOM ROW: Avatar + Cardholder Name + Tier & QR Code */}
              <div className="flex justify-between items-end relative z-10 pt-1">
                {/* Left: Avatar & Cardholder Name */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-slate-300 ring-2 ring-slate-400/30 bg-[#141419] shadow-md flex items-center justify-center font-bold text-white text-xs sm:text-sm shrink-0">
                    {identity?.avatar ? (
                      <img src={identity.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      identity?.name?.substring(0, 2).toUpperCase() || 'AG'
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-widest uppercase">CARDHOLDER</span>
                    <span className="text-xs sm:text-base font-black text-white uppercase tracking-wider truncate max-w-[140px] sm:max-w-[200px]">
                      {identity?.name || 'AGENT PARTNER'}
                    </span>
                  </div>
                </div>

                {/* Right: Tier Badge & Quick QR Button */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-widest uppercase">COMMISSION</span>
                    <span className="bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 text-slate-900 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase shadow-[0_2px_10px_rgba(255,255,255,0.25)]">
                      {identity?.commission_tier ? String(identity.commission_tier).replace('_', ' ') : 'TIER 1 (10%)'}
                    </span>
                  </div>

                  <button
                    onClick={() => setQrModalVisible(true)}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 sm:p-2.5 rounded-xl border border-white/20 cursor-pointer transition-all shadow-sm shrink-0 flex items-center justify-center"
                    title="Show Referral QR Code"
                  >
                    <span className="material-symbols-outlined text-base sm:text-lg text-slate-200">qr_code_2</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* 4. Modern Fintech Quick Action Pill Bar */}
          <div className="w-full max-w-[500px] mx-auto mt-3 sm:mt-5 px-2">
            <div className="bg-white dark:bg-[#002518] rounded-[2rem] p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-surface-variant dark:border-[#004d30] flex items-center justify-around">
              
              {/* 1. Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 group border-none bg-transparent cursor-pointer transition-transform active:scale-95"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center border border-[#006d37]/20 dark:border-[#6bfe9c]/30 shadow-sm group-hover:bg-[#006d37] group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">content_copy</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-on-surface dark:text-[#a4d0ba]">Copy Link</span>
              </button>

              {/* 2. QR Code */}
              <button
                onClick={() => setQrModalVisible(true)}
                className="flex flex-col items-center gap-2 group border-none bg-transparent cursor-pointer transition-transform active:scale-95"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center border border-[#006d37]/20 dark:border-[#6bfe9c]/30 shadow-sm group-hover:bg-[#006d37] group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">qr_code_2</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-on-surface dark:text-[#a4d0ba]">QR Code</span>
              </button>

              {/* 3. WhatsApp */}
              <button
                onClick={handleDirectWhatsAppShare}
                className="flex flex-col items-center gap-2 group border-none bg-transparent cursor-pointer transition-transform active:scale-95"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center border border-[#25D366]/30 shadow-sm group-hover:bg-[#25D366] group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">chat</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-on-surface dark:text-[#a4d0ba]">WhatsApp</span>
              </button>

              {/* 4. Wallet */}
              <button
                onClick={() => navigate('/sales-dashboard/earnings')}
                className="flex flex-col items-center gap-2 group border-none bg-transparent cursor-pointer transition-transform active:scale-95"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center border border-[#006d37]/20 dark:border-[#6bfe9c]/30 shadow-sm group-hover:bg-[#006d37] group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">account_balance_wallet</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-on-surface dark:text-[#a4d0ba]">Wallet</span>
              </button>

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
