import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
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
    playAd
  } = useApp();

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
      alert(result.message);
      setPendingTasks(prev => ({ ...prev, [activeTaskDetail.id]: true }));
      setActiveTaskDetail(null);
      setProofUsername('');
      setScreenshotFile(null);
    } else {
      alert(result.message);
    }
  };

  const handleCompleteTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    
    // Open link
    if (task.link && task.link !== '#') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.openLink) tg.openLink(task.link);
      else window.open(task.link, '_blank', 'noopener,noreferrer');
    }
    
    // Open verification modal
    setActiveTaskDetail(task);
  };

  return (
    <div className="flex-grow pb-32">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-transparent pt-4">
        <div className="flex justify-between items-center px-container-padding w-full">
          <h1 className="font-extrabold text-[22px] text-white">Task</h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#223b73] border border-blue-500/20 rounded-full shadow-md">
            <span className="material-symbols-outlined text-green-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
            <span className="text-[13px] font-bold text-white">{(mainWallet?.balance_sb || 0).toLocaleString()} SB</span>
          </div>
        </div>
      </nav>

      {/* Toggle Sub Tabs */}
      <div className="px-container-padding pt-6">
        <div className="bg-[#1c336b] rounded-2xl p-1 flex shadow-inner">
          <button
            onClick={() => setTaskTab('watch')}
            className={`flex-1 py-3 text-center rounded-xl font-bold text-[13px] transition-all ${
              taskTab === 'watch' ? 'bg-[#4a72ff] text-white shadow-md' : 'text-blue-200 hover:text-white'
            }`}
          >
            Watch & earn
          </button>
          <button
            onClick={() => setTaskTab('other')}
            className={`flex-1 py-3 text-center rounded-xl font-bold text-[13px] transition-all ${
              taskTab === 'other' ? 'bg-[#4a72ff] text-white shadow-md' : 'text-blue-200 hover:text-white'
            }`}
          >
            Other Tasks
          </button>
        </div>
      </div>

      <div className="px-container-padding pt-6 space-y-5">
        {taskTab === 'watch' ? (
          <section className="space-y-3 animate-fade-in">
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
                  className={`bg-[#1e3b7a] border border-blue-500/20 rounded-[20px] p-4 shadow-md flex items-center justify-between transition-all ${limitReached ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3 w-full">
                    {AdIcon}
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[14px] text-white font-bold">{ad.name}</span>
                        <span className="text-[10px] font-bold text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded-full">{catWatched}/{catLimit}</span>
                      </div>
                      <div className="text-[11px] text-blue-300 mt-0.5">
                        Duration: {ad.watch_time_sec} seconds
                      </div>
                      <div className="flex items-center justify-between w-full mt-2">
                        <span className="text-[12px] font-extrabold text-[#fbbf24]">
                          Reward: {ad.reward_amount.toLocaleString()} {ad.reward_type}
                        </span>
                        
                        {!limitReached && !isWatchingThis && (
                           <button onClick={() => handlePlayAd(ad)} className="px-3 py-1 bg-[#4a72ff] text-white rounded-lg text-[11px] font-bold hover:bg-blue-600 active:scale-95 transition-all">Start</button>
                        )}
                        {isWatchingThis && (
                           <button disabled className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[11px] font-bold shadow-inner">Watching... ({countdown}s)</button>
                        )}
                        {limitReached && (
                           <button disabled className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-[11px] font-bold border border-green-500/30 flex items-center gap-1">Claimed <span className="material-symbols-outlined text-[12px]">check</span></button>
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
          <div className="space-y-5 animate-fade-in">
            <section className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-blue-300">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#1e3b7a] border border-blue-500/20 rounded-2xl focus:ring-2 focus:ring-[#4a72ff] placeholder:text-blue-300/50 text-[13px] font-bold text-white shadow-inner outline-none" 
                placeholder="Search tasks..." 
                type="text"
              />
            </section>

            {communityTasks.length > 0 && (
              <section className="space-y-3 pt-2">
                <h3 className="font-bold text-[16px] text-white mb-2 border-b border-blue-500/20 pb-2">Community Tasks</h3>
                <div className="space-y-3">
                  {communityTasks.map((task) => (
                    <TaskCard key={task.id} task={task} transactions={transactions} pendingTasks={pendingTasks} expandedTaskId={expandedTaskId} setExpandedTaskId={setExpandedTaskId} handleCompleteTask={handleCompleteTask} />
                  ))}
                </div>
              </section>
            )}

            {engagementTasks.length > 0 && (
              <section className="space-y-3 pt-2">
                <h3 className="font-bold text-[16px] text-white mb-2 border-b border-blue-500/20 pb-2">Engagement Tasks</h3>
                <div className="space-y-3">
                  {engagementTasks.map((task) => (
                    <TaskCard key={task.id} task={task} transactions={transactions} pendingTasks={pendingTasks} expandedTaskId={expandedTaskId} setExpandedTaskId={setExpandedTaskId} handleCompleteTask={handleCompleteTask} />
                  ))}
                </div>
              </section>
            )}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 bg-[#1e3b7a] rounded-2xl border border-blue-500/20">
                <span className="material-symbols-outlined text-[40px] text-blue-300">work_off</span>
                <p className="text-[13px] text-blue-200 font-semibold mt-2">No tasks available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Proof Submission Modal */}
      {activeTaskDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-[#1e3b7a] w-full max-w-md rounded-t-[32px] p-6 space-y-5 shadow-2xl animate-fade-in border-t border-blue-500/20 pb-12">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-[18px] text-white">Submit Proof</h3>
              </div>
              <button 
                onClick={() => setActiveTaskDetail(null)}
                className="w-10 h-10 rounded-full bg-black/20 text-blue-200 flex items-center justify-center hover:bg-black/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-[#24428b] p-4 rounded-2xl border border-blue-500/10 space-y-2">
              <h4 className="font-bold text-[14px] text-blue-100">{activeTaskDetail.title}</h4>
              <p className="text-[13px] text-blue-300 leading-relaxed">
                {activeTaskDetail.description}
              </p>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-blue-200 uppercase">
                  Account Identifier
                </label>
                <input 
                  value={proofUsername}
                  onChange={(e) => setProofUsername(e.target.value)}
                  placeholder="e.g. username"
                  className="w-full px-5 py-4 bg-[#131f42] border border-blue-500/20 rounded-2xl text-[14px] font-semibold text-white placeholder:text-blue-300/50 outline-none focus:ring-2 focus:ring-[#4a72ff]"
                />
              </div>

              {requiresScreenshot && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-blue-200 uppercase flex justify-between">
                    <span>Proof Screenshot</span>
                    <span className="text-[#4a72ff]">*Required</span>
                  </label>
                  <label className="border-2 border-dashed border-blue-500/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-black/10 transition-colors bg-[#131f42]">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && setScreenshotFile(e.target.files[0])}
                      className="hidden" 
                    />
                    <span className="material-symbols-outlined text-[32px] text-[#4a72ff]">
                      {screenshotFile ? 'check_circle' : 'upload_file'}
                    </span>
                    <p className="text-[13px] text-blue-100 font-bold mt-2">
                      {screenshotFile ? screenshotFile.name : 'Upload screenshot'}
                    </p>
                  </label>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#4a72ff] hover:bg-blue-600 text-white font-bold text-[15px] rounded-2xl shadow-lg active:scale-95 transition-all mt-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Proof'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted Task Card Component
const TaskCard = ({ task, transactions, pendingTasks, expandedTaskId, setExpandedTaskId, handleCompleteTask }: any) => {
  const isCompleted = transactions.some(
    (t: any) => t.type === 'TaskReward' && t.description.includes(task.title) && t.status === 'Success'
  );
  const isPending = pendingTasks[task.id] || false;
  const isExpanded = expandedTaskId === task.id;

  let TaskIcon;
  if (task.icon === 'ton_yellow') TaskIcon = <div className="text-[24px] bg-yellow-400 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">💎</div>;
  else if (task.icon === 'ton_blue') TaskIcon = <div className="text-[24px] bg-blue-500 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">💎</div>;
  else if (task.icon === 'star_yellow') TaskIcon = <div className="text-[24px] bg-orange-400 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">⭐</div>;
  else if (task.icon === 'tether') TaskIcon = <div className="text-[24px] bg-teal-500 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">🪙</div>;
  else if (task.icon === 'globe') TaskIcon = <div className="text-[24px] bg-indigo-500 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">🌐</div>;
  else if (task.icon === 'explore') TaskIcon = <div className="text-[24px] bg-purple-500 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">🧭</div>;
  else TaskIcon = <div className="text-[24px] bg-gray-800 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">✨</div>;

  return (
    <div className="bg-[#24428b] border border-blue-500/10 rounded-[20px] p-4 shadow-lg overflow-hidden">
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
      >
        <div className="flex items-start gap-3 w-full">
          {TaskIcon}
          <div className="flex flex-col flex-1">
            <h4 className="font-bold text-[14px] text-white line-clamp-1">{task.title}</h4>
            <div className="text-[12px] text-blue-200 line-clamp-1 mt-0.5">{task.description}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[12px] font-extrabold text-[#fbbf24]">
                Reward: {task.reward_amount.toLocaleString()} {task.reward_type}
              </span>
              {!isExpanded && (
                <span className="material-symbols-outlined text-blue-400 text-[20px]">expand_more</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Expandable Instructions & Button */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-blue-500/20 animate-fade-in">
          <p className="text-[11px] text-blue-300 mb-4 whitespace-pre-line leading-relaxed">
            {task.instructions || `Instructions: \n1. Click "Complete Task"\n2. Perform the required action.\n3. Return and submit your proof.`}
          </p>
          <div className="flex justify-end w-full">
            {isCompleted ? (
              <button disabled className="px-5 py-2.5 bg-green-500/20 text-green-400 rounded-xl text-[12px] font-bold border border-green-500/30 flex items-center gap-1 w-full justify-center">
                Completed <span className="material-symbols-outlined text-[14px]">check_circle</span>
              </button>
            ) : isPending ? (
              <button disabled className="px-5 py-2.5 bg-amber-500/20 text-amber-400 rounded-xl text-[12px] font-bold border border-amber-500/30 flex items-center gap-1 w-full justify-center">
                Pending Verification <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
              </button>
            ) : (
              <button onClick={(e) => handleCompleteTask(task, e)} className="px-5 py-2.5 bg-[#4a72ff] text-white rounded-xl text-[13px] font-bold shadow-lg hover:bg-blue-600 active:scale-95 transition-all w-full">
                {task.button_text || 'Complete Task'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCenter;
