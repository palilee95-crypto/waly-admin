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
    pagination: { pageSize: 10 },
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
        okButtonProps: { style: { backgroundColor: '#0040e0' } },
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
      // 1. Resolve flag
      updateFlag({
        resource: 'fraud_flags',
        id: selectedFlag.id,
        values: { status: 'resolved', notes },
      });

      // 2. Suspend user
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
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Fraud Prevention Queue</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Automated alerts and activity verification</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-black/5 pb-2">
        <button
          onClick={() => setActiveTab('open')}
          className={`font-body text-body-lg font-bold pb-2 border-b-2 transition-all bg-transparent border-none cursor-pointer ${
            activeTab === 'open' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Open Alerts
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`font-body text-body-lg font-bold pb-2 border-b-2 transition-all bg-transparent border-none cursor-pointer ${
            activeTab === 'resolved' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Resolved Archive
        </button>
      </div>

      {/* Flags table */}
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
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Severity</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Rule Triggered</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Flagged User ID</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Triggered At</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body">
                {flags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant text-sm">
                      No fraud alerts to display.
                    </td>
                  </tr>
                ) : (
                  flags.map((flag) => (
                    <tr key={flag.id} className="group hover:bg-white/40 transition-colors cursor-pointer" onClick={() => navigate(`/fraud/${flag.id}`)}>
                      <td className="py-5">
                        {flag.severity === 'high' && (
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">High</span>
                        )}
                        {flag.severity === 'medium' && (
                          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">Medium</span>
                        )}
                        {flag.severity === 'low' && (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Low</span>
                        )}
                      </td>
                      <td className="py-5 text-sm text-on-surface font-semibold">{flag.rule || 'Velocity Threshold Breached'}</td>
                      <td className="py-5 text-sm text-on-surface-variant">{flag.user || 'Unknown User'}</td>
                      <td className="py-5 text-sm text-on-surface-variant">
                        {new Date(flag.created || flag.created_at).toLocaleString()}
                      </td>
                      <td className="py-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/fraud/${flag.id}`)}
                            className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Details
                          </button>
                          {activeTab === 'open' && (
                            <>
                              <button
                                onClick={() => handleAction(flag, 'resolved', true)}
                                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 transition-all border-none font-bold cursor-pointer"
                              >
                                Confirm Fraud
                              </button>
                              <button
                                onClick={() => handleAction(flag, 'dismissed')}
                                className="bg-slate-200 text-on-surface px-3 py-1.5 rounded-lg text-xs hover:bg-slate-300 transition-all border-none font-bold cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
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

      {/* Resolve Fraud Modal */}
      <Modal
        title="Confirm Fraud & Suspend User"
        open={isResolveModalOpen}
        onOk={handleResolveFraudSubmit}
        onCancel={() => setIsResolveModalOpen(false)}
        okText="Confirm & Suspend"
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

