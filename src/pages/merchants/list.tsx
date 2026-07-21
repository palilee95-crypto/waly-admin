import React, { useState } from 'react';
import { useTable, useUpdate } from '@refinedev/core';
import { Tag, message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';

export const MerchantList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [rejectingMerchantId, setRejectingMerchantId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Fetch merchants from pocketbase
  const { tableQueryResult } = useTable<any>({
    resource: 'merchants',
    pagination: { pageSize: 10 },
    filters: {
      permanent: activeTab === 'pending' ? [{ field: 'status', operator: 'eq', value: 'pending' }] : [],
    },
  });

  const { mutate: updateMerchant } = useUpdate();

  const handleApprove = (id: string, name: string) => {
    Modal.confirm({
      title: 'Approve Merchant Application',
      content: `Are you sure you want to approve ${name}? This will notify the owner.`,
      okText: 'Approve',
      cancelText: 'Cancel',
      okButtonProps: { style: { backgroundColor: '#0040e0' } },
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

  const merchants = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Merchant Onboarding</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Review and manage platform merchants</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-black/5 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`font-body text-body-lg font-bold pb-2 border-b-2 transition-all bg-transparent border-none cursor-pointer ${
            activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          All Merchants
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`font-body text-body-lg font-bold pb-2 border-b-2 transition-all bg-transparent border-none cursor-pointer flex items-center gap-2 ${
            activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          Pending Approvals
          {merchants.filter(m => m.status === 'pending').length > 0 && (
            <span className="bg-error text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              {merchants.filter(m => m.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* Table view using glassmorphism layout */}
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
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Business</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Category</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Joined Date</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body">
                {merchants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant text-sm">
                      No merchants found.
                    </td>
                  </tr>
                ) : (
                  merchants.map((merchant) => (
                    <tr key={merchant.id} className="group hover:bg-white/40 transition-colors cursor-pointer" onClick={() => navigate(`/merchants/${merchant.id}`)}>
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {merchant.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-headline text-sm font-semibold text-on-surface">{merchant.name}</p>
                            <p className="text-[10px] text-on-surface-variant truncate max-w-[200px]">{merchant.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 text-sm text-on-surface">{merchant.category || 'N/A'}</td>
                      <td className="py-5">
                        {merchant.status === 'active' && (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                        )}
                        {merchant.status === 'pending' && (
                          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">Pending</span>
                        )}
                        {merchant.status === 'suspended' && (
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">Suspended</span>
                        )}
                        {merchant.status === 'rejected' && (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Rejected</span>
                        )}
                      </td>
                      <td className="py-5 text-sm text-on-surface-variant">
                        {new Date(merchant.created || merchant.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/subscriptions?grantTrialFor=${merchant.id}`)}
                            className="bg-amber-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-amber-600 transition-all border-none cursor-pointer"
                            style={{ backgroundColor: '#f59e0b' }}
                          >
                            Grant Trial
                          </button>
                          <button
                            onClick={() => navigate(`/merchants/${merchant.id}`)}
                            className="text-primary font-bold text-xs hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Details
                          </button>
                          {merchant.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(merchant.id, merchant.name)}
                                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-700 transition-all border-none font-bold cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectingMerchantId(merchant.id)}
                                className="bg-error text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 transition-all border-none font-bold cursor-pointer"
                              >
                                Reject
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
        <div className="py-4">
          <p className="text-sm text-on-surface mb-2">Please specify the reason for rejection (this will be sent to the merchant):</p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-xl border border-solid border-black/10 focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
            placeholder="e.g. Logo image is blurred or registration number is missing..."
          />
        </div>
      </Modal>
    </div>
  );
};
