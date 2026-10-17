import React, { useState, useEffect } from 'react';
import {
  Modal,
  Tabs,
  Form,
  Radio,
  InputNumber,
  Select,
  Input,
  Button,
  Progress,
  message,
  Alert,
  Space,
  Tag,
} from 'antd';
import {
  PrinterOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { pb } from '../../../lib/pocketbase';
import {
  generateMiniNfc8UpPdf,
  downloadPdfBlob,
} from '../../../lib/miniNfcPdfGenerator';
import type { MiniNfcCardItem } from '../../../lib/miniNfcPdfGenerator';
import type { ActivationCodeRecord } from './ActivationCodesTab';
import { generateActivationCodeString } from './ActivationCodesTab';

export interface MiniNfcPrintModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedCodes?: ActivationCodeRecord[];
  onClearSelection?: () => void;
}

export const MiniNfcPrintModal: React.FC<MiniNfcPrintModalProps> = ({
  open,
  onClose,
  onSuccess,
  selectedCodes = [],
  onClearSelection,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'selected'>('generate');
  const [form] = Form.useForm();

  // Quantity State
  const [cardQuantity, setCardQuantity] = useState<number>(16); // 2 sheets default
  const [quantityPreset, setQuantityPreset] = useState<'8' | '16' | '40' | '80' | 'custom'>('16');

  // Quota State
  const [quotaPreset, setQuotaPreset] = useState<'500' | '1000' | '3000' | 'custom'>('500');
  const [customQuota, setCustomQuota] = useState<number>(500);

  // QR Content Format
  const [showSerialText, setShowSerialText] = useState<boolean>(true);

  // Generation & Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatusText, setProgressStatusText] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (selectedCodes.length > 0) {
        setActiveTab('selected');
      } else {
        setActiveTab('generate');
      }
      form.setFieldsValue({
        plan: 'stand_bundle',
        channel: 'manual',
        remark: `Mini NFC Batch ${dayjs().format('YYYY-MM-DD')} (Factory Print)`,
      });
      setProgressPercent(0);
      setProgressStatusText('');
    }
  }, [open, selectedCodes.length, form]);

  const effectiveQuota = quotaPreset === 'custom'
    ? (Number(customQuota) > 0 ? Number(customQuota) : 500)
    : Number(quotaPreset);

  const calculatedSheets = Math.ceil(cardQuantity / 8);

  const handlePresetQuantityChange = (val: '8' | '16' | '40' | '80' | 'custom') => {
    setQuantityPreset(val);
    if (val !== 'custom') {
      setCardQuantity(parseInt(val, 10));
    }
  };

  // Generate New Batch & Download PDF
  const handleGenerateBatch = async () => {
    try {
      const values = await form.validateFields();
      const plan = values.plan || 'stand_bundle';
      const channel = values.channel || 'manual';
      const remark = values.remark || `Mini NFC Batch ${dayjs().format('YYYY-MM-DD')} (Factory Print)`;

      setIsProcessing(true);
      setProgressPercent(5);
      setProgressStatusText(`Creating ${cardQuantity} activation code records in database...`);

      const generatedItems: MiniNfcCardItem[] = [];
      let successCount = 0;
      let failCount = 0;

      // 1. Batch create records in PocketBase
      for (let i = 0; i < cardQuantity; i++) {
        const code = generateActivationCodeString('RSV');
        try {
          await pb.collection('activation_codes').create({
            code,
            plan,
            quota: effectiveQuota,
            is_redeemed: false,
            channel,
            remark,
          });
          generatedItems.push({
            code,
            quota: effectiveQuota,
            plan,
          });
          successCount++;
        } catch (err: any) {
          console.error(`Failed to create code ${code}:`, err);
          failCount++;
        }

        const pct = Math.round(5 + ((i + 1) / cardQuantity) * 45);
        setProgressPercent(pct);
      }

      if (generatedItems.length === 0) {
        throw new Error('Failed to create activation codes in database. Please check connection.');
      }

      // 2. Generate Prepress 8-Up Vector PDF
      setProgressStatusText(`Imprinting ${generatedItems.length} QR codes onto 8-Up A4 template...`);
      setProgressPercent(55);

      const pdfBytes = await generateMiniNfc8UpPdf({
        items: generatedItems,
        showSerialText,
        onProgress: (current, total) => {
          const pct = Math.round(55 + (current / total) * 40);
          setProgressPercent(pct);
          setProgressStatusText(`Rendering card ${current} of ${total} (${Math.ceil(current / 8)} sheets)...`);
        },
      });

      setProgressPercent(100);
      setProgressStatusText('PDF Generation Complete! Starting download...');

      // 3. Trigger Download
      const filename = `Risev_Mini_NFC_A4_8up_${dayjs().format('YYYYMMDD_HHmm')}_${generatedItems.length}cards.pdf`;
      downloadPdfBlob(pdfBytes, filename);

      message.success(`Successfully generated ${successCount} Mini NFC cards (${calculatedSheets} A4 sheets)!`);
      if (failCount > 0) {
        message.warning(`${failCount} codes could not be created in database.`);
      }

      onSuccess();
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 800);
    } catch (err: any) {
      setIsProcessing(false);
      message.error(err?.message || 'Failed to generate Mini NFC batch');
    }
  };

  // Export Selected Unredeemed Codes from Table
  const handleExportSelected = async () => {
    if (!selectedCodes || selectedCodes.length === 0) {
      message.warning('No cards selected to export.');
      return;
    }

    try {
      setIsProcessing(true);
      setProgressPercent(15);
      setProgressStatusText(`Preparing ${selectedCodes.length} selected codes for imposition...`);

      const itemsToExport: MiniNfcCardItem[] = selectedCodes.map((c) => ({
        code: c.code,
        quota: c.quota || 500,
        plan: c.plan || 'stand_bundle',
      }));

      const pdfBytes = await generateMiniNfc8UpPdf({
        items: itemsToExport,
        showSerialText,
        onProgress: (current, total) => {
          const pct = Math.round(15 + (current / total) * 80);
          setProgressPercent(pct);
          setProgressStatusText(`Rendering card ${current} of ${total}...`);
        },
      });

      setProgressPercent(100);
      setProgressStatusText('Download starting...');

      const filename = `Risev_Mini_NFC_A4_8up_Selected_${dayjs().format('YYYYMMDD_HHmm')}_${itemsToExport.length}cards.pdf`;
      downloadPdfBlob(pdfBytes, filename);

      message.success(`Exported ${itemsToExport.length} selected cards (${Math.ceil(itemsToExport.length / 8)} sheets) to PDF!`);

      if (onClearSelection) {
        onClearSelection();
      }

      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 600);
    } catch (err: any) {
      setIsProcessing(false);
      message.error(err?.message || 'Failed to export selected codes to PDF');
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-lg">
          <FilePdfOutlined className="text-emerald-700 text-xl" />
          <span>Mini NFC Card 8-Up Manufacturer PDF Generator</span>
          <Tag color="gold" className="ml-2 font-mono font-bold">A4 • 85.5 × 54 mm</Tag>
        </div>
      }
      open={open}
      onCancel={isProcessing ? undefined : onClose}
      width={680}
      footer={null}
      destroyOnClose
    >
      <div className="py-2">
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          items={[
            {
              key: 'generate',
              label: (
                <span className="flex items-center gap-1.5 font-semibold">
                  <ThunderboltOutlined /> Generate New Batch
                </span>
              ),
              children: (
                <div className="space-y-4 pt-1">
                  {/* Card Quantity Selection */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-800">
                        Total Cards to Print (Multiples of 8 per Sheet):
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        📄 {calculatedSheets} A4 {calculatedSheets === 1 ? 'Sheet' : 'Sheets'} ({cardQuantity} Cards)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {(['8', '16', '40', '80'] as const).map((preset) => {
                        const count = parseInt(preset, 10);
                        const sheets = count / 8;
                        const isSelected = quantityPreset === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handlePresetQuantityChange(preset)}
                            disabled={isProcessing}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'bg-white text-slate-700 border border-slate-300 hover:border-emerald-600'
                            }`}
                          >
                            {count} Cards ({sheets} {sheets === 1 ? 'Sheet' : 'Sheets'})
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => handlePresetQuantityChange('custom')}
                        disabled={isProcessing}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          quantityPreset === 'custom'
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-300 hover:border-emerald-600'
                        }`}
                      >
                        Custom Quantity
                      </button>
                    </div>

                    {quantityPreset === 'custom' && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-200">
                        <span className="text-xs font-medium text-slate-600">Enter Number of Cards:</span>
                        <InputNumber
                          min={1}
                          max={800}
                          value={cardQuantity}
                          onChange={(val) => setCardQuantity(Number(val) || 8)}
                          disabled={isProcessing}
                          className="w-32"
                        />
                        <span className="text-xs text-slate-500">
                          (= {Math.ceil(cardQuantity / 8)} A4 print sheets)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Customer Quota Configuration */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-800">
                        Customer Database Capacity (Quota per Card):
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {effectiveQuota.toLocaleString()} Customers
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {(['500', '1000', '3000'] as const).map((q) => {
                        const isSelected = quotaPreset === q;
                        return (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setQuotaPreset(q)}
                            disabled={isProcessing}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'bg-white text-slate-700 border border-slate-300 hover:border-emerald-600'
                            }`}
                          >
                            {parseInt(q, 10).toLocaleString()} Customers {q === '500' ? '(Standard)' : ''}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setQuotaPreset('custom')}
                        disabled={isProcessing}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          quotaPreset === 'custom'
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-300 hover:border-emerald-600'
                        }`}
                      >
                        Custom Quota
                      </button>
                    </div>

                    {quotaPreset === 'custom' && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-200">
                        <span className="text-xs font-medium text-slate-600">Custom Quota per Card:</span>
                        <InputNumber
                          min={50}
                          max={50000}
                          step={100}
                          value={customQuota}
                          onChange={(val) => setCustomQuota(Number(val) || 500)}
                          disabled={isProcessing}
                          className="w-36"
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                        />
                        <span className="text-xs text-slate-500">active customers</span>
                      </div>
                    )}
                  </div>

                  {/* Form Details */}
                  <Form form={form} layout="vertical">
                    <div className="grid grid-cols-2 gap-3">
                      <Form.Item name="plan" label={<span className="text-xs font-bold text-slate-700">Subscription Plan</span>}>
                        <Select disabled={isProcessing}>
                          <Select.Option value="stand_bundle">Stand / Mini Card Bundle (Lifetime)</Select.Option>
                          <Select.Option value="starter">Starter Plan</Select.Option>
                          <Select.Option value="pro">Pro Plan</Select.Option>
                          <Select.Option value="business">Business Plan</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item name="channel" label={<span className="text-xs font-bold text-slate-700">Distribution Channel</span>}>
                        <Select disabled={isProcessing}>
                          <Select.Option value="manual">Manual / Factory Print Stock</Select.Option>
                          <Select.Option value="shopee">Shopee Official</Select.Option>
                          <Select.Option value="tiktok_shop">TikTok Shop</Select.Option>
                          <Select.Option value="marketplace">General Marketplace</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>

                    <Form.Item name="remark" label={<span className="text-xs font-bold text-slate-700">Batch Remark / Production Label</span>}>
                      <Input disabled={isProcessing} placeholder="e.g. Factory Run #12 (Batch 2026-10)" />
                    </Form.Item>
                  </Form>

                  {/* QR Printing Options */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-800 mb-2">QR Code Printing Format in White Box:</div>
                    <Radio.Group
                      value={showSerialText}
                      onChange={(e) => setShowSerialText(e.target.value)}
                      disabled={isProcessing}
                      className="space-y-1.5"
                    >
                      <Radio value={true}>
                        <span className="text-xs font-semibold text-slate-800">
                          QR Code + Serial Code Text <Tag color="green" className="ml-1 text-[10px]">Recommended</Tag>
                        </span>
                        <div className="text-[11px] text-slate-500 pl-6">
                          Displays the QR code with monospace text (e.g. <span className="font-mono text-emerald-800 font-bold">RSV-8K2P-9M4X</span>) printed cleanly underneath.
                        </div>
                      </Radio>
                      <Radio value={false}>
                        <span className="text-xs font-semibold text-slate-800">
                          Pure QR Code Only
                        </span>
                        <div className="text-[11px] text-slate-500 pl-6">
                          Fills the white box squarely with the QR code only (no human-readable text).
                        </div>
                      </Radio>
                    </Radio.Group>
                  </div>

                  {/* Progress Indicator */}
                  {isProcessing && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
                        <span>{progressStatusText}</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <Progress percent={progressPercent} status="active" strokeColor="#006d37" showInfo={false} />
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="primary"
                      size="large"
                      icon={<DownloadOutlined />}
                      loading={isProcessing}
                      onClick={handleGenerateBatch}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold h-11 text-sm shadow-md"
                    >
                      Generate {cardQuantity} Cards & Download 8-Up PDF ({calculatedSheets} {calculatedSheets === 1 ? 'Sheet' : 'Sheets'})
                    </Button>
                  </div>
                </div>
              ),
            },
            {
              key: 'selected',
              label: (
                <span className="flex items-center gap-1.5 font-semibold">
                  <PrinterOutlined /> Export Selected ({selectedCodes.length})
                </span>
              ),
              children: (
                <div className="space-y-4 pt-1">
                  {selectedCodes.length === 0 ? (
                    <Alert
                      type="info"
                      showIcon
                      message="No Cards Selected in Table"
                      description="To export existing unredeemed codes, select one or more rows using the table checkboxes, then switch back to this tab."
                    />
                  ) : (
                    <>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm font-bold text-slate-800">
                              Selected Unredeemed Codes:
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {selectedCodes.length} codes selected &bull; Will generate{' '}
                              <span className="font-bold text-emerald-800">
                                {Math.ceil(selectedCodes.length / 8)} A4 {Math.ceil(selectedCodes.length / 8) === 1 ? 'Sheet' : 'Sheets'}
                              </span>
                            </div>
                          </div>
                          {onClearSelection && (
                            <Button size="small" onClick={onClearSelection} disabled={isProcessing}>
                              Clear Selection
                            </Button>
                          )}
                        </div>

                        {/* Preview Chips */}
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto mt-3 p-2 bg-white rounded-lg border border-slate-200">
                          {selectedCodes.map((c) => (
                            <Tag key={c.id} className="font-mono text-xs font-semibold py-0.5">
                              {c.code}
                            </Tag>
                          ))}
                        </div>
                      </div>

                      {/* QR Printing Options */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-800 mb-2">QR Code Printing Format:</div>
                        <Radio.Group
                          value={showSerialText}
                          onChange={(e) => setShowSerialText(e.target.value)}
                          disabled={isProcessing}
                          className="space-y-1.5"
                        >
                          <Radio value={true}>
                            <span className="text-xs font-semibold text-slate-800">
                              QR Code + Serial Code Text
                            </span>
                          </Radio>
                          <Radio value={false}>
                            <span className="text-xs font-semibold text-slate-800">
                              Pure QR Code Only
                            </span>
                          </Radio>
                        </Radio.Group>
                      </div>

                      {/* Progress Indicator */}
                      {isProcessing && (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
                            <span>{progressStatusText}</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <Progress percent={progressPercent} status="active" strokeColor="#006d37" showInfo={false} />
                        </div>
                      )}

                      {/* Export Button */}
                      <div className="pt-2">
                        <Button
                          type="primary"
                          size="large"
                          icon={<DownloadOutlined />}
                          loading={isProcessing}
                          onClick={handleExportSelected}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold h-11 text-sm shadow-md"
                        >
                          Export {selectedCodes.length} Selected Cards to 8-Up PDF ({Math.ceil(selectedCodes.length / 8)} Sheets)
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
};
