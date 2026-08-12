import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useReward } from '../components/RewardCelebration';
import type { Task, RewardedAd } from '../types';
import { triggerHaptic } from '../utils/haptic';

export const TaskCenter: React.FC = () => {
  const { 
    mainWallet, 
    tasks, 
    submitTaskProof, 
    levels, 
    user,
    transactions,
    systemSettings,
    rewardedAds,
    playAd,
    refreshState
  } = useApp();
  const { triggerReward } = useReward();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];
  const today = new Date().toDateString();

  const [taskTab, setTaskTab] = useState<'watch' | 'other'>('watch');

  // Watch Earn State
  const [watchingAdId, setWatchingAdId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Other Tasks State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [proofUsername, setProofUsername] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let timer: any;
    if (watchingAdId && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (watchingAdId && countdown === 0) {
      const ad = rewardedAds.find(a => a.id === watchingAdId);
      if (ad) {
        playAd(ad);
      }
      setWatchingAdId(null);
    }
    return () => clearTimeout(timer);
  }, [watchingAdId, countdown, playAd, rewardedAds]);

  const handlePlayAd = (ad: RewardedAd) => {
    if (watchingAdId) return;
    triggerHaptic('light');
    setWatchingAdId(ad.id);
    setCountdown(ad.watch_time_sec > 0 ? ad.watch_time_sec : 3);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const communityTasks = filteredTasks.filter(t => t.category_id === 'cat_community');
  const engagementTasks = filteredTasks.filter(t => t.category_id === 'cat_engagement' || t.category_id === 'cat_extra');

  const requiresScreenshot = Boolean(
    activeTaskDetail?.requires_screenshot || 
    systemSettings?.find(s => s.key === 'require_task_screenshot')?.value === 'true'
  );

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskDetail) return;

    setIsSubmitting(true);
    const identifier = proofUsername.trim() || user?.username || 'user_verified';
    const result = await submitTaskProof(activeTaskDetail.id, identifier);
    setIsSubmitting(false);

    if (result.success) {
      triggerReward({
        amount: result.amount!,
        currency: result.currency!,
        source: e.target as HTMLElement,
        destinationId: `wallet-${result.currency!.toLowerCase()}`,
        onComplete: refreshState
      });
      setPendingTasks(prev => ({ ...prev, [activeTaskDetail.id]: true }));
      setActiveTaskDetail(null);
      setProofUsername('');
      setScreenshotFile(null);
    } else {
      alert(result.message);
    }
  };

  const handleCompleteTask = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    
    // Open link
    if (task.link && task.link !== '#') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.openLink) tg.openLink(task.link);
      else window.open(task.link, '_blank', 'noopener,noreferrer');
    }
    
    // Auto-verify all tasks without screenshots
    const btnEl = e.currentTarget as HTMLElement;
    const result = await submitTaskProof(task.id, 'auto_verified');
    if (result.success) {
      triggerReward({
        amount: result.amount!,
        currency: result.currency!,
        source: btnEl,
        destinationId: `wallet-${result.currency!.toLowerCase()}`,
        onComplete: refreshState
      });
      setPendingTasks(prev => ({ ...prev, [task.id]: true }));
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="flex-grow pb-32">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-transparent pt-4">
        <div className="flex justify-between items-center px-container-padding w-full">
          <h1 className="font-extrabold text-[22px] tracking-tight text-white">Task Center</h1>
          <div className="flex gap-2">
            <div id="wallet-sb" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#132252] border border-blue-500/30 rounded-full shadow-inner">
              <img src="/swagbucks coin logo.png" className="w-4 h-4 object-contain" alt="SB" />
              <span className="text-[13px] font-extrabold tracking-tight text-white">{(mainWallet?.balance_sb || 0).toLocaleString()} SB</span>
            </div>
            <div id="wallet-usdt" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#132252] border border-blue-500/30 rounded-full shadow-inner">
              <img src="/usdt coin logo.png" className="w-4 h-4 object-contain" alt="USDT" />
              <span className="text-[13px] font-extrabold tracking-tight text-white">${(mainWallet?.balance_usdt || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Toggle Sub Tabs */}
      <div className="px-container-padding pt-6">
        <div className="bg-[#1c336b] rounded-2xl p-1 flex shadow-inner">
          <button
            onClick={() => setTaskTab('watch')}
            className={`flex-1 py-3 text-center rounded-xl font-extrabold text-[13px] tracking-wide transition-all ${
              taskTab === 'watch' ? 'bg-[#4a72ff] text-white shadow-md' : 'text-blue-200 hover:text-white'
            }`}
          >
            Watch & earn
          </button>
          <button
            onClick={() => setTaskTab('other')}
            className={`flex-1 py-3 text-center rounded-xl font-extrabold text-[13px] tracking-wide transition-all ${
              taskTab === 'other' ? 'bg-[#4a72ff] text-white shadow-md' : 'text-blue-200 hover:text-white'
            }`}
          >
            Other Tasks
          </button>
        </div>
      </div>

      <div className="px-container-padding pt-6 space-y-5">
        {taskTab === 'watch' ? (
          <section className="space-y-4 animate-fade-in">
            {rewardedAds.map((ad) => {
              const catLimit = ad.category === 'A' ? (userLevel?.max_daily_ads_cat_a || 10) :
                               ad.category === 'B' ? (userLevel?.max_daily_ads_cat_b || 10) : 10;
              
              const catWatched = transactions.filter(
                t => new Date(t.timestamp).toDateString() === today && 
                     t.type === 'AdViewImpressions' && 
                     t.description.includes(ad.name)
              ).length;

              const limitReached = catWatched >= catLimit;
              const isWatchingThis = watchingAdId === ad.id;

              let AdIcon;
              if (ad.type === 'wallet') AdIcon = <div className="text-[24px] bg-blue-500 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">💎</div>;
              else if (ad.type === 'monetag') AdIcon = <div className="bg-white rounded-[14px] w-12 h-12 flex items-center justify-center p-1 shadow-inner"><img src="/monetag-logo.png" className="w-full h-full object-contain" /></div>;
              else if (ad.type === 'giga') AdIcon = <div className="text-[24px] bg-[#ccff00] rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">⚡</div>;
              else if (ad.type === 'video') AdIcon = <div className="text-[24px] bg-gray-200 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">📺</div>;
              else AdIcon = <div className="text-[24px] bg-gray-800 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">▶️</div>;

              return (
                <div 
                  key={ad.id} 
                  className={`bg-[#1e3b7a] border border-blue-500/20 rounded-[24px] p-5 shadow-lg flex items-center justify-between transition-all ${limitReached ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-4 w-full">
                    {AdIcon}
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[15px] text-white font-extrabold tracking-tight">{ad.name}</span>
                        <span className="text-[11px] font-extrabold text-blue-300 bg-blue-900/30 px-2.5 py-1 rounded-full">{catWatched}/{catLimit}</span>
                      </div>
                      <div className="font-bold text-[12px] text-blue-200 mt-1">
                        Duration: {ad.watch_time_sec} seconds
                      </div>
                      <div className="flex items-center justify-between w-full mt-3">
                        <span className="text-[13px] font-extrabold text-[#fbbf24] tracking-tight">
                          Reward: {ad.reward_amount.toLocaleString()} {ad.reward_type}
                        </span>
                        
                        {!limitReached && !isWatchingThis && (
                           <button onClick={() => handlePlayAd(ad)} className="px-4 py-1.5 bg-[#4a72ff] text-white rounded-[12px] text-[12px] font-extrabold hover:bg-blue-600 active:scale-95 transition-all shadow-md">Start</button>
                        )}
                        {isWatchingThis && (
                           <button disabled className="px-4 py-1.5 bg-amber-500 text-white rounded-[12px] text-[12px] font-extrabold shadow-inner">Watching... ({countdown}s)</button>
                        )}
                        {limitReached && (
                           <button disabled className="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-[12px] text-[12px] font-extrabold border border-green-500/30 flex items-center gap-1">Claimed <span className="material-symbols-outlined text-[14px]">check</span></button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          /* Other Tasks View */
          <div className="space-y-6 animate-fade-in">
            <section className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-blue-300">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#1e3b7a] border border-blue-500/20 rounded-2xl focus:ring-2 focus:ring-[#4a72ff] placeholder:text-blue-300/50 text-[14px] font-extrabold text-white shadow-inner outline-none" 
                placeholder="Search tasks..." 
                type="text"
              />
            </section>

            {communityTasks.length > 0 && (
              <section className="space-y-4 pt-2">
                <h3 className="font-extrabold text-[18px] text-white tracking-tight mb-2 border-b border-blue-500/20 pb-2">Community Tasks</h3>
                <div className="space-y-4">
                  {communityTasks.map(task => (
                    <TaskCard key={task.id} task={task} transactions={transactions} pendingTasks={pendingTasks} handleCompleteTask={handleCompleteTask} />
                  ))}
                </div>
              </section>
            )}

            {engagementTasks.length > 0 && (
              <section className="space-y-4 pt-2">
                <h3 className="font-extrabold text-[18px] text-white tracking-tight mb-2 border-b border-blue-500/20 pb-2">Engagement Tasks</h3>
                <div className="space-y-4">
                  {engagementTasks.map(task => (
                    <TaskCard key={task.id} task={task} transactions={transactions} pendingTasks={pendingTasks} handleCompleteTask={handleCompleteTask} />
                  ))}
                </div>
              </section>
            )}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 bg-[#1e3b7a] rounded-[24px] border border-blue-500/20">
                <span className="material-symbols-outlined text-[48px] text-blue-300" style={{ fontVariationSettings: "'FILL' 1" }}>work_off</span>
                <p className="text-[15px] text-blue-200 font-extrabold mt-3 tracking-tight">No tasks available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Proof Submission Modal (TODO: Implement if needed) */}
    </div>
  );
};

// Extracted Task Card Component
const TaskCard = ({ task, transactions, pendingTasks, handleCompleteTask }: any) => {
  const isCompleted = transactions.some(
    (t: any) => t.type === 'TaskReward' && t.description.includes(task.title) && t.status === 'Success'
  );
  const isPending = pendingTasks[task.id] || false;

  let TaskIcon;
  if (task.icon === 'ton_yellow') TaskIcon = 'diamond';
  else if (task.icon === 'ton_blue') TaskIcon = 'diamond';
  else if (task.icon === 'star_yellow') TaskIcon = 'star';
  else if (task.icon === 'tether') TaskIcon = 'monetization_on';
  else if (task.icon === 'globe') TaskIcon = 'language';
  else if (task.icon === 'explore') TaskIcon = 'explore';
  else TaskIcon = 'stars';

  return (
    <div className="bg-[#1e3b7a] border border-blue-500/20 rounded-[20px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg transition-transform hover:scale-[1.02]">
      <div className="flex items-center gap-4 w-full">
        <div className="w-12 h-12 bg-[#4a72ff] text-white rounded-[14px] flex items-center justify-center shadow-inner shrink-0">
          <span className="material-symbols-outlined text-[24px]">
            {TaskIcon}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="font-extrabold text-[14px] text-white leading-tight line-clamp-1">{task.title}</h4>
          <p className="text-[11px] text-blue-200 mt-1 line-clamp-1">{task.description}</p>
          <span className="inline-block px-2 py-0.5 bg-[#00ffa3]/10 text-[#00ffa3] text-[9px] font-black uppercase rounded-md mt-2 tracking-wide border border-[#00ffa3]/20 shadow-[0_0_10px_rgba(0,255,163,0.1)]">
            {task.reward_amount.toLocaleString()} {task.reward_type} REWARD
          </span>
        </div>
      </div>
      
      <button 
        disabled={isCompleted || isPending}
        onClick={(e) => handleCompleteTask(task, e)}
        className={`w-full sm:w-auto px-6 py-3 rounded-full font-black text-[12px] shadow-[0_4px_15px_rgba(0,255,163,0.3)] active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 ${
          isCompleted || isPending
            ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed shadow-none border border-gray-500/30'
            : 'bg-[#00ffa3] text-[#132252]'
        }`}
      >
        <span>{isCompleted ? 'Completed' : (isPending ? 'Verifying...' : (task.button_text || 'Start'))}</span>
        {isCompleted ? (
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
        ) : !isPending && (
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        )}
      </button>
    </div>
  );
};
export default TaskCenter;
