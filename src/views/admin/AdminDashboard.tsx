import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { loadDB } from '../../db/mockDb';
import type { TaskCashDB } from '../../db/mockDb';

type AdminTab = 'Withdrawals' | 'Fraud' | 'Inspector' | 'Postbacks' | 'Settings';

export const AdminDashboard: React.FC = () => {
  const { 
    withdrawalRequests, 
    fraudLogs, 
    postbackLogs,
    sdkLogs,
    setTab,
    approveWithdrawal,
    rejectWithdrawal,
    banUser,
    unbanUser
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('Withdrawals');
  const [selectedTable, setSelectedTable] = useState<keyof TaskCashDB>('users');
  const [dbInspectorState, setDbInspectorState] = useState<TaskCashDB>(() => loadDB());

  const handleRefreshInspector = () => {
    setDbInspectorState(loadDB());
  };

  // Stats calculation
  const db = loadDB();
  const totalBalance = db.wallets.reduce((acc, curr) => acc + curr.active_balance, 0);
  const totalPayout = db.transactions
    .filter(t => t.type === 'Withdrawal' && t.status === 'Success')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalAdViews = db.ad_views.length;

  const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'Pending');

  return (
    <div className="flex-grow pb-32 bg-[#f8f9ff] dark:bg-[#09090b] text-on-surface dark:text-gray-100">
      {/* Header */}
      <nav className="sticky top-0 w-full z-30 bg-[#f8f9ff]/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => setTab('Profile')} className="ripple-active p-1 text-[#0051d5]">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-bold text-lg text-[#0051d5] dark:text-[#b4c5ff]">Admin Center</h1>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[9px] font-extrabold uppercase tracking-wider">
            SYSTEM ROOT
          </span>
        </div>
      </nav>

      {/* Stats Cards Widget */}
      <div className="px-container-padding pt-4 grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Platform Active Wallets</p>
          <p className="font-extrabold text-sm mt-0.5">₦{totalBalance.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Total Payouts Settled</p>
          <p className="font-extrabold text-sm mt-0.5">₦{totalPayout.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Total Ad Impressions</p>
          <p className="font-extrabold text-sm mt-0.5">{totalAdViews} views</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Pending Cash-out Queue</p>
          <p className="font-extrabold text-sm mt-0.5">{pendingWithdrawals.length} request(s)</p>
        </div>
      </div>

      {/* Tabs Switchers */}
      <div className="px-container-padding mt-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {([
          { key: 'Withdrawals', label: 'Withdraw Queue', icon: 'payments' },
          { key: 'Fraud', label: 'Fraud Shield', icon: 'gpp_maybe' },
          { key: 'Postbacks', label: 'SDK logs', icon: 'dns' },
          { key: 'Inspector', label: 'Table Inspector', icon: 'table_rows' },
          { key: 'Settings', label: 'Settings', icon: 'settings' }
        ] as { key: AdminTab; label: string; icon: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveAdminTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl font-bold text-[9px] uppercase whitespace-nowrap shadow-sm flex items-center gap-1.5 transition-all duration-150 ${
              activeAdminTab === tab.key
                ? 'bg-[#0051d5] text-white'
                : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-[#6e7b6c] dark:text-gray-300'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="px-container-padding mt-4">
        
        {/* Withdrawals Queue Tab */}
        {activeAdminTab === 'Withdrawals' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider">Pending Payout Approvals</h3>
            {pendingWithdrawals.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6 italic font-semibold">
                Withdrawals billing queue is empty. Good job!
              </p>
            ) : (
              pendingWithdrawals.map((req) => {
                const requester = dbInspectorState.users.find(u => u.id === req.user_id);
                const bank = dbInspectorState.banks.find(b => b.id === req.bank_id);
                return (
                  <div key={req.id} className="border-b border-gray-50 dark:border-zinc-800 pb-4 last:border-b-0 last:pb-0 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-on-surface dark:text-gray-200">
                          {requester?.first_name} {requester?.last_name}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">@{requester?.username}</p>
                      </div>
                      <span className="font-extrabold text-xs text-red-500">
                        ₦{req.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-gray-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-gray-100 dark:border-zinc-800/30 text-[10px] space-y-1">
                      <p><span className="font-bold">Bank:</span> {bank?.name}</p>
                      <p><span className="font-bold">Account Name:</span> {req.account_name}</p>
                      <p><span className="font-bold">Account Nuban:</span> {req.account_number}</p>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        onClick={() => rejectWithdrawal(req.id)}
                        className="flex-1 py-2 border border-red-200 dark:border-red-950 text-red-500 font-bold text-[10px] rounded-lg active:scale-95 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => approveWithdrawal(req.id)}
                        className="flex-1 py-2 bg-[#006b2c] text-white font-bold text-[10px] rounded-lg active:scale-95 transition-all"
                      >
                        Approve Payout
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Fraud Shield Monitor Tab */}
        {activeAdminTab === 'Fraud' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider">Suspicious System Logs</h3>
              <span className="inline-block px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 text-[8px] font-extrabold uppercase">
                Active Shield
              </span>
            </div>

            {fraudLogs.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6 italic font-semibold">
                No fraud incidents logged. All traffic verified clean.
              </p>
            ) : (
              <div className="space-y-4">
                {fraudLogs.map((log) => {
                  const fraudUser = dbInspectorState.users.find(u => u.id === log.user_id);
                  const isBanned = fraudUser?.status === 'Banned';

                  return (
                    <div key={log.id} className="border-b border-gray-50 dark:border-zinc-800 pb-3 last:border-b-0 last:pb-0 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                          log.severity === 'High' ? 'bg-red-500/15 text-red-500' :
                          log.severity === 'Medium' ? 'bg-orange-500/15 text-orange-500' : 'bg-yellow-500/15 text-yellow-600'
                        }`}>
                          {log.severity} Severity
                        </span>
                        <span className="text-[8px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>

                      <div className="text-[10px] space-y-1">
                        <p><span className="font-bold">Incident:</span> {log.reason}</p>
                        <p><span className="font-bold">Details:</span> {log.details}</p>
                        <p><span className="font-bold">Account:</span> {fraudUser?.first_name} (@{fraudUser?.username})</p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => isBanned ? unbanUser(log.user_id) : banUser(log.user_id)}
                          className={`px-3 py-1.5 font-bold text-[9px] rounded-lg uppercase ${
                            isBanned
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {isBanned ? 'Unban User' : 'Ban Account'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Postbacks & SDK logs */}
        {activeAdminTab === 'Postbacks' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider">Signed SDK & Postback Streams</h3>
            
            <div className="space-y-4">
              {/* SDK Events */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">SDK Client Callbacks</h4>
                {sdkLogs.length === 0 ? (
                  <p className="text-[10px] italic text-gray-400">No SDK logs yet.</p>
                ) : (
                  sdkLogs.slice(0, 3).map((sdk) => (
                    <div key={sdk.id} className="bg-gray-50 dark:bg-zinc-800/40 p-2.5 rounded-lg text-[9px] mb-2 font-mono">
                      <div className="flex justify-between font-bold text-primary dark:text-[#62df7d]">
                        <span>Event: {sdk.action}</span>
                        <span>{new Date(sdk.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mt-1 truncate">Payload: {sdk.payload}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Server Postbacks */}
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Verified Postbacks</h4>
                {postbackLogs.length === 0 ? (
                  <p className="text-[10px] italic text-gray-400">No server postbacks yet.</p>
                ) : (
                  postbackLogs.slice(0, 3).map((post) => (
                    <div key={post.id} className="bg-green-500/5 p-2.5 rounded-lg text-[9px] mb-2 font-mono border border-green-500/10">
                      <div className="flex justify-between font-bold text-green-600 dark:text-[#62df7d]">
                        <span>POSTBACK: Success (200)</span>
                        <span>{new Date(post.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-500 mt-1 truncate">Url: {post.url}</p>
                      <p className="text-gray-400 truncate">Payload: {post.payload}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Database Relational Inspector */}
        {activeAdminTab === 'Inspector' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider">Inspect Relational Data</h3>
              <button 
                onClick={handleRefreshInspector}
                className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 text-gray-500 flex items-center justify-center hover:bg-gray-100"
                title="Refresh Table"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>

            {/* Select Table to view */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Select Table (22 Relational Tables)</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value as keyof TaskCashDB)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-on-surface dark:text-gray-200"
              >
                {Object.keys(dbInspectorState).map((tbl) => (
                  <option key={tbl} value={tbl}>{tbl} ({dbInspectorState[tbl as keyof TaskCashDB].length} rows)</option>
                ))}
              </select>
            </div>

            {/* Data Grid Display */}
            <div className="overflow-x-auto border border-gray-100 dark:border-zinc-800 rounded-xl no-scrollbar max-h-80 overflow-y-auto">
              <table className="w-full text-left text-[9px] font-mono whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-zinc-800/80 sticky top-0 border-b border-gray-100 dark:border-zinc-800 text-gray-500 font-bold uppercase">
                  <tr>
                    {dbInspectorState[selectedTable].length > 0 && 
                      Object.keys(dbInspectorState[selectedTable][0]).map((key) => (
                        <th key={key} className="px-3 py-2">{key}</th>
                      ))
                    }
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/60">
                  {dbInspectorState[selectedTable].length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-center text-gray-400 italic">No rows present in this table</td>
                    </tr>
                  ) : (
                    dbInspectorState[selectedTable].map((row: any, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="px-3 py-2 truncate max-w-[120px]">
                            {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeAdminTab === 'Settings' && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider">System Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Daily Welcome Bonus Amount (₦)</label>
                <input type="number" defaultValue={500} className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-on-surface dark:text-gray-200" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Community Join Bonus Amount (₦)</label>
                <input type="number" defaultValue={500} className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-on-surface dark:text-gray-200" />
              </div>
              <button onClick={() => alert('Settings saved successfully!')} className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all">
                Save Settings
              </button>
            </div>
            
            <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider">Level Thresholds</h3>
              <div className="space-y-2">
                <div className="bg-gray-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-gray-100 dark:border-zinc-800/30 text-[10px] space-y-1">
                  <p><span className="font-bold">Lvl 1 (Explorer):</span> 0 requirements</p>
                  <p><span className="font-bold">Lvl 2 (Active):</span> 3 days streak, 10 ads, 2 tasks</p>
                  <p><span className="font-bold">Lvl 3 (Pro):</span> 7 days streak, 50 ads, 10 tasks</p>
                  <p><span className="font-bold">Lvl 4 (Elite):</span> 30 days streak, 200 ads, 50 tasks</p>
                </div>
                <button onClick={() => alert('Editing thresholds would open a modal.')} className="w-full py-2 bg-gray-200 dark:bg-zinc-800 text-on-surface dark:text-white font-bold text-xs rounded-xl active:scale-95 transition-all">
                  Edit Thresholds
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default AdminDashboard;
