import React from 'react';
import { Link } from 'react-router-dom';
import { useSalesData } from './useSalesData';

export const SalesLeaderboardPage: React.FC = () => {
  const { leaderboardMock } = useSalesData();

  const top1 = leaderboardMock.find(a => a.rank === 1) || leaderboardMock[0] || { rank: 1, name: 'Agent Partner', sales: 0, customers: 0, isCurrentUser: true };
  const top2 = leaderboardMock.find(a => a.rank === 2) || { rank: 2, name: 'Fazli', sales: 0, customers: 0, isCurrentUser: false };
  const top3 = leaderboardMock.find(a => a.rank === 3) || { rank: 3, name: 'Partner 3', sales: 0, customers: 0, isCurrentUser: false };

  const currentUser = leaderboardMock.find(a => a.isCurrentUser) || top1;

  return (
    <div className="flex flex-col gap-0 text-left w-full pb-6 overflow-x-hidden">
      {/* 1. Top Section (Forest Green Gradient Hero Header - Safe Area Supported) */}
      <section className="relative z-10 bg-gradient-to-b from-[#002d1e] to-[#1a4333] text-white pt-14 sm:pt-16 pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.5rem))] pb-28 sm:pb-32 rounded-none w-full px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center relative">
          {/* Top Category Badge */}
          <span className="text-[11px] font-bold text-[#85af9b] uppercase tracking-widest mb-3">
            Sales Leaderboard
          </span>

          {/* Header Title & Subtitle */}
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-3xl sm:text-4xl">🏆</span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Partner Leaderboard</h1>
          </div>
          <p className="text-xs sm:text-sm text-[#85af9b] max-w-md mb-5 font-medium leading-relaxed">
            See how you rank against top performing referral agents and partner networks.
          </p>

          {/* User Rank Summary Glassmorphism Pill */}
          <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2 rounded-full backdrop-blur-md border border-white/15 shadow-md mt-1 mb-2">
            <span className="text-xs font-bold text-[#c0ecd6] flex items-center gap-1.5">
              <span>Your Rank:</span>
              <span className="bg-[#6bfe9c] text-[#002d1e] font-black text-[10px] px-2.5 py-0.5 rounded-full">
                #{currentUser.rank}
              </span>
            </span>
            <span className="text-white/30 text-xs">|</span>
            <span className="text-xs font-extrabold text-white">
              RM {currentUser.sales.toLocaleString()} Sales
            </span>
          </div>
        </div>
      </section>

      {/* 2. Main Content Sections (Off-white canvas starting right under green hero section) */}
      <div className="relative z-20 bg-[#fcf9f8] dark:bg-[#00150e] pt-0 pb-4">
        <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-6 flex flex-col gap-6">

          {/* Solid Overlapping 3-Column Podium Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-5 items-end pt-2 pb-1 -mt-14 relative z-30">
            {/* Rank #2 (Silver - Left) */}
            <div className="flex flex-col items-center text-center p-3.5 sm:p-5 rounded-[2rem] bg-white dark:bg-[#002d1e] border border-[#e5e2e1] dark:border-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.08)] relative group hover:shadow-xl transition-all">
              <div className="absolute -top-3.5 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-white dark:ring-slate-900">
                🥈
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-2 mb-2 shadow-sm shrink-0">
                {top2.avatar ? (
                  <img src={top2.avatar} alt={top2.name} className="w-full h-full object-cover" />
                ) : (
                  top2.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <span className="text-xs sm:text-base font-extrabold text-on-surface truncate w-full px-1">
                {top2.name}
              </span>
              {top2.isCurrentUser ? (
                <span className="text-[9px] font-black bg-[#006d37] text-white px-2.5 py-0.5 rounded-full my-1">
                  YOU
                </span>
              ) : (
                <span className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                  {top2.customers} stores active
                </span>
              )}
              <div className="mt-2.5 pt-2.5 border-t border-surface-variant/60 dark:border-white/10 w-full">
                <span className="text-xs sm:text-base font-black text-[#006d37] dark:text-[#6bfe9c] block">
                  RM {top2.sales.toLocaleString()}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Sales Volume</span>
              </div>
            </div>

            {/* Rank #1 (Gold - Center Hero Podium) */}
            <div className="flex flex-col items-center text-center p-4 sm:p-6 rounded-[2rem] bg-white dark:bg-[#002d1e] border-2 border-amber-400 dark:border-amber-400/60 shadow-xl shadow-amber-500/10 relative group hover:shadow-2xl transition-all -mt-4 scale-[1.05] z-10">
              {/* Floating Crown Badge */}
              <div className="absolute -top-4.5 flex items-center justify-center gap-1 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-amber-950 px-3 py-1 rounded-full font-black text-xs shadow-md ring-2 ring-white dark:ring-slate-900">
                <span>👑</span>
                <span>#1 Gold</span>
              </div>
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-400 ring-4 ring-amber-400/30 bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center font-black text-base sm:text-lg text-amber-900 dark:text-amber-200 mt-2 mb-2 shadow-md shrink-0">
                {top1.avatar ? (
                  <img src={top1.avatar} alt={top1.name} className="w-full h-full object-cover" />
                ) : (
                  top1.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <span className="text-xs sm:text-lg font-black text-on-surface truncate w-full px-1">
                {top1.name}
              </span>
              {top1.isCurrentUser ? (
                <span className="text-[9px] font-black bg-[#006d37] text-white px-2.5 py-0.5 rounded-full my-1 shadow-sm">
                  YOU
                </span>
              ) : (
                <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold mt-0.5">
                  {top1.customers} stores active
                </span>
              )}
              <div className="mt-2.5 pt-2.5 border-t border-amber-200/80 dark:border-amber-500/30 w-full">
                <span className="text-sm sm:text-xl font-black text-[#006d37] dark:text-[#6bfe9c] block">
                  RM {top1.sales.toLocaleString()}
                </span>
                <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Top Sales</span>
              </div>
            </div>

            {/* Rank #3 (Bronze - Right) */}
            <div className="flex flex-col items-center text-center p-3.5 sm:p-5 rounded-[2rem] bg-white dark:bg-[#002d1e] border border-[#e5e2e1] dark:border-white/10 shadow-[0_12px_35px_rgba(0,0,0,0.08)] relative group hover:shadow-xl transition-all">
              <div className="absolute -top-3.5 w-8 h-8 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-white dark:ring-slate-900">
                🥉
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-700/60 bg-amber-100 dark:bg-amber-950 flex items-center justify-center font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200 mt-2 mb-2 shadow-sm shrink-0">
                {top3.avatar ? (
                  <img src={top3.avatar} alt={top3.name} className="w-full h-full object-cover" />
                ) : (
                  top3.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <span className="text-xs sm:text-base font-extrabold text-on-surface truncate w-full px-1">
                {top3.name}
              </span>
              {top3.isCurrentUser ? (
                <span className="text-[9px] font-black bg-[#006d37] text-white px-2.5 py-0.5 rounded-full my-1">
                  YOU
                </span>
              ) : (
                <span className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                  {top3.customers} stores active
                </span>
              )}
              <div className="mt-2.5 pt-2.5 border-t border-surface-variant/60 dark:border-white/10 w-full">
                <span className="text-xs sm:text-base font-black text-[#006d37] dark:text-[#6bfe9c] block">
                  RM {top3.sales.toLocaleString()}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Sales Volume</span>
              </div>
            </div>
          </div>

          {/* Complete Agent Rankings List */}
          <div className="bg-surface-container-lowest rounded-[2rem] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant w-full">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-surface-variant">
              <div>
                <h3 className="text-base sm:text-lg font-black text-on-surface">All Agent Rankings</h3>
                <p className="text-xs text-on-surface-variant">Complete partner leaderboard overview</p>
              </div>
              <span className="bg-[#006d37]/10 text-[#006d37] dark:text-[#6bfe9c] text-xs font-black px-3 py-1 rounded-full">
                {leaderboardMock.length} Active Partners
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {leaderboardMock.map((agent) => (
                <div
                  key={agent.rank}
                  className={`flex flex-wrap items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    agent.isCurrentUser
                      ? 'bg-[#6bfe9c]/15 border-[#006d37]/40 shadow-sm'
                      : 'bg-surface-container-low border-surface-variant/60 hover:bg-surface-container-highest/50'
                  }`}
                >
                  {/* Left: Rank Badge + Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${
                        agent.rank === 1
                          ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                          : agent.rank === 2
                          ? 'bg-slate-300 text-slate-900 ring-2 ring-slate-200'
                          : agent.rank === 3
                          ? 'bg-amber-700 text-amber-100 ring-2 ring-amber-600'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {agent.rank === 1 ? '🥇' : agent.rank === 2 ? '🥈' : agent.rank === 3 ? '🥉' : `#${agent.rank}`}
                    </div>

                    <div className="w-10 h-10 rounded-full overflow-hidden border border-surface-variant shrink-0 bg-[#006d37]/10 flex items-center justify-center font-bold text-xs text-[#006d37]">
                      {agent.avatar ? (
                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                      ) : (
                        agent.name.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="flex flex-col text-left">
                      <span className="text-xs sm:text-sm font-bold text-on-surface flex items-center gap-1.5">
                        {agent.name}
                        {agent.isCurrentUser && (
                          <span className="text-[9px] font-black bg-[#006d37] text-white px-2 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        {agent.customers} stores active • {agent.tier}
                      </span>
                    </div>
                  </div>

                  {/* Right: Sales Volume Amount */}
                  <div className="text-right ml-auto">
                    <span className="text-xs sm:text-base font-black text-[#006d37] dark:text-[#6bfe9c] block">
                      RM {agent.sales.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      Earnings: RM {agent.commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
