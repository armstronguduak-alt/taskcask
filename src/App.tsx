import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Onboarding from './views/Onboarding';
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
