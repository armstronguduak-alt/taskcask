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
    { tab: 'Home', label: 'Home', icon: 'home' },
    { tab: 'Task', label: 'Task', icon: 'assignment' },
    { tab: 'Leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
    { tab: 'Records', label: 'Records', icon: 'history' },
    { tab: 'Profile', label: 'Profile', icon: 'person' }
  ];

  if (activeTab === 'Onboarding' || activeTab === 'Admin') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-[480px] w-full bg-[#131f42] rounded-t-[32px] border-t border-blue-500/10 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-end px-2 pt-2 pb-1 relative h-[72px]">
        {items.map((item) => {
          const isActive = activeTab === item.tab || (item.tab === 'Profile' && activeTab === 'Withdraw');
          
          if (isActive) {
            return (
              <button
                key={item.tab}
                className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-5"
              >
                <div className="w-[76px] h-[76px] bg-[#131f42] rounded-[24px] p-[6px] flex flex-col items-center justify-center relative">
                  <div className="w-full h-full bg-gradient-to-b from-[#5c85ff] to-[#3a5be6] rounded-[18px] flex flex-col items-center justify-center shadow-lg shadow-[#4a72ff]/40 border border-blue-300/30">
                    <span className="material-symbols-outlined text-[24px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    <span className="text-[9px] font-black text-white mt-1 tracking-wide uppercase">{item.label}</span>
                    {item.tab === 'Profile' && (
                      <span className="absolute top-1 right-2 w-4 h-4 bg-red-500 rounded-full border border-[#5c85ff] text-[9px] font-bold text-white flex items-center justify-center shadow-sm">3</span>
                    )}
                  </div>
                </div>
              </button>
            )
          }

          return (
            <button
              key={item.tab}
              onClick={() => setTab(item.tab)}
              className="flex-1 flex flex-col items-center justify-center h-full gap-1 pb-2 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[26px] text-blue-200/50" style={{ fontVariationSettings: "'FILL' 1" }}>
                {item.icon}
              </span>
              <span className="text-[9px] font-black text-blue-200/50 tracking-wider uppercase">
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
