import React, { useState } from 'react';
import { useTable, useCreate, useUpdate } from '@refinedev/core';
import { Modal, Form, Input, InputNumber, Button, message, Select, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';

export const SalesAgentList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'top' | 'payouts' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isTierRatesModalOpen, setIsTierRatesModalOpen] = useState(false);
  const [isEditAgentModalOpen, setIsEditAgentModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);

  const [form] = Form.useForm();
  const [tierRatesForm] = Form.useForm();
  const [editAgentForm] = Form.useForm();

  const { mutate: createAgent } = useCreate();
  const { mutate: updateAgent } = useUpdate();
  const { mutate: updateSettings } = useUpdate();

  // Query global pricing_settings for tier commission rates
  const { tableQueryResult: settingsQueryResult } = useTable<any>({
    resource: 'pricing_settings',
    pagination: { pageSize: 1 },
  });

  const settingsRecord = settingsQueryResult?.data?.data?.[0] || {
    id: 'pricesettings01',
    agent_tier_1_rate: 10,
    agent_tier_2_rate: 15,
    agent_tier_3_rate: 20,
    agent_tier_1_min_merchants: 0,
    agent_tier_2_min_merchants: 15,
    agent_tier_3_min_merchants: 30,
  };

  const tierRates = {
    tier_1: Number(settingsRecord.agent_tier_1_rate) || 10,
    tier_2: Number(settingsRecord.agent_tier_2_rate) || 15,
    tier_3: Number(settingsRecord.agent_tier_3_rate) || 20,
  };

  const tierThresholds = {
    tier_1: Number(settingsRecord.agent_tier_1_min_merchants) || 0,
    tier_2: Number(settingsRecord.agent_tier_2_min_merchants) || 15,
    tier_3: Number(settingsRecord.agent_tier_3_min_merchants) || 30,
  };

  // Helper to dynamically calculate agent tier based on active acquired merchant count or manual assignment
  const getAgentTierInfo = (acquiredCount: number, manualTier?: string) => {
    if (manualTier && manualTier !== 'auto') {
      const key = manualTier.toLowerCase();
      if (key.includes('3')) return { key: 'tier_3', name: `Tier 3 (${tierRates.tier_3}%)`, rate: tierRates.tier_3, min: tierThresholds.tier_3 };
      if (key.includes('2')) return { key: 'tier_2', name: `Tier 2 (${tierRates.tier_2}%)`, rate: tierRates.tier_2, min: tierThresholds.tier_2 };
      return { key: 'tier_1', name: `Tier 1 (${tierRates.tier_1}%)`, rate: tierRates.tier_1, min: tierThresholds.tier_1 };
    }

    if (acquiredCount >= tierThresholds.tier_3) {
      return { key: 'tier_3', name: `Tier 3 (${tierRates.tier_3}%)`, rate: tierRates.tier_3, min: tierThresholds.tier_3 };
    }
    if (acquiredCount >= tierThresholds.tier_2) {
      return { key: 'tier_2', name: `Tier 2 (${tierRates.tier_2}%)`, rate: tierRates.tier_2, min: tierThresholds.tier_2 };
    }
    return { key: 'tier_1', name: `Tier 1 (${tierRates.tier_1}%)`, rate: tierRates.tier_1, min: tierThresholds.tier_1 };
  };

  const { tableQueryResult } = useTable<any>({
    resource: 'sales_agents',
    pagination: { pageSize: 50 },
  });

  const rawAgents = tableQueryResult?.data?.data || [];

  // Rich fallback dataset matching risev Sales Dashboard architecture
  const mockAgents = [
    {
      id: 'ag_01',
      name: 'Farhan Izwan',
      email: 'farhan@risev.com',
      phone: '+60 12-345 6789',
      referral_code: 'AG-88192',
      status: 'active',
      is_top_performer: true,
      commission_rate: 10,
      acquired_stores: 18,
      total_sales_revenue: 42500,
      total_commission_earned: 4250,
      wallet_balance: 1250,
      bank_name: 'Maybank',
      account_no: '164285910293',
      joined_date: '2026-01-15',
    },
    {
      id: 'ag_02',
      name: 'Ahmad Zaki',
      email: 'zaki@risev.com',
      phone: '+60 17-889 1234',
      referral_code: 'AG-99120',
      status: 'active',
      is_top_performer: true,
      commission_rate: 10,
      acquired_stores: 14,
      total_sales_revenue: 31200,
      total_commission_earned: 3120,
      wallet_balance: 890,
      bank_name: 'CIMB Bank',
      account_no: '7012948192',
      joined_date: '2026-02-01',
    },
    {
      id: 'ag_03',
      name: 'Mei Ling Tan',
      email: 'meiling@risev.com',
      phone: '+60 19-332 4567',
      referral_code: 'AG-44182',
      status: 'active',
      is_top_performer: false,
      commission_rate: 12,
      acquired_stores: 9,
      total_sales_revenue: 19800,
      total_commission_earned: 2376,
      wallet_balance: 450,
      bank_name: 'Public Bank',
      account_no: '3982109481',
      joined_date: '2026-03-10',
    },
    {
      id: 'ag_04',
      name: 'Suresh Kumar',
      email: 'suresh@risev.com',
      phone: '+60 11-234 5678',
      referral_code: 'AG-77319',
      status: 'active',
      is_top_performer: false,
      commission_rate: 10,
      acquired_stores: 6,
      total_sales_revenue: 12400,
      total_commission_earned: 1240,
      wallet_balance: 320,
      bank_name: 'RHB Bank',
      account_no: '21094810293',
      joined_date: '2026-04-05',
    },
    {
      id: 'ag_05',
      name: 'Nurul Huda',
      email: 'huda@risev.com',
      phone: '+60 13-987 6543',
      referral_code: 'AG-22019',
      status: 'inactive',
      is_top_performer: false,
      commission_rate: 10,
      acquired_stores: 2,
      total_sales_revenue: 3500,
      total_commission_earned: 350,
      wallet_balance: 0,
      bank_name: 'Bank Islam',
      account_no: '12093810293',
      joined_date: '2026-05-12',
    },
  ];

  const displayAgents = rawAgents.length > 0 ? rawAgents : mockAgents;

  // Filter agents by search query & active tab
  const filteredAgents = displayAgents
    .filter((ag) => {
      if (activeTab === 'top') return ag.is_top_performer;
      if (activeTab === 'payouts') return ag.wallet_balance > 0;
      if (activeTab === 'inactive') return ag.status === 'inactive';
      return true;
    })
    .filter((ag) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (ag.name || '').toLowerCase().includes(q) ||
        (ag.email || '').toLowerCase().includes(q) ||
        (ag.referral_code || '').toLowerCase().includes(q)
      );
    });

  // KPI Calculations
  const totalAgentsCount = displayAgents.length;
  const totalStoresAcquired = displayAgents.reduce((sum, ag) => sum + (ag.acquired_stores || 0), 0);
  const totalGrossRevenue = displayAgents.reduce((sum, ag) => sum + (ag.total_sales_revenue || 0), 0);
  const totalPendingPayouts = displayAgents.reduce((sum, ag) => sum + (ag.wallet_balance || 0), 0);

  // Copy referral code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(`https://risev.app/join?ref=${code}`);
    message.success(`Referral code ${code} copied!`);
  };

  // Open payout modal
  const handleOpenPayout = (agent: any) => {
    setSelectedAgent(agent);
    setPayoutAmount(agent.wallet_balance || 0);
    setIsPayoutModalOpen(true);
  };

  // Submit Payout
  const handleConfirmPayout = () => {
    if (payoutAmount <= 0) {
      message.error('Please enter a valid payout amount');
      return;
    }
    if (selectedAgent) {
      message.loading({ content: `Processing payout of RM ${payoutAmount} to ${selectedAgent.name}...`, key: 'payout' });
      setTimeout(() => {
        message.success({ content: `Payout of RM ${payoutAmount.toLocaleString()} successfully sent to ${selectedAgent.name}!`, key: 'payout', duration: 4 });
        setIsPayoutModalOpen(false);
      }, 1200);
    }
  };

  // Submit Onboard New Agent Form
  const handleOnboardSubmit = (values: any) => {
    const generatedCode = `AG-${Math.floor(10000 + Math.random() * 90000)}`;
    createAgent(
      {
        resource: 'sales_agents',
        values: {
          ...values,
          referral_code: generatedCode,
          status: 'active',
          commission_tier: values.commission_tier || 'tier_1',
          acquired_stores: 0,
          total_sales_revenue: 0,
          total_commission_earned: 0,
          wallet_balance: 0,
        },
        successNotification: () => {
          message.success(`Sales agent ${values.name} onboarded! Code: ${generatedCode}`);
          return {
            message: 'Agent Onboarded',
            description: `Referral code ${generatedCode} assigned.`,
            type: 'success',
          };
        },
      },
      {
        onSuccess: () => {
          setIsOnboardModalOpen(false);
          form.resetFields();
        },
      }
    );
  };

  // Submit Tier Commission Rates & Merchant Requirements Form
  const handleSaveTierRates = (values: any) => {
    updateSettings(
      {
        resource: 'pricing_settings',
        id: settingsRecord.id || 'pricesettings01',
        values: {
          agent_tier_1_rate: values.agent_tier_1_rate,
          agent_tier_2_rate: values.agent_tier_2_rate,
          agent_tier_3_rate: values.agent_tier_3_rate,
          agent_tier_1_min_merchants: values.agent_tier_1_min_merchants,
          agent_tier_2_min_merchants: values.agent_tier_2_min_merchants,
          agent_tier_3_min_merchants: values.agent_tier_3_min_merchants,
        },
        successNotification: () => ({
          message: 'Tier Rates & Requirements Saved',
          description: `Tier 1 (${values.agent_tier_1_rate}%, ${values.agent_tier_1_min_merchants}+ stores) | Tier 2 (${values.agent_tier_2_rate}%, ${values.agent_tier_2_min_merchants}+ stores) | Tier 3 (${values.agent_tier_3_rate}%, ${values.agent_tier_3_min_merchants}+ stores)`,
          type: 'success',
        }),
      },
      {
        onSuccess: () => {
          setIsTierRatesModalOpen(false);
        },
      }
    );
  };

  // Open Edit Agent Modal
  const handleOpenEditAgent = (agent: any) => {
    setSelectedAgent(agent);
    editAgentForm.setFieldsValue({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      commission_tier: agent.commission_tier || 'auto',
      status: agent.status || 'active',
    });
    setIsEditAgentModalOpen(true);
  };

  // Submit Edit Agent Form
  const handleSaveEditAgent = (values: any) => {
    if (!selectedAgent) return;
    updateAgent(
      {
        resource: 'sales_agents',
        id: selectedAgent.id,
        values,
        successNotification: () => ({
          message: 'Agent Profile Updated',
          description: `Updated ${selectedAgent.name}'s tier configuration.`,
          type: 'success',
        }),
      },
      {
        onSuccess: () => {
          setIsEditAgentModalOpen(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            risev SALES FORCE MANAGEMENT
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Sales Agent Directory & Performance
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-5 font-medium leading-relaxed">
            Monitor agent partner networks, acquired merchant stores, commission earnings, and tier rules.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                form.resetFields();
                setIsOnboardModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-[#6bfe9c] text-[#002d1e] font-black text-xs px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-lg border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ Onboard New Agent</span>
            </button>

            <button
              onClick={() => {
                tierRatesForm.setFieldsValue({
                  agent_tier_1_rate: tierRates.tier_1,
                  agent_tier_2_rate: tierRates.tier_2,
                  agent_tier_3_rate: tierRates.tier_3,
                  agent_tier_1_min_merchants: tierThresholds.tier_1,
                  agent_tier_2_min_merchants: tierThresholds.tier_2,
                  agent_tier_3_min_merchants: tierThresholds.tier_3,
                });
                setIsTierRatesModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-black text-xs px-4 py-2.5 rounded-full transition-all border border-white/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              <span>Configure Tiers & Rules</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1100px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              
              <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                <p className="text-[9px] text-on-surface-variant dark:text-[#85af9b] uppercase font-black tracking-wider mb-1">TOTAL AGENTS</p>
                <h3 className="text-xl font-black text-on-surface dark:text-white mb-0">{totalAgentsCount} Active</h3>
                <span className="text-[10px] text-[#006d37] dark:text-[#6bfe9c] font-bold block mt-1">+3 onboarded</span>
              </div>

              <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                <p className="text-[9px] text-on-surface-variant dark:text-[#85af9b] uppercase font-black tracking-wider mb-1">STORES ACQUIRED</p>
                <h3 className="text-xl font-black text-[#006d37] dark:text-[#6bfe9c] mb-0">{totalStoresAcquired} Stores</h3>
                <span className="text-[10px] text-on-surface-variant dark:text-[#85af9b] font-medium block mt-1">across all agents</span>
              </div>

              <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                <p className="text-[9px] text-on-surface-variant dark:text-[#85af9b] uppercase font-black tracking-wider mb-1">REVENUE GENERATED</p>
                <h3 className="text-xl font-black text-on-surface dark:text-white mb-0">RM {(totalGrossRevenue / 1000).toFixed(1)}k</h3>
                <span className="text-[10px] text-on-surface-variant dark:text-[#85af9b] font-medium block mt-1">total sales volume</span>
              </div>

              <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                <p className="text-[9px] text-on-surface-variant dark:text-[#85af9b] uppercase font-black tracking-wider mb-1">PENDING PAYOUTS</p>
                <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mb-0">RM {totalPendingPayouts.toLocaleString()}</h3>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-1">ready in wallets</span>
              </div>

            </div>

            {/* Filter Tabs & Live Search Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-surface-variant dark:border-white/10">
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scroll">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-[#006d37] text-white border-[#006d37]'
                      : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30]'
                  }`}
                >
                  All Agents ({displayAgents.length})
                </button>

                <button
                  onClick={() => setActiveTab('top')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer whitespace-nowrap ${
                    activeTab === 'top'
                      ? 'bg-[#006d37] text-white border-[#006d37]'
                      : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30]'
                  }`}
                >
                  🌟 Top Performers
                </button>

                <button
                  onClick={() => setActiveTab('payouts')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer whitespace-nowrap ${
                    activeTab === 'payouts'
                      ? 'bg-[#006d37] text-white border-[#006d37]'
                      : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30]'
                  }`}
                >
                  💵 Pending Payouts
                </button>

                <button
                  onClick={() => setActiveTab('inactive')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer whitespace-nowrap ${
                    activeTab === 'inactive'
                      ? 'bg-[#006d37] text-white border-[#006d37]'
                      : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30]'
                  }`}
                >
                  ⏸️ Inactive
                </button>
              </div>

              {/* Search Bar */}
              <div className="w-full sm:w-64 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agent, referral code..."
                  className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#f8faf9] dark:bg-[#001f15] border border-surface-variant dark:border-[#004d30] text-xs font-bold outline-none text-on-surface dark:text-white"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-sm">
                  search
                </span>
              </div>

            </div>

            {/* Mobile-Native Clean Cards Grid */}
            {tableQueryResult.isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="py-14 text-center text-on-surface-variant dark:text-[#85af9b]">
                <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">badge</span>
                <p className="text-xs font-bold text-on-surface dark:text-white">No sales agents match your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="bg-[#f8faf9] dark:bg-[#001f15] rounded-2xl p-4 sm:p-5 border border-surface-variant dark:border-[#004d30] flex flex-col justify-between shadow-sm hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all group"
                  >
                    <div>
                      {/* Top Row: Avatar, Name, Badges */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-[#006d37] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                            {(agent.name || 'AG').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="text-sm font-black text-on-surface dark:text-white mb-0 leading-tight">
                                {agent.name || 'Agent Partner'}
                              </h4>
                              {agent.is_top_performer && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  🌟 TOP AGENT
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-medium text-on-surface-variant dark:text-[#85af9b]">
                              {agent.email || '-'} • {agent.phone || '-'}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                          agent.status === 'active'
                            ? 'bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border border-[#6bfe9c]/30'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                        }`}>
                          {agent.status || 'ACTIVE'}
                        </span>
                      </div>

                      {/* Referral Code Box */}
                      <div className="bg-white dark:bg-[#002518] p-2.5 rounded-xl border border-surface-variant dark:border-[#004d30] flex items-center justify-between text-xs mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-on-surface-variant dark:text-[#85af9b] uppercase">REF CODE:</span>
                          <span className="font-mono font-bold text-[#006d37] dark:text-[#6bfe9c] text-xs">
                            {agent.referral_code || 'AG-00000'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(agent.referral_code)}
                          className="text-[11px] font-bold text-slate-600 dark:text-[#85af9b] hover:text-[#006d37] dark:hover:text-[#6bfe9c] bg-transparent border-none cursor-pointer flex items-center gap-1"
                        >
                          <span>Copy Link</span>
                          <span className="material-symbols-outlined text-xs">content_copy</span>
                        </button>
                      </div>

                      {/* Performance Grid Box */}
                      <div className="grid grid-cols-3 gap-2 bg-white dark:bg-[#002518] p-3 rounded-xl border border-surface-variant dark:border-[#004d30] text-center mb-3">
                        <div>
                          <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] block">ACQUIRED</span>
                          <span className="text-xs font-black text-on-surface dark:text-white">{agent.acquired_stores || 0} Stores</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] block">TOTAL REVENUE</span>
                          <span className="text-xs font-black text-on-surface dark:text-white">RM {(((agent.total_sales_revenue || 0)) / 1000).toFixed(1)}k</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] block">COMMISSION</span>
                          <span className="text-xs font-black text-[#006d37] dark:text-[#6bfe9c]">RM {(agent.total_commission_earned || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-surface-variant dark:border-white/10">
                      <div className="text-[11px]">
                        <span className="text-on-surface-variant dark:text-[#85af9b] font-medium">Wallet: </span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">RM {(agent.wallet_balance || 0).toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {agent.wallet_balance > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayout(agent)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-xl text-[11px] font-black border border-amber-500/30 cursor-pointer flex items-center gap-1"
                          >
                            <span>Pay Out</span>
                            <span className="material-symbols-outlined text-xs">payments</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditAgent(agent)}
                          className="bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white px-3 py-1.5 rounded-xl text-[11px] font-black border-none cursor-pointer flex items-center gap-1"
                        >
                          <span>Edit Tier</span>
                          <span className="material-symbols-outlined text-xs">edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate('/sales-dashboard')}
                          className="bg-[#006d37]/10 hover:bg-[#006d37]/20 text-[#006d37] dark:text-[#6bfe9c] px-3 py-1.5 rounded-xl text-[11px] font-black border border-[#006d37]/20 cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Onboard New Agent Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pt-1">
            <span className="material-symbols-outlined text-[#006d37]">person_add</span>
            <span className="font-black text-base text-on-surface dark:text-white">Onboard New Sales Agent</span>
          </div>
        }
        open={isOnboardModalOpen}
        onCancel={() => setIsOnboardModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOnboardSubmit}
          initialValues={{ commission_tier: 'tier_1' }}
          className="pt-3 flex flex-col gap-3"
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Full name required' }]}>
            <Input className="h-10 rounded-xl" placeholder="e.g. Farhan Izwan" />
          </Form.Item>

          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input className="h-10 rounded-xl" placeholder="e.g. agent@risev.com" />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
            <Input className="h-10 rounded-xl" placeholder="e.g. +60 12-345 6789" />
          </Form.Item>

          <Form.Item name="commission_tier" label="Commission Tier" rules={[{ required: true }]}>
            <Select className="h-10 rounded-xl">
              <Select.Option value="tier_1">Tier 1 ({tierRates.tier_1}%)</Select.Option>
              <Select.Option value="tier_2">Tier 2 ({tierRates.tier_2}%)</Select.Option>
              <Select.Option value="tier_3">Tier 3 ({tierRates.tier_3}%)</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/5 mt-2">
            <Button onClick={() => setIsOnboardModalOpen(false)} className="h-10 rounded-xl font-bold">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="h-10 bg-[#006d37] text-white rounded-xl font-black border-none">
              Generate Code & Save
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Configure Global Tier Commission Rates & Requirements Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pt-1">
            <span className="material-symbols-outlined text-[#006d37]">settings</span>
            <span className="font-black text-base text-on-surface dark:text-white">Configure Sales Agent Tiers & Rules</span>
          </div>
        }
        open={isTierRatesModalOpen}
        onCancel={() => setIsTierRatesModalOpen(false)}
        footer={null}
      >
        <Form
          form={tierRatesForm}
          layout="vertical"
          onFinish={handleSaveTierRates}
          className="pt-3 flex flex-col gap-3"
        >
          <p className="text-xs text-on-surface-variant mb-2">
            Set global commission percentages and minimum acquired merchant requirements for sales agent tiers.
          </p>

          {/* Tier 1 Box */}
          <div className="bg-[#f8faf9] p-3 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <h4 className="text-xs font-black text-[#006d37] uppercase tracking-wider mb-0">Tier 1 Configuration</h4>
            <div className="grid grid-cols-2 gap-2">
              <Form.Item name="agent_tier_1_rate" label="Commission Rate (%)" rules={[{ required: true }]} className="mb-0">
                <InputNumber className="w-full h-10 rounded-xl font-bold" min={1} max={100} suffix="%" placeholder="e.g. 7" />
              </Form.Item>
              <Form.Item name="agent_tier_1_min_merchants" label="Min Merchants Req." rules={[{ required: true }]} className="mb-0">
                <InputNumber className="w-full h-10 rounded-xl font-bold" min={0} max={1000} placeholder="e.g. 0" />
              </Form.Item>
            </div>
          </div>

          {/* Tier 2 Box */}
          <div className="bg-[#f8faf9] p-3 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <h4 className="text-xs font-black text-[#006d37] uppercase tracking-wider mb-0">Tier 2 Configuration</h4>
            <div className="grid grid-cols-2 gap-2">
              <Form.Item name="agent_tier_2_rate" label="Commission Rate (%)" rules={[{ required: true }]} className="mb-0">
                <InputNumber className="w-full h-10 rounded-xl font-bold" min={1} max={100} suffix="%" placeholder="e.g. 12" />
              </Form.Item>
              <Form.Item name="agent_tier_2_min_merchants" label="Min Merchants Req." rules={[{ required: true }]} className="mb-0">
                <InputNumber className="w-full h-10 rounded-xl font-bold" min={0} max={1000} placeholder="e.g. 15" />
              </Form.Item>
            </div>
          </div>

          {/* Tier 3 Box */}
          <div className="bg-[#f8faf9] p-3 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <h4 className="text-xs font-black text-[#006d37] uppercase tracking-wider mb-0">Tier 3 Configuration</h4>
            <div className="grid grid-cols-2 gap-2">
              <Form.Item name="agent_tier_3_rate" label="Commission Rate (%)" rules={[{ required: true }]} className="mb-0">
                <InputNumber className="w-full h-10 rounded-xl font-bold" min={1} max={100} suffix="%" placeholder="e.g. 20" />
              </Form.Item>
              <Form.Item name="agent_tier_3_min_merchants" label="Min Merchants Req." rules={[{ required: true }]} className="mb-0">
                <InputNumber className="w-full h-10 rounded-xl font-bold" min={0} max={1000} placeholder="e.g. 30" />
              </Form.Item>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/5 mt-2">
            <Button onClick={() => setIsTierRatesModalOpen(false)} className="h-10 rounded-xl font-bold">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="h-10 bg-[#006d37] text-white rounded-xl font-black border-none">
              Save Rules & Rates
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Agent Tier & Status Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pt-1">
            <span className="material-symbols-outlined text-[#006d37]">edit</span>
            <span className="font-black text-base text-on-surface dark:text-white">Edit Agent Profile & Tier</span>
          </div>
        }
        open={isEditAgentModalOpen}
        onCancel={() => setIsEditAgentModalOpen(false)}
        footer={null}
      >
        <Form
          form={editAgentForm}
          layout="vertical"
          onFinish={handleSaveEditAgent}
          className="pt-3 flex flex-col gap-3"
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number">
            <Input className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item name="commission_tier" label="Assigned Commission Tier" rules={[{ required: true }]}>
            <Select className="h-10 rounded-xl">
              <Select.Option value="tier_1">Tier 1 ({tierRates.tier_1}%)</Select.Option>
              <Select.Option value="tier_2">Tier 2 ({tierRates.tier_2}%)</Select.Option>
              <Select.Option value="tier_3">Tier 3 ({tierRates.tier_3}%)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Account Status" rules={[{ required: true }]}>
            <Select className="h-10 rounded-xl">
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/5 mt-2">
            <Button onClick={() => setIsEditAgentModalOpen(false)} className="h-10 rounded-xl font-bold">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="h-10 bg-[#006d37] text-white rounded-xl font-black border-none">
              Update Agent Record
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Process Payout Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pt-1">
            <span className="material-symbols-outlined text-amber-600">payments</span>
            <span className="font-black text-base text-on-surface dark:text-white">Confirm Commission Payout</span>
          </div>
        }
        open={isPayoutModalOpen}
        onCancel={() => setIsPayoutModalOpen(false)}
        onOk={handleConfirmPayout}
        okText="Approve & Send Payout"
        okButtonProps={{ style: { backgroundColor: '#006d37', border: 'none' } }}
        cancelText="Cancel"
      >
        {selectedAgent && (
          <div className="py-3 flex flex-col gap-3">
            <p className="text-xs text-on-surface-variant mb-1">
              Transfer funds to agent <strong className="text-on-surface">{selectedAgent.name}</strong> for earned referral commissions:
            </p>

            <div className="bg-[#f8faf9] p-3 rounded-xl border border-slate-200 text-xs flex flex-col gap-1 font-mono">
              <div>Bank: <strong className="text-on-surface">{selectedAgent.bank_name || 'Maybank'}</strong></div>
              <div>Account No: <strong className="text-on-surface">{selectedAgent.account_no || '164285910293'}</strong></div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-[#006d37] tracking-wider mb-1 block">
                PAYOUT AMOUNT (RM)
              </label>
              <InputNumber
                value={payoutAmount}
                onChange={(val) => setPayoutAmount(Number(val))}
                className="w-full h-11 rounded-xl font-bold text-base"
                prefix="RM"
                max={selectedAgent.wallet_balance}
              />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

