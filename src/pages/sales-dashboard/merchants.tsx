import React, { useState } from 'react';
import { Input } from 'antd';
import { useSalesData } from './useSalesData';
import type { ReferredMerchant } from './useSalesData';
import { WhatsAppDrawer } from './components/WhatsAppDrawer';

export const SalesMerchantsPage: React.FC = () => {
  const { merchantsList, referralLink, identity } = useSalesData();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<ReferredMerchant | null>(null);

  const filteredList = merchantsList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openOutreachDrawer = (merchant: ReferredMerchant) => {
    setSelectedMerchant(merchant);
    setDrawerVisible(true);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="mb-2">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Referred Directory</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Complete list of merchants registered through your referral network.</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between border-b border-black/5 dark:border-white/5 mb-6 gap-4 pb-4">
          <h3 className="font-headline text-base font-bold text-on-surface">All Referred Stores ({filteredList.length})</h3>
          <div>
            <Input
              placeholder="Search referred stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 220, borderRadius: 10 }}
              prefix={<span className="material-symbols-outlined text-[16px] text-outline">search</span>}
            />
          </div>
        </div>

        {filteredList.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-8 text-center">No referred merchants found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant">Name / Category</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant">Registration Date</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant">Total Transactions</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant">Sales Generated</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant">Commission Earned</th>
                  <th className="pb-3 text-xs font-semibold text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredList.map((m) => (
                  <tr key={m.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <p className="text-sm font-semibold text-on-surface mb-0.5">{m.name}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{m.category}</p>
                    </td>
                    <td className="py-4 text-sm text-on-surface-variant">{m.created}</td>
                    <td className="py-4 text-sm text-on-surface font-semibold">{m.totalTransactions}</td>
                    <td className="py-4 text-sm text-on-surface font-semibold">RM {m.totalSales.toLocaleString()}</td>
                    <td className="py-4 text-sm text-[#10B981] font-bold">RM {m.commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => openOutreachDrawer(m)}
                        className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-3 py-1.5 rounded-xl font-headline font-semibold text-xs transition-all border-none cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        Outreach
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
    </div>
  );
};
