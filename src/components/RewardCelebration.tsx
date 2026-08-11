import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Web Audio API helper for a satisfying coin sound
const playCoinSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    
    // Quick pitch sweep
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.1);
    
    // Quick volume envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};

type RewardType = 'SB' | 'USDT';

interface RewardAnimation {
  id: string;
  amount: number;
  currency: RewardType;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  onComplete?: () => void;
}

interface RewardContextType {
  triggerReward: (params: {
    amount: number;
    currency: RewardType;
    source: HTMLElement | null;
    destinationId: string;
    onComplete?: () => void;
  }) => void;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export const RewardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animations, setAnimations] = useState<RewardAnimation[]>([]);
  
  const triggerReward = useCallback((params: {
    amount: number;
    currency: RewardType;
    source: HTMLElement | null;
    destinationId: string;
    onComplete?: () => void;
  }) => {
    const { amount, currency, source, destinationId, onComplete } = params;
    
    const destEl = document.getElementById(destinationId);
    
    if (!source || !destEl) {
      console.warn('Reward source or destination missing.', { source, destEl });
      // Fallback: just complete
      if (onComplete) onComplete();
      return;
    }

    playCoinSound();

    const sourceRect = source.getBoundingClientRect();
    const destRect = destEl.getBoundingClientRect();

    const newAnim: RewardAnimation = {
      id: Math.random().toString(36).substring(7),
      amount,
      currency,
      startX: sourceRect.left + sourceRect.width / 2,
      startY: sourceRect.top + sourceRect.height / 2,
      targetX: destRect.left + destRect.width / 2,
      targetY: destRect.top + destRect.height / 2,
      onComplete
    };

    setAnimations(prev => [...prev, newAnim]);
  }, []);

  const handleAnimationEnd = (id: string, onComplete?: () => void) => {
    setAnimations(prev => prev.filter(a => a.id !== id));
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <RewardContext.Provider value={{ triggerReward }}>
      {children}
      
      {/* Portaled Container for animations to prevent clipping */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {animations.map(anim => (
          <RewardParticle 
            key={anim.id} 
            anim={anim} 
            onEnd={() => handleAnimationEnd(anim.id, anim.onComplete)} 
          />
        ))}
      </div>
    </RewardContext.Provider>
  );
};

export const useReward = () => {
  const context = useContext(RewardContext);
  if (!context) throw new Error('useReward must be used within RewardProvider');
  return context;
};

const RewardParticle: React.FC<{ anim: RewardAnimation, onEnd: () => void }> = ({ anim, onEnd }) => {
  const [stage, setStage] = useState(0); // 0: pop out, 1: fly to dest

  useEffect(() => {
    // Pop out phase
    const t1 = setTimeout(() => setStage(1), 600); // stay popped out for 600ms
    // Fly phase
    const t2 = setTimeout(() => {
      onEnd();
    }, 1200); // 600 + 600ms flight time
    
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onEnd]);

  // Initial pop out
  const popX = anim.startX;
  const popY = anim.startY - 50;

  const currentX = stage === 0 ? popX : anim.targetX;
  const currentY = stage === 0 ? popY : anim.targetY;
  const opacity = stage === 0 ? 1 : 0.2;
  const scale = stage === 0 ? 1 : 0.4;
  const transition = stage === 0 ? 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'all 0.6s cubic-bezier(0.6, -0.28, 0.735, 0.045)';

  const formatText = `+${anim.amount} ${anim.currency}`;

  return (
    <div
      className="absolute flex flex-col items-center justify-center pointer-events-none"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${currentX}px, ${currentY}px) scale(${scale}) translate(-50%, -50%)`,
        opacity,
        transition,
        willChange: 'transform, opacity'
      }}
    >
      <div className={`font-black text-[16px] mb-1 text-center whitespace-nowrap drop-shadow-md px-2 py-1 rounded-full ${anim.currency === 'SB' ? 'text-blue-100 bg-[#2563eb]/50' : 'text-teal-100 bg-teal-500/50'}`}>
        {formatText}
      </div>
      <img 
        src={anim.currency === 'SB' ? "/swagbucks coin logo.png" : "/usdt coin logo.png"} 
        alt="coin" 
        className="w-10 h-10 object-contain drop-shadow-xl"
      />
    </div>
  );
};
