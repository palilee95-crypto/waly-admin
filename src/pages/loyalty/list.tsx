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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Loyalty Tiers</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Global membership levels and multiplier rules</p>
        </div>
        <button
          onClick={() => navigate('/loyalty/stamp-cards')}
          className="bg-slate-200 text-on-surface px-6 py-2.5 rounded-xl font-headline font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
        >
          View Stamp Card Templates
        </button>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter overflow-hidden flex flex-col text-left">
        {tableQueryResult.isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Tier Name</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Min Points</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Multiplier</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Benefits</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body">
                {tiers.length === 0 ? (
                  // If DB is empty, render mock defaults
                  [
                    { id: 'bronze', name: 'Bronze', min_points: 0, multiplier: 1.0 },
                    { id: 'silver', name: 'Silver', min_points: 2000, multiplier: 1.25 },
                    { id: 'gold', name: 'Gold', min_points: 5000, multiplier: 1.5 },
                    { id: 'platinum', name: 'Platinum', min_points: 10000, multiplier: 2.0 }
                  ].map((tier) => (
                    <tr key={tier.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-semibold text-on-surface text-sm">{tier.name}</td>
                      <td className="py-5 text-sm text-on-surface">{tier.min_points.toLocaleString()} pts</td>
                      <td className="py-5 text-sm text-primary font-bold">{tier.multiplier}x</td>
                      <td className="py-5 text-sm text-on-surface-variant max-w-[300px] truncate">
                        {getTierBenefits(tier.name)}
                      </td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => navigate(`/loyalty/tiers/edit/${tier.id}`)}
                          className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Edit Definitions
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  tiers.map((tier) => (
                    <tr key={tier.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-semibold text-on-surface text-sm">{tier.name}</td>
                      <td className="py-5 text-sm text-on-surface">{(tier.min_points || 0).toLocaleString()} pts</td>
                      <td className="py-5 text-sm text-primary font-bold">{tier.multiplier}x</td>
                      <td className="py-5 text-sm text-on-surface-variant">
                        {getTierBenefits(tier.name)}
                      </td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => navigate(`/loyalty/tiers/edit/${tier.id}`)}
                          className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Edit Definitions
                        </button>
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
// 2. TierEdit
// ==========================================
export const TierEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onFinish, formProps } = useForm<any>({
    resource: 'tiers',
    action: 'edit',
    id,
    redirect: 'list',
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto text-left">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Edit Loyalty Tier</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Modify thresholds and earnings multipliers</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item name="name" label="Tier Name">
            <Input className="h-10 rounded-xl" disabled />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="min_points" label="Minimum Points Threshold" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>

            <Form.Item name="multiplier" label="Earn Multiplier Rate" rules={[{ required: true }]}>
              <InputNumber min={1.0} step={0.1} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>
          </div>

          <div className="flex gap-4 justify-end mt-6">
            <Button
              onClick={() => navigate('/loyalty/tiers')}
              className="h-11 rounded-xl px-6 font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              Save Tier Rules
            </Button>
          </div>
        </Form>
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
