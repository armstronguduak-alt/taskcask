import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NIGERIAN_WITHDRAWALS_DATA } from '../data/nigerianWithdrawalsData';

interface NotificationCenterModalProps {
  onClose: () => void;
}

type NotificationTab = 'personal' | 'nigeria_withdrawals';

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ onClose }) => {
  const { notifications } = useApp();
  const [activeTab, setActiveTab] = useState<NotificationTab>('nigeria_withdrawals');
  
  // Search & Filter state for Nigerian Withdrawals
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(30);

  // Filter 500 Nigerian Withdrawals
  const filteredWithdrawals = NIGERIAN_WITHDRAWALS_DATA.filter((wdr) => {
    const matchesSearch = 
      wdr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wdr.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wdr.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wdr.bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wdr.amount.toString().includes(searchQuery);

    const matchesBank = selectedBank === 'All' || wdr.bank === selectedBank;
    return matchesSearch && matchesBank;
  });

  const displayedWithdrawals = filteredWithdrawals.slice(0, visibleCount);

  // Get unique bank list for filter dropdown
  const bankList = Array.from(new Set(NIGERIAN_WITHDRAWALS_DATA.map(w => w.bank)));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">notifications_active</span>
              <h2 className="font-black text-lg text-on-surface dark:text-white tracking-tight">Notification Center</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live updates & nationwide Nigerian cash-out alerts
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-200/80 dark:bg-zinc-800 text-gray-500 hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Selector Switcher */}
        <div className="px-5 pt-4 flex gap-2 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab('nigeria_withdrawals')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'nigeria_withdrawals'
                ? 'border-primary text-primary dark:text-[#62df7d]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <span className="material-symbols-outlined text-base">payments</span>
            Live Nigeria Withdrawals ({NIGERIAN_WITHDRAWALS_DATA.length})
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'personal'
                ? 'border-primary text-primary dark:text-[#62df7d]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <span className="material-symbols-outlined text-base">person</span>
            My Alerts ({notifications.length})
          </button>
        </div>

        {/* TAB 1: 500 NIGERIAN WITHDRAWALS FEED */}
        {activeTab === 'nigeria_withdrawals' && (
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            
            {/* Live Ticker Counter Banner */}
            <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <h4 className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    Live Verified Payout Stream
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    500 Nigerian members paid out across all 36 states
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase shadow-sm">
                Realtime
              </span>
            </div>

            {/* Search & Bank Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, city, state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-on-surface dark:text-white"
                />
                <span className="material-symbols-outlined text-gray-400 text-lg absolute left-2.5 top-2">search</span>
              </div>

              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="px-3.5 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-on-surface dark:text-gray-200"
              >
                <option value="All">All Banks ({bankList.length} banks)</option>
                {bankList.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            {/* Withdrawals List Feed */}
            <div className="space-y-2.5">
              {displayedWithdrawals.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-8 italic font-semibold">
                  No matching Nigerian withdrawals found for your search.
                </p>
              ) : (
                displayedWithdrawals.map((wdr) => (
                  <div 
                    key={wdr.id} 
                    className="bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800/80 p-3.5 rounded-2xl flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/20">
                        🇳🇬
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-extrabold text-xs text-on-surface dark:text-white">{wdr.name}</h5>
                          <span className="material-symbols-outlined text-[14px] text-emerald-500" title="Verified Payout">check_circle</span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {wdr.city}, {wdr.state} • <span className="font-semibold text-primary">{wdr.bank}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 block">
                        +₦{wdr.amount.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">
                        {wdr.timeAgo}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredWithdrawals.length && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 40)}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold text-primary dark:text-gray-200 rounded-xl transition-all shadow-sm"
                >
                  Load More Cash-outs ({filteredWithdrawals.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY PERSONAL ALERTS */}
        {activeTab === 'personal' && (
          <div className="p-5 flex-1 overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <span className="material-symbols-outlined text-4xl text-gray-300">notifications_off</span>
                <p className="text-xs text-gray-400 font-bold">You have no personal notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 p-3.5 rounded-2xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-on-surface dark:text-white">{n.title}</span>
                    <span className="text-[9px] text-gray-400">{new Date(n.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenterModal;
