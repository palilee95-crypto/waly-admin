import React, { useState, useEffect } from 'react';
import { Input, message, Modal, Select } from 'antd';
import { useSalesData } from './useSalesData';
import type { ReferredMerchant } from './useSalesData';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';
import { CreateProspectModal } from '../../components/CreateProspectModal';
import { pb } from '../../lib/pocketbase';

export const SalesProspectsPage: React.FC = () => {
  const { inactiveProspects, referralLink, identity } = useSalesData();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<ReferredMerchant | null>(null);

  // Create Prospect state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [prospectPhone, setProspectPhone] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Template Picker inside Create Prospect Modal
  const [modalLanguage, setModalLanguage] = useState<'bm' | 'en'>('bm');
  const [modalTemplateId, setModalTemplateId] = useState<string>('bm_fb_pitch');
  const [prospectMessage, setProspectMessage] = useState<string>('');

  // Filter templates for modal by selected language
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

  const filteredProspects = inactiveProspects.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openFollowUpDrawer = (merchant: ReferredMerchant) => {
    setSelectedMerchant(merchant);
    setDrawerVisible(true);
  };

  const handleCreateProspect = async () => {
    if (!prospectPhone.trim()) {
      message.warning('Please enter a phone number.');
      return;
    }

    const cleanPhone = prospectPhone.trim().replace(/[\s\-]/g, '');
    if (!/^(\+?60|0)?\d{8,12}$/.test(cleanPhone)) {
      message.error('Please enter a valid Malaysian phone number (e.g. 0123456789 or +60123456789).');
      return;
    }

    setIsCreating(true);
    try {
      const res = await pb.send('/api/risev/agent/create-prospect', {
        method: 'POST',
        body: {
          phone: prospectPhone.trim(),
          message: prospectMessage,
        },
        requestKey: null,
      });

      if (res.success) {
        message.success('Prospect created! WhatsApp message sent successfully.');
        setCreateModalVisible(false);
        setProspectPhone('');
        window.location.reload();
      } else {
        message.error(res.message || 'Failed to create prospect.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.message || err?.message || 'Failed to create prospect.';
      message.error(errMsg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="mb-2">
        <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">Inactive Prospects</h2>
        <p className="font-body text-sm sm:text-body-lg text-on-surface-variant">Referred merchants who have registered but have not activated a loyalty campaign.</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between border-b border-black/5 dark:border-white/5 mb-6 gap-4 pb-4">
          <h3 className="font-headline text-base font-bold text-on-surface">Prospect List ({filteredProspects.length})</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search prospects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: 10 }}
              className="w-full sm:w-[220px]"
              prefix={<span className="material-symbols-outlined text-[16px] text-outline">search</span>}
            />
            <button
              onClick={() => setCreateModalVisible(true)}
              className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl font-headline font-semibold text-xs transition-all border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span className="hidden sm:inline">Create Prospect</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {filteredProspects.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-8 text-center">No inactive prospects found. Great onboarding speed!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant">Merchant Name</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant hidden sm:table-cell">Registration Date</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant">Status</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredProspects.map((m) => (
                  <tr key={m.id}>
                    <td className="py-4 text-sm font-semibold text-on-surface">{m.name}</td>
                    <td className="py-4 text-sm text-on-surface-variant hidden sm:table-cell">{m.created}</td>
                    <td className="py-4">
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Onboarding Pending</span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => openFollowUpDrawer(m)}
                        className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-3 sm:px-4 py-2 rounded-xl font-headline font-semibold text-xs transition-all border-none cursor-pointer flex items-center gap-1.5 ml-auto font-sans"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        <span className="hidden sm:inline">WhatsApp Onboarding Follow-up</span>
                        <span className="sm:hidden">WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WhatsAppDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        merchant={selectedMerchant}
        referralLink={referralLink}
        agentName={identity?.name}
      />

      <CreateProspectModal
        open={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};