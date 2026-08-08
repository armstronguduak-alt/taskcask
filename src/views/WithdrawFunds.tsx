import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const WithdrawFunds: React.FC = () => {
  const { mainWallet, banks, user, levels, requestWithdrawal, setTab } = useApp();

  const userLevel = levels?.find(l => l.id === user?.level_id) || levels?.[0] || {} as any;
  const minWithdrawSB = 30000;
  const minWithdrawUSDT = 20;

  const [walletTab, setWalletTab] = useState<'SB' | 'USDT'>('SB');

  // SB Wallet Form
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amountSB, setAmountSB] = useState('');

  // USDT Wallet Form
  const [amountUSDT, setAmountUSDT] = useState('');
  const [trcAddress, setTrcAddress] = useState('');
  const [trcError, setTrcError] = useState('');

  const [isSubmittingState, setIsSubmitting] = useState(false);

  // Core Calculations
  const sbBalance = mainWallet?.balance_sb || 0;
  const usdtBalance = mainWallet?.balance_usdt || 0;

  // Age in days
  const accountAgeInDays = user?.registered_at 
    ? Math.floor((Date.now() - new Date(user.registered_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Welcome bonus is 1000 SB, excluded from personal eligibility
  const eligiblePersonalSB = Math.max(0, (mainWallet?.lifetime_sb || 0) - 1000);
  const eligiblePersonalUSDT = mainWallet?.lifetime_usdt || 0;

  const isEligibleSB = accountAgeInDays >= 30 && eligiblePersonalSB >= minWithdrawSB;
  const isEligibleUSDT = accountAgeInDays >= 35 && eligiblePersonalUSDT >= minWithdrawUSDT;

  // Eligibility Checklist State
  const [showEligibility, setShowEligibility] = useState(false);
  const [eligibilitySteps, setEligibilitySteps] = useState<{id: string, label: string, resolved: boolean, success: boolean}[]>([]);
  const [eligibilityStatus, setEligibilityStatus] = useState<string | null>(null);

  useEffect(() => {
    // Hide eligibility UI if tab changes
    setShowEligibility(false);
    setEligibilityStatus(null);
  }, [walletTab]);

  const handleCheckEligibility = () => {
    setShowEligibility(true);
    setEligibilityStatus(null);
    
    // Set steps dynamically based on current tab
    const stepsToRun = walletTab === 'SB' 
      ? [
          { id: 'time', label: `Activity Period (${accountAgeInDays} / 30 days)`, resolved: false, success: accountAgeInDays >= 30 },
          { id: 'points', label: `Eligible Personal Points (${eligiblePersonalSB.toLocaleString()} / 30,000 SB)`, resolved: false, success: eligiblePersonalSB >= minWithdrawSB }
        ]
      : [
          { id: 'time', label: `Activity Period (${accountAgeInDays} / 35 days)`, resolved: false, success: accountAgeInDays >= 35 },
          { id: 'points', label: `Eligible Personal Points (${eligiblePersonalUSDT.toLocaleString()} / 20 USDT)`, resolved: false, success: eligiblePersonalUSDT >= minWithdrawUSDT }
        ];

    setEligibilitySteps(stepsToRun);

    let stepIndex = 0;
    const interval = setInterval(() => {
      setEligibilitySteps(steps => {
        const newSteps = [...steps];
        if (stepIndex < newSteps.length) {
          newSteps[stepIndex].resolved = true;
        }
        return newSteps;
      });
      stepIndex++;
      
      if (stepIndex >= stepsToRun.length) {
        clearInterval(interval);
        setTimeout(() => {
           setEligibilityStatus(walletTab === 'SB' 
             ? (isEligibleSB ? 'Eligible' : 'Not Eligible')
             : (isEligibleUSDT ? 'Eligible' : 'Not Eligible')
           );
        }, 500);
      }
    }, 600); // Stagger 600ms
  };

  const handleWithdrawSB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank || !accountNum || !accountName || !amountSB) return;

    if (!isEligibleSB) {
      alert("You have not met the strict withdrawal requirements yet.");
      return;
    }

    const withdrawAmount = parseFloat(amountSB);
    if (isNaN(withdrawAmount) || withdrawAmount < minWithdrawSB) {
      alert(`Minimum withdrawal is ${minWithdrawSB.toLocaleString()} SB.`);
      return;
    }
    if (withdrawAmount > sbBalance) {
      alert('Insufficient active SB balance.');
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

  const validateTRC20 = (address: string) => {
    if (address.toLowerCase().startsWith('0x')) {
      return 'ERC20 (0x) addresses are explicitly blocked. Please use a valid TRC20 address.';
    }
    const trc20Regex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
    if (!trc20Regex.test(address)) {
      return 'Invalid TRC20 address format.';
    }
    return '';
  };

  const handleWithdrawUSDT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountUSDT || !trcAddress) return;

    if (!isEligibleUSDT) {
      alert("You have not met the strict withdrawal requirements yet.");
      return;
    }

    const withdrawAmount = parseFloat(amountUSDT);
    if (isNaN(withdrawAmount) || withdrawAmount < minWithdrawUSDT) {
      alert(`Minimum withdrawal is ${minWithdrawUSDT} USDT.`);
      return;
    }
    if (withdrawAmount > usdtBalance) {
      alert('Insufficient active USDT balance.');
      return;
    }

    const error = validateTRC20(trcAddress);
    if (error) {
      setTrcError(error);
      return;
    }

    setIsSubmitting(true);
    const result = await requestWithdrawal('Main', 'USDT', undefined, undefined, undefined, trcAddress, withdrawAmount);
    setIsSubmitting(false);

    if (result.success) {
      alert(result.message);
      setTab('History');
    } else {
      alert(result.message);
    }
  };

  const computeNaira = (sb: string) => {
    const val = parseFloat(sb);
    if (isNaN(val)) return 0;
    // 30,000 SB = 20,000 NGN. 
    return (val * (20000 / 30000)).toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className="flex-grow pb-32 bg-transparent">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-transparent pt-4">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <div className="flex items-center gap-stack-md">
            <button onClick={() => setTab('Profile')} className="ripple-active p-1 text-white">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-extrabold text-[22px] text-white">Withdraw</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-2 space-y-5">
        
        {/* Toggle Sub Tabs */}
        <div className="bg-[#1c336b] rounded-2xl p-1 flex shadow-inner">
          <button
            onClick={() => setWalletTab('SB')}
            className={`flex-1 py-3 text-center rounded-xl font-bold text-[13px] transition-all flex justify-center items-center gap-2 ${
              walletTab === 'SB' ? 'bg-[#4a72ff] text-white shadow-md' : 'text-blue-200 hover:text-white'
            }`}
          >
            <span>SB Wallet</span>
          </button>
          <button
            onClick={() => setWalletTab('USDT')}
            className={`flex-1 py-3 text-center rounded-xl font-bold text-[13px] transition-all flex justify-center items-center gap-2 ${
              walletTab === 'USDT' ? 'bg-[#4a72ff] text-white shadow-md' : 'text-blue-200 hover:text-white'
            }`}
          >
            <span>USDT Wallet</span>
          </button>
        </div>

        {/* Eligibility Check Button */}
        <button 
          onClick={handleCheckEligibility}
          className="w-full py-3 bg-[#1e3b7a] border border-blue-500/30 rounded-2xl text-blue-200 font-bold text-[13px] shadow-sm hover:bg-[#24428b] flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          Check Withdrawal Eligibility
        </button>

        {/* Animated Eligibility Checklist */}
        {showEligibility && (
          <div className="bg-[#1c336b]/80 border border-blue-500/20 rounded-2xl p-5 shadow-inner space-y-4 animate-fade-in">
            <h3 className="font-bold text-[14px] text-white mb-2">Eligibility Requirements</h3>
            {eligibilitySteps.map((step) => (
              <div key={step.id} className="flex justify-between items-center h-6">
                <span className={`text-[13px] font-bold ${step.resolved ? 'text-blue-100' : 'text-blue-300/40'}`}>
                  {step.label}
                </span>
                {step.resolved ? (
                  step.success ? (
                    <span className="animate-fade-in material-symbols-outlined text-green-400 text-[18px] bg-green-400/10 rounded-full">check_circle</span>
                  ) : (
                    <span className="animate-fade-in material-symbols-outlined text-red-400 text-[18px] bg-red-400/10 rounded-full">cancel</span>
                  )
                ) : (
                  <span className="w-4 h-4 border-2 border-blue-500/20 rounded-full"></span>
                )}
              </div>
            ))}
            
            {eligibilityStatus && (
              <div className={`mt-4 pt-4 border-t border-blue-500/10 flex justify-between items-center animate-fade-in`}>
                <span className="text-[14px] font-bold text-white">Status:</span>
                <span className={`text-[14px] font-extrabold px-3 py-1 rounded-lg ${eligibilityStatus === 'Eligible' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {eligibilityStatus}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-blue-500/10 mt-2">
               <p className="text-[10px] text-blue-300 italic">* Referral earnings sit in a separate Affiliate Wallet and do not count toward this withdrawal eligibility threshold.</p>
            </div>
          </div>
        )}

        {walletTab === 'SB' ? (
          /* SB Wallet Section */
          <div className="space-y-5 animate-fade-in">
            <section className="bg-gradient-to-br from-[#24428b] to-[#1e3b7a] border border-blue-500/20 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4a72ff]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1 relative z-10">Active Balance</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-white relative z-10 flex items-center gap-2">
                {sbBalance.toLocaleString('en-US')} <span className="text-lg text-blue-300">SB</span>
              </h2>
              <div className="flex justify-between items-center border-t border-blue-500/20 pt-4 mt-4 text-xs relative z-10">
                <span className="text-blue-200">Minimum: <strong className="text-white">30,000 SB</strong></span>
                <span className="font-bold text-[#4a72ff] bg-blue-500/10 px-2 py-1 rounded-md">30,000 SB ≈ ₦20,000</span>
              </div>
            </section>

            <section className={`bg-[#24428b] border border-blue-500/10 rounded-[24px] p-5 shadow-lg transition-opacity ${!isEligibleSB ? 'opacity-50 pointer-events-none' : ''}`}>
              {!isEligibleSB && (
                <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">lock</span> Requirements not met. Check eligibility above.</p>
                </div>
              )}
              <form onSubmit={handleWithdrawSB} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">Select Bank Method</label>
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">Account Number</label>
                  <input
                    required
                    type="text"
                    maxLength={10}
                    value={accountNum}
                    onChange={(e) => setAccountNum(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="10-digit Nuban number"
                    className="w-full px-4 py-3 bg-[#1e3b7a] border border-blue-500/20 rounded-[16px] text-xs font-semibold text-white outline-none focus:border-blue-400 placeholder-blue-300/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">Account Name</label>
                  <input
                    required
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Willie Obi"
                    className="w-full px-4 py-3 bg-[#1e3b7a] border border-blue-500/20 rounded-[16px] text-xs font-semibold text-white outline-none focus:border-blue-400 placeholder-blue-300/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">Withdrawal Amount (SB)</label>
                    <button
                      type="button"
                      onClick={() => setAmountSB(sbBalance.toString())}
                      className="text-[10px] font-bold text-[#4a72ff] uppercase"
                    >
                      Withdraw All
                    </button>
                  </div>
                  <input
                    required
                    type="number"
                    step="1"
                    min={minWithdrawSB}
                    max={sbBalance}
                    value={amountSB}
                    onChange={(e) => setAmountSB(e.target.value)}
                    placeholder={`Min ${minWithdrawSB.toLocaleString()} SB`}
                    className="w-full px-4 py-3 bg-[#1e3b7a] border border-blue-500/20 rounded-[16px] text-xs font-semibold text-white outline-none focus:border-blue-400 placeholder-blue-300/40"
                  />
                </div>

                {amountSB && parseFloat(amountSB) >= minWithdrawSB && (
                   <div className="bg-[#1c336b] p-3 rounded-xl border border-blue-500/20 flex justify-between items-center text-[13px] font-bold">
                     <span className="text-blue-200">Computed Payout:</span>
                     <span className="text-green-400">₦ {computeNaira(amountSB)}</span>
                   </div>
                )}

                {amountSB && parseFloat(amountSB) > sbBalance && (
                  <p className="text-red-400 font-semibold text-[10px] italic">
                    ⚠️ Insufficient Active Balance.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!isEligibleSB || isSubmittingState || (amountSB ? parseFloat(amountSB) > sbBalance : false)}
                  className="w-full py-4 bg-[#4a72ff] text-white font-bold text-[14px] rounded-[16px] shadow-lg hover:bg-blue-600 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:shadow-none mt-2"
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  {isSubmittingState ? 'Processing...' : 'Submit Cash-out'}
                </button>
              </form>
            </section>
          </div>
        ) : (
          /* USDT Wallet Section */
          <div className="space-y-5 animate-fade-in">
            <section className="bg-gradient-to-br from-[#1e3b7a] to-[#0f2350] border border-blue-500/20 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1 relative z-10">Active Balance</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-white relative z-10 flex items-center gap-2">
                {usdtBalance.toLocaleString('en-US')} <span className="text-lg text-teal-300">USDT</span>
              </h2>
              <div className="flex justify-between items-center border-t border-blue-500/20 pt-4 mt-4 text-xs relative z-10">
                <span className="text-blue-200">Minimum: <strong className="text-white">20 USDT</strong></span>
              </div>
            </section>

            <section className={`bg-[#24428b] border border-blue-500/10 rounded-[24px] p-5 shadow-lg transition-opacity ${!isEligibleUSDT ? 'opacity-50 pointer-events-none' : ''}`}>
              {!isEligibleUSDT && (
                <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">lock</span> Requirements not met. Check eligibility above.</p>
                </div>
              )}
              <form onSubmit={handleWithdrawUSDT} className="space-y-4">

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">Withdrawal Amount (USDT)</label>
                    <button
                      type="button"
                      onClick={() => setAmountUSDT(usdtBalance.toString())}
                      className="text-[10px] font-bold text-teal-400 uppercase"
                    >
                      Withdraw All
                    </button>
                  </div>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min={minWithdrawUSDT}
                    max={usdtBalance}
                    value={amountUSDT}
                    onChange={(e) => setAmountUSDT(e.target.value)}
                    placeholder={`Min ${minWithdrawUSDT} USDT`}
                    className="w-full px-4 py-3 bg-[#1e3b7a] border border-blue-500/20 rounded-[16px] text-xs font-semibold text-white outline-none focus:border-blue-400 placeholder-blue-300/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">TRC20 Wallet Address</label>
                  <input
                    required
                    type="text"
                    value={trcAddress}
                    onChange={(e) => {
                       setTrcAddress(e.target.value);
                       setTrcError('');
                    }}
                    placeholder="Starts with T..."
                    className="w-full px-4 py-3 bg-[#1e3b7a] border border-blue-500/20 rounded-[16px] text-xs font-semibold text-white outline-none focus:border-blue-400 placeholder-blue-300/40"
                  />
                  {trcError && <p className="text-red-400 text-[10px] font-bold italic mt-1">{trcError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={!isEligibleUSDT || isSubmittingState || (amountUSDT ? parseFloat(amountUSDT) > usdtBalance : false)}
                  className="w-full py-4 bg-teal-500 text-white font-bold text-[14px] rounded-[16px] shadow-lg hover:bg-teal-600 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:shadow-none mt-2"
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  {isSubmittingState ? 'Processing...' : 'Submit USDT Cash-out'}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawFunds;
