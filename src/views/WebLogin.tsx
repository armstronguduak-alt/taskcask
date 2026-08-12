import React, { useEffect, useRef } from 'react';

interface WebLoginProps {
  onLogin: (user: any) => void;
}

export const WebLogin: React.FC<WebLoginProps> = ({ onLogin }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).onTelegramAuth = (user: any) => {
      onLogin(user);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'swagbuckss_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Cleanup script tag
      }
      delete (window as any).onTelegramAuth;
    };
  }, [onLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e46a3] via-[#132252] to-[#050914] flex flex-col items-center justify-center p-6 text-center text-white font-inter">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center border border-white/10 shadow-2xl">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <img 
            src="/swagbucks coin logo.png" 
            alt="SwagBucks Coin" 
            className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome to SwagBucks
          </h1>
        </div>
        
        <p className="text-blue-100/80 text-[15px] mb-10 leading-relaxed font-normal max-w-xs mx-auto">
          Please sign in to your account to seamlessly complete tasks, watch ads, and earn rewards daily.
        </p>

        {/* The Telegram Login Widget Container */}
        <div className="w-full flex justify-center items-center min-h-[50px]">
          <div ref={containerRef} className="flex justify-center [&>iframe]:w-auto">
            {/* Script appends widget here */}
          </div>
        </div>
      </div>
    </div>
  );
};
