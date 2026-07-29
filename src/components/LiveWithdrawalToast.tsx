import React, { useState, useEffect } from 'react';
import { NIGERIAN_WITHDRAWALS_DATA } from '../data/nigerianWithdrawalsData';

interface LiveWithdrawalToastProps {
  onOpenNotifications: () => void;
}

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
        setCurrentIndex((prev) => (prev + 1) % NIGERIAN_WITHDRAWALS_DATA.length);
        setStage('entering');
      }
    }, stage === 'entering' ? 350 : stage === 'visible' ? 4200 : stage === 'exiting' ? 350 : 900);

    return () => clearTimeout(timer);
  }, [stage]);

  const current = NIGERIAN_WITHDRAWALS_DATA[currentIndex];
  if (!current || stage === 'hidden') return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px] pointer-events-none px-2">
      <div
        onClick={onOpenNotifications}
        className={`pointer-events-auto cursor-pointer transition-all duration-500 ease-out transform ${
          stage === 'entering'
            ? '-translate-y-4 scale-95 opacity-0'
            : stage === 'visible'
            ? 'translate-y-0 scale-100 opacity-100 shadow-xl shadow-black/10 dark:shadow-emerald-500/10'
            : '-translate-y-4 scale-95 opacity-0'
        }`}
      >
        <div className="bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-2xl border border-emerald-500/30 dark:border-emerald-500/40 rounded-2xl p-2.5 shadow-lg flex items-center justify-between gap-2.5 text-on-surface dark:text-white">
          
          <div className="flex items-center gap-2.5">
            {/* Green Pulse Avatar Badge */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold shadow-inner">
                🇳🇬
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-black"></span>
              </span>
            </div>

            {/* Notification Details */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xs tracking-tight text-on-surface dark:text-white">{current.name}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">• {current.city}</span>
                <span className="material-symbols-outlined text-[13px] text-emerald-500" title="Verified Nigerian Payout">check_circle</span>
              </div>
              <p className="text-[10px] text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <span>Withdrew via</span>
                <span className="font-black text-primary dark:text-emerald-400 px-1.5 py-0.5 rounded bg-primary/10 dark:bg-emerald-500/15 border border-primary/20 dark:border-emerald-500/30 text-[9px] uppercase tracking-wider">
                  {current.bank}
                </span>
                <span className="text-gray-400">• {current.timeAgo}</span>
              </p>
            </div>
          </div>

          {/* Amount Badge */}
          <div className="text-right flex-shrink-0">
            <span className="inline-block font-black text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-xl shadow-xs">
              ₦{current.amount.toLocaleString()}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LiveWithdrawalToast;
