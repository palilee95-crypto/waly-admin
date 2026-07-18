import React from 'react';
import { useShow, useList } from '@refinedev/core';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag, Tabs, Card, Spin } from 'antd';
import { ArrowLeftOutlined, QrcodeOutlined, TrophyOutlined, HistoryOutlined } from '@ant-design/icons';

export const UserShow: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Fetch User detail
  const { queryResult } = useShow<any>({
    resource: 'users',
    id,
  });

  const user = queryResult?.data?.data;

  // 2. Fetch linked loyalty cards for this user
  const { data: loyaltyCardsData, isLoading: isLoadingCards } = useList<any>({
    resource: 'loyalty_cards',
    filters: [
      {
        field: 'customer',
        operator: 'eq',
        value: id,
      },
    ],
    meta: {
      expand: ['program', 'merchant'],
    },
    pagination: { mode: 'off' },
  });

  // 3. Fetch vouchers for this user
  const { data: vouchersData, isLoading: isLoadingVouchers } = useList<any>({
    resource: 'vouchers',
    filters: [
      {
        field: 'customer',
        operator: 'eq',
        value: id,
      },
    ],
    meta: {
      expand: ['reward', 'reward.merchant'],
    },
    pagination: { mode: 'off' },
  });

  // 4. Fetch transactions for this user
  const { data: transactionsData, isLoading: isLoadingTransactions } = useList<any>({
    resource: 'transactions',
    filters: [
      {
        field: 'customer',
        operator: 'eq',
        value: id,
      },
    ],
    meta: {
      expand: ['merchant'],
    },
    pagination: { mode: 'off' },
  });

  const loyaltyCards = loyaltyCardsData?.data || [];
  const vouchers = vouchersData?.data || [];
  const transactions = transactionsData?.data || [];

  return (
    <div className="flex flex-col gap-6 text-left font-body">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <button
            onClick={() => navigate('/users')}
            className="flex items-center gap-2 text-primary font-bold hover:underline mb-2 bg-transparent border-none cursor-pointer"
            style={{ color: '#0040e0' }}
          >
            <ArrowLeftOutlined /> Back to User Management
          </button>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Customer Profile Inspector</h2>
          <p className="text-body-lg text-on-surface-variant">View customer activity, active stamp cards, claimed vouchers, and transactions history</p>
        </div>
      </div>

      {queryResult.isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : user ? (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Left panel: Customer Profile Card */}
          <Card className="w-full lg:w-80 shadow-md rounded-[1.5rem] border border-solid border-black/5 bg-white/60 backdrop-blur-xl">
            <div className="flex flex-col items-center gap-4 text-center pb-4 border-b border-solid border-black/5">
              <div className="w-20 h-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                {user.name?.substring(0, 2).toUpperCase() || 'US'}
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">{user.name || 'Walk-in Customer'}</h3>
                <div className="flex flex-col gap-1 items-center mt-1">
                  <Tag color={user.status === 'suspended' ? 'red' : 'emerald'}>
                    {user.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                  </Tag>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold text-primary">
                    {user.role || 'Customer'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 text-sm">
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">User ID</p>
                <p className="font-semibold text-on-surface font-mono text-xs">{user.id}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Phone Number</p>
                <p className="font-semibold text-on-surface font-mono">{user.phone || 'No phone number'}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Email Address</p>
                <p className="font-semibold text-on-surface">{user.email || 'No email registered'}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Member Tier</p>
                <p className="font-semibold text-on-surface capitalize">{user.tier || 'Bronze'}</p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Points Balance</p>
                <p className="font-bold text-primary text-base">{user.total_points !== undefined ? user.total_points : 0} pts</p>
              </div>
              <div>
                <p className="text-[10px] text-outline uppercase font-semibold">Member Since</p>
                <p className="font-semibold text-on-surface">
                  {new Date(user.created).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Right panel: Details separation tabs */}
          <div className="flex-1 w-full glass-panel rounded-[2rem] p-gutter min-h-[400px]">
            <Tabs defaultActiveKey="1" size="large" className="font-headline font-semibold">
              <Tabs.TabPane
                tab={
                  <span className="flex items-center gap-2">
                    <QrcodeOutlined /> Loyalty Cards ({loyaltyCards.length})
                  </span>
                }
                key="1"
              >
                {isLoadingCards ? (
                  <div className="py-20 flex justify-center"><Spin /></div>
                ) : (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-black/5">
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Merchant</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Program Name</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Stamps Collected</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Date Joined</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 font-body text-sm">
                        {loyaltyCards.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                              This user hasn't joined any loyalty stamp programs yet.
                            </td>
                          </tr>
                        ) : (
                          loyaltyCards.map((card: any) => (
                            <tr key={card.id} className="hover:bg-white/20 transition-colors">
                              <td className="py-4 font-semibold text-on-surface">
                                {card.expand?.merchant?.name || 'Unknown Merchant'}
                              </td>
                              <td className="py-4 text-on-surface">{card.expand?.program?.name || 'Main Campaign'}</td>
                              <td className="py-4 font-semibold text-on-surface">
                                {card.stamps_collected} / {card.expand?.program?.stamp_goal || 10}
                              </td>
                              <td className="py-4 text-on-surface-variant">
                                {new Date(card.created).toLocaleDateString()}
                              </td>
                              <td className="py-4">
                                {card.status === 'active' ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">Completed</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span className="flex items-center gap-2">
                    <TrophyOutlined /> Vouchers & Vouchers ({vouchers.length})
                  </span>
                }
                key="2"
              >
                {isLoadingVouchers ? (
                  <div className="py-20 flex justify-center"><Spin /></div>
                ) : (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-black/5">
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Reward / Voucher</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Merchant</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Code</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Claimed Date</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 font-body text-sm">
                        {vouchers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                              This user hasn't claimed any rewards/vouchers yet.
                            </td>
                          </tr>
                        ) : (
                          vouchers.map((voucher: any) => (
                            <tr key={voucher.id} className="hover:bg-white/20 transition-colors">
                              <td className="py-4 font-semibold text-on-surface">
                                {voucher.expand?.reward?.name || 'Free Item'}
                              </td>
                              <td className="py-4 text-on-surface">
                                {voucher.expand?.reward?.expand?.merchant?.name || 'Shop'}
                              </td>
                              <td className="py-4 text-on-surface font-mono text-xs">{voucher.code}</td>
                              <td className="py-4 text-on-surface-variant">
                                {new Date(voucher.created).toLocaleDateString()}
                              </td>
                              <td className="py-4">
                                {voucher.status === 'used' ? (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">Used</span>
                                ) : voucher.status === 'expired' ? (
                                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">Expired</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Available</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={
                  <span className="flex items-center gap-2">
                    <HistoryOutlined /> Transaction History ({transactions.length})
                  </span>
                }
                key="3"
              >
                {isLoadingTransactions ? (
                  <div className="py-20 flex justify-center"><Spin /></div>
                ) : (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-black/5">
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Date & Time</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Merchant</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Type</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-center">Stamps</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-center">Points</th>
                          <th className="pb-3 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Sale (RM)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 font-body text-sm">
                        {transactions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                              No transaction logs found for this user.
                            </td>
                          </tr>
                        ) : (
                          transactions.map((tx: any) => {
                            const metadata = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : (tx.metadata || {});
                            const saleAmt = tx.bill_amount ?? metadata?.bill_amount ?? metadata?.amount ?? 0;
                            return (
                              <tr key={tx.id} className="hover:bg-white/20 transition-colors">
                                <td className="py-4 text-on-surface text-xs">
                                  {new Date(tx.created).toLocaleString()}
                                </td>
                                <td className="py-4 font-semibold text-on-surface">
                                  {tx.expand?.merchant?.name || 'Walk-in Shop'}
                                </td>
                                <td className="py-4">
                                  <Tag color={tx.type === 'earn' ? 'emerald' : tx.type === 'redeem' ? 'volcano' : 'blue'} className="text-[10px] font-bold">
                                    {tx.type === 'earn' ? 'EARN' : tx.type === 'redeem' ? 'REDEMPTION' : 'ADJUSTMENT'}
                                  </Tag>
                                </td>
                                <td className="py-4 text-center font-semibold text-on-surface">
                                  {tx.stamps > 0 ? `+${tx.stamps}` : tx.stamps || 0}
                                </td>
                                <td className="py-4 text-center font-bold text-on-surface">
                                  {tx.points > 0 ? `+${tx.points}` : tx.points || 0}
                                </td>
                                <td className="py-4 text-right font-mono text-on-surface font-semibold">
                                  {saleAmt > 0 ? `RM ${Number(saleAmt).toFixed(2)}` : '-'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      ) : (
        <Card className="py-10 text-center text-on-surface-variant">
          Customer not found or could not be loaded.
        </Card>
      )}
    </div>
  );
};
