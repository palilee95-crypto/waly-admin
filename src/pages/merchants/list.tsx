import React, { useState } from 'react';
import { useTable, useUpdate } from '@refinedev/core';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';

export const MerchantList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rejectingMerchantId, setRejectingMerchantId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Fetch merchants from pocketbase
  const { tableQueryResult } = useTable<any>({
    resource: 'merchants',
    pagination: { pageSize: 50 },
    filters: {
      permanent: activeTab === 'pending' ? [{ field: 'status', operator: 'eq', value: 'pending' }] : [],
    },
  });

  const { mutate: updateMerchant } = useUpdate();

  const handleApprove = (id: string, name: string) => {
    Modal.confirm({
      title: 'Approve Merchant Application',
      content: `Are you sure you want to approve ${name}? This will verify the store and activate loyalty features.`,
      okText: 'Approve Merchant',
      cancelText: 'Cancel',
      okButtonProps: { style: { backgroundColor: '#006d37' } },
      onOk: () => {
        updateMerchant({
          resource: 'merchants',
          id,
          values: { status: 'active', is_verified: true },
          successNotification: () => {
            message.success(`${name} approved successfully`);
            return {
              message: 'Merchant Approved',
              description: `${name} is now verified and active.`,
              type: 'success',
            };
          },
        });
      },
    });
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      message.error('Please enter a rejection reason');
      return;
    }
    if (rejectingMerchantId) {
      updateMerchant({
        resource: 'merchants',
        id: rejectingMerchantId,
        values: {
          status: 'rejected',
          metadata: { rejection_reason: rejectionReason },
        },
        successNotification: () => {
          message.info('Merchant application rejected');
          return {
            message: 'Application Rejected',
            description: 'The merchant application has been rejected.',
            type: 'success',
          };
        },
      });
      setRejectingMerchantId(null);
      setRejectionReason('');
    }
  };

  const allMerchants = tableQueryResult?.data?.data || [];
  const pendingCount = allMerchants.filter(m => m.status === 'pending').length;

  const filteredMerchants = allMerchants.filter(m =>
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            MERCHANT NETWORK MANAGEMENT
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Merchant Onboarding
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md font-medium leading-relaxed">
            Review store applications, grant trial passes, manage NFC URLs, and verify merchant accounts.
          </p>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1100px] mx-auto w-full px-3 sm:px-6">
          
          {/* Main Bento Container (Overlapping Hero) */}
          <div className="-mt-16 relative z-30 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* Toolbar: Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-variant dark:border-white/10">
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all border cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-[#006d37] text-white border-[#006d37] shadow-md'
                      : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                  }`}
                >
                  All Merchants ({allMerchants.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all border cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'pending'
                      ? 'bg-[#006d37] text-white border-[#006d37] shadow-md'
                      : 'bg-[#f8faf9] dark:bg-[#001f15] text-slate-600 dark:text-[#85af9b] border-slate-200 dark:border-[#004d30] hover:text-slate-900'
                  }`}
                >
                  <span>Pending Approvals</span>
                  {pendingCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-[240px]">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                <input
                  type="text"
                  placeholder="Search store or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#f6f3f2] dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs text-on-surface dark:text-white outline-none focus:border-[#006d37] transition-all"
                />
              </div>

            </div>

            {/* Mobile-Native Clean Cards Grid */}
            {tableQueryResult.isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
              </div>
            ) : filteredMerchants.length === 0 ? (
              <div className="py-14 text-center text-on-surface-variant dark:text-[#85af9b]">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-2xl font-bold">storefront</span>
                </div>
                <h4 className="text-base font-bold text-on-surface dark:text-white mb-0.5">No merchants found</h4>
                <p className="text-xs text-on-surface-variant dark:text-[#85af9b]">Try adjusting your tab filter or search keyword.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
                {filteredMerchants.map((merchant) => (
                  <div 
                    key={merchant.id}
                    className="bg-[#fcf9f8] dark:bg-[#001f15] rounded-2xl p-4 border border-surface-variant dark:border-[#004d30] flex flex-col justify-between shadow-sm hover:border-[#006d37] dark:hover:border-[#6bfe9c] transition-all group"
                  >
                    {/* Top Row: Store Avatar, Name, Category & Status */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#006d37]/10 text-[#006d37] dark:bg-[#6bfe9c]/15 dark:text-[#6bfe9c] flex items-center justify-center font-black text-sm shrink-0 border border-[#006d37]/15">
                            {(merchant.name || 'M').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-on-surface dark:text-white mb-0.5 group-hover:text-[#006d37] dark:group-hover:text-[#6bfe9c] transition-colors">
                              {merchant.name}
                            </h4>
                            <span className="text-[10px] font-bold text-[#006d37] dark:text-[#6bfe9c] bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 px-2 py-0.5 rounded-full uppercase">
                              {merchant.category || 'General'}
                            </span>
                          </div>
                        </div>

                        {/* Status Pill */}
                        <div>
                          {merchant.status === 'active' && (
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] border border-[#6bfe9c]/30">
                              ACTIVE
                            </span>
                          )}
                          {merchant.status === 'pending' && (
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              PENDING
                            </span>
                          )}
                          {merchant.status === 'suspended' && (
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                              SUSPENDED
                            </span>
                          )}
                          {merchant.status === 'rejected' && (
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                              REJECTED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Address / Description */}
                      <p className="text-xs text-on-surface-variant dark:text-[#85af9b] mb-3 line-clamp-1">
                        {merchant.description || merchant.address || 'Registered merchant'}
                      </p>
                    </div>

                    {/* Bottom Action Pills Bar */}
                    <div className="flex items-center justify-between gap-1.5 pt-2.5 border-t border-surface-variant dark:border-white/10">
                      
                      <div className="flex items-center gap-1.5">
                        {/* Copy NFC Link */}
                        <button
                          onClick={() => {
                            const nfcUrl = `https://waly-five.vercel.app/nfc?m=${merchant.id}`;
                            navigator.clipboard.writeText(nfcUrl);
                            message.success(`NFC Link copied for ${merchant.name}`);
                          }}
                          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all border border-indigo-500/20 cursor-pointer flex items-center gap-1"
                          title="Copy NFC Card URL"
                        >
                          <span>📋 NFC Link</span>
                        </button>

                        {/* Grant Trial */}
                        <button
                          onClick={() => navigate(`/subscriptions?grantTrialFor=${merchant.id}`)}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all border border-amber-500/20 cursor-pointer"
                        >
                          Grant Trial
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Pending Approvals Actions */}
                        {merchant.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApprove(merchant.id, merchant.name)}
                              className="bg-[#006d37] hover:bg-[#004d27] text-white px-3 py-1.5 rounded-xl text-[11px] font-black border-none cursor-pointer shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingMerchantId(merchant.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-[11px] font-black border-none cursor-pointer shadow-sm"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => navigate(`/merchants/${merchant.id}`)}
                            className="bg-[#006d37]/10 hover:bg-[#006d37]/20 text-[#006d37] dark:text-[#6bfe9c] px-3 py-1.5 rounded-xl text-[11px] font-black border border-[#006d37]/20 cursor-pointer"
                          >
                            Details →
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Rejection Modal */}
      <Modal
        title="Reject Merchant Application"
        open={rejectingMerchantId !== null}
        onOk={handleRejectSubmit}
        onCancel={() => {
          setRejectingMerchantId(null);
          setRejectionReason('');
        }}
        okText="Reject Application"
        okButtonProps={{ danger: true, style: { border: 'none' } }}
        cancelText="Cancel"
      >
        <div className="py-3 text-left">
          <p className="text-xs text-slate-600 mb-2">Please specify the reason for rejection (this will be sent to the merchant owner):</p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-2xl border border-slate-200 outline-none text-xs resize-none"
            placeholder="e.g. Logo image is blurred or registration number is missing..."
          />
        </div>
      </Modal>

    </div>
  );
};
