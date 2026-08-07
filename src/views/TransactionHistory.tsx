import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

type FilterType = 'All' | 'Earnings' | 'Upgrades' | 'Withdrawals';

export const TransactionHistory: React.FC = () => {
  const { transactions, setTab } = useApp();
  const [filter, setFilter] = useState<FilterType>('All');

  // Filter logic
  const filteredTx = transactions.filter((tx) => {
    if (filter === 'All') return true;
    if (filter === 'Earnings') return tx.type === 'WatchReward' || tx.type === 'TaskReward' || tx.type === 'DailyReward' || tx.type === 'ReferralReward';
    if (filter === 'Upgrades') return tx.type === 'LevelUpgrade';
    if (filter === 'Withdrawals') return tx.type === 'Withdrawal';
    return true;
  });

  return (
    <div className="flex-grow pb-32 bg-transparent">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-transparent pt-4">
        <div className="flex items-center gap-stack-md px-container-padding py-4 w-full">
          <button onClick={() => setTab('Dashboard')} className="ripple-active p-1 text-[#2563eb]">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-bold text-lg text-[#2563eb]">Statement logs</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-5">
        
        {/* Filters chips */}
        <section className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['All', 'Earnings', 'Upgrades', 'Withdrawals'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-bold text-[10px] uppercase whitespace-nowrap shadow-sm transition-all duration-150 ${
                filter === f
                  ? 'bg-[#2563eb] text-zinc-900'
                  : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-[#6e7b6c] dark:text-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </section>

        {/* Timeline Log */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          {filteredTx.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 font-semibold italic">
              No transactions recorded in this log category.
            </div>
          ) : (
            filteredTx.map((tx) => {
              const isIncome = tx.type !== 'Withdrawal' && tx.type !== 'LevelUpgrade';
              return (
                <div key={tx.id} className="flex justify-between items-center border-b border-gray-50 dark:border-zinc-800/50 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'WatchReward' ? 'bg-[#2563eb]/10 text-[#2563eb]' :
                      tx.type === 'TaskReward' ? 'bg-blue-500/10 text-blue-500' :
                      tx.type === 'LevelUpgrade' ? 'bg-orange-500/10 text-orange-500' :
                      tx.type === 'Withdrawal' ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {tx.type === 'WatchReward' ? 'play_circle' :
                         tx.type === 'TaskReward' ? 'assignment' :
                         tx.type === 'LevelUpgrade' ? 'upgrade' :
                         tx.type === 'Withdrawal' ? 'payments' : 'monetization_on'}
                      </span>
                    </div>
                    <div className="max-w-[190px]">
                      <p className="font-bold text-xs text-on-surface dark:text-gray-200 leading-snug">{tx.description}</p>
                      <p className="text-[9px] text-gray-400 mt-1">
                        {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-extrabold text-xs ${isIncome ? 'text-[#2563eb]' : 'text-orange-500 dark:text-orange-400'}`}>
                      {isIncome ? '+' : '-'}{tx.amount.toLocaleString()} {tx.currency}
                    </p>
                    <span className={`inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase mt-1.5 ${
                      tx.status === 'Success' ? 'bg-[#2563eb]/15 text-[#2563eb]' :
                      tx.status === 'Pending' ? 'bg-amber-500/15 text-amber-600' : 'bg-red-500/15 text-red-600'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </section>

      </div>
    </div>
  );
};
export default TransactionHistory;
