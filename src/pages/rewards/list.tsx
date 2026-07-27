import React from 'react';
import { useTable, useShow } from '@refinedev/core';
import { useForm, useSelect } from '@refinedev/antd';
import { Form, Input, Select, Button, InputNumber, DatePicker, message } from 'antd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';

// ==========================================
// 1. RewardList
// ==========================================
export const RewardList: React.FC = () => {
  const navigate = useNavigate();
  const { tableQueryResult } = useTable<any>({
    resource: 'rewards',
    pagination: { pageSize: 50 },
    meta: {
      expand: ['merchant'],
    },
  });

  const rewards = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            WALY REWARDS & CATALOG
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Rewards Catalog
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-5 font-medium leading-relaxed">
            Configure catalog items, point cost redemption thresholds, and store voucher assignments.
          </p>

          <button
            onClick={() => navigate('/rewards/create')}
            className="inline-flex items-center gap-2 bg-[#6bfe9c] text-[#002d1e] font-black text-xs px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-lg border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ New Reward Item</span>
          </button>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1100px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* Title & Count Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant dark:border-white/10 mb-4">
              <h3 className="text-sm sm:text-base font-black text-on-surface dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006d37] dark:text-[#6bfe9c]">emoji_events</span>
                Catalog Items
              </h3>
              <span className="text-xs font-bold text-[#006d37] dark:text-[#6bfe9c]">
                {rewards.length} Rewards Active
              </span>
            </div>

            {/* Mobile-Native Clean Cards Grid */}
            {tableQueryResult.isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
              </div>
            ) : rewards.length === 0 ? (
              <div className="py-14 text-center text-on-surface-variant dark:text-[#85af9b]">
                <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">emoji_events</span>
                <p className="text-xs font-bold text-on-surface dark:text-white">No rewards found in the catalog.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="bg-[#f8faf9] dark:bg-[#001f15] rounded-2xl p-4 border border-surface-variant dark:border-[#004d30] flex flex-col justify-between shadow-sm hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all group"
                  >
                    <div>
                      {/* Top Row: Icon, Title, and Status Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-lg shrink-0 border border-amber-500/20">
                            🎁
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs sm:text-sm font-black text-on-surface dark:text-white mb-0.5 group-hover:text-[#006d37] dark:group-hover:text-[#6bfe9c] transition-colors leading-tight">
                              {reward.name}
                            </h4>
                            <span className="text-[10px] font-bold text-[#006d37] dark:text-[#6bfe9c]">
                              {reward.expand?.merchant?.name || reward.merchant || 'Platform-wide'}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {reward.is_active ? (
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border border-[#6bfe9c]/30">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                              RETIRED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info Row: Type, Points, and Stock */}
                      <div className="bg-white dark:bg-[#002518] p-2.5 rounded-xl border border-surface-variant dark:border-[#004d30] flex items-center justify-between text-[11px] mb-3">
                        <span className="text-[10px] font-bold text-on-surface-variant dark:text-[#85af9b] uppercase">
                          {reward.type ? reward.type.replace('_', ' ') : 'Free Item'}
                        </span>
                        <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                          ⚡ {reward.points_cost || 0} pts
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Pill Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-variant dark:border-white/10">
                      <button
                        onClick={() => navigate(`/rewards/show/${reward.id}`)}
                        className="bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-[#85af9b] px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-white/10 cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => navigate(`/rewards/edit/${reward.id}`)}
                        className="bg-[#006d37]/10 hover:bg-[#006d37]/20 text-[#006d37] dark:text-[#6bfe9c] px-3 py-1.5 rounded-xl text-[11px] font-black border border-[#006d37]/20 cursor-pointer flex items-center gap-1"
                      >
                        <span>Edit</span>
                        <span className="material-symbols-outlined text-xs">edit</span>
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

// ==========================================
// 2. RewardCreate
// ==========================================
export const RewardCreate: React.FC = () => {
  const navigate = useNavigate();
  const { onFinish, formProps } = useForm<any>({
    resource: 'rewards',
    action: 'create',
    redirect: 'list',
  });

  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
  });

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      is_active: values.status === 'active',
      valid_until: values.valid_until ? values.valid_until.toISOString() : null,
    };
    onFinish(formattedValues);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto font-body">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">New Reward Item</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Add a reward item to the catalog</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{ type: 'free_item', points_cost: 100, status: 'active' }}
        >
          <Form.Item
            name="name"
            label="Reward Name"
            rules={[{ required: true, message: 'Please enter reward name' }]}
          >
            <Input className="h-10 rounded-xl" placeholder="e.g. Free Hot Latte" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} className="rounded-xl" placeholder="Describe reward usage rules..." />
          </Form.Item>

          <Form.Item name="merchant" label="Merchant Scope" rules={[{ required: true, message: 'Please assign a merchant' }]}>
            <Select
              {...merchantSelectProps}
              placeholder="Search or select merchant"
              className="h-10 rounded-xl"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label="Reward Type" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="free_item">Free Item</Select.Option>
                <Select.Option value="discount">Percentage Discount</Select.Option>
                <Select.Option value="voucher">Voucher</Select.Option>
                <Select.Option value="experience">Exclusive Experience</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="points_cost" label="Points Cost" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="stock" label="Stock (Leave empty for Unlimited)">
              <InputNumber min={1} className="w-full h-10 rounded-xl flex items-center" placeholder="e.g. 50" />
            </Form.Item>

            <Form.Item name="valid_until" label="Valid Until">
              <DatePicker className="w-full h-10 rounded-xl" />
            </Form.Item>
          </div>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select className="h-10 rounded-xl">
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="retired">Retired / Disabled</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex gap-4 justify-end mt-6">
            <Button
              onClick={() => navigate('/rewards')}
              className="h-11 rounded-xl px-6 font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              Create Reward
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

