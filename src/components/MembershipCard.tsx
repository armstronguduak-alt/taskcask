import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LevelsOverview } from './LevelsOverview';

export const MembershipCard: React.FC = () => {
  const { user, levels, transactions, referrals, mainWallet } = useApp();
  const [showLevelsModal, setShowLevelsModal] = useState(false);

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];
  const currentLevelIdx = levels.findIndex(l => l.id === userLevel?.id);
  const nextLevel = levels[currentLevelIdx + 1] || null;

  // Calculate Daily Videos Remaining
  const today = new Date().toDateString();
  const adsWatchedToday = transactions.filter(
    t => new Date(t.timestamp).toDateString() === today && t.type === 'AdViewImpressions'
  ).length;
  const maxDailyAds = (userLevel?.max_daily_ads_cat_a || 0) + (userLevel?.max_daily_ads_cat_b || 0) + (userLevel?.max_daily_ads_cat_c || 0);
  const dailyVideosRemaining = Math.max(0, maxDailyAds - adsWatchedToday);

  // Calculate Daily Tasks Remaining
  const tasksCompletedToday = transactions.filter(
    t => t.type === 'TaskReward' && new Date(t.timestamp).toDateString() === today && t.status === 'Success'
  ).length;
  const dailyTasksRemaining = Math.max(0, (userLevel?.max_daily_tasks || 0) - tasksCompletedToday);

  const activeReferralsCount = referrals.filter(
    r => r.referrer_id === user?.id && (r.referral_status === 'Active' || r.referral_status === 'Qualified')
  ).length;

  const accountAgeDays = Math.floor((new Date().getTime() - new Date(user?.registered_at || new Date()).getTime()) / (1000 * 3600 * 24));
  const minWithdrawal = userLevel?.min_withdrawal_sb || 0;

  return (
    <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="font-bold text-sm text-on-surface dark:text-white uppercase tracking-wider">Membership Card</h3>
          <p className="text-[10px] text-on-surface-variant dark:text-gray-400 mt-0.5">Your current status and daily limits</p>
        </div>
        <div className="text-right">
          <button 
            onClick={() => setShowLevelsModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2563eb]/10 text-[#2563eb] hover:bg-[#2563eb]/20 text-[10px] font-extrabold uppercase tracking-wider transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">military_tech</span>
            {userLevel?.name || 'Bronze'}
          </button>
          {nextLevel ? (
            <p className="text-[9px] text-gray-500 mt-1 cursor-pointer" onClick={() => setShowLevelsModal(true)}>
              Next: {nextLevel.name} &rarr;
            </p>
          ) : (
            <p className="text-[9px] text-[#2563eb] font-bold mt-1 cursor-pointer" onClick={() => setShowLevelsModal(true)}>
              Max Tier Unlocked ★
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Daily Stats */}
        <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-2xl">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold mb-1">Daily Videos Remaining</p>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563eb]">play_circle</span>
            <span className="font-bold text-sm dark:text-white">{dailyVideosRemaining} / {maxDailyAds}</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-2xl">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold mb-1">Daily Tasks Remaining</p>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">assignment</span>
            <span className="font-bold text-sm dark:text-white">{dailyTasksRemaining} / {userLevel?.max_daily_tasks || 0}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lifetime Progress</h4>
        
        {/* Rewarded Videos Completed */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-500">Rewarded Videos</span>
            <span className="text-on-surface dark:text-gray-300">
              {user?.total_ads_watched || 0} {nextLevel ? `/ ${nextLevel.req_ads || 0}` : '(Max)'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#2563eb] transition-all duration-500" style={{ width: `${nextLevel && nextLevel.req_ads > 0 ? Math.min(100, ((user?.total_ads_watched || 0) / nextLevel.req_ads) * 100) : 100}%` }} />
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-500">Tasks Completed</span>
            <span className="text-on-surface dark:text-gray-300">
              {user?.total_tasks_completed || 0} {nextLevel ? `/ ${nextLevel.req_tasks || 0}` : '(Max)'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${nextLevel && nextLevel.req_tasks > 0 ? Math.min(100, ((user?.total_tasks_completed || 0) / nextLevel.req_tasks) * 100) : 100}%` }} />
          </div>
        </div>

        {/* Login Streak */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-500">Login Streak</span>
            <span className="text-on-surface dark:text-gray-300">
              {user?.login_streak || 0} {nextLevel ? `/ ${nextLevel.req_streak || 0}` : '(Max)'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${nextLevel && nextLevel.req_streak > 0 ? Math.min(100, ((user?.login_streak || 0) / nextLevel.req_streak) * 100) : 100}%` }} />
          </div>
        </div>

        {/* Active Referrals */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-500">Active Referrals</span>
            <span className="text-on-surface dark:text-gray-300">
              {activeReferralsCount} {nextLevel ? `/ ${nextLevel.req_referrals || 0}` : '(Max)'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${nextLevel && nextLevel.req_referrals > 0 ? Math.min(100, (activeReferralsCount / nextLevel.req_referrals) * 100) : 100}%` }} />
          </div>
        </div>

        {/* Account Age */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-500">Account Age (Days)</span>
            <span className="text-on-surface dark:text-gray-300">{accountAgeDays} {nextLevel ? `/ ${nextLevel.req_account_age}` : ''}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${nextLevel && nextLevel.req_account_age > 0 ? Math.min(100, (accountAgeDays / nextLevel.req_account_age) * 100) : 100}%` }} />
          </div>
        </div>

        {/* Withdrawal Progress */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-500">Withdrawal Minimum ({minWithdrawal.toLocaleString()} SB)</span>
            <span className="text-on-surface dark:text-gray-300">{(mainWallet?.balance_sb || 0).toLocaleString()} SB</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#2563eb] transition-all duration-500" style={{ width: `${Math.min(100, ((mainWallet?.balance_sb || 0) / (minWithdrawal || 1)) * 100)}%` }} />
          </div>
        </div>

        {/* View All Levels Button */}
        <div className="pt-2">
          <button
            onClick={() => setShowLevelsModal(true)}
            className="w-full py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 rounded-2xl text-xs font-bold text-[#2563eb] dark:text-[#2563eb] flex items-center justify-center gap-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            View All Membership Levels & Perks Matrix
          </button>
        </div>

      </div>

      {/* Levels Overview Modal */}
      {showLevelsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <LevelsOverview onClose={() => setShowLevelsModal(false)} />
          </div>
        </div>
      )}
    </section>
  );
};
