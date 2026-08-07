import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';
import { SupabaseService } from '../services/supabaseService';

export const InviteEarn: React.FC = () => {
  const { affiliateWallet, user, referrals } = useApp();
  const [supabaseReferralProfiles, setSupabaseReferralProfiles] = useState<any[] | null>(null);

  const refCode = user?.referral_code || `SB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const refLink = `https://t.me/swagbucks_bot/app?startapp=${refCode}`;

  useEffect(() => {
    if (user?.id) {
      SupabaseService.getReferralProfiles(user.id).then(profiles => {
        if (profiles) setSupabaseReferralProfiles(profiles);
      });
    }
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    alert('Referral link copied to clipboard!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    alert('Referral code copied to clipboard!');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`👋 Hey! Start earning SwagBucks (SB) daily by watching ads and completing easy tasks on SwagBucks. Join here: `);
    const url = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`;
    window.open(url, '_blank');
  };

  // Local state referred users fallback
  const myReferrals = referrals.filter(r => r.referrer_id === user?.id);

  // Combine Supabase profiles or local fallback profiles
  const referralItems = supabaseReferralProfiles && supabaseReferralProfiles.length > 0
    ? supabaseReferralProfiles.map(p => ({
        id: p.referral_id,
        name: p.display_name || p.first_name || 'Member',
        username: p.username ? `@${p.username}` : 'No username',
        photo: p.photo_url,
        registered: new Date(p.joined_at || new Date()).toLocaleDateString(),
        earned: p.reward_amount || (p.referral_status === 'Active' ? 500 : 0),
        status: p.referral_status || 'Active'
      }))
    : myReferrals.map(r => {
        const isActive = r.referral_status === 'Active' || r.referral_status === 'Qualified';
        return {
          id: r.id,
          name: 'Member',
          username: 'No username',
          photo: undefined,
          registered: new Date(r.created_at || new Date()).toLocaleDateString(),
          earned: isActive ? 500 : 0,
          status: isActive ? 'Active' : 'Pending'
        };
      });

  const activeReferrals = referralItems.filter(r => r.status === 'Active' || r.status === 'Qualified' || r.status === 'Rewarded');
  const pendingReferrals = referralItems.filter(r => r.status === 'Pending');

  const totalReferralEarnings = activeReferrals.reduce((sum, r) => sum + (r.earned || 500), 0);

  return (
    <div className="flex-grow pb-32 bg-transparent">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-transparent pt-4">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <h1 className="font-bold text-lg text-[#2563eb] dark:text-[#2563eb]">Invite & Earn</h1>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#2563eb]/10 rounded-full">
            <span className="material-symbols-outlined text-[#2563eb] text-[16px] font-fill">account_balance_wallet</span>
            <span className="text-xs font-bold text-[#2563eb]">{(affiliateWallet?.balance_sb || 0).toLocaleString()} SB</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-6">
        
        {/* Referral Hero Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563eb] to-[#4caf50] p-6 shadow-xl text-zinc-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="relative z-10 space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-1 text-zinc-800">Referral Rewards</p>
              <h2 className="text-2xl font-extrabold tracking-tight">Earn 500 SB Per Friend</h2>
              <p className="text-[11px] opacity-80 mt-1 leading-relaxed text-zinc-800">
                Invite your friends using your unique referral code. You earn 500 SB instantly when they join and complete tasks!
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/10 p-3 rounded-2xl border border-black/5">
                <p className="text-[9px] font-bold opacity-75 uppercase tracking-wide">Total Invited</p>
                <p className="font-bold text-[18px] mt-0.5">{referralItems.length}</p>
              </div>
              <div className="bg-black/10 p-3 rounded-2xl border border-black/5">
                <p className="text-[9px] font-bold opacity-75 uppercase tracking-wide">Referral Income</p>
                <p className="font-bold text-[18px] mt-0.5">{totalReferralEarnings.toLocaleString()} SB</p>
              </div>
              <div className="bg-black/10 p-3 rounded-2xl border border-black/5">
                <p className="text-[9px] font-bold opacity-75 uppercase tracking-wide">Active Referrals</p>
                <p className="font-bold text-[18px] mt-0.5">{activeReferrals.length}</p>
              </div>
              <div className="bg-black/10 p-3 rounded-2xl border border-black/5">
                <p className="text-[9px] font-bold opacity-75 uppercase tracking-wide">Pending Referrals</p>
                <p className="font-bold text-[18px] mt-0.5">{pendingReferrals.length}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Unique Referral Code & Link Section */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs text-on-surface dark:text-gray-200">Your Referral Code</h3>
            <span className="px-3 py-1 bg-[#2563eb]/10 text-[#2563eb] dark:text-[#2563eb] font-extrabold text-xs rounded-full border border-[#2563eb]/20">
              {refCode}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-gray-100 dark:border-zinc-800/80">
            <span className="material-symbols-outlined text-[#2563eb] text-[20px]">link</span>
            <span className="flex-1 text-xs font-semibold text-on-surface dark:text-gray-300 truncate text-left">{refLink}</span>
            <button 
              onClick={handleCopyLink}
              className="text-xs font-bold text-[#2563eb] hover:opacity-85"
            >
              Copy
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={handleCopyCode}
              className="py-3 bg-gray-100 dark:bg-zinc-800 text-on-surface dark:text-gray-300 font-bold text-xs rounded-xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">tag</span>
              Code
            </button>
            <button 
              onClick={handleCopyLink}
              className="py-3 bg-gray-100 dark:bg-zinc-800 text-on-surface dark:text-gray-300 font-bold text-xs rounded-xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">content_copy</span>
              Link
            </button>
            <button 
              onClick={handleShareTelegram}
              className="py-3 bg-[#316bf3] text-white font-bold text-xs rounded-xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-md shadow-[#316bf3]/25"
            >
              <span className="material-symbols-outlined text-[15px]">send</span>
              Share
            </button>
          </div>
        </section>

        {/* Referred Friends list with Avatar component */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400">Referred Friends</h3>
          
          <div className="space-y-4">
            {/* Active Referrals */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-xs text-[#2563eb]">Active ({activeReferrals.length})</h4>
              {activeReferrals.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 font-semibold space-y-1">
                  <p>No active referrals yet.</p>
                  <p className="text-[10px] text-gray-400 font-normal">Share your link to start earning 500 SB per friend!</p>
                </div>
              ) : (
                activeReferrals.map((ref) => (
                  <div key={ref.id} className="flex justify-between items-center border-b border-gray-50 dark:border-zinc-800/50 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar src={ref.photo} name={ref.name} size="md" />
                      <div>
                        <p className="font-bold text-xs text-on-surface dark:text-gray-200">{ref.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{ref.username} • Joined {ref.registered}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-[#2563eb] dark:text-[#2563eb]">+{ref.earned || 500} SB</p>
                      <span className="inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase mt-1 bg-[#2563eb]/10 text-[#2563eb]">
                        Active
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pending Referrals */}
            {pendingReferrals.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-xs text-amber-500">Pending ({pendingReferrals.length})</h4>
                {pendingReferrals.map((ref) => (
                  <div key={ref.id} className="flex justify-between items-center border-b border-gray-50 dark:border-zinc-800/50 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar src={ref.photo} name={ref.name} size="md" />
                      <div>
                        <p className="font-bold text-xs text-on-surface dark:text-gray-200">{ref.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{ref.username} • Joined {ref.registered}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-gray-400">Pending</p>
                      <span className="inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase mt-1 bg-amber-500/10 text-amber-600">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
export default InviteEarn;
