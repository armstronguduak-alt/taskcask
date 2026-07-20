import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Onboarding from './views/Onboarding';
import Dashboard from './views/Dashboard';
import WatchEarn from './views/WatchEarn';
import TaskCenter from './views/TaskCenter';
import InviteEarn from './views/InviteEarn';
import LevelUpgrade from './views/LevelUpgrade';
import WithdrawFunds from './views/WithdrawFunds';
import TransactionHistory from './views/TransactionHistory';
import UserProfile from './views/UserProfile';
import AdminDashboard from './views/admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { activeTab, adPlaying, activeAd, adProgress } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Onboarding':
        return <Onboarding />;
      case 'Dashboard':
        return <Dashboard />;
      case 'WatchEarn':
        return <WatchEarn />;
      case 'Tasks':
        return <TaskCenter />;
      case 'Invite':
        return <InviteEarn />;
      case 'Profile':
        return <UserProfile />;
      case 'Upgrade':
        return <LevelUpgrade />;
      case 'Withdraw':
        return <WithdrawFunds />;
      case 'History':
        return <TransactionHistory />;
      case 'Admin':
        return <AdminDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="tma-container min-h-screen bg-background dark:bg-[#09090b] flex flex-col justify-between">
      {/* Active Screen View */}
      <div className="flex-grow flex flex-col">
        {renderActiveView()}
      </div>

      {/* Floating Bottom Nav */}
      {activeTab !== 'Onboarding' && <BottomNav />}

      {/* Fullscreen Video Ad Simulator Overlay */}
      {adPlaying && activeAd && (
        <div className="fixed inset-0 z-50 bg-[#002109] flex flex-col justify-between p-6 select-none text-white">
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-bold uppercase tracking-wider">
              {activeAd.type === 'InAppInterstitial' ? 'SPONSOR AD' : 'REWARDED AD'}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-amber-500">schedule</span>
              <span>{Math.ceil(activeAd.watch_time_sec * (1 - adProgress / 100))}s remaining</span>
            </div>
          </div>

          <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-40 h-40 flex items-center justify-center bg-white/5 rounded-full border border-white/10 shadow-2xl">
              {/* Circular progress track */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="transparent" />
                <circle cx="80" cy="80" r="70" stroke="#16a34a" strokeWidth="6" fill="transparent"
                        strokeDasharray={2 * Math.PI * 70}
                        strokeDashoffset={2 * Math.PI * 70 * (1 - adProgress / 100)}
                        className="transition-all duration-100" />
              </svg>
              <span className="material-symbols-outlined text-[64px] text-[#16a34a]">ads_click</span>
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="font-bold text-sm text-gray-200">Playing {activeAd.name}</h3>
              <p className="text-[10px] text-gray-400">Please watch the full ad to claim your balance payout reward.</p>
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#16a34a] transition-all duration-100" style={{ width: `${adProgress}%` }} />
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              <span>Playback Progress</span>
              <span>{adProgress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
