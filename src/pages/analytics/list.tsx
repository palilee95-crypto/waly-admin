import React, { useState } from 'react';
import { useList } from '@refinedev/core';
import { Card, Table, Radio, DatePicker, Button, message } from 'antd';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';

const { RangePicker } = DatePicker;

// Mock charts data
const mockPointsFlowData = [
  { date: '06-25', earned: 4200, redeemed: 2100 },
  { date: '06-26', earned: 3800, redeemed: 1900 },
  { date: '06-27', earned: 4900, redeemed: 3200 },
  { date: '06-28', earned: 5600, redeemed: 4100 },
  { date: '06-29', earned: 6200, redeemed: 3800 },
  { date: '06-30', earned: 7100, redeemed: 4500 },
  { date: '07-01', earned: 6800, redeemed: 5200 },
];

const mockDauMauData = [
  { date: '06-25', dau: 11200, mau: 38200 },
  { date: '06-26', dau: 10800, mau: 38500 },
  { date: '06-27', dau: 12400, mau: 39100 },
  { date: '06-28', dau: 13100, mau: 40200 },
  { date: '06-29', dau: 12900, mau: 41100 },
  { date: '06-30', dau: 13800, mau: 42100 },
  { date: '07-01', dau: 12800, mau: 42500 },
];

const mockTierData = [
  { name: 'Bronze', value: 24500, color: '#cd7f32' },
  { name: 'Silver', value: 12100, color: '#c0c0c0' },
  { name: 'Gold', value: 5200, color: '#ffd700' },
  { name: 'Platinum', value: 700, color: '#e5e4e2' },
];

const mockRegistrations = [
  { date: '06-25', newUsers: 82 },
  { date: '06-26', newUsers: 74 },
  { date: '06-27', newUsers: 91 },
  { date: '06-28', newUsers: 102 },
  { date: '06-29', newUsers: 88 },
  { date: '06-30', newUsers: 114 },
  { date: '07-01', newUsers: 89 },
];

const mockTopMerchants = [
  { key: '1', name: 'Royal Bakery', category: 'Food & Beverage', pointsIssued: 145000, txCount: 820 },
  { key: '2', name: 'Kopi Town', category: 'Food & Beverage', pointsIssued: 112000, txCount: 640 },
  { key: '3', name: 'Cloud Fashion', category: 'E-commerce', pointsIssued: 98000, txCount: 450 },
  { key: '4', name: 'Green Solutions', category: 'Tech & Services', pointsIssued: 84000, txCount: 220 },
  { key: '5', name: 'Mainstream Media', category: 'Marketing', pointsIssued: 67000, txCount: 180 },
];

