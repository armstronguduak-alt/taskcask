import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RewardProvider } from './components/RewardCelebration';
import BottomNav from './components/BottomNav';
import Dashboard from './views/Dashboard';

import TaskCenter from './views/TaskCenter';
import InviteEarn from './views/InviteEarn';
import WithdrawFunds from './views/WithdrawFunds';
import TransactionHistory from './views/TransactionHistory';
import UserProfile from './views/UserProfile';
import Leaderboard from './views/Leaderboard';
import { WebLogin } from './views/WebLogin';

import VideoAdModal from './components/VideoAdModal';
import { useReward } from './components/RewardCelebration';

const AppContent: React.FC = () => {
  const { isLoading, activeTab, activeAd, setActiveAd, completeAd, levels, user, systemSettings, refreshState, handleWebLogin } = useApp();
  const { triggerReward } = useReward();
  const [vpnDetected, setVpnDetected] = useState<boolean>(false);

  useEffect(() => {
    // Basic VPN/Proxy detection using ipwho.is
    fetch('https://ipwho.is/')
      .then(res => res.json())
      .then(data => {
        if (data && data.security && (data.security.vpn || data.security.proxy || data.security.tor)) {
          setVpnDetected(true);
        }
      })
      .catch(err => console.error("VPN check failed:", err));
  }, []);

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];
  const rewardSetting = activeAd ? systemSettings.find(s => s.key === `reward_cat_${activeAd.category}`)?.value : null;
  const baseReward = activeAd ? (rewardSetting ? parseFloat(rewardSetting) : activeAd.reward_amount) : 0;
  const rewardAmount = Math.round(baseReward * (userLevel?.earning_multiplier || 1));

  if (vpnDetected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e46a3] via-[#132252] to-[#050914] flex flex-col items-center justify-center p-6 text-center text-white">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">vpn_lock</span>
        <h1 className="text-2xl font-bold text-white mb-2">VPN Detected</h1>
        <p className="text-blue-200">
          Our security systems detected that you are using a VPN, Proxy, or Tor network. 
          Please disable it to access SwagBucks and protect the integrity of our platform.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e46a3] via-[#132252] to-[#050914] flex flex-col items-center justify-center p-6 text-center text-white">
        <span className="material-symbols-outlined text-[48px] text-white/50 animate-spin mb-4">refresh</span>
        <h2 className="text-xl font-bold animate-pulse">Loading SwagBucks...</h2>
      </div>
    );
  }

  if (!user) {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
      return null;
    }
    return <WebLogin onLogin={(userData) => {
      handleWebLogin(userData);
      window.history.pushState({}, '', '/');
    }} />;
  } else if (window.location.pathname === '/login') {
    window.history.pushState({}, '', '/');
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Home':
        return <Dashboard />;
      case 'Task':
        return <TaskCenter />;
      case 'Leaderboard':
        return <Leaderboard />;
      case 'Invite':
        return <InviteEarn />;
      case 'Profile':
        return <UserProfile />;
      case 'Withdraw':
        return <WithdrawFunds />;
      case 'Records':
        return <TransactionHistory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="tma-container min-h-screen bg-gradient-to-b from-[#1e46a3] via-[#132252] to-[#050914] flex flex-col justify-between relative overflow-hidden text-white">
      {/* Active Screen View */}
      <div className="flex-grow flex flex-col">
        {renderActiveView()}
      </div>

      {/* Floating Bottom Nav */}
      <BottomNav />

      {/* Video Ad Player Modal */}
      {activeAd && (
        <VideoAdModal
          ad={activeAd}
          onClose={() => setActiveAd(null)}
          onComplete={async (ad, sourceEl) => {
            const res = await completeAd(ad);
            if (res.success) {
               triggerReward({
                 amount: res.amount!,
                 currency: res.currency!,
                 source: sourceEl,
                 destinationId: `wallet-${res.currency!.toLowerCase()}`,
                 onComplete: refreshState
               });
            }
          }}
          rewardAmount={rewardAmount}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <RewardProvider>
        <AppContent />
      </RewardProvider>
    </AppProvider>
  );
}
