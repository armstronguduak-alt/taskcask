import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const WithdrawFunds: React.FC = () => {
  const { wallet, banks, user, levels, requestWithdrawal, setTab } = useApp();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];
  const minWithdraw = userLevel.id === 'lvl_1' ? 2000 : userLevel.id === 'lvl_2' ? 1000 : userLevel.id === 'lvl_3' ? 500 : 100;

  const [selectedBank, setSelectedBank] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        {/* Withdrawal Form */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
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
              disabled={isSubmitting || (wallet && amount && parseFloat(amount) > wallet.active_balance) ? true : false}
              className="w-full py-4 bg-primary text-white font-bold text-xs rounded-2xl shadow-lg shadow-primary/25 active:scale-98 transition-all duration-150 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              {isSubmitting ? 'Processing payout...' : 'Submit Cash-out Request'}
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
