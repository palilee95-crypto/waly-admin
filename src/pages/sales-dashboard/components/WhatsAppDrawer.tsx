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
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#25D366]">chat</span>
          <span className="font-headline font-bold text-on-surface">WhatsApp Pitch & Outreach</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={460}
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          backgroundColor: '#fafafa',
        },
      }}
    >
      {/* Recipient Header */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm text-left">
        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Target Recipient</p>
        {merchant ? (
          <div>
            <h5 className="text-sm font-bold text-on-surface flex items-center gap-2">
              {merchant.name}
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                {merchant.category}
              </span>
            </h5>
            <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1 font-mono">
              <span className="material-symbols-outlined text-[14px]">call</span>
              {merchant.phone || 'No phone number added'}
            </p>
          </div>
        ) : (
          <div>
            <h5 className="text-sm font-bold text-on-surface">General Prospect Cold Outreach</h5>
            <p className="text-xs text-on-surface-variant mt-0.5">Custom message using your referral link</p>
          </div>
        )}
      </div>

      {/* Language Switcher */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-black/5 text-left">
        <span className="text-xs font-bold text-on-surface flex items-center gap-1.5 pl-1">
          <span className="material-symbols-outlined text-[16px] text-primary">translate</span>
          Pitch Language:
        </span>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => handleLanguageChange('bm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1 ${
              selectedLanguage === 'bm'
                ? 'bg-primary text-white shadow-md'
                : 'bg-transparent text-slate-600 hover:text-black'
            }`}
          >
            🇲🇾 Bahasa Melayu
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-1 ${
              selectedLanguage === 'en'
                ? 'bg-primary text-white shadow-md'
                : 'bg-transparent text-slate-600 hover:text-black'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-left scrollbar-none">
        {[
          { key: 'all', label: 'All Templates' },
          { key: 'pitch_fb', label: '🍽️ F&B' },
          { key: 'pitch_retail', label: '💈 Retail/Service' },
          { key: 'standee_promo', label: '🎁 Free Standee' },
          { key: 'onboarding', label: '🚀 Setup' },
          { key: 'trial_nudge', label: '⏰ Trial' },
          { key: 'dormant', label: '🔄 Win-Back' },
          { key: 'quick_link', label: '⚡ Quick Pitch' },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border-none cursor-pointer ${
              selectedCategory === cat.key
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-black/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template Card Selector List */}
      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 text-left">
        {filteredTemplates.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No templates in this category.</p>
        ) : (
          filteredTemplates.map((tmpl) => {
            const isSelected = tmpl.id === selectedTemplateId;
            return (
              <div
                key={tmpl.id}
                onClick={() => applyTemplate(tmpl)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20'
                    : 'bg-white border-black/5 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-on-surface">{tmpl.title}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                  )}
                </div>
                <p className="text-[10px] text-on-surface-variant line-clamp-1">{tmpl.description}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Live Message Body Textarea */}
      <div className="bg-white p-4 rounded-2xl border border-black/5 flex flex-col gap-2 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            Live Message Body (Editable)
          </span>
          <span className="text-[10px] text-on-surface-variant font-mono">{customMsg.length} characters</span>
        </div>

        <Input.TextArea
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          rows={7}
          style={{
            borderRadius: 12,
            fontSize: '12px',
            lineHeight: '1.6',
            fontFamily: 'sans-serif',
            backgroundColor: '#fafafa',
          }}
        />

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
          <span>Variables auto-substituted: <code className="bg-slate-100 px-1 py-0.5 rounded text-primary">referral_link</code></span>
          <Tooltip title="Copy formatted text to paste manually in WhatsApp">
            <button
              onClick={handleCopyMessage}
              className="text-primary hover:underline font-bold border-none bg-transparent cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              Copy Message
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Send Buttons */}
      <div className="flex gap-2 mt-auto text-left">
        <button
          onClick={handleCopyMessage}
          className="flex-1 bg-black/5 hover:bg-black/10 text-on-surface py-3.5 rounded-2xl font-headline font-semibold text-xs transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
          Copy Text
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="flex-[2] bg-[#25D366] hover:bg-[#20BA5A] text-white py-3.5 rounded-2xl font-headline font-semibold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 font-sans"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          Open WhatsApp Chat
        </button>
      </div>
    </Drawer>
  );
};
