import React from 'react';
import { useForm } from '@refinedev/antd';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

export const SystemSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { onFinish, formProps, queryResult, formLoading } = useForm<any>({
    resource: 'system_settings',
    action: 'edit',
    id: 'settingsglobal',
    redirect: false, // stay on the same settings page after submit
    onMutationSuccess: () => {
      message.success('System settings updated successfully!');
    },
  });

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[800px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            RISEV GLOBAL CONFIGURATION
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            System Settings
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md font-medium leading-relaxed">
            Configure official platform credentials, official WhatsApp Business accounts, and notification gateways.
          </p>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[800px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            <Form
              {...formProps}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="flex flex-col gap-5"
            >
              {/* WhatsApp Config Header Banner */}
              <div className="bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 p-4 rounded-2xl border border-[#006d37]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#006d37] text-[#6bfe9c] flex items-center justify-center font-black text-lg shadow-sm">
                    💬
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-on-surface dark:text-white leading-tight">Official WhatsApp Settings</h4>
                    <p className="text-[10px] text-on-surface-variant dark:text-[#85af9b] font-medium">Meta Cloud API credentials for platform-level notifications</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-4">
                
                <Form.Item
                  label={<span className="text-xs font-black text-on-surface dark:text-white uppercase tracking-wider">Official Phone Number</span>}
                  name="official_phone_number"
                  rules={[{ required: true, message: 'Please input the official phone number!' }]}
                >
                  <Input 
                    placeholder="e.g. +60111222333" 
                    className="h-12 rounded-2xl border-surface-variant dark:border-[#004d30] hover:border-[#006d37] focus:border-[#006d37] dark:bg-[#001f15] dark:text-white"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-black text-on-surface dark:text-white uppercase tracking-wider">Meta Phone Number ID</span>}
                  name="official_phone_number_id"
                  rules={[{ required: true, message: 'Please input the Meta phone number ID!' }]}
                  help={<span className="text-[10px] text-slate-400">Available in your Meta Developer App → WhatsApp → API Setup</span>}
                >
                  <Input 
                    placeholder="e.g. 1092873491823" 
                    className="h-12 rounded-2xl border-surface-variant dark:border-[#004d30] hover:border-[#006d37] focus:border-[#006d37] dark:bg-[#001f15] dark:text-white"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-black text-on-surface dark:text-white uppercase tracking-wider">Meta WABA ID (WhatsApp Business Account ID)</span>}
                  name="official_waba_id"
                  rules={[{ required: true, message: 'Please input the Meta WABA ID!' }]}
                >
                  <Input 
                    placeholder="e.g. 1092873491824" 
                    className="h-12 rounded-2xl border-surface-variant dark:border-[#004d30] hover:border-[#006d37] focus:border-[#006d37] dark:bg-[#001f15] dark:text-white"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-black text-on-surface dark:text-white uppercase tracking-wider">Meta System User Access Token</span>}
                  name="official_access_token"
                  rules={[{ required: true, message: 'Please input the access token!' }]}
                  help={<span className="text-[10px] text-slate-400">A permanent system user access token generated in Meta Business Suite</span>}
                >
                  <Input.TextArea 
                    rows={4}
                    placeholder="EAAB..." 
                    className="rounded-2xl border-surface-variant dark:border-[#004d30] hover:border-[#006d37] focus:border-[#006d37] dark:bg-[#001f15] dark:text-white p-3 font-mono text-xs"
                  />
                </Form.Item>

              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t border-surface-variant dark:border-white/10 mt-2">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="h-12 rounded-full border border-surface-variant dark:border-[#004d30] hover:border-[#006d37] dark:bg-transparent dark:text-white text-xs font-black px-6 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={formLoading}
                  className="h-12 rounded-full bg-[#006d37] hover:bg-[#004d27] text-white border-none text-xs font-black px-8 shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
                >
                  Save Settings
                </Button>
              </div>

            </Form>
            
          </div>

        </div>
      </div>

    </div>
  );
};
