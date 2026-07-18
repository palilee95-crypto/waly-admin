import React, { useState } from 'react';
import { Input, message, Modal } from 'antd';
import { useSalesData } from './useSalesData';
import type { ReferredMerchant } from './useSalesData';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';
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
        body: { phone: prospectPhone.trim() },
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

  const messagePreview = `Hey! I'm ${identity?.name || 'RISEV Agent'} from RISEV. Deploy Loyalty Stamps for your shop to boost your repeat customer rates. Register here: ${referralLink}`;

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
              style={{ width: '100%', sm: { width: 220 }, borderRadius: 10 }}
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
      />

      {/* Create Prospect Modal */}
      <Modal
        title={null}
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setProspectPhone('');
        }}
        footer={null}
        width="90%"
        style={{ maxWidth: 480 }}
        centered
        styles={{ body: { padding: '0' } }}
      >
        {/* Custom Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-on-surface text-base">Create New Prospect</h3>
              <p className="text-xs text-on-surface-variant">Send a referral link via WhatsApp</p>
            </div>
          </div>
          <button
            onClick={() => { setCreateModalVisible(false); setProspectPhone(''); }}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5">
          {/* Phone Input */}
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block">
              Prospect Phone Number
            </label>
            <Input
              placeholder="e.g. 0123456789 or +60123456789"
              value={prospectPhone}
              onChange={(e) => setProspectPhone(e.target.value)}
              size="large"
              style={{ borderRadius: 12 }}
              prefix={<span className="material-symbols-outlined text-[18px] text-outline">phone</span>}
            />
            <p className="text-xs text-on-surface-variant mt-1.5">
              Enter the prospect's WhatsApp number. A referral link will be sent automatically.
            </p>
          </div>

          {/* WhatsApp Chat Bubble Preview */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Message Preview</p>
            <div className="bg-[#e5ddd5] dark:bg-[#1f2c34] rounded-2xl p-3 overflow-hidden">
              <div className="flex flex-col gap-1">
                {/* Sender bubble */}
                <div className="self-start max-w-[85%] bg-[#ffffff] dark:bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                  <p className="text-[10px] font-bold text-[#075E54] dark:text-[#86d3a3] mb-0.5">RISEV Agent</p>
                  <p className="text-xs text-on-surface leading-relaxed font-body break-words">{messagePreview}</p>
                  <p className="text-[9px] text-on-surface-variant/60 text-right mt-1">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Warning */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl">
            <span className="material-symbols-outlined text-[16px] text-amber-500 shrink-0">info</span>
            <p>Ensure your WhatsApp is connected from the Sales Dashboard first.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-1">
            <button
              onClick={() => { setCreateModalVisible(false); setProspectPhone(''); }}
              className="flex-1 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-on-surface px-4 py-2.5 rounded-xl font-headline font-semibold text-sm transition-all border-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProspect}
              disabled={isCreating}
              className="flex-1 bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-xl font-headline font-semibold text-sm transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {isCreating ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Sending...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Send & Create
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};