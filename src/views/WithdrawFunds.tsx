import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const WithdrawFunds: React.FC = () => {
  const { mainWallet, banks, user, levels, requestWithdrawal, setTab, referrals } = useApp();

  const userLevel = levels?.find(l => l.id === user?.level_id) || levels?.[0] || {} as any;
  const minWithdraw = userLevel?.min_withdrawal_sb || 0;

  const [selectedBank, setSelectedBank] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmittingState, setIsSubmitting] = useState(false);

  const hasMinBalance = (mainWallet?.balance_sb || 0) >= minWithdraw;
  
  const isEligible = hasMinBalance;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || !accountNum || !accountName || !amount) return;

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    const result = await requestWithdrawal('Main', 'SB', selectedBank, accountNum, accountName, null, withdrawAmount);
    setIsSubmitting(false);

    if (result.success) {
      alert(result.message);
      setTab('History');
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="flex-grow pb-32 bg-transparent">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-transparent pt-4">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <div className="flex items-center gap-stack-md">
            <button onClick={() => setTab('Profile')} className="ripple-active p-1 text-[#2563eb]">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-bold text-lg text-[#2563eb]">Withdraw</h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#2563eb]/10 rounded-full">
            <span className="material-symbols-outlined text-[#2563eb] text-[16px] font-fill">account_balance_wallet</span>
            <span className="text-xs font-bold text-[#2563eb]">{(mainWallet?.balance_sb || 0).toLocaleString()} SB</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-6">
        
        {/* Balance Status */}
        <section className="bg-gradient-to-br from-[#121212] to-[#1c1c1e] border border-zinc-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563eb]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-85 mb-1 relative z-10">Withdrawable Balance</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#2563eb] relative z-10">
            {(mainWallet?.balance_sb || 0).toLocaleString('en-US')} <span className="text-lg text-white">SB</span>
          </h2>
          <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4 text-xs opacity-90 relative z-10">
            <span>Minimum Limit ({userLevel.name})</span>
            <span className="font-bold text-[#2563eb]">{minWithdraw.toLocaleString()} SB</span>
          </div>
        </section>



        {/* Withdrawal Form */}
        <section className={`bg-[#24428b] border border-blue-500/10 rounded-[24px] p-5 shadow-lg transition-opacity ${!isEligible ? 'opacity-50 pointer-events-none' : ''}`}>
          <form onSubmit={handleWithdraw} className="space-y-4">
            
            {/* Bank Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">
                Select Bank Method
              </label>
              <select
                required
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-4 py-3 bg-[#1e3b7a] border border-blue-500/20 rounded-[16px] text-xs font-semibold text-white outline-none focus:border-blue-400"
              >
                <option value="">Choose bank...</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">
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
                className="w-full px-4 py-3 bg-[#1e3b7a] border border-blue-500/20 rounded-[16px] text-xs font-semibold text-white outline-none focus:border-blue-400 placeholder-blue-300/40"
              />
            </div>

            {/* Account Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">
                Account Name
              </label>
              <input
                required
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Willie Obi"
                className="w-full px-4 py-3 bg-[#1e3b7a] border border-blue-500/20 rounded-[16px] text-xs font-semibold text-white outline-none focus:border-blue-400 placeholder-blue-300/40"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">
                  Withdrawal Amount (SB)
                </label>
                <button
                  type="button"
                  onClick={() => setAmount((mainWallet?.balance_sb || 0).toString())}
                  className="text-[10px] font-bold text-[#4a72ff] uppercase"
                >
                  Withdraw All
                </button>
              </div>
              <input
                required
                type="number"
                min={minWithdraw}
                max={mainWallet?.balance_sb || 0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Minimum ${minWithdraw} SB`}
                className="w-full px-4 py-3 bg-[#1e3b7a] border border-blue-500/20 rounded-[16px] text-xs font-semibold text-white outline-none focus:border-blue-400 placeholder-blue-300/40"
              />
            </div>

            {/* Warning if insufficient */}
            {amount && mainWallet && parseFloat(amount) > mainWallet.balance_sb && (
              <p className="text-red-400 font-semibold text-[10px] italic">
                ⚠️ Insufficient Active Balance. Please enter an amount below {(mainWallet.balance_sb).toLocaleString()} SB.
              </p>
            )}

            <button
              type="submit"
              disabled={!isEligible || isSubmittingState || (mainWallet && amount && parseFloat(amount) > mainWallet.balance_sb) ? true : false}
              className="w-full py-4 bg-[#4a72ff] text-white font-bold text-xs rounded-[16px] shadow-lg hover:bg-blue-600 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:shadow-none"
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
