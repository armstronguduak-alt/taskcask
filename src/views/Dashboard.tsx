import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MembershipCard } from '../components/MembershipCard';

export const Dashboard: React.FC = () => {
  const { 
    user, 
    wallet, 
    transactions, 
    levels, 
    notifications,
    setTab, 
    claimDailyBonus,
    claimWelcomeBonus,
    claimCommunityBonus
  } = useApp();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
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
            onClick={() => alert(`You have ${notifications.length} notifications.`)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant dark:text-gray-400 bg-surface-container/50 dark:bg-zinc-800/40 relative hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-background"></span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-6">
        
        {/* Wallet Card */}
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

        {/* Level Progress Card */}
        <MembershipCard />

        {/* Daily Bonus Section */}
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
            onClick={claimDailyBonus}
            className="px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded-full shadow-md shadow-amber-500/25 active:scale-95 transition-all duration-150"
          >
            Claim
          </button>
        </section>

        {/* Telegram Community Bonus Section */}
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

        {/* Our Partners Section */}
        <section className="space-y-3 mt-6">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400 text-center">Verified Task Partners</h3>
          <div className="flex justify-center items-center gap-8 opacity-70">
            <img src="/swagbucks-logo.png" alt="Swagbucks" className="h-6 hover:opacity-100 transition-all duration-300 object-contain" />
            <img src="/clickworker-logo.png" alt="Clickworker" className="h-6 hover:opacity-100 transition-all duration-300 object-contain" />
          </div>
        </section>

        {/* Quick Actions Shortcuts */}
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

        {/* Recent Timeline Feed */}
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
    </div>
  );
};
export default Dashboard;
