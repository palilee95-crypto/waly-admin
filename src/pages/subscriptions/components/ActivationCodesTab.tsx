import React, { useState } from 'react';
import { useTable, useDelete } from '@refinedev/core';
import { Tag, message, Modal, Form, Select, Input, Button, Popconfirm, QRCode, Tooltip } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  PrinterOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  QrcodeOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { pb } from '../../../lib/pocketbase';

export interface ActivationCodeRecord {
  id: string;
  code: string;
  plan: 'stand_bundle' | 'starter' | 'pro' | 'business';
  quota: number;
  is_redeemed: boolean;
  redeemed_by?: string;
  redeemed_at?: string;
  channel?: 'tiktok_shop' | 'shopee' | 'marketplace' | 'manual';
  created: string;
  updated: string;
  expand?: {
    redeemed_by?: {
      id: string;
      name: string;
      phone?: string;
      category?: string;
    };
  };
}

// High-entropy random alphanumeric generator (excluding ambiguous chars 0, O, 1, I, L)
const CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const generateRandomBlock = (length = 4): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return result;
};

export const generateActivationCodeString = (prefix = 'RSV'): string => {
  const cleanPrefix = (prefix || 'RSV').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const block1 = generateRandomBlock(4);
  const block2 = generateRandomBlock(4);
  return `${cleanPrefix}-${block1}-${block2}`;
};

