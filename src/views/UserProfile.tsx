import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const UserProfile: React.FC = () => {
  const { 
    user, 
    wallet, 
    levels, 
    darkMode, 
    toggleDarkMode, 
    verifyPhone,
    setTab
  } = useApp();

  const [showFAQ, setShowFAQ] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];

  return (
    <div className="flex-grow pb-32">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-[#f8f9ff]/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <h1 className="font-bold text-lg text-primary dark:text-[#62df7d]">User Profile</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-6">
        
        {/* User Card */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full border-4 border-primary-container overflow-hidden bg-gray-100 relative group">
            <img 
              className="w-full h-full object-cover" 
              alt="Avatar" 
              src={user?.avatar} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuCVTKlyggqz5sCXesavqzKPCSJ4KXoCGlgCc8lz_jaPYv_5AQRavF-pvfr6PwucqaXWhwc6Cpw4vfXffqz_cXEk6H0CTtrwG1Kntsj-GR9YG9PNUuq320uFZxButjHsDwLSNPGeUJ2tTsOrGMkV6eDMkbdzqGzC10Ot2XT6vYjQHIJfnbizlg0JjUhc8GgrTm3h3YH68e4e3H_Tr_JAKMrVndxN_nktv37HXYWp6FOKBaHnR5WKMV8q";
              }}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface dark:text-white leading-tight flex items-center justify-center gap-1">
              {user?.first_name} {user?.last_name}
              {user?.is_premium && <span className="material-symbols-outlined text-[16px] text-amber-500" title="Premium Member">workspace_premium</span>}
            </h2>
            <p className="text-xs text-on-surface-variant dark:text-gray-400 mt-0.5">@{user?.username}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[9px] font-extrabold uppercase tracking-wider mt-2.5">
              {userLevel.name}
            </span>
          </div>
        </section>

        {/* Earning Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Active Cash</p>
            <p className="font-extrabold text-[16px] text-primary dark:text-[#62df7d]">₦{(wallet?.active_balance || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Cumulative Earnings</p>
            <p className="font-extrabold text-[16px] text-on-surface dark:text-white">₦{(wallet?.lifetime_earnings || 0).toLocaleString()}</p>
          </div>
        </section>

        {/* Verification Status */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400">Verifications</h3>

          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">phone_iphone</span>
              <span className="text-xs font-bold text-on-surface dark:text-gray-200">Phone Number</span>
            </div>
            {user?.phone_verified ? (
              <span className="text-xs font-bold text-green-500">Verified</span>
            ) : (
              <button onClick={verifyPhone} className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full hover:bg-primary/20">Verify Now</button>
            )}
          </div>
        </section>

        {/* Settings options list */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400 mb-2">Account Configurations</h3>

          {/* Dark Mode Switcher */}
          <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-zinc-800/60 pb-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#0051d5] dark:text-[#b4c5ff]">dark_mode</span>
              <span className="text-xs font-bold text-on-surface dark:text-gray-200">Dark Mode Interface</span>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                darkMode ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <div 
                className={`w-4 .h-4 bg-white rounded-full h-4 shadow-md transition-transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Withdraw Entry */}
          <button 
            onClick={() => setTab('Withdraw')}
            className="w-full flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-zinc-800/60 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">payments</span>
              <span className="text-xs font-bold text-on-surface dark:text-gray-200">Withdraw Funds</span>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
          </button>


          {/* History Entry */}
          <button 
            onClick={() => setTab('History')}
            className="w-full flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-zinc-800/60 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-purple-500">history</span>
              <span className="text-xs font-bold text-on-surface dark:text-gray-200">Transaction History</span>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
          </button>

          {/* FAQs Entry */}
          <button 
            onClick={() => setShowFAQ(true)}
            className="w-full flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-zinc-800/60 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-500">help</span>
              <span className="text-xs font-bold text-on-surface dark:text-gray-200">Frequently Asked Questions (FAQs)</span>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
          </button>

          {/* About Entry */}
          <button 
            onClick={() => setShowAbout(true)}
            className="w-full flex justify-between items-center py-2.5 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-500">info</span>
              <span className="text-xs font-bold text-on-surface dark:text-gray-200">About TaskCash</span>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
          </button>
        </section>

      </div>

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end md:justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up relative flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold">FAQs</h2>
              <button onClick={() => setShowFAQ(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <h4 className="font-bold text-sm text-primary mb-1">How do I earn money?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">You can earn by watching ads, completing available micro-tasks, claiming your daily login bonus streak, and referring friends using your unique Telegram referral link.</p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-primary mb-1">What is the minimum withdrawal?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">The minimum withdrawal varies based on your account level. As you level up through consistent activity, your minimum withdrawal requirement decreases!</p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-primary mb-1">Do referrals count toward my withdrawal limit?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">No. To ensure the integrity of our platform, the minimum withdrawal threshold must be met entirely through your own active earnings (tasks, videos, daily bonuses). Once you meet this activity threshold, your referral earnings can be freely withdrawn.</p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-primary mb-1">How do I level up my account?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Your account automatically levels up as you increase your daily login streak, complete more tasks, watch more ads, and invite active referrals.</p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-primary mb-1">What is the Telegram Community Bonus?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">You receive an instant ₦500 bonus added to your active balance when you join our official Telegram community via the dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up relative p-6 text-center">
            <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-white">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <div className="w-16 h-16 mx-auto bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4 mt-2">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            </div>
            <h2 className="text-xl font-bold mb-2">About TaskCash</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              TaskCash is a premier digital rewards and micro-tasking platform built exclusively on Telegram. Our mission is to empower users to monetize their spare time efficiently.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Through our integrations with leading advertising networks and verified task providers like Swagbucks and Clickworker, we bring high-paying opportunities directly to your device. Join our growing community, stay active, and watch your earnings grow!
            </p>
            <div className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Version 1.0.0
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserProfile;
