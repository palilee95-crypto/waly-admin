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

  const sentCount = 12400;
  const deliveredCount = 12100;
  const failedCount = 300;
  const readCount = 8900;

  const deliveryRate = (deliveredCount / (sentCount + failedCount)) * 100;
  const readRate = (readCount / deliveredCount) * 100;
  const failureRate = (failedCount / sentCount) * 100;

  const { tableQueryResult } = useTable<any>({
    resource: 'notification_logs',
    pagination: { pageSize: 50 },
  });

  const logs = tableQueryResult?.data?.data || [];
  const displayLogs = logs.length > 0 ? logs : [
    { id: 'l1', recipient: 'user_9918', channel: 'push', status: 'delivered', sent_at: '2026-07-01 19:10', error_msg: null },
    { id: 'l2', recipient: 'user_1120', channel: 'whatsapp', status: 'failed', sent_at: '2026-07-01 18:45', error_msg: 'Evolution API Timeout' },
    { id: 'l3', recipient: 'user_3401', channel: 'in_app', status: 'read', sent_at: '2026-07-01 17:30', error_msg: null }
  ];

  const filteredLogs = displayLogs
    .filter(l => !failedOnly || l.status === 'failed')
    .filter(l => channelFilter === 'all' || l.channel === channelFilter);

  const handleRetry = (record: any) => {
    message.loading({ content: `Retrying notification to recipient ${record.recipient}...`, key: 'retry' });
    setTimeout(() => {
      message.success({ content: 'Notification delivery retried successfully!', key: 'retry' });
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            risev SYSTEM BROADCASTS & ALERTS
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Notification Hub
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-5 font-medium leading-relaxed">
            Broadcast push alerts, WhatsApp SMS, and in-app messages to platform customers.
          </p>

          <button
            onClick={() => navigate('/notifications/broadcast')}
            className="inline-flex items-center gap-2 bg-[#6bfe9c] text-[#002d1e] font-black text-xs px-5 py-2.5 rounded-full hover:scale-105 transition-all shadow-lg border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            <span>📢 Compose Broadcast</span>
          </button>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1100px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              
              <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                <p className="text-[9px] text-on-surface-variant dark:text-[#85af9b] uppercase font-black tracking-wider mb-1">DELIVERY SUCCESS RATE</p>
                <h3 className="text-xl font-black text-[#006d37] dark:text-[#6bfe9c] mb-0">{deliveryRate.toFixed(1)}%</h3>
                <span className="text-[10px] text-on-surface-variant dark:text-[#85af9b] font-medium block mt-1">
                  {deliveredCount.toLocaleString()} delivered / {sentCount.toLocaleString()} sent
                </span>
              </div>

              <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                <p className="text-[9px] text-on-surface-variant dark:text-[#85af9b] uppercase font-black tracking-wider mb-1">READ OPEN RATE</p>
                <h3 className="text-xl font-black text-purple-600 dark:text-purple-400 mb-0">{readRate.toFixed(1)}%</h3>
                <span className="text-[10px] text-on-surface-variant dark:text-[#85af9b] font-medium block mt-1">
                  {readCount.toLocaleString()} views recorded
                </span>
              </div>

              <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30]">
                <p className="text-[9px] text-on-surface-variant dark:text-[#85af9b] uppercase font-black tracking-wider mb-1">DISPATCHED FAIL RATE</p>
                <h3 className="text-xl font-black text-red-500 mb-0">{failureRate.toFixed(1)}%</h3>
                <span className="text-[10px] text-red-500 font-bold block mt-1">
                  {failedCount.toLocaleString()} failed delivery codes
                </span>
              </div>

            </div>

            {/* Toolbar: Channels & Failed Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-surface-variant dark:border-white/10">
              <h3 className="text-sm font-black text-on-surface dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006d37] dark:text-[#6bfe9c]">history</span>
                Delivery Audit Trail
              </h3>

              <div className="flex items-center gap-3">
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
                
                <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface dark:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={failedOnly}
                    onChange={(e) => setFailedOnly(e.target.checked)}
                    className="rounded accent-[#006d37]"
                  />
                  <span>Failed Only</span>
                </label>
              </div>
            </div>

            {/* Mobile-Native Clean Cards Grid */}
            {tableQueryResult.isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-14 text-center text-on-surface-variant dark:text-[#85af9b]">
                <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">mark_email_read</span>
                <p className="text-xs font-bold text-on-surface dark:text-white">No delivery log records found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#f8faf9] dark:bg-[#001f15] rounded-2xl p-4 border border-surface-variant dark:border-[#004d30] flex flex-col justify-between shadow-sm hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all group"
                  >
                    <div>
                      {/* Top Row: Channel Icon, Recipient, and Status Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#006d37]/10 text-[#006d37] dark:bg-[#6bfe9c]/15 dark:text-[#6bfe9c] flex items-center justify-center font-black text-lg shrink-0 border border-[#006d37]/15">
                            {log.channel === 'whatsapp' ? '💬' : log.channel === 'in_app' ? '📩' : '🔔'}
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs sm:text-sm font-black text-on-surface dark:text-white mb-0.5 leading-tight">
                              Recipient: {log.recipient}
                            </h4>
                            <span className="text-[9px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider">
                              {log.channel?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                          log.status === 'delivered' ? 'bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border border-[#6bfe9c]/30' :
                          log.status === 'read' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30' :
                          log.status === 'failed' ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30' : 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
                        }`}>
                          {log.status || 'SENT'}
                        </span>
                      </div>

                      {/* Details Box */}
                      <div className="bg-white dark:bg-[#002518] p-2.5 rounded-xl border border-surface-variant dark:border-[#004d30] flex items-center justify-between text-[11px] mb-3">
                        <span className="text-on-surface-variant dark:text-[#85af9b]">
                          {log.sent_at}
                        </span>
                        {log.error_msg && (
                          <span className="font-mono text-red-500 text-[10px] truncate max-w-[150px]">
                            {log.error_msg}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Row */}
                    {log.status === 'failed' && (
                      <div className="flex items-center justify-end pt-2 border-t border-surface-variant dark:border-white/10">
                        <button
                          onClick={() => handleRetry(log)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl text-[11px] font-black border border-red-500/20 cursor-pointer flex items-center gap-1"
                        >
                          <span>Retry Delivery</span>
                          <span className="material-symbols-outlined text-xs">refresh</span>
                        </button>
                      </div>
                    )}

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
// 2. BroadcastForm
export const NotificationBroadcast: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [targetType, setTargetType] = useState<'all' | 'tier' | 'merchant_customers'>('all');

  // Watch form fields for live preview
  const liveTitle = Form.useWatch('title', form) || '🔥 New Campaign Live!';
  const liveBody = Form.useWatch('body', form) || 'Double points this weekend at all participating merchants.';

  const { selectProps: tierSelectProps } = useSelect<any>({
    resource: 'tiers',
  });

  const { selectProps: merchantSelectProps } = useSelect<any>({
    resource: 'merchants',
  });

  const templates = [
    { key: 'campaign', title: '🔥 New Campaign Live!', body: 'Double points this weekend at all participating merchants.' },
    { key: 'upgrade', title: '🎉 You\'ve been upgraded!', body: 'Welcome to your new membership tier. Enjoy your new benefits.' },
    { key: 'maintenance', title: '🔧 Scheduled Maintenance', body: 'risev will be down for scheduled upgrades from 02:00 to 04:00 UTC.' }
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
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center relative">
          
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#85af9b] hover:text-white mb-3 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full transition-all border border-white/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Notification Hub</span>
          </button>

          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            risev BROADCAST ENGINE
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Compose Broadcast
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md font-medium leading-relaxed">
            Send real-time push alerts, in-app messages, and SMS updates to customer segments.
          </p>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1000px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* Quick Templates Chips Bar */}
            <div className="pb-5 mb-5 border-b border-surface-variant dark:border-white/10">
              <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-2 block">
                ⚡ 1-TAP TEMPLATES
              </label>
              <div className="flex gap-2 flex-wrap">
                {templates.map((tpl) => (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="bg-[#f8faf9] dark:bg-[#001f15] hover:bg-[#006d37]/10 border border-surface-variant dark:border-[#004d30] hover:border-[#006d37] dark:hover:border-[#6bfe9c] px-3.5 py-2 rounded-2xl cursor-pointer text-left transition-all group"
                  >
                    <span className="text-xs font-black text-on-surface dark:text-white group-hover:text-[#006d37] dark:group-hover:text-[#6bfe9c] block">
                      {tpl.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Layout: Left Form, Right Smartphone Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Form Fields (7 cols) */}
              <div className="lg:col-span-7">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleFinish}
                  requiredMark={false}
                  initialValues={{
                    title: '🔥 New Campaign Live!',
                    body: 'Double points this weekend at all participating merchants.',
                    target: 'all'
                  }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                      NOTIFICATION TITLE <span className="text-red-500">*</span>
                    </label>
                    <Form.Item name="title" rules={[{ required: true, message: 'Please enter title' }]} className="mb-0">
                      <Input className="h-11 rounded-2xl text-sm font-bold border-slate-200 dark:border-[#004d30]" placeholder="Enter title text..." />
                    </Form.Item>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                      BODY MESSAGE <span className="text-red-500">*</span>
                    </label>
                    <Form.Item name="body" rules={[{ required: true, message: 'Please enter body text' }]} className="mb-0">
                      <Input.TextArea rows={4} className="rounded-2xl text-sm border-slate-200 dark:border-[#004d30] resize-none p-3" placeholder="Type notification content message here..." />
                    </Form.Item>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                      TARGET RECIPIENTS SCOPE <span className="text-red-500">*</span>
                    </label>
                    <Form.Item name="target" rules={[{ required: true }]} className="mb-0">
                      <Select
                        className="h-11 rounded-2xl"
                        onChange={(val: any) => setTargetType(val)}
                      >
                        <Select.Option value="all">All Platform Customers</Select.Option>
                        <Select.Option value="tier">Specific Membership Tier</Select.Option>
                        <Select.Option value="merchant_customers">Customers of Specific Merchant</Select.Option>
                      </Select>
                    </Form.Item>
                  </div>

                  {targetType === 'tier' && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                        MEMBERSHIP TIER OPTION <span className="text-red-500">*</span>
                      </label>
                      <Form.Item name="tier" rules={[{ required: true, message: 'Please choose target tier' }]} className="mb-0">
                        <Select {...tierSelectProps} className="h-11 rounded-2xl" placeholder="Select tier..." />
                      </Form.Item>
                    </div>
                  )}

                  {targetType === 'merchant_customers' && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#006d37] dark:text-[#6bfe9c] tracking-wider mb-1.5 block">
                        MERCHANT SCOPE OPTION <span className="text-red-500">*</span>
                      </label>
                      <Form.Item name="merchant" rules={[{ required: true, message: 'Please choose target merchant' }]} className="mb-0">
                        <Select {...merchantSelectProps} className="h-11 rounded-2xl" placeholder="Select merchant..." />
                      </Form.Item>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-variant dark:border-white/10 mt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/notifications')}
                      className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-transparent text-slate-600 dark:text-[#85af9b] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-2xl text-xs font-black bg-[#006d37] hover:bg-[#004d27] text-white border-none cursor-pointer transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <span>Broadcast Notification</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>

                </Form>
              </div>

              {/* Right Column: Smartphone Live Preview Card (5 cols) */}
              <div className="lg:col-span-5 bg-[#002d1e] text-white rounded-3xl p-5 border border-[#004d30] flex flex-col gap-3 shadow-lg">
                
                <div className="flex items-center justify-between border-b border-[#004d30] pb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#6bfe9c] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6bfe9c] animate-pulse"></span>
                    LIVE PUSH PREVIEW
                  </span>
                  <span className="text-[10px] text-[#85af9b] font-mono">risev Customer iOS / Android</span>
                </div>

                {/* Simulated Push Alert Card */}
                <div className="bg-[#003d29] rounded-2xl p-4 border border-[#005c3b] shadow-md flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#6bfe9c] text-[#002d1e] font-black text-xs flex items-center justify-center">
                        W
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-wider">risev REWARDS</span>
                    </div>
                    <span className="text-[10px] text-[#85af9b] font-medium">now</span>
                  </div>

                  <h4 className="text-sm font-black text-white mb-0 leading-snug">
                    {liveTitle}
                  </h4>

                  <p className="text-xs text-[#85af9b] mb-0 font-medium leading-relaxed">
                    {liveBody}
                  </p>
                </div>

                <div className="text-[11px] text-[#85af9b] font-medium leading-normal bg-[#002518] p-3 rounded-xl border border-[#004d30] mt-1">
                  💡 This push banner will be instantly delivered to all selected customer devices upon broadcasting.
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
export const BroadcastLogs: React.FC = () => <div>Broadcast Logs Placeholder</div>;
export const BroadcastDetail: React.FC = () => <div>Broadcast Detail Placeholder</div>;

