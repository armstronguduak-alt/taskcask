import React from 'react';
import { useApp } from '../context/AppContext';
import type { Level } from '../db/mockDb';

export const LevelUpgrade: React.FC = () => {
  const { wallet, levels, user, upgradeTier, setTab } = useApp();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];

  const handleUpgrade = (level: Level) => {
    const tg = (window as any).Telegram?.WebApp;
    const confirmMessage = `Do you want to upgrade to ${level.name} for ₦${level.cost.toLocaleString()}? This fee will be deducted from your Active Balance.`;
    
    if (tg && tg.showConfirm) {
      tg.showConfirm(confirmMessage, (approved: boolean) => {
        if (approved) {
          const result = upgradeTier(level.id);
          tg.showAlert(result.message);
        }
      });
    } else {
      if (window.confirm(confirmMessage)) {
        const result = upgradeTier(level.id);
        alert(result.message);
      }
    }
  };

  return (
    <div className="flex-grow pb-32">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-[#f8f9ff]/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <div className="flex items-center gap-stack-md">
            <button onClick={() => setTab('Profile')} className="ripple-active p-1 text-primary">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-bold text-lg text-primary dark:text-[#62df7d]">Upgrade Account</h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
            <span className="material-symbols-outlined text-primary text-[16px] font-fill">account_balance_wallet</span>
            <span className="text-xs font-bold text-primary">₦{(wallet?.active_balance || 0).toLocaleString()}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-6">
        
        {/* Current status header */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm text-center space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/10 text-primary text-[11px] font-bold uppercase tracking-wider">
            Active Level
          </span>
          <h2 className="text-2xl font-extrabold text-on-surface dark:text-white tracking-tight">
            {userLevel.name}
          </h2>
          <p className="text-xs text-on-surface-variant dark:text-gray-400">
            Current multiplier: <span className="font-bold text-primary">{userLevel.earning_multiplier.toFixed(1)}x</span>. Earning limits: <span className="font-semibold text-[#0051d5]">{userLevel.max_daily_ads} ads/day</span>.
          </p>
        </section>

        {/* Upgrade options list */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400">Upgrade Campaigns</h3>
          
          <div className="space-y-4">
            {levels.map((level) => {
              const isCurrent = level.id === user?.level_id;
              const isLower = levels.findIndex(l => l.id === level.id) < levels.findIndex(l => l.id === user?.level_id);

              return (
                <div 
                  key={level.id}
                  className={`bg-white dark:bg-zinc-900 border rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden transition-all duration-300 ${
                    isCurrent 
                      ? 'border-2 border-primary ring-2 ring-primary/10' 
                      : 'border-gray-100 dark:border-zinc-800'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-3 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                      Current Tier
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-on-surface dark:text-gray-200">{level.name}</h4>
                      <p className="text-[10px] text-primary dark:text-[#62df7d] font-bold uppercase mt-1 tracking-wider">
                        Multiplier: {level.earning_multiplier.toFixed(1)}x
                      </p>
                    </div>
                    {level.cost > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cost</p>
                        <p className="font-extrabold text-xs text-on-surface dark:text-white mt-0.5">₦{level.cost.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Level details benefits list */}
                  <ul className="space-y-2 border-t border-gray-50 dark:border-zinc-800/60 pt-3">
                    {level.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
                        <span className="material-symbols-outlined text-primary text-[16px] font-bold">check</span>
                        <span>{b}</span>
                      </li>
                    ))}
                    <li className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-gray-400">
                      <span className="material-symbols-outlined text-[#0051d5] text-[16px] font-bold">tune</span>
                      <span>Daily caps: {level.max_daily_ads} ads & {level.max_daily_tasks} tasks</span>
                    </li>
                  </ul>

                  {/* Upgrade Action Button */}
                  {!isCurrent && !isLower && (
                    <button
                      onClick={() => handleUpgrade(level)}
                      className="w-full py-3 bg-primary text-white font-bold text-xs rounded-xl shadow-md shadow-primary/10 active:scale-98 transition-all duration-150 flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                      Purchase Level Upgrade
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};
export default LevelUpgrade;
