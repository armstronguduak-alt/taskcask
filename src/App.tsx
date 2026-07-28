import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Dashboard from './views/Dashboard';
import WatchEarn from './views/WatchEarn';
import TaskCenter from './views/TaskCenter';
import InviteEarn from './views/InviteEarn';
import WithdrawFunds from './views/WithdrawFunds';
import TransactionHistory from './views/TransactionHistory';
import UserProfile from './views/UserProfile';
import AdminDashboard from './views/admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
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

  if (vpnDetected) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">vpn_lock</span>
        <h1 className="text-2xl font-bold text-on-surface dark:text-white mb-2">VPN Detected</h1>
        <p className="text-on-surface-variant dark:text-gray-400">
          Our security systems detected that you are using a VPN, Proxy, or Tor network. 
          Please disable it to access TaskCash and protect the integrity of our platform.
        </p>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
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
      <BottomNav />

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
