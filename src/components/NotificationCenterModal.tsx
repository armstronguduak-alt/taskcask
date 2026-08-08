import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface NotificationCenterModalProps {
  onClose: () => void;
}

type NotificationTab = 'personal' | 'live_payouts';

const RECENT_PAYOUTS = [
  { id: 1, name: "David M.", country: "USA", amount: 1500, timeAgo: "Just now" },
  { id: 2, name: "Sarah K.", country: "UK", amount: 3200, timeAgo: "Just now" },
  { id: 3, name: "Michael T.", country: "Canada", amount: 800, timeAgo: "Just now" },
  { id: 4, name: "Elena R.", country: "Spain", amount: 5000, timeAgo: "Just now" },
  { id: 5, name: "James L.", country: "Australia", amount: 2100, timeAgo: "Just now" },
  { id: 6, name: "Anna S.", country: "Germany", amount: 1100, timeAgo: "Just now" },
  { id: 7, name: "Carlos F.", country: "Brazil", amount: 4500, timeAgo: "Just now" },
  { id: 8, name: "Yuki M.", country: "Japan", amount: 6200, timeAgo: "Just now" },
];

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ onClose }) => {
  const { notifications } = useApp();
  const [activeTab, setActiveTab] = useState<NotificationTab>('live_payouts');

  const [feedItems, setFeedItems] = useState(() => RECENT_PAYOUTS.slice(0, 3).map((item, i) => ({ ...item, uniqueId: `init-${i}` })));
  const [nextIndex, setNextIndex] = useState(3);

  useEffect(() => {
    if (activeTab === 'live_payouts') {
      const timer = setInterval(() => {
        setFeedItems(prev => {
          const baseItem = RECENT_PAYOUTS[nextIndex % RECENT_PAYOUTS.length];
          const newItem = { ...baseItem, uniqueId: `live-${Date.now()}` };
          return [newItem, ...prev].slice(0, 15);
        });
        setNextIndex(prev => prev + 1);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [activeTab, nextIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2563eb] text-2xl">notifications_active</span>
              <h2 className="font-black text-lg text-on-surface dark:text-white tracking-tight">Notification Center</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live updates & global cash-out alerts
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
            onClick={() => setActiveTab('live_payouts')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'live_payouts'
                ? 'border-[#2563eb] text-[#2563eb]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <span className="material-symbols-outlined text-base">payments</span>
            Live Payouts
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'personal'
                ? 'border-[#2563eb] text-[#2563eb]'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <span className="material-symbols-outlined text-base">person</span>
            My Alerts ({notifications.length})
          </button>
        </div>

        {/* TAB 1: LIVE PAYOUTS FEED */}
        {activeTab === 'live_payouts' && (
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            
            {/* Live Ticker Counter Banner */}
            <div className="bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <div>
                  <h4 className="font-extrabold text-xs text-blue-600 dark:text-[#2563eb] uppercase tracking-wide">
                    Live Verified Payout Stream
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Global members paid out today
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#2563eb] text-zinc-900 text-[10px] font-black uppercase shadow-sm">
                Realtime
              </span>
            </div>

            {/* Withdrawals List Feed */}
            <div className="space-y-2.5">
              {feedItems.map((wdr) => (
                <div 
                  key={wdr.uniqueId} 
                  className="bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800/80 p-3.5 rounded-2xl flex items-center justify-between gap-3 hover:border-[#2563eb]/30 transition-all shadow-xs animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center font-black text-sm border border-[#2563eb]/20">
                      <span className="material-symbols-outlined text-[18px]">public</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-extrabold text-xs text-on-surface dark:text-white">{wdr.name}</h5>
                        <span className="material-symbols-outlined text-[14px] text-[#2563eb]" title="Verified Payout">check_circle</span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {wdr.country}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm text-[#2563eb] block">
                      +{wdr.amount.toLocaleString()} SB
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">
                      {wdr.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MY PERSONAL ALERTS */}
        {activeTab === 'personal' && (
          <div className="p-5 flex-1 overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <span className="material-symbols-outlined text-4xl text-gray-300">notifications_off</span>
                <p className="text-gray-500 font-medium text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="bg-blue-50/50 dark:bg-[#2563eb]/5 border border-blue-100 dark:border-[#2563eb]/20 p-4 rounded-2xl">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm text-on-surface dark:text-white">{n.title}</h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now'}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
