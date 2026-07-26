import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, message, Button } from 'antd';
import { PITCH_TEMPLATES, renderTemplateText } from '../pages/sales-dashboard/data/templates';
import { useSalesData } from '../pages/sales-dashboard/useSalesData';
import { pb } from '../lib/pocketbase';

interface CreateProspectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateProspectModal: React.FC<CreateProspectModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  if (!open) return null;
  return <CreateProspectModalContent open={open} onClose={onClose} onSuccess={onSuccess} />;
};

const CreateProspectModalContent: React.FC<CreateProspectModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { referralLink, identity } = useSalesData();

  const [prospectPhone, setProspectPhone] = useState('');
  const [prospectName, setProspectName] = useState('');
  const [modalLanguage, setModalLanguage] = useState<'bm' | 'en'>('bm');
  const [modalTemplateId, setModalTemplateId] = useState<string>('bm_fb_pitch');
  const [prospectMessage, setProspectMessage] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const modalTemplates = PITCH_TEMPLATES.filter((t) => t.language === modalLanguage);

  useEffect(() => {
    const currentTmpl = PITCH_TEMPLATES.find((t) => t.id === modalTemplateId) || modalTemplates[0];
    if (currentTmpl) {
      const rendered = renderTemplateText(currentTmpl.text, {
        referralLink,
        agentName: identity?.name,
      });
      setProspectMessage(rendered);
    }
  }, [modalTemplateId, modalLanguage, referralLink, identity]);

  const handleModalLanguageChange = (lang: 'bm' | 'en') => {
    setModalLanguage(lang);
    const firstInLang = PITCH_TEMPLATES.find((t) => t.language === lang);
    if (firstInLang) {
      setModalTemplateId(firstInLang.id);
    }
  };

  const handleSubmit = async (sendWhatsApp: boolean) => {
    if (!prospectPhone.trim()) {
      message.warning('Please enter a phone number.');
      return;
    }

    const cleanPhone = prospectPhone.trim().replace(/[\s\-]/g, '');
    if (!/^(\+?60|0)?\d{8,12}$/.test(cleanPhone)) {
      message.error('Please enter a valid Malaysian phone number (e.g. 0123456789).');
      return;
    }

    setIsCreating(true);
    try {
      const res = await pb.send('/api/risev/agent/create-prospect', {
        method: 'POST',
        body: {
          phone: prospectPhone.trim(),
          name: prospectName.trim() || undefined,
          message: sendWhatsApp ? prospectMessage : undefined,
        },
        requestKey: null,
      });

      if (res.success || res.id) {
        message.success('Prospect created successfully!');
        if (sendWhatsApp) {
          const encodedText = encodeURIComponent(prospectMessage);
          const targetUrl = `https://api.whatsapp.com/send?phone=${cleanPhone.replace('+', '')}&text=${encodedText}`;
          window.open(targetUrl, '_blank');
        }
        setProspectPhone('');
        setProspectName('');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        message.error(res.message || 'Failed to create prospect.');
      }
    } catch (err: any) {
      // Fallback client side trigger
      if (sendWhatsApp) {
        const encodedText = encodeURIComponent(prospectMessage);
        const targetUrl = `https://api.whatsapp.com/send?phone=${cleanPhone.replace('+', '')}&text=${encodedText}`;
        window.open(targetUrl, '_blank');
        message.success('Opening WhatsApp pitch message...');
        setProspectPhone('');
        setProspectName('');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        const errMsg = err?.response?.message || err?.message || 'Failed to create prospect.';
        message.error(errMsg);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      centered
      width={520}
      styles={{ body: { padding: '24px', borderRadius: '24px', backgroundColor: '#ffffff' } }}
    >
      <div className="flex flex-col gap-4 text-left">
        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-surface-variant pb-3">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-2xl font-bold">person_add</span>
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-on-surface">Add New Prospect</h3>
            <p className="font-body text-xs text-on-surface-variant">Register store lead & dispatch referral pitch</p>
          </div>
        </div>

        {/* Input: Phone Number */}
        <div>
          <label className="text-xs font-semibold text-on-surface mb-1 block">Merchant Phone Number *</label>
          <Input
            placeholder="e.g. 0123456789 or +60123456789"
            value={prospectPhone}
            onChange={(e) => setProspectPhone(e.target.value)}
            className="rounded-xl h-11 text-sm font-medium"
            prefix={<span className="material-symbols-outlined text-outline text-[18px]">phone</span>}
          />
        </div>

        {/* Input: Merchant / Contact Name (Optional) */}
        <div>
          <label className="text-xs font-semibold text-on-surface mb-1 block">Merchant / Store Name (Optional)</label>
          <Input
            placeholder="e.g. Kafe Kopi Sedap"
            value={prospectName}
            onChange={(e) => setProspectName(e.target.value)}
            className="rounded-xl h-11 text-sm font-medium"
            prefix={<span className="material-symbols-outlined text-outline text-[18px]">storefront</span>}
          />
        </div>

        {/* Template Selector & Language Toggle */}
        <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-variant">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-on-surface">WhatsApp Pitch Message</label>
            <div className="flex gap-1 bg-surface-container-highest p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => handleModalLanguageChange('bm')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                  modalLanguage === 'bm'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Bahasa Melayu
              </button>
              <button
                type="button"
                onClick={() => handleModalLanguageChange('en')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                  modalLanguage === 'en'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="mb-2">
            <Select
              value={modalTemplateId}
              onChange={(val) => setModalTemplateId(val)}
              className="w-full h-10 font-medium"
              options={modalTemplates.map((t) => ({ label: t.title, value: t.id }))}
            />
          </div>

          <Input.TextArea
            rows={4}
            value={prospectMessage}
            onChange={(e) => setProspectMessage(e.target.value)}
            className="rounded-xl text-xs font-mono bg-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button
            onClick={() => handleSubmit(false)}
            loading={isCreating}
            className="h-12 rounded-xl font-bold border-surface-variant text-on-surface hover:bg-surface-container-low"
          >
            Save Lead Only
          </Button>
          <Button
            type="primary"
            onClick={() => handleSubmit(true)}
            loading={isCreating}
            className="h-12 rounded-xl font-bold bg-secondary hover:bg-primary text-white border-none flex items-center justify-center gap-1.5 shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            Save & Send Pitch
          </Button>
        </div>
      </div>
    </Modal>
  );
};
