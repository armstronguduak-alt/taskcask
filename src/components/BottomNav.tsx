import React from 'react';
import { useApp } from '../context/AppContext';
import type { TabName } from '../context/AppContext';

interface NavItem {
  tab: TabName;
  label: string;
  icon: string;
}

export const BottomNav: React.FC = () => {
  const { activeTab, setTab } = useApp();

  const items: NavItem[] = [
    { tab: 'Dashboard', label: 'Home', icon: 'home' },
    { tab: 'WatchEarn', label: 'Watch', icon: 'play_circle' },
    { tab: 'Tasks', label: 'Tasks', icon: 'assignment' },
    { tab: 'Invite', label: 'Invite', icon: 'group_add' },
    { tab: 'Profile', label: 'Profile', icon: 'person' }
  ];

  if (activeTab === 'Onboarding') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-[480px] w-full px-container-padding pb-6 pt-2 bg-transparent pointer-events-none">
      <div className="w-full h-18 rounded-3xl bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-lg shadow-black/10 flex items-center justify-around px-4 py-2 pointer-events-auto">
        {items.map((item) => {
          const isActive = activeTab === item.tab || 
            (item.tab === 'Tasks' && activeTab === 'Admin') || 
            (item.tab === 'Profile' && (activeTab === 'Upgrade' || activeTab === 'Withdraw' || activeTab === 'History'));
            
          return (
            <button
              key={item.tab}
              onClick={() => setTab(item.tab)}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all duration-300 ripple-active"
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/30' 
                    : 'text-[#6e7b6c] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}>
                  {item.icon}
                </span>
              </div>
              <span 
                className={`text-[10px] font-semibold mt-1 tracking-wide transition-all duration-300 ${
                  isActive ? 'opacity-100 max-h-4 text-primary dark:text-[#62df7d]' : 'opacity-0 max-h-0 overflow-hidden'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
export default BottomNav;
