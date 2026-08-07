import React from 'react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';

export const Leaderboard: React.FC = () => {
  const { users } = useApp() as any; // Temporary cast until we fully define leaderboard logic

  // Dummy top earners data (Top 50)
  const topEarners = Array.from({ length: 50 }).map((_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    points: Math.floor(125000 - i * 2000),
    rank: i + 1
  }));
  topEarners[0].name = 'Tosin A.';
  topEarners[1].name = 'Emeka U.';
  topEarners[2].name = 'Sarah M.';

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
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Top Earners</h2>
          <p className="text-sm text-blue-200">Compete with friends and earn extra rewards!</p>
        </div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-2 mt-8 mb-4 h-48">
          {/* Rank 2 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <Avatar name={topEarners[1].name} size="md" className="border-4 border-gray-300" />
              <div className="absolute -bottom-2 -right-2 bg-gray-300 text-gray-800 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">2</div>
            </div>
            <p className="text-xs font-bold text-white truncate w-16 text-center">{topEarners[1].name}</p>
            <p className="text-[10px] font-bold text-blue-300 mt-1">{topEarners[1].points.toLocaleString()} SB</p>
            <div className="w-16 h-24 bg-gray-300/20 rounded-t-[12px] mt-2 flex justify-center items-end pb-2 border border-gray-300/30 border-b-0">
              <span className="text-gray-300 font-bold text-lg">2</span>
            </div>
          </div>
          
          {/* Rank 1 */}
          <div className="flex flex-col items-center z-10 -mx-2">
            <div className="relative mb-2">
              <span className="material-symbols-outlined absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 text-3xl z-10" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
              <Avatar name={topEarners[0].name} size="lg" className="border-4 border-yellow-400 w-16 h-16" />
              <div className="absolute -bottom-2 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#1e3b7a]">1</div>
            </div>
            <p className="text-sm font-bold text-white truncate w-20 text-center">{topEarners[0].name}</p>
            <p className="text-[11px] font-extrabold text-yellow-400 mt-1">{topEarners[0].points.toLocaleString()} SB</p>
            <div className="w-20 h-32 bg-yellow-400/20 rounded-t-[12px] mt-2 flex justify-center items-end pb-2 border border-yellow-400/30 border-b-0">
              <span className="text-yellow-400 font-bold text-2xl">1</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <Avatar name={topEarners[2].name} size="md" className="border-4 border-orange-400" />
              <div className="absolute -bottom-2 -right-2 bg-orange-400 text-orange-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">3</div>
            </div>
            <p className="text-xs font-bold text-white truncate w-16 text-center">{topEarners[2].name}</p>
            <p className="text-[10px] font-bold text-blue-300 mt-1">{topEarners[2].points.toLocaleString()} SB</p>
            <div className="w-16 h-20 bg-orange-400/20 rounded-t-[12px] mt-2 flex justify-center items-end pb-2 border border-orange-400/30 border-b-0">
              <span className="text-orange-400 font-bold text-lg">3</span>
            </div>
          </div>
        </div>

        {/* List of others */}
        <div className="bg-[#24428b] rounded-[24px] border border-blue-500/10 p-2 shadow-lg max-h-[500px] overflow-y-auto custom-scrollbar">
          {topEarners.slice(3).map((user, idx) => (
            <div key={user.id} className="flex items-center justify-between p-3 border-b border-blue-500/10 last:border-0">
              <div className="flex items-center gap-4">
                <span className="font-bold text-blue-300 w-4 text-center">{user.rank}</span>
                <Avatar name={user.name} size="sm" />
                <span className="font-bold text-[13px] text-white">{user.name}</span>
              </div>
              <span className="font-bold text-[12px] text-green-400">{user.points.toLocaleString()} SB</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
export default Leaderboard;
