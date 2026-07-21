import React from 'react';
import { useShow, useList } from '@refinedev/core';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag, Tabs, Card, Spin, message } from 'antd';
import { ArrowLeftOutlined, QrcodeOutlined, TrophyOutlined } from '@ant-design/icons';

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
    <div className="flex flex-col gap-6 text-left font-body">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <button
            onClick={() => navigate('/merchants')}
            className="flex items-center gap-2 text-primary font-bold hover:underline mb-2 bg-transparent border-none cursor-pointer"
            style={{ color: '#0040e0' }}
          >
            <ArrowLeftOutlined /> Back to Merchant Onboarding
          </button>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Merchant Portal Inspector</h2>
          <p className="text-body-lg text-on-surface-variant">Analyze store setups, active loyalty programs, and reward catalogs</p>
        </div>
      </div>

      {queryResult.isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : merchant ? (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Left panel: Merchant Profile Card */}
          <Card className="w-full lg:w-80 shadow-md rounded-[1.5rem] border border-solid border-black/5 bg-white/60 backdrop-blur-xl">
            <div className="flex flex-col items-center gap-4 text-center pb-4 border-b border-solid border-black/5">
              <div className="w-20 h-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                {merchant.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">{merchant.name}</h3>
                <Tag color={merchant.status === 'active' ? 'emerald' : 'orange'} className="mt-1">
                  {merchant.status?.toUpperCase() || 'PENDING'}
                </Tag>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 text-sm">
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Store Category</p>
                <p className="font-semibold text-on-surface capitalize">{merchant.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Joined Date</p>
                <p className="font-semibold text-on-surface">
                  {new Date(merchant.created).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Owner Details</p>
                <p className="font-semibold text-on-surface">{merchant.expand?.owner?.name || 'Unknown'}</p>
                <p className="text-xs text-on-surface-variant font-mono">{merchant.expand?.owner?.phone || 'No Phone'}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Description</p>
                <p className="text-on-surface-variant text-xs leading-relaxed">{merchant.description || 'No store description provided.'}</p>
              </div>

              <div className="pt-4 border-t border-solid border-black/5 flex flex-col gap-2">
                <p className="text-[10px] text-outline uppercase font-semibold">NFC Card Program URL</p>
                <div className="bg-slate-100 p-2 rounded-xl text-xs font-mono break-all text-slate-800 border border-solid border-slate-200">
                  https://waly-five.vercel.app/nfc?m={merchant.id}
                </div>
                <button
                  onClick={() => {
                    const nfcUrl = `https://waly-five.vercel.app/nfc?m=${merchant.id}`;
                    navigator.clipboard.writeText(nfcUrl);
                    message.success('NFC Link copied to clipboard!');
                  }}
                  className="w-full bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all border-none cursor-pointer flex items-center justify-center gap-1 mt-1"
                  style={{ backgroundColor: '#4f46e5' }}
                >
                  📋 Copy NFC Link
                </button>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Use the <strong>NFC Tools</strong> app to write this URL to physical NFC cards for this store.
                </p>
              </div>
            </div>
          </Card>

          {/* Right panel: Details separation tabs */}
          <div className="flex-1 w-full glass-panel rounded-[2rem] p-gutter min-h-[400px]">
            <Tabs defaultActiveKey="1" size="large" className="font-headline font-semibold">
              <Tabs.TabPane
                tab={
                  <span className="flex items-center gap-2">
                    <QrcodeOutlined /> Loyalty Programs (Stamp Cards)
                  </span>
                }
                key="1"
              >
                {isLoadingStamps ? (
                  <div className="py-20 flex justify-center"><Spin /></div>
                ) : (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-black/5">
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Program Name</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Stamp Goal</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Reward Description</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Points Per Stamp</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 font-body text-sm">
                        {stampCards.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                              No stamp card loyalty programs set up by this merchant.
                            </td>
                          </tr>
                        ) : (
                          stampCards.map((card: any) => (
                            <tr key={card.id} className="hover:bg-white/20 transition-colors">
                              <td className="py-4 font-semibold text-on-surface">{card.name}</td>
                              <td className="py-4 text-on-surface">{card.stamp_goal} Stamps</td>
                              <td className="py-4 text-on-surface-variant max-w-[200px] truncate" title={card.reward_description}>
                                {card.reward_description}
                              </td>
                              <td className="py-4 text-on-surface">{card.points_per_stamp || 0} pts</td>
                              <td className="py-4">
                                {card.is_active ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Inactive</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span className="flex items-center gap-2">
                    <TrophyOutlined /> Point Rewards (Redemption Catalog)
                  </span>
                }
                key="2"
              >
                {isLoadingRewards ? (
                  <div className="py-20 flex justify-center"><Spin /></div>
                ) : (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-black/5">
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Reward Name</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Type</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Points Cost</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Stock</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 font-body text-sm">
                        {rewards.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                              No redemption rewards catalogs created by this merchant.
                            </td>
                          </tr>
                        ) : (
                          rewards.map((reward: any) => (
                            <tr key={reward.id} className="hover:bg-white/20 transition-colors">
                              <td className="py-4 font-semibold text-on-surface">{reward.name}</td>
                              <td className="py-4 text-on-surface-variant uppercase text-xs">{reward.type}</td>
                              <td className="py-4 text-primary font-bold">{reward.points_cost} pts</td>
                              <td className="py-4 text-on-surface">{reward.stock ?? 'Unlimited'}</td>
                              <td className="py-4">
                                {reward.is_active ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Retired</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      ) : (
        <Card className="py-10 text-center text-on-surface-variant">
          Merchant not found or could not be loaded.
        </Card>
      )}
    </div>
  );
};
