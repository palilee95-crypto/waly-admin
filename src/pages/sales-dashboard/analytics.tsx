import React from 'react';
import { useSalesData } from './useSalesData';
import { 
  AreaChart, Area, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer
} from 'recharts';

export const SalesAnalyticsPage: React.FC = () => {
  const { salesTrendData, clickActivityData } = useSalesData();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="mb-2">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Analytics Charts</h2>
        <p className="font-body text-body-lg text-on-surface-variant">Performance trends, revenue generation, and referral link traffic metrics.</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
          {/* Sales Revenue Growth Area Chart */}
          <div className="h-[350px]">
            <h4 className="text-sm font-bold text-on-surface mb-3">Referred Merchants Revenue (RM)</h4>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0040e0" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0040e0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" stroke="#747688" fontSize={11} tickLine={false} />
                <YAxis stroke="#747688" fontSize={11} tickLine={false} />
                <ChartTooltip />
                <Area type="monotone" dataKey="Sales" stroke="#0040e0" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Clicks Line Chart */}
          <div className="h-[350px]">
            <h4 className="text-sm font-bold text-on-surface mb-3">Referral Link Clicks Traffic</h4>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={clickActivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" stroke="#747688" fontSize={11} tickLine={false} />
                <YAxis stroke="#747688" fontSize={11} tickLine={false} />
                <ChartTooltip />
                <Line type="monotone" dataKey="clicks" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
