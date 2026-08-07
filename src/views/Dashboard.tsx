import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationCenterModal } from '../components/NotificationCenterModal';
import { LiveWithdrawalToast } from '../components/LiveWithdrawalToast';

export const Dashboard: React.FC = () => {
  const { 
    user, 
    mainWallet,
    transactions, 
    levels, 
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
  const [isCommunityJoined, setIsCommunityJoined] = useState(false);
  const [isVerifyingCommunity, setIsVerifyingCommunity] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem('community_bonus_claimed')) setIsCommunityJoined(true);
    if (!localStorage.getItem('welcome_bonus_claimed')) setShowWelcomeModal(true);
  }, [user]);

  const handleClaimWelcome = () => {
    claimWelcomeBonus();
    setShowWelcomeModal(false);
  };

  const handleJoinCommunity = () => {
    if (!isCommunityJoined && !isVerifyingCommunity) {
      window.open('https://t.me/swagbucks_official', '_blank');
      setIsVerifyingCommunity(true);
    } else if (isVerifyingCommunity) {
      claimCommunityBonus();
      setIsVerifyingCommunity(false);
      setIsCommunityJoined(true);
    }
  };

  // NGN conversion logic (mock: 1 SB = 3 NGN)
  const balanceSB = mainWallet?.balance_sb || 0;
  const balanceNGN = balanceSB * 3;
  const balanceUSDT = mainWallet?.balance_usdt || 0;

  const getPartnerLogo = (name: string) => {
    switch(name) {
      case 'Clickworker': return 'https://logo.clearbit.com/clickworker.com';
      case 'Swagbucks': return 'https://logo.clearbit.com/swagbucks.com';
      case 'Adsterra': return 'https://logo.clearbit.com/adsterra.com';
      case 'Monetag': return 'https://logo.clearbit.com/monetag.com';
      default: return '';
    }
  };

  return (
    <div className="flex-grow pb-32">
      {/* Top App Bar */}
      <header className="sticky top-0 w-full z-30 bg-transparent pt-4">
        <div className="flex justify-between items-center px-container-padding w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[18px] border-2 border-blue-500/30 overflow-hidden bg-[#223b73] shadow-lg">
              <img 
                className="w-full h-full object-cover" 
                alt="Avatar" 
                src={user?.avatar || user?.photo_url || ''} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + (user?.first_name || 'U') + "&background=2563eb&color=fff";
                }}
              />
            </div>
            <div>
              <p className="text-[10px] text-blue-200 leading-tight">Welcome back,</p>
              <h1 className="font-bold text-[15px] text-white leading-tight truncate max-w-[120px]">
                {user?.first_name || 'Member'} {user?.last_name || ''}
              </h1>
            </div>
          </div>
          <button 
            onClick={() => setShowNotificationsModal(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors relative shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-4">
        
        {/* Main Wallet Card */}
        <section className="relative overflow-hidden rounded-[24px] bg-[#1e3b7a] shadow-xl p-6 mx-container-padding text-white border border-blue-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-blue-200 uppercase tracking-wide font-semibold mb-1">Active Balance</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-extrabold">₦{balanceNGN.toLocaleString()}</h2>
                </div>
                <p className="text-[11px] text-blue-200 mt-1">= SB {balanceSB.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-black/20 text-blue-100 text-[10px] font-bold border border-white/5">
                USDT {balanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-black/20 text-blue-100 text-[10px] font-bold border border-white/5">
                Level {userLevel?.name || '1'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setTab('Withdraw')}
                className="py-3 bg-[#4a72ff] hover:bg-blue-500 font-bold text-[13px] text-white rounded-xl shadow-md active:scale-95 transition-transform text-center"
              >
                Withdraw
              </button>
              <button 
                onClick={() => setTab('Task')}
                className="py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-[13px] rounded-xl shadow-md active:scale-95 transition-transform text-center border border-white/10"
              >
                Earn
              </button>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-4 gap-3 px-container-padding mt-6">
          <button onClick={() => setTab('Task')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-[20px] bg-[#223b73] border border-blue-500/20 flex items-center justify-center shadow-md group-active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[26px] text-[#4a72ff]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            </div>
            <span className="text-[11px] font-bold text-blue-100">Watch ads</span>
          </button>
          <button onClick={() => setTab('Task')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-[20px] bg-[#223b73] border border-blue-500/20 flex items-center justify-center shadow-md group-active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[26px] text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
            </div>
            <span className="text-[11px] font-bold text-blue-100">Task</span>
          </button>
          <button onClick={() => setTab('Invite')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-[20px] bg-[#223b73] border border-blue-500/20 flex items-center justify-center shadow-md group-active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[26px] text-purple-400" style={{ fontVariationSettings: "'FILL' 1" }}>group_add</span>
            </div>
            <span className="text-[11px] font-bold text-blue-100">Invite</span>
          </button>
          <button onClick={() => setTab('Records')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-[20px] bg-[#223b73] border border-blue-500/20 flex items-center justify-center shadow-md group-active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[26px] text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            </div>
            <span className="text-[11px] font-bold text-blue-100">Records</span>
          </button>
        </section>

        {/* Lists (Daily Login & Community) */}
        <section className="px-container-padding mt-6 space-y-3">
          {/* Daily Login streak */}
          <div className="bg-[#24428b] rounded-2xl p-4 flex items-center justify-between shadow-lg border border-blue-500/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center text-4xl">
                📅
              </div>
              <div>
                <h3 className="font-bold text-[15px] text-blue-100">Daily Login streak</h3>
                <p className="text-[11px] text-blue-300">Day {dailyStreakDay}/7</p>
              </div>
            </div>
            <button 
              disabled={hasClaimedDailyBonus}
              onClick={() => setShowDailyModal(true)}
              className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition-all ${
                hasClaimedDailyBonus ? 'bg-black/20 text-gray-400 cursor-not-allowed' : 'bg-[#4a72ff] text-white hover:bg-blue-600 active:scale-95'
              }`}
            >
              {hasClaimedDailyBonus ? 'Claimed' : 'Claim'}
            </button>
          </div>

          {/* Join Community */}
          <div className="bg-[#24428b] rounded-2xl p-4 flex items-center justify-between shadow-lg border border-blue-500/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center text-4xl">
                ✈️
              </div>
              <div>
                <h3 className="font-bold text-[15px] text-blue-100">Join our Community</h3>
                <p className="text-[11px] text-blue-300">+500 SB</p>
              </div>
            </div>
            <button 
              disabled={isCommunityJoined}
              onClick={handleJoinCommunity}
              className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition-all ${
                isCommunityJoined ? 'bg-black/20 text-gray-400 cursor-not-allowed' : 'bg-[#4a72ff] text-white hover:bg-blue-600 active:scale-95'
              }`}
            >
              {isCommunityJoined ? 'Joined' : (isVerifyingCommunity ? 'Verify' : 'Join')}
            </button>
          </div>
        </section>

        {/* Verified Partners */}
        <section className="px-container-padding mt-6 space-y-3 pb-8">
          <h3 className="text-white font-extrabold text-[15px]">Verified Partners</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {['Clickworker', 'Swagbucks', 'Adsterra', 'Monetag'].map(partner => (
              <div key={partner} className="flex-shrink-0 bg-[#223b73] border border-blue-500/20 rounded-2xl p-3 w-28 flex flex-col items-center justify-center h-20 shadow-md">
                <img 
                  src={getPartnerLogo(partner)} 
                  alt={partner} 
                  className={`max-w-[70px] max-h-[30px] object-contain`}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    (e.target as HTMLElement).nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-[11px] font-bold text-blue-200">{partner}</span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Modals ... */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 text-center space-y-5 animate-scale-up shadow-2xl">
            <div className="w-20 h-20 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px]">redeem</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-on-surface dark:text-white">Welcome to SwagBox!</h2>
              <p className="text-sm text-gray-500 mt-2">
                Here is your 500 SB welcome bonus to get you started.
              </p>
            </div>
            <button 
              onClick={handleClaimWelcome}
              className="w-full py-3.5 bg-primary text-white font-bold text-sm rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              Claim 500 SB Bonus
            </button>
          </div>
        </div>
      )}

      {showDailyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up relative p-6">
            <button 
              onClick={() => setShowDailyModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <h2 className="text-xl font-bold">Daily Login Streak</h2>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div key={day} className={`flex flex-col items-center p-2 rounded-xl border ${dailyStreakDay === day && !hasClaimedDailyBonus ? 'bg-orange-50 border-orange-500' : (dailyStreakDay > day || (dailyStreakDay === day && hasClaimedDailyBonus)) ? 'bg-primary/10 border-primary' : 'bg-gray-50 border-gray-200'}`}>
                  <span className="text-[10px] font-bold text-gray-400">Day {day}</span>
                  <span className={`text-xs font-bold mt-1 ${dailyStreakDay === day && !hasClaimedDailyBonus ? 'text-orange-600' : (dailyStreakDay > day || (dailyStreakDay === day && hasClaimedDailyBonus)) ? 'text-primary' : 'text-gray-500'}`}>
                    {day * 50}
                  </span>
                </div>
              ))}
            </div>

            <button
              disabled={hasClaimedDailyBonus}
              onClick={() => {
                claimDailyBonus();
                setShowDailyModal(false);
              }}
              className={`w-full py-3 rounded-2xl font-bold transition-all ${hasClaimedDailyBonus ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white active:scale-95 shadow-lg'}`}
            >
              {hasClaimedDailyBonus ? 'Come back tomorrow' : 'Claim Reward'}
            </button>
          </div>
        </div>
      )}

      {showNotificationsModal && (
        <NotificationCenterModal onClose={() => setShowNotificationsModal(false)} />
      )}
    </div>
  );
};
export default Dashboard;
