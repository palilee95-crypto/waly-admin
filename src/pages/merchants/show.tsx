import React from 'react';
import { useShow, useList } from '@refinedev/core';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Spin, message } from 'antd';

export const MerchantShow: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Fetch Merchant detail (including owner details)
  const { queryResult } = useShow<any>({
    resource: 'merchants',
    id,
    meta: {
      expand: ['owner'],
    },
  });

  const merchant = queryResult?.data?.data;

  // 2. Fetch loyalty programs (stamp cards) for this merchant
  const { data: stampCardsData, isLoading: isLoadingStamps } = useList<any>({
    resource: 'loyalty_programs',
    filters: [
      {
        field: 'merchant',
        operator: 'eq',
        value: id,
      },
    ],
  });

  // 3. Fetch point rewards for this merchant
  const { data: rewardsData, isLoading: isLoadingRewards } = useList<any>({
    resource: 'rewards',
    filters: [
      {
        field: 'merchant',
        operator: 'eq',
        value: id,
      },
    ],
  });

  const stampCards = stampCardsData?.data || [];
  const rewards = rewardsData?.data || [];

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <button
            onClick={() => navigate('/merchants')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#85af9b] hover:text-white mb-3 bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full transition-all border border-white/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Merchant Onboarding</span>
          </button>

          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            STORE INSPECTOR & AUDIT
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            {merchant?.name ? `${merchant.name}` : 'Merchant Details'}
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md font-medium leading-relaxed">
            Inspect active loyalty programs, reward catalogs, contact details, and program NFC URLs.
          </p>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1100px] mx-auto w-full px-3 sm:px-6">
          
          {queryResult.isLoading ? (
            <div className="-mt-16 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-12 text-center border border-surface-variant dark:border-[#004d30]">
              <Spin size="large" />
            </div>
          ) : merchant ? (
            <div className="-mt-16 relative z-30 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Merchant Profile & NFC Card (lg:col-span-4) */}
              <div className="lg:col-span-4 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col gap-4">
                
                {/* Store Header */}
                <div className="flex flex-col items-center text-center pb-4 border-b border-surface-variant dark:border-white/10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#006d37] to-[#6bfe9c] text-white p-0.5 shadow-md mb-2">
                    <div className="w-full h-full bg-[#002d1e] rounded-[14px] flex items-center justify-center text-[#6bfe9c] font-black text-xl">
                      {(merchant.name || 'M').substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-black text-on-surface dark:text-white mb-1 leading-tight">
                    {merchant.name}
                  </h3>

                  <span className={`text-[10px] font-black px-3 py-0.5 rounded-full border ${
                    merchant.status === 'active'
                      ? 'bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border-[#6bfe9c]/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {merchant.status ? merchant.status.toUpperCase() : 'PENDING'}
                  </span>
                </div>

                {/* Details Breakdown */}
                <div className="flex flex-col gap-3 text-xs text-left">
                  <div className="bg-[#f8faf9] dark:bg-[#001f15] p-3 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                    <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider block mb-0.5">CATEGORY</span>
                    <span className="font-bold text-on-surface dark:text-white capitalize">{merchant.category || 'General'}</span>
                  </div>

                  <div className="bg-[#f8faf9] dark:bg-[#001f15] p-3 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                    <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider block mb-0.5">JOINED DATE</span>
                    <span className="font-bold text-on-surface dark:text-white">{new Date(merchant.created).toLocaleDateString()}</span>
                  </div>

                  <div className="bg-[#f8faf9] dark:bg-[#001f15] p-3 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                    <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider block mb-0.5">OWNER DETAILS</span>
                    <p className="font-bold text-on-surface dark:text-white mb-0.5">{merchant.expand?.owner?.name || 'Store Owner'}</p>
                    <p className="font-mono text-on-surface-variant dark:text-[#85af9b]">{merchant.expand?.owner?.phone || 'No phone added'}</p>
                  </div>

                  <div className="bg-[#f8faf9] dark:bg-[#001f15] p-3 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                    <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider block mb-0.5">STORE DESCRIPTION</span>
                    <p className="text-on-surface dark:text-white font-medium leading-relaxed">{merchant.description || merchant.address || 'No store description added.'}</p>
                  </div>

                  {/* NFC URL Section */}
                  <div className="bg-[#002d1e] text-white p-3.5 rounded-2xl border border-[#004d30] flex flex-col gap-2 shadow-sm">
                    <span className="text-[9px] font-black uppercase text-[#6bfe9c] tracking-wider">NFC PROGRAM CARD URL</span>
                    <div className="bg-[#00150e] p-2 rounded-xl text-[11px] font-mono break-all text-white/90 border border-white/10">
                      https://risev-five.vercel.app/nfc?m={merchant.id}
                    </div>
                    <button
                      onClick={() => {
                        const nfcUrl = `https://risev-five.vercel.app/nfc?m=${merchant.id}`;
                        navigator.clipboard.writeText(nfcUrl);
                        message.success('NFC Link copied to clipboard!');
                      }}
                      className="w-full bg-[#006d37] hover:bg-[#004d27] text-white py-2.5 rounded-xl text-xs font-black transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 mt-1"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      <span>Copy NFC Link</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* Right Column: Loyalty Programs & Rewards Tabs (lg:col-span-8) */}
              <div className="lg:col-span-8 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
                <Tabs defaultActiveKey="1" className="font-headline font-semibold">
                  
                  {/* Tab 1: Stamp Cards */}
                  <Tabs.TabPane
                    tab={
                      <span className="flex items-center gap-2 text-xs font-bold">
                        <span className="material-symbols-outlined text-base text-[#006d37] dark:text-[#6bfe9c]">bolt</span>
                        Loyalty Programs ({stampCards.length})
                      </span>
                    }
                    key="1"
                  >
                    {isLoadingStamps ? (
                      <div className="py-12 flex justify-center"><Spin /></div>
                    ) : stampCards.length === 0 ? (
                      <div className="py-12 text-center text-on-surface-variant dark:text-[#85af9b]">
                        <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">bolt</span>
                        <p className="text-xs font-bold text-on-surface dark:text-white">No active stamp cards created yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 mt-3">
                        {stampCards.map((card: any) => (
                          <div 
                            key={card.id}
                            className="bg-[#f8faf9] dark:bg-[#001f15] p-3.5 rounded-2xl border border-surface-variant dark:border-[#004d30] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <h4 className="text-xs sm:text-sm font-black text-on-surface dark:text-white mb-0.5">{card.name}</h4>
                              <p className="text-[11px] text-on-surface-variant dark:text-[#85af9b] font-medium">{card.reward_description || 'Stamp card reward'}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs font-black text-[#006d37] dark:text-[#6bfe9c] bg-[#6bfe9c]/15 px-2.5 py-1 rounded-xl">
                                {card.stamp_goal} Stamps
                              </span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                card.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {card.is_active ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Tabs.TabPane>

                  {/* Tab 2: Point Rewards */}
                  <Tabs.TabPane
                    tab={
                      <span className="flex items-center gap-2 text-xs font-bold">
                        <span className="material-symbols-outlined text-base text-amber-500">emoji_events</span>
                        Point Rewards ({rewards.length})
                      </span>
                    }
                    key="2"
                  >
                    {isLoadingRewards ? (
                      <div className="py-12 flex justify-center"><Spin /></div>
                    ) : rewards.length === 0 ? (
                      <div className="py-12 text-center text-on-surface-variant dark:text-[#85af9b]">
                        <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">emoji_events</span>
                        <p className="text-xs font-bold text-on-surface dark:text-white">No redemption rewards set up yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 mt-3">
                        {rewards.map((reward: any) => (
                          <div 
                            key={reward.id}
                            className="bg-[#f8faf9] dark:bg-[#001f15] p-3.5 rounded-2xl border border-surface-variant dark:border-[#004d30] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <h4 className="text-xs sm:text-sm font-black text-on-surface dark:text-white mb-0.5">{reward.name}</h4>
                              <span className="text-[10px] font-bold text-on-surface-variant dark:text-[#85af9b] uppercase">{reward.type}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-xl">
                                {reward.points_cost} Pts
                              </span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                reward.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {reward.is_active ? 'ACTIVE' : 'RETIRED'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Tabs.TabPane>

                </Tabs>
              </div>

            </div>
          ) : (
            <div className="-mt-16 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-12 text-center border border-surface-variant dark:border-[#004d30]">
              <p className="text-sm font-bold text-on-surface dark:text-white">Merchant not found or could not be loaded.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
