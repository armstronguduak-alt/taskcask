import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useReward } from '../components/RewardCelebration';
import { NotificationCenterModal } from '../components/NotificationCenterModal';
import { Avatar } from '../components/Avatar';

export const Dashboard: React.FC = () => {
  const { 
    user, 
    mainWallet,
    levels, 
    setTab, 
    claimDailyBonus,
    claimWelcomeBonus,
    claimCommunityBonus,
    hasClaimedDailyBonus,
    dailyStreakDay,
    isCommunityJoined,
    refreshState
  } = useApp();
  const { triggerReward } = useReward();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [isVerifyingCommunity, setIsVerifyingCommunity] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!localStorage.getItem('welcome_bonus_claimed')) setShowWelcomeModal(true);
  }, [user]);

  const handleClaimWelcome = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const res = await claimWelcomeBonus();
    if (res.success) {
      triggerReward({
        amount: res.amount!,
        currency: res.currency!,
        source: e.currentTarget,
        destinationId: `wallet-${res.currency!.toLowerCase()}`,
        onComplete: refreshState
      });
    }
    setShowWelcomeModal(false);
  };

  const handleJoinCommunity = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isCommunityJoined && !isVerifyingCommunity) {
      const link = 'https://t.me/swagbucks_official';
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.openTelegramLink) tg.openTelegramLink(link);
      else if (tg && tg.openLink) tg.openLink(link);
      else window.open(link, '_blank');
      
      setIsVerifyingCommunity(true);
    } else if (isVerifyingCommunity) {
      const res = await claimCommunityBonus();
      if (res.success) {
        triggerReward({
          amount: res.amount!,
          currency: res.currency!,
          source: e.currentTarget,
          destinationId: `wallet-${res.currency!.toLowerCase()}`,
          onComplete: refreshState
        });
      }
      setIsVerifyingCommunity(false);
    }
  };

  // NGN conversion logic (mock: 30000 SB = 20000 NGN)
  const balanceSB = mainWallet?.balance_sb || 0;
  const balanceNGN = balanceSB * (20000/30000);
  const balanceUSDT = mainWallet?.balance_usdt || 0;

  const getPartnerLogo = (name: string) => {
    switch(name) {
      case 'Clickworker': return '/clickworker-logo.png';
      case 'Swagbucks': return '/swagbucks-logo.png';
      case 'Adsterra': return '/adsterra.png';
      case 'Monetag': return '/monetag-logo.png';
      default: return '';
    }
  };

  return (
    <div className="flex-grow pb-32">
      {/* Top App Bar */}
      <header className="sticky top-0 w-full z-30 bg-transparent pt-4">
        <div className="flex justify-between items-center px-container-padding w-full">
          <div className="flex items-center gap-3">
            <Avatar 
              src={user?.avatar || user?.photo_url || ''} 
              name={user?.first_name || 'User'} 
              size="md" 
              className="!w-12 !h-12 !rounded-[18px] border-2 border-blue-500/30 shadow-lg"
            />
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
          
          <div className="relative z-10 flex flex-col">
            
            {/* Top Balances Row (SB & USDT using Real Logos) */}
            <div className="flex justify-center items-center gap-3">
              <div id="wallet-sb" className="flex items-center gap-2 bg-[#132252] border border-blue-500/30 px-4 py-2 rounded-2xl shadow-inner">
                <img src="/swagbucks coin logo.png" className="w-6 h-6 object-contain" alt="SB" />
                <span className="text-[18px] font-extrabold tracking-tight text-white">{balanceSB.toLocaleString('en-US')}</span>
              </div>
              <div id="wallet-usdt" className="flex items-center gap-2 bg-[#132252] border border-blue-500/30 px-3 py-2 rounded-2xl shadow-inner">
                <img src="/usdt coin logo.png" className="w-5 h-5 object-contain" alt="USDT" />
                <span className="text-[14px] font-bold text-white">${balanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Active Balance Label & Conversion */}
            <div className="text-center mt-5 mb-6">
              <h3 className="text-[15px] text-blue-200 font-bold mb-1" style={{ fontFamily: 'cursive' }}>Active Balance</h3>
              <div className="text-[28px] font-extrabold tracking-tight text-white drop-shadow-md">
                ₦{balanceNGN.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[14px] font-bold text-blue-200 mt-1">
                ≈ {balanceSB.toLocaleString('en-US')} SB
              </div>
            </div>

            {/* Bottom Actions and Level Tag */}
            <div className="flex justify-between items-end">
              {/* Withdraw Button (Left) */}
              <button 
                onClick={() => setTab('Withdraw')}
                className="py-4 px-8 bg-transparent border-2 border-white hover:bg-white/10 font-bold text-[15px] text-white rounded-[20px] active:scale-95 transition-all shadow-md"
              >
                Withdraw
              </button>
              
              {/* Level & Earn Button (Right) */}
              <div className="flex flex-col items-center gap-2">
                <span className="inline-flex items-center px-5 py-1.5 rounded-[12px] bg-black/30 text-amber-400 text-[12px] font-bold border border-white/5 shadow-inner">
                  Level {userLevel?.name || 'Silver'}
                </span>
                <button 
                  onClick={() => setTab('Task')}
                  className="py-3 px-8 bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold text-[14px] rounded-[16px] shadow-md active:scale-95 transition-all"
                >
                  Earn
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-4 gap-3 px-container-padding mt-8">
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
              <span className="material-symbols-outlined text-[26px] text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
            </div>
            <span className="text-[11px] font-bold text-blue-100">History</span>
          </button>
        </section>

        {/* Action Cards (Daily Login & Community) */}
        <section className="px-container-padding mt-8 space-y-4">
          
          {/* Daily Login streak */}
          <div className="bg-[#24428b] rounded-2xl p-4 flex items-center justify-between shadow-lg border border-blue-500/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center text-4xl">
                📅
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-[15px] text-blue-100">Daily Login streak</h3>
                <p className="text-[11px] text-blue-300">chain daily reward streak bonus.</p>
              </div>
            </div>
            <button 
              disabled={hasClaimedDailyBonus}
              onClick={() => setShowDailyModal(true)}
              className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition-all flex-shrink-0 ${
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
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-[15px] text-blue-100">Join our Telegram community</h3>
                <p className="text-[11px] text-blue-300">Earn SB 500</p>
              </div>
            </div>
            <button 
              disabled={isCommunityJoined}
              onClick={handleJoinCommunity}
              className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition-all flex-shrink-0 ${
                isCommunityJoined ? 'bg-black/20 text-gray-400 cursor-not-allowed' : 'bg-[#4a72ff] text-white hover:bg-blue-600 active:scale-95'
              }`}
            >
              {isCommunityJoined ? 'Joined' : (isVerifyingCommunity ? 'Verify' : 'Join')}
            </button>
          </div>
        </section>

        {/* Verified Partners */}
        <section className="px-container-padding mt-8 space-y-4 pb-8">
          <h3 className="text-white font-extrabold text-[15px] text-center">Verified Partners</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['Clickworker', 'Swagbucks', 'Adsterra', 'Monetag'].map(partner => (
              <div key={partner} className="bg-transparent p-3 w-[88px] flex flex-col items-center justify-center h-[88px]">
                <img 
                  src={getPartnerLogo(partner)} 
                  alt={partner} 
                  className={`max-w-[70px] max-h-[30px] object-contain`}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    (e.target as HTMLElement).nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-[10px] font-bold text-blue-200 uppercase tracking-wider">{partner}</span>
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
              className="w-full py-4 bg-[#4a72ff] hover:bg-blue-600 text-white font-bold text-[16px] rounded-[16px] shadow-lg active:scale-95 transition-all"
            >
              Claim Bonus
            </button>
          </div>
        </div>
      )}
      {showDailyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1e3b7a] border border-blue-500/30 w-full max-w-sm rounded-[32px] p-6 text-center shadow-2xl relative">
            <button 
              onClick={() => setShowDailyModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <div className="text-center mb-4 mt-2">
              <div className="w-16 h-16 mx-auto bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center border-4 border-[#1e3b7a] shadow-lg mb-2">
                <span className="material-symbols-outlined text-[36px]">auto_awesome</span>
              </div>
              <h2 className="text-[20px] font-black text-white">28-Day Streak</h2>
              <p className="text-[12px] text-blue-200 mt-1">
                Log in daily to earn bigger rewards!
              </p>
            </div>
            
            <div className="flex flex-col gap-3 mb-6 max-h-[300px] overflow-y-auto no-scrollbar p-1">
              {[1, 2, 3, 4].map(week => (
                <div key={week} className="bg-[#132252]/50 rounded-2xl p-2 border border-white/5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-300/80 mb-2 ml-1 text-left">Week {week}</h3>
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: 7 }, (_, i) => (week - 1) * 7 + i + 1).map(day => {
                      const isClaimed = dailyStreakDay > day || (dailyStreakDay === day && hasClaimedDailyBonus);
                      const isToday = dailyStreakDay === day && !hasClaimedDailyBonus;
                      
                      const dayInWeek = ((day - 1) % 7) + 1;
                      let rewardStr = "100";
                      let currencyStr = "SB";
                      if (dayInWeek === 3) { rewardStr = "0.05"; currencyStr = "USDT"; }
                      else if (dayInWeek === 5) { rewardStr = "0.25"; currencyStr = "USDT"; }
                      else if (dayInWeek === 7) { rewardStr = "150"; currencyStr = "SB"; }
                      
                      return (
                        <div key={day} className={`flex flex-col items-center justify-center py-2 px-1 rounded-[10px] border ${
                          isToday ? 'bg-orange-500/20 border-orange-500/50 shadow-inner scale-105' : 
                          isClaimed ? 'bg-[#4a72ff]/20 border-[#4a72ff]/30' : 
                          'bg-[#132252] border-white/5'
                        }`}>
                          <span className={`text-[8px] font-extrabold tracking-tight ${
                            isToday ? 'text-orange-300' : isClaimed ? 'text-[#4a72ff]' : 'text-blue-300/40'
                          }`}>
                            D{day}
                          </span>
                          <span className={`text-[10px] font-black mt-1 leading-none ${
                            isToday ? 'text-orange-400' : isClaimed ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {rewardStr}
                          </span>
                          <span className={`text-[7px] font-bold mt-0.5 ${
                             currencyStr === 'USDT' ? 'text-[#00ffa3]' : (isClaimed ? 'text-blue-300/80' : 'text-gray-600')
                          }`}>
                            {currencyStr}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button 
              disabled={hasClaimedDailyBonus}
              onClick={async (e) => {
                const res = await claimDailyBonus();
                if (res.success) {
                  triggerReward({
                    amount: res.amount!,
                    currency: res.currency!,
                    source: e.currentTarget,
                    destinationId: `wallet-${res.currency!.toLowerCase()}`,
                    onComplete: refreshState
                  });
                }
                setShowDailyModal(false);
              }}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[16px] rounded-[16px] shadow-lg active:scale-95 transition-all"
            >
              Collect
            </button>
          </div>
        </div>
      )}

      {showNotificationsModal && <NotificationCenterModal onClose={() => setShowNotificationsModal(false)} />}
    </div>
  );
};

export default Dashboard;
