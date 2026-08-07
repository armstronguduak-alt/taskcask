import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Task, RewardedAd } from '../types';
import { triggerHaptic } from '../utils/haptic';

export const TaskCenter: React.FC = () => {
  const { 
    mainWallet, 
    tasks, 
    taskCategories, 
    submitTaskProof, 
    claimCommunityBonus,
    levels, 
    user,
    transactions,
    systemSettings,
    rewardedAds,
    playAd
  } = useApp();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];
  const today = new Date().toDateString();

  // Top Level Tab State
  const [taskTab, setTaskTab] = useState<'watch' | 'other'>('watch');

  // Watch Earn Logic
  const adsWatchedToday = transactions.filter(
    t => new Date(t.timestamp).toDateString() === today && t.type === 'AdViewImpressions'
  ).length;
  const maxDailyAds = (userLevel?.max_daily_ads_cat_a || 0) + (userLevel?.max_daily_ads_cat_b || 0) + (userLevel?.max_daily_ads_cat_c || 0);

  // Other Tasks Logic
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [proofUsername, setProofUsername] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [isVerifyingCommunity, setIsVerifyingCommunity] = useState(false);

  const tasksCompletedToday = transactions.filter(
    t => t.type === 'TaskReward' && new Date(t.timestamp).toDateString() === today && t.status === 'Success'
  ).length;

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = selectedCategory === 'All' || task.category_id === selectedCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const exploreTasks = filteredTasks.filter(t => t.category_id === 'cat_explore');
  const otherTasks = filteredTasks.filter(t => t.id === 'task_telegram_community' || t.category_id === 'cat_telegram');

  const requiresScreenshot = Boolean(
    activeTaskDetail?.requires_screenshot || 
    systemSettings?.find(s => s.key === 'require_task_screenshot')?.value === 'true'
  );

  const handleOpenExternalTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    setLoadingTaskId(task.id);

    setTimeout(() => {
      setLoadingTaskId(null);
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.openLink) {
        tg.openLink(task.link);
      } else {
        window.open(task.link, '_blank', 'noopener,noreferrer');
      }
      setActiveTaskDetail(task);
    }, 450);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskDetail) return;

    setIsSubmitting(true);
    const identifier = proofUsername.trim() || user?.username || 'user_verified';
    const result = await submitTaskProof(activeTaskDetail.id, identifier);
    setIsSubmitting(false);

    if (result.success) {
      alert(result.message);
      setActiveTaskDetail(null);
      setProofUsername('');
      setScreenshotFile(null);
    } else {
      alert(result.message);
    }
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
            <h3 className="font-bold text-[18px] text-white mb-3">Official</h3>
            {rewardedAds.filter((ad) => {
              const enabledSetting = systemSettings.find(s => s.key === `enabled_cat_${ad.category}`)?.value;
              return enabledSetting !== 'false';
            }).map((ad) => {
              const rewardSetting = systemSettings.find(s => s.key === `reward_cat_${ad.category}`)?.value;
              const baseReward = rewardSetting ? parseFloat(rewardSetting) : ad.reward_amount;
              const multipliedReward = Math.round(baseReward * (userLevel?.earning_multiplier || 1));
              
              const catLimit = ad.category === 'A' ? userLevel?.max_daily_ads_cat_a || 0 :
                               ad.category === 'B' ? userLevel?.max_daily_ads_cat_b || 0 :
                               userLevel?.max_daily_ads_cat_c || 0;
              
              const catWatched = transactions.filter(
                t => new Date(t.timestamp).toDateString() === today && 
                     t.type === 'AdViewImpressions' && 
                     t.description.includes(ad.category)
              ).length;

              const limitReached = catLimit > 0 && catWatched >= catLimit;

              let AdIcon;
              if (ad.type === 'wallet') AdIcon = <div className="text-[24px] bg-blue-500 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">💎</div>;
              else if (ad.type === 'monetag') AdIcon = <div className="bg-white rounded-[14px] w-12 h-12 flex items-center justify-center p-1 shadow-inner"><img src="/monetag-logo.png" className="w-full h-full object-contain" /></div>;
              else if (ad.type === 'giga') AdIcon = <div className="text-[24px] bg-[#ccff00] rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">⚡</div>;
              else if (ad.type === 'video') AdIcon = <div className="text-[24px] bg-gray-200 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">📺</div>;
              else AdIcon = <div className="text-[24px] bg-gray-800 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">▶️</div>;

              return (
                <div 
                  key={ad.id} 
                  className={`bg-[#1e3b7a] border border-blue-500/20 rounded-[20px] p-3 shadow-md flex items-center justify-between cursor-pointer transition-all ${limitReached ? 'opacity-50' : 'hover:bg-[#24428b] active:scale-95'}`}
                  onClick={() => !limitReached && playAd(ad)}
                >
                  <div className="flex items-center gap-3">
                    {AdIcon}
                    <div className="flex flex-col">
                      <span className="text-[14px] text-white font-bold">{ad.name}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center text-[#fbbf24] text-[12px] font-extrabold"><span className="text-[12px] mr-1">🪙</span> +{multipliedReward.toLocaleString()}</span>
                        {!limitReached && <span className="flex items-center text-[#f87171] text-[12px] font-extrabold"><span className="text-[12px] mr-1">🗝️</span> +1</span>}
                        {limitReached && <span className="text-[10px] text-blue-300 ml-2">Done</span>}
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-blue-400 text-[20px]">chevron_right</span>
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

            <section className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button 
                onClick={() => { triggerHaptic('selection'); setSelectedCategory('All'); }}
                className={`px-5 py-2.5 rounded-full font-bold text-[11px] uppercase whitespace-nowrap shadow-md transition-all duration-150 ${
                  selectedCategory === 'All'
                    ? 'bg-[#4a72ff] text-white'
                    : 'bg-[#1e3b7a] border border-blue-500/20 text-blue-200'
                }`}
              >
                All
              </button>
              {taskCategories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => { triggerHaptic('selection'); setSelectedCategory(cat.id); }}
                  className={`px-5 py-2.5 rounded-full font-bold text-[11px] uppercase whitespace-nowrap shadow-md transition-all duration-150 ${
                    selectedCategory === cat.id
                      ? 'bg-[#4a72ff] text-white'
                      : 'bg-[#1e3b7a] border border-blue-500/20 text-blue-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </section>
            
            {/* Explore Tasks */}
            {(selectedCategory === 'All' || selectedCategory === 'cat_explore') && exploreTasks.length > 0 && (
              <section className="space-y-3 pt-2">
                <div className="flex items-center gap-2 mb-3">
                   <h3 className="font-bold text-[18px] text-white">Explore Tasks</h3>
                   <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{exploreTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {exploreTasks.map((task) => {
                    const multipliedReward = Math.round(task.reward_amount * userLevel.earning_multiplier);
                    const isCompleted = transactions.some(
                      t => t.type === 'TaskReward' && t.description.includes(task.title) && t.status === 'Success'
                    );

                    let TaskIcon;
                    if (task.icon === 'ton_yellow') TaskIcon = <div className="text-[24px] bg-yellow-400 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">💎</div>;
                    else if (task.icon === 'ton_blue') TaskIcon = <div className="text-[24px] bg-blue-500 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">💎</div>;
                    else if (task.icon === 'star_yellow') TaskIcon = <div className="text-[24px] bg-orange-400 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">⭐</div>;
                    else if (task.icon === 'tether') TaskIcon = <div className="text-[24px] bg-teal-500 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">🪙</div>;
                    else if (task.icon === 'globe') TaskIcon = <div className="text-[24px] bg-indigo-500 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">🌐</div>;
                    else TaskIcon = <div className="text-[24px] bg-gray-800 rounded-[14px] w-12 h-12 flex items-center justify-center shadow-inner">✨</div>;

                    return (
                      <div 
                        key={task.id} 
                        className="bg-[#1e3b7a] border border-blue-500/20 rounded-[20px] p-3 shadow-md flex items-center justify-between cursor-pointer hover:bg-[#24428b] active:scale-95 transition-all"
                        onClick={(e) => handleOpenExternalTask(task, e)}
                      >
                        <div className="flex items-center gap-3">
                          {TaskIcon}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] text-white font-bold">{task.title}</span>
                              {task.badge === 'Sponsored' && (
                                <span className="bg-yellow-500/20 text-yellow-400 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border border-yellow-500/30">Premium</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center text-[#fbbf24] text-[12px] font-extrabold"><span className="text-[12px] mr-1">🪙</span> +{multipliedReward.toLocaleString()}</span>
                              <span className="flex items-center text-[#f87171] text-[12px] font-extrabold"><span className="text-[12px] mr-1">🗝️</span> +{Math.max(1, Math.floor(multipliedReward / 1000))}</span>
                            </div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-blue-400 text-[20px]">chevron_right</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Social Media Tasks */}
            {(selectedCategory === 'All' || selectedCategory !== 'cat_explore') && otherTasks.length > 0 && (
              <section className="space-y-3 pt-2">
                <div className="space-y-3">
                  {otherTasks.map((task) => {
                    const multipliedReward = Math.round(task.reward_amount * userLevel.earning_multiplier);
                    const category = taskCategories.find(c => c.id === task.category_id);
                    
                    const isTelegramClaimed = Boolean(localStorage.getItem('community_bonus_claimed')) || 
                      transactions.some(t => t.type === 'TaskReward' && (t.description.includes('Telegram Community') || t.description.includes('Join Our Telegram Community')) && t.status === 'Success');

                    return (
                      <div 
                        key={task.id} 
                        className="bg-[#24428b] border border-blue-500/10 rounded-2xl p-4 shadow-lg"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-12 h-12 rounded-[18px] flex items-center justify-center bg-[#4a72ff]/20 text-[#4a72ff] border border-[#4a72ff]/30">
                              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {category?.icon || 'send'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-[13px] text-blue-100 line-clamp-1">{task.title}</h4>
                              <p className="text-[11px] text-blue-300 mt-0.5 line-clamp-1">
                                {task.description}
                              </p>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#4a72ff]/20 text-[#4a72ff] text-[10px] font-extrabold rounded mt-1 border border-[#4a72ff]/30">
                                +{multipliedReward} SB
                              </span>
                            </div>
                          </div>
                          
                          <button 
                            disabled={isTelegramClaimed}
                            onClick={() => {
                              triggerHaptic('light');
                              if (!isTelegramClaimed) {
                                if (!isVerifyingCommunity) {
                                  window.open(task.link || 'https://t.me/swagbucks_official', '_blank');
                                  setIsVerifyingCommunity(true);
                                } else {
                                  claimCommunityBonus();
                                  setIsVerifyingCommunity(false);
                                }
                              }
                            }}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-[13px] shadow-md active:scale-95 transition-all flex items-center gap-1.5 ${
                              isTelegramClaimed
                                ? 'bg-black/20 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-[#4a72ff] text-white hover:bg-blue-600'
                            }`}
                          >
                            <span>{isTelegramClaimed ? 'Claimed' : (isVerifyingCommunity ? 'Verify' : 'Join')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
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

export default TaskCenter;
