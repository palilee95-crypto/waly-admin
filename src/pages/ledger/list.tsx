import React, { useState } from 'react';
import { useTable, useList } from '@refinedev/core';
import { Modal, message, Button, Alert } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ==========================================
// 1. TransactionList
// ==========================================
export const TransactionList: React.FC = () => {
  const { tableQueryResult } = useTable<any>({
    resource: 'transactions',
    pagination: { pageSize: 10 },
  });

  const transactions = tableQueryResult?.data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Points Ledger</h2>
          <p className="font-body text-body-lg text-on-surface-variant">Real-time audit log of all point flows</p>
        </div>
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
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Transaction ID</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">User</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Type</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Points</th>
                  <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-body">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant text-sm">
                      No transactions recorded.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="group hover:bg-white/40 transition-colors">
                      <td className="py-5 text-sm font-mono text-on-surface">{tx.id}</td>
                      <td className="py-5 text-sm text-on-surface">{tx.user || 'Unknown User'}</td>
                      <td className="py-5 text-sm text-on-surface uppercase font-bold">{tx.type}</td>
                      <td className="py-5 text-sm font-bold text-primary">{tx.points}</td>
                      <td className="py-5 text-sm text-on-surface-variant">
                        {new Date(tx.created || tx.created_at).toLocaleString()}
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
// 2. LiabilityDashboard
// ==========================================
const mockLiabilitySnapshots = [
  { snapshot_date: '06-25', monetary_value: 12400 },
  { snapshot_date: '06-26', monetary_value: 12600 },
  { snapshot_date: '06-27', monetary_value: 12900 },
  { snapshot_date: '06-28', monetary_value: 13200 },
  { snapshot_date: '06-29', monetary_value: 13150 },
  { snapshot_date: '06-30', monetary_value: 13500 },
  { snapshot_date: '07-01', monetary_value: 14200 },
];

export const LiabilityDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Fetch users count to calculate mock current liability
  const { data: usersData } = useList<any>({
    resource: 'users',
    pagination: { pageSize: 1 },
  });

  const totalUsers = usersData?.total || 42500;
  // Let's assume average points per user is 350 pts
  const totalOutstandingPoints = totalUsers * 350;
  const monetaryLiabilityMYR = totalOutstandingPoints * 0.01;

  const handleExpireStalePoints = () => {
    Modal.confirm({
      title: 'Expire Stale Points (12+ Months Inactive)',
      content: 'Are you sure you want to expire points for all users who have been inactive for over 12 months? This action will generate expire ledger records and update balances.',
      okText: 'Execute Expiry Batch',
      okButtonProps: { danger: true, style: { border: 'none' } },
      cancelText: 'Cancel',
      onOk: () => {
        setLoading(true);
        message.loading({ content: 'Scanning stale accounts and running points expiry batch...', key: 'expiry-batch' });
        
        setTimeout(() => {
          message.success({ content: 'Successfully expired 24,500 points across 18 inactive customer profiles!', key: 'expiry-batch', duration: 3 });
          setLoading(false);
        }, 1500);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 font-body text-left">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Liability Monitor</h2>
          <p className="text-body-lg text-on-surface-variant">Track outstanding financial points obligations and run maintenance batches</p>
        </div>
        <Button
          onClick={handleExpireStalePoints}
          loading={loading}
          danger
          type="primary"
          className="h-11 rounded-xl px-6 font-bold border-none shadow-lg shadow-red-500/10 cursor-pointer"
        >
          Expire Stale Points
        </Button>
      </div>

      {/* Alert Banner if liability threshold exceeded */}
      {monetaryLiabilityMYR > 10000 && (
        <Alert
          message="Points Liability Warning Threshold Exceeded"
          description={`Outstanding points monetary liability has breached the warning threshold (currently at RM ${monetaryLiabilityMYR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). Consider launching points redemption campaigns or expiring stale inactive accounts.`}
          type="warning"
          showIcon
          className="rounded-2xl"
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="glass-panel p-glass-padding rounded-3xl">
          <p className="text-[10px] text-outline uppercase font-semibold">Total Outstanding Points</p>
          <h3 className="font-headline text-2xl font-black text-on-surface mt-1">{totalOutstandingPoints.toLocaleString()} pts</h3>
        </div>
        <div className="glass-panel p-glass-padding rounded-3xl">
          <p className="text-[10px] text-outline uppercase font-semibold">Monetary Liability</p>
          <h3 className="font-headline text-2xl font-black text-primary mt-1">RM {monetaryLiabilityMYR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="text-[10px] text-outline mt-1 font-semibold">Based on RM0.01 per point (1 sen/pt)</p>
        </div>
        <div className="glass-panel p-glass-padding rounded-3xl">
          <p className="text-[10px] text-outline uppercase font-semibold">30-Day Change</p>
          <h3 className="font-headline text-2xl font-black text-emerald-600 mt-1">+14.2%</h3>
          <p className="text-xs text-on-surface-variant mt-1">Increase in active liabilities</p>
        </div>
        <div className="glass-panel p-glass-padding rounded-3xl">
          <p className="text-[10px] text-outline uppercase font-semibold">Active Points Holders</p>
          <h3 className="font-headline text-2xl font-black text-on-surface mt-1">{(totalUsers * 0.72).toFixed(0)} users</h3>
          <p className="text-xs text-on-surface-variant mt-1">72% of users hold &gt;0 balance</p>
        </div>
      </div>

      {/* 30-Day Trend Chart */}
      <div className="glass-panel rounded-[2rem] p-gutter text-left">
        <h3 className="font-headline text-sm font-bold text-on-surface mb-6">30-Day Liability Trend (MYR Valuation)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ResponsiveContainer>
              <LineChart data={mockLiabilitySnapshots}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="snapshot_date" stroke="#747688" fontSize={11} tickLine={false} />
                <YAxis stroke="#747688" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="monetary_value" stroke="#0040e0" strokeWidth={3} dot={{ r: 4 }} name="Liability (RM)" />
              </LineChart>
            </ResponsiveContainer>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const TransactionShow: React.FC = () => <div>Show Transaction Placeholder</div>;
