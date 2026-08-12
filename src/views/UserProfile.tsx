import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

import { Avatar } from '../components/Avatar';

export const UserProfile: React.FC = () => {
  const { 
    user, 
    mainWallet, 
    levels, 
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
              {userLevel?.name || 'Silver'}
            </span>
          </div>
        </section>

        {/* Earning Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-[#24428b] border border-blue-500/10 rounded-[20px] p-4 shadow-lg space-y-2">
            <p className="text-[10px] font-bold text-blue-300/80 uppercase tracking-wide flex items-center gap-1.5">
              <img src="/swagbucks coin logo.png" className="w-3.5 h-3.5 object-contain" alt="SB" />
              Swagbucks Balance
            </p>
            <p className="font-extrabold text-[16px] text-white">{(mainWallet?.balance_sb || 0).toLocaleString()} SB</p>
          </div>
          <div className="bg-[#24428b] border border-blue-500/10 rounded-[20px] p-4 shadow-lg space-y-2">
            <p className="text-[10px] font-bold text-blue-300/80 uppercase tracking-wide flex items-center gap-1.5">
              <img src="/usdt coin logo.png" className="w-3.5 h-3.5 object-contain" alt="USDT" />
              USDT Balance
            </p>
            <p className="font-extrabold text-[16px] text-white">${(mainWallet?.balance_usdt || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
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
            onClick={() => setTab('Records')}
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
          <div className="bg-[#132252] rounded-t-[32px] md:rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up relative flex flex-col max-h-[85vh] border border-blue-500/20">
            <div className="p-5 bg-gradient-to-r from-[#1e3b7a] to-[#24428b] border-b border-blue-500/20 flex justify-between items-center sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 shadow-inner border border-blue-500/30">
                  <span className="material-symbols-outlined text-[20px]">quiz</span>
                </div>
                <h2 className="text-[18px] font-extrabold text-white tracking-wide">FAQs</h2>
              </div>
              <button onClick={() => setShowFAQ(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-all">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {[
                {q: "How do I earn money?", a: "You can earn by watching ads, completing available micro-tasks, claiming your daily login bonus streak, and referring friends using your unique Telegram referral link."},
                {q: "What is the minimum withdrawal?", a: "The minimum withdrawal varies based on your account level. As you level up through consistent activity, your minimum withdrawal requirement decreases!"},
                {q: "Do referrals count toward my withdrawal limit?", a: "No. To ensure the integrity of our platform, the minimum withdrawal threshold must be met entirely through your own active earnings (tasks, videos, daily bonuses). Once you meet this activity threshold, your referral earnings can be freely withdrawn."},
                {q: "How do I level up my account?", a: "Your account automatically levels up as you increase your daily login streak, complete more tasks, watch more ads, and invite active referrals."},
                {q: "What is the Telegram Community Bonus?", a: "You receive an instant 500 SB bonus added to your active balance when you join our official Telegram community via the dashboard."},
                {q: "How long do withdrawals take?", a: "Withdrawal requests are typically processed within 24-48 business hours. Ensure your bank details are correct before submitting a request."},
                {q: "What happens if I use a VPN?", a: "Using a VPN, Proxy, or Tor network is strictly prohibited as it violates the policies of our ad partners (like Adsterra, Monetag, Swagbucks). Doing so will block your access to the app."}
              ].map((item, idx) => (
                <div key={idx} className="bg-[#1e3b7a]/50 border border-blue-500/10 rounded-2xl p-4 shadow-sm hover:bg-[#1e3b7a] transition-colors">
                  <h4 className="font-bold text-[13px] text-blue-200 mb-2 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span> {item.q}
                  </h4>
                  <p className="text-[12px] text-blue-100/70 leading-relaxed pl-4">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end md:justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-b from-[#1e3b7a] to-[#132252] rounded-t-[32px] md:rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up relative border border-blue-500/30 text-center p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
            <button onClick={() => setShowAbout(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-all z-10">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[24px] flex items-center justify-center mb-6 shadow-xl border border-blue-400/50 transform rotate-3">
              <span className="material-symbols-outlined text-[40px] transform -rotate-3" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            </div>
            <h2 className="text-[24px] font-black text-white mb-2 tracking-tight">About SwagBucks</h2>
            <div className="space-y-4 mt-4">
              <p className="text-[13px] text-blue-100/80 leading-relaxed">
                SwagBucks is a premier digital rewards and micro-tasking platform built exclusively on Telegram. Our mission is to empower users to monetize their spare time efficiently.
              </p>
              <p className="text-[13px] text-blue-100/80 leading-relaxed">
                Through our integrations with leading advertising networks and verified task providers like Swagbucks, Clickworker, Adsterra, and Monetag, we bring high-paying opportunities directly to your device. 
              </p>
              <p className="text-[13px] text-blue-100/80 leading-relaxed">
                Founded in 2024, our community has grown to thousands of active users globally. We take pride in fast payouts, data privacy, and keeping our ecosystem fraud-free.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-blue-500/20">
              <span className="inline-block px-4 py-1.5 bg-black/20 rounded-full text-[10px] text-blue-300 uppercase tracking-widest font-black border border-white/5">
                Version 1.0.0
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end md:justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#132252] rounded-t-[32px] md:rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up relative flex flex-col max-h-[85vh] border border-blue-500/20">
            <div className="p-5 bg-gradient-to-r from-[#1e3b7a] to-[#24428b] border-b border-blue-500/20 flex justify-between items-center sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 shadow-inner border border-teal-500/30">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                </div>
                <h2 className="text-[18px] font-extrabold text-white tracking-wide">Privacy Policy</h2>
              </div>
              <button onClick={() => setShowPrivacy(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-all">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {[
                {title: "Data Collection", desc: "We collect minimal user data, primarily relying on your public Telegram profile (Name, Username, ID) to create and secure your account.", icon: "person"},
                {title: "Usage Data", desc: "We monitor in-app activity, such as tasks completed and ads watched, exclusively to calculate your earnings and verify compliance with our Terms of Service.", icon: "monitoring"},
                {title: "Third-Party Sharing", desc: "We do not sell your personal data to third parties. Our ad partners (Monetag, Adsterra) may collect anonymous usage metrics to serve relevant advertisements.", icon: "share"},
                {title: "Security", desc: "We employ industry-standard security measures to protect your account balance and transaction history.", icon: "shield"}
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-[#1e3b7a]/30 border border-blue-500/10 rounded-2xl">
                  <div className="w-8 h-8 flex-shrink-0 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 mt-1">
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] text-white mb-1">{idx + 1}. {item.title}</h3>
                    <p className="text-[12px] text-blue-100/70 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end md:justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#132252] rounded-t-[32px] md:rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up relative flex flex-col max-h-[85vh] border border-blue-500/20">
            <div className="p-5 bg-gradient-to-r from-[#1e3b7a] to-[#24428b] border-b border-blue-500/20 flex justify-between items-center sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 shadow-inner border border-purple-500/30">
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                </div>
                <h2 className="text-[18px] font-extrabold text-white tracking-wide">Terms of Service</h2>
              </div>
              <button onClick={() => setShowTerms(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-all">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {[
                {title: "Acceptance", desc: "By using SwagBucks, you agree to comply with all rules and guidelines laid out in this document."},
                {title: "Prohibited Activity", desc: "The use of bots, emulators, auto-clickers, VPNs, Proxies, or multiple accounts per person is strictly forbidden."},
                {title: "Earnings & Withdrawals", desc: "Earnings are distributed at the sole discretion of SwagBucks based on verified activity. SwagBucks reserves the right to withhold payments if fraudulent activity is detected."},
                {title: "Account Termination", desc: "We reserve the right to ban or suspend any account found violating these terms without prior notice or compensation."}
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-[#1e3b7a]/30 border border-blue-500/10 rounded-2xl">
                  <div className="w-6 h-6 flex-shrink-0 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300 font-black text-[10px] mt-1 border border-purple-500/30">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] text-white mb-1">{item.title}</h3>
                    <p className="text-[12px] text-blue-100/70 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserProfile;
