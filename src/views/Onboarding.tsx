import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface Slide {
  title: string;
  highlightTitle: string;
  description: string;
  image: string;
}

export const Onboarding: React.FC = () => {
  const { skipOnboarding } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      title: 'Earn Money Daily.',
      highlightTitle: 'Welcome!',
      description: 'Watch ads and complete simple tasks to earn Nigerian Naira (₦). It\'s fast, easy, and secure.',
      image: '/assets/welcome_mascot.png'
    },
    {
      title: 'Watch & Earn.',
      highlightTitle: 'Simulate Ads.',
      description: 'Play short promotional videos and get paid instantly. The higher your level, the more you make per watch.',
      image: '/assets/watch_earn.png'
    },
    {
      title: 'Complete Tasks.',
      highlightTitle: 'Social Gigs.',
      description: 'Perform easy micro-tasks on TikTok, YouTube, X, and Telegram to build up your active wallet balance.',
      image: '/assets/complete_tasks.png'
    },
    {
      title: 'Unlock Tiers.',
      highlightTitle: 'Upgrade Level.',
      description: 'Re-invest your earnings to buy permanent levels. Multiply your earnings per action and boost daily limits!',
      image: '/assets/upgrade_level.png'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      skipOnboarding();
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="flex-1 flex flex-col justify-between px-container-padding pb-8 pt-4 bg-[#f8f9ff] dark:bg-[#09090b]">
      {/* Header */}
      <header className="flex justify-between items-center w-full py-stack-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
          <span className="font-bold text-xl text-primary dark:text-[#62df7d] tracking-tight">TaskCash</span>
        </div>
        <button 
          onClick={skipOnboarding}
          className="text-on-surface-variant dark:text-gray-400 font-semibold text-xs tracking-wider uppercase hover:opacity-80 transition-opacity p-2"
        >
          Skip
        </button>
      </header>

      {/* Slide Content */}
      <main className="flex-1 flex flex-col items-center justify-center my-auto">
        {/* Image Frame */}
        <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center mb-6">
          <div className="absolute w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -z-10"></div>
          <img 
            alt={slide.title} 
            className="w-full h-full object-contain drop-shadow-2xl floating-animation" 
            src={slide.image}
            onError={(e) => {
              // Fallback placeholder in case image path has any issues
              (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuDrNhl9aM4LUN-dKuslM0uLZMzuqG5W9Gw8T5n1CenHG1ThYrRFFHjj99MOHC7FbtSBYjCfo49Fd8SoA-f9mCpYdu6BZ-HZBH72_t7jjLhyFv9fRzStUVfEKUmnVhJJny8repiUBd--MLBTu40P2_XIYZ8okQoe5YwkUZHTeyvV062h2qs2Z_lzfKoTRejGLCHrTXHD-SZQsaRM0VlCJiBC_yRCAg7Zupugm9rZNIqP-qQyP_WxsiOj";
            }}
          />
        </div>

        {/* Text Container */}
        <div className="w-full max-w-sm text-center px-4 space-y-3">
          <h1 className="text-2xl font-bold text-on-background dark:text-white leading-tight tracking-tight">
            <span className="text-primary dark:text-[#62df7d]">{slide.highlightTitle}</span><br />
            {slide.title}
          </h1>
          <p className="text-on-surface-variant dark:text-gray-400 text-sm leading-relaxed">
            {slide.description}
          </p>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="w-full max-w-sm mx-auto flex flex-col items-center gap-6 mt-6">
        {/* Indicators */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-primary dark:bg-[#62df7d]' 
                  : 'w-2 bg-surface-container-highest dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button 
          onClick={handleNext}
          className="w-full py-4 bg-gradient-to-r from-primary to-[#00873a] text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-98 transition-transform flex items-center justify-center gap-2 group ripple-active"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
            arrow_forward_ios
          </span>
        </button>
      </footer>
    </div>
  );
};
export default Onboarding;
