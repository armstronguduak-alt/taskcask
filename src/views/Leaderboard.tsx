import React from 'react';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/Avatar';

export const Leaderboard: React.FC = () => {
  const { users } = useApp() as any; // Temporary cast until we fully define leaderboard logic

  // Dummy top earners data
  const topEarners = [
    { id: 1, name: 'Tosin A.', points: 125000, rank: 1 },
    { id: 2, name: 'Emeka U.', points: 98000, rank: 2 },
    { id: 3, name: 'Sarah M.', points: 85500, rank: 3 },
    { id: 4, name: 'David O.', points: 72000, rank: 4 },
    { id: 5, name: 'Femi B.', points: 61000, rank: 5 },
  ];

  return (
    <div className="flex-grow pb-32 bg-transparent">
      {/* Top App Bar */}
      <nav className="sticky top-0 w-full z-30 bg-transparent pt-4">
        <div className="flex justify-between items-center px-container-padding py-4 w-full">
          <h1 className="font-bold text-lg text-primary dark:text-[#60a5fa]">Leaderboard</h1>
          <span className="material-symbols-outlined text-primary text-[24px]">emoji_events</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-container-padding pt-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-on-surface dark:text-white">Top Earners</h2>
          <p className="text-sm text-on-surface-variant dark:text-gray-400">Compete with friends and earn extra rewards!</p>
        </div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-2 mt-8 mb-4 h-48">
          {/* Rank 2 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <Avatar name={topEarners[1].name} size="md" className="border-4 border-gray-300" />
              <div className="absolute -bottom-2 -right-2 bg-gray-300 text-gray-800 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">2</div>
            </div>
            <p className="text-xs font-bold text-on-surface dark:text-gray-200 truncate w-16 text-center">{topEarners[1].name}</p>
            <p className="text-[10px] font-bold text-primary mt-1">{topEarners[1].points.toLocaleString()} SB</p>
            <div className="w-16 h-24 bg-gray-200 dark:bg-zinc-800 rounded-t-lg mt-2 flex justify-center items-end pb-2">
              <span className="text-gray-400 font-bold text-lg">2</span>
            </div>
          </div>
          
          {/* Rank 1 */}
          <div className="flex flex-col items-center z-10 -mx-2">
            <div className="relative mb-2">
              <span className="material-symbols-outlined absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 text-3xl z-10">crown</span>
              <Avatar name={topEarners[0].name} size="lg" className="border-4 border-yellow-400 w-16 h-16" />
              <div className="absolute -bottom-2 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">1</div>
            </div>
            <p className="text-sm font-bold text-on-surface dark:text-gray-200 truncate w-20 text-center">{topEarners[0].name}</p>
            <p className="text-[11px] font-extrabold text-primary mt-1">{topEarners[0].points.toLocaleString()} SB</p>
            <div className="w-20 h-32 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-t-lg mt-2 flex justify-center items-end pb-2">
              <span className="text-yellow-600 dark:text-yellow-500 font-bold text-2xl">1</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <Avatar name={topEarners[2].name} size="md" className="border-4 border-orange-300" />
              <div className="absolute -bottom-2 -right-2 bg-orange-300 text-orange-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">3</div>
            </div>
            <p className="text-xs font-bold text-on-surface dark:text-gray-200 truncate w-16 text-center">{topEarners[2].name}</p>
            <p className="text-[10px] font-bold text-primary mt-1">{topEarners[2].points.toLocaleString()} SB</p>
            <div className="w-16 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-t-lg mt-2 flex justify-center items-end pb-2">
              <span className="text-orange-400 font-bold text-lg">3</span>
            </div>
          </div>
        </div>

        {/* List of others */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-2 shadow-sm">
          {topEarners.slice(3).map((user, idx) => (
            <div key={user.id} className="flex items-center justify-between p-3 border-b border-gray-50 dark:border-zinc-800/50 last:border-0">
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-400 w-4 text-center">{user.rank}</span>
                <Avatar name={user.name} size="sm" />
                <span className="font-bold text-sm text-on-surface dark:text-gray-200">{user.name}</span>
              </div>
              <span className="font-bold text-xs text-primary">{user.points.toLocaleString()} SB</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
export default Leaderboard;
