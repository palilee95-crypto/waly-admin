import React from 'react';
import { useSalesData } from './useSalesData';

export const SalesLeaderboardPage: React.FC = () => {
  const { leaderboardMock } = useSalesData();

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="mb-2">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Partner Leaderboard</h2>
        <p className="font-body text-body-lg text-on-surface-variant">See how you rank against other referral agents and partner networks.</p>
      </div>

      <div className="glass-panel rounded-[2rem] p-6">
        <div className="border-b border-black/5 dark:border-white/5 mb-6 pb-4">
          <h3 className="font-headline text-base font-bold text-on-surface">Leaderboard Rankings</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5">
                <th className="pb-3 text-xs font-semibold text-on-surface-variant w-12">Rank</th>
                <th className="pb-3 text-xs font-semibold text-on-surface-variant">Agent Name</th>
                <th className="pb-3 text-xs font-semibold text-on-surface-variant">Active Stores</th>
                <th className="pb-3 text-xs font-semibold text-on-surface-variant text-right">Sales Volume</th>
                <th className="pb-3 text-xs font-semibold text-on-surface-variant">Commission Tier</th>
                <th className="pb-3 text-xs font-semibold text-on-surface-variant text-right">Lifetime Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {leaderboardMock.map((agent) => (
                <tr 
                  key={agent.rank} 
                  className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${agent.isCurrentUser ? 'bg-primary/5 font-bold' : ''}`}
                >
                  <td className="py-4">
                    {agent.rank === 1 ? (
                      <span className="bg-[#F59E0B] text-white text-xs px-2.5 py-1 rounded-full font-black">1st</span>
                    ) : agent.rank === 2 ? (
                      <span className="bg-[#A0AEC0] text-white text-xs px-2.5 py-1 rounded-full font-black">2nd</span>
                    ) : (
                      <span className="text-sm font-semibold text-on-surface pl-2">{agent.rank}</span>
                    )}
                  </td>
                  <td className="py-4 text-sm text-on-surface">{agent.name} {agent.isCurrentUser && '(You)'}</td>
                  <td className="py-4 text-sm text-on-surface-variant">{agent.customers} stores</td>
                  <td className="py-4 text-sm text-on-surface text-right">RM {agent.sales.toLocaleString()}</td>
                  <td className="py-4 text-sm text-on-surface-variant">{agent.tier}</td>
                  <td className="py-4 text-sm text-[#10B981] text-right font-bold">RM {agent.commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
