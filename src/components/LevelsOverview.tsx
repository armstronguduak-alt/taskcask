import React from 'react';
import { useApp } from '../context/AppContext';
import type { Level } from '../types';

interface LevelsOverviewProps {
  onClose?: () => void;
}

export const LevelsOverview: React.FC<LevelsOverviewProps> = ({ onClose }) => {
  const { user, levels, referrals, systemSettings } = useApp();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0] || {} as Level;
  const currentLevelIndex = levels.findIndex(l => l.id === userLevel.id);

  // Active Referrals requirement check
  const activeReferralsCount = referrals.filter(
    r => r.referrer_id === user?.id && (r.referral_status === 'Active' || r.referral_status === 'Qualified')
  ).length;

  const userStreak = user?.login_streak || 0;
  const userAds = user?.total_ads_watched || 0;
  const userTasks = user?.total_tasks_completed || 0;

  const nextLevel = levels[currentLevelIndex + 1];

  const getBadgeColor = (levelName: string) => {
    switch (levelName.toLowerCase()) {
      case 'bronze':
        return 'from-amber-600 to-amber-800 text-amber-100 border-amber-500/30';
      case 'silver':
        return 'from-slate-400 to-slate-600 text-slate-100 border-slate-400/30';
      case 'gold':
        return 'from-yellow-400 to-amber-500 text-yellow-950 border-yellow-300/40';
      case 'platinum':
        return 'from-cyan-400 to-blue-600 text-cyan-950 border-cyan-300/40';
      case 'diamond':
        return 'from-indigo-400 to-purple-600 text-purple-100 border-purple-300/40';
      default:
        return 'from-[#2563eb] to-blue-600 text-zinc-900 border-[#2563eb]/30';
    }
  };

  return (
    <div className="space-y-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-xl">workspace_premium</span>
            <h3 className="font-bold text-base text-on-surface dark:text-white uppercase tracking-wider">
              Membership Tiers & Perks
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Complete activities to unlock higher earning multipliers and payout limits!
          </p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Current Level Summary Highlight */}
      <div className="bg-gradient-to-r from-[#2563eb]/10 via-[#2563eb]/5 to-transparent border border-[#2563eb]/20 rounded-2xl p-4 flex justify-between items-center">
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#2563eb]">Your Current Status</span>
          <h4 className="text-lg font-black text-on-surface dark:text-white flex items-center gap-2 mt-0.5">
            {userLevel.name || 'Bronze Tier'}
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#2563eb] text-zinc-900 font-bold">
              {userLevel.earning_multiplier || 1.0}x Earnings
            </span>
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {nextLevel 
              ? `Next level: ${nextLevel.name} (${nextLevel.earning_multiplier}x Multiplier)` 
              : 'You are at the Highest Tier! Ultimate Earning Rate unlocked.'}
          </p>
        </div>
        <div className="text-right">
          <span className="material-symbols-outlined text-4xl text-[#2563eb] animate-pulse">
            military_tech
          </span>
        </div>
      </div>

      {/* Level Upgrade Progress Bars (if next level exists) */}
      {nextLevel && (
        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-zinc-800/40">
          <div className="flex justify-between items-center">
            <h5 className="text-xs font-bold text-on-surface dark:text-gray-200 uppercase tracking-wide">
              Road to {nextLevel.name}
            </h5>
            <span className="text-[10px] text-[#2563eb] font-bold">Requirements</span>
          </div>

          {/* Login Streak */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-gray-500">Daily Login Streak</span>
              <span className="text-on-surface dark:text-gray-300">{userStreak} / {nextLevel.req_streak} Days</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${Math.min(100, (userStreak / (nextLevel.req_streak || 1)) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Ads Watched */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-gray-500">Rewarded Videos Watched</span>
              <span className="text-on-surface dark:text-gray-300">{userAds} / {nextLevel.req_ads}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#2563eb] transition-all duration-500" 
                style={{ width: `${Math.min(100, (userAds / (nextLevel.req_ads || 1)) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Tasks Completed */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-gray-500">Tasks Completed</span>
              <span className="text-on-surface dark:text-gray-300">{userTasks} / {nextLevel.req_tasks}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500" 
                style={{ width: `${Math.min(100, (userTasks / (nextLevel.req_tasks || 1)) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Active Referrals */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-gray-500">Active Referrals</span>
              <span className="text-on-surface dark:text-gray-300">{activeReferralsCount} / {nextLevel.req_referrals}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all duration-500" 
                style={{ width: `${Math.min(100, (activeReferralsCount / (nextLevel.req_referrals || 1)) * 100)}%` }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* All Membership Levels Cards */}
      <div className="space-y-3 pt-1">
        <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          All Platform Tiers
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {levels.map((lvl) => {
            const isCurrent = lvl.id === userLevel.id;
            const gradientClass = getBadgeColor(lvl.name);

            return (
              <div 
                key={lvl.id}
                className={`relative rounded-2xl p-4 border transition-all ${
                  isCurrent 
                    ? 'border-[#2563eb] dark:border-[#2563eb]/80 ring-2 ring-[#2563eb]/20 bg-white dark:bg-zinc-900 shadow-md' 
                    : 'border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-800/30'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-[#2563eb] text-zinc-900 text-[9px] font-black uppercase tracking-wider shadow-sm">
                    CURRENT LEVEL
                  </span>
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r ${gradientClass} shadow-sm`}>
                      {lvl.name}
                    </span>
                    <p className="text-xs font-bold text-[#2563eb] mt-2">
                      {lvl.earning_multiplier}x Multiplier Boost
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Min Cashout</span>
                    <span className="text-sm font-black text-on-surface dark:text-white">
                      {(lvl.min_withdrawal_sb || 0).toLocaleString()} SB
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800/60 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-gray-400 font-semibold block">Max Daily Ads</span>
                    <span className="font-bold text-on-surface dark:text-gray-200">
                      {(lvl.max_daily_ads_cat_a || 0) + (lvl.max_daily_ads_cat_b || 0) + (lvl.max_daily_ads_cat_c || 0)} Ads/day
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">Max Daily Tasks</span>
                    <span className="font-bold text-on-surface dark:text-gray-200">
                      {lvl.max_daily_tasks} Tasks/day
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">Streak Req.</span>
                    <span className="font-bold text-on-surface dark:text-gray-200">
                      {lvl.req_streak} Days
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">Referral Req.</span>
                    <span className="font-bold text-on-surface dark:text-gray-200">
                      {lvl.req_referrals} Referrals
                    </span>
                  </div>
                </div>

                {lvl.benefits && lvl.benefits.length > 0 && (
                  <div className="mt-3 text-[10px] text-gray-500 dark:text-gray-400 space-y-1 border-t border-dashed border-gray-100 dark:border-zinc-800 pt-2">
                    {lvl.benefits.map((benefit: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs text-blue-500">check_circle</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelsOverview;
