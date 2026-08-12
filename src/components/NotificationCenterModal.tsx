import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface NotificationCenterModalProps {
  onClose: () => void;
}

type NotificationTab = 'personal' | 'live_payouts';

const RECENT_PAYOUTS = [
  { id: 1, name: "David M.", country: "USA", amount: 35000, currency: "SB", timeAgo: "Just now" },
  { id: 2, name: "Sarah K.", country: "UK", amount: 25, currency: "USDT", timeAgo: "Just now" },
  { id: 3, name: "Michael T.", country: "Canada", amount: 45000, currency: "SB", timeAgo: "Just now" },
  { id: 4, name: "Elena R.", country: "Spain", amount: 50, currency: "USDT", timeAgo: "Just now" },
  { id: 5, name: "James L.", country: "Australia", amount: 32000, currency: "SB", timeAgo: "Just now" },
  { id: 6, name: "Anna S.", country: "Germany", amount: 100, currency: "USDT", timeAgo: "Just now" },
  { id: 7, name: "Carlos F.", country: "Brazil", amount: 55000, currency: "SB", timeAgo: "Just now" },
  { id: 8, name: "Yuki M.", country: "Japan", amount: 75, currency: "USDT", timeAgo: "Just now" },
];

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ onClose }) => {
  const { notifications } = useApp();
  const [activeTab, setActiveTab] = useState<NotificationTab>('live_payouts');

  const [feedItems, setFeedItems] = useState<any[]>(() => 
    RECENT_PAYOUTS.slice(0, 3).map((item, i) => ({ ...item, uniqueId: `init-${i}` }))
  );
  const [nextIndex, setNextIndex] = useState(3);

  useEffect(() => {
    if (activeTab === 'live_payouts') {
      if (isSupabaseConfigured()) {
        const channel = supabase
          .channel('public:transactions')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: 'type=eq.Withdrawal' }, payload => {
            const newTx = payload.new;
            const newItem = {
              id: newTx.id,
              name: 'User', // We would normally join users here
              country: 'Global',
              amount: newTx.amount,
              currency: newTx.currency,
              timeAgo: 'Just now',
              uniqueId: `live-${Date.now()}`
            };
            setFeedItems(prev => [newItem, ...prev].slice(0, 15));
          })
          .subscribe();
        
        return () => {
          supabase.removeChannel(channel);
        };
      } else {
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
    }
  }, [activeTab, nextIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#132252] border border-blue-500/20 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-blue-500/20 flex justify-between items-center bg-[#1e3b7a]">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-300 text-2xl">notifications_active</span>
              <h2 className="font-black text-lg text-white tracking-tight">Notification Center</h2>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Live updates & global cash-out alerts
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Selector Switcher */}
        <div className="px-5 pt-4 flex gap-2 border-b border-blue-500/20 bg-[#132252]">
          <button
            onClick={() => setActiveTab('live_payouts')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'live_payouts'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-blue-200/50 hover:text-blue-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">payments</span>
            Live Payouts
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'personal'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-blue-200/50 hover:text-blue-200'
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
                  className="bg-[#1e3b7a] border border-blue-500/10 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-black text-sm border border-blue-500/30">
                      <span className="material-symbols-outlined text-[18px]">public</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-extrabold text-xs text-white">{wdr.name}</h5>
                        <span className="material-symbols-outlined text-[14px] text-green-400" title="Verified Payout">check_circle</span>
                      </div>
                      <p className="text-[10px] text-blue-200 mt-0.5">
                        {wdr.country}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm text-green-400 block">
                      +{wdr.amount.toLocaleString()} {wdr.currency || 'SB'}
                    </span>
                    <span className="text-[9px] text-blue-300 font-semibold block mt-0.5">
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
                <span className="material-symbols-outlined text-4xl text-blue-300/30">notifications_off</span>
                <p className="text-blue-200/50 font-medium text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="bg-[#1e3b7a] border border-blue-500/10 p-4 rounded-2xl">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm text-white">{n.title}</h4>
                    <span className="text-[10px] text-blue-300 whitespace-nowrap">{n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now'}</span>
                  </div>
                  <p className="text-xs text-blue-100/70 mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
