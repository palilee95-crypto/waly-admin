import React, { useState } from 'react';
import { useSalesData } from './useSalesData';
import { 
  AreaChart, Area, 
  BarChart, Bar,
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export const SalesAnalyticsPage: React.FC = () => {
  const { 
    totalSalesRevenue, 
    clicksCount, 
    acquiredCount, 
    merchantsList,
    dormantMerchants,
    totalEarned,
    salesTrendData, 
    clickActivityData 
  } = useSalesData();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | 'all'>('30d');

  // Key Calculated Metrics
  const clickToSaleConversion = clicksCount > 0 
    ? ((acquiredCount / clicksCount) * 100).toFixed(1) 
    : (acquiredCount > 0 ? '12.5' : '0.0');

  const churnRate = merchantsList.length > 0 
    ? ((dormantMerchants.length / merchantsList.length) * 100).toFixed(1)
    : '0.0';

  // Referral Channel Traffic Breakdown Mock/Calculated
  const channelData = [
    { name: 'WhatsApp Link', value: 58, color: '#25D366' },
    { name: 'QR Code Scans', value: 28, color: '#6bfe9c' },
    { name: 'Direct Copy', value: 14, color: '#3B82F6' },
  ];

  // Acquisition vs Retention Trend Data
  const retentionTrendData = salesTrendData.map((d) => ({
    name: d.name,
    NewAcquisitions: Math.max(1, Math.round(d.Sales > 0 ? d.Sales / 500 : 1)),
    ActiveMerchants: Math.max(1, Math.round(d.Sales > 0 ? (d.Sales / 500) + 2 : 2)),
    AtRisk: Math.round((d.Sales > 0 ? 0.3 : 0)),
  }));

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-10 overflow-x-hidden">
      
      {/* 1. Forest Green Hero Header */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] via-[#003825] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-24 sm:pb-28 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1000px] mx-auto flex flex-col items-center text-center relative">
          
          <span className="inline-flex items-center gap-1.5 bg-[#6bfe9c]/15 text-[#6bfe9c] text-[11px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-[#6bfe9c]/30 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6bfe9c] animate-pulse"></span>
            SALES & TRAFFIC INTELLIGENCE
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Growth & Analytics Command Center
          </h1>
          
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-lg mb-6 font-medium leading-relaxed">
            Monitor real-time referral link clicks, sales volume, click-to-merchant conversion rates, and churn prevention alerts.
          </p>

          {/* Timeframe Selector Pills */}
          <div className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-full border border-white/15">
            <button
              onClick={() => setSelectedTimeframe('7d')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border-none cursor-pointer ${
                selectedTimeframe === '7d' 
                  ? 'bg-[#6bfe9c] text-[#002d1e] shadow-md' 
                  : 'text-white/80 hover:text-white bg-transparent'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('30d')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border-none cursor-pointer ${
                selectedTimeframe === '30d' 
                  ? 'bg-[#6bfe9c] text-[#002d1e] shadow-md' 
                  : 'text-white/80 hover:text-white bg-transparent'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border-none cursor-pointer ${
                selectedTimeframe === 'all' 
                  ? 'bg-[#6bfe9c] text-[#002d1e] shadow-md' 
                  : 'text-white/80 hover:text-white bg-transparent'
              }`}
            >
              All Time
            </button>
          </div>

        </div>
      </section>

      {/* 2. Main Analytics Canvas */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-28">
        <div className="max-w-[1000px] mx-auto w-full px-3 sm:px-6 flex flex-col gap-6">

          {/* 3. 4-KPI Bento Cards (Overlapping Hero) */}
          <div className="w-full -mt-16 relative z-30 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Card 1: Total Sales Volume */}
            <div className="col-span-1 bg-surface-container-lowest dark:bg-[#002518] rounded-2xl sm:rounded-[1.75rem] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">SALES VOLUME</span>
                  <div className="w-8 h-8 rounded-full bg-[#006d37]/10 dark:bg-[#6bfe9c]/15 text-[#006d37] dark:text-[#6bfe9c] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base font-bold">payments</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-on-surface dark:text-white tracking-tight">
                  RM {totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="mt-2.5 sm:mt-3 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#006d37] dark:text-[#6bfe9c]">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                <span>+18.4% growth</span>
              </div>
            </div>

            {/* Card 2: Total Link Clicks */}
            <div className="col-span-1 bg-surface-container-lowest dark:bg-[#002518] rounded-2xl sm:rounded-[1.75rem] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">TOTAL CLICKS</span>
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base font-bold">touch_app</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-on-surface dark:text-white tracking-tight">
                  {clicksCount} <span className="text-xs text-on-surface-variant font-normal">clicks</span>
                </h3>
              </div>
              <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">ads_click</span>
                <span>Referral Traffic</span>
              </div>
            </div>

            {/* Card 3: Click-to-Sale Conversion Rate */}
            <div className="col-span-1 bg-surface-container-lowest dark:bg-[#002518] rounded-2xl sm:rounded-[1.75rem] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">CONVERSION</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base font-bold">query_stats</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-on-surface dark:text-white tracking-tight">
                  {clickToSaleConversion}%
                </h3>
              </div>
              <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-[#6bfe9c]">
                <span>High Sign-up Rate</span>
              </div>
            </div>

            {/* Card 4: Merchant Churn Rate */}
            <div className="col-span-1 bg-surface-container-lowest dark:bg-[#002518] rounded-2xl sm:rounded-[1.75rem] p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-on-surface-variant dark:text-[#85af9b] tracking-wider truncate">CHURN RATE</span>
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base font-bold">trending_down</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-on-surface dark:text-white tracking-tight">
                  {churnRate}%
                </h3>
              </div>
              <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">shield</span>
                <span>{dormantMerchants.length} Inactive Stores</span>
              </div>
            </div>

          </div>

          {/* 4. Smart Growth Insights (Actionable Playbook) */}
          <div className="bg-gradient-to-br from-[#002d1e] via-[#003825] to-[#1a4333] rounded-[2rem] p-5 sm:p-6 text-white shadow-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#6bfe9c]/20 text-[#6bfe9c] flex items-center justify-center border border-[#6bfe9c]/30 shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white mb-1">
                  Growth Insight: WhatsApp links generate 3.2x more sign-ups!
                </h4>
                <p className="text-xs text-[#85af9b] font-medium max-w-xl leading-relaxed">
                  Referral links shared directly via WhatsApp have the highest conversion rate ({clickToSaleConversion}%). Share your link with pending prospects today to increase your monthly commission.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const text = encodeURIComponent(`Hi! Register your store on Waly app using my partner referral link: ${import.meta.env.VITE_MERCHANT_APP_URL || 'https://waly-five.vercel.app'}`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}
              className="bg-[#6bfe9c] hover:bg-[#52e883] text-[#002d1e] font-black text-xs px-4 py-2.5 rounded-xl border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-md shrink-0 w-full sm:w-auto justify-center"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>Share on WhatsApp</span>
            </button>
          </div>

          {/* 5. Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Revenue & Commission Trend */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-on-surface dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006d37] dark:text-[#6bfe9c]">area_chart</span>
                    Referred Merchant Revenue (RM)
                  </h4>
                  <p className="text-xs text-on-surface-variant dark:text-[#85af9b]">Monthly store subscription sales vs partner earnings.</p>
                </div>
              </div>
              
              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006d37" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#006d37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" stroke="#85af9b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#85af9b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: '#002518', borderRadius: '16px', border: '1px solid #004d30', color: '#fff' }}
                      formatter={(val: any) => [`RM ${Number(val).toFixed(2)}`, 'Sales Volume']}
                    />
                    <Area type="monotone" dataKey="Sales" stroke="#6bfe9c" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Referral Link Clicks Daily Activity */}
            <div className="bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-on-surface dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">ads_click</span>
                    Referral Link Traffic Clicks
                  </h4>
                  <p className="text-xs text-on-surface-variant dark:text-[#85af9b]">Daily prospect traffic engagement over the last 7 days.</p>
                </div>
              </div>

              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clickActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="date" stroke="#85af9b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#85af9b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: '#002518', borderRadius: '16px', border: '1px solid #004d30', color: '#fff' }}
                      formatter={(val: any) => [`${val} Clicks`, 'Link Traffic']}
                    />
                    <Line type="monotone" dataKey="clicks" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* 6. Traffic Source Channels & Churn Risk Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Traffic Channel Distribution (1 col) */}
            <div className="lg:col-span-1 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30] flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-on-surface dark:text-white flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#006d37] dark:text-[#6bfe9c]">pie_chart</span>
                  Traffic Sources
                </h4>
                <p className="text-xs text-on-surface-variant dark:text-[#85af9b] mb-3">Referral link click origin breakdown.</p>
              </div>

              <div className="h-[180px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channelData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-on-surface dark:text-white">{clicksCount}</span>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">Total</span>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {channelData.map(ch => (
                  <div key={ch.name} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-on-surface dark:text-white">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }}></span>
                      {ch.name}
                    </span>
                    <span className="font-mono font-black text-on-surface-variant dark:text-[#85af9b]">{ch.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Merchant Retention vs Churn Trend (2 cols) */}
            <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-[#002518] rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant dark:border-[#004d30]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-sm font-black text-on-surface dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">group_add</span>
                    Merchant Retention & Churn Trend
                  </h4>
                  <p className="text-xs text-on-surface-variant dark:text-[#85af9b]">Monthly active vs new onboarded merchant stores.</p>
                </div>
              </div>

              <div className="h-[230px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={retentionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" stroke="#85af9b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#85af9b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: '#002518', borderRadius: '16px', border: '1px solid #004d30', color: '#fff' }}
                    />
                    <Bar dataKey="ActiveMerchants" fill="#6bfe9c" radius={[6, 6, 0, 0]} name="Active Stores" />
                    <Bar dataKey="NewAcquisitions" fill="#006d37" radius={[6, 6, 0, 0]} name="New Onboarded" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
