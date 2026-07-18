import React, { useState } from 'react';
import { Input } from 'antd';
import { useSalesData } from './useSalesData';
import type { ReferredMerchant } from './useSalesData';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';

export const SalesProspectsPage: React.FC = () => {
  const { inactiveProspects, referralLink } = useSalesData();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<ReferredMerchant | null>(null);

  const filteredProspects = inactiveProspects.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openFollowUpDrawer = (merchant: ReferredMerchant) => {
    setSelectedMerchant(merchant);
    setDrawerVisible(true);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="mb-2">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Inactive Prospects</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Referred merchants who have registered but have not activated a loyalty campaign.</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between border-b border-black/5 dark:border-white/5 mb-6 gap-4 pb-4">
          <h3 className="font-headline text-base font-bold text-on-surface">Prospect List ({filteredProspects.length})</h3>
          <div>
            <Input
              placeholder="Search prospects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 220, borderRadius: 10 }}
              prefix={<span className="material-symbols-outlined text-[16px] text-outline">search</span>}
            />
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
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant">Registration Date</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant">Status</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredProspects.map((m) => (
                  <tr key={m.id}>
                    <td className="py-4 text-sm font-semibold text-on-surface">{m.name}</td>
                    <td className="py-4 text-sm text-on-surface-variant">{m.created}</td>
                    <td className="py-4">
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Onboarding Pending</span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => openFollowUpDrawer(m)}
                        className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-4 py-2 rounded-xl font-headline font-semibold text-xs transition-all border-none cursor-pointer flex items-center gap-1.5 ml-auto font-sans"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        WhatsApp Onboarding Follow-up
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
    </div>
  );
};
