import React, { useState, useEffect } from 'react';
import { Drawer, Input, message, Tooltip } from 'antd';
import type { ReferredMerchant } from '../useSalesData';
import { PITCH_TEMPLATES, renderTemplateText } from '../data/templates';
import type { PitchTemplate } from '../data/templates';

interface WhatsAppDrawerProps {
  visible: boolean;
  onClose: () => void;
  merchant: ReferredMerchant | null;
  referralLink: string;
  agentName?: string;
}

export const WhatsAppDrawer: React.FC<WhatsAppDrawerProps> = ({
  visible,
  onClose,
  merchant,
  referralLink,
  agentName = 'RISEV Partner Agent',
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'bm' | 'en'>('bm');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('bm_fb_pitch');
  const [customMsg, setCustomMsg] = useState<string>('');

  // Helper to update template selection and render customMsg
  const applyTemplate = (tmpl: PitchTemplate) => {
    setSelectedTemplateId(tmpl.id);
    const rendered = renderTemplateText(tmpl.text, {
      merchantName: merchant?.name,
      ownerName: merchant?.name ? merchant.name.split("'")[0] : 'Boss',
      referralLink,
      agentName,
    });
    setCustomMsg(rendered);
  };

  // Filter templates by language & category
  const filteredTemplates = PITCH_TEMPLATES.filter((t) => {
    const matchesLang = t.language === selectedLanguage;
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesLang && matchesCat;
  });

  // When drawer becomes visible or merchant context changes
  useEffect(() => {
    if (visible) {
      const current = PITCH_TEMPLATES.find((t) => t.id === selectedTemplateId) || PITCH_TEMPLATES[0];
      applyTemplate(current);
    }
  }, [visible, merchant, referralLink, agentName]);

  // Handle Category Filter change
  const handleCategoryChange = (catKey: string) => {
    setSelectedCategory(catKey);
    const matched = PITCH_TEMPLATES.filter(
      (t) => t.language === selectedLanguage && (catKey === 'all' || t.category === catKey)
    );
    if (matched.length > 0) {
      applyTemplate(matched[0]);
    }
  };

  // Handle Language Switch change
  const handleLanguageChange = (lang: 'bm' | 'en') => {
    setSelectedLanguage(lang);
    const matched = PITCH_TEMPLATES.filter(
      (t) => t.language === lang && (selectedCategory === 'all' || t.category === selectedCategory)
    );
    if (matched.length > 0) {
      applyTemplate(matched[0]);
    } else {
      const firstInLang = PITCH_TEMPLATES.find((t) => t.language === lang);
      if (firstInLang) applyTemplate(firstInLang);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMsg);
    message.success('WhatsApp pitch message copied to clipboard!');
  };

  const handleShareWhatsApp = () => {
    const phoneNum = merchant?.phone || '';
    const cleanPhone = phoneNum.replace(/[^\d+]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(customMsg)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-8 h-8 rounded-full bg-[#25D366]/15 text-[#006d37] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg font-bold">chat</span>
          </div>
          <div>
            <span className="font-headline font-black text-base text-[#002d1e] block leading-tight">WhatsApp Pitch & Outreach</span>
            <span className="text-[10px] font-bold text-[#006d37] uppercase tracking-wider block">Direct Prospect Messenger</span>
          </div>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={440}
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          backgroundColor: '#ffffff',
          color: '#1e293b',
        },
        header: {
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '14px 18px',
          backgroundColor: '#ffffff',
          color: '#002d1e',
        }
      }}
    >
      {/* 1. Target Recipient Header Card */}
      <div className="bg-[#f8faf9] p-3.5 rounded-2xl border border-[#006d37]/15 text-left relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006d37] to-[#1a4333] text-white p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-[#002d1e] rounded-[10px] flex items-center justify-center text-[#6bfe9c] font-black text-xs">
                {merchant?.name ? merchant.name.charAt(0) : 'P'}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-black text-[#002d1e] flex items-center gap-1.5 mb-0.5">
                {merchant?.name || 'General Prospect'}
                {merchant?.category && (
                  <span className="bg-[#006d37]/10 text-[#006d37] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#006d37]/20">
                    {merchant.category}
                  </span>
                )}
              </h5>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-xs">call</span>
                {merchant?.phone || 'Outreach Link Pitch'}
              </p>
            </div>
          </div>

          {merchant?.phone && (
            <a
              href={`tel:${merchant.phone}`}
              className="w-8 h-8 rounded-full bg-[#006d37]/10 hover:bg-[#006d37]/20 text-[#006d37] flex items-center justify-center border border-[#006d37]/20 transition-all text-decoration-none shrink-0"
              title="Call Merchant"
            >
              <span className="material-symbols-outlined text-sm">call</span>
            </a>
          )}
        </div>
      </div>

      {/* 2. Language Switcher */}
      <div className="flex items-center justify-between bg-[#f8faf9] p-2 rounded-2xl border border-[#006d37]/15 text-left">
        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 pl-2">
          <span className="material-symbols-outlined text-sm text-[#006d37]">translate</span>
          Language:
        </span>
        <div className="flex bg-[#eef5f1] p-1 rounded-xl gap-1 border border-black/5">
          <button
            onClick={() => handleLanguageChange('bm')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1 ${
              selectedLanguage === 'bm'
                ? 'bg-[#006d37] text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            🇲🇾 BM
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1 ${
              selectedLanguage === 'en'
                ? 'bg-[#006d37] text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            🇬🇧 EN
          </button>
        </div>
      </div>

      {/* 3. Pitch Template Pills Bar (Scrollbar Hidden) */}
      <div className="text-left">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
          Select Pitch Template:
        </span>
        <div 
          className="flex items-center gap-1.5 overflow-x-auto pb-1 text-left" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredTemplates.map((tmpl) => {
            const isSelected = tmpl.id === selectedTemplateId;
            return (
              <button
                key={tmpl.id}
                onClick={() => applyTemplate(tmpl)}
                className={`px-3 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#006d37] text-white border-[#006d37] shadow-md scale-105'
                    : 'bg-[#f8faf9] text-slate-700 hover:bg-[#eef5f1] border-slate-200'
                }`}
              >
                {isSelected && <span className="material-symbols-outlined text-xs font-black">check</span>}
                <span>{tmpl.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Live Message Textarea Box */}
      <div className="bg-[#f8faf9] p-3.5 rounded-2xl border border-[#006d37]/15 flex flex-col gap-2 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
            Live Message Body (Editable)
          </span>
          <span className="text-[10px] text-slate-500 font-mono font-bold">{customMsg.length} chars</span>
        </div>

        <Input.TextArea
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          rows={7}
          style={{
            borderRadius: 14,
            fontSize: '12px',
            lineHeight: '1.6',
            fontFamily: 'sans-serif',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            borderColor: '#cbd5e1',
          }}
        />

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
          <span>Auto-replaced: <code className="bg-[#006d37]/10 text-[#006d37] px-1.5 py-0.5 rounded font-mono font-bold">referral_link</code></span>
          <button
            onClick={handleCopyMessage}
            className="text-[#006d37] hover:underline font-black border-none bg-transparent cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">content_copy</span>
            Copy Message
          </button>
        </div>
      </div>

      {/* 5. Action Footer Buttons */}
      <div className="flex gap-2.5 mt-auto pt-1 text-left">
        <button
          onClick={handleCopyMessage}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-2xl font-black text-xs transition-all border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">content_copy</span>
          Copy Text
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="flex-[2] bg-[#25D366] hover:bg-[#20BA5A] text-white py-3 rounded-2xl font-black text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">chat</span>
          Open WhatsApp Chat
        </button>
      </div>
    </Drawer>
  );
};