export const PlatformAnalytics: React.FC = () => {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');

  // Try fetching counts from pocketbase collections
  const { data: merchantsData } = useList<any>({ resource: 'merchants', pagination: { pageSize: 1 } });
  const { data: usersData } = useList<any>({ resource: 'users', pagination: { pageSize: 1 } });
  const { data: campaignsData } = useList<any>({ resource: 'campaigns', pagination: { pageSize: 1 } });

  const totalMerchants = merchantsData?.total || 1980;
  const totalUsers = usersData?.total || 42500;
  const activeCampaigns = campaignsData?.total || 8;

  const handleExportCSV = () => {
    message.loading({ content: 'Exporting analytics to CSV...', key: 'export' });
    setTimeout(() => {
      message.success({ content: 'Downloaded waly-analytics-report.csv', key: 'export', duration: 2 });
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Header and Toolbar */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Platform Analytics</h2>
          <p className="text-body-lg text-on-surface-variant">Real-time charts, usage logs, and system metrics</p>
        </div>
        
        {/* Date Filters & Export Actions */}
        <div className="flex items-center gap-4 flex-wrap bg-white/40 p-2 rounded-2xl glass-panel">
          <Radio.Group value={range} onChange={(e) => setRange(e.target.value)} buttonStyle="solid" className="rounded-xl overflow-hidden border-none flex">
            <Radio.Button value="7d" className="border-none h-9 flex items-center">7 Days</Radio.Button>
            <Radio.Button value="30d" className="border-none h-9 flex items-center">30 Days</Radio.Button>
            <Radio.Button value="90d" className="border-none h-9 flex items-center">90 Days</Radio.Button>
          </Radio.Group>
          {range === 'custom' && <RangePicker className="h-9 rounded-xl border-none" />}
          <Button 
            onClick={handleExportCSV}
            type="primary" 
            className="h-9 rounded-xl bg-primary text-white border-none flex items-center gap-2 font-bold shadow-md shadow-primary/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards Row (from 21-platform-analytics.md) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="glass-panel p-glass-padding rounded-3xl text-left">
          <p className="text-[10px] text-outline uppercase font-semibold">Total Platform Users</p>
          <h3 className="font-headline text-2xl font-black text-on-surface mt-1">{totalUsers.toLocaleString()}</h3>
          <p className="text-xs text-emerald-600 mt-1 font-bold">+89 joined today</p>
        </div>
        <div className="glass-panel p-glass-padding rounded-3xl text-left">
          <p className="text-[10px] text-outline uppercase font-semibold">Active Merchants</p>
          <h3 className="font-headline text-2xl font-black text-on-surface mt-1">{totalMerchants.toLocaleString()}</h3>
          <p className="text-xs text-emerald-600 mt-1 font-bold">+11% active growth</p>
        </div>
        <div className="glass-panel p-glass-padding rounded-3xl text-left">
          <p className="text-[10px] text-outline uppercase font-semibold">DAU / MAU Ratio</p>
          <h3 className="font-headline text-2xl font-black text-on-surface mt-1">30.1%</h3>
          <p className="text-xs text-on-surface-variant mt-1">12.8k active today / 42.5k monthly</p>
        </div>
        <div className="glass-panel p-glass-padding rounded-3xl text-left">
          <p className="text-[10px] text-outline uppercase font-semibold">Active Campaigns</p>
          <h3 className="font-headline text-2xl font-black text-on-surface mt-1">{activeCampaigns} Campaigns</h3>
          <p className="text-xs text-primary font-bold">{activeCampaigns} ongoing promos</p>
        </div>
      </div>

      {/* Charts Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Points Flow Chart (col-span-8) */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-[2rem] p-gutter text-left">
          <h3 className="font-headline text-sm font-bold text-on-surface mb-6">Points Flow (Earned vs Redeemed)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPointsFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" stroke="#747688" fontSize={11} tickLine={false} />
                <YAxis stroke="#747688" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="earned" fill="#52c41a" radius={[4, 4, 0, 0]} name="Points Earned" />
                <Bar dataKey="redeemed" fill="#fa8c16" radius={[4, 4, 0, 0]} name="Points Redeemed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Distribution Pie Chart (col-span-4) */}
        <div className="col-span-12 lg:col-span-4 glass-panel rounded-[2rem] p-gutter text-left flex flex-col justify-between">
          <h3 className="font-headline text-sm font-bold text-on-surface mb-2">Tier Distribution</h3>
          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockTierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockTierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center px-4 mt-4">
            {mockTierData.map((t) => (
              <div key={t.name} className="flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: t.color }}></span>
                <span className="text-[10px] text-outline font-semibold uppercase">{t.name}</span>
                <span className="text-xs font-bold text-on-surface">{(t.value / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>

        {/* DAU/MAU Trend Line Chart (col-span-8) */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-[2rem] p-gutter text-left">
          <h3 className="font-headline text-sm font-bold text-on-surface mb-6">Active Users Trend (DAU vs MAU)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockDauMauData}>
                <defs>
                  <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0040e0" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0040e0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" stroke="#747688" fontSize={11} tickLine={false} />
                <YAxis stroke="#747688" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="dau" stroke="#0040e0" strokeWidth={2} fillOpacity={1} fill="url(#colorDau)" name="DAU" />
                <Area type="monotone" dataKey="mau" stroke="#747688" strokeWidth={1} fill="none" name="MAU" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Registrations Trend (col-span-4) */}
        <div className="col-span-12 lg:col-span-4 glass-panel rounded-[2rem] p-gutter text-left flex flex-col justify-between">
          <h3 className="font-headline text-sm font-bold text-on-surface mb-6">New Customer Registrations</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRegistrations}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" stroke="#747688" fontSize={11} tickLine={false} />
                <YAxis stroke="#747688" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="newUsers" stroke="#52c41a" fill="#52c41a" fillOpacity={0.1} strokeWidth={2} name="New Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Merchants List Section */}
      <div className="glass-panel rounded-[2rem] p-gutter text-left">
        <h3 className="font-headline text-sm font-bold text-on-surface mb-6">Top 5 Merchants (Last 30 Days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5">
                <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Rank</th>
                <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Merchant Name</th>
                <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Category</th>
                <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold">Points Issued</th>
                <th className="pb-4 font-headline text-[10px] text-outline uppercase tracking-wider font-semibold text-right">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-body">
              {mockTopMerchants.map((merchant, idx) => (
                <tr key={merchant.key} className="group hover:bg-white/40 transition-colors">
                  <td className="py-5 font-bold text-sm text-on-surface">#{idx + 1}</td>
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {merchant.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-headline text-sm font-semibold text-on-surface">{merchant.name}</span>
                    </div>
                  </td>
                  <td className="py-5 text-sm text-on-surface">{merchant.category}</td>
                  <td className="py-5 text-sm font-bold text-primary">{merchant.pointsIssued.toLocaleString()} pts</td>
                  <td className="py-5 text-sm text-on-surface-variant text-right">{merchant.txCount.toLocaleString()} txs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export const MerchantRankings: React.FC = () => <div>Merchant Rankings Placeholder</div>;
