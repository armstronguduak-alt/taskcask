import React from 'react';
import { useApp } from '../context/AppContext';

export const WatchEarn: React.FC = () => {
  const { 
    mainWallet, 
    rewardedAds, 
    playAd, 
    levels,
    user,
    transactions,
    systemSettings
  } = useApp();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];

  // Calculate daily progress across all categories
  const today = new Date().toDateString();
  const adsWatchedToday = transactions.filter(
    t => new Date(t.timestamp).toDateString() === today && t.type === 'AdViewImpressions'
  ).length;
  const maxDailyAds = (userLevel?.max_daily_ads_cat_a || 0) + (userLevel?.max_daily_ads_cat_b || 0) + (userLevel?.max_daily_ads_cat_c || 0);

  return (
    <div className="flex-grow pb-32 bg-[#f8f9ff] dark:bg-[#09090b]">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 w-full z-30 bg-[#f8f9ff]/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-[#2563eb]">Watch & Earn</h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#2563eb]/10 rounded-full">
            <span className="material-symbols-outlined text-[#2563eb] text-[16px] font-fill">account_balance_wallet</span>
            <span className="text-xs font-bold text-[#2563eb]">{(mainWallet?.balance_sb || 0).toLocaleString()} SB</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-6">
        
        {/* Video Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl aspect-video bg-[#002109] shadow-lg flex items-center justify-center">
          <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-700 hover:scale-105" 
               style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBi600A8JjewTj2DWvsdi3hVhmaMBUC_IIC-zrY9-r3JqqxYaxZhrfy0GtXIWeBeNOOaRBibqhnXuoTgnDxfiA-j-fON5dNhs6oM3Nls74s8GU8ocdqo7MKyebqFiXIwiVx23BAtJmdBjmFMLqUINm3cWZZyl6fi0oAijU0m_5KkHFpZdHSDLy0V_LP9_PmEc9JE3ChoymnSk-_ycoRKFt-y3yEhE8RqLl88JWMM2QCCZm4gYdhiAD-')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <button 
              onClick={() => rewardedAds.length > 0 && playAd(rewardedAds[0])}
              className="w-16 h-16 bg-white/20 glass-effect rounded-full flex items-center justify-center border border-white/30 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-white text-[40px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </button>
            <div className="text-white">
              <h3 className="font-bold text-sm">Play High-Yield Campaign</h3>
              <p className="text-[10px] text-gray-300 mt-0.5">Earn up to 35 SB per 15-second ad</p>
            </div>
          </div>
        </section>

        {/* Daily limit alert */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-on-surface dark:text-gray-300">Daily Task Progress</span>
            <span className="font-bold text-[#2563eb]">{adsWatchedToday}/{maxDailyAds}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-[#2563eb] rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, maxDailyAds > 0 ? (adsWatchedToday / maxDailyAds) * 100 : 0)}%` }}
            />
          </div>
        </section>

        {/* Ads Cards list */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400">Available Ad Campaigns</h3>
          
          <div className="space-y-4">
            {rewardedAds.filter((ad) => {
              const enabledSetting = systemSettings.find(s => s.key === `enabled_cat_${ad.category}`)?.value;
              return enabledSetting !== 'false';
            }).map((ad) => {
              const rewardSetting = systemSettings.find(s => s.key === `reward_cat_${ad.category}`)?.value;
              const baseReward = rewardSetting ? parseFloat(rewardSetting) : ad.reward_amount;
              const multipliedReward = Math.round(baseReward * (userLevel?.earning_multiplier || 1));
              
              const catLimit = ad.category === 'A' ? userLevel?.max_daily_ads_cat_a || 0 :
                               ad.category === 'B' ? userLevel?.max_daily_ads_cat_b || 0 :
                               userLevel?.max_daily_ads_cat_c || 0;
              
              const catWatched = transactions.filter(
                t => new Date(t.timestamp).toDateString() === today && 
                     t.type === 'AdViewImpressions' && 
                     t.description.includes(ad.category)
              ).length;

              const limitReached = catLimit > 0 && catWatched >= catLimit;

              return (
                <div 
                  key={ad.id} 
                  className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#2563eb]/10 text-[#2563eb]">
                      <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        play_circle
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-on-surface dark:text-gray-200">Watch Video (Cat {ad.category})</h4>
                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase rounded-md border border-blue-500/20">
                          In-App Interstitial
                        </span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[12px]">task_alt</span>
                        Progress: {catWatched}/{catLimit}
                      </p>
                      <span className="inline-block px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[8px] font-extrabold uppercase rounded-md mt-1">
                        {multipliedReward} SB reward
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    disabled={limitReached}
                    onClick={() => playAd(ad)}
                    className={`px-4 py-2.5 rounded-full font-bold text-xs shadow-md active:scale-95 transition-all duration-150 flex items-center gap-1.5 ${
                      limitReached
                        ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-[#2563eb] text-zinc-900 shadow-[#2563eb]/20'
                    }`}
                  >
                    <span>{limitReached ? 'Completed' : 'Watch'}</span>
                    <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};
export default WatchEarn;
