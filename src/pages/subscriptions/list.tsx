import React, { useState } from 'react';
import { useTable, useCreate, useDelete, useOne, useUpdate } from '@refinedev/core';
import { useSelect } from '@refinedev/antd';
import { Tag, message, Modal, Form, Select, Input, DatePicker, Button, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

export const SubscriptionList: React.FC = () => {
  const generatePbId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 15; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'pricing' | 'promo_codes'>('subscriptions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 1. Subscriptions Table
  const { tableQueryResult } = useTable<any>({
    resource: 'subscriptions',
    pagination: { pageSize: 10 },
    meta: {
      expand: ['merchant'],
    },
  });

  const { mutate: createSubscription, isLoading: isCreating } = useCreate();
  const { mutate: deleteSubscription } = useDelete();

  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
    optionLabel: 'name',
    optionValue: 'id',
  });

  const merchantOptions = (merchantSelectProps.options || []).map((opt: any) => ({
    ...opt,
    label: `${opt.label} (${opt.value})`,
  }));

  const subscriptions = tableQueryResult?.data?.data || [];

  const handleOpenCreateModal = () => {
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      plan: 'pro',
      current_period_end: dayjs().add(30, 'day'),
      cancel_at_period_end: false,
    });
    setIsModalOpen(true);
  };

  const handleCreateSubmit = (values: any) => {
    const formattedValues = {
      id: generatePbId(),
      ...values,
      current_period_end: values.current_period_end ? values.current_period_end.toISOString().replace('T', ' ').substring(0, 19) : null,
    };

    createSubscription({
      resource: 'subscriptions',
      values: formattedValues,
      successNotification: () => {
        message.success('Manual billing created successfully');
        setIsModalOpen(false);
        tableQueryResult.refetch();
        return {
          message: 'Billing Created',
          description: 'The manual billing has been successfully provisioned.',
          type: 'success',
        };
      },
      errorNotification: (err: any) => {
        message.error(err?.message || 'Failed to create subscription record.');
        return {
          message: 'Creation Failed',
          description: err?.message || 'Check inputs.',
          type: 'error',
        };
      }
    });
  };

  const handleDelete = (id: string, merchantName: string) => {
    Modal.confirm({
      title: 'Delete Subscription Billing',
      content: `Are you sure you want to delete the subscription billing for ${merchantName || 'this merchant'}?`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true, style: { border: 'none' } },
      onOk: () => {
        deleteSubscription({
          resource: 'subscriptions',
          id,
          successNotification: () => {
            message.success('Subscription deleted successfully');
            tableQueryResult.refetch();
            return {
              message: 'Subscription Deleted',
              description: 'The subscription record was removed.',
              type: 'success',
            };
          },
        });
      },
    });
  };

  // 2. Pricing Settings
  const { data: pricingData, isLoading: isLoadingPricing, refetch: refetchPricing } = useOne({
    resource: 'pricing_settings',
    id: 'pricesettings01',
  });

  const { mutate: updatePricing, isLoading: isUpdatingPricing } = useUpdate();
  const [pricingForm] = Form.useForm();

  React.useEffect(() => {
    if (pricingData?.data) {
      pricingForm.setFieldsValue({
        base_price_1m: pricingData.data.base_price_1m,
        discount_3m: pricingData.data.discount_3m,
        discount_6m: pricingData.data.discount_6m,
        discount_9m: pricingData.data.discount_9m,
        discount_12m: pricingData.data.discount_12m,
        enable_3m: pricingData.data.enable_3m !== false,
        enable_6m: pricingData.data.enable_6m !== false,
        enable_9m: pricingData.data.enable_9m !== false,
        enable_12m: pricingData.data.enable_12m !== false,
      });
    }
  }, [pricingData, pricingForm]);

  const handlePricingSubmit = (values: any) => {
    updatePricing({
      resource: 'pricing_settings',
      id: 'pricesettings01',
      values: {
        base_price_1m: Number(values.base_price_1m),
        discount_3m: Number(values.discount_3m),
        discount_6m: Number(values.discount_6m),
        discount_9m: Number(values.discount_9m),
        discount_12m: Number(values.discount_12m),
        enable_3m: !!values.enable_3m,
        enable_6m: !!values.enable_6m,
        enable_9m: !!values.enable_9m,
        enable_12m: !!values.enable_12m,
      },
      successNotification: () => {
        message.success('Pricing configurations updated successfully');
        refetchPricing();
        return {
          message: 'Pricing Updated',
          description: 'Custom pricing options saved.',
          type: 'success',
        };
      },
      errorNotification: (err: any) => {
        message.error(err?.message || 'Failed to update pricing settings.');
        return {
          message: 'Update Failed',
          description: err?.message,
          type: 'error',
        };
      }
    });
  };

  // 3. Promo Codes
  const { tableQueryResult: promoQuery } = useTable<any>({
    resource: 'subscription_promo_codes',
    pagination: { pageSize: 100 },
  });
  const promoCodes = promoQuery?.data?.data || [];

  const { mutate: createPromo, isLoading: isCreatingPromo } = useCreate();
  const { mutate: deletePromo } = useDelete();
  const [promoForm] = Form.useForm();
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const handleOpenPromoModal = () => {
    promoForm.resetFields();
    promoForm.setFieldsValue({
      is_active: true,
      discount_type: 'percentage',
    });
    setIsPromoModalOpen(true);
  };

  const handlePromoSubmit = (values: any) => {
    createPromo({
      resource: 'subscription_promo_codes',
      values: {
        id: generatePbId(),
        code: values.code.trim().toUpperCase(),
        discount_type: values.discount_type,
        discount_value: Number(values.discount_value),
        is_active: values.is_active === 'true' || values.is_active === true,
      },
      successNotification: () => {
        message.success('Promo code created successfully');
        setIsPromoModalOpen(false);
        promoQuery.refetch();
        return {
          message: 'Promo Created',
          description: 'New promo voucher added.',
          type: 'success',
        };
      },
      errorNotification: (err: any) => {
        message.error(err?.message || 'Failed to create promo code.');
        return {
          message: 'Creation Failed',
          description: err?.message,
          type: 'error',
        };
      }
    });
  };

  const handleDeletePromo = (id: string, code: string) => {
    Modal.confirm({
      title: 'Delete Promo Code',
      content: `Are you sure you want to delete promo code ${code}?`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true, style: { border: 'none' } },
      onOk: () => {
        deletePromo({
          resource: 'subscription_promo_codes',
          id,
          successNotification: () => {
            message.success('Promo code deleted');
            promoQuery.refetch();
            return {
              message: 'Promo Deleted',
              description: 'The promo code was deleted.',
              type: 'success',
            };
          },
        });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Billing & Subscriptions</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Manage manual and automated merchant subscriptions</p>
        </div>
        {activeTab === 'subscriptions' && (
          <button
            onClick={handleOpenCreateModal}
            className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all border-none flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: '#0040e0' }}
          >
            <PlusOutlined /> Create Billing
          </button>
        )}
        {activeTab === 'promo_codes' && (
          <button
            onClick={handleOpenPromoModal}
            className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all border-none flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: '#0040e0' }}
          >
            <PlusOutlined /> Create Promo Code
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-black/5 pb-2">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer ${
            activeTab === 'subscriptions'
              ? 'bg-primary text-white'
              : 'bg-black/5 text-on-surface-variant hover:bg-black/10'
          }`}
          style={activeTab === 'subscriptions' ? { backgroundColor: '#0040e0' } : {}}
        >
          Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer ${
            activeTab === 'pricing'
              ? 'bg-primary text-white'
              : 'bg-black/5 text-on-surface-variant hover:bg-black/10'
          }`}
          style={activeTab === 'pricing' ? { backgroundColor: '#0040e0' } : {}}
        >
          Pricing Settings
        </button>
        <button
          onClick={() => setActiveTab('promo_codes')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer ${
            activeTab === 'promo_codes'
              ? 'bg-primary text-white'
              : 'bg-black/5 text-on-surface-variant hover:bg-black/10'
          }`}
          style={activeTab === 'promo_codes' ? { backgroundColor: '#0040e0' } : {}}
        >
          Promo Codes
        </button>
      </div>

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
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
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Plan</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Payment Reference</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Customer Email</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Expiry Date</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-body">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-on-surface-variant text-sm">
                        No active or past subscriptions found.
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub.id} className="group hover:bg-white/40 transition-colors">
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {(sub.expand?.merchant?.name || 'M').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-headline text-sm font-semibold text-on-surface">
                                {sub.expand?.merchant ? (
                                  <Link
                                    to={`/merchants/${sub.merchant}`}
                                    className="text-primary hover:underline"
                                    style={{ color: '#0040e0' }}
                                  >
                                    {sub.expand.merchant.name}
                                  </Link>
                                ) : (
                                  sub.merchant || 'Unknown Merchant'
                                )}
                              </p>
                              <p className="text-[10px] text-on-surface-variant">ID: {sub.merchant}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-sm text-on-surface">
                          <span className="capitalize font-semibold">{sub.plan || 'pro'}</span>
                        </td>
                        <td className="py-5">
                          {sub.status === 'active' && (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                          )}
                          {sub.status === 'trialing' && (
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">Trialing</span>
                          )}
                          {sub.status === 'canceled' && (
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Canceled</span>
                          )}
                          {sub.status === 'past_due' && (
                            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">Past Due</span>
                          )}
                          {sub.status === 'unpaid' && (
                            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">Unpaid</span>
                          )}
                        </td>
                        <td className="py-5 text-sm text-on-surface">
                          <span className="font-mono text-xs">{sub.chipin_payment_id || 'Manual Admin Billing'}</span>
                        </td>
                        <td className="py-5 text-sm text-on-surface-variant">
                          {sub.chipin_customer_email || 'N/A'}
                        </td>
                        <td className="py-5 text-sm text-on-surface-variant">
                          {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-5 text-right">
                          <button
                            onClick={() => handleDelete(sub.id, sub.expand?.merchant?.name)}
                            className="text-error hover:text-red-700 font-bold text-xs hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1 ml-auto"
                            style={{ color: '#ef4444' }}
                          >
                            <DeleteOutlined /> Delete
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
      )}

      {/* Pricing Settings Tab */}
      {activeTab === 'pricing' && (
        <div className="glass-panel rounded-[2rem] p-gutter max-w-xl">
          <h3 className="font-headline text-lg font-bold text-on-surface mb-6">Pro Plan Pricing Model</h3>
          {isLoadingPricing ? (
            <div className="py-10 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Form
              form={pricingForm}
              layout="vertical"
              onFinish={handlePricingSubmit}
              requiredMark={false}
            >
              <Form.Item
                name="base_price_1m"
                label={<span className="font-headline text-xs font-semibold text-outline">Base Monthly Price (RM)</span>}
                rules={[{ required: true, message: 'Please enter base monthly price' }]}
              >
                <Input type="number" placeholder="119" className="rounded-xl h-10 border-black/10" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="border border-black/5 p-4 rounded-2xl bg-black/[0.01]">
                  <Form.Item
                    name="enable_3m"
                    valuePropName="checked"
                    className="mb-2"
                  >
                    <Checkbox><span className="font-headline text-sm font-bold text-on-surface">Enable 3 Months</span></Checkbox>
                  </Form.Item>
                  <Form.Item
                    name="discount_3m"
                    label={<span className="font-headline text-xs font-semibold text-outline">Discount (%)</span>}
                    rules={[{ required: true, message: 'Required' }]}
                    className="mb-0"
                  >
                    <Input type="number" placeholder="5" className="rounded-xl h-10 border-black/10" />
                  </Form.Item>
                </div>

                <div className="border border-black/5 p-4 rounded-2xl bg-black/[0.01]">
                  <Form.Item
                    name="enable_6m"
                    valuePropName="checked"
                    className="mb-2"
                  >
                    <Checkbox><span className="font-headline text-sm font-bold text-on-surface">Enable 6 Months</span></Checkbox>
                  </Form.Item>
                  <Form.Item
                    name="discount_6m"
                    label={<span className="font-headline text-xs font-semibold text-outline">Discount (%)</span>}
                    rules={[{ required: true, message: 'Required' }]}
                    className="mb-0"
                  >
                    <Input type="number" placeholder="10" className="rounded-xl h-10 border-black/10" />
                  </Form.Item>
                </div>

                <div className="border border-black/5 p-4 rounded-2xl bg-black/[0.01]">
                  <Form.Item
                    name="enable_9m"
                    valuePropName="checked"
                    className="mb-2"
                  >
                    <Checkbox><span className="font-headline text-sm font-bold text-on-surface">Enable 9 Months</span></Checkbox>
                  </Form.Item>
                  <Form.Item
                    name="discount_9m"
                    label={<span className="font-headline text-xs font-semibold text-outline">Discount (%)</span>}
                    rules={[{ required: true, message: 'Required' }]}
                    className="mb-0"
                  >
                    <Input type="number" placeholder="12" className="rounded-xl h-10 border-black/10" />
                  </Form.Item>
                </div>

                <div className="border border-black/5 p-4 rounded-2xl bg-black/[0.01]">
                  <Form.Item
                    name="enable_12m"
                    valuePropName="checked"
                    className="mb-2"
                  >
                    <Checkbox><span className="font-headline text-sm font-bold text-on-surface">Enable 12 Months</span></Checkbox>
                  </Form.Item>
                  <Form.Item
                    name="discount_12m"
                    label={<span className="font-headline text-xs font-semibold text-outline">Discount (%)</span>}
                    rules={[{ required: true, message: 'Required' }]}
                    className="mb-0"
                  >
                    <Input type="number" placeholder="15" className="rounded-xl h-10 border-black/10" />
                  </Form.Item>
                </div>
              </div>

              <Form.Item className="mb-0 mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isUpdatingPricing}
                  className="rounded-xl h-10 w-full font-bold border-none"
                  style={{ backgroundColor: '#0040e0' }}
                >
                  Save Plan Configurations
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      )}

      {/* Promo Codes Tab */}
      {activeTab === 'promo_codes' && (
        <div className="glass-panel rounded-[2rem] p-gutter overflow-hidden flex flex-col">
          {promoQuery.isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Promo Code</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Discount Type</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Discount Value</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-body">
                  {promoCodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-on-surface-variant text-sm">
                        No active subscription promo codes found.
                      </td>
                    </tr>
                  ) : (
                    promoCodes.map((code) => (
                      <tr key={code.id} className="group hover:bg-white/40 transition-colors">
                        <td className="py-5">
                          <span className="font-mono text-sm font-bold bg-primary/5 text-primary px-3 py-1.5 rounded-lg border border-primary/10">
                            {code.code}
                          </span>
                        </td>
                        <td className="py-5 text-sm text-on-surface capitalize font-semibold">
                          {code.discount_type}
                        </td>
                        <td className="py-5 text-sm text-on-surface">
                          {code.discount_type === 'percentage' ? `${code.discount_value}%` : `RM ${Number(code.discount_value).toFixed(2)}`}
                        </td>
                        <td className="py-5">
                          {code.is_active ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Inactive</span>
                          )}
                        </td>
                        <td className="py-5 text-right">
                          <button
                            onClick={() => handleDeletePromo(code.id, code.code)}
                            className="bg-transparent hover:bg-red-50 text-red-600 p-2 rounded-lg transition-colors border-none cursor-pointer"
                            style={{ color: '#ef4444' }}
                          >
                            <DeleteOutlined style={{ fontSize: 16 }} />
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
      )}

      {/* Create Manual Billing Modal */}
      <Modal
        title="Create Manual Billing Record"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubmit}
          className="pt-4"
        >
          <Form.Item
            name="merchant"
            label="Select Store / Merchant"
            rules={[{ required: true, message: 'Please select a merchant' }]}
          >
            <Select
              placeholder="Search or select merchant by Name or ID"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={merchantOptions}
              loading={merchantSelectProps.loading}
            />
          </Form.Item>

          <Form.Item
            name="plan"
            label="Subscription Plan"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="pro">Pro Plan (RM79/mo)</Select.Option>
              <Select.Option value="starter">Starter Plan</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Billing Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="trialing">Trialing</Select.Option>
              <Select.Option value="past_due">Past Due</Select.Option>
              <Select.Option value="unpaid">Unpaid</Select.Option>
              <Select.Option value="canceled">Canceled</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="chipin_payment_id"
            label="Payment Reference ID"
            rules={[{ required: true, message: 'Please specify payment reference' }]}
          >
            <Input placeholder="e.g. manual_receipt_2026_07" />
          </Form.Item>

          <Form.Item
            name="chipin_customer_email"
            label="Billing Email Address"
          >
            <Input placeholder="e.g. billing@coffeeshop.com" />
          </Form.Item>

          <Form.Item
            name="current_period_end"
            label="Subscription Expiry Date"
            rules={[{ required: true, message: 'Select subscription period end' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating}
              style={{ backgroundColor: '#0040e0', borderColor: '#0040e0' }}
            >
              Provision Subscription
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Create Promo Code Modal */}
      <Modal
        title="Create Subscription Promo Code"
        open={isPromoModalOpen}
        onCancel={() => setIsPromoModalOpen(false)}
        footer={null}
        destroyOnHidden
        centered
      >
        <Form
          form={promoForm}
          layout="vertical"
          onFinish={handlePromoSubmit}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="code"
            label="Promo Code String"
            rules={[{ required: true, message: 'Please enter code' }]}
          >
            <Input placeholder="e.g. RISEV20" className="rounded-xl h-10 border-black/10 uppercase" />
          </Form.Item>

          <Form.Item
            name="discount_type"
            label="Discount Type"
            rules={[{ required: true }]}
          >
            <Select className="rounded-xl h-10 border-black/10">
              <Select.Option value="percentage">Percentage (%)</Select.Option>
              <Select.Option value="fixed">Fixed RM Discount (RM)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discount_value"
            label="Discount Value"
            rules={[{ required: true, message: 'Please enter value' }]}
          >
            <Input type="number" placeholder="10" className="rounded-xl h-10 border-black/10" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select className="rounded-xl h-10 border-black/10">
              <Select.Option value="true">Active</Select.Option>
              <Select.Option value="false">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 mt-8 flex justify-end gap-2">
            <Button onClick={() => setIsPromoModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreatingPromo}
              className="rounded-xl font-bold"
              style={{ backgroundColor: '#0040e0', borderColor: '#0040e0' }}
            >
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
