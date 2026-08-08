import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptic';
import { Avatar } from '../components/Avatar';

export const UserProfile: React.FC = () => {
  const { 
    user, 
    mainWallet, 
    levels, 
    darkMode, 
    toggleDarkMode, 
    verifyPhone,
    setTab
  } = useApp();

  const [showFAQ, setShowFAQ] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];

  return (
    <div className="flex-grow pb-32 bg-transparent">
      <nav className="sticky top-0 w-full z-30 bg-transparent backdrop-blur-md pt-4">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <h1 className="font-extrabold text-[22px] text-white">User Profile</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-6">
        
        {/* User Card */}
        <section className="bg-[#24428b] border border-blue-500/10 rounded-[24px] p-5 shadow-lg flex flex-col items-center text-center space-y-4">
          <Avatar 
            src={user?.avatar || user?.photo_url || ''} 
            name={user?.first_name || 'User'} 
            size="lg" 
            className="!w-20 !h-20 !rounded-full border-4 border-[#4a72ff]/30 shadow-lg"
          />
          <div>
            <h2 className="text-[18px] font-bold text-white leading-tight flex items-center justify-center gap-1">
              {user?.first_name} {user?.last_name}
              {user?.is_premium && <span className="material-symbols-outlined text-[16px] text-amber-400" title="Premium Member" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>}
            </h2>
            <p className="text-[13px] text-blue-200 mt-0.5">@{user?.username}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#4a72ff]/20 text-[#4a72ff] text-[10px] font-extrabold uppercase tracking-wider mt-2.5 border border-[#4a72ff]/30">
              {userLevel?.name || 'Starter'}
            </span>
          </div>
        </section>

        {/* Earning Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-[#24428b] border border-blue-500/10 rounded-[20px] p-4 shadow-lg space-y-1">
            <p className="text-[10px] font-bold text-blue-300/80 uppercase tracking-wide">Active Balance</p>
            <p className="font-extrabold text-[16px] text-white">{(mainWallet?.balance_sb || 0).toLocaleString()} SB</p>
          </div>
          <div className="bg-[#24428b] border border-blue-500/10 rounded-[20px] p-4 shadow-lg space-y-1">
            <p className="text-[10px] font-bold text-blue-300/80 uppercase tracking-wide">Cumulative Earnings</p>
            <p className="font-extrabold text-[16px] text-white">{(mainWallet?.lifetime_sb || 0).toLocaleString()} SB</p>
          </div>
        </section>



        {/* Settings options list */}
        <section className="bg-[#24428b] border border-blue-500/10 rounded-[24px] p-5 shadow-lg space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-2">Account Configurations</h3>

          {/* Withdraw Entry */}
          <button 
            onClick={() => setTab('Withdraw')}
            className="w-full flex justify-between items-center py-3 border-b border-blue-500/10 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-[20px]">💳</span>
              <span className="text-[13px] font-bold text-blue-100">Withdraw Funds</span>
            </div>
            <span className="material-symbols-outlined text-blue-300 text-[18px]">chevron_right</span>
          </button>


          {/* History Entry */}
          <button 
            onClick={() => setTab('History')}
            className="w-full flex justify-between items-center py-3 border-b border-blue-500/10 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-[20px]">🕒</span>
              <span className="text-[13px] font-bold text-blue-100">Transaction History</span>
            </div>
            <span className="material-symbols-outlined text-blue-300 text-[18px]">chevron_right</span>
          </button>

          {/* FAQs Entry */}
          <button 
            onClick={() => setShowFAQ(true)}
            className="w-full flex justify-between items-center py-3 border-b border-blue-500/10 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-[20px]">❓</span>
              <span className="text-[13px] font-bold text-blue-100">Frequently Asked Questions (FAQs)</span>
            </div>
            <span className="material-symbols-outlined text-blue-300 text-[18px]">chevron_right</span>
          </button>

          {/* Privacy Policy Entry */}
          <button 
            onClick={() => setShowPrivacy(true)}
            className="w-full flex justify-between items-center py-3 border-b border-blue-500/10 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-[20px]">🔒</span>
              <span className="text-[13px] font-bold text-blue-100">Privacy Policy</span>
            </div>
            <span className="material-symbols-outlined text-blue-300 text-[18px]">chevron_right</span>
          </button>

          {/* Terms of Service Entry */}
          <button 
            onClick={() => setShowTerms(true)}
            className="w-full flex justify-between items-center py-3 border-b border-blue-500/10 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-[20px]">📝</span>
              <span className="text-[13px] font-bold text-blue-100">Terms of Service</span>
            </div>
            <span className="material-symbols-outlined text-blue-300 text-[18px]">chevron_right</span>
          </button>

          {/* About Entry */}
          <button 
            onClick={() => setShowAbout(true)}
            className="w-full flex justify-between items-center py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-[20px]">ℹ️</span>
              <span className="text-[13px] font-bold text-blue-100">About SwagBucks</span>
            </div>
            <span className="material-symbols-outlined text-blue-300 text-[18px]">chevron_right</span>
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
                <h4 className="font-bold text-sm text-[#2563eb] mb-1">How do I earn money?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">You can earn by watching ads, completing available micro-tasks, claiming your daily login bonus streak, and referring friends using your unique Telegram referral link.</p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#2563eb] mb-1">What is the minimum withdrawal?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">The minimum withdrawal varies based on your account level. As you level up through consistent activity, your minimum withdrawal requirement decreases!</p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#2563eb] mb-1">Do referrals count toward my withdrawal limit?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">No. To ensure the integrity of our platform, the minimum withdrawal threshold must be met entirely through your own active earnings (tasks, videos, daily bonuses). Once you meet this activity threshold, your referral earnings can be freely withdrawn.</p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#2563eb] mb-1">How do I level up my account?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Your account automatically levels up as you increase your daily login streak, complete more tasks, watch more ads, and invite active referrals.</p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#2563eb] mb-1">What is the Telegram Community Bonus?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">You receive an instant 500 SB bonus added to your active balance when you join our official Telegram community via the dashboard.</p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#2563eb] mb-1">How long do withdrawals take?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Withdrawal requests are typically processed within 24-48 business hours. Ensure your bank details are correct before submitting a request.</p>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#2563eb] mb-1">What happens if I use a VPN?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Using a VPN, Proxy, or Tor network is strictly prohibited as it violates the policies of our ad partners (like Adsterra, Monetag, Swagbucks). Doing so will block your access to the app.</p>
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
            <div className="w-16 h-16 mx-auto bg-[#2563eb]/10 text-[#2563eb] rounded-full flex items-center justify-center mb-4 mt-2">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            </div>
            <h2 className="text-xl font-bold mb-2">About SwagBucks</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              SwagBucks is a premier digital rewards and micro-tasking platform built exclusively on Telegram. Our mission is to empower users to monetize their spare time efficiently.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Through our integrations with leading advertising networks and verified task providers like Swagbucks, Clickworker, Adsterra, and Monetag, we bring high-paying opportunities directly to your device. 
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Founded in 2024, our community has grown to thousands of active users globally. We take pride in fast payouts, data privacy, and keeping our ecosystem fraud-free.
            </p>
            <div className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Version 1.0.0
            </div>
          </div>
        </div>
      )}
      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up relative flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold">Privacy Policy</h2>
              <button onClick={() => setShowPrivacy(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>1. Data Collection:</strong> We collect minimal user data, primarily relying on your public Telegram profile (Name, Username, ID) to create and secure your account.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>2. Usage Data:</strong> We monitor in-app activity, such as tasks completed and ads watched, exclusively to calculate your earnings and verify compliance with our Terms of Service.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>3. Third-Party Sharing:</strong> We do not sell your personal data to third parties. Our ad partners (Monetag, Adsterra) may collect anonymous usage metrics to serve relevant advertisements.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>4. Security:</strong> We employ industry-standard security measures to protect your account balance and transaction history.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up relative flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold">Terms of Service</h2>
              <button onClick={() => setShowTerms(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>1. Acceptance:</strong> By using SwagBucks, you agree to comply with all rules and guidelines laid out in this document.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>2. Prohibited Activity:</strong> The use of bots, emulators, auto-clickers, VPNs, Proxies, or multiple accounts per person is strictly forbidden. 
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>3. Earnings & Withdrawals:</strong> Earnings are distributed at the sole discretion of SwagBucks based on verified activity. SwagBucks reserves the right to withhold payments if fraudulent activity is detected.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>4. Account Termination:</strong> We reserve the right to ban or suspend any account found violating these terms without prior notice or compensation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserProfile;
