import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Task } from '../db/mockDb';

export const TaskCenter: React.FC = () => {
  const { 
    wallet, 
    tasks, 
    taskCategories, 
    submitTaskProof, 
    levels, 
    user,
    transactions
  } = useApp();

  const userLevel = levels.find(l => l.id === user?.level_id) || levels[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [proofUsername, setProofUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter tasks based on Category & Search Query
  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = selectedCategory === 'All' || task.category_id === selectedCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskDetail || !proofUsername.trim()) return;

    setIsSubmitting(true);
    const result = await submitTaskProof(activeTaskDetail.id, proofUsername);
    setIsSubmitting(false);

    if (result.success) {
      alert(result.message);
      setActiveTaskDetail(null);
      setProofUsername('');
    } else {
      alert(result.message);
    }
  };

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
            onClick={() => setSelectedCategory('All')}
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
              onClick={() => setSelectedCategory(cat.id)}
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

        {/* Tasks List */}
        <section className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800">
              <span className="material-symbols-outlined text-[40px] text-gray-300">work_off</span>
              <p className="text-xs text-on-surface-variant dark:text-gray-400 font-semibold mt-2">No active tasks found</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const multipliedReward = Math.round(task.reward_amount * userLevel.earning_multiplier);
              const category = taskCategories.find(c => c.id === task.category_id);
              
              // Check completion status from tx history
              const isCompleted = transactions.some(
                t => t.type === 'TaskReward' && t.description.includes(task.title) && t.status === 'Success'
              );

              return (
                <div 
                  key={task.id} 
                  className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">{category?.icon || 'work'}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-on-surface dark:text-gray-200">{task.title}</h4>
                        <span className="inline-block text-[8px] font-extrabold text-primary dark:text-[#62df7d] uppercase tracking-wide mt-0.5">
                          {category?.name} GIG
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-primary dark:text-[#62df7d]">
                      ₦{multipliedReward.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant dark:text-gray-400 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="flex justify-between items-center gap-3">
                    <a 
                      href={task.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200/60 dark:hover:bg-zinc-700 text-on-surface dark:text-gray-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">link</span>
                      Link
                    </a>

                    <button 
                      disabled={isCompleted}
                      onClick={() => setActiveTaskDetail(task)}
                      className={`px-4.5 py-2.5 rounded-xl font-bold text-xs active:scale-95 transition-all duration-150 ${
                        isCompleted
                          ? 'bg-green-500/10 text-green-600 dark:text-[#62df7d] cursor-not-allowed font-semibold'
                          : 'bg-primary text-white shadow-md shadow-primary/10'
                      }`}
                    >
                      {isCompleted ? 'Completed ✓' : 'Submit Proof'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
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
                Instructions: Click the Link, follow/subscribe to the channel, and input your account username below as verification proof.
              </p>
              <a 
                href={activeTaskDetail.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary dark:text-[#62df7d] text-xs font-bold underline"
              >
                Launch Link Page <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant dark:text-gray-400 uppercase tracking-wide">
                  Your Social Username
                </label>
                <input 
                  required
                  value={proofUsername}
                  onChange={(e) => setProofUsername(e.target.value)}
                  placeholder="e.g. willie_earn"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 rounded-2xl text-xs font-semibold text-on-surface dark:text-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant dark:text-gray-400 uppercase tracking-wide">
                  Proof Screenshot (Mocked)
                </label>
                <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <span className="material-symbols-outlined text-[32px] text-gray-400">upload_file</span>
                  <p className="text-xs text-on-surface dark:text-gray-300 font-bold mt-1">Upload verification screenshot</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Supports PNG, JPG up to 5MB</p>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white font-bold text-xs rounded-2xl shadow-lg shadow-primary/25 active:scale-98 transition-all flex items-center justify-center gap-1.5"
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
