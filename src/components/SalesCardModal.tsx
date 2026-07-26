import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { useSalesData } from '../pages/sales-dashboard/useSalesData';
import { WhatsAppConnectCard } from '../pages/sales-dashboard/components/WhatsAppConnectCard';
import { WhatsAppDrawer } from '../pages/sales-dashboard/components/WhatsAppDrawer';
import { CreateProspectModal } from './CreateProspectModal';

interface SalesCardModalProps {
  open: boolean;
  onClose: () => void;
}

export const SalesCardModal: React.FC<SalesCardModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return <SalesCardModalContent open={open} onClose={onClose} />;
};

const SalesCardModalContent: React.FC<SalesCardModalProps> = ({ open, onClose }) => {
  const { identity, referralCode, referralLink, clicksCount, qrCodeUrl } = useSalesData();
  const [qrVisible, setQrVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createProspectVisible, setCreateProspectVisible] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    message.success('Referral link copied to clipboard!');
  };

  return (
    <>
      <Modal
        title={null}
        open={open}
        onCancel={onClose}
        footer={null}
        width={440}
        centered
        styles={{
          body: {
            padding: '24px',
            borderRadius: '28px',
            backgroundColor: '#fcf9f8',
          },
        }}
      >
        <div className="flex flex-col gap-4 text-left">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#002d1e] to-[#006d37] p-5 rounded-2xl text-white shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-[#1a4333] flex items-center justify-center font-bold text-white text-base shrink-0">
                {identity?.avatar ? (
                  <img src={identity.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  identity?.name?.substring(0, 2).toUpperCase() || 'AG'
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#85af9b]">OFFICIAL SALES CARD</span>
                <span className="text-lg font-bold text-white leading-tight">
                  {identity?.name || 'Agent Partner'}
                </span>
                <span className="text-[10px] font-mono text-[#6bfe9c]">ID: {referralCode}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="bg-[#6bfe9c] text-[#002d1e] text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-xs">
                {identity?.commission_tier ? String(identity.commission_tier).replace('_', ' ') : 'Tier 1'}
              </span>
            </div>
          </div>

          {/* Section 1: Unique Referral Link */}
          <div className="bg-white p-4 rounded-2xl border border-[#e5e2e1] shadow-xs flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#1c1b1b] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006d37] text-base">link</span>
                Unique Referral Link
              </span>
              <span className="bg-[#006d37]/10 text-[#006d37] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">ads_click</span>
                {clicksCount} Clicks
              </span>
            </div>

            <div className="bg-[#f6f3f2] p-2.5 rounded-xl border border-[#e5e2e1] flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-[#1c1b1b] truncate flex-1 select-all">
                {referralLink}
              </span>
              <button
                onClick={handleCopy}
                className="bg-[#006d37] text-white hover:bg-[#002d1e] px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                Copy
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => setQrVisible(true)}
                className="py-2.5 bg-[#f6f3f2] hover:bg-[#e5e2e1] text-[#1c1b1b] rounded-xl text-xs font-bold border border-[#e5e2e1] cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006d37]">qr_code_2</span>
                Show QR Code
              </button>

              <button
                onClick={() => setCreateProspectVisible(true)}
                className="py-2.5 bg-[#6bfe9c] hover:bg-[#52e883] text-[#002d1e] rounded-xl text-xs font-black border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px] font-bold">person_add</span>
                Add Prospect
              </button>
            </div>
          </div>

          {/* Section 2: WhatsApp Connection */}
          <div className="bg-white p-4 rounded-2xl border border-[#e5e2e1] shadow-xs flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#1c1b1b] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#25D366] text-base">chat</span>
                WhatsApp Marketing
              </span>
              <button
                onClick={() => setDrawerVisible(true)}
                className="text-[#006d37] hover:underline text-xs font-bold bg-transparent border-none cursor-pointer"
              >
                Pitch Templates &gt;
              </button>
            </div>

            <WhatsAppConnectCard />
          </div>
        </div>
      </Modal>

      {/* QR Modal inside Sales Card */}
      <Modal
        title={null}
        open={qrVisible}
        onCancel={() => setQrVisible(false)}
        footer={null}
        width={320}
        centered
        styles={{ body: { padding: '20px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px' } }}
      >
        <h4 className="text-base font-bold text-[#1c1b1b] mb-1">Referral QR Code</h4>
        <p className="text-xs text-[#717974] mb-4">Scan to register under partner agent</p>
        <div className="flex justify-center mb-4 p-3 bg-[#f6f3f2] rounded-2xl border border-[#e5e2e1]">
          <img src={qrCodeUrl} alt="QR Code" className="w-[160px] h-[160px]" />
        </div>
        <button
          onClick={handleCopy}
          className="w-full bg-[#006d37] text-white py-2.5 rounded-xl font-bold text-xs border-none cursor-pointer flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
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
    </>
  );
};
