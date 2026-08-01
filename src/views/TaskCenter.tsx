import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Task } from '../db/mockDb';
import { triggerHaptic } from '../utils/haptic';

export const TaskCenter: React.FC = () => {
  const { 
    wallet, 
    tasks, 
    taskCategories, 
    submitTaskProof, 
    claimCommunityBonus,
    levels, 
    user,
    transactions,
    systemSettings
  } = useApp();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [proofUsername, setProofUsername] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [isVerifyingCommunity, setIsVerifyingCommunity] = useState(false);

  const today = new Date().toDateString();
  const tasksCompletedToday = transactions.filter(
    t => t.type === 'TaskReward' && new Date(t.timestamp).toDateString() === today && t.status === 'Success'
  ).length;

  // Filter tasks based on Category & Search Query
  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = selectedCategory === 'All' || task.category_id === selectedCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
      
      // Open proof submission modal
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

  const exploreTasks = filteredTasks.filter(t => t.category_id === 'cat_explore');
  // Social Media Tasks: Filter to ONLY Telegram community task as requested
  const otherTasks = filteredTasks.filter(t => t.id === 'task_telegram_community' || t.category_id === 'cat_telegram');

  const requiresScreenshot = Boolean(
    activeTaskDetail?.requires_screenshot || 
    systemSettings?.find(s => s.key === 'require_task_screenshot')?.value === 'true'
  );

  return (
    <div className="flex-grow pb-32">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-[#f8f9ff]/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <h1 className="font-bold text-lg text-primary dark:text-[#62df7d]">Tasks Center</h1>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
            <span className="material-symbols-outlined text-primary text-[16px] font-fill">account_balance_wallet</span>
            <span className="text-xs font-bold text-primary">₦{(wallet?.active_balance || 0).toLocaleString()}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-4 space-y-5">
        
        {/* Search Bar */}
        <section className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 text-xs font-semibold text-on-surface dark:text-gray-200" 
            placeholder="Search tasks..." 
            type="text"
          />
        </section>

        {/* Filter Categories */}
        <section className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => { triggerHaptic('selection'); setSelectedCategory('All'); }}
            className={`px-4 py-2 rounded-full font-bold text-[10px] uppercase whitespace-nowrap shadow-sm transition-all duration-150 ${
              selectedCategory === 'All'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-[#6e7b6c] dark:text-gray-300'
            }`}
          >
            All
          </button>
          {taskCategories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => { triggerHaptic('selection'); setSelectedCategory(cat.id); }}
              className={`px-4 py-2 rounded-full font-bold text-[10px] uppercase whitespace-nowrap shadow-sm transition-all duration-150 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-[#6e7b6c] dark:text-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </section>

        {/* Daily Limit Alert */}
        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-on-surface dark:text-gray-300">Daily Task Progress</span>
            <span className="font-bold text-secondary">{tasksCompletedToday}/{userLevel.max_daily_tasks}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-secondary to-blue-400 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (tasksCompletedToday / (userLevel.max_daily_tasks || 1)) * 100)}%` }}
            />
          </div>
        </section>

        {/* Explore & Engage Category Section */}
        {(selectedCategory === 'All' || selectedCategory === 'cat_explore') && exploreTasks.length > 0 && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
              <h3 className="font-black text-sm text-on-surface dark:text-white uppercase tracking-wider">Explore & Engage</h3>
            </div>
            
            {/* Category Notice */}
            <div className="bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-3 flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-[11px] leading-snug">
              <span className="material-symbols-outlined text-[16px] text-emerald-500 flex-shrink-0 mt-0.5">info</span>
              <p>External pages may open outside TaskCash. Please interact only with content you are interested in.</p>
            </div>

            <div className="space-y-3.5">
              {exploreTasks.map((task) => {
                const multipliedReward = Math.round(task.reward_amount * userLevel.earning_multiplier);
                const isCompleted = transactions.some(
                  t => t.type === 'TaskReward' && t.description.includes(task.title) && t.status === 'Success'
                );
                const isLoading = loadingTaskId === task.id;

                return (
                  <div 
                    key={task.id} 
                    className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm hover:border-emerald-500/30 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          <span className="material-symbols-outlined text-[24px]">
                            {task.icon || 'explore'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-xs text-on-surface dark:text-white">{task.title}</h4>
                            {task.badge && (
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                                task.badge === 'Sponsored' 
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                                  : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                              }`}>
                                {task.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800/80">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold rounded-xl border border-emerald-500/20">
                        <span className="material-symbols-outlined text-[13px]">payments</span>
                        +₦{multipliedReward.toFixed(2)} reward
                      </span>

                      <button 
                        disabled={isCompleted || isLoading}
                        onClick={(e) => handleOpenExternalTask(task, e)}
                        className={`px-4 py-2 rounded-2xl font-extrabold text-xs shadow-md active:scale-95 transition-all duration-150 flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:bg-emerald-700'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Opening...</span>
                          </>
                        ) : isCompleted ? (
                          <span>Completed</span>
                        ) : (
                          <>
                            <span>{task.buttonText || 'View & Explore'}</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Standard Social Media Tasks Section (Telegram Community) */}
        {(selectedCategory === 'All' || selectedCategory !== 'cat_explore') && otherTasks.length > 0 && (
          <section className="space-y-3 pt-2">
            {selectedCategory === 'All' && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">share</span>
                <h3 className="font-black text-sm text-on-surface dark:text-white uppercase tracking-wider">Social Media Tasks</h3>
              </div>
            )}

            <div className="space-y-3">
              {otherTasks.map((task) => {
                const multipliedReward = Math.round(task.reward_amount * userLevel.earning_multiplier);
                const category = taskCategories.find(c => c.id === task.category_id);
                
                const isTelegramClaimed = Boolean(localStorage.getItem('community_bonus_claimed')) || 
                  transactions.some(t => t.type === 'TaskReward' && (t.description.includes('Telegram Community') || t.description.includes('Join Our Telegram Community')) && t.status === 'Success');

                return (
                  <div 
                    key={task.id} 
                    className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-[28px]">
                            {category?.icon || 'send'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-on-surface dark:text-gray-200 line-clamp-1">{task.title}</h4>
                          <p className="text-[10px] text-on-surface-variant dark:text-gray-400 mt-0.5 line-clamp-1">
                            {task.description}
                          </p>
                          <span className="inline-block px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[8px] font-extrabold uppercase rounded-md mt-1">
                            ₦{multipliedReward.toFixed(2)} reward
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        disabled={isTelegramClaimed}
                        onClick={() => {
                          triggerHaptic('light');
                          if (!isTelegramClaimed) {
                            if (!isVerifyingCommunity) {
                              window.open(task.link || 'https://t.me/taskcash_official', '_blank');
                              setIsVerifyingCommunity(true);
                            } else {
                              claimCommunityBonus();
                              setIsVerifyingCommunity(false);
                            }
                          }
                        }}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs shadow-md active:scale-95 transition-all duration-150 flex items-center gap-1.5 ${
                          isTelegramClaimed
                            ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-primary text-white shadow-primary/20'
                        }`}
                      >
                        <span>{isTelegramClaimed ? 'Joined & Claimed' : (isVerifyingCommunity ? 'Verify & Claim' : 'Join & Claim')}</span>
                        {!isTelegramClaimed && <span className="material-symbols-outlined text-[14px]">send</span>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800">
            <span className="material-symbols-outlined text-[40px] text-gray-300">work_off</span>
            <p className="text-xs text-on-surface-variant dark:text-gray-400 font-semibold mt-2">No active tasks found</p>
          </div>
        )}
      </div>

      {/* Task Proof Submission Modal Overlay */}
      {activeTaskDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl p-6 space-y-5 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm text-on-surface dark:text-white">Submit Task Proof</h3>
                <p className="text-[10px] text-on-surface-variant dark:text-gray-400 mt-0.5">Verification required for reward credit</p>
              </div>
              <button 
                onClick={() => setActiveTaskDetail(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 flex items-center justify-center hover:bg-gray-200"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low dark:bg-zinc-800/40 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/40 space-y-2">
              <h4 className="font-bold text-xs text-on-surface dark:text-gray-200">{activeTaskDetail.title}</h4>
              <p className="text-xs text-on-surface-variant dark:text-gray-400 leading-relaxed">
                Instructions: {activeTaskDetail.description} Input your account username or verification detail below.
              </p>
              <a 
                href={activeTaskDetail.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 dark:text-[#62df7d] text-xs font-bold underline mt-1"
              >
                Launch Target Destination Page <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant dark:text-gray-400 uppercase tracking-wide">
                  Your Account / Verification Identifier
                </label>
                <input 
                  value={proofUsername}
                  onChange={(e) => setProofUsername(e.target.value)}
                  placeholder="e.g. your_telegram_username"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs font-semibold text-on-surface dark:text-gray-200"
                />
              </div>

              {/* Conditional Screenshot Upload (Enabled only when required by Admin) */}
              {requiresScreenshot && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant dark:text-gray-400 uppercase tracking-wide flex items-center justify-between">
                    <span>Proof Screenshot</span>
                    <span className="text-amber-500 font-extrabold text-[9px]">Admin Required</span>
                  </label>
                  <label className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && setScreenshotFile(e.target.files[0])}
                      className="hidden" 
                    />
                    <span className="material-symbols-outlined text-[28px] text-emerald-500">
                      {screenshotFile ? 'check_circle' : 'upload_file'}
                    </span>
                    <p className="text-xs text-on-surface dark:text-gray-300 font-bold mt-1">
                      {screenshotFile ? screenshotFile.name : 'Upload verification screenshot'}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Supports PNG, JPG up to 5MB</p>
                  </label>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Verifying...' : 'Submit Verification Proof'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCenter;