export const ActivationCodesTab: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'redeemed'>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Generation Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateForm] = Form.useForm();

  // Print Slip Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printCodes, setPrintCodes] = useState<ActivationCodeRecord[]>([]);

  // Refine Table for activation_codes
  const { tableQueryResult } = useTable<ActivationCodeRecord>({
    resource: 'activation_codes',
    pagination: { pageSize: 200 },
    sorters: {
      initial: [
        {
          field: 'created',
          order: 'desc',
        },
      ],
    },
    meta: {
      expand: ['redeemed_by'],
    },
  });

  const { mutate: deleteCodeRecord } = useDelete();

  const allCodes: ActivationCodeRecord[] = (tableQueryResult?.data?.data as any) || [];
  const isLoading = tableQueryResult?.isLoading ?? false;

  // Filtered Codes
  const filteredCodes = allCodes.filter((item) => {
    // Status filter
    if (statusFilter === 'available' && item.is_redeemed) return false;
    if (statusFilter === 'redeemed' && !item.is_redeemed) return false;

    // Channel filter
    if (channelFilter !== 'all' && item.channel !== channelFilter) return false;

    // Search keyword
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase().trim();
    const codeMatch = item.code?.toLowerCase().includes(kw);
    const merchantMatch = item.expand?.redeemed_by?.name?.toLowerCase().includes(kw);
    const merchantIdMatch = item.redeemed_by?.toLowerCase().includes(kw);
    return codeMatch || merchantMatch || merchantIdMatch;
  });

  // KPI Calculations
  const totalCount = allCodes.length;
  const availableCount = allCodes.filter((c) => !c.is_redeemed).length;
  const redeemedCount = allCodes.filter((c) => c.is_redeemed).length;
  const redemptionRate = totalCount > 0 ? Math.round((redeemedCount / totalCount) * 100) : 0;
  const totalQuotaProvisioned = redeemedCount * 500;

  // Copy Single Code Helper
  const handleCopy = (text: string, label = 'Code') => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard!`);
  };

  // Open Generate Modal
  const handleOpenGenerateModal = () => {
    generateForm.resetFields();
    generateForm.setFieldsValue({
      prefix: 'RSV',
      quantity: 10,
      plan: 'stand_bundle',
      quota: 500,
      channel: 'tiktok_shop',
    });
    setIsGenerateModalOpen(true);
  };

  // Execute Batch Generation
  const handleGenerateSubmit = async (values: any) => {
    setIsGenerating(true);
    const qty = Math.min(Math.max(Number(values.quantity) || 1, 1), 100);
    const prefix = (values.prefix || 'RSV').trim().toUpperCase();
    const plan = values.plan || 'stand_bundle';
    const quota = Number(values.quota) || 500;
    const channel = values.channel || 'manual';

    const generatedCodesSet = new Set<string>();
    // Collect existing codes to prevent collision in-batch
    allCodes.forEach((c) => generatedCodesSet.add(c.code));

    const newCodesToCreate: string[] = [];
    while (newCodesToCreate.length < qty) {
      const code = generateActivationCodeString(prefix);
      if (!generatedCodesSet.has(code)) {
        generatedCodesSet.add(code);
        newCodesToCreate.push(code);
      }
    }

    let successCount = 0;
    let failCount = 0;

    for (const code of newCodesToCreate) {
      try {
        await pb.collection('activation_codes').create({
          code,
          plan,
          quota,
          is_redeemed: false,
          channel,
        });
        successCount++;
      } catch (err: any) {
        console.error(`Failed to create code ${code}:`, err);
        failCount++;
      }
    }

    setIsGenerating(false);
    setIsGenerateModalOpen(false);

    if (successCount > 0) {
      message.success(`Successfully generated ${successCount} Risev activation codes!`);
      tableQueryResult.refetch();
    }
    if (failCount > 0) {
      message.warning(`${failCount} codes failed to generate. Check console for details.`);
    }
  };

  // Delete Code Record
  const handleDeleteCode = (id: string, codeStr: string) => {
    deleteCodeRecord({
      resource: 'activation_codes',
      id,
      successNotification: () => {
        message.success(`Code ${codeStr} revoked successfully`);
        tableQueryResult.refetch();
        return false;
      },
      errorNotification: (err: any) => {
        message.error(err?.message || 'Failed to delete code');
        return false;
      },
    });
  };

  // CSV Export of filtered or unredeemed codes
  const handleExportCSV = () => {
    if (filteredCodes.length === 0) {
      message.warning('No codes to export');
      return;
    }

    const headers = ['Code', 'Plan', 'Customer Quota', 'Channel', 'Status', 'Redeemed By Store', 'Redeemed At', 'Created Date', 'Activation URL'];
    const rows = filteredCodes.map((c) => [
      c.code,
      c.plan,
      c.quota || 500,
      c.channel || 'manual',
      c.is_redeemed ? 'REDEEMED' : 'AVAILABLE',
      c.expand?.redeemed_by?.name ? `"${c.expand.redeemed_by.name.replace(/"/g, '""')}"` : c.redeemed_by || '',
      c.redeemed_at ? dayjs(c.redeemed_at).format('YYYY-MM-DD HH:mm') : '',
      dayjs(c.created).format('YYYY-MM-DD HH:mm'),
      `https://risev.app/activate?code=${c.code}`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `risev_activation_codes_${dayjs().format('YYYYMMDD_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success(`Exported ${filteredCodes.length} codes to CSV`);
  };

  // Open Print Modal for Unredeemed Codes or Current Selection
  const handleOpenPrintModal = (specificCode?: ActivationCodeRecord) => {
    if (specificCode) {
      setPrintCodes([specificCode]);
    } else {
      // Default: print all unredeemed in current view (up to 40)
      const unredeemed = filteredCodes.filter((c) => !c.is_redeemed).slice(0, 40);
      if (unredeemed.length === 0) {
        message.warning('No available unredeemed codes found to print.');
        return;
      }
      setPrintCodes(unredeemed);
    }
    setIsPrintModalOpen(true);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const getChannelTag = (channel?: string) => {
    switch (channel) {
      case 'tiktok_shop':
        return <Tag color="#000000" className="font-bold border-none">TikTok Shop</Tag>;
      case 'shopee':
        return <Tag color="#ee4d2d" className="font-bold border-none">Shopee</Tag>;
      case 'marketplace':
        return <Tag color="#006d37" className="font-bold border-none">App Marketplace</Tag>;
      case 'manual':
      default:
        return <Tag color="blue" className="font-bold border-none">Manual / Direct</Tag>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Top KPI Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#85af9b] text-xs font-bold mb-1">
            <span>Total Generated</span>
            <QrcodeOutlined className="text-base text-[#006d37] dark:text-[#6bfe9c]" />
          </div>
          <div className="text-2xl font-black text-on-surface dark:text-white">{totalCount}</div>
          <span className="text-[10px] text-slate-400 font-medium mt-1">Lifetime codes created</span>
        </div>

        <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#85af9b] text-xs font-bold mb-1">
            <span>Available Stock</span>
            <ClockCircleOutlined className="text-base text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-[#6bfe9c]">{availableCount}</div>
          <span className="text-[10px] text-slate-400 font-medium mt-1">Ready for packing / dispatch</span>
        </div>

        <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#85af9b] text-xs font-bold mb-1">
            <span>Redeemed Stands</span>
            <CheckCircleOutlined className="text-base text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{redeemedCount}</div>
          <span className="text-[10px] text-slate-400 font-medium mt-1">{redemptionRate}% activation rate</span>
        </div>

        <div className="bg-[#f8faf9] dark:bg-[#001f15] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#85af9b] text-xs font-bold mb-1">
            <span>Capacity Activated</span>
            <ShopOutlined className="text-base text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{totalQuotaProvisioned.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400 font-medium mt-1">Total customer quota unlocked</span>
        </div>
      </div>

      {/* 2. Controls & Actions Bar */}
      <div className="bg-white dark:bg-[#002518] p-4 rounded-2xl border border-surface-variant dark:border-[#004d30] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Left: Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Segment */}
          <div className="flex items-center bg-slate-100 dark:bg-[#001f15] p-1 rounded-xl">
            {(
              [
                { label: 'All', value: 'all' },
                { label: `Available (${availableCount})`, value: 'available' },
                { label: `Redeemed (${redeemedCount})`, value: 'redeemed' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer transition-all ${
                  statusFilter === opt.value
                    ? 'bg-[#006d37] text-white shadow-sm'
                    : 'bg-transparent text-slate-600 dark:text-[#85af9b] hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Channel Select */}
          <Select
            value={channelFilter}
            onChange={setChannelFilter}
            className="w-36 rounded-xl"
            options={[
              { label: 'All Channels', value: 'all' },
              { label: 'TikTok Shop', value: 'tiktok_shop' },
              { label: 'Shopee', value: 'shopee' },
              { label: 'App Marketplace', value: 'marketplace' },
              { label: 'Manual / Direct', value: 'manual' },
            ]}
          />

          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search code or merchant..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
              className="rounded-xl h-9 border-slate-200 dark:border-[#004d30]"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            className="rounded-xl font-bold text-xs h-9"
          >
            Export CSV
          </Button>

          <Button
            icon={<PrinterOutlined />}
            onClick={() => handleOpenPrintModal()}
            className="rounded-xl font-bold text-xs h-9"
          >
            Print Cards ({printCodes.length > 0 ? printCodes.length : Math.min(availableCount, 40)})
          </Button>

          <button
            onClick={handleOpenGenerateModal}
            className="inline-flex items-center gap-1.5 bg-[#006d37] hover:bg-[#00542a] text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md border-none cursor-pointer"
          >
            <PlusOutlined />
            <span>Generate Codes</span>
          </button>
        </div>
      </div>

      {/* 3. Codes Table */}
      <div className="bg-white dark:bg-[#002518] rounded-2xl border border-surface-variant dark:border-[#004d30] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
            <QrcodeOutlined className="text-4xl text-slate-300 mb-1" />
            <p className="text-sm font-bold text-on-surface dark:text-white">No activation codes found.</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Click &quot;Generate Codes&quot; above to create a new batch of Risev Stand activation passes.
            </p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenGenerateModal}
              className="mt-2 rounded-xl font-bold bg-[#006d37] border-none"
            >
              Generate First Batch
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-[#001f15]/50">
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#85af9b]">
                    Activation Code
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#85af9b]">
                    Channel
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#85af9b]">
                    Plan & Quota
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#85af9b]">
                    Status
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#85af9b]">
                    Redeemed By
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#85af9b]">
                    Created
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-[#85af9b] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-sans">
                {filteredCodes.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Code string with copy button */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-[#006d37] dark:text-[#6bfe9c] bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 px-2.5 py-1 rounded-lg border border-[#006d37]/20 select-all">
                            {item.code}
                          </span>
                          <Tooltip title="Copy Code">
                            <button
                              onClick={() => handleCopy(item.code, 'Activation Code')}
                              className="text-slate-400 hover:text-[#006d37] p-1 rounded transition-colors bg-transparent border-none cursor-pointer"
                            >
                              <CopyOutlined className="text-xs" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-3 px-4">
                        {getChannelTag(item.channel)}
                      </td>

                      {/* Plan & Quota */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-on-surface dark:text-white capitalize">
                            {item.plan?.replace('_', ' ') || 'Stand Bundle'}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-[#85af9b] font-medium">
                            {item.quota || 500} Capacity (Lifetime)
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {item.is_redeemed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <CheckCircleOutlined className="text-[10px]" />
                            REDEEMED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            AVAILABLE
                          </span>
                        )}
                      </td>

                      {/* Redeemed By */}
                      <td className="py-3 px-4">
                        {item.is_redeemed ? (
                          <div className="flex flex-col">
                            {item.expand?.redeemed_by ? (
                              <Link
                                to={`/merchants/${item.redeemed_by}`}
                                className="text-xs font-bold text-[#006d37] dark:text-[#6bfe9c] hover:underline"
                              >
                                {item.expand.redeemed_by.name}
                              </Link>
                            ) : (
                              <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                                ID: {item.redeemed_by}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {item.redeemed_at ? dayjs(item.redeemed_at).format('MMM D, YYYY h:mm A') : 'Redeemed'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">Unclaimed</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-xs text-slate-500 font-medium">
                        {dayjs(item.created).format('YYYY-MM-DD')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Tooltip title="Print Packaging Slip / QR Card">
                            <button
                              onClick={() => handleOpenPrintModal(item)}
                              className="text-slate-600 dark:text-slate-300 hover:text-[#006d37] p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-all bg-transparent border-none cursor-pointer"
                            >
                              <PrinterOutlined className="text-sm" />
                            </button>
                          </Tooltip>

                          {!item.is_redeemed && (
                            <Popconfirm
                              title="Revoke Activation Code?"
                              description={`Are you sure you want to delete ${item.code}?`}
                              okText="Revoke"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true }}
                              onConfirm={() => handleDeleteCode(item.id, item.code)}
                            >
                              <button className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all bg-transparent border-none cursor-pointer">
                                <DeleteOutlined className="text-sm" />
                              </button>
                            </Popconfirm>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Generate Batch Codes Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pt-1">
            <div className="w-8 h-8 rounded-xl bg-[#006d37]/10 text-[#006d37] flex items-center justify-center font-black text-sm shrink-0">
              <QrcodeOutlined />
            </div>
            <div>
              <h3 className="font-black text-base text-on-surface dark:text-white mb-0 leading-tight">
                Generate Risev Activation Codes
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#85af9b] font-normal">
                Create unique stand activation codes for merchant hardware fulfillment
              </p>
            </div>
          </div>
        }
        open={isGenerateModalOpen}
        onCancel={() => setIsGenerateModalOpen(false)}
        footer={null}
        destroyOnHidden
        centered
        width={480}
      >
        <Form
          form={generateForm}
          layout="vertical"
          onFinish={handleGenerateSubmit}
          requiredMark={false}
          className="pt-3 flex flex-col gap-1"
        >
          {/* Prefix */}
          <Form.Item
            name="prefix"
            label={<span className="text-[10px] font-black uppercase text-[#006d37] tracking-wider">Code Prefix</span>}
            rules={[{ required: true, message: 'Prefix is required' }]}
            initialValue="RSV"
          >
            <Input
              placeholder="e.g. RSV"
              className="rounded-xl h-10 font-mono font-bold uppercase border-slate-200"
              maxLength={8}
            />
          </Form.Item>

          {/* Batch Quantity */}
          <Form.Item
            name="quantity"
            label={<span className="text-[10px] font-black uppercase text-[#006d37] tracking-wider">Batch Quantity (1 - 100)</span>}
            rules={[{ required: true, message: 'Please select quantity' }]}
            initialValue={10}
          >
            <Select className="rounded-xl h-10">
              <Select.Option value={1}>1 Code</Select.Option>
              <Select.Option value={5}>5 Codes</Select.Option>
              <Select.Option value={10}>10 Codes (Standard Batch)</Select.Option>
              <Select.Option value={25}>25 Codes</Select.Option>
              <Select.Option value={50}>50 Codes</Select.Option>
              <Select.Option value={100}>100 Codes (Full Box)</Select.Option>
            </Select>
          </Form.Item>

          {/* Channel */}
          <Form.Item
            name="channel"
            label={<span className="text-[10px] font-black uppercase text-[#006d37] tracking-wider">Distribution Channel</span>}
            rules={[{ required: true }]}
            initialValue="tiktok_shop"
          >
            <Select className="rounded-xl h-10">
              <Select.Option value="tiktok_shop">TikTok Shop</Select.Option>
              <Select.Option value="shopee">Shopee Store</Select.Option>
              <Select.Option value="marketplace">Risev App Marketplace</Select.Option>
              <Select.Option value="manual">Direct / Manual Agent Sales</Select.Option>
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            {/* Plan */}
            <Form.Item
              name="plan"
              label={<span className="text-[10px] font-black uppercase text-[#006d37] tracking-wider">Plan Tier</span>}
              rules={[{ required: true }]}
              initialValue="stand_bundle"
            >
              <Select className="rounded-xl h-10">
                <Select.Option value="stand_bundle">Stand Bundle (Lifetime)</Select.Option>
                <Select.Option value="starter">Starter Plan</Select.Option>
                <Select.Option value="pro">Pro Plan</Select.Option>
              </Select>
            </Form.Item>

            {/* Quota */}
            <Form.Item
              name="quota"
              label={<span className="text-[10px] font-black uppercase text-[#006d37] tracking-wider">Capacity Quota</span>}
              rules={[{ required: true }]}
              initialValue={500}
            >
              <Select className="rounded-xl h-10">
                <Select.Option value={500}>500 Members</Select.Option>
                <Select.Option value={1000}>1,000 Members</Select.Option>
                <Select.Option value={2500}>2,500 Members</Select.Option>
                <Select.Option value={5000}>5,000 Members</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* Preview Box */}
          <div className="p-3.5 rounded-2xl bg-[#002d1e] text-white border border-[#004d30] flex flex-col gap-1.5 my-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6bfe9c]">FORMAT SAMPLE</span>
            <div className="font-mono text-sm font-bold text-white tracking-wider">
              RSV-XXXX-XXXX
            </div>
            <span className="text-[11px] text-[#85af9b]">
              Includes QR code link to <code>risev.app/activate</code> with 500 capacity.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/10 mt-2">
            <Button onClick={() => setIsGenerateModalOpen(false)} className="rounded-xl font-bold">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isGenerating}
              icon={<PlusOutlined />}
              className="rounded-xl font-black bg-[#006d37] border-none shadow-md"
            >
              Generate Codes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 5. Print Modal (Printable Card Inserts for Stand Packaging) */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-6 print:hidden">
            <div className="flex items-center gap-2">
              <PrinterOutlined className="text-[#006d37] text-lg" />
              <h3 className="font-black text-base text-on-surface mb-0">
                Print Stand Activation Inserts ({printCodes.length} {printCodes.length === 1 ? 'Card' : 'Cards'})
              </h3>
            </div>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handleTriggerPrint}
              className="rounded-xl font-bold bg-[#006d37] border-none"
            >
              Print Now
            </Button>
          </div>
        }
        open={isPrintModalOpen}
        onCancel={() => setIsPrintModalOpen(false)}
        footer={null}
        width={800}
        destroyOnHidden
        centered
      >
        <div className="max-h-[70vh] overflow-y-auto p-2">
          <p className="text-xs text-slate-500 mb-4 print:hidden">
            Slip these cards inside each NFC stand box. When printed, each card displays the QR code, activation code, and simple 3-step merchant instructions.
          </p>

          {/* Grid of Printable Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
            {printCodes.map((item) => {
              const activateUrl = `https://risev.app/activate?code=${item.code}`;
              return (
                <div
                  key={item.id}
                  className="bg-white border-2 border-dashed border-[#006d37]/40 rounded-2xl p-5 flex flex-col items-center text-center relative shadow-sm page-break-inside-avoid print:border-solid print:border-black/30"
                  style={{ minHeight: '260px' }}
                >
                  {/* Risev Header */}
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-base text-[#006d37] tracking-tight">RISEV</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        NFC STAND
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 capitalize">
                      {item.channel?.replace('_', ' ') || 'Official'}
                    </span>
                  </div>

                  {/* QR Code & Code */}
                  <div className="flex items-center gap-4 my-2 text-left w-full bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200 shrink-0 shadow-sm">
                      <QRCode
                        value={activateUrl}
                        size={84}
                        bordered={false}
                        color="#002d1e"
                      />
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        ACTIVATION CODE
                      </span>
                      <span className="font-mono text-sm font-black text-[#006d37] tracking-wider my-0.5 select-all">
                        {item.code}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        +500 Customer Quota Unlocked
                      </span>
                    </div>
                  </div>

                  {/* 3 Step Instructions */}
                  <div className="text-left w-full mt-2 text-[10px] text-slate-600 flex flex-col gap-1 border-t border-slate-100 pt-2 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#006d37] text-white flex items-center justify-center text-[8px] font-black shrink-0">1</span>
                      <span>Scan QR code above or visit <strong>risev.app/activate</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#006d37] text-white flex items-center justify-center text-[8px] font-black shrink-0">2</span>
                      <span>Log in / create your Risev merchant store account</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#006d37] text-white flex items-center justify-center text-[8px] font-black shrink-0">3</span>
                      <span>Place your Stand at the counter &amp; collect members!</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};
