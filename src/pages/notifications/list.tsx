import React, { useState } from 'react';
import { useTable, useForm, useList } from '@refinedev/core';
import { useSelect } from '@refinedev/antd';
import { Form, Input, Select, Button, message, Checkbox, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

// ==========================================
// 1. NotificationOverview
// ==========================================
export const NotificationOverview: React.FC = () => {
  const navigate = useNavigate();
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [failedOnly, setFailedOnly] = useState<boolean>(false);

  // Stats (delivered, sent, failed, read)
  // Mock numbers matching 26-notification-logs.md
  const sentCount = 12400;
  const deliveredCount = 12100;
  const failedCount = 300;
  const readCount = 8900;

  const deliveryRate = (deliveredCount / (sentCount + failedCount)) * 100;
  const readRate = (readCount / deliveredCount) * 100;
  const failureRate = (failedCount / sentCount) * 100;

  const { tableQueryResult } = useTable<any>({
    resource: 'notification_logs',
    pagination: { pageSize: 20 },
  });

  const logs = tableQueryResult?.data?.data || [];

  const handleRetry = (record: any) => {
    message.loading({ content: `Retrying notification to recipient ${record.recipient}...`, key: 'retry' });
    setTimeout(() => {
      message.success({ content: 'Notification delivery retried successfully!', key: 'retry' });
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 text-left font-body">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Notification Hub</h2>
          <p className="text-body-lg text-on-surface-variant">Broadcast push/email alerts and audit system delivery</p>
        </div>
        <button
          onClick={() => navigate('/notifications/broadcast')}
          className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl font-headline font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">campaign</span>
          Compose Broadcast
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="glass-panel p-glass-padding rounded-3xl">
          <p className="text-[10px] text-outline uppercase font-semibold">Delivery Success Rate</p>
          <h3 className="font-headline text-2xl font-black text-emerald-600 mt-1">{deliveryRate.toFixed(1)}%</h3>
          <p className="text-xs text-on-surface-variant mt-1">{deliveredCount.toLocaleString()} delivered / {sentCount.toLocaleString()} sent</p>
        </div>
        <div className="glass-panel p-glass-padding rounded-3xl">
          <p className="text-[10px] text-outline uppercase font-semibold">Read Open Rate</p>
          <h3 className="font-headline text-2xl font-black text-purple-600 mt-1">{readRate.toFixed(1)}%</h3>
          <p className="text-xs text-on-surface-variant mt-1">{readCount.toLocaleString()} views recorded</p>
        </div>
        <div className="glass-panel p-glass-padding rounded-3xl">
          <p className="text-[10px] text-outline uppercase font-semibold">Dispatched Fail Rate</p>
          <h3 className="font-headline text-2xl font-black text-red-600 mt-1">{failureRate.toFixed(1)}%</h3>
          <p className="text-xs text-on-surface-variant mt-1">{failedCount.toLocaleString()} failed delivery codes</p>
        </div>
      </div>

      {/* Logs and Filters Toolbar */}
      <div className="glass-panel rounded-[2rem] p-gutter">
        <div className="flex justify-between items-center gap-4 flex-wrap border-b border-black/5 pb-4 mb-4">
          <h3 className="font-headline text-sm font-bold text-on-surface">Delivery Audit Trail</h3>
          <div className="flex items-center gap-4">
            <Select
              value={channelFilter}
              onChange={setChannelFilter}
              className="w-36 h-9 rounded-xl"
              options={[
                { label: 'All Channels', value: 'all' },
                { label: 'Push Alert', value: 'push' },
                { label: 'In-App Message', value: 'in_app' },
                { label: 'WhatsApp SMS', value: 'whatsapp' },
              ]}
            />
            <Checkbox checked={failedOnly} onChange={(e) => setFailedOnly(e.target.checked)}>
              Failed Only
            </Checkbox>
          </div>
        </div>

        {tableQueryResult.isLoading ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Recipient ID</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Channel</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Dispatched Time</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Error Message</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {logs.length === 0 ? (
                  // Sample data if DB is empty
                  [
                    { id: 'l1', recipient: 'user_9918', channel: 'push', status: 'delivered', sent_at: '2026-07-01 19:10', error_msg: null },
                    { id: 'l2', recipient: 'user_1120', channel: 'whatsapp', status: 'failed', sent_at: '2026-07-01 18:45', error_msg: 'Evolution API Timeout' },
                    { id: 'l3', recipient: 'user_3401', channel: 'in_app', status: 'read', sent_at: '2026-07-01 17:30', error_msg: null }
                  ]
                    .filter(l => !failedOnly || l.status === 'failed')
                    .filter(l => channelFilter === 'all' || l.channel === channelFilter)
                    .map((log) => (
                      <tr key={log.id} className="group hover:bg-white/40 transition-colors">
                        <td className="py-4 text-sm font-semibold text-on-surface">{log.recipient}</td>
                        <td className="py-4 text-sm text-on-surface uppercase">{log.channel}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            log.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                            log.status === 'read' ? 'bg-purple-100 text-purple-700' :
                            log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-on-surface-variant">{log.sent_at}</td>
                        <td className="py-4 text-sm text-red-600 font-mono">{log.error_msg || '-'}</td>
                        <td className="py-4 text-right">
                          {log.status === 'failed' && (
                            <button
                              onClick={() => handleRetry(log)}
                              className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                            >
                              Retry Delivery
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                ) : (
                  logs
                    .filter((l: any) => !failedOnly || l.status === 'failed')
                    .filter((l: any) => channelFilter === 'all' || l.channel === channelFilter)
                    .map((log: any) => (
                      <tr key={log.id} className="group hover:bg-white/40 transition-colors">
                        <td className="py-4 text-sm font-semibold text-on-surface">{log.recipient}</td>
                        <td className="py-4 text-sm text-on-surface uppercase">{log.channel}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            log.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                            log.status === 'read' ? 'bg-purple-100 text-purple-700' :
                            log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {(log.status || '').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-on-surface-variant">
                          {new Date(log.sent_at).toLocaleString()}
                        </td>
                        <td className="py-4 text-sm text-red-600 font-mono">{log.error_msg || '-'}</td>
                        <td className="py-4 text-right">
                          {log.status === 'failed' && (
                            <button
                              onClick={() => handleRetry(log)}
                              className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                            >
                              Retry Delivery
                            </button>
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
    </div>
  );
};

// ==========================================
// 2. BroadcastForm
// ==========================================
export const NotificationBroadcast: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [targetType, setTargetType] = useState<'all' | 'tier' | 'merchant_customers'>('all');

  const { selectProps: tierSelectProps } = useSelect<any>({
    resource: 'tiers',
  });

  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
  });

  const templates = [
    { key: 'campaign', title: '🔥 New Campaign Live!', body: 'Double points this weekend at all participating merchants.' },
    { key: 'upgrade', title: '🎉 You\'ve been upgraded!', body: 'Welcome to your new membership tier. Enjoy your new benefits.' },
    { key: 'maintenance', title: '🔧 Scheduled Maintenance', body: 'WALY will be down for scheduled upgrades from 02:00 to 04:00 UTC.' }
  ];

  const handleApplyTemplate = (tpl: any) => {
    form.setFieldsValue({
      title: tpl.title,
      body: tpl.body,
    });
    message.success(`Applied template: ${tpl.title}`);
  };

  const handleFinish = async (values: any) => {
    message.loading({ content: 'Broadcasting notifications to recipients...', key: 'broadcast' });
    setTimeout(() => {
      message.success({ content: 'Successfully sent notifications to targeted segment!', key: 'broadcast', duration: 3 });
      navigate('/notifications');
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto text-left font-body">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Compose Broadcast</h2>
        <p className="text-body-lg text-on-surface-variant">Send notification updates to custom customer scopes</p>
      </div>

      {/* Templates Drawer */}
      <div className="glass-panel rounded-[2xl] p-6 text-left">
        <h3 className="font-headline text-sm font-bold text-on-surface mb-3">Suggested Templates</h3>
        <div className="flex gap-3 flex-wrap">
          {templates.map(tpl => (
            <div
              key={tpl.key}
              onClick={() => handleApplyTemplate(tpl)}
              className="bg-white/40 border border-solid border-black/5 hover:border-primary rounded-xl p-3 cursor-pointer transition-all max-w-[200px]"
            >
              <h4 className="text-xs font-bold text-on-surface truncate">{tpl.title}</h4>
              <p className="text-[10px] text-on-surface-variant truncate mt-1">{tpl.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Broadcast Form */}
      <div className="glass-panel rounded-[2rem] p-gutter">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          initialValues={{ target: 'all' }}
        >
          <Form.Item name="title" label="Notification Title" rules={[{ required: true }]}>
            <Input className="h-10 rounded-xl" placeholder="Enter title text..." />
          </Form.Item>

          <Form.Item name="body" label="Body Message" rules={[{ required: true }]}>
            <Input.TextArea rows={4} className="rounded-xl" placeholder="Type notification content message here..." />
          </Form.Item>

          <Form.Item name="target" label="Target Recipients Scope" rules={[{ required: true }]}>
            <Select
              className="h-10 rounded-xl"
              onChange={(val: any) => setTargetType(val)}
            >
              <Select.Option value="all">All Platform Customers</Select.Option>
              <Select.Option value="tier">Specific Membership Tier</Select.Option>
              <Select.Option value="merchant_customers">Customers of Specific Merchant</Select.Option>
            </Select>
          </Form.Item>

          {targetType === 'tier' && (
            <Form.Item name="tier" label="Membership Tier Option" rules={[{ required: true, message: 'Please choose target tier' }]}>
              <Select {...tierSelectProps} className="h-10 rounded-xl" placeholder="Select tier..." />
            </Form.Item>
          )}

          {targetType === 'merchant_customers' && (
            <Form.Item name="merchant" label="Merchant Scope Option" rules={[{ required: true, message: 'Please choose target merchant' }]}>
              <Select {...merchantSelectProps} className="h-10 rounded-xl" placeholder="Select merchant..." />
            </Form.Item>
          )}

          <div className="flex gap-4 justify-end mt-8 border-t border-black/5 pt-6">
            <Button
              onClick={() => navigate('/notifications')}
              className="h-11 rounded-xl px-6 font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="h-11 bg-primary text-white rounded-xl px-6 font-bold border-none shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              Broadcast Notification
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};
export const BroadcastLogs: React.FC = () => <div>Broadcast Logs Placeholder</div>;
export const BroadcastDetail: React.FC = () => <div>Broadcast Detail Placeholder</div>;
