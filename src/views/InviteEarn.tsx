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
        <div className="flex justify-between items-center px-container-padding w-full">
          <h1 className="font-extrabold text-[22px] tracking-tight text-white">Invite & Earn</h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#132252] border border-blue-500/30 rounded-full shadow-inner">
            <span className="material-symbols-outlined text-purple-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            <span className="text-[13px] font-extrabold tracking-tight text-white">{(affiliateWallet?.balance_sb || 0).toLocaleString()} SB</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-6 space-y-6">
        
        {/* Referral Hero Card */}
        <section className="relative overflow-hidden rounded-[24px] bg-[#1e3b7a] p-6 shadow-xl text-white border border-blue-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-[20px] bg-[#132252] border border-blue-500/30 flex items-center justify-center shadow-inner flex-shrink-0">
                <span className="material-symbols-outlined text-[32px] text-purple-400" style={{ fontVariationSettings: "'FILL' 1" }}>group_add</span>
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200 mb-1">Referral Rewards</p>
                <h2 className="text-[22px] font-extrabold tracking-tight text-white leading-tight">Earn 500 SB<br/>Per Friend</h2>
              </div>
            </div>
            <p className="text-[13px] font-bold text-blue-100 leading-relaxed tracking-wide">
              Invite your friends using your unique referral code. You earn 500 SB instantly when they join and complete tasks!
            </p>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#132252] p-4 rounded-[16px] border border-blue-500/20 shadow-inner">
                <p className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wide">Total Invited</p>
                <p className="font-extrabold text-[22px] text-white tracking-tight mt-1">{referralItems.length}</p>
              </div>
              <div className="bg-[#132252] p-4 rounded-[16px] border border-blue-500/20 shadow-inner">
                <p className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wide">Income</p>
                <p className="font-extrabold text-[22px] text-[#fbbf24] tracking-tight mt-1">{totalReferralEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-[#132252] p-4 rounded-[16px] border border-blue-500/20 shadow-inner">
                <p className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wide">Active</p>
                <p className="font-extrabold text-[22px] text-green-400 tracking-tight mt-1">{activeReferrals.length}</p>
              </div>
              <div className="bg-[#132252] p-4 rounded-[16px] border border-blue-500/20 shadow-inner">
                <p className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wide">Pending</p>
                <p className="font-extrabold text-[22px] text-amber-400 tracking-tight mt-1">{pendingReferrals.length}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Unique Referral Code & Link Section */}
        <section className="bg-[#1e3b7a] border border-blue-500/20 rounded-[24px] p-5 shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-[15px] text-white tracking-tight">Your Referral Code</h3>
            <span className="px-3.5 py-1.5 bg-[#132252] text-white font-extrabold text-[13px] rounded-full border border-blue-500/30 tracking-wider shadow-inner">
              {refCode}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-[#132252] p-4 rounded-[16px] border border-blue-500/30 shadow-inner">
            <span className="material-symbols-outlined text-[#4a72ff] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>link</span>
            <span className="flex-1 text-[13px] font-extrabold text-blue-100 truncate text-left tracking-wide">{refLink}</span>
            <button 
              onClick={handleCopyLink}
              className="w-10 h-10 bg-[#4a72ff] rounded-xl flex items-center justify-center text-white active:scale-95 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={handleCopyCode}
              className="py-4 bg-[#132252] border border-blue-500/30 text-white font-extrabold text-[14px] rounded-[16px] active:scale-95 transition-all shadow-inner flex items-center justify-center gap-2 tracking-wide"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>tag</span>
              Copy Code
            </button>
            <button 
              onClick={handleShareTelegram}
              className="py-4 bg-[#4a72ff] text-white font-extrabold text-[14px] rounded-[16px] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 tracking-wide"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              Share
            </button>
          </div>
        </section>

        {/* Referred Friends list with Avatar component */}
        <section className="space-y-4">
          <h3 className="text-[15px] font-extrabold tracking-tight text-white text-center border-b border-blue-500/20 pb-3">Referred Friends</h3>
          
          <div className="space-y-4">
            {/* Active Referrals */}
            <div className="bg-[#1e3b7a] border border-blue-500/20 rounded-[24px] p-5 shadow-lg space-y-4">
              <h4 className="font-extrabold text-[14px] text-green-400 tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                Active ({activeReferrals.length})
              </h4>
              {activeReferrals.length === 0 ? (
                <div className="text-center py-6 text-[13px] text-blue-200 font-bold space-y-1">
                  <p>No active referrals yet.</p>
                  <p className="text-[11px] text-blue-300">Share your link to start earning 500 SB per friend!</p>
                </div>
              ) : (
                activeReferrals.map((ref) => (
                  <div key={ref.id} className="flex justify-between items-center border-b border-blue-500/10 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="border-2 border-green-500/30 rounded-full p-0.5">
                        <Avatar src={ref.photo} name={ref.name} size="md" />
                      </div>
                      <div>
                        <p className="font-extrabold text-[14px] text-white tracking-tight">{ref.name}</p>
                        <p className="text-[11px] font-bold text-blue-300 mt-0.5">{ref.username} • Joined {ref.registered}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-[14px] text-[#fbbf24] tracking-tight">+{ref.earned || 500} SB</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase mt-1.5 bg-green-500/20 text-green-400 border border-green-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        Active
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pending Referrals */}
            {pendingReferrals.length > 0 && (
              <div className="bg-[#1e3b7a] border border-blue-500/20 rounded-[24px] p-5 shadow-lg space-y-4">
                <h4 className="font-extrabold text-[14px] text-amber-400 tracking-wide flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                  Pending ({pendingReferrals.length})
                </h4>
                {pendingReferrals.map((ref) => (
                  <div key={ref.id} className="flex justify-between items-center border-b border-blue-500/10 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="border-2 border-amber-500/30 rounded-full p-0.5">
                        <Avatar src={ref.photo} name={ref.name} size="md" />
                      </div>
                      <div>
                        <p className="font-extrabold text-[14px] text-white tracking-tight">{ref.name}</p>
                        <p className="text-[11px] font-bold text-blue-300 mt-0.5">{ref.username} • Joined {ref.registered}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-extrabold text-[14px] text-blue-300/50 tracking-tight">Pending</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase mt-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
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
