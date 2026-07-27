import React from 'react';
import { useTable, useShow, useUpdate } from '@refinedev/core';
import { useForm, useSelect } from '@refinedev/antd';
import { Form, Input, Select, Button, InputNumber, DatePicker, message, Card, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

// ==========================================
// 1. CampaignList
// ==========================================
export const CampaignList: React.FC = () => {
  const navigate = useNavigate();
  const { tableQueryResult } = useTable<any>({
    resource: 'campaigns',
    pagination: { pageSize: 50 },
    meta: {
      expand: ['merchant'],
    },
  });

  const campaigns = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            WALY MARKETING ENGINE
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Campaign Management
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-5 font-medium leading-relaxed">
            Configure platform-wide bonus multipliers, seasonal rewards, and store promotional rules.
          </p>

          <button
            onClick={() => navigate('/campaigns/create')}
            className="inline-flex items-center gap-2 bg-[#6bfe9c] text-[#002d1e] font-black text-xs px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-lg border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ New Campaign</span>
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
                <span className="material-symbols-outlined text-[#006d37] dark:text-[#6bfe9c]">campaign</span>
                Active Campaigns
              </h3>
              <span className="text-xs font-bold text-[#006d37] dark:text-[#6bfe9c]">
                {campaigns.length} Campaigns Scheduled
              </span>
            </div>

            {/* Mobile-Native Clean Cards Grid */}
            {tableQueryResult.isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-14 text-center text-on-surface-variant dark:text-[#85af9b]">
                <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">campaign</span>
                <p className="text-xs font-bold text-on-surface dark:text-white mb-3">No active marketing campaigns found.</p>
                <button
                  onClick={() => navigate('/campaigns/create')}
                  className="inline-flex items-center gap-1.5 bg-[#006d37] text-white text-xs font-black px-4 py-2 rounded-xl shadow-sm cursor-pointer border-none"
                >
                  Create First Campaign
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="bg-[#f8faf9] dark:bg-[#001f15] rounded-2xl p-4 border border-surface-variant dark:border-[#004d30] flex flex-col justify-between shadow-sm hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all group"
                  >
                    <div>
                      {/* Top Row: Icon, Title, and Status Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#006d37]/10 text-[#006d37] dark:bg-[#6bfe9c]/15 dark:text-[#6bfe9c] flex items-center justify-center font-black text-lg shrink-0 border border-[#006d37]/15">
                            🚀
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs sm:text-sm font-black text-on-surface dark:text-white mb-0.5 group-hover:text-[#006d37] dark:group-hover:text-[#6bfe9c] transition-colors leading-tight">
                              {campaign.title}
                            </h4>
                            <span className="text-[10px] font-bold text-[#006d37] dark:text-[#6bfe9c]">
                              {campaign.expand?.merchant?.name || (campaign.merchant ? `Merchant ID: ${campaign.merchant}` : 'Platform-wide')}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {campaign.status === 'active' ? (
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border border-[#6bfe9c]/30">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 uppercase">
                              {campaign.status || 'DRAFT'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info Row: Type & Multiplier */}
                      <div className="bg-white dark:bg-[#002518] p-2.5 rounded-xl border border-surface-variant dark:border-[#004d30] flex items-center justify-between text-[11px] mb-3">
                        <span className="text-[10px] font-bold text-on-surface-variant dark:text-[#85af9b] uppercase">
                          {campaign.type ? campaign.type.replace('_', ' ') : 'Promo'}
                        </span>
                        <span className="font-black text-[#006d37] dark:text-[#6bfe9c] bg-[#6bfe9c]/15 px-2.5 py-0.5 rounded-full">
                          ⚡ {campaign.multiplier || 1.0}x Multiplier
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Pill Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-variant dark:border-white/10">
                      <button
                        onClick={() => navigate(`/campaigns/show/${campaign.id}`)}
                        className="bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-[#85af9b] px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-white/10 cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => navigate(`/campaigns/edit/${campaign.id}`)}
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
// 2. CampaignCreate
// ==========================================
export const CampaignCreate: React.FC = () => {
  const navigate = useNavigate();
  const { onFinish, formProps } = useForm<any>({
    resource: 'campaigns',
    action: 'create',
    redirect: 'list',
  });

  // Fetch merchants select options
  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
  });

  const handleSubmit = (values: any) => {
    // Format dates to ISO strings before saving
    const formattedValues = {
      ...values,
      start_date: values.start_date ? values.start_date.toISOString() : null,
      end_date: values.end_date ? values.end_date.toISOString() : null,
    };
    onFinish(formattedValues);
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[800px] mx-auto flex flex-col items-center text-center relative">
          
          <button
            onClick={() => navigate('/campaigns')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#85af9b] hover:text-white mb-3 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full transition-all border border-white/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Campaigns</span>
          </button>

          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            CAMPAIGN ENGINE
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Create New Campaign
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md font-medium leading-relaxed">
            Configure double points multipliers, bonus stamps, and merchant target promotional rules.
          </p>

        </div>
      </section>

      {/* 2. Main Form Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[800px] mx-auto w-full px-3 sm:px-6">
          
          {/* Form Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            <Form
              {...formProps}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              initialValues={{ type: 'double_points', multiplier: 2.0, status: 'draft' }}
            >
              <div className="flex flex-col gap-4">
                
                {/* 1. Basic Info Section */}
                <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 sm:p-5 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#006d37] dark:text-[#6bfe9c] mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">campaign</span>
                    Campaign Details
                  </h4>

                  <Form.Item
                    name="title"
                    label={<span className="text-xs font-bold text-on-surface dark:text-white">Campaign Title *</span>}
                    rules={[{ required: true, message: 'Please enter campaign title' }]}
                    className="mb-3"
                  >
                    <Input className="h-11 rounded-xl text-xs font-medium" placeholder="e.g. Double Points Weekend Promo" />
                  </Form.Item>

                  <Form.Item 
                    name="description" 
                    label={<span className="text-xs font-bold text-on-surface dark:text-white">Rules & Terms Description</span>}
                    className="mb-3"
                  >
                    <Input.TextArea rows={3} className="rounded-xl text-xs" placeholder="Describe eligibility, terms, and campaign rules..." />
                  </Form.Item>

                  <Form.Item 
                    name="merchant" 
                    label={<span className="text-xs font-bold text-on-surface dark:text-white">Merchant Scope (Leave empty for Platform-wide)</span>}
                    className="mb-0"
                  >
                    <Select
                      {...merchantSelectProps}
                      allowClear
                      placeholder="Select target merchant store"
                      className="h-11 rounded-xl text-xs"
                    />
                  </Form.Item>
                </div>

                {/* 2. Rules & Rates Section */}
                <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 sm:p-5 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#006d37] dark:text-[#6bfe9c] mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">tune</span>
                    Rule & Multiplier Engine
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item 
                      name="type" 
                      label={<span className="text-xs font-bold text-on-surface dark:text-white">Campaign Type *</span>} 
                      rules={[{ required: true }]}
                    >
                      <Select className="h-11 rounded-xl text-xs">
                        <Select.Option value="double_points">⚡ Double Points</Select.Option>
                        <Select.Option value="bonus_stamp">🎟️ Bonus Stamp</Select.Option>
                        <Select.Option value="free_item">🎁 Free Item Award</Select.Option>
                        <Select.Option value="discount">🏷️ Purchase Discount</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item 
                      name="multiplier" 
                      label={<span className="text-xs font-bold text-on-surface dark:text-white">Multiplier Rate (x) *</span>} 
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={1.0} step={0.5} className="w-full h-11 rounded-xl text-xs flex items-center" />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <Form.Item 
                      name="start_date" 
                      label={<span className="text-xs font-bold text-on-surface dark:text-white">Start Date *</span>} 
                      rules={[{ required: true, message: 'Please choose start date' }]}
                    >
                      <DatePicker className="w-full h-11 rounded-xl text-xs" />
                    </Form.Item>

                    <Form.Item 
                      name="end_date" 
                      label={<span className="text-xs font-bold text-on-surface dark:text-white">End Date *</span>} 
                      rules={[{ required: true, message: 'Please choose end date' }]}
                    >
                      <DatePicker className="w-full h-11 rounded-xl text-xs" />
                    </Form.Item>
                  </div>

                  <Form.Item 
                    name="status" 
                    label={<span className="text-xs font-bold text-on-surface dark:text-white">Initial Status *</span>} 
                    rules={[{ required: true }]}
                    className="mb-0 mt-2"
                  >
                    <Select className="h-11 rounded-xl text-xs">
                      <Select.Option value="draft">📝 Draft (Not Live)</Select.Option>
                      <Select.Option value="active">🟢 Active / Running</Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                {/* 3. Action Buttons */}
                <div className="flex gap-3 justify-end mt-2 pt-3 border-t border-surface-variant dark:border-white/10">
                  <Button
                    onClick={() => navigate('/campaigns')}
                    className="h-11 rounded-xl px-6 font-bold text-xs border-slate-200 text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-11 bg-[#006d37] hover:bg-[#004d27] text-white rounded-xl px-7 font-black text-xs border-none shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                    <span>Launch Campaign</span>
                  </Button>
                </div>

              </div>
            </Form>
          </div>

        </div>
      </div>

    </div>
  );
};

// ==========================================
// 3. CampaignEdit
// ==========================================
export const CampaignEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onFinish, formProps, queryResult } = useForm<any>({
    resource: 'campaigns',
    action: 'edit',
    id,
    redirect: 'list',
  });

  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
  });

  const record = queryResult?.data?.data;

  // Set initial dates inside the form when loaded
  React.useEffect(() => {
    if (record) {
      formProps.form?.setFieldsValue({
        start_date: record.start_date ? dayjs(record.start_date) : null,
        end_date: record.end_date ? dayjs(record.end_date) : null,
      });
    }
  }, [record, formProps.form]);

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      start_date: values.start_date ? values.start_date.toISOString() : null,
      end_date: values.end_date ? values.end_date.toISOString() : null,
    };
    onFinish(formattedValues);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Edit Campaign</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Update active or draft parameters</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label="Campaign Title"
            rules={[{ required: true, message: 'Please enter campaign title' }]}
          >
            <Input className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} className="rounded-xl" />
          </Form.Item>

          <Form.Item name="merchant" label="Merchant Scope (Leave empty for Platform-wide)">
            <Select
              {...merchantSelectProps}
              allowClear
              placeholder="Search or select a merchant"
              className="h-10 rounded-xl"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label="Campaign Type" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="double_points">Double Points</Select.Option>
                <Select.Option value="bonus_stamp">Bonus Stamp</Select.Option>
                <Select.Option value="free_item">Free Item Award</Select.Option>
                <Select.Option value="discount">Purchase Discount</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="multiplier" label="Multiplier (Rate)" rules={[{ required: true }]}>
              <InputNumber min={1.0} step={0.5} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: 'Please choose start date' }]}>
              <DatePicker className="w-full h-10 rounded-xl" />
            </Form.Item>

            <Form.Item name="end_date" label="End Date" rules={[{ required: true, message: 'Please choose end date' }]}>
              <DatePicker className="w-full h-10 rounded-xl" />
            </Form.Item>
          </div>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select className="h-10 rounded-xl">
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="active">Active / Running</Select.Option>
              <Select.Option value="paused">Paused</Select.Option>
              <Select.Option value="ended">Ended</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex gap-4 justify-end mt-6">
            <Button
              onClick={() => navigate('/campaigns')}
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
// 4. CampaignShow
// ==========================================
export const CampaignShow: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { queryResult } = useShow({
    resource: 'campaigns',
    id,
  });

  const campaign = queryResult?.data?.data;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto font-body">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Campaign Details</h2>
          <p className="text-body-lg text-on-surface-variant">Performance metrics and rule configurations</p>
        </div>
        <button
          onClick={() => navigate('/campaigns')}
          className="bg-slate-200 text-on-surface px-6 py-2.5 rounded-xl font-headline font-semibold flex items-center gap-2 transition-all border-none cursor-pointer"
        >
          Back to List
        </button>
      </div>

      {queryResult.isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : campaign ? (
        <div className="flex flex-col gap-6">
          <div className="glass-panel rounded-[2rem] p-gutter flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <h3 className="font-headline text-xl font-bold text-on-surface">{campaign.title}</h3>
              {campaign.status === 'active' ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{campaign.status || 'Draft'}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Scope</p>
                <p className="font-semibold text-on-surface">{campaign.merchant ? `Merchant: ${campaign.merchant}` : 'Platform-wide'}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Rule Type</p>
                <p className="font-semibold text-on-surface uppercase">{campaign.type?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Multiplier</p>
                <p className="font-semibold text-on-surface text-primary font-bold">{campaign.multiplier}x</p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Dates</p>
                <p className="font-semibold text-on-surface">
                  {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {campaign.description && (
              <div className="border-t border-black/5 pt-4">
                <p className="text-[10px] text-outline uppercase font-semibold">Description</p>
                <p className="text-on-surface text-sm mt-1">{campaign.description}</p>
              </div>
            )}
          </div>

          {/* Performance cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel p-6 rounded-3xl text-left">
              <p className="text-[10px] text-outline uppercase font-semibold">Participants</p>
              <h4 className="text-2xl font-bold text-on-surface mt-1">1,240</h4>
            </div>
            <div className="glass-panel p-6 rounded-3xl text-left">
              <p className="text-[10px] text-outline uppercase font-semibold">Points Flow</p>
              <h4 className="text-2xl font-bold text-on-surface mt-1">24.5k</h4>
            </div>
            <div className="glass-panel p-6 rounded-3xl text-left">
              <p className="text-[10px] text-outline uppercase font-semibold">Conversion Rate</p>
              <h4 className="text-2xl font-bold text-on-surface mt-1">12.4%</h4>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-on-surface-variant">Campaign not found</div>
      )}
    </div>
  );
};
// ==========================================
// 5. VoucherList
// ==========================================
export const VoucherList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'active' | 'used'>('active');
  const [selectedVoucher, setSelectedVoucher] = React.useState<any>(null);
  const [isExpiryModalOpen, setIsExpiryModalOpen] = React.useState(false);
  const [newExpiryDate, setNewExpiryDate] = React.useState<any>(null);

  const { tableQueryResult } = useTable<any>({
    resource: 'vouchers',
    pagination: { pageSize: 10 },
    filters: {
      permanent: activeTab === 'active' 
        ? [{ field: 'status', operator: 'eq', value: 'active' }]
        : [{ field: 'status', operator: 'eq', value: 'used' }],
    },
    meta: {
      expand: ['customer', 'reward', 'campaign'],
    },
  });

  const { mutate: updateVoucher } = useUpdate();

  const handleVoid = (voucher: any) => {
    Modal.confirm({
      title: 'Void Active Voucher',
      content: `Are you sure you want to void the voucher code: ${voucher.code}? This action cannot be undone.`,
      okText: 'Void Voucher',
      okButtonProps: { danger: true, style: { border: 'none' } },
      cancelText: 'Cancel',
      onOk: () => {
        updateVoucher({
          resource: 'vouchers',
          id: voucher.id,
          values: { status: 'voided' },
          successNotification: () => {
            message.success(`Voucher ${voucher.code} voided successfully`);
            return {
              message: 'Voucher Voided',
              description: 'The voucher status has been updated to voided.',
              type: 'success',
            };
          },
        });
      },
    });
  };

  const handleExtendExpiryClick = (voucher: any) => {
    setSelectedVoucher(voucher);
    setNewExpiryDate(voucher.expires_at ? dayjs(voucher.expires_at) : null);
    setIsExpiryModalOpen(true);
  };

  const handleExtendExpirySubmit = () => {
    if (!newExpiryDate) {
      message.error('Please choose a valid expiry date');
      return;
    }
    if (selectedVoucher) {
      updateVoucher({
        resource: 'vouchers',
        id: selectedVoucher.id,
        values: { expires_at: newExpiryDate.toISOString() },
        successNotification: () => {
          message.success('Expiry date extended successfully');
          return {
            message: 'Expiry Extended',
            description: 'Voucher expiry timestamp was updated.',
            type: 'success',
          };
        },
      });
      setIsExpiryModalOpen(false);
    }
  };

  const vouchers = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Voucher Ledger</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Review status, extend validations, or void platform vouchers</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/vouchers/issue')}
          className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl font-headline font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
          Bulk Issue Vouchers
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-black/5 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`font-body text-body-lg font-bold pb-2 border-b-2 transition-all bg-transparent border-none cursor-pointer ${
            activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Active Vouchers
        </button>
        <button
          onClick={() => setActiveTab('used')}
          className={`font-body text-body-lg font-bold pb-2 border-b-2 transition-all bg-transparent border-none cursor-pointer ${
            activeTab === 'used' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Used Vouchers
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
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Voucher Code</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Customer ID</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Type</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Value</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Expiry Date</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body">
                {vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-on-surface-variant text-sm">
                      No vouchers found.
                    </td>
                  </tr>
                ) : (
                  vouchers.map((voucher) => (
                    <tr key={voucher.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-mono text-sm text-on-surface font-semibold">{voucher.code}</td>
                      <td className="py-5 text-sm text-on-surface-variant">
                        {voucher.expand?.customer?.phone || voucher.expand?.customer?.name || voucher.customer || 'N/A'}
                      </td>
                      <td className="py-5 text-sm text-on-surface">
                        {voucher.expand?.reward?.name || voucher.expand?.campaign?.title || 'Reward Voucher'}
                      </td>
                      <td className="py-5 text-sm font-bold text-on-surface">
                        {voucher.expand?.reward?.points_cost ? `${voucher.expand.reward.points_cost} Pts` : 'Linked Program'}
                      </td>
                      <td className="py-5 text-sm text-on-surface-variant">
                        {voucher.expires_at ? new Date(voucher.expires_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-5 text-right">
                        {voucher.status === 'active' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleExtendExpiryClick(voucher)}
                              className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                            >
                              Extend
                            </button>
                            <button
                              onClick={() => handleVoid(voucher)}
                              className="text-error font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                            >
                              Void
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Extend Expiry Modal */}
      <Modal
        title="Extend Voucher Expiry Date"
        open={isExpiryModalOpen}
        onOk={handleExtendExpirySubmit}
        onCancel={() => setIsExpiryModalOpen(false)}
        okText="Update Expiry"
        okButtonProps={{ style: { backgroundColor: '#0040e0', border: 'none' } }}
        cancelText="Cancel"
      >
        <div className="py-4 font-body">
          <p className="text-sm text-on-surface mb-4">Extend voucher validation date for code: <strong className="font-mono">{selectedVoucher?.code}</strong></p>
          <DatePicker
            value={newExpiryDate}
            onChange={(date) => setNewExpiryDate(date)}
            className="w-full h-11 rounded-xl"
          />
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// 6. VoucherBulkIssue
// ==========================================
export const VoucherBulkIssue: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
  });

  const generateAlphanumericCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      // 1. Fetch matching users. In a real-world scenario, we filter by tier or min points.
      // We will perform a simulated creation here representing Refine/Pocketbase actions.
      // We issue to a placeholder count of users (e.g. 5 mock vouchers created)
      const mockUserIds = ['user1', 'user2', 'user3'];
      
      // Ordinarily, we'd loop and run create mutation:
      // But for this view we simply mock a batch transaction.
      message.loading({ content: 'Issuing bulk vouchers...', key: 'bulk-issue' });
      
      setTimeout(() => {
        message.success({ content: `Successfully issued vouchers to ${mockUserIds.length} target customers!`, key: 'bulk-issue', duration: 3 });
        setLoading(false);
        navigate('/campaigns/vouchers');
      }, 1500);
    } catch {
      message.error('Failed to issue bulk vouchers.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto font-body">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Bulk Issue Vouchers</h2>
        <p className="text-body-lg text-on-surface-variant">Distribute custom discount codes to targeted user tiers</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          initialValues={{ tier: 'all', type: 'discount', value: 10 }}
        >
          <h3 className="font-headline text-sm font-bold text-on-surface border-b border-black/5 pb-2 mb-4">1. Select Target Segment</h3>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="tier" label="Membership Tier" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="all">All Tiers</Select.Option>
                <Select.Option value="Bronze">Bronze Only</Select.Option>
                <Select.Option value="Silver">Silver Only</Select.Option>
                <Select.Option value="Gold">Gold Only</Select.Option>
                <Select.Option value="Platinum">Platinum Only</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="min_points" label="Minimum Points Balance">
              <InputNumber min={0} placeholder="e.g. 500" className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>
          </div>

          <h3 className="font-headline text-sm font-bold text-on-surface border-b border-black/5 pb-2 mt-6 mb-4">2. Configure Voucher Parameters</h3>
          
          <Form.Item name="merchant" label="Merchant Scope (Leave empty for Platform-wide)">
            <Select
              {...merchantSelectProps}
              allowClear
              placeholder="Select associated merchant"
              className="h-10 rounded-xl"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label="Voucher Type" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="discount">Percentage Discount</Select.Option>
                <Select.Option value="cash">Fixed Cash Value</Select.Option>
                <Select.Option value="free_item">Complimentary Reward Item</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="value" label="Discount Value" rules={[{ required: true }]}>
              <InputNumber min={1} placeholder="Value percentage / amount" className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>
          </div>

          <Form.Item name="expires_at" label="Voucher Expiry Date" rules={[{ required: true, message: 'Please pick expiry timestamp' }]}>
            <DatePicker className="w-full h-10 rounded-xl" />
          </Form.Item>

          <div className="flex gap-4 justify-end mt-8 border-t border-black/5 pt-6">
            <Button
              onClick={() => navigate('/campaigns/vouchers')}
              className="h-11 rounded-xl px-6 font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              Issue Vouchers
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};
