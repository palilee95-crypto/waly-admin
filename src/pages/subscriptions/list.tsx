import React, { useState } from 'react';
import { useTable, useCreate, useDelete, useOne, useUpdate } from '@refinedev/core';
import { useSelect } from '@refinedev/antd';
import { Tag, message, Modal, Form, Select, Input, DatePicker, Button, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { pb } from '../../lib/pocketbase';

export const SubscriptionList: React.FC = () => {
  const generatePbId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 15; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'free_trials' | 'pricing' | 'promo_codes'>('subscriptions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const getDaysRemaining = (expiryDateStr: string) => {
    if (!expiryDateStr) return { label: 'No Expiry', isExpired: false, days: 999 };
    const expiry = dayjs(expiryDateStr);
    const now = dayjs();
    const diffDays = expiry.diff(now, 'day');
    const diffHours = expiry.diff(now, 'hour');

    if (diffHours < 0) {
      const absDays = Math.abs(diffDays);
      return { label: `Expired (${absDays === 0 ? 'today' : `${absDays}d ago`})`, isExpired: true, days: diffDays };
    } else if (diffDays === 0) {
      return { label: `Expires today (${diffHours}h left)`, isExpired: false, days: 0 };
    } else {
      return { label: `${diffDays} days left`, isExpired: false, days: diffDays };
    }
  };

  // Grant Free Trial State
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [trialMerchantId, setTrialMerchantId] = useState<string>('');
  const [trialPreset, setTrialPreset] = useState<'7' | '14' | '30' | '60' | 'custom'>('7');
  const [trialCustomDays, setTrialCustomDays] = useState<number>(7);

  const getCalculatedDays = () => {
    if (trialPreset === 'custom') {
      return trialCustomDays > 0 ? trialCustomDays : 7;
    }
    return parseInt(trialPreset, 10) || 7;
  };

  const handleOpenTrialModal = (merchantId?: string) => {
    setTrialMerchantId(merchantId || '');
    setTrialPreset('7');
    setTrialCustomDays(7);
    setIsTrialModalOpen(true);
  };

  const handleTrialSubmit = () => {
    if (!trialMerchantId) {
      message.error('Please select a merchant');
      return;
    }
    const days = getCalculatedDays();
    const expiryDate = dayjs().add(days, 'day');
    const expiryStr = expiryDate.toISOString().replace('T', ' ').substring(0, 19);

    const existingSub = subscriptions.find((s: any) => s.merchant === trialMerchantId);

    if (existingSub) {
      updateSubscription({
        resource: 'subscriptions',
        id: existingSub.id,
        values: {
          plan: 'pro',
          status: 'trialing',
          current_period_end: expiryStr,
          chipin_payment_id: `free_trial_admin_${Date.now()}`,
        },
        successNotification: () => {
          message.success(`Updated trial subscription (${days} days) successfully!`);
          setIsTrialModalOpen(false);
          tableQueryResult.refetch();
          return {
            message: 'Trial Updated',
            description: `Merchant trial access updated until ${expiryDate.format('MMM D, YYYY')}.`,
            type: 'success',
          };
        },
        errorNotification: (err: any) => {
          message.error(err?.message || 'Failed to update trial subscription.');
          return { message: 'Update Failed', description: err?.message, type: 'error' };
        }
      });
    } else {
      createSubscription({
        resource: 'subscriptions',
        values: {
          id: generatePbId(),
          merchant: trialMerchantId,
          plan: 'pro',
          status: 'trialing',
          current_period_end: expiryStr,
          chipin_payment_id: `free_trial_admin_${Date.now()}`,
          chipin_customer_email: 'free_trial@admin',
        },
        successNotification: () => {
          message.success(`Granted ${days} days free trial successfully!`);
          setIsTrialModalOpen(false);
          tableQueryResult.refetch();
          return {
            message: 'Free Trial Granted',
            description: `Merchant now has trial access until ${expiryDate.format('MMM D, YYYY')}.`,
            type: 'success',
          };
        },
        errorNotification: (err: any) => {
          message.error(err?.message || 'Failed to grant free trial.');
          return { message: 'Grant Failed', description: err?.message, type: 'error' };
        }
      });
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const merchantId = params.get('grantTrialFor');
    if (merchantId) {
      handleOpenTrialModal(merchantId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 1. Subscriptions Table
  const { tableQueryResult } = useTable<any>({
    resource: 'subscriptions',
    pagination: { pageSize: 100 },
    meta: {
      expand: ['merchant'],
    },
  });

  const { mutate: createSubscription, isLoading: isCreating } = useCreate();
  const { mutate: updateSubscription, isLoading: isUpdating } = useUpdate();
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
    const formattedEnd = values.current_period_end ? values.current_period_end.toISOString().replace('T', ' ').substring(0, 19) : null;
    const existingSub = subscriptions.find((s: any) => s.merchant === values.merchant);

    if (existingSub) {
      updateSubscription({
        resource: 'subscriptions',
        id: existingSub.id,
        values: {
          ...values,
          current_period_end: formattedEnd,
        },
        successNotification: () => {
          message.success('Subscription billing updated successfully');
          setIsModalOpen(false);
          tableQueryResult.refetch();
          return {
            message: 'Billing Updated',
            description: 'Existing subscription record updated.',
            type: 'success',
          };
        },
        errorNotification: (err: any) => {
          message.error(err?.message || 'Failed to update billing record.');
          return { message: 'Update Failed', description: err?.message, type: 'error' };
        }
      });
    } else {
      createSubscription({
        resource: 'subscriptions',
        values: {
          id: generatePbId(),
          ...values,
          current_period_end: formattedEnd,
        },
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
          return { message: 'Creation Failed', description: err?.message, type: 'error' };
        }
      });
    }
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

  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [isSavingNfcPricing, setIsSavingNfcPricing] = useState(false);

  const handlePricingSubmit = async (values: any) => {
    setIsSavingPricing(true);
    try {
      await pb.send('/api/risev/admin/pricing-settings', {
        method: 'POST',
        body: {
          id: 'pricesettings01',
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
      });
      message.success('Pro Plan pricing updated successfully');
      refetchPricing();
    } catch (err: any) {
      console.error('Pro plan pricing update error:', err);
      message.error(err?.message || 'Failed to update pricing settings.');
    } finally {
      setIsSavingPricing(false);
    }
  };

  // 2.2 NFC Stand Hardware Pricing Settings (pricesettings02)
  const { data: nfcPricingData, isLoading: isLoadingNfcPricing, refetch: refetchNfcPricing } = useOne({
    resource: 'pricing_settings',
    id: 'pricesettings02',
  });
  const [nfcPricingForm] = Form.useForm();

  React.useEffect(() => {
    if (nfcPricingData?.data) {
      nfcPricingForm.setFieldsValue({
        single_price: nfcPricingData.data.base_price_1m ?? 119,
        duo_price: nfcPricingData.data.discount_3m ?? 198,
        enterprise_price: nfcPricingData.data.discount_6m ?? 469,
      });
    }
  }, [nfcPricingData, nfcPricingForm]);

  const handleNfcPricingSubmit = async (values: any) => {
    setIsSavingNfcPricing(true);
    try {
      await pb.send('/api/risev/admin/pricing-settings', {
        method: 'POST',
        body: {
          id: 'pricesettings02',
          base_price_1m: Number(values.single_price),
          discount_3m: Number(values.duo_price),
          discount_6m: Number(values.enterprise_price),
          discount_9m: 12,
          discount_12m: 15,
          enable_3m: true,
          enable_6m: true,
          enable_9m: false,
          enable_12m: false,
        },
      });
      message.success('NFC Stand pricing updated successfully');
      refetchNfcPricing();
    } catch (err: any) {
      console.error('NFC Pricing update error:', err);
      message.error(err?.message || 'Failed to update NFC pricing.');
    } finally {
      setIsSavingNfcPricing(false);
    }
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
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            SUBSCRIPTION & BILLING CONTROL
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Billing & Subscriptions
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-5 font-medium leading-relaxed">
            Grant trial passes, configure pricing tiers, manage promo vouchers, and view merchant billing.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenTrialModal()}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-4 py-2.5 rounded-full transition-all shadow-md border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">card_giftcard</span>
              <span>+ Grant Free Trial</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 bg-[#6bfe9c] text-[#002d1e] font-black text-xs px-4 py-2.5 rounded-full hover:scale-105 transition-all shadow-md border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>+ Create Billing</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1100px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* Filter Tabs Bar */}
            <div 
              className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-surface-variant dark:border-white/10"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer ${
                  activeTab === 'subscriptions'
                    ? 'bg-[#006d37] text-white border-[#006d37] shadow-md'
                    : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                }`}
              >
                All Subscriptions ({subscriptions.length})
              </button>

              <button
                onClick={() => setActiveTab('free_trials')}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'free_trials'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                    : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                }`}
              >
                <span>🎁 Free Trials</span>
                {subscriptions.filter(s => s.status === 'trialing' || s.chipin_payment_id?.startsWith('free_trial_admin_')).length > 0 && (
                  <span className="bg-white/25 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {subscriptions.filter(s => s.status === 'trialing' || s.chipin_payment_id?.startsWith('free_trial_admin_')).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer ${
                  activeTab === 'pricing'
                    ? 'bg-[#006d37] text-white border-[#006d37] shadow-md'
                    : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                }`}
              >
                Pricing Settings
              </button>

              <button
                onClick={() => setActiveTab('promo_codes')}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer ${
                  activeTab === 'promo_codes'
                    ? 'bg-[#006d37] text-white border-[#006d37] shadow-md'
                    : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                }`}
              >
                Promo Codes
              </button>
            </div>

            {/* Subscriptions Tab View */}
            {activeTab === 'subscriptions' && (
              <div>
                {tableQueryResult.isLoading ? (
                  <div className="py-20 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div className="py-14 text-center text-on-surface-variant dark:text-[#85af9b]">
                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">credit_card</span>
                    <p className="text-xs font-bold text-on-surface dark:text-white">No active or past merchant subscriptions found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                    {subscriptions.map((sub) => {
                      const expiryInfo = getDaysRemaining(sub.current_period_end);
                      return (
                        <div
                          key={sub.id}
                          className="bg-[#f8faf9] dark:bg-[#001f15] rounded-2xl p-4 border border-surface-variant dark:border-[#004d30] flex flex-col justify-between shadow-sm hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#006d37]/10 text-[#006d37] dark:bg-[#6bfe9c]/15 dark:text-[#6bfe9c] flex items-center justify-center font-black text-sm shrink-0 border border-[#006d37]/15">
                                  {(sub.expand?.merchant?.name || 'M').substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-left">
                                  <h4 className="text-xs sm:text-sm font-black text-on-surface dark:text-white mb-0.5 group-hover:text-[#006d37] dark:group-hover:text-[#6bfe9c] transition-colors leading-tight">
                                    {sub.expand?.merchant?.name || `Merchant ID: ${sub.merchant}`}
                                  </h4>
                                  <span className="text-[10px] font-bold text-on-surface-variant dark:text-[#85af9b] uppercase">
                                    Plan: {sub.plan || 'Pro'}
                                  </span>
                                </div>
                              </div>

                              {/* Status Pill */}
                              <div>
                                {sub.status === 'active' && (
                                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border border-[#6bfe9c]/30">
                                    ACTIVE
                                  </span>
                                )}
                                {sub.status === 'trialing' && (
                                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                    TRIALING
                                  </span>
                                )}
                                {sub.status === 'canceled' && (
                                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                                    CANCELED
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Details Row */}
                            <div className="bg-white dark:bg-[#002518] p-2.5 rounded-xl border border-surface-variant dark:border-[#004d30] flex items-center justify-between text-[11px] mb-3">
                              <span className="text-slate-500 font-mono text-[10px] truncate max-w-[150px]">
                                Ref: {sub.chipin_payment_id || 'manual'}
                              </span>
                              <span className={`font-bold ${expiryInfo.isExpired ? 'text-red-500' : 'text-[#006d37] dark:text-[#6bfe9c]'}`}>
                                {expiryInfo.label}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-variant dark:border-white/10">
                            <button
                              onClick={() => {
                                handleOpenTrialModal(sub.merchant);
                              }}
                              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-amber-500/20 cursor-pointer"
                            >
                              Extend Trial
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {/* Free Trials Tab View */}
      {activeTab === 'free_trials' && (
        <div className="glass-panel rounded-[2rem] p-gutter overflow-hidden flex flex-col">
          {tableQueryResult.isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Merchant</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Plan</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Time Remaining</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Trial Expiry Date</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Trial Ref</th>
                    <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-body">
                  {subscriptions.filter(s => s.status === 'trialing' || s.chipin_payment_id?.startsWith('free_trial_admin_')).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-on-surface-variant text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">🎁</span>
                          <p className="font-headline font-bold text-on-surface">No Free Trials Provisioned</p>
                          <p className="text-xs text-on-surface-variant max-w-sm">Click "Grant Free Trial" above to grant a merchant 7, 14, 30, 60 or custom trial days.</p>
                          <button
                            onClick={() => handleOpenTrialModal()}
                            className="mt-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all border-none cursor-pointer"
                            style={{ backgroundColor: '#f59e0b' }}
                          >
                            + Grant First Free Trial
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    subscriptions.filter(s => s.status === 'trialing' || s.chipin_payment_id?.startsWith('free_trial_admin_')).map((sub) => {
                      const rem = getDaysRemaining(sub.current_period_end);
                      return (
                        <tr key={sub.id} className="group hover:bg-white/40 transition-colors">
                          <td className="py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
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
                            <span className="capitalize font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 text-xs">
                              Pro (Free Trial)
                            </span>
                          </td>
                          <td className="py-5">
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                              Trialing
                            </span>
                          </td>
                          <td className="py-5">
                            {rem.isExpired ? (
                              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                                {rem.label}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {rem.label}
                              </span>
                            )}
                          </td>
                          <td className="py-5 text-sm font-semibold text-on-surface">
                            {sub.current_period_end ? dayjs(sub.current_period_end).format('MMM D, YYYY (hh:mm A)') : 'N/A'}
                          </td>
                          <td className="py-5 text-xs text-on-surface-variant font-mono">
                            {sub.chipin_payment_id || 'free_trial_admin'}
                          </td>
                          <td className="py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenTrialModal(sub.merchant)}
                                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold text-xs px-2.5 py-1 rounded-lg transition-colors border border-amber-500/30 cursor-pointer"
                              >
                                Extend Trial
                              </button>
                              <button
                                onClick={() => handleDelete(sub.id, sub.expand?.merchant?.name)}
                                className="text-error hover:text-red-700 font-bold text-xs bg-transparent border-none cursor-pointer flex items-center gap-1"
                                style={{ color: '#ef4444' }}
                              >
                                <DeleteOutlined /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pricing Settings Tab */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Pro Plan Subscription Pricing */}
          <div className="glass-panel rounded-[2rem] p-gutter">
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
                  <Input type="number" placeholder="79" className="rounded-xl h-10 border-black/10" />
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
                    loading={isSavingPricing}
                    className="rounded-xl h-10 w-full font-bold border-none"
                    style={{ backgroundColor: '#0040e0' }}
                  >
                    Save Plan Configurations
                  </Button>
                </Form.Item>
              </Form>
            )}
          </div>

          {/* Card 2: NFC Stand Hardware Packages Pricing (pricesettings02) */}
          <div className="glass-panel rounded-[2rem] p-gutter">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">NFC Stand Hardware Pricing</h3>
                <p className="text-xs text-outline mt-1">Configures hardware prices on <code>/nfc-marketplace</code></p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">pricesettings02</span>
            </div>

            {isLoadingNfcPricing ? (
              <div className="py-10 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <Form
                form={nfcPricingForm}
                layout="vertical"
                onFinish={handleNfcPricingSubmit}
                requiredMark={false}
              >
                <div className="space-y-4">
                  <div className="border border-black/5 p-4 rounded-2xl bg-black/[0.01]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-headline text-sm font-bold text-on-surface">1x Stand + 500 Customers</span>
                      <span className="text-xs font-semibold text-outline">Single Branch</span>
                    </div>
                    <Form.Item
                      name="single_price"
                      label={<span className="font-headline text-xs font-semibold text-outline">Price (RM)</span>}
                      rules={[{ required: true, message: 'Price is required' }]}
                      className="mb-0"
                    >
                      <Input type="number" placeholder="119" className="rounded-xl h-10 border-black/10 font-bold" />
                    </Form.Item>
                  </div>

                  <div className="border border-black/5 p-4 rounded-2xl bg-black/[0.01]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-headline text-sm font-bold text-on-surface">2x Stand + 1,000 Customers</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">POPULAR DUO</span>
                    </div>
                    <Form.Item
                      name="duo_price"
                      label={<span className="font-headline text-xs font-semibold text-outline">Price (RM)</span>}
                      rules={[{ required: true, message: 'Price is required' }]}
                      className="mb-0"
                    >
                      <Input type="number" placeholder="198" className="rounded-xl h-10 border-black/10 font-bold" />
                    </Form.Item>
                  </div>

                  <div className="border border-black/5 p-4 rounded-2xl bg-black/[0.01]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-headline text-sm font-bold text-on-surface">5x Stand + 5,000 Customers</span>
                      <span className="text-xs font-semibold text-outline">Franchise Bundle</span>
                    </div>
                    <Form.Item
                      name="enterprise_price"
                      label={<span className="font-headline text-xs font-semibold text-outline">Price (RM)</span>}
                      rules={[{ required: true, message: 'Price is required' }]}
                      className="mb-0"
                    >
                      <Input type="number" placeholder="469" className="rounded-xl h-10 border-black/10 font-bold" />
                    </Form.Item>
                  </div>
                </div>

                <Form.Item className="mb-0 mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSavingNfcPricing}
                    className="rounded-xl h-10 w-full font-bold border-none"
                    style={{ backgroundColor: '#f59e0b', color: '#000' }}
                  >
                    Save NFC Stand Pricing
                  </Button>
                </Form.Item>
              </Form>
            )}
          </div>
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
                    )))}
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

      {/* Grant Free Trial Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pt-1">
            <div className="w-8 h-8 rounded-xl bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center font-black text-sm shrink-0">
              🎁
            </div>
            <div>
              <h3 className="font-black text-base text-on-surface dark:text-white mb-0 leading-tight">
                Grant Merchant Free Trial
              </h3>
              <p className="text-[11px] text-on-surface-variant dark:text-[#85af9b] font-normal">
                Provision trial passes for new or existing merchants
              </p>
            </div>
          </div>
        }
        open={isTrialModalOpen}
        onCancel={() => setIsTrialModalOpen(false)}
        footer={null}
        destroyOnHidden
        centered
        width={480}
      >
        <div className="pt-2 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
              SELECT MERCHANT / STORE <span className="text-red-500">*</span>
            </label>
            <Select
              className="w-full h-11 rounded-2xl"
              placeholder="Search or select merchant by Name or ID"
              showSearch
              value={trialMerchantId || undefined}
              onChange={(val) => setTrialMerchantId(val)}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={merchantOptions}
              loading={merchantSelectProps.loading}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
              TRIAL DURATION (DAYS)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { label: '7 Days (Default)', value: '7' },
                { label: '14 Days', value: '14' },
                { label: '30 Days', value: '30' },
                { label: '60 Days', value: '60' },
                { label: 'Custom Days', value: 'custom' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTrialPreset(opt.value as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    trialPreset === opt.value
                      ? 'bg-[#006d37] text-white border-[#006d37] shadow-sm'
                      : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-700 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {trialPreset === 'custom' && (
              <div className="mt-2">
                <label className="text-xs text-on-surface-variant dark:text-[#85af9b] mb-1 block font-bold">
                  Enter Number of Custom Trial Days:
                </label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={trialCustomDays}
                  onChange={(e) => setTrialCustomDays(parseInt(e.target.value, 10) || 1)}
                  placeholder="e.g. 45"
                  className="rounded-xl h-10 border-slate-200 font-bold"
                />
              </div>
            )}
          </div>

          {/* Expiry Preview Box */}
          <div className="p-4 rounded-2xl bg-[#002d1e] text-white border border-[#004d30] flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6bfe9c]">TRIAL PROVISIONING SUMMARY</span>
              <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/20 text-[#6bfe9c] border border-[#6bfe9c]/30">
                PRO TRIALING
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#85af9b]">Duration:</span>
              <span className="font-black text-white">{getCalculatedDays()} Days</span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1 border-t border-white/10">
              <span className="text-[#85af9b]">Trial Expiry Date:</span>
              <span className="font-black text-[#6bfe9c]">
                {dayjs().add(getCalculatedDays(), 'day').format('MMMM D, YYYY (hh:mm A)')}
              </span>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-surface-variant dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsTrialModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-transparent text-slate-600 dark:text-[#85af9b] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTrialSubmit}
              disabled={isCreating}
              className="px-5 py-2 rounded-xl text-xs font-black bg-[#006d37] hover:bg-[#004d27] text-white border-none cursor-pointer transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <span>Grant Free Trial</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </Modal>

          </div>
        </div>
      </div>

    </div>
  );
};
