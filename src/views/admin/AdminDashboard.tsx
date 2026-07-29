import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { loadDB } from '../../db/mockDb';
import type { TaskCashDB, Level } from '../../db/mockDb';

type AdminTab = 'Overview' | 'Withdrawals' | 'Users' | 'Levels' | 'Tasks' | 'Fraud' | 'Postbacks' | 'Inspector' | 'Settings';

export const AdminDashboard: React.FC = () => {
  const { 
    withdrawalRequests, 
    fraudLogs, 
    sdkLogs,
    users,
    levels,
    tasks,
    taskCategories,
    systemSettings,
    setTab,
    approveWithdrawal,
    rejectWithdrawal,
    banUser,
    unbanUser,
    updateUserLevel,
    adjustUserBalance,
    addTask,
    deleteTask,
    toggleTaskStatus,
    updateSystemSetting,
    updateLevelConfig
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('Overview');
  const [selectedTable, setSelectedTable] = useState<keyof TaskCashDB>('users');
  const [dbInspectorState, setDbInspectorState] = useState<TaskCashDB>(() => loadDB());
  const [localSettings, setLocalSettings] = useState(systemSettings);

  // User search & filter state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [balanceAdjustModalUser, setBalanceAdjustModalUser] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // New task form state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState(taskCategories[0]?.id || 'cat_social');
  const [newTaskReward, setNewTaskReward] = useState('250');
  const [newTaskLink, setNewTaskLink] = useState('https://t.me/TaskCashChannel');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Edit level modal state
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  const handleRefreshInspector = () => {
    const updatedDb = loadDB();
    setDbInspectorState(updatedDb);
    setLocalSettings(updatedDb.system_settings);
  };

  // Stats calculation (real-time from live DB state)
  const db = loadDB();
  const totalBalance = db.wallets.reduce((acc, curr) => acc + curr.active_balance, 0);
  const totalPayout = db.transactions
    .filter(t => t.type === 'Withdrawal' && t.status === 'Success')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalAdViews = db.ad_views.length;
  const totalTasksDone = db.transactions.filter(t => t.type === 'TaskReward' && t.status === 'Success').length;
  const activeTasksCount = tasks.filter(t => t.status === 'Active').length;
  const bannedUsersCount = users.filter(u => u.status === 'Banned').length;
  const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'Pending');

  // User management filtered list
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.first_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const handleSettingChange = (key: string, value: string) => {
    setLocalSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    updateSystemSetting(key, value);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskReward) return;
    addTask({
      title: newTaskTitle,
      category_id: newTaskCategory,
      reward_amount: parseFloat(newTaskReward) || 100,
      description: newTaskDescription || 'Complete specified channel activity to earn reward.',
      link: newTaskLink || 'https://t.me/TaskCashChannel',
      status: 'Active'
    });
    setShowAddTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  const handleSaveLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLevel) {
      updateLevelConfig(editingLevel);
      setEditingLevel(null);
    }
  };

  const handleExecuteBalanceAdjust = (isCredit: boolean) => {
    if (!balanceAdjustModalUser || !adjustAmount) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) return;
    adjustUserBalance(balanceAdjustModalUser, amount, isCredit, adjustReason || 'Admin Manual Override');
    setBalanceAdjustModalUser(null);
    setAdjustAmount('');
    setAdjustReason('');
  };

  return (
    <div className="flex-grow pb-32 bg-[#f8f9ff] dark:bg-[#09090b] text-on-surface dark:text-gray-100 min-h-screen">
      {/* Navbar Header */}
      <nav className="sticky top-0 w-full z-30 bg-[#f8f9ff]/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800">
        <div className="flex justify-between items-center px-4 py-3.5 w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setTab('Profile');
                window.history.pushState({}, '', '/');
              }} 
              className="ripple-active p-1 text-[#0051d5] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-xl"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div>
              <h1 className="font-black text-lg text-[#0051d5] dark:text-[#b4c5ff] tracking-tight">Admin Console</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">Domain Route: /admindata</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Sync
            </span>
            <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[10px] font-black uppercase tracking-wider">
              ROOT ADMIN
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-4 space-y-4">
        {/* Navigation Tabs Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { key: 'Overview', label: 'Overview', icon: 'dashboard' },
            { key: 'Withdrawals', label: `Payouts (${pendingWithdrawals.length})`, icon: 'payments' },
            { key: 'Users', label: `Users (${users.length})`, icon: 'group' },
            { key: 'Levels', label: 'Levels & Perks', icon: 'workspace_premium' },
            { key: 'Tasks', label: `Tasks & Ads (${tasks.length})`, icon: 'task' },
            { key: 'Fraud', label: `Fraud Logs (${fraudLogs.length})`, icon: 'gpp_maybe' },
            { key: 'Postbacks', label: 'SDK & Stream', icon: 'dns' },
            { key: 'Inspector', label: 'DB Inspector', icon: 'table_rows' },
            { key: 'Settings', label: 'Settings', icon: 'settings' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveAdminTab(tab.key as AdminTab)}
              className={`px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap flex items-center gap-1.5 transition-all duration-150 shadow-sm ${
                activeAdminTab === tab.key
                  ? 'bg-[#0051d5] text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & REAL-TIME STATS */}
        {activeAdminTab === 'Overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-3xl shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Wallets Balance</p>
                <p className="font-black text-xl text-on-surface dark:text-white mt-1">₦{totalBalance.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-500 font-bold mt-1 block">Live Vault Sum</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-3xl shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Settled Payouts</p>
                <p className="font-black text-xl text-emerald-600 dark:text-emerald-400 mt-1">₦{totalPayout.toLocaleString()}</p>
                <span className="text-[10px] text-gray-400 font-bold mt-1 block">Total Verified Cash-out</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-3xl shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Ad Impressions</p>
                <p className="font-black text-xl text-primary mt-1">{totalAdViews} Views</p>
                <span className="text-[10px] text-gray-400 font-bold mt-1 block">Monetag/SDK Plays</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-3xl shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Payout Queue</p>
                <p className="font-black text-xl text-amber-500 mt-1">{pendingWithdrawals.length} Requests</p>
                <span className="text-[10px] text-amber-500/80 font-bold mt-1 block">Needs Review</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users Registered</h3>
                <p className="text-2xl font-black text-on-surface dark:text-white">{users.length} Accounts</p>
                <p className="text-xs text-red-500 font-bold">{bannedUsersCount} Banned Accounts</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Task Completion Rate</h3>
                <p className="text-2xl font-black text-emerald-500">{totalTasksDone} Completed</p>
                <p className="text-xs text-gray-400 font-bold">{activeTasksCount} Active Tasks Available</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Health</h3>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">All Nodes Operational</span>
                </div>
                <p className="text-xs text-gray-400">Telegram WebApp Protocol v6.0</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WITHDRAWAL BILLING QUEUE */}
        {activeAdminTab === 'Withdrawals' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-on-surface dark:text-white uppercase tracking-wider">Pending Payout Approvals</h3>
                <p className="text-xs text-gray-400">Verify account nuban details before approving cash-out.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs">
                {pendingWithdrawals.length} Pending
              </span>
            </div>

            {pendingWithdrawals.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <span className="material-symbols-outlined text-4xl text-emerald-500">task_alt</span>
                <p className="text-xs text-gray-400 font-bold">Withdrawals queue is completely empty. Great work!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingWithdrawals.map((req) => {
                  const requester = dbInspectorState.users.find(u => u.id === req.user_id);
                  const bank = dbInspectorState.banks.find(b => b.id === req.bank_id);

                  return (
                    <div key={req.id} className="bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800/60 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-on-surface dark:text-white">
                            {requester?.first_name} {requester?.last_name}
                          </h4>
                          <p className="text-xs text-gray-400">@{requester?.username || 'user'} • Telegram ID: {requester?.id}</p>
                        </div>
                        <span className="font-black text-base text-red-500">
                          ₦{req.amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 text-xs">
                        <div><span className="font-bold text-gray-400">Bank Name:</span> <p className="font-semibold text-on-surface dark:text-gray-200">{bank?.name || 'Bank'}</p></div>
                        <div><span className="font-bold text-gray-400">Account Name:</span> <p className="font-semibold text-on-surface dark:text-gray-200">{req.account_name}</p></div>
                        <div><span className="font-bold text-gray-400">Account NUBAN:</span> <p className="font-mono font-bold text-primary">{req.account_number}</p></div>
                      </div>

                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => rejectWithdrawal(req.id)}
                          className="flex-1 py-2.5 border border-red-300 dark:border-red-900 text-red-500 font-bold text-xs rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        >
                          Reject & Refund
                        </button>
                        <button
                          onClick={() => approveWithdrawal(req.id)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                        >
                          Approve Cashout Settlement
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USER MANAGEMENT */}
        {activeAdminTab === 'Users' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-on-surface dark:text-white uppercase tracking-wider">User Account Directory</h3>
                <p className="text-xs text-gray-400">Manage user levels, balances, and access control.</p>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-64 relative">
                <input
                  type="text"
                  placeholder="Search user or ID..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-on-surface dark:text-white"
                />
                <span className="material-symbols-outlined text-gray-400 text-lg absolute left-2.5 top-2">search</span>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-gray-100 dark:border-zinc-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-zinc-800/80 text-gray-400 font-bold uppercase text-[10px] border-b border-gray-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Telegram Username</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Active Balance</th>
                    <th className="px-4 py-3">Ads / Tasks</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredUsers.map((u) => {
                    const userWallet = db.wallets.find(w => w.user_id === u.id);
                    const isBanned = u.status === 'Banned';

                    return (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                        <td className="px-4 py-3 font-bold text-on-surface dark:text-white flex items-center gap-2">
                          <img src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} className="w-7 h-7 rounded-full object-cover" alt="" />
                          <div>
                            <div>{u.first_name} {u.last_name}</div>
                            <div className="text-[9px] text-gray-400 font-mono">{u.id}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-primary font-bold">@{u.username}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.level_id}
                            onChange={(e) => updateUserLevel(u.id, e.target.value)}
                            className="bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-[11px] font-bold text-on-surface dark:text-gray-200"
                          >
                            {levels.map(l => (
                              <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 font-black text-emerald-600 dark:text-emerald-400">
                          ₦{(userWallet?.active_balance || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-semibold">
                          {u.total_ads_watched || 0} ads • {u.total_tasks_completed || 0} tasks
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            isBanned ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          <button
                            onClick={() => setBalanceAdjustModalUser(u.id)}
                            className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-500/20 text-[10px]"
                            title="Adjust Balance"
                          >
                            ± Balance
                          </button>
                          <button
                            onClick={() => isBanned ? unbanUser(u.id) : banUser(u.id)}
                            className={`px-2.5 py-1 font-bold rounded-lg text-[10px] ${
                              isBanned ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {isBanned ? 'Unban' : 'Ban'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: LEVELS & PERKS MANAGEMENT */}
        {activeAdminTab === 'Levels' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-on-surface dark:text-white uppercase tracking-wider">Membership Tier Thresholds & Multipliers</h3>
                <p className="text-xs text-gray-400">Configure progression rules, daily caps, and earning rates.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {levels.map((lvl) => {
                const userCountInLvl = users.filter(u => u.level_id === lvl.id).length;

                return (
                  <div key={lvl.id} className="bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-base text-primary">{lvl.name} Tier</h4>
                        <p className="text-[11px] text-gray-500">{userCountInLvl} Registered User(s)</p>
                      </div>
                      <button
                        onClick={() => setEditingLevel(lvl)}
                        className="px-3 py-1 bg-primary text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-90"
                      >
                        Edit Tier Rules
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                      <div><span className="text-gray-400 font-bold block">Multiplier:</span> <span className="font-black text-emerald-500">{lvl.earning_multiplier}x</span></div>
                      <div><span className="text-gray-400 font-bold block">Min Cashout:</span> <span className="font-black text-on-surface dark:text-white">₦{lvl.min_withdrawal}</span></div>
                      <div><span className="text-gray-400 font-bold block">Streak Req:</span> <span className="font-semibold">{lvl.req_streak} Days</span></div>
                      <div><span className="text-gray-400 font-bold block">Ads Req:</span> <span className="font-semibold">{lvl.req_ads} Ads</span></div>
                      <div><span className="text-gray-400 font-bold block">Tasks Req:</span> <span className="font-semibold">{lvl.req_tasks} Tasks</span></div>
                      <div><span className="text-gray-400 font-bold block">Referral Req:</span> <span className="font-semibold">{lvl.req_referrals} Refs</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: TASKS & ADVERTISING CENTER */}
        {activeAdminTab === 'Tasks' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-on-surface dark:text-white uppercase tracking-wider">Social Tasks & Monetization Ads</h3>
                <p className="text-xs text-gray-400">Create tasks for community growth and configure ad networks.</p>
              </div>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Create New Task
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800/60 p-3.5 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-on-surface dark:text-white">{t.title}</h4>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        t.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
                    <a href={t.link} target="_blank" rel="noreferrer" className="text-[10px] text-primary underline truncate block max-w-xs">{t.link}</a>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">₦{t.reward_amount}</span>
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-zinc-700 text-on-surface dark:text-gray-200 text-xs font-bold rounded-xl"
                    >
                      Toggle Status
                    </button>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="px-3 py-1.5 bg-red-500/10 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: FRAUD SHIELD */}
        {activeAdminTab === 'Fraud' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider">Suspicious Traffic & Security Incidents</h3>

            {fraudLogs.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8 italic font-semibold">No fraud incidents logged.</p>
            ) : (
              <div className="space-y-3">
                {fraudLogs.map((log) => {
                  const fraudUser = users.find(u => u.id === log.user_id);
                  const isBanned = fraudUser?.status === 'Banned';

                  return (
                    <div key={log.id} className="border border-gray-200 dark:border-zinc-800 p-3.5 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          log.severity === 'High' ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-500'
                        }`}>
                          {log.severity} Severity Incident
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <p><span className="font-bold text-gray-400">Incident:</span> {log.reason}</p>
                        <p><span className="font-bold text-gray-400">Details:</span> {log.details}</p>
                        <p><span className="font-bold text-gray-400">User:</span> {fraudUser?.first_name} (@{fraudUser?.username})</p>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => isBanned ? unbanUser(log.user_id) : banUser(log.user_id)}
                          className={`px-3 py-1 font-bold text-xs rounded-xl ${
                            isBanned ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {isBanned ? 'Unban Account' : 'Ban Account'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SDK & POSTBACKS STREAM */}
        {activeAdminTab === 'Postbacks' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider">Signed SDK Callbacks & Server Postbacks Stream</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">SDK Client Callbacks</h4>
                {sdkLogs.length === 0 ? (
                  <p className="text-xs italic text-gray-400">No SDK logs yet.</p>
                ) : (
                  sdkLogs.slice(0, 10).map((sdk) => (
                    <div key={sdk.id} className="bg-gray-50 dark:bg-zinc-800/40 p-3 rounded-xl text-xs mb-2 font-mono border border-gray-100 dark:border-zinc-800">
                      <div className="flex justify-between font-bold text-primary">
                        <span>Event: {sdk.action}</span>
                        <span>{new Date(sdk.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mt-1 truncate">Payload: {sdk.payload}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: DATABASE TABLE INSPECTOR */}
        {activeAdminTab === 'Inspector' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider">Inspect All 22 Relational Mock Tables</h3>
              <button 
                onClick={handleRefreshInspector}
                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              >
                Refresh Data
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Select Table</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value as keyof TaskCashDB)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-on-surface dark:text-gray-200"
              >
                {Object.keys(dbInspectorState).map((tbl) => (
                  <option key={tbl} value={tbl}>{tbl} ({dbInspectorState[tbl as keyof TaskCashDB].length} rows)</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto border border-gray-100 dark:border-zinc-800 rounded-xl max-h-96 overflow-y-auto">
              <table className="w-full text-left text-[11px] font-mono whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-zinc-800/80 sticky top-0 border-b border-gray-100 dark:border-zinc-800 text-gray-500 font-bold uppercase">
                  <tr>
                    {dbInspectorState[selectedTable].length > 0 && 
                      Object.keys(dbInspectorState[selectedTable][0]).map((key) => (
                        <th key={key} className="px-3 py-2">{key}</th>
                      ))
                    }
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {dbInspectorState[selectedTable].map((row: any, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                      {Object.values(row).map((val: any, vIdx) => (
                        <td key={vIdx} className="px-3 py-2 truncate max-w-[150px]">
                          {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS */}
        {activeAdminTab === 'Settings' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider">Global System Configurations</h3>
            
            <div className="space-y-3">
              {localSettings.map((setting) => (
                <div key={setting.key}>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{setting.key.replace(/_/g, ' ')}</label>
                  <input 
                    type="text" 
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    className="mt-1 w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-on-surface dark:text-gray-200" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-on-surface dark:text-white">Create New Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Join Official Telegram Channel"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                >
                  {taskCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Reward Amount (₦)</label>
                <input
                  type="number"
                  required
                  value={newTaskReward}
                  onChange={(e) => setNewTaskReward(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Target Link URL</label>
                <input
                  type="text"
                  required
                  value={newTaskLink}
                  onChange={(e) => setNewTaskLink(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Task Description</label>
                <textarea
                  rows={2}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal */}
      {balanceAdjustModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-on-surface dark:text-white">Adjust User Balance</h3>
            <p className="text-xs text-gray-400">Target User ID: {balanceAdjustModalUser}</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Amount (₦)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Promo bonus credit"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleExecuteBalanceAdjust(false)}
                  className="flex-1 py-2.5 bg-red-500/10 text-red-500 font-bold text-xs rounded-xl"
                >
                  - Deduct
                </button>
                <button
                  onClick={() => handleExecuteBalanceAdjust(true)}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  + Credit Funds
                </button>
              </div>
              <button
                onClick={() => setBalanceAdjustModalUser(null)}
                className="w-full text-center text-xs text-gray-400 font-bold pt-1 block"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Level Modal */}
      {editingLevel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-on-surface dark:text-white">Edit {editingLevel.name} Tier Rules</h3>

            <form onSubmit={handleSaveLevel} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-400 uppercase">Earning Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingLevel.earning_multiplier}
                  onChange={(e) => setEditingLevel({ ...editingLevel, earning_multiplier: parseFloat(e.target.value) || 1.0 })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-gray-400 uppercase">Minimum Withdrawal (₦)</label>
                <input
                  type="number"
                  value={editingLevel.min_withdrawal}
                  onChange={(e) => setEditingLevel({ ...editingLevel, min_withdrawal: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-gray-400 uppercase">Required Login Streak (Days)</label>
                <input
                  type="number"
                  value={editingLevel.req_streak}
                  onChange={(e) => setEditingLevel({ ...editingLevel, req_streak: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-gray-400 uppercase">Required Ads Watched</label>
                <input
                  type="number"
                  value={editingLevel.req_ads}
                  onChange={(e) => setEditingLevel({ ...editingLevel, req_ads: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-gray-400 uppercase">Required Active Referrals</label>
                <input
                  type="number"
                  value={editingLevel.req_referrals}
                  onChange={(e) => setEditingLevel({ ...editingLevel, req_referrals: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLevel(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md"
                >
                  Save Tier Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
