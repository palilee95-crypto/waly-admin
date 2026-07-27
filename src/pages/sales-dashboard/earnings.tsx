import React, { useState } from 'react';
import { message, Modal } from 'antd';
import { useSalesData } from './useSalesData';

export const SalesEarningsPage: React.FC = () => {
  const { totalEarned, pendingCommissions, withdrawableCommission, monthlyCommission, commissionsList } = useSalesData();
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);

  const handleRequestPayout = () => {
    if (withdrawableCommission <= 0) {
      message.warning('No withdrawable balance currently available.');
      return;
    }
    setPayoutModalVisible(true);
  };

  const handleConfirmPayout = () => {
    message.success(`Payout request of RM ${withdrawableCommission.toFixed(2)} submitted successfully!`);
    setPayoutModalVisible(false);
  };

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-6 overflow-x-hidden">
      
      {/* 1. Revolut/Apple Cash Style Top Hero Section */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center relative">
          
          {/* Category Pill */}
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            WITHDRAWABLE BALANCE
          </span>

          {/* Giant Central Balance Display */}
          <div className="flex items-baseline justify-center gap-1 my-1">
            <span className="text-xl sm:text-2xl font-bold text-[#85af9b]">RM</span>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-md">
              {withdrawableCommission.toFixed(2)}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-[#85af9b] font-medium mt-1 mb-2">
            Verified Partner Account · Tier 1 (10% Commission Rate)
          </p>

        </div>
      </section>

      {/* 2. Main Content Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1000px] mx-auto w-full px-3 sm:px-6 flex flex-col gap-6">

          {/* 3. Modern Fintech Quick Action Pill Bar */}
          <div className="w-full max-w-[500px] mx-auto -mt-14 relative z-30 px-2">
            <div className="bg-white dark:bg-[#002518] rounded-[2rem] p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.08)] border border-surface-variant dark:border-[#004d30] flex items-center justify-around">
              
              {/* 1. Cash Out / Withdraw */}
              <button
                onClick={handleRequestPayout}
                className="flex flex-col items-center gap-2 group border-none bg-transparent cursor-pointer transition-transform active:scale-95"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#6bfe9c] text-[#002d1e] flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                  <span className="material-symbols-outlined text-xl sm:text-2xl font-black">arrow_upward</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-on-surface dark:text-[#a4d0ba]">Cash Out</span>
              </button>

              {/* 2. Analytics */}
              <button
                onClick={() => setAnalyticsModalVisible(true)}
                className="flex flex-col items-center gap-2 group border-none bg-transparent cursor-pointer transition-transform active:scale-95"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center border border-[#006d37]/20 dark:border-[#6bfe9c]/30 shadow-sm group-hover:bg-[#006d37] group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">insights</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-on-surface dark:text-[#a4d0ba]">Analytics</span>
              </button>

              {/* 3. Bank Account */}
              <button
                onClick={() => setBankModalVisible(true)}
                className="flex flex-col items-center gap-2 group border-none bg-transparent cursor-pointer transition-transform active:scale-95"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center border border-[#006d37]/20 dark:border-[#6bfe9c]/30 shadow-sm group-hover:bg-[#006d37] group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">account_balance</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-on-surface dark:text-[#a4d0ba]">Bank Acc</span>
              </button>

              {/* 4. Statement */}
              <button
                onClick={() => {
                  const element = document.getElementById('transaction-history');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex flex-col items-center gap-2 group border-none bg-transparent cursor-pointer transition-transform active:scale-95"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center border border-[#006d37]/20 dark:border-[#6bfe9c]/30 shadow-sm group-hover:bg-[#006d37] group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-xl sm:text-2xl">receipt_long</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-on-surface dark:text-[#a4d0ba]">Statement</span>
              </button>

            </div>
          </div>

          {/* 4. 3-Column Mini Stats Bar */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            
            {/* Stat 1: This Month */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between text-center">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">THIS MONTH</span>
              <h4 className="text-base sm:text-xl font-black text-on-surface dark:text-white my-1 truncate">
                RM {monthlyCommission.toFixed(2)}
              </h4>
              <span className="text-[10px] font-bold text-[#006d37] dark:text-[#6bfe9c] truncate">Active Tier 1</span>
            </div>

            {/* Stat 2: Lifetime */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between text-center">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">LIFETIME</span>
              <h4 className="text-base sm:text-xl font-black text-on-surface dark:text-white my-1 truncate">
                RM {totalEarned.toFixed(2)}
              </h4>
              <span className="text-[10px] font-semibold text-on-surface-variant dark:text-[#85af9b] truncate">Verified</span>
            </div>

            {/* Stat 3: Pending */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between text-center">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">PENDING</span>
              <h4 className="text-base sm:text-xl font-black text-on-surface dark:text-white my-1 truncate">
                RM {pendingCommissions.toFixed(2)}
              </h4>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 truncate">7d Clearing</span>
            </div>

          </div>

          {/* 5. Recent Activity Ledger / Transaction Feed */}
          <div id="transaction-history" className="bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-surface-variant dark:border-white/10">
              <h3 className="text-sm sm:text-base font-black text-on-surface dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006d37] dark:text-[#6bfe9c]">history</span>
                Recent Activity
              </h3>
              <span className="bg-[#006d37]/10 text-[#006d37] dark:bg-[#6bfe9c]/15 dark:text-[#6bfe9c] text-[11px] font-black px-2.5 py-0.5 rounded-full">
                {commissionsList.length} Transactions
              </span>
            </div>

            {/* Activity Feed */}
            {commissionsList.length === 0 ? (
              <div className="py-8 text-center text-on-surface-variant dark:text-[#85af9b]">
                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-1.5">receipt_long</span>
                <p className="text-xs sm:text-sm font-bold text-on-surface dark:text-white">No wallet activity yet</p>
                <p className="text-[11px] text-on-surface-variant dark:text-[#85af9b] mt-0.5">Refer merchant stores to start earning payouts!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-surface-variant dark:border-white/10">
                      <th className="pb-3 text-xs font-bold text-on-surface-variant dark:text-[#85af9b]">Merchant / Store</th>
                      <th className="pb-3 text-xs font-bold text-on-surface-variant dark:text-[#85af9b]">Type</th>
                      <th className="pb-3 text-xs font-bold text-on-surface-variant dark:text-[#85af9b] text-right">Sales Volume</th>
                      <th className="pb-3 text-xs font-bold text-on-surface-variant dark:text-[#85af9b] text-right">Rate</th>
                      <th className="pb-3 text-xs font-bold text-on-surface-variant dark:text-[#85af9b] text-right">Partner Earning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant dark:divide-white/5">
                    {commissionsList.map((log) => (
                      <tr key={log.id} className="hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#006d37]/10 text-[#006d37] dark:bg-[#6bfe9c]/15 dark:text-[#6bfe9c] flex items-center justify-center font-bold text-xs shrink-0">
                              <span className="material-symbols-outlined text-sm">storefront</span>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-on-surface dark:text-white mb-0.5">{log.name}</p>
                              <p className="text-[10px] text-on-surface-variant dark:text-[#85af9b]">{log.date} · #{log.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-low dark:bg-white/10 text-on-surface dark:text-white">
                            {log.type}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs sm:text-sm text-on-surface dark:text-white text-right font-semibold">
                          RM {log.sales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 text-xs text-right">
                          <span className="bg-[#6bfe9c]/20 text-[#006d37] dark:text-[#6bfe9c] text-[11px] font-bold px-2 py-0.5 rounded-md">
                            {(log.rate * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3.5 text-xs sm:text-sm text-[#006d37] dark:text-[#6bfe9c] text-right font-extrabold">
                          +RM {log.earning.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout Confirmation Modal */}
      <Modal
        title={null}
        open={payoutModalVisible}
        onCancel={() => setPayoutModalVisible(false)}
        footer={null}
        width={380}
        centered
        styles={{ body: { padding: '24px', borderRadius: '24px' } }}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#6bfe9c]/20 text-[#006d37] mx-auto flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-2xl font-bold">arrow_upward</span>
          </div>
          <h3 className="text-lg font-black text-on-surface mb-1">Request Partner Payout</h3>
          <p className="text-xs text-on-surface-variant mb-4">
            Transfer withdrawable balance directly to your registered bank account.
          </p>

          <div className="bg-[#f6f3f2] p-4 rounded-2xl mb-5 text-left border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500 font-semibold">Payout Amount:</span>
              <span className="text-base font-black text-[#006d37]">RM {withdrawableCommission.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-200 pt-2">
              <span>Estimated Processing:</span>
              <span className="font-bold text-slate-700">1 - 2 Business Days</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPayoutModalVisible(false)}
              className="flex-1 bg-surface-container-low text-on-surface py-3 rounded-xl font-bold text-xs border border-surface-variant cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPayout}
              className="flex-1 bg-[#006d37] hover:bg-[#004d27] text-white py-3 rounded-xl font-black text-xs border-none cursor-pointer shadow-md"
            >
              Confirm Payout
            </button>
          </div>
        </div>
      </Modal>

      {/* Bank Account Details Modal */}
      <Modal
        title={null}
        open={bankModalVisible}
        onCancel={() => setBankModalVisible(false)}
        footer={null}
        width={380}
        centered
        styles={{ body: { padding: '24px', borderRadius: '24px' } }}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#006d37]/10 text-[#006d37] mx-auto flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-2xl font-bold">account_balance</span>
          </div>
          <h3 className="text-lg font-black text-on-surface mb-1">Registered Payout Bank</h3>
          <p className="text-xs text-on-surface-variant mb-4">
            Partner payouts are automatically transferred to this verified bank account.
          </p>

          <div className="bg-[#f6f3f2] p-4 rounded-2xl mb-5 text-left border border-slate-200 flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Bank Name:</span>
              <span className="font-black text-slate-800">Bank Islam Malaysia</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Account Number:</span>
              <span className="font-mono font-bold text-slate-800">1203 8940 9821</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2">
              <span className="text-slate-500 font-semibold">Account Holder:</span>
              <span className="font-bold text-slate-800">HASHIFF (AGENT PARTNER)</span>
            </div>
          </div>

          <button
            onClick={() => setBankModalVisible(false)}
            className="w-full bg-[#006d37] text-white py-3 rounded-xl font-bold text-xs border-none cursor-pointer"
          >
            Done
          </button>
        </div>
      </Modal>

      {/* Analytics Modal */}
      <Modal
        title={null}
        open={analyticsModalVisible}
        onCancel={() => setAnalyticsModalVisible(false)}
        footer={null}
        width={380}
        centered
        styles={{ body: { padding: '24px', borderRadius: '24px' } }}
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[#006d37]/10 text-[#006d37] mx-auto flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-2xl font-bold">insights</span>
          </div>
          <h3 className="text-lg font-black text-on-surface mb-1">Revenue Breakdown</h3>
          <p className="text-xs text-on-surface-variant mb-4">
            Detailed breakdown of partner earnings and commission rates.
          </p>

          <div className="bg-[#f6f3f2] p-4 rounded-2xl mb-5 text-left border border-slate-200 flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Commission Tier:</span>
              <span className="font-black text-[#006d37] bg-[#6bfe9c]/30 px-2 py-0.5 rounded">Tier 1 (10%)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">This Month:</span>
              <span className="font-bold text-slate-800">RM {monthlyCommission.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2">
              <span className="text-slate-500 font-semibold">Lifetime Total:</span>
              <span className="font-black text-slate-800">RM {totalEarned.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => setAnalyticsModalVisible(false)}
            className="w-full bg-[#006d37] text-white py-3 rounded-xl font-bold text-xs border-none cursor-pointer"
          >
            Close
          </button>
        </div>
      </Modal>

    </div>
  );
};