// ==========================================
// 3. RewardEdit
// ==========================================
export const RewardEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onFinish, formProps, queryResult } = useForm<any>({
    resource: 'rewards',
    action: 'edit',
    id,
    redirect: 'list',
  });

  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
  });

  const record = queryResult?.data?.data;

  React.useEffect(() => {
    if (record) {
      formProps.form?.setFieldsValue({
        valid_until: record.valid_until ? dayjs(record.valid_until) : null,
        status: record.is_active ? 'active' : 'retired',
      });
    }
  }, [record, formProps.form]);

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      is_active: values.status === 'active',
      valid_until: values.valid_until ? values.valid_until.toISOString() : null,
    };
    onFinish(formattedValues);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto font-body">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Edit Reward</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Update item parameters</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Reward Name"
            rules={[{ required: true, message: 'Please enter reward name' }]}
          >
            <Input className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} className="rounded-xl" />
          </Form.Item>

          <Form.Item name="merchant" label="Merchant Scope" rules={[{ required: true }]}>
            <Select
              {...merchantSelectProps}
              className="h-10 rounded-xl"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label="Reward Type" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="free_item">Free Item</Select.Option>
                <Select.Option value="discount">Percentage Discount</Select.Option>
                <Select.Option value="voucher">Voucher</Select.Option>
                <Select.Option value="experience">Exclusive Experience</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="points_cost" label="Points Cost" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="stock" label="Stock (Leave empty for Unlimited)">
              <InputNumber min={0} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>

            <Form.Item name="valid_until" label="Valid Until">
              <DatePicker className="w-full h-10 rounded-xl" />
            </Form.Item>
          </div>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select className="h-10 rounded-xl">
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="retired">Retired / Disabled</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex gap-4 justify-end mt-6">
            <Button
              onClick={() => navigate('/rewards')}
              className="h-11 rounded-xl px-6 font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

// ==========================================
// 4. RewardShow
// ==========================================
export const RewardShow: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { queryResult } = useShow({
    resource: 'rewards',
    id,
    meta: {
      expand: ['merchant'],
    },
  });

  const reward = queryResult?.data?.data;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto font-body">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Reward Details</h2>
          <p className="text-body-lg text-on-surface-variant">Inspect item definitions and stock totals</p>
        </div>
        <button
          onClick={() => navigate('/rewards')}
          className="bg-slate-200 text-on-surface px-6 py-2.5 rounded-xl font-headline font-semibold flex items-center gap-2 transition-all border-none cursor-pointer"
        >
          Back to List
        </button>
      </div>

      {queryResult.isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : reward ? (
        <div className="glass-panel rounded-[2rem] p-gutter flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <h3 className="font-headline text-xl font-bold text-on-surface">{reward.name}</h3>
            {reward.is_active ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Retired</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-[10px] text-outline uppercase font-semibold">Merchant Scope</p>
              <p className="font-semibold text-on-surface">
                {reward.expand?.merchant?.name || reward.merchant || 'Platform-wide'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-outline uppercase font-semibold">Reward Type</p>
              <p className="font-semibold text-on-surface uppercase">{reward.type}</p>
            </div>
            <div>
              <p className="text-[10px] text-outline uppercase font-semibold">Points Cost</p>
              <p className="font-semibold text-on-surface text-primary font-bold">{reward.points_cost} pts</p>
            </div>
            <div>
              <p className="text-[10px] text-outline uppercase font-semibold">Stock Inventory</p>
              <p className="font-semibold text-on-surface">{reward.stock ?? 'Unlimited'}</p>
            </div>
            {reward.valid_until && (
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Expiry Date</p>
                <p className="font-semibold text-on-surface">{new Date(reward.valid_until).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {reward.description && (
            <div className="border-t border-black/5 pt-4">
              <p className="text-[10px] text-outline uppercase font-semibold">Description</p>
              <p className="text-on-surface text-sm mt-1">{reward.description}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-20 text-center text-on-surface-variant">Reward not found</div>
      )}
    </div>
  );
};
export const RedemptionList: React.FC = () => <div>Redemption List Placeholder</div>;
export const RedemptionShow: React.FC = () => <div>Show Redemption Placeholder</div>;
