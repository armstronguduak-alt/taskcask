import React from 'react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';

export const Leaderboard: React.FC = () => {
  useApp();

  // Start with empty leaderboard until connected to DB
  const topEarners: any[] = [];

  return (
    <div className="flex-grow pb-32 bg-transparent">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-transparent pt-4">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <h1 className="font-bold text-[22px] text-white">Leaderboard</h1>
          <span className="material-symbols-outlined text-yellow-400 text-[24px]">emoji_events</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-1 mt-2 mb-4">
          <h2 className="text-[20px] font-extrabold text-white tracking-tight">Top Earners</h2>
          <p className="text-[12px] font-bold text-blue-200">Compete with friends and earn extra rewards!</p>
        </div>

        {topEarners.length > 0 ? (
          <>
            {/* Top 3 Podium */}
            <div className="flex justify-center items-end gap-3 mt-4 mb-6 h-40">
              {/* Rank 2 */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <Avatar name={topEarners[1]?.name || 'User'} size="md" className="border-4 border-gray-300 shadow-md" />
                  <div className="absolute -bottom-2 -right-2 bg-gray-300 text-gray-800 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">2</div>
                </div>
                <p className="text-[11px] font-extrabold text-white truncate w-16 text-center tracking-tight">{topEarners[1]?.name}</p>
                <p className="text-[10px] font-bold text-blue-300 mt-0.5 tracking-tight">{topEarners[1]?.points?.toLocaleString()} SB</p>
                <div className="w-16 h-20 bg-gray-300/20 rounded-t-[16px] mt-2 flex justify-center items-end pb-3 border border-gray-300/30 border-b-0 shadow-inner">
                  <span className="text-gray-300 font-extrabold text-[16px]">2</span>
                </div>
              </div>
              
              {/* Rank 1 */}
              <div className="flex flex-col items-center z-10 -mx-1">
                <div className="relative mb-2">
                  <span className="material-symbols-outlined absolute -top-7 left-1/2 -translate-x-1/2 text-yellow-400 text-[32px] z-10 drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
                  <Avatar name={topEarners[0]?.name || 'User'} size="lg" className="border-4 border-yellow-400 w-16 h-16 shadow-lg" />
                  <div className="absolute -bottom-2 -right-1 bg-yellow-400 text-yellow-900 text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#1e3b7a] shadow-sm">1</div>
                </div>
                <p className="text-[12px] font-extrabold text-white truncate w-20 text-center tracking-tight">{topEarners[0]?.name}</p>
                <p className="text-[10px] font-extrabold text-yellow-400 mt-0.5 tracking-tight">{topEarners[0]?.points?.toLocaleString()} SB</p>
                <div className="w-20 h-28 bg-yellow-400/20 rounded-t-[20px] mt-2 flex justify-center items-end pb-4 border border-yellow-400/30 border-b-0 shadow-inner">
                  <span className="text-yellow-400 font-black text-[24px]">1</span>
                </div>
              </div>

              {/* Rank 3 */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <Avatar name={topEarners[2]?.name || 'User'} size="md" className="border-4 border-orange-400 shadow-md" />
                  <div className="absolute -bottom-2 -right-2 bg-orange-400 text-orange-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">3</div>
                </div>
                <p className="text-[11px] font-extrabold text-white truncate w-16 text-center tracking-tight">{topEarners[2]?.name}</p>
                <p className="text-[10px] font-bold text-blue-300 mt-0.5 tracking-tight">{topEarners[2]?.points?.toLocaleString()} SB</p>
                <div className="w-16 h-16 bg-orange-400/20 rounded-t-[16px] mt-2 flex justify-center items-end pb-2 border border-orange-400/30 border-b-0 shadow-inner">
                  <span className="text-orange-400 font-extrabold text-[16px]">3</span>
                </div>
              </div>
            </div>

            {/* List of others */}
            <div className="bg-[#1e3b7a] rounded-[24px] border border-blue-500/20 p-2 shadow-lg max-h-[400px] overflow-y-auto no-scrollbar">
              {topEarners.slice(3).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border-b border-blue-500/10 last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-blue-300/50 w-4 text-center text-[12px]">{user.rank}</span>
                    <Avatar name={user.name} size="sm" />
                    <span className="font-extrabold text-[13px] text-white tracking-tight">{user.name}</span>
                  </div>
                  <span className="font-extrabold text-[12px] text-green-400 tracking-tight">{user.points?.toLocaleString()} SB</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-[#1e3b7a] rounded-[24px] border border-blue-500/20 p-8 shadow-lg flex flex-col items-center justify-center text-center mt-12">
            <span className="material-symbols-outlined text-blue-300/30 text-6xl mb-4">leaderboard</span>
            <h3 className="text-white font-bold text-lg mb-2">No data yet</h3>
            <p className="text-blue-200 text-xs">The leaderboard will update once users start earning points.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Leaderboard;
