import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const WithdrawFunds: React.FC = () => {
  const { wallet, banks, user, levels, requestWithdrawal, setTab, users, systemSettings } = useApp();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];
  const minWithdraw = userLevel.min_withdrawal;

  const [selectedBank, setSelectedBank] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmittingState, setIsSubmitting] = useState(false);

  const isEmailVerified = user?.email_verified || false;
  const isPhoneVerified = user?.phone_verified || false;
  const hasMinBalance = (wallet?.active_balance || 0) >= minWithdraw;
  
  const accountAgeDays = Math.floor((new Date().getTime() - new Date(user?.registered_at || new Date()).getTime()) / (1000 * 3600 * 24));
  const hasAccountAge = accountAgeDays >= userLevel.req_account_age;
  
  const hasStreak = (user?.login_streak || 0) >= userLevel.req_streak;
  const hasTasks = (user?.total_tasks_completed || 0) >= userLevel.req_tasks;
  const hasAds = (user?.total_ads_watched || 0) >= userLevel.req_ads;
  
  const referralReqSetting = systemSettings.find(s => s.key === 'referral_active_ads_req')?.value;
  const activeAdsReq = referralReqSetting ? parseInt(referralReqSetting) : 10;
  const activeReferralsCount = users.filter(
    u => u.referrer_id === user?.id && (u.total_ads_watched || 0) >= activeAdsReq
  ).length;
  const hasReferrals = activeReferralsCount >= userLevel.req_referrals;

  const isEligible = isEmailVerified && isPhoneVerified && hasMinBalance && hasAccountAge && hasStreak && hasTasks && hasAds && hasReferrals;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || !accountNum || !accountName || !amount) return;

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    const result = requestWithdrawal(selectedBank, accountNum, accountName, withdrawAmount);
    setIsSubmitting(false);

    if (result.success) {
      alert(result.message);
      setTab('History');
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="flex-grow pb-32">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-[#f8f9ff]/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <div className="flex items-center gap-stack-md">
            <button onClick={() => setTab('Profile')} className="ripple-active p-1 text-primary">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-bold text-lg text-primary dark:text-[#62df7d]">Withdraw</h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
            <span className="material-symbols-outlined text-primary text-[16px] font-fill">account_balance_wallet</span>
            <span className="text-xs font-bold text-primary">₦{(wallet?.active_balance || 0).toLocaleString()}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-6">
        
        {/* Balance Status */}
        <section className="bg-gradient-to-br from-primary to-[#00873a] rounded-3xl p-6 shadow-xl text-white">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-1">Withdrawable Balance</p>
          <h2 className="text-3xl font-extrabold tracking-tight">
            ₦{(wallet?.active_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex justify-between items-center border-t border-white/20 pt-4 mt-4 text-xs opacity-90">
            <span>Minimum Limit ({userLevel.name})</span>
            <span className="font-bold">₦{minWithdraw.toLocaleString()}</span>
          </div>
        </section>

        {/* Requirements Checklist */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-gray-400">Eligibility Checklist</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-on-surface dark:text-gray-200">Account Age</span>
              {hasAccountAge ? (
                <span className="text-green-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Met</span>
              ) : (
                <span className="text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">cancel</span> {accountAgeDays}/{userLevel.req_account_age} days</span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-on-surface dark:text-gray-200">Login Streak</span>
              {hasStreak ? (
                <span className="text-green-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Met</span>
              ) : (
                <span className="text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">cancel</span> {user?.login_streak || 0}/{userLevel.req_streak} days</span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-on-surface dark:text-gray-200">Completed Tasks</span>
              {hasTasks ? (
                <span className="text-green-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Met</span>
              ) : (
                <span className="text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">cancel</span> {user?.total_tasks_completed || 0}/{userLevel.req_tasks}</span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-on-surface dark:text-gray-200">Rewarded Videos</span>
              {hasAds ? (
                <span className="text-green-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Met</span>
              ) : (
                <span className="text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">cancel</span> {user?.total_ads_watched || 0}/{userLevel.req_ads}</span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-on-surface dark:text-gray-200">Active Referrals</span>
              {hasReferrals ? (
                <span className="text-green-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Met</span>
              ) : (
                <span className="text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">cancel</span> {activeReferralsCount}/{userLevel.req_referrals}</span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs font-bold border-t border-gray-100 dark:border-zinc-800 pt-2">
              <span className="text-on-surface dark:text-gray-200">Email Verified</span>
              {isEmailVerified ? (
                <span className="text-green-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Yes</span>
              ) : (
                <span className="text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">cancel</span> No</span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-on-surface dark:text-gray-200">Phone Verified</span>
              {isPhoneVerified ? (
                <span className="text-green-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Yes</span>
              ) : (
                <span className="text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">cancel</span> No</span>
              )}
            </div>
          </div>
          
          {!isEligible && (
            <div className="pt-2">
              <p className="text-[10px] text-red-500 italic">You must meet all requirements to unlock cash-outs.</p>
              {(!isEmailVerified || !isPhoneVerified) && (
                <button onClick={() => setTab('Profile')} className="mt-2 w-full py-2 bg-gray-100 dark:bg-zinc-800 text-xs font-bold rounded-xl text-primary">
                  Go to Profile to Verify
                </button>
              )}
            </div>
          )}
        </section>

        {/* Withdrawal Form */}
        <section className={`bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm transition-opacity ${!isEligible ? 'opacity-50 pointer-events-none' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Bank Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant dark:text-gray-400 uppercase tracking-wide">
                Select Bank Method
              </label>
              <select
                required
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs font-semibold text-on-surface dark:text-gray-200"
              >
                <option value="">Choose bank...</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant dark:text-gray-400 uppercase tracking-wide">
                Account Number
              </label>
              <input
                required
                type="text"
                pattern="[0-9]{10}"
                maxLength={10}
                value={accountNum}
                onChange={(e) => setAccountNum(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="10-digit Nuban number"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs font-semibold text-on-surface dark:text-gray-200"
              />
            </div>

            {/* Account Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant dark:text-gray-400 uppercase tracking-wide">
                Account Name
              </label>
              <input
                required
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Willie Obi"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs font-semibold text-on-surface dark:text-gray-200"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-on-surface-variant dark:text-gray-400 uppercase tracking-wide">
                  Withdrawal Amount (₦)
                </label>
                <button
                  type="button"
                  onClick={() => setAmount((wallet?.active_balance || 0).toString())}
                  className="text-[10px] font-bold text-primary dark:text-[#62df7d] uppercase"
                >
                  Withdraw All
                </button>
              </div>
              <input
                required
                type="number"
                min={minWithdraw}
                max={wallet?.active_balance || 0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Minimum ₦${minWithdraw}`}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs font-semibold text-on-surface dark:text-gray-200"
              />
            </div>

            {/* Warning if insufficient */}
            {amount && wallet && parseFloat(amount) > wallet.active_balance && (
              <p className="text-red-500 font-semibold text-[10px] italic">
                ⚠️ Insufficient Active Balance. Please enter an amount below ₦{wallet.active_balance.toLocaleString()}.
              </p>
            )}

            <button
              type="submit"
              disabled={!isEligible || isSubmittingState || (wallet && amount && parseFloat(amount) > wallet.active_balance) ? true : false}
              className="w-full py-4 bg-primary text-white font-bold text-xs rounded-2xl shadow-lg shadow-primary/25 active:scale-98 transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:shadow-none"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              {isSubmittingState ? 'Processing payout...' : 'Submit Cash-out Request'}
            </button>
          </form>
        </section>

        {/* Informational Warning Alert */}
        <section className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 text-amber-800 dark:text-amber-300 space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] font-fill">warning</span>
            <h4 className="font-bold text-xs">Payout Information</h4>
          </div>
          <p className="text-[10px] leading-relaxed">
            All bank withdrawal requests are routed to the system administrator queue for anti-fraud auditing. Payouts are usually verified and settled to your bank account within 24 hours. Level 3 & 4 users enjoy instant priority billing.
          </p>
        </section>

      </div>
    </div>
  );
};
export default WithdrawFunds;
