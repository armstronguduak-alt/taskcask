import React from 'react';
import { useApp } from '../context/AppContext';

export const Premium: React.FC = () => {
  const { user, togglePremium, setTab } = useApp();

  const handleToggle = () => {
    togglePremium();
    // In a real app, this would trigger a payment gateway or logic
    alert(user?.is_premium ? 'Premium membership cancelled.' : 'Premium membership activated successfully!');
  };

  return (
    <div className="flex-grow pb-32">
      <header className="sticky top-0 w-full z-30 bg-[#f8f9ff]/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTab('Profile')}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface dark:text-white bg-surface-container/50 dark:bg-zinc-800/40 hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-bold text-[18px] text-on-surface dark:text-white leading-tight">
              Premium Membership
            </h1>
          </div>
        </div>
      </header>

      <div className="px-container-padding pt-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
            <span className="material-symbols-outlined text-[40px]">workspace_premium</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-on-surface dark:text-white">TaskCash Premium</h2>
            <p className="text-sm text-on-surface-variant dark:text-gray-400 mt-2 max-w-[280px] mx-auto">
              Supercharge your earnings with higher daily limits, priority support, and exclusive events.
            </p>
          </div>
        </div>

        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-on-surface dark:text-white uppercase tracking-wider mb-2">Benefits</h3>
          
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
            <div>
              <p className="font-bold text-sm text-on-surface dark:text-white">Higher Daily Limits</p>
              <p className="text-[10px] text-on-surface-variant dark:text-gray-400">Unlock an extra 10 videos and tasks per day across all levels.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
            <div>
              <p className="font-bold text-sm text-on-surface dark:text-white">Priority Support</p>
              <p className="text-[10px] text-on-surface-variant dark:text-gray-400">Get your tickets and withdrawal issues handled first.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
            <div>
              <p className="font-bold text-sm text-on-surface dark:text-white">Exclusive Campaigns</p>
              <p className="text-[10px] text-on-surface-variant dark:text-gray-400">Access sponsored tasks that pay higher rewards.</p>
            </div>
          </div>
        </section>

        <div className="pt-4">
          <button 
            onClick={handleToggle}
            className={`w-full py-4 font-bold text-sm rounded-2xl shadow-lg active:scale-95 transition-all ${
              user?.is_premium 
                ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 shadow-none' 
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/25'
            }`}
          >
            {user?.is_premium ? 'Cancel Premium Membership' : 'Activate Premium Membership'}
          </button>
          
          <p className="text-center text-[10px] text-on-surface-variant dark:text-gray-500 mt-4">
            *Premium membership does not bypass the activity level system. You must still be active to progress in levels and reduce your withdrawal minimum.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Premium;
