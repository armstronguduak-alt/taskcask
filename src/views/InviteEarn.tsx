import React from 'react';
import { useApp } from '../context/AppContext';

export const InviteEarn: React.FC = () => {
  const { wallet, referrals, user } = useApp();

  const refCode = user ? user.username.toUpperCase() : 'TASKCASH';
  const refLink = `https://t.me/taskcashbox_bot?start=${refCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    alert('Referral link copied to clipboard!');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`👋 Hey! Start earning Nigerian Naira (₦) daily by watching ads and completing social tasks with TaskCash. Join here: `);
    const url = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`;
    window.open(url, '_blank');
  };

  // Mock list of referred users details
  const mockReferredUsers = [
    { username: '@obi_alex', registered: '5 days ago', earned: 500, status: 'Active' },
    { username: '@favour_chidi', registered: '3 days ago', earned: 1000, status: 'Active' },
    { username: '@samuel_123', registered: '1 day ago', earned: 0, status: 'Pending' }
  ];

  const totalReferralEarnings = referrals.length * 500; // ₦500 per referral
  const activeReferrals = mockReferredUsers.filter(r => r.status === 'Active').length;
  const pendingReferrals = mockReferredUsers.filter(r => r.status === 'Pending').length;

  return (
    <div className="flex-grow pb-32">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-[#f8f9ff]/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <h1 className="font-bold text-lg text-primary dark:text-[#62df7d]">Invite & Earn</h1>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
            <span className="material-symbols-outlined text-primary text-[16px] font-fill">account_balance_wallet</span>
            <span className="text-xs font-bold text-primary">₦{(wallet?.active_balance || 0).toLocaleString()}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-6">
        
        {/* Referral Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 shadow-xl text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="relative z-10 space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-1">Referral Rewards</p>
              <h2 className="text-2xl font-extrabold tracking-tight">Earn ₦500.00 Per Friend</h2>
              <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
                Invite your friends to TaskCash. You earn ₦500 instantly when they complete their first task, plus 10% commission on their lifetime ad views!
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                <p className="text-[9px] font-bold opacity-75 uppercase tracking-wide">Total Invited</p>
                <p className="font-bold text-[18px] mt-0.5">{referrals.length}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                <p className="text-[9px] font-bold opacity-75 uppercase tracking-wide">Referral Income</p>
                <p className="font-bold text-[18px] mt-0.5">₦{totalReferralEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                <p className="text-[9px] font-bold opacity-75 uppercase tracking-wide">Active Referrals</p>
                <p className="font-bold text-[18px] mt-0.5">{activeReferrals}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/5">
                <p className="text-[9px] font-bold opacity-75 uppercase tracking-wide">Pending Referrals</p>
                <p className="font-bold text-[18px] mt-0.5">{pendingReferrals}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Share Section */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-on-surface dark:text-gray-200">Your Referral link</h3>
          
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-gray-100 dark:border-zinc-800/80">
            <span className="material-symbols-outlined text-primary text-[20px]">link</span>
            <span className="flex-1 text-xs font-semibold text-on-surface dark:text-gray-300 truncate text-left">{refLink}</span>
            <button 
              onClick={handleCopyLink}
              className="text-xs font-bold text-primary dark:text-[#62df7d] hover:opacity-85"
            >
              Copy
            </button>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleCopyLink}
              className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 text-on-surface dark:text-gray-300 font-bold text-xs rounded-xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              Copy Link
            </button>
            <button 
              onClick={handleShareTelegram}
              className="flex-1 py-3 bg-[#316bf3] text-white font-bold text-xs rounded-xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-[#316bf3]/25"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              Share Telegram
            </button>
          </div>
        </section>

        {/* Referral Milestones */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400">Earning milestones</h3>
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                <span className="text-on-surface dark:text-gray-300">Unlock Bronze Earning Badge</span>
                <span className="text-primary dark:text-[#62df7d]">{referrals.length} / 5 invited</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (referrals.length / 5) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Invited Friends list */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400">Referred Friends</h3>
          
          <div className="space-y-4">
            {/* Active Referrals */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-xs text-primary">Active ({activeReferrals})</h4>
              {mockReferredUsers.filter(r => r.status === 'Active').length === 0 ? (
                <div className="text-center py-4 text-[10px] text-gray-400 italic">No active referrals yet.</div>
              ) : (
                mockReferredUsers.filter(r => r.status === 'Active').map((ref, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-50 dark:border-zinc-800/50 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-on-surface dark:text-gray-200">{ref.username}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Joined {ref.registered}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-primary dark:text-[#62df7d]">+₦{ref.earned.toLocaleString()}</p>
                      <span className="inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase mt-1 bg-green-500/10 text-green-600">
                        Active
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pending Referrals */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-xs text-amber-500">Pending ({pendingReferrals})</h4>
              {mockReferredUsers.filter(r => r.status === 'Pending').length === 0 ? (
                <div className="text-center py-4 text-[10px] text-gray-400 italic">No pending referrals.</div>
              ) : (
                mockReferredUsers.filter(r => r.status === 'Pending').map((ref, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-50 dark:border-zinc-800/50 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500">
                        <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-on-surface dark:text-gray-200">{ref.username}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Joined {ref.registered}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-gray-400">Incomplete</p>
                      <span className="inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase mt-1 bg-amber-500/10 text-amber-600">
                        Pending
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
export default InviteEarn;
