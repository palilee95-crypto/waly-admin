import React, { useState } from 'react';
import { useTable, useUpdate } from '@refinedev/core';
import { useForm } from '@refinedev/antd';
import { Modal, Form, Input, Button, message, Switch, InputNumber, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

export const FraudFlagList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const { tableQueryResult } = useTable<any>({
    resource: 'fraud_flags',
    pagination: { pageSize: 50 },
    sorters: [{ field: 'created', order: 'desc' }],
    meta: {
      expand: ['user', 'merchant'],
    },
    filters: {
      permanent: activeTab === 'open' 
        ? [{ field: 'status', operator: 'in', value: ['open', 'reviewing'] }]
        : [{ field: 'status', operator: 'in', value: ['resolved', 'dismissed'] }],
    },
  });

  const { mutate: updateFlag } = useUpdate();
  const { mutate: updateUser } = useUpdate();

  const handleAction = (flag: any, action: 'dismissed' | 'resolved', isFraud = false) => {
    setSelectedFlag(flag);
    if (action === 'resolved' && isFraud) {
      setIsResolveModalOpen(true);
      setNotes('');
    } else {
      Modal.confirm({
        title: action === 'dismissed' ? 'Dismiss Fraud Flag' : 'Resolve Legitimate Activity',
        content: `Are you sure you want to ${action === 'dismissed' ? 'dismiss' : 'resolve'} this flag?`,
        okText: 'Confirm',
        cancelText: 'Cancel',
        okButtonProps: { style: { backgroundColor: '#006d37' } },
        onOk: () => {
          updateFlag({
            resource: 'fraud_flags',
            id: flag.id,
            values: { status: action, notes: 'Resolved as false positive / legitimate' },
            successNotification: () => {
              message.success('Flag updated successfully');
              return {
                message: 'Flag Updated',
                description: 'The status of the fraud flag has been updated.',
                type: 'success',
              };
            },
          });
        },
      });
    }
  };

  const handleResolveFraudSubmit = () => {
    if (!notes.trim()) {
      message.error('Please specify resolution notes');
      return;
    }
    if (selectedFlag) {
      updateFlag({
        resource: 'fraud_flags',
        id: selectedFlag.id,
        values: { status: 'resolved', notes },
      });

      if (selectedFlag.user) {
        updateUser({
          resource: 'users',
          id: selectedFlag.user,
          values: {
            status: 'suspended',
            metadata: { suspension_reason: `Fraud confirmed: ${notes}` },
          },
          successNotification: () => {
            message.success('Fraud confirmed and user suspended');
            return {
              message: 'Fraud Resolved',
              description: 'The user account has been suspended.',
              type: 'success',
            };
          },
        });
      }
      setIsResolveModalOpen(false);
    }
  };

  const flags = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            risev SECURITY & ANTI-FRAUD
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Fraud Prevention Queue
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md font-medium leading-relaxed">
            Automated velocity alerts, suspicious scan verification, and account suspension controls.
          </p>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1100px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* Filter Tabs Bar */}
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-surface-variant dark:border-white/10">
              <button
                onClick={() => setActiveTab('open')}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all border cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'open'
                    ? 'bg-[#006d37] text-white border-[#006d37] shadow-md'
                    : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                }`}
              >
                <span>🚨 Open Alerts</span>
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {flags.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all border cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'resolved'
                    ? 'bg-[#006d37] text-white border-[#006d37] shadow-md'
                    : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                }`}
              >
                <span>✅ Resolved Archive</span>
              </button>
            </div>

            {/* Mobile-Native Clean Alert Cards Grid */}
            {tableQueryResult.isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
              </div>
            ) : flags.length === 0 ? (
              <div className="py-14 text-center text-on-surface-variant dark:text-[#85af9b]">
                <span className="material-symbols-outlined text-3xl text-emerald-500 mb-1">verified_user</span>
                <p className="text-xs font-bold text-on-surface dark:text-white">No security alerts to display.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                {flags.map((flag) => {
                  const userName = flag.expand?.user?.name || flag.user || 'Unknown User';
                  const storeName = flag.expand?.merchant?.name || 'risev Store';

                  return (
                    <div
                      key={flag.id}
                      className="bg-[#f8faf9] dark:bg-[#001f15] rounded-2xl p-4 border border-surface-variant dark:border-[#004d30] flex flex-col justify-between shadow-sm hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all group"
                    >
                      <div>
                        {/* Top Row: Severity Badge, Rule Title */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                              flag.severity === 'high'
                                ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                                : flag.severity === 'medium'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                            }`}>
                              ⚠️
                            </div>
                            <div className="text-left">
                              <h4 className="text-xs sm:text-sm font-black text-on-surface dark:text-white mb-0.5 group-hover:text-[#006d37] dark:group-hover:text-[#6bfe9c] transition-colors leading-tight">
                                {flag.rule || 'Velocity Threshold Breached'}
                              </h4>
                              <span className="text-[10px] font-bold text-on-surface-variant dark:text-[#85af9b]">
                                Flagged Account: {userName}
                              </span>
                            </div>
                          </div>

                          {/* Severity Pill */}
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            flag.severity === 'high'
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                              : flag.severity === 'medium'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                          }`}>
                            {flag.severity || 'high'}
                          </span>
                        </div>

                        {/* Store & Time Box */}
                        <div className="bg-white dark:bg-[#002518] p-2.5 rounded-xl border border-surface-variant dark:border-[#004d30] flex items-center justify-between text-[11px] mb-3">
                          <span className="font-mono text-slate-400 text-[10px] truncate max-w-[140px]">
                            {storeName}
                          </span>
                          <span className="text-on-surface-variant dark:text-[#85af9b] font-medium">
                            {new Date(flag.created || flag.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Pill Buttons */}
                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-surface-variant dark:border-white/10">
                        <button
                          onClick={() => navigate(`/fraud/${flag.id}`)}
                          className="bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-[#85af9b] px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-white/10 cursor-pointer"
                        >
                          Details
                        </button>

                        {activeTab === 'open' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleAction(flag, 'dismissed')}
                              className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#85af9b] px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-white/10 cursor-pointer"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => handleAction(flag, 'resolved', true)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl text-[11px] font-black border border-red-500/20 cursor-pointer"
                            >
                              Confirm Fraud
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Resolve Fraud Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pt-1">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <span className="font-black text-base text-on-surface dark:text-white">Confirm Fraud & Suspend User</span>
          </div>
        }
        open={isResolveModalOpen}
        onOk={handleResolveFraudSubmit}
        onCancel={() => setIsResolveModalOpen(false)}
        okText="Confirm & Suspend User"
        okButtonProps={{ danger: true, style: { border: 'none' } }}
        cancelText="Cancel"
      >
        <div className="py-4">
          <p className="text-sm text-on-surface mb-2">Provide resolution notes (describing the confirmed fraud activity). This will suspend the user account permanently:</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-xl border border-solid border-black/10 focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
            placeholder="e.g. Automated script detected earning 10,000 points from fake checkins..."
          />
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// 2. VelocityRuleList
// ==========================================
export const VelocityRuleList: React.FC = () => {
  const navigate = useNavigate();
  const { tableQueryResult } = useTable<any>({
    resource: 'velocity_rules',
  });

  const rules = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-6 text-left font-body">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Velocity Rules Configuration</h2>
          <p className="text-body-lg text-on-surface-variant">Configure fraud thresholds for real-time transaction tracking</p>
        </div>
        <button
          onClick={() => navigate('/fraud')}
          className="bg-slate-200 text-on-surface px-6 py-2.5 rounded-xl font-headline font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
        >
          View Fraud Flags
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
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Rule Identifier</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Description</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Max Points Limit</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Max Transactions</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Window (min)</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Severity</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {rules.length === 0 ? (
                  // Sample seed defaults from 24-velocity-rules.md
                  [
                    { id: 'r1', rule_name: 'high_velocity_earn', description: 'Earn more than 500 points in 10 minutes', max_points: 500, max_transactions: 0, time_window_min: 10, severity: 'high', is_active: true },
                    { id: 'r2', rule_name: 'rapid_transactions', description: 'More than 10 transactions in 30 minutes', max_points: 0, max_transactions: 10, time_window_min: 30, severity: 'medium', is_active: true },
                    { id: 'r3', rule_name: 'single_tx_ceiling', description: 'Single transaction value exceeds 1,000 points', max_points: 1000, max_transactions: 1, time_window_min: 1, severity: 'medium', is_active: true },
                    { id: 'r4', rule_name: 'daily_limit', description: 'Earn more than 2,000 points in 24 hours', max_points: 2000, max_transactions: 0, time_window_min: 1440, severity: 'low', is_active: true }
                  ].map((rule) => (
                    <tr key={rule.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-mono text-sm font-semibold text-on-surface">{rule.rule_name}</td>
                      <td className="py-5 text-sm text-on-surface-variant max-w-[250px] truncate">{rule.description}</td>
                      <td className="py-5 text-sm text-on-surface font-semibold">{rule.max_points || 'No Limit'}</td>
                      <td className="py-5 text-sm text-on-surface font-semibold">{rule.max_transactions || 'No Limit'}</td>
                      <td className="py-5 text-sm text-on-surface">{rule.time_window_min} min</td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          rule.severity === 'high' ? 'bg-red-100 text-red-700' :
                          rule.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {rule.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-5">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                      </td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => navigate(`/fraud/velocity-rules/edit/${rule.id}`)}
                          className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Edit Settings
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  rules.map((rule) => (
                    <tr key={rule.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 font-mono text-sm font-semibold text-on-surface">{rule.rule_name}</td>
                      <td className="py-5 text-sm text-on-surface-variant max-w-[250px] truncate">{rule.description}</td>
                      <td className="py-5 text-sm text-on-surface font-semibold">{rule.max_points || 'No Limit'}</td>
                      <td className="py-5 text-sm text-on-surface font-semibold">{rule.max_transactions || 'No Limit'}</td>
                      <td className="py-5 text-sm text-on-surface">{rule.time_window_min} min</td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          rule.severity === 'high' ? 'bg-red-100 text-red-700' :
                          rule.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {(rule.severity || '').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-5">
                        {rule.is_active ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Disabled</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() => navigate(`/fraud/velocity-rules/edit/${rule.id}`)}
                          className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                        >
                          Edit Settings
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
// 3. VelocityRuleEdit
// ==========================================
export const VelocityRuleEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onFinish, formProps } = useForm<any>({
    resource: 'velocity_rules',
    action: 'edit',
    id,
    redirect: 'list',
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto text-left font-body">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Edit Velocity Rule</h2>
        <p className="text-body-lg text-on-surface-variant">Update active parameters and limits for fraud trigger</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          {...formProps}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item name="rule_name" label="Rule Name">
            <Input className="h-10 rounded-xl" disabled />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} className="rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="max_points" label="Max Points Threshold" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full h-10 rounded-xl flex items-center" placeholder="0 = No Limit" />
            </Form.Item>

            <Form.Item name="max_transactions" label="Max Transactions Threshold" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full h-10 rounded-xl flex items-center" placeholder="0 = No Limit" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="time_window_min" label="Time Window (Minutes)" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full h-10 rounded-xl flex items-center" />
            </Form.Item>

            <Form.Item name="severity" label="Severity Level" rules={[{ required: true }]}>
              <Select className="h-10 rounded-xl">
                <Select.Option value="low">Low</Select.Option>
                <Select.Option value="medium">Medium</Select.Option>
                <Select.Option value="high">High</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="is_active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Disabled" />
          </Form.Item>

          <div className="flex gap-4 justify-end mt-6">
            <Button
              onClick={() => navigate('/fraud/velocity-rules')}
              className="h-11 rounded-xl px-6 font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              Save Rule Configuration
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

