import React from 'react';
import { useApp } from '../context/AppContext';

export const MembershipCard: React.FC = () => {
  const { user, levels, sdkLogs, transactions, users, wallet, systemSettings } = useApp();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];
  const nextLevel = levels.find(l => l.cost > userLevel.cost) || levels.find(l => 
    l.req_streak > (user?.login_streak || 0) || 
    l.req_ads > (user?.total_ads_watched || 0) || 
    l.req_tasks > (user?.total_tasks_completed || 0)
  ); // Fallback logic for determining next level

  // Calculate Daily Videos Remaining (across all categories for simplicity, or sum them)
  const today = new Date().toDateString();
  const adsWatchedToday = sdkLogs.filter(
    log => new Date(log.timestamp).toDateString() === today && log.action === 'AD_PLAY_COMPLETE_SUCCESS'
  ).length;
  const maxDailyAds = userLevel.max_daily_ads_cat_a + userLevel.max_daily_ads_cat_b + userLevel.max_daily_ads_cat_c;
  const dailyVideosRemaining = Math.max(0, maxDailyAds - adsWatchedToday);

  // Calculate Daily Tasks Remaining
  const tasksCompletedToday = transactions.filter(
    t => t.type === 'TaskReward' && new Date(t.timestamp).toDateString() === today && t.status === 'Success'
  ).length;
  const dailyTasksRemaining = Math.max(0, userLevel.max_daily_tasks - tasksCompletedToday);

  const referralReqSetting = systemSettings.find(s => s.key === 'referral_active_ads_req')?.value;
  const activeAdsReq = referralReqSetting ? parseInt(referralReqSetting) : 10;
  
  const activeReferralsCount = users.filter(
    u => u.referrer_id === user?.id && (u.total_ads_watched || 0) >= activeAdsReq
  ).length; // Filter by active ads

  const accountAgeDays = Math.floor((new Date().getTime() - new Date(user?.registered_at || new Date()).getTime()) / (1000 * 3600 * 24));
  const minWithdrawal = userLevel?.min_withdrawal || 0;

  return (
    <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="font-bold text-sm text-on-surface dark:text-white uppercase tracking-wider">Membership Card</h3>
          <p className="text-[10px] text-on-surface-variant dark:text-gray-400 mt-0.5">Your current status and daily limits</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider">
            {userLevel.name}
          </span>
          {nextLevel && (
            <p className="text-[9px] text-gray-500 mt-1">Next: {nextLevel.name}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Daily Stats */}
        <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-2xl">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold mb-1">Daily Videos Remaining</p>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">play_circle</span>
            <span className="font-bold text-sm dark:text-white">{dailyVideosRemaining} / {maxDailyAds}</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-2xl">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold mb-1">Daily Tasks Remaining</p>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">assignment</span>
            <span className="font-bold text-sm dark:text-white">{dailyTasksRemaining} / {userLevel.max_daily_tasks}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lifetime Progress</h4>
        
        {/* Rewarded Videos Completed */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-500">Rewarded Videos</span>
            <span className="text-on-surface dark:text-gray-300">{user?.total_ads_watched || 0} {nextLevel ? `/ ${nextLevel.req_ads}` : ''}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${nextLevel && nextLevel.req_ads > 0 ? Math.min(100, ((user?.total_ads_watched || 0) / nextLevel.req_ads) * 100) : 100}%` }} />
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-500">Tasks Completed</span>
            <span className="text-on-surface dark:text-gray-300">{user?.total_tasks_completed || 0} {nextLevel ? `/ ${nextLevel.req_tasks}` : ''}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${nextLevel && nextLevel.req_tasks > 0 ? Math.min(100, ((user?.total_tasks_completed || 0) / nextLevel.req_tasks) * 100) : 100}%` }} />
          </div>
        </div>

        {/* Login Streak */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-500">Login Streak</span>
            <span className="text-on-surface dark:text-gray-300">{user?.login_streak || 0} {nextLevel ? `/ ${nextLevel.req_streak}` : ''}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${nextLevel && nextLevel.req_streak > 0 ? Math.min(100, ((user?.login_streak || 0) / nextLevel.req_streak) * 100) : 100}%` }} />
          </div>
        </div>

        {/* Active Referrals */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-500">Active Referrals</span>
            <span className="text-on-surface dark:text-gray-300">{activeReferralsCount} {nextLevel ? `/ ${nextLevel.req_referrals}` : ''}</span>
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
            <span className="text-gray-500">Withdrawal Minimum (₦{minWithdrawal.toLocaleString()})</span>
            <span className="text-on-surface dark:text-gray-300">₦{(wallet?.active_balance || 0).toLocaleString()}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${Math.min(100, ((wallet?.active_balance || 0) / minWithdrawal) * 100)}%` }} />
          </div>
        </div>

      </div>
    </section>
  );
};
