export interface AdFormatResult {
  success: boolean;
  rewardClaimed: boolean;
  message: string;
  txId?: string;
}

export const AdService = {
  // Trigger Rewarded Interstitial Ad (User gets rewarded after watching)
  executeWatchAndEarnAd: async (): Promise<boolean> => {
    try {
      const showAdFn = (window as any).show_11343654;
      if (typeof showAdFn !== 'function') {
        console.warn('Ad SDK loaded but show_11343654 is not a function');
        // Resolve true in development if SDK is blocked by adblockers
        return true;
      }

      return new Promise((resolve) => {
        try {
          const adPromise = showAdFn();
          
          if (adPromise && typeof adPromise.then === 'function') {
            adPromise
              .then(() => resolve(true))
              .catch((e: any) => {
                console.warn('Ad playback stopped or error encountered:', e);
                resolve(true); // Still resolve to grant reward gracefully
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
      console.error('Failed to execute ad script', e);
      return true;
    }
  },

  // Trigger In-App Interstitial (No reward required, shown based on timeframe)
  executeInAppInterstitial: () => {
    try {
      const showAdFn = (window as any).show_11343654;
      if (typeof showAdFn === 'function') {
        showAdFn({
          type: 'inApp',
          inAppSettings: {
            frequency: 2,
            capping: 0.1,
            interval: 30,
            timeout: 5,
            everyPage: false
          }
        });
      }
    } catch (e) {
      console.warn('Error invoking in-app interstitial', e);
    }
  }
};
