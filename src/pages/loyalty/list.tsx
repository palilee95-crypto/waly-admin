import React from 'react';
import { useTable, useShow } from '@refinedev/core';
import { useForm, useSelect } from '@refinedev/antd';
import { Form, Input, Select, Button, InputNumber, DatePicker, message, Switch } from 'antd';
import { useNavigate, useParams, Link } from 'react-router-dom';

// Helper to supply default benefit strings for tiers
const getTierBenefits = (tierName: string) => {
  switch (String(tierName).toLowerCase()) {
    case 'bronze':
      return 'Base earn rate';
    case 'silver':
      return 'Priority support, Birthday bonus';
    case 'gold':
      return 'Early campaign access, Free monthly reward';
    case 'platinum':
      return 'Dedicated account manager, VIP events';
    default:
      return 'Standard member perks';
  }
};

// ==========================================
// 1. TierList
// ==========================================
export const TierList: React.FC = () => {
  const navigate = useNavigate();
  const { tableQueryResult } = useTable<any>({
    resource: 'tiers',
    sorters: { initial: [{ field: 'level', order: 'asc' }] },
  });

  const tiers = tableQueryResult?.data?.data || [];
  const displayTiers = tiers.length > 0 ? tiers : [
    { id: 'bronze', name: 'Bronze', min_points: 0, multiplier: 1.0 },
    { id: 'silver', name: 'Silver', min_points: 2000, multiplier: 1.25 },
    { id: 'gold', name: 'Gold', min_points: 5000, multiplier: 1.5 },
    { id: 'platinum', name: 'Platinum', min_points: 10000, multiplier: 2.0 }
  ];

  const getTierIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '👑';
      default: return '⭐';
    }
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            WALY MEMBER REWARDS & TIERS
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Loyalty Tiers & Rules
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-5 font-medium leading-relaxed">
            Global membership levels, points multiplier rates, and tier benefit rules.
          </p>

          <button
            onClick={() => navigate('/loyalty/stamp-cards')}
            className="inline-flex items-center gap-2 bg-[#6bfe9c] text-[#002d1e] font-black text-xs px-4 py-2.5 rounded-full hover:scale-105 transition-all shadow-md border-none cursor-pointer"
          >
            <span>View Stamp Cards</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1100px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* Header Title Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant dark:border-white/10 mb-4">
              <h3 className="text-sm sm:text-base font-black text-on-surface dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006d37] dark:text-[#6bfe9c]">workspace_premium</span>
                Membership Tier Definitions
              </h3>
              <span className="text-xs font-bold text-[#006d37] dark:text-[#6bfe9c]">
                {displayTiers.length} Active Tiers
              </span>
            </div>

            {/* Mobile-Native Clean Cards Grid */}
            {tableQueryResult.isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {displayTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="bg-[#f8faf9] dark:bg-[#001f15] rounded-2xl p-4 border border-surface-variant dark:border-[#004d30] flex flex-col justify-between shadow-sm hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all group"
                  >
                    <div>
                      {/* Top Row: Tier Icon, Name, and Multiplier Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#006d37]/10 text-[#006d37] dark:bg-[#6bfe9c]/15 dark:text-[#6bfe9c] flex items-center justify-center font-black text-xl shrink-0 border border-[#006d37]/15">
                            {getTierIcon(tier.name)}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-on-surface dark:text-white mb-0.5 group-hover:text-[#006d37] dark:group-hover:text-[#6bfe9c] transition-colors leading-tight">
                              {tier.name} Tier
                            </h4>
                            <span className="text-[10px] font-bold text-on-surface-variant dark:text-[#85af9b]">
                              Min Threshold: {(tier.min_points || 0).toLocaleString()} pts
                            </span>
                          </div>
                        </div>

                        {/* Multiplier Badge */}
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border border-[#6bfe9c]/30">
                          {tier.multiplier}x Multiplier
                        </span>
                      </div>

                      {/* Benefits Box */}
                      <div className="bg-white dark:bg-[#002518] p-3 rounded-xl border border-surface-variant dark:border-[#004d30] mb-3">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#006d37] dark:text-[#6bfe9c] block mb-0.5">PERKS & BENEFITS</span>
                        <p className="text-xs text-on-surface dark:text-white font-medium leading-relaxed">
                          {getTierBenefits(tier.name)}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Edit Action Button */}
                    <div className="flex items-center justify-end pt-2 border-t border-surface-variant dark:border-white/10">
                      <button
                        onClick={() => navigate(`/loyalty/tiers/edit/${tier.id}`)}
                        className="bg-[#006d37]/10 hover:bg-[#006d37]/20 text-[#006d37] dark:text-[#6bfe9c] px-3.5 py-1.5 rounded-xl text-xs font-black border border-[#006d37]/20 cursor-pointer flex items-center gap-1 transition-all"
                      >
                        <span>Edit Definitions</span>
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
};

export const TierEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onFinish, formProps, queryResult } = useForm<any>({
    resource: 'tiers',
    action: 'edit',
    id,
    redirect: 'list',
  });

  const tierData = queryResult?.data?.data;
  const tierName = tierData?.name || (id ? id.toUpperCase() : 'Tier');

  const minPts = Form.useWatch('min_points', formProps.form) || tierData?.min_points || 0;
  const multiplier = Form.useWatch('multiplier', formProps.form) || tierData?.multiplier || 1.0;

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[800px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            MEMBER TIER CONFIGURATION
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Edit {tierName} Tier Rules
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md font-medium leading-relaxed">
            Modify qualification thresholds and multiplier rates for {tierName} members.
          </p>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[800px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            <Form
              {...formProps}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="flex flex-col gap-5"
            >
              {/* Tier Name Pill Banner */}
              <div className="bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 p-4 rounded-2xl border border-[#006d37]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#006d37] text-[#6bfe9c] flex items-center justify-center font-black text-lg shadow-sm">
                    👑
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider block">CONFIGURING TARGET TIER</span>
                    <h3 className="text-base font-black text-on-surface dark:text-white mb-0 leading-tight">
                      {tierName} Membership Tier
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-[#006d37] text-white">
                  LOCKED NAME
                </span>
              </div>

              {/* Threshold & Multiplier Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                    MINIMUM POINTS THRESHOLD (PTS) <span className="text-red-500">*</span>
                  </label>
                  <Form.Item name="min_points" rules={[{ required: true, message: 'Required' }]} className="mb-0">
                    <InputNumber
                      min={0}
                      className="w-full h-11 rounded-2xl text-sm font-black flex items-center border-slate-200 dark:border-[#004d30]"
                      placeholder="e.g. 500"
                    />
                  </Form.Item>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                    EARN MULTIPLIER RATE (X) <span className="text-red-500">*</span>
                  </label>
                  <Form.Item name="multiplier" rules={[{ required: true, message: 'Required' }]} className="mb-0">
                    <InputNumber
                      min={1.0}
                      step={0.1}
                      className="w-full h-11 rounded-2xl text-sm font-black flex items-center border-slate-200 dark:border-[#004d30]"
                      placeholder="e.g. 2.0"
                    />
                  </Form.Item>
                </div>

              </div>

              {/* Live Rule Preview Box */}
              <div className="p-4 rounded-2xl bg-[#002d1e] text-white border border-[#004d30] flex flex-col gap-1.5 shadow-sm mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#6bfe9c]">LIVE RULE CALCULATION PREVIEW</span>
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/20 text-[#6bfe9c] border border-[#6bfe9c]/30">
                    ACTIVE RULE
                  </span>
                </div>
                <p className="text-xs text-[#85af9b] mb-0 font-medium leading-relaxed">
                  Customers who reach <strong className="text-white font-black">{minPts.toLocaleString()} pts</strong> will automatically unlock <strong className="text-[#6bfe9c] font-black">{tierName} Tier</strong> privileges and earn <strong className="text-[#6bfe9c] font-black">{multiplier}x bonus points</strong> on all store scans.
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-variant dark:border-white/10">
                <button
                  type="button"
                  onClick={() => navigate('/loyalty/tiers')}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-transparent text-slate-600 dark:text-[#85af9b] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-black bg-[#006d37] hover:bg-[#004d27] text-white border-none cursor-pointer transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>Save Tier Rules</span>
                  <span className="material-symbols-outlined text-sm">check</span>
                </button>
              </div>

            </Form>

          </div>
        </div>
      </div>

    </div>
  );
};

// ==========================================
// 3. StampCardList
// ==========================================
export const StampCardList: React.FC = () => {
  const navigate = useNavigate();
  const { tableQueryResult } = useTable<any>({
    resource: 'loyalty_programs',
    meta: {
      expand: ['merchant'],
    },
  });

  const cards = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Stamp Card Templates</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Manage merchant stamp configurations</p>
        </div>
        <button
          onClick={() => navigate('/loyalty/tiers')}
          className="bg-slate-200 text-on-surface px-6 py-2.5 rounded-xl font-headline font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
        >
          View Loyalty Tiers
        </button>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter overflow-hidden flex flex-col">
        {tableQueryResult.isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Merchant</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Card Name / Reward</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Total Stamps Required</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Validity Period</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body">
                {cards.length === 0 ? (
                  // Render sample default templates
                  [
                    { id: 'card-1', merchant: 'Royal Bakery', reward_description: 'Buy 10 Coffee Get 1 Free', stamp_goal: 10, expiry_days: 90, is_active: true },
                    { id: 'card-2', merchant: 'Kopi Town', reward_description: 'Buy 5 Meals Get RM5 Voucher', stamp_goal: 5, expiry_days: 60, is_active: true }
                  ].map((card: any) => (
                    <tr key={card.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-semibold text-on-surface text-sm">{card.merchant}</td>
                      <td className="py-5 text-sm text-on-surface font-semibold">{card.reward_description}</td>
                      <td className="py-5 text-sm text-primary font-bold">{card.stamp_goal} stamps</td>
                      <td className="py-5 text-sm text-on-surface-variant">{card.expiry_days ? `${card.expiry_days} Days` : 'No Expiry'}</td>
                      <td className="py-5">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/loyalty/stamp-cards/show/${card.id}`)}
                            className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Show
                          </button>
                          <button
                            onClick={() => navigate(`/loyalty/stamp-cards/edit/${card.id}`)}
                            className="text-outline font-bold text-xs hover:text-on-surface bg-transparent border-none cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  cards.map((card) => (
                    <tr key={card.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 text-sm text-on-surface-variant">
                        {card.expand?.merchant ? (
                          <Link
                            to={`/merchants/${card.merchant}`}
                            className="text-primary hover:underline"
                            style={{ color: '#0040e0' }}
                          >
                            {card.expand.merchant.name}
                          </Link>
                        ) : (
                          card.merchant || 'Unknown Merchant'
                        )}
                      </td>
                      <td className="py-5 text-sm text-on-surface font-semibold">{card.reward_description || 'Stamp Card'}</td>
                      <td className="py-5 text-sm text-primary font-bold">{card.stamp_goal || 10} stamps</td>
                      <td className="py-5 text-sm text-on-surface-variant">{card.expiry_days ? `${card.expiry_days} Days` : 'No Expiry'}</td>
                      <td className="py-5">
                        {card.is_active ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Disabled</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/loyalty/stamp-cards/show/${card.id}`)}
                            className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Show
                          </button>
                          <button
                            onClick={() => navigate(`/loyalty/stamp-cards/edit/${card.id}`)}
                            className="text-outline font-bold text-xs hover:text-on-surface bg-transparent border-none cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. StampCardShow
// ==========================================
export const StampCardShow: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { queryResult } = useShow({
    resource: 'loyalty_programs',
    id,
    meta: {
      expand: ['merchant'],
    },
  });

  const card = queryResult?.data?.data;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto font-body text-left">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Stamp Card Details</h2>
          <p className="text-body-lg text-on-surface-variant">Review card requirements and completion rewards</p>
        </div>
        <button
          onClick={() => navigate('/loyalty/stamp-cards')}
          className="bg-slate-200 text-on-surface px-6 py-2.5 rounded-xl font-headline font-semibold flex items-center gap-2 transition-all border-none cursor-pointer"
        >
          Back to Templates
        </button>
      </div>

      {queryResult.isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : card ? (
        <div className="glass-panel rounded-[2rem] p-gutter flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <h3 className="font-headline text-xl font-bold text-on-surface">{card.reward_description || 'Stamp Program'}</h3>
            {card.is_active ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Disabled</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-[10px] text-outline uppercase font-semibold">Merchant</p>
              <p className="font-semibold text-on-surface">{card.expand?.merchant?.name || card.merchant || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-outline uppercase font-semibold">Stamps Required</p>
              <p className="font-semibold text-on-surface">{card.stamp_goal || 10} stamps</p>
            </div>
            <div>
              <p className="text-[10px] text-outline uppercase font-semibold">Reward Link ID</p>
              <p className="font-semibold text-on-surface text-primary">{card.linked_reward || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-outline uppercase font-semibold">Validation Period</p>
              <p className="font-semibold text-on-surface">{card.expiry_days ? `${card.expiry_days} Days` : 'No Expiry'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-on-surface-variant">Stamp Card Template not found</div>
      )}
    </div>
  );
};

// ==========================================
// 5. StampCardEdit
// ==========================================
export const StampCardEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onFinish, formProps } = useForm<any>({
    resource: 'loyalty_programs',
    action: 'edit',
    id,
    redirect: 'list',
  });

  const { selectProps: rewardSelectProps } = useSelect<any>({
    resource: 'rewards',
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto text-left">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Edit Stamp Card Template</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Configure stamp levels and rewards</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            name="reward_description"
            label="Template Name / Reward Description"
            rules={[{ required: true, message: 'Please enter reward description' }]}
          >
            <Input className="h-10 rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="stamp_goal" label="Total Stamps Required" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>

            <Form.Item name="expiry_days" label="Expiry Days (Leave empty for No Expiry)">
              <InputNumber min={1} className="w-full h-10 rounded-xl flex items-center" placeholder="e.g. 90" />
            </Form.Item>
          </div>

          <Form.Item name="linked_reward" label="Completion Reward Link" rules={[{ required: true, message: 'Please choose reward link' }]}>
            <Select
              {...rewardSelectProps}
              placeholder="Search or select a reward catalog item"
              className="h-10 rounded-xl"
            />
          </Form.Item>

          <Form.Item name="is_active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Disabled" />
          </Form.Item>

          <div className="flex gap-4 justify-end mt-6">
            <Button
              onClick={() => navigate('/loyalty/stamp-cards')}
              className="h-11 rounded-xl px-6 font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              Save Template
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};
