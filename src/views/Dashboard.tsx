import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MembershipCard } from '../components/MembershipCard';
import { NotificationCenterModal } from '../components/NotificationCenterModal';
import { LiveWithdrawalToast } from '../components/LiveWithdrawalToast';

export const Dashboard: React.FC = () => {
  const { 
    user, 
    wallet, 
    transactions, 
    levels, 
    systemSettings,
    setTab, 
    claimDailyBonus,
    claimWelcomeBonus,
    claimCommunityBonus,
    hasClaimedDailyBonus,
    dailyStreakDay
  } = useApp();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isCommunityJoined, setIsCommunityJoined] = useState(false);
  const [isVerifyingCommunity, setIsVerifyingCommunity] = useState(false);

  useEffect(() => {
    // Basic auth check
    if (!user) return;
    
    // Auto-fetch dashboard data
    if (localStorage.getItem('community_bonus_claimed')) {
      setIsCommunityJoined(true);
    }
  }, [user]);

  const handleClaimWelcome = () => {
    claimWelcomeBonus();
    setShowWelcomeModal(false);
  };

  const handleJoinCommunity = () => {
    if (!isCommunityJoined && !isVerifyingCommunity) {
      window.open('https://t.me/taskcash_official', '_blank');
      setIsVerifyingCommunity(true);
    } else if (isVerifyingCommunity) {
      claimCommunityBonus();
      setIsVerifyingCommunity(false);
      setIsCommunityJoined(true);
    }
  };

  const handleWithdrawClick = () => {
    setTab('Withdraw');
  };

  const level1TargetSetting = systemSettings?.find(s => s.key === 'level1_withdrawal_target')?.value;
  const targetAmount = level1TargetSetting ? parseFloat(level1TargetSetting) : 30000;
  
  const eligibleBalance = wallet?.active_balance || 0;
  const remainingAmount = Math.max(0, targetAmount - eligibleBalance);
  const progressPercent = Math.min(100, Math.round((eligibleBalance / targetAmount) * 100));

  const todayStr = new Date().toDateString();
  const todayEarnings = transactions
    .filter(t => new Date(t.timestamp).toDateString() === todayStr && t.status === 'Success' && t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingRewards = transactions
    .filter(t => t.status === 'Pending' && t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const earningStreak = user?.login_streak || 1;
  const availableActivities = 3 + (useApp().tasks?.filter(t => t.status === 'Active').length || 0);
  const isLevel1MilestoneReached = eligibleBalance >= targetAmount;

  return (
    <div className="flex-grow pb-32">
      {/* Top App Bar */}
      <header className="sticky top-0 w-full z-30 bg-[#f8f9ff]/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden bg-gray-200">
              <img 
                className="w-full h-full object-cover" 
                alt="Avatar" 
                src={user?.avatar} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuCVTKlyggqz5sCXesavqzKPCSJ4KXoCGlgCc8lz_jaPYv_5AQRavF-pvfr6PwucqaXWhwc6Cpw4vfXffqz_cXEk6H0CTtrwG1Kntsj-GR9YG9PNUuq320uFZxButjHsDwLSNPGeUJ2tTsOrGMkV6eDMkbdzqGzC10Ot2XT6vYjQHIJfnbizlg0JjUhc8GgrTm3h3YH68e4e3H_Tr_JAKMrVndxN_nktv37HXYWp6FOKBaHnR5WKMV8q";
                }}
              />
            </div>
            <div>
              <h1 className="font-bold text-[16px] text-on-surface dark:text-white leading-tight">
                Good morning, {user?.first_name || 'Willie'} 👋
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[9px] font-extrabold uppercase tracking-wider mt-1">
                {userLevel.name}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowNotificationsModal(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant dark:text-gray-400 bg-surface-container/50 dark:bg-zinc-800/40 relative hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-background animate-pulse"></span>
          </button>
        </div>
      </header>

      {/* Live Floating Ticker for Nigerian Cash-outs (Outside document flow so no cards are pushed) */}
      <LiveWithdrawalToast onOpenNotifications={() => setShowNotificationsModal(true)} />

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-6">
        
        {/* 1. Wallet / Balance Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#0051d5] p-6 shadow-xl text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-1">Active Balance</p>
                <h2 className="text-3xl font-extrabold tracking-tight">₦{(wallet?.active_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              </div>
              <div className="bg-white/20 glass-effect p-2 rounded-xl border border-white/20">
                <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance_wallet
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                <p className="text-[9px] font-bold opacity-75 uppercase tracking-wide">Lifetime Earnings</p>
                <p className="font-bold text-[15px] mt-0.5">₦{(wallet?.lifetime_earnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                <p className="text-[9px] font-bold opacity-75 uppercase tracking-wide">Earning Speed</p>
                <p className="font-bold text-[15px] mt-0.5">{userLevel.earning_multiplier.toFixed(1)}x Multiplier</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleWithdrawClick}
                className="w-full py-3 px-4 bg-white text-primary dark:text-primary font-bold rounded-2xl shadow-md active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 text-xs"
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                Withdraw
              </button>
            </div>
          </div>
        </section>

        {/* 2. Quick Actions Shortcuts */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            <button 
              onClick={() => setTab('WatchEarn')}
              className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-3 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">play_circle</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface dark:text-gray-300">Watch Ads</span>
            </button>

            <button 
              onClick={() => setTab('Tasks')}
              className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-3 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">assignment</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface dark:text-gray-300">Tasks</span>
            </button>

            <button 
              onClick={() => setTab('Invite')}
              className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-3 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">group_add</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface dark:text-gray-300">Invite</span>
            </button>

            <button 
              onClick={() => setTab('History')}
              className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-3 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">history</span>
              </div>
              <span className="text-[10px] font-bold text-on-surface dark:text-gray-300">History</span>
            </button>
          </div>
        </section>

        {/* 3. Daily Bonus Section */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                emoji_events
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface dark:text-white">Daily Login streak</h3>
              <p className="text-xs text-on-surface-variant dark:text-gray-400 mt-0.5">Claim daily rewards streak bonuses</p>
            </div>
          </div>
          <button 
            disabled={hasClaimedDailyBonus}
            onClick={() => setShowDailyModal(true)}
            className={`px-4 py-2 font-bold text-xs rounded-full shadow-md active:scale-95 transition-all duration-150 ${
              hasClaimedDailyBonus ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-amber-500 text-white shadow-amber-500/25'
            }`}
          >
            {hasClaimedDailyBonus ? 'Claimed' : 'Claim'}
          </button>
        </section>

        {/* 4. Telegram Community Bonus Section */}
        <section className="bg-gradient-to-r from-[#0088cc] to-[#00a2f5] border border-[#0088cc] rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 glass-effect flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">send</span>
            </div>
            <div>
              <h3 className="font-bold text-sm">Join our Community</h3>
              <p className="text-[10px] text-white/80 mt-0.5">Earn ₦500 instantly for joining</p>
            </div>
          </div>
          <button 
            disabled={isCommunityJoined}
            onClick={handleJoinCommunity}
            className={`px-4 py-2 font-bold text-xs rounded-full shadow-md active:scale-95 transition-all duration-150 ${
              isCommunityJoined ? 'bg-white/20 text-white cursor-not-allowed shadow-none' : 'bg-white text-[#0088cc]'
            }`}
          >
            {isCommunityJoined ? 'Joined' : (isVerifyingCommunity ? 'Verify' : 'Join')}
          </button>
        </section>

        {/* 5. Verified Task Partners Section */}
        <section className="space-y-3 mt-6">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400 text-center">Verified Task Partners</h3>
          <div className="flex justify-center items-center gap-6 opacity-70 flex-wrap px-2">
            <img src="/swagbucks-logo.png" alt="Swagbucks" className="h-5 hover:opacity-100 transition-all duration-300 object-contain" />
            <img src="/clickworker-logo.png" alt="Clickworker" className="h-5 hover:opacity-100 transition-all duration-300 object-contain" />
            <img src="/adsterra.png" alt="Adsterra" className="h-5 hover:opacity-100 transition-all duration-300 object-contain" />
            <img src="/monetag-logo.png" alt="Monetag" className="h-5 hover:opacity-100 transition-all duration-300 object-contain" />
          </div>
        </section>

        {/* 6. Level 1 Earning Progression & Target Card */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-on-surface dark:text-white">Level 1 Withdrawal Milestone</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Target: ₦{targetAmount.toLocaleString()}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-full border border-emerald-500/20">
              {progressPercent}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-on-surface dark:text-gray-200">₦{eligibleBalance.toLocaleString()} of ₦{targetAmount.toLocaleString()} earned</span>
              <span className="text-gray-500 dark:text-gray-400">₦{remainingAmount.toLocaleString()} remaining</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-primary rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Real Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Today's Earnings</p>
              <p className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">+₦{todayEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Earning Streak</p>
              <p className="font-extrabold text-xs text-amber-500 mt-0.5">{earningStreak} Days 🔥</p>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Pending Rewards</p>
              <p className="font-extrabold text-xs text-blue-500 mt-0.5">₦{pendingRewards.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Activities Open</p>
              <p className="font-extrabold text-xs text-purple-500 mt-0.5">{availableActivities} Available</p>
            </div>
          </div>

          {/* Milestone Completion Banner */}
          {isLevel1MilestoneReached && (
            <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-primary/15 border border-emerald-500/40 rounded-2xl p-4 space-y-3 mt-3">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-500 text-[28px]">emoji_events</span>
                <div>
                  <h4 className="font-extrabold text-xs text-on-surface dark:text-white">
                    Congratulations! You have completed the Level 1 earning milestone.
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">
                    Upgrade to unlock higher earning limits and access to more available earning opportunities.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">military_tech</span>
                  View Upgrade Options
                </button>
                <button 
                  onClick={() => setTab('Tasks')}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-on-surface dark:text-white font-bold text-xs rounded-xl active:scale-95 transition-all"
                >
                  Continue Earning
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Level Progress Membership Card */}
        <MembershipCard />

        {/* 7. Recent Timeline Feed */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400">Recent Transactions</h3>
            <button 
              onClick={() => setTab('History')}
              className="text-xs font-bold text-primary dark:text-[#62df7d] hover:opacity-80 transition-opacity"
            >
              View All
            </button>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            {transactions.slice(0, 3).map((tx) => {
              const isIncome = tx.type !== 'Withdrawal' && tx.type !== 'LevelUpgrade';
              return (
                <div key={tx.id} className="flex justify-between items-center border-b border-gray-50 dark:border-zinc-800/50 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'WatchReward' ? 'bg-primary/10 text-primary' :
                      tx.type === 'TaskReward' ? 'bg-secondary/10 text-secondary' :
                      tx.type === 'LevelUpgrade' ? 'bg-orange-500/10 text-orange-500' :
                      tx.type === 'Withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {tx.type === 'WatchReward' ? 'play_circle' :
                         tx.type === 'TaskReward' ? 'assignment' :
                         tx.type === 'LevelUpgrade' ? 'upgrade' :
                         tx.type === 'Withdrawal' ? 'payments' : 'monetization_on'}
                      </span>
                    </div>
                    <div className="max-w-[180px]">
                      <p className="font-bold text-xs text-on-surface dark:text-gray-200 truncate">{tx.description}</p>
                      <p className="text-[10px] text-on-surface-variant dark:text-gray-400 mt-0.5">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-xs ${isIncome ? 'text-primary dark:text-[#62df7d]' : 'text-orange-500 dark:text-orange-400'}`}>
                      {isIncome ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                    <span className={`inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase mt-1 ${
                      tx.status === 'Success' ? 'bg-green-500/15 text-green-600' :
                      tx.status === 'Pending' ? 'bg-amber-500/15 text-amber-600' : 'bg-red-500/15 text-red-600'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* Welcome Bonus Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 text-center space-y-5 animate-scale-up shadow-2xl">
            <div className="w-20 h-20 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px]">redeem</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-on-surface dark:text-white">Welcome to TaskCash!</h2>
              <p className="text-sm text-on-surface-variant dark:text-gray-400 mt-2">
                Here is your ₦500 welcome bonus to get you started on your earning journey.
              </p>
            </div>
            <button 
              onClick={handleClaimWelcome}
              className="w-full py-3.5 bg-primary text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition-all"
            >
              Claim ₦500 Bonus
            </button>
          </div>
        </div>
      )}
      {/* Daily Bonus Modal */}
      {showDailyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up relative p-6">
            <button 
              onClick={() => setShowDailyModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              </div>
              <h2 className="text-xl font-bold">Daily Rewards Streak</h2>
              <p className="text-sm text-gray-500 mt-1">Login consecutively to earn bigger rewards!</p>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div key={day} className={`flex flex-col items-center p-2 rounded-xl border ${dailyStreakDay === day && !hasClaimedDailyBonus ? 'bg-amber-50 border-amber-500 dark:bg-amber-500/10 dark:border-amber-500' : (dailyStreakDay > day || (dailyStreakDay === day && hasClaimedDailyBonus)) ? 'bg-green-50 border-green-500 dark:bg-green-500/10 dark:border-green-500' : 'bg-gray-50 border-gray-100 dark:bg-zinc-800 dark:border-zinc-700'}`}>
                  <span className="text-[10px] font-bold text-gray-400">Day {day}</span>
                  <span className={`text-xs font-bold mt-1 ${dailyStreakDay === day && !hasClaimedDailyBonus ? 'text-amber-600 dark:text-amber-400' : (dailyStreakDay > day || (dailyStreakDay === day && hasClaimedDailyBonus)) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    ₦{day * 50}
                  </span>
                  {(dailyStreakDay > day || (dailyStreakDay === day && hasClaimedDailyBonus)) && (
                    <span className="material-symbols-outlined text-green-500 text-[14px] mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </div>
              ))}
            </div>

            <button
              disabled={hasClaimedDailyBonus}
              onClick={() => {
                claimDailyBonus();
                setShowDailyModal(false);
              }}
              className={`w-full py-3 rounded-2xl font-bold transition-all ${hasClaimedDailyBonus ? 'bg-gray-100 text-gray-400 dark:bg-zinc-800 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95 shadow-lg shadow-amber-500/30'}`}
            >
              {hasClaimedDailyBonus ? 'Come back tomorrow' : 'Claim Today\'s Reward'}
            </button>
          </div>
        </div>
      )}

      {/* Notification Center Modal */}
      {showNotificationsModal && (
        <NotificationCenterModal onClose={() => setShowNotificationsModal(false)} />
      )}

      {/* Level Upgrade Options Modal (Requirement 8) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[28px]">military_tech</span>
                <div>
                  <h3 className="font-extrabold text-base text-on-surface dark:text-white">Upgrade Level Options</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Unlock higher daily limits and faster earning</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 flex items-center justify-center hover:bg-gray-200"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span>Current Level: {userLevel.name}</span>
                <span>Active Balance: ₦{eligibleBalance.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                You have reached the Level 1 milestone! Upgrading unlocks higher daily rewarded ad views, higher daily task capacity, and a higher earning multiplier.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Available Tier Upgrade</h4>
              <div className="bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-extrabold text-sm text-on-surface dark:text-white">Level 2 (Active Tier)</h5>
                    <p className="text-[10px] text-emerald-500 font-bold">1.2x Earning Multiplier</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary font-black text-xs rounded-full">
                    Free / Requirement Based
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
                  <p>• Upgrade Cost: <strong className="text-on-surface dark:text-white">₦0.00</strong></p>
                  <p>• Balance After Upgrade: <strong className="text-emerald-500">₦{eligibleBalance.toLocaleString()}</strong></p>
                  <p>• New Limits: <strong className="text-on-surface dark:text-white">30 ads/day • 15 tasks/day</strong></p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setTab('Profile');
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Proceed to Tier Verification
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-bold text-xs rounded-2xl active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
