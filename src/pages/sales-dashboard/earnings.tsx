import React from 'react';
import { useSalesData } from './useSalesData';

export const SalesEarningsPage: React.FC = () => {
  const { totalEarned, pendingCommissions, withdrawableCommission, monthlyCommission, commissionsList } = useSalesData();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="mb-2">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Commission & Earnings</h2>
        <p className="font-body text-body-lg text-on-surface-variant">View your commissions breakdowns, pending balances, and transaction logs.</p>
      </div>

      {/* Grid of Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5">
          <span className="material-symbols-outlined text-primary mb-2">calendar_month</span>
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Current Month Earnings</p>
          <h4 className="text-2xl font-black text-on-surface mt-1">RM {monthlyCommission.toFixed(2)}</h4>
        </div>

        <div className="glass-panel p-5">
          <span className="material-symbols-outlined text-[#10B981] mb-2">payments</span>
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Lifetime Earnings</p>
          <h4 className="text-2xl font-black text-on-surface mt-1">RM {totalEarned.toFixed(2)}</h4>
        </div>

        <div className="glass-panel p-5">
          <span className="material-symbols-outlined text-[#F59E0B] mb-2">hourglass_empty</span>
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Pending Payouts</p>
          <h4 className="text-2xl font-black text-on-surface mt-1">RM {pendingCommissions.toFixed(2)}</h4>
        </div>

        <div className="glass-panel p-5">
          <span className="material-symbols-outlined text-primary mb-2">account_balance_wallet</span>
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Withdrawable Balance</p>
          <h4 className="text-2xl font-black text-on-surface mt-1">RM {withdrawableCommission.toFixed(2)}</h4>
        </div>
      </div>

      {/* Commission Logs Table */}
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="border-b border-black/5 dark:border-white/5 mb-6 pb-4">
          <h3 className="font-headline text-base font-bold text-on-surface">Commission Logs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5">
                <th className="pb-3 text-xs font-semibold text-on-surface-variant">Transaction Details</th>
                <th className="pb-3 text-xs font-semibold text-on-surface-variant">Type</th>
                <th className="pb-3 text-xs font-semibold text-on-surface-variant text-right">Sales Volume</th>
                <th className="pb-3 text-xs font-semibold text-on-surface-variant text-right">Rate</th>
                <th className="pb-3 text-xs font-semibold text-on-surface-variant text-right">Earning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {commissionsList.map((log) => (
                <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <p className="text-sm font-semibold text-on-surface mb-0.5">{log.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{log.date} · #{log.id}</p>
                  </td>
                  <td className="py-4 text-xs text-on-surface-variant">{log.type}</td>
                  <td className="py-4 text-sm text-on-surface text-right font-semibold">RM {log.sales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-4 text-sm text-on-surface-variant text-right">{log.rate * 100}%</td>
                  <td className="py-4 text-sm text-[#10B981] text-right font-bold">RM {log.earning.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
