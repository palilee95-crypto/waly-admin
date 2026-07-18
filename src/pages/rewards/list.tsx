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
    pagination: { pageSize: 10 },
    meta: {
      expand: ['merchant'],
    },
  });

  const rewards = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-6 font-body">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Rewards Catalog</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Configure catalog items and point cost values</p>
        </div>
        <button
          onClick={() => navigate('/rewards/create')}
          className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl font-headline font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Reward Item
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
                  <th className="pb-4 font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Reward Name</th>
                  <th className="pb-4 font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Merchant</th>
                  <th className="pb-4 font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Type</th>
                  <th className="pb-4 font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Points Cost</th>
                  <th className="pb-4 font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Stock</th>
                  <th className="pb-4 font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Status</th>
                  <th className="pb-4 font-headline text-[10px] text-on-surface-variant uppercase tracking-wider font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {rewards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-on-surface-variant text-sm">
                      No rewards found in the catalog.
                    </td>
                  </tr>
                ) : (
                  rewards.map((reward) => (
                    <tr key={reward.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-semibold text-on-surface text-sm">{reward.name}</td>
                      <td className="py-5 text-sm text-on-surface font-semibold">
                        {reward.expand?.merchant ? (
                          <Link
                            to={`/merchants/${reward.merchant}`}
                            className="text-primary hover:underline"
                            style={{ color: '#0040e0' }}
                          >
                            {reward.expand.merchant.name}
                          </Link>
                        ) : (
                          reward.merchant || 'Platform-wide'
                        )}
                      </td>
                      <td className="py-5 text-sm text-on-surface uppercase">{reward.type}</td>
                      <td className="py-5 text-sm text-primary font-bold">{reward.points_cost} pts</td>
                      <td className="py-5 text-sm text-on-surface-variant">{reward.stock ?? 'Unlimited'}</td>
                      <td className="py-5">
                        {reward.is_active ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Retired</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/rewards/show/${reward.id}`)}
                            className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Show
                          </button>
                          <button
                            onClick={() => navigate(`/rewards/edit/${reward.id}`)}
                            className="text-on-surface-variant hover:text-on-surface font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
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
