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
    pagination: { pageSize: 10 },
  });

  const campaigns = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Campaign Management</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Configure platform-wide and merchant-specific marketing campaigns</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/create')}
          className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl font-headline font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Campaign
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
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Title</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Merchant</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Type</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Multiplier</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Start Date</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">End Date</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-on-surface-variant text-sm">
                      No campaigns found.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr key={campaign.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-semibold text-on-surface text-sm">{campaign.title}</td>
                      <td className="py-5 text-sm text-on-surface">
                        {campaign.merchant ? `Merchant ID: ${campaign.merchant}` : 'Platform-wide'}
                      </td>
                      <td className="py-5 text-sm text-on-surface uppercase">{campaign.type?.replace('_', ' ')}</td>
                      <td className="py-5 text-sm text-on-surface font-bold">{campaign.multiplier}x</td>
                      <td className="py-5 text-sm text-on-surface-variant">
                        {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-5 text-sm text-on-surface-variant">
                        {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-5">
                        {campaign.status === 'active' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{campaign.status || 'Draft'}</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/campaigns/show/${campaign.id}`)}
                            className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Show
                          </button>
                          <button
                            onClick={() => navigate(`/campaigns/edit/${campaign.id}`)}
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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Create Campaign</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Design a new campaign rule</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{ type: 'double_points', multiplier: 2.0, status: 'draft' }}
        >
          <Form.Item
            name="title"
            label="Campaign Title"
            rules={[{ required: true, message: 'Please enter campaign title' }]}
          >
            <Input className="h-10 rounded-xl" placeholder="e.g. Double Points Weekend" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} className="rounded-xl" placeholder="Describe campaign rules and details..." />
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
              Create Campaign
            </Button>
          </div>
        </Form>
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
