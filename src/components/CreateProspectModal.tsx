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
      width={420}
      styles={{ body: { padding: '20px', borderRadius: '24px', backgroundColor: '#ffffff' } }}
    >
      <div className="flex flex-col gap-3.5 text-left">
        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#006d37]/10 text-[#006d37] flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-xl font-bold">person_add</span>
          </div>
          <div>
            <h3 className="font-headline text-base font-black text-[#002d1e] mb-0.5">Add New Prospect Lead</h3>
            <p className="font-body text-xs text-slate-500">Register store contact & dispatch WhatsApp pitch</p>
          </div>
        </div>

        {/* Input: Phone Number */}
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1 block">Merchant Phone Number *</label>
          <Input
            placeholder="e.g. 0123456789 or +60123456789"
            value={prospectPhone}
            onChange={(e) => setProspectPhone(e.target.value)}
            className="rounded-xl h-10 text-xs font-medium"
            prefix={<span className="material-symbols-outlined text-slate-400 text-base">phone</span>}
          />
        </div>

        {/* Input: Merchant / Contact Name (Optional) */}
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1 block">Merchant / Store Name (Optional)</label>
          <Input
            placeholder="e.g. Kafe Kopi Sedap"
            value={prospectName}
            onChange={(e) => setProspectName(e.target.value)}
            className="rounded-xl h-10 text-xs font-medium"
            prefix={<span className="material-symbols-outlined text-slate-400 text-base">storefront</span>}
          />
        </div>

        {/* Template Selector & Language Toggle */}
        <div className="bg-[#f8faf9] p-3 rounded-2xl border border-[#006d37]/15 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-[#002d1e]">WhatsApp Pitch Message</label>
            <div className="flex gap-1 bg-[#eef5f1] p-0.5 rounded-lg border border-black/5">
              <button
                type="button"
                onClick={() => handleModalLanguageChange('bm')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all border-none cursor-pointer ${
                  modalLanguage === 'bm'
                    ? 'bg-[#006d37] text-white shadow-sm'
                    : 'bg-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                🇲🇾 BM
              </button>
              <button
                type="button"
                onClick={() => handleModalLanguageChange('en')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all border-none cursor-pointer ${
                  modalLanguage === 'en'
                    ? 'bg-[#006d37] text-white shadow-sm'
                    : 'bg-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          <div>
            <Select
              value={modalTemplateId}
              onChange={(val) => setModalTemplateId(val)}
              className="w-full h-9 font-medium text-xs"
              options={modalTemplates.map((t) => ({ label: t.title, value: t.id }))}
            />
          </div>

          <Input.TextArea
            rows={4}
            value={prospectMessage}
            onChange={(e) => setProspectMessage(e.target.value)}
            className="rounded-xl text-xs font-sans bg-white border-slate-200"
            style={{ fontSize: '11px', lineHeight: '1.5' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 mt-1">
          <Button
            onClick={() => handleSubmit(false)}
            loading={isCreating}
            className="flex-1 h-11 rounded-xl font-bold border-slate-200 text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs"
          >
            Save Lead Only
          </Button>
          <Button
            type="primary"
            onClick={() => handleSubmit(true)}
            loading={isCreating}
            className="flex-1 h-11 rounded-xl font-bold bg-[#25D366] hover:bg-[#20BA5A] text-white border-none flex items-center justify-center gap-1 shadow-md text-xs shrink-0"
          >
            <span className="material-symbols-outlined text-base">send</span>
            Save & Send Pitch
          </Button>
        </div>
      </div>
    </Modal>
  );
};
