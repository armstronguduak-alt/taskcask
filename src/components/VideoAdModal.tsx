import React, { useState, useEffect } from 'react';
import type { RewardedAd } from '../types';
import { triggerHaptic } from '../utils/haptic';

interface VideoAdModalProps {
  ad: RewardedAd | null;
  onClose: () => void;
  onComplete: (ad: RewardedAd) => void;
  rewardAmount: number;
}

export const VideoAdModal: React.FC<VideoAdModalProps> = ({
  ad,
  onClose,
  onComplete,
  rewardAmount
}) => {
  if (!ad) return null;

  const totalTime = ad.watch_time_sec || 15;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isPlaying || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          triggerHaptic('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isCompleted]);

  const progressPercent = Math.min(100, Math.round(((totalTime - timeLeft) / totalTime) * 100));

  const handleClaimReward = () => {
    onComplete(ad);
    onClose();
  };

  const sampleVideos = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
  ];
  const videoSrc = sampleVideos[Math.abs(ad.id.length) % sampleVideos.length];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between items-center p-4 animate-fade-in">
      {/* Top Header Bar */}
      <div className="w-full max-w-lg flex justify-between items-center z-10 pt-2 px-2">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span className="material-symbols-outlined text-amber-400 text-[18px] animate-spin">sync</span>
          <span className="text-white text-xs font-bold">
            {isCompleted ? 'Reward Ready!' : `Ad Countdown: ${timeLeft}s`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#2563eb]/20 text-[#2563eb] border border-[#2563eb]/30 rounded-full text-xs font-extrabold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">payments</span>
            +{rewardAmount} SB
          </span>

          <button
            onClick={() => {
              if (isCompleted) {
                onClose();
              } else if (confirm('Closing early will forfeit your reward credit. Are you sure?')) {
                onClose();
              }
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="w-full max-w-lg aspect-video my-auto bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 flex flex-col items-center justify-center">
        <video
          src={videoSrc}
          autoPlay
          muted
          playsInline
          onEnded={() => setIsCompleted(true)}
          className="w-full h-full object-cover"
        />

        {/* Video Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Campaign Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-auto">
          <div>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[9px] font-black uppercase tracking-wider">
              Category {ad.category} • Rewarded Campaign
            </span>
            <h3 className="text-white font-extrabold text-sm mt-1">{ad.name}</h3>
            <p className="text-gray-300 text-[10px] opacity-80">Watch full duration to claim {rewardAmount} SB</p>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-white/20 glass-effect border border-white/30 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>

        {/* Completion Watermark Overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-3 z-20 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-[#2563eb]/20 text-[#2563eb] border border-[#2563eb]/40 flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Ad Completed!</h2>
              <p className="text-[#2563eb] text-xs font-bold mt-0.5">
                You earned {rewardAmount} SB credited to your wallet!
              </p>
            </div>
            <button
              onClick={handleClaimReward}
              className="px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-zinc-900 font-extrabold text-xs rounded-2xl shadow-lg shadow-[#2563eb]/30 active:scale-95 transition-all"
            >
              Collect {rewardAmount} SB & Close
            </button>
          </div>
        )}
      </div>

      {/* Bottom Progress Controls */}
      <div className="w-full max-w-lg space-y-3 z-10 pb-2">
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-[#2563eb] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-400 px-1">
          <span>Progress: {progressPercent}%</span>
          <span>{isCompleted ? 'Finished' : `Time Remaining: ${timeLeft}s`}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoAdModal;
