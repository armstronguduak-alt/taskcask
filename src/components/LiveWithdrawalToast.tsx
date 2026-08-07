import React, { useState, useEffect } from 'react';

interface LiveWithdrawalToastProps {
  onOpenNotifications: () => void;
}

const RECENT_PAYOUTS = [
  { id: 1, name: "David M.", country: "USA", amount: 1500, timeAgo: "2 mins ago" },
  { id: 2, name: "Sarah K.", country: "UK", amount: 3200, timeAgo: "5 mins ago" },
  { id: 3, name: "Michael T.", country: "Canada", amount: 800, timeAgo: "12 mins ago" },
  { id: 4, name: "Elena R.", country: "Spain", amount: 5000, timeAgo: "18 mins ago" },
  { id: 5, name: "James L.", country: "Australia", amount: 2100, timeAgo: "24 mins ago" },
  { id: 6, name: "Anna S.", country: "Germany", amount: 1100, timeAgo: "30 mins ago" },
  { id: 7, name: "Carlos F.", country: "Brazil", amount: 4500, timeAgo: "45 mins ago" },
  { id: 8, name: "Yuki M.", country: "Japan", amount: 6200, timeAgo: "1 hour ago" },
];

export const LiveWithdrawalToast: React.FC<LiveWithdrawalToastProps> = ({ onOpenNotifications }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<'entering' | 'visible' | 'exiting' | 'hidden'>('entering');

  useEffect(() => {
    // Cycle state machine: entering (350ms) -> visible (4200ms) -> exiting (350ms) -> hidden (900ms) -> next
    const timer = setTimeout(() => {
      if (stage === 'entering') {
        setStage('visible');
      } else if (stage === 'visible') {
        setStage('exiting');
      } else if (stage === 'exiting') {
        setStage('hidden');
      } else if (stage === 'hidden') {
        setCurrentIndex((prev) => (prev + 1) % RECENT_PAYOUTS.length);
        setStage('entering');
      }
    }, stage === 'entering' ? 350 : stage === 'visible' ? 4200 : stage === 'exiting' ? 350 : 900);

    return () => clearTimeout(timer);
  }, [stage]);

  const current = RECENT_PAYOUTS[currentIndex];
  if (!current || stage === 'hidden') return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px] pointer-events-none px-2">
      <div
        onClick={onOpenNotifications}
        className={`pointer-events-auto cursor-pointer transition-all duration-500 ease-out transform ${
          stage === 'entering'
            ? '-translate-y-4 scale-95 opacity-0'
            : stage === 'visible'
            ? 'translate-y-0 scale-100 opacity-100 shadow-xl shadow-black/10 dark:shadow-[#2563eb]/10'
            : '-translate-y-4 scale-95 opacity-0'
        }`}
      >
        <div className="bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-2xl border border-[#2563eb]/30 dark:border-[#2563eb]/40 rounded-2xl p-2.5 shadow-lg flex items-center justify-between gap-2.5 text-on-surface dark:text-white">
          
          <div className="flex items-center gap-2.5">
            {/* Green Pulse Avatar Badge */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-[#2563eb]/10 dark:bg-[#2563eb]/20 border border-[#2563eb]/30 flex items-center justify-center text-sm font-bold shadow-inner">
                <span className="material-symbols-outlined text-[16px] text-[#2563eb]">public</span>
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2563eb] border border-white dark:border-black"></span>
              </span>
            </div>

            {/* Notification Details */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xs tracking-tight text-on-surface dark:text-white">{current.name}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">• {current.country}</span>
                <span className="material-symbols-outlined text-[13px] text-[#2563eb]" title="Verified Payout">check_circle</span>
              </div>
              <p className="text-[10px] text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <span>Withdrew via</span>
                <span className="font-black text-[#2563eb] dark:text-[#2563eb] px-1.5 py-0.5 rounded bg-[#2563eb]/10 dark:bg-[#2563eb]/15 border border-[#2563eb]/20 dark:border-[#2563eb]/30 text-[9px] uppercase tracking-wider">
                  USDT
                </span>
                <span className="text-gray-400">• {current.timeAgo}</span>
              </p>
            </div>
          </div>

          {/* Amount Badge */}
          <div className="text-right flex-shrink-0">
            <span className="inline-block font-black text-xs text-[#2563eb] dark:text-[#2563eb] bg-[#2563eb]/10 dark:bg-[#2563eb]/20 border border-[#2563eb]/30 px-2.5 py-1 rounded-xl shadow-xs">
              +{current.amount.toLocaleString()} SB
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LiveWithdrawalToast;
