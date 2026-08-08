import type { Task } from '../types';

export interface AdFormatResult {
  success: boolean;
  rewardClaimed: boolean;
  message: string;
  txId?: string;
}

const loadScript = (src: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.body.appendChild(script);
  });
};

export const AdService = {
  // Trigger Rewarded In-App Interstitial Ad securely and isolated
  executeWatchAndEarnAd: async (): Promise<boolean> => {
    try {
      // Dynamically load the Adsterra scripts only when Watch & Earn is explicitly triggered
      await Promise.all([
        loadScript('https://pl30744101.effectivecpmnetwork.com/c2/61/a3/c261a3961045cc1f9493bbcc771f1f42.js', 'adsterra-script-1'),
        loadScript('https://pl30744100.effectivecpmnetwork.com/07/6e/63/076e63ffc20713c679bca457eb8f39ca.js', 'adsterra-script-2')
      ]);

      const showAdFn = (window as any).show_11343654;
      if (typeof showAdFn !== 'function') {
        console.warn('Ad SDK loaded but show_11343654 is not a function');
        return false;
      }

      return new Promise((resolve) => {
        try {
          const adResult = showAdFn({
            type: 'inApp',
            inAppSettings: {
              frequency: 2,
              capping: 0.1,
              interval: 30,
              timeout: 5,
              everyPage: false
            }
          });
          
          if (adResult && typeof adResult.then === 'function') {
            adResult
              .then(() => resolve(true))
              .catch((e: any) => {
                console.warn('Ad playback stopped or error encountered:', e);
                resolve(true); // Still resolve to grant reward on completion/close
              });
          } else {
            resolve(true);
          }
        } catch (e) {
          console.warn('Error invoking ad SDK:', e);
          resolve(true); // Resolve gracefully on error
        }
      });
    } catch (e) {
      console.error('Failed to load ad scripts', e);
      return false;
    }
  }
};
