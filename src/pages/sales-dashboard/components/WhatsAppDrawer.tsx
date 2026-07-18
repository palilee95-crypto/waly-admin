import React, { useState, useEffect } from 'react';
import { Drawer, Select, Input } from 'antd';
import type { ReferredMerchant } from '../useSalesData';

interface WhatsAppDrawerProps {
  visible: boolean;
  onClose: () => void;
  merchant: ReferredMerchant | null;
  referralLink: string;
}

export const WhatsAppDrawer: React.FC<WhatsAppDrawerProps> = ({ visible, onClose, merchant, referralLink }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('onboarding');
  const [customMsg, setCustomMsg] = useState('');

  const getTemplateText = (type: string, m: ReferredMerchant) => {
    const owner = m.name.split("'")[0] || 'Partner';
    if (type === 'onboarding') {
      return `Hi ${owner}, this is your RISEV partner representative. I saw that you successfully registered your shop "${m.name}" but haven't launched a stamp campaign. Do you need any assistance creating your reward goals or custom templates?`;
    } else if (type === 'dormant') {
      return `Hi ${owner}, we noticed "${m.name}" hasn't issued loyalty stamps in a few days. We've launched a new automated coupon template on the dashboard. Let me know if you want to set it up!`;
    } else {
      return `Hi ${owner}, we have an exclusive seasonal campaign boost this week. Check your RISEV merchant profile to enroll: ${referralLink}`;
    }
  };

  useEffect(() => {
    if (merchant) {
      setCustomMsg(getTemplateText(selectedTemplate, merchant));
    }
  }, [merchant, selectedTemplate]);

  const handleShareWhatsApp = (phoneNum?: string, textContent?: string) => {
    const text = textContent || `Hey! Deploy RISEV Loyalty Stamps for your shop to boost your repeat customer rates. Register here: ${referralLink}`;
    const cleanPhone = phoneNum ? phoneNum.replace(/[^\d+]/g, '') : '';
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const executeWhatsAppSend = () => {
    if (merchant) {
      handleShareWhatsApp(merchant.phone, customMsg);
      onClose();
    }
  };

  const isMerchantDormant = merchant ? (merchant.status === 'active' && merchant.totalTransactions > 0) : false;

  return (
    <Drawer
      title={<span className="font-headline font-bold text-on-surface">Quick WhatsApp Outreach</span>}
      placement="right"
      onClose={onClose}
      open={visible}
      width={isMerchantDormant ? 450 : 400}
      styles={{ body: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' } }}
    >
      {merchant && (
        <div className="flex flex-col gap-4 text-left">
          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1">Recipient</p>
            <h5 className="text-sm font-bold text-on-surface">{merchant.name} ({merchant.phone})</h5>
          </div>

          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-2">Outreach Goal Template</p>
            <Select
              defaultValue="onboarding"
              value={selectedTemplate}
              style={{ width: '100%', borderRadius: 10 }}
              onChange={(val) => setSelectedTemplate(val)}
              options={[
                { value: 'onboarding', label: 'Onboarding Assist Template' },
                { value: 'dormant', label: 'Dormancy Re-engagement Template' },
                { value: 'general', label: 'General Promo Template' },
              ]}
            />
          </div>

          <div>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-2">Message Body</p>
            <Input.TextArea
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              rows={6}
              style={{ borderRadius: 12, fontSize: '12px', lineHeight: '1.6' }}
            />
          </div>

          <button
            onClick={executeWhatsAppSend}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white py-3.5 rounded-2xl font-headline font-semibold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Open WhatsApp Chat
          </button>
        </div>
      )}
    </Drawer>
  );
};
