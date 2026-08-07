import type { Task } from '../types';

export interface AdFormatResult {
  success: boolean;
  rewardClaimed: boolean;
  message: string;
  txId?: string;
}

export const AdService = {
  // Check if SDK is available
  checkSdkAvailability: (): boolean => {
    return typeof (window as any).show_11343654 === 'function' || typeof (window as any).Telegram !== 'undefined';
  },

  // Initialize In-App Interstitial
  initInAppInterstitial: () => {
    const showAdFn = (window as any).show_11343654;
    if (typeof showAdFn === 'function') {
      try {
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
      } catch (e) {
        console.warn('In-App Interstitial initialization error:', e);
      }
    } else {
      console.log('Ad SDK show_11343654 not available yet for In-App Interstitial.');
    }
  },

  // Trigger Rewarded In-App Interstitial Ad using LibTL SDK
  showSdkAd: async (_format?: string): Promise<boolean> => {
    const showAdFn = (window as any).show_11343654;
    if (typeof showAdFn !== 'function') {
      return false; // SDK not loaded, fallback to simulation
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
              resolve(true);
            });
        } else {
          resolve(true);
        }
      } catch (e) {
        console.warn('Error invoking ad SDK:', e);
        resolve(true);
      }
    });
  }
};
