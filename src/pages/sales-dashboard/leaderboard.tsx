import React from 'react';
import { useSalesData } from './useSalesData';

export const SalesLeaderboardPage: React.FC = () => {
  const { leaderboardMock } = useSalesData();

  return (
    <div className="flex flex-col gap-6 text-left max-w-[1280px] mx-auto pb-12">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-on-surface">Partner Leaderboard</h2>
        <p className="text-sm text-on-surface-variant">See how you rank against top referral agents and partner networks.</p>
      </div>

      {/* Top 3 Podiums Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {leaderboardMock.slice(0, 3).map((agent) => (
          <div
            key={agent.rank}
            className={`bg-surface-container-lowest rounded-[2rem] p-6 border shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col items-center text-center relative overflow-hidden ${
              agent.rank === 1
                ? 'border-[#F59E0B] bg-gradient-to-b from-[#F59E0B]/5 to-surface-container-lowest'
                : agent.rank === 2
                ? 'border-[#94A3B8]'
                : 'border-[#D97706]'
            }`}
          >
            <div
              className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-xs font-black text-white ${
                agent.rank === 1
                  ? 'bg-[#F59E0B]'
                  : agent.rank === 2
                  ? 'bg-[#94A3B8]'
                  : 'bg-[#D97706]'
              }`}
            >
              {agent.rank === 1 ? '1st Place' : agent.rank === 2 ? '2nd Place' : '3rd Place'}
            </div>

            <div className="w-16 h-16 rounded-full bg-primary-container/20 border-2 border-primary/20 flex items-center justify-center font-bold text-lg text-primary mb-3 mt-2">
              {agent.name.substring(0, 2).toUpperCase()}
            </div>

            <h3 className="text-base font-bold text-on-surface">
              {agent.name} {agent.isCurrentUser && '(You)'}
            </h3>
            <span className="text-xs text-on-surface-variant mb-2">{agent.customers} stores active</span>

            <div className="bg-surface-container-low px-4 py-2 rounded-xl border border-surface-variant w-full mt-2">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase block">Sales Volume</span>
              <span className="text-base font-black text-secondary">
                RM {agent.sales.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Complete Rankings Table */}
      <div className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant">
        <div className="border-b border-surface-variant mb-6 pb-4 flex justify-between items-center">
          <h3 className="text-base font-bold text-on-surface">All Agent Rankings</h3>
          <span className="text-xs text-on-surface-variant font-semibold">{leaderboardMock.length} Active Partners</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-variant">
                <th className="pb-3 text-xs font-bold text-on-surface-variant w-16">Rank</th>
                <th className="pb-3 text-xs font-bold text-on-surface-variant">Agent Partner</th>
                <th className="pb-3 text-xs font-bold text-on-surface-variant">Active Stores</th>
                <th className="pb-3 text-xs font-bold text-on-surface-variant text-right">Sales Volume</th>
                <th className="pb-3 text-xs font-bold text-on-surface-variant">Commission Rate</th>
                <th className="pb-3 text-xs font-bold text-on-surface-variant text-right">Lifetime Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {leaderboardMock.map((agent) => (
                <tr
                  key={agent.rank}
                  className={`hover:bg-surface-container-low transition-colors ${
                    agent.isCurrentUser ? 'bg-secondary-container/20 font-bold' : ''
                  }`}
                >
                  <td className="py-4">
                    {agent.rank === 1 ? (
                      <span className="bg-[#F59E0B] text-white text-xs px-2.5 py-1 rounded-full font-black">1st</span>
                    ) : agent.rank === 2 ? (
                      <span className="bg-[#94A3B8] text-white text-xs px-2.5 py-1 rounded-full font-black">2nd</span>
                    ) : agent.rank === 3 ? (
                      <span className="bg-[#D97706] text-white text-xs px-2.5 py-1 rounded-full font-black">3rd</span>
                    ) : (
                      <span className="text-xs font-bold text-on-surface pl-2">#{agent.rank}</span>
                    )}
                  </td>
                  <td className="py-4 text-sm text-on-surface font-semibold">
                    {agent.name} {agent.isCurrentUser && <span className="text-secondary font-bold">(You)</span>}
                  </td>
                  <td className="py-4 text-xs text-on-surface-variant">{agent.customers} stores</td>
                  <td className="py-4 text-sm text-on-surface text-right font-semibold">RM {agent.sales.toLocaleString()}</td>
                  <td className="py-4 text-xs text-on-surface-variant">{agent.tier}</td>
                  <td className="py-4 text-sm text-secondary text-right font-bold">
                    RM {agent.commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
